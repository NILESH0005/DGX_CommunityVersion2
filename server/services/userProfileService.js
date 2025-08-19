import db from "../models/index.js";
const { User, CommunityBlog, CommunityDiscussion } = db;
import { Op } from "sequelize"; // ✅ direct import


export const getUserProfileService = async (userId) => {
  try {
    // Fetch user with blogs & discussions
    const user = await User.findOne({
      where: { UserID: userId, delStatus: 0 },
      attributes: [
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
            "Title",
            "Content",
            "DiscussionImagePath",
            "AuthAdd",
            "Likes",
            "Comment",
          ],
          where: { delStatus: 0 },
          required: false,
        },
      ],
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Transform discussions to include counts
    const discussions = user.CommunityDiscussions.map((disc) => ({
      Title: disc.Title,
      Content: disc.Content,
      DiscussionImagePath: disc.DiscussionImagePath,
      AuthAdd: disc.AuthAdd,
      LikesCount: disc.Likes || 0,
      CommentsCount: disc.Comment ? disc.Comment.split(",").length : 0, // assuming stored as text
    }));

    return {
      success: true,
      data: {
        user: {
          ProfilePicture: user.ProfilePicture,
          UserDescription: user.UserDescription,
          Name: user.Name,
          AddOnDt: user.AddOnDt,
          EmailId: user.EmailId,
        },
        blogs: user.Community_Blogs,
        discussions,
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
    // ✅ Check user exists
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: { [Op.or]: [0, null] } },
      attributes: ["UserID", "Name"],
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // ✅ Count total discussions
    const totalCount = await CommunityDiscussion.count({
      where: {
        UserID: user.UserID,
        Reference: 0,
        delStatus: { [Op.or]: [0, null] },
      },
    });

    // ✅ Get top-level discussions
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
        "Image",
        "Tag",
        "ResourceUrl",
        ["AddOnDt", "timestamp"],
      ],
      include: [{ model: User, attributes: ["Name", "ProfilePicture"] }],
      order: [["AddOnDt", "DESC"]],
    });

    // ✅ Process discussions → likes + comments + replies
    const updatedDiscussions = await Promise.all(
      discussions.map(async (disc) => {
        const likeCount = await CommunityDiscussion.count({
          where: {
            Reference: disc.DiscussionID,
            Likes: { [Op.gt]: 0 },
            delStatus: { [Op.or]: [0, null] },
          },
        });

        const userLike = await CommunityDiscussion.findOne({
          where: {
            UserID: user.UserID,
            Reference: disc.DiscussionID,
            Likes: 1,
            delStatus: { [Op.or]: [0, null] },
          },
        });

        const comments = await CommunityDiscussion.findAll({
          where: {
            Reference: disc.DiscussionID,
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

        // Nested comments (2nd level)
        const nestedComments = await Promise.all(
          comments.map(async (comment) => {
            const secondLevelComments = await CommunityDiscussion.findAll({
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

            const commentLikeCount = await CommunityDiscussion.count({
              where: {
                Reference: comment.DiscussionID,
                Likes: { [Op.gt]: 0 },
                delStatus: { [Op.or]: [0, null] },
              },
            });

            return {
              ...comment.toJSON(),
              likeCount: commentLikeCount,
              comment: secondLevelComments,
            };
          })
        );

        return {
          ...disc.toJSON(),
          likeCount,
          userLike: userLike ? 1 : 0,
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
    console.error("getUserDiscussionsService Error:", error);
    throw error;
  }
};
