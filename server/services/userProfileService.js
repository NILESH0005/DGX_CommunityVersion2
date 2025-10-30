import db from "../models/index.js";
const { User, CommunityBlog, CommunityDiscussion, ContentInteraction } = db;
import { Op } from "sequelize"; 

export const getUserProfileService = async (userId) => {
  try {
    // Fetch user with blogs & discussions
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
      include: [
        {
          model: CommunityBlog,
          attributes: [
            "title",
            "AuthAdd",
            "content",
            "publishedDate",
            "image",
            "Category",
          ],
          where: { delStatus: 0 },
          required: false,
        },
        {
          model: CommunityDiscussion,
          attributes: [
            "DiscussionID",
            "UserID",
            "Title",
            "Content",
            "DiscussionImagePath",
            "AuthAdd",
            "Likes",
            "Comment",
            "Tag",
            "AddOnDt",
          ],
          where: {
            [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
            Reference: 0, // ✅ Only top-level discussions
          },
          required: false,
        },
      ],
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Transform discussions safely
    const discussions = (user.CommunityDiscussions || []).map((disc) => {
      let likesCount = 0;
      let commentsCount = 0;

      // ✅ Handle Likes (array, JSON, string, or number)
      if (Array.isArray(disc.Likes)) {
        likesCount = disc.Likes.length;
      } else if (typeof disc.Likes === "string") {
        likesCount = disc.Likes.trim() ? disc.Likes.split(",").length : 0;
      } else if (typeof disc.Likes === "number") {
        likesCount = disc.Likes;
      }

      // ✅ Handle Comments (array, JSON, or string)
      if (Array.isArray(disc.Comment)) {
        commentsCount = disc.Comment.length;
      } else if (typeof disc.Comment === "string") {
        commentsCount = disc.Comment.trim()
          ? disc.Comment.split(",").length
          : 0;
      }

      return {
        DiscussionID: disc.DiscussionID,
        UserID: disc.UserID,
        Title: disc.Title,
        Content: disc.Content,
        DiscussionImagePath: disc.DiscussionImagePath,
        AuthAdd: disc.AuthAdd,
        AddOnDt: disc.AddOnDt,
        Tag: disc.Tag,
        LikesCount: likesCount,
        CommentsCount: commentsCount,
      };
    });

    // ✅ Ensure uniqueness by DiscussionID
    const uniqueDiscussions = Object.values(
      discussions.reduce((acc, disc) => {
        acc[disc.DiscussionID] = disc;
        return acc;
      }, {})
    );

    return {
      success: true,
      data: {
        user: {
          UserID: user.UserID,
          ProfilePicture: user.ProfilePicture,
          UserDescription: user.UserDescription,
          Name: user.Name,
          AddOnDt: user.AddOnDt,
          EmailId: user.EmailId,
        },
        blogs: user.Community_Blogs,
        discussions: uniqueDiscussions,
      },
      message: "User profile fetched successfully",
    };
  } catch (error) {
    console.error("User Profile Service Error:", error);
    throw error;
  }
};

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

        // 🔁 Repost count + users
        const reposts = await CommunityDiscussion.findAll({
          where: {
            RepostID: discussionId,
            delStatus: { [Op.or]: [0, null] },
          },
          attributes: ["RepostUserID"],
        });

        const repostCount = reposts.length;
        const repostUsers = reposts.map((r) => r.RepostUserID);

        // ✅ Nested comments (optional)
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
          repostCount, // 🆕 Added
          repostUsers, // 🆕 Added
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

