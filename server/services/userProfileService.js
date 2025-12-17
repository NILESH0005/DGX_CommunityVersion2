import db from "../models/index.js";
const {
  User,
  CommunityBlog,
  CommunityDiscussion,
  ContentInteractionLog,
  ContentInteraction,
  TableDDReference,
} = db;
import { Op, fn, col, literal  } from "sequelize";

export const getUserProfileService = async (userId) => {
  try {
    // ==========================
    // 1. FETCH USER DETAILS
    // ==========================
    const user = await User.findOne({
      where: { UserID: userId, delStatus: 0 },
      attributes: [
        "UserID",
        "ProfilePicture",
        "UserDescription",
        "Name",
        "AddOnDt",
        "EmailId",
      ],
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // ==========================
    // 2. FETCH APPROVED BLOGS
    // ==========================
    const blogs = await CommunityBlog.findAll({
      where: {
        UserID: userId,
        delStatus: 0,
        Status: "approved",
      },
      attributes: [
        "BlogID",
        "title",
        "author",
        "content",
        "publishedDate",
        "AuthAdd",
        "image",
        "Category",
        "Status",
        "ApprovedBy",
        "ApprovedOn",
        "RepostID",
        "RepostUserID",
        "allowRepost",
        "AddOnDt",
      ],
      raw: true,
    });

    const blogIDs = blogs.map((b) => b.BlogID);
    let blogStats = {};

    if (blogIDs.length > 0) {
      // ===== Fetch Interaction Stats (Likes, Rating, Views, etc)
      const blogInteractions = await ContentInteraction.findAll({
        where: {
          Type: "Blog",
          ReferenceId: { [Op.in]: blogIDs },
          delStatus: { [Op.or]: [0, null] },
        },
        attributes: [
          "ReferenceId",
          [fn("SUM", literal("CASE WHEN Likes = 1 THEN 1 ELSE 0 END")), "LikesCount"],
          [fn("SUM", literal("CASE WHEN Dislikes = 1 THEN 1 ELSE 0 END")), "DislikeCount"],
          [fn("SUM", literal("CASE WHEN View = 1 THEN 1 ELSE 0 END")), "ViewCount"],
          [fn("AVG", col("Rating")), "AvgRating"],
          [fn("SUM", literal("CASE WHEN Repost = 1 THEN 1 ELSE 0 END")), "RepostCount"],
        ],
        group: ["ReferenceId"],
        raw: true,
      });

      // Count blog reposts from blog table
      const blogReposts = await CommunityBlog.findAll({
        where: {
          RepostID: { [Op.in]: blogIDs },
          delStatus: 0,
        },
        attributes: ["RepostID", [fn("COUNT", col("RepostID")), "RepostCount"]],
        group: ["RepostID"],
        raw: true,
      });

      // ==========================
      // FIXED MERGING OF BLOG STATS
      // ==========================
      blogStats = blogIDs.reduce((acc, id) => {
        const stats = blogInteractions.find((i) => i.ReferenceId === id) || {};
        const reposts = blogReposts.find((r) => r.RepostID === id)?.RepostCount || 0;

        // Calculate rating safely
        let avgRating = 0;
        if (stats.AvgRating !== undefined && stats.AvgRating !== null) {
          const num = Number(stats.AvgRating);
          if (Number.isFinite(num)) avgRating = parseFloat(num.toFixed(1));
        }

        acc[id] = {
          LikesCount: Number(stats.LikesCount) || 0,
          Rating: avgRating || 0,
          RepostCount: Number(reposts) || 0,
          ViewCount: Number(stats.ViewCount) || 0,
        };

        return acc;
      }, {});
    }

    // ==========================
    // FINAL BLOG DATA
    // ==========================
    const blogData = blogs.map((b) => ({
      ...b,
      LikesCount: blogStats[b.BlogID]?.LikesCount || 0,
      Rating: blogStats[b.BlogID]?.Rating || 0,
      RepostCount: blogStats[b.BlogID]?.RepostCount || 0,
      ViewCount: blogStats[b.BlogID]?.ViewCount || 0,
    }));

    // ==========================
    // 3. FETCH USER DISCUSSIONS
    // ==========================
    const discussions = await CommunityDiscussion.findAll({
      where: {
        UserID: userId,
        Reference: 0,
        delStatus: { [Op.or]: [0, null] },
      },
      attributes: [
        "DiscussionID",
        "UserID",
        "Title",
        "Content",
        "DiscussionImagePath",
        "AuthAdd",
        "AddOnDt",
        "RepostID",
        "RepostUserID",
        "allowRepost",
        "Visibility",
      ],
      include: [
        {
          model: TableDDReference,
          as: "VisibilityRef",
          required: false,
          where: {
            ddCategory: "Privacy",
            delStatus: 0,
          },
          attributes: ["ddValue"],
        },
      ],
      raw: false,
    });

    const discussionIDs = discussions.map((d) => d.DiscussionID);
    let discussionStats = {};

    if (discussionIDs.length > 0) {
      const interactions = await ContentInteraction.findAll({
        where: {
          Type: "Discussion",
          ReferenceId: { [Op.in]: discussionIDs },
          delStatus: { [Op.or]: [0, null] },
        },
        attributes: [
          "ReferenceId",
          [fn("SUM", literal("CASE WHEN Likes = 1 THEN 1 ELSE 0 END")), "LikesCount"],
          [fn("SUM", literal("CASE WHEN View = 1 THEN 1 ELSE 0 END")), "ViewCount"],
          [fn("SUM", literal("CASE WHEN Comments = 1 THEN 1 ELSE 0 END")), "CommentsCount"],
          [fn("SUM", literal("CASE WHEN Repost = 1 THEN 1 ELSE 0 END")), "RepostCount"],
        ],
        group: ["ReferenceId"],
        raw: true,
      });

      const discussionReposts = await CommunityDiscussion.findAll({
        where: { RepostID: { [Op.in]: discussionIDs }, delStatus: 0 },
        attributes: ["RepostID", [fn("COUNT", col("RepostID")), "RepostCount"]],
        group: ["RepostID"],
        raw: true,
      });

      const discussionComments = await CommunityDiscussion.findAll({
        where: { Reference: { [Op.in]: discussionIDs }, delStatus: 0 },
        attributes: ["Reference", [fn("COUNT", col("DiscussionID")), "CommentCount"]],
        group: ["Reference"],
        raw: true,
      });

      discussionStats = discussionIDs.reduce((acc, id) => {
        const stats = interactions.find((i) => i.ReferenceId === id) || {};
        const reposts = discussionReposts.find((r) => r.RepostID === id)?.RepostCount || 0;
        const comments = discussionComments.find((c) => c.Reference === id)?.CommentCount || 0;

        acc[id] = {
          LikesCount: Number(stats.LikesCount) || 0,
          CommentsCount: Number(comments) || 0,
          RepostCount: Number(reposts) || 0,
          ViewCount: Number(stats.ViewCount) || 0,
        };

        return acc;
      }, {});
    }

    // ==========================
    // FINAL DISCUSSION DATA
    // ==========================
    const discussionData = discussions.map((d) => ({
      ...d.toJSON(),
      Visibility: d.VisibilityRef?.ddValue || "Private",
      LikesCount: discussionStats[d.DiscussionID]?.LikesCount || 0,
      CommentsCount: discussionStats[d.DiscussionID]?.CommentsCount || 0,
      RepostCount: discussionStats[d.DiscussionID]?.RepostCount || 0,
      ViewCount: discussionStats[d.DiscussionID]?.ViewCount || 0,
    }));

    // ==========================
    // FINAL RETURN
    // ==========================
    return {
      success: true,
      message: "User profile fetched successfully",
      data: {
        user: user.toJSON(),
        blogs: blogData,
        discussions: discussionData,
      },
    };
  } catch (error) {
    console.error("User Profile Service Error:", error);
    throw error;
  }
};


// export const getUserDiscussionsService = async (userEmail) => {
//   try {
//     // ✅ Check user exists
//     const user = await User.findOne({
//       where: { EmailId: userEmail, delStatus: { [Op.or]: [0, null] } },
//       attributes: ["UserID", "Name"],
//     });

//     if (!user) {
//       return { success: false, message: "User not found" };
//     }

//     // ✅ Count total discussions
//     const totalCount = await CommunityDiscussion.count({
//       where: {
//         UserID: user.UserID,
//         Reference: 0,
//         delStatus: { [Op.or]: [0, null] },
//       },
//     });

//     // ✅ Get top-level discussions
//     const discussions = await CommunityDiscussion.findAll({
//       where: {
//         UserID: user.UserID,
//         Reference: 0,
//         delStatus: { [Op.or]: [0, null] },
//       },
//       attributes: [
//         "DiscussionID",
//         "UserID",
//         ["AuthAdd", "UserName"],
//         "Title",
//         "Content",
//         "DiscussionImagePath",
//         "Tag",
//         "ResourceUrl",
//         ["AddOnDt", "timestamp"],
//       ],
//       include: [{ model: User, attributes: ["Name", "ProfilePicture"] }],
//       order: [["AddOnDt", "DESC"]],
//     });

//     // ✅ Process discussions → likes + comments + replies
//     const updatedDiscussions = await Promise.all(
//       discussions.map(async (disc) => {
//         const likeCount = await CommunityDiscussion.count({
//           where: {
//             Reference: disc.DiscussionID,
//             Likes: { [Op.gt]: 0 },
//             delStatus: { [Op.or]: [0, null] },
//           },
//         });

//         const userLike = await CommunityDiscussion.findOne({
//           where: {
//             UserID: user.UserID,
//             Reference: disc.DiscussionID,
//             Likes: 1,
//             delStatus: { [Op.or]: [0, null] },
//           },
//         });

//         const comments = await CommunityDiscussion.findAll({
//           where: {
//             Reference: disc.DiscussionID,
//             Comment: { [Op.ne]: null },
//             delStatus: { [Op.or]: [0, null] },
//           },
//           attributes: [
//             "DiscussionID",
//             "UserID",
//             "Comment",
//             ["AuthAdd", "UserName"],
//             ["AddOnDt", "timestamp"],
//           ],
//           order: [["AddOnDt", "DESC"]],
//         });

//         // Nested comments (2nd level)
//         const nestedComments = await Promise.all(
//           comments.map(async (comment) => {
//             const secondLevelComments = await CommunityDiscussion.findAll({
//               where: {
//                 Reference: comment.DiscussionID,
//                 Comment: { [Op.ne]: null },
//                 delStatus: { [Op.or]: [0, null] },
//               },
//               attributes: [
//                 "DiscussionID",
//                 "UserID",
//                 "Comment",
//                 ["AuthAdd", "UserName"],
//                 ["AddOnDt", "timestamp"],
//               ],
//               order: [["AddOnDt", "DESC"]],
//             });

//             const commentLikeCount = await CommunityDiscussion.count({
//               where: {
//                 Reference: comment.DiscussionID,
//                 Likes: { [Op.gt]: 0 },
//                 delStatus: { [Op.or]: [0, null] },
//               },
//             });

//             return {
//               ...comment.toJSON(),
//               likeCount: commentLikeCount,
//               comment: secondLevelComments,
//             };
//           })
//         );

//         return {
//           ...disc.toJSON(),
//           likeCount,
//           userLike: userLike ? 1 : 0,
//           comment: nestedComments,
//         };
//       })
//     );

//     return {
//       success: true,
//       data: { updatedDiscussions, totalCount },
//       message: "Discussions fetched successfully",
//     };
//   } catch (error) {
//     console.error("getUserDiscussionsService Error:", error);
//     throw error;
//   }
// };

export const getUserDiscussionsService = async (userEmail) => {
  try {
    // ✅ 1. Get user
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: { [Op.or]: [0, null] } },
      attributes: ["UserID", "Name"],
    });

    if (!user) return { success: false, message: "User not found" };

    // ✅ 2. Count total discussions
    const totalCount = await CommunityDiscussion.count({
      where: {
        UserID: user.UserID,
        Reference: 0,
        delStatus: { [Op.or]: [0, null] },
      },
    });

    // ✅ 3. Fetch user discussions
    const discussions = await CommunityDiscussion.findAll({
      where: {
        UserID: user.UserID,
        Reference: 0,
        delStatus: { [Op.or]: [0, null] },
      },
      attributes: [
        "DiscussionID",
        "UserID",
        ["AuthAdd", "UserName"],
        "Title",
        "Content",
        "DiscussionImagePath",
        "Tag",
        "ResourceUrl",
        "RepostID",
        "RepostUserID",
        ["AddOnDt", "timestamp"],
      ],
      include: [{ model: User, attributes: ["Name", "ProfilePicture"] }],
      order: [["AddOnDt", "DESC"]],
    });

    // ✅ 4. Process discussions
    const updatedDiscussions = await Promise.all(
      discussions.map(async (disc) => {
        const discussionId = disc.DiscussionID;

        // ❤️ Like count
        const likeCount = await ContentInteraction.count({
          where: {
            Type: "Discussion",
            ReferenceId: discussionId,
            Likes: 1,
            delStatus: { [Op.or]: [0, null] },
          },
        });

        // ❤️ User liked?
        const userLike = await ContentInteractionLog.findOne({
          where: {
            ProcessName: "Discussion",
            reference: discussionId,
            UserID: user.UserID,
            Likes: 1,
            delStatus: { [Op.or]: [0, null] },
          },
        });

        // 💬 Comment count
        const commentCount = await CommunityDiscussion.count({
          where: {
            Reference: discussionId,
            Comment: { [Op.ne]: null },
            delStatus: { [Op.or]: [0, null] },
          },
        });

        // 🔁 Repost info
        const reposts = await CommunityDiscussion.findAll({
          where: {
            RepostID: discussionId,
            delStatus: { [Op.or]: [0, null] },
          },
          attributes: ["RepostUserID"],
        });

        const repostUsers = reposts.map((r) => r.RepostUserID);
        const repostCount = repostUsers.length;

        let repostUserDetails = [];
        if (repostUsers.length > 0) {
          repostUserDetails = await User.findAll({
            where: {
              UserID: repostUsers,
              delStatus: { [Op.or]: [0, null] },
            },
            attributes: ["UserID", "Name", "ProfilePicture"],
          });
        }

        // ===============================
        // 💬 FIRST-LEVEL COMMENTS (with User Image)
        // ===============================
        const comments = await CommunityDiscussion.findAll({
          where: {
            Reference: discussionId,
            Comment: { [Op.ne]: null },
            delStatus: { [Op.or]: [0, null] },
          },
          attributes: [
            "DiscussionID",
            "UserID",
            "Comment",
            ["AuthAdd", "UserName"],
            ["AddOnDt", "timestamp"],
          ],
          include: [
            {
              model: User,
              attributes: ["Name", "ProfilePicture"],
            },
          ],
          order: [["AddOnDt", "DESC"]],
        });

        const nestedComments = await Promise.all(
          comments.map(async (comment) => {
            // 💬 SECOND-LEVEL COMMENTS (with User Image)
            const secondLevel = await CommunityDiscussion.findAll({
              where: {
                Reference: comment.DiscussionID,
                Comment: { [Op.ne]: null },
                delStatus: { [Op.or]: [0, null] },
              },
              attributes: [
                "DiscussionID",
                "UserID",
                "Comment",
                ["AuthAdd", "UserName"],
                ["AddOnDt", "timestamp"],
              ],
              include: [
                {
                  model: User,
                  attributes: ["Name", "ProfilePicture"],
                },
              ],
              order: [["AddOnDt", "DESC"]],
            });

            const commentLikeCount = await ContentInteractionLog.count({
              where: {
                ProcessName: "Discussion",
                reference: comment.DiscussionID,
                Likes: 1,
                delStatus: { [Op.or]: [0, null] },
              },
            });

            return {
              ...comment.toJSON(),
              UserName: comment.User?.Name || comment.UserName,
              UserImage: comment.User?.ProfilePicture || null,
              likeCount: commentLikeCount,
              comment: secondLevel.map((reply) => ({
                ...reply.toJSON(),
                UserName: reply.User?.Name || reply.UserName,
                UserImage: reply.User?.ProfilePicture || null,
              })),
            };
          })
        );

        return {
          ...disc.toJSON(),
          likeCount,
          userLike: userLike ? 1 : 0,
          commentCount,
          repostCount,
          repostUsers,
          repostUserDetails,
          comment: nestedComments,
        };
      })
    );

    return {
      success: true,
      data: { updatedDiscussions, totalCount },
      message: "Discussions fetched successfully",
    };
  } catch (error) {
    console.error("❌ getUserDiscussionsService Error:", error);
    throw error;
  }
};
