import db from "../models/index.js";
const {
  User,
  CommunityBlog,
  CommunityDiscussion,
  ContentInteraction,
  TableDDReference,
} = db;
import { Op, fn, col } from "sequelize";

export const getUserProfileService = async (userId) => {
  try {
    // Step 1: Fetch user details
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

    // Step 2: Fetch approved blogs
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
    });

    const blogIDs = blogs.map((b) => b.BlogID);
    let blogStats = {};

    if (blogIDs.length > 0) {
      // Fetch Likes, Avg Rating, and Views
      const blogInteractions = await ContentInteraction.findAll({
        where: {
          ProcessName: "blog",
          reference: { [Op.in]: blogIDs },
          delStatus: { [Op.or]: [0, null] },
        },
        attributes: [
          "reference",
          [fn("SUM", col("Likes")), "LikesCount"],
          [fn("AVG", col("Rating")), "AvgRating"],
          [fn("SUM", col("View")), "ViewCount"], // 👈 Added view count aggregation
        ],
        group: ["reference"],
        raw: true,
      });

      // Count Reposts
      const blogReposts = await CommunityBlog.findAll({
        where: {
          RepostID: { [Op.in]: blogIDs },
          delStatus: 0,
        },
        attributes: ["RepostID", [fn("COUNT", col("RepostID")), "RepostCount"]],
        group: ["RepostID"],
        raw: true,
      });

      // Combine all stats
      blogStats = blogIDs.reduce((acc, id) => {
        const stats = blogInteractions.find((i) => i.reference === id) || {};
        const reposts =
          blogReposts.find((r) => r.RepostID === id)?.RepostCount || 0;

        // Parse AvgRating safely
        const rawAvg = stats.AvgRating;
        let avgRating = 0;
        if (rawAvg !== undefined && rawAvg !== null) {
          const num = Number(rawAvg);
          if (Number.isFinite(num)) {
            avgRating = parseFloat(num.toFixed(1));
          }
        }

        acc[id] = {
          LikesCount: stats.LikesCount || 0,
          AvgRating: avgRating,
          RepostCount: reposts,
          ViewCount: stats.ViewCount || 0, // 👈 Add ViewCount in final object
        };
        return acc;
      }, {});
    }

    const blogData = blogs.map((b) => ({
      ...b.toJSON(),
      LikesCount: blogStats[b.BlogID]?.LikesCount || 0,
      Rating: blogStats[b.BlogID]?.AvgRating || 0,
      RepostCount: blogStats[b.BlogID]?.RepostCount || 0,
      ViewCount: blogStats[b.BlogID]?.ViewCount || 0, // 👈 Added here too
    }));

    // Step 3: Fetch Discussions
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
    });

    const discussionIDs = discussions.map((d) => d.DiscussionID);
    let discussionStats = {};

    if (discussionIDs.length > 0) {
      // Fetch Likes, Comments, and Views
      const discussionInteractions = await ContentInteraction.findAll({
        where: {
          ProcessName: "discussion",
          reference: { [Op.in]: discussionIDs },
          delStatus: { [Op.or]: [0, null] },
        },
        attributes: [
          "reference",
          [fn("SUM", col("Likes")), "LikesCount"],
          [fn("SUM", col("Rating")), "CommentsCount"],
          [fn("SUM", col("View")), "ViewCount"], // 👈 Added view count aggregation
        ],
        group: ["reference"],
        raw: true,
      });

      const discussionComments = await CommunityDiscussion.findAll({
        where: {
          Reference: { [Op.in]: discussionIDs },
          delStatus: { [Op.or]: [0, null] },
        },
        attributes: [
          "Reference",
          [fn("COUNT", col("DiscussionID")), "CommentCount"],
        ],
        group: ["Reference"],
        raw: true,
      });

      const discussionReposts = await CommunityDiscussion.findAll({
        where: {
          RepostID: { [Op.in]: discussionIDs },
          delStatus: 0,
        },
        attributes: ["RepostID", [fn("COUNT", col("RepostID")), "RepostCount"]],
        group: ["RepostID"],
        raw: true,
      });

      discussionStats = discussionIDs.reduce((acc, id) => {
        const stats = discussionInteractions.find((i) => i.reference === id) || {};
        const commentCount =
          discussionComments.find((c) => c.Reference === id)?.CommentCount || 0;
        const reposts =
          discussionReposts.find((r) => r.RepostID === id)?.RepostCount || 0;

        acc[id] = {
          LikesCount: stats.LikesCount || 0,
          CommentsCount: commentCount,
          RepostCount: reposts,
          ViewCount: stats.ViewCount || 0, // 👈 Added view count
        };
        return acc;
      }, {});
    }

    const discussionData = discussions.map((d) => ({
      ...d.toJSON(),
      Visibility: d.VisibilityRef?.ddValue || "Private",
      LikesCount: discussionStats[d.DiscussionID]?.LikesCount || 0,
      CommentsCount: discussionStats[d.DiscussionID]?.CommentsCount || 0,
      RepostCount: discussionStats[d.DiscussionID]?.RepostCount || 0,
      ViewCount: discussionStats[d.DiscussionID]?.ViewCount || 0, // 👈 Added here too
    }));

    // Step 4: Return Final Data
    return {
      success: true,
      message: "User profile fetched successfully",
      data: {
        user: {
          UserID: user.UserID,
          ProfilePicture: user.ProfilePicture,
          UserDescription: user.UserDescription,
          Name: user.Name,
          AddOnDt: user.AddOnDt,
          EmailId: user.EmailId,
        },
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

    // ✅ 3. Get user’s main discussions
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

    // ✅ 4. Process each discussion
    const updatedDiscussions = await Promise.all(
      discussions.map(async (disc) => {
        const discussionId = disc.DiscussionID;

        // 👍 Like count
        const likeCount = await ContentInteraction.count({
          where: {
            ProcessName: "Discussion",
            reference: discussionId,
            Likes: 1,
            delStatus: { [Op.or]: [0, null] },
          },
        });

        // ❤️ User liked?
        const userLike = await ContentInteraction.findOne({
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

        // 🔁 Repost count + RepostUserIDs
        const reposts = await CommunityDiscussion.findAll({
          where: {
            RepostID: discussionId,
            delStatus: { [Op.or]: [0, null] },
          },
          attributes: ["RepostUserID"],
        });

        const repostUsers = reposts.map((r) => r.RepostUserID);
        const repostCount = repostUsers.length;

        // 🆕 Fetch RepostUser Details (Name + ProfilePicture)
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

        // ✅ Nested comments (1st level + 2nd level)
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
          order: [["AddOnDt", "DESC"]],
        });

        const nestedComments = await Promise.all(
          comments.map(async (comment) => {
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
              order: [["AddOnDt", "DESC"]],
            });

            const commentLikeCount = await ContentInteraction.count({
              where: {
                ProcessName: "Discussion",
                reference: comment.DiscussionID,
                Likes: 1,
                delStatus: { [Op.or]: [0, null] },
              },
            });

            return {
              ...comment.toJSON(),
              likeCount: commentLikeCount,
              comment: secondLevel,
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
          repostUserDetails, // 🆕 ADDED HERE
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
