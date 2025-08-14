import db from "../models/index.js";
import { logInfo, logError, logWarning } from "../helper/index.js";

const CommunityDiscussion = db.CommunityDiscussion;
const User = db.User;

export const getDiscussions = async (userEmail) => {
  try {
    if (!userEmail) {
      logWarning("getDiscussions called without userEmail");
      return {
        status: 400,
        response: {
          success: false,
          message: "userEmail is required",
          data: {},
        },
      };
    }
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
    });

    if (!user) {
      logWarning(`User not found for email: ${userEmail}`);
      return {
        status: 200,
        response: {
          success: false,
          message: "User not found",
          data: {},
        },
      };
    }

    const userId = user.UserID;

    // 2. Get public discussions (Reference = 0)
    const discussions = await CommunityDiscussion.findAll({
      where: { delStatus: 0, Reference: 0, Visibility: "Public" },
      order: [["AddOnDt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["Name"],
        },
      ],
    });

    // 3. Recursive function to fetch nested comments
    const fetchComments = async (parentId) => {
      const comments = await CommunityDiscussion.findAll({
        where: {
          Reference: parentId,
          delStatus: 0,
          Comment: { [db.Sequelize.Op.ne]: null },
        },
        order: [["AddOnDt", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["Name"],
          },
        ],
      });

      const commentsWithNested = [];
      for (const comment of comments) {
        const replies = await fetchComments(comment.DiscussionID);

        const likeCount = await CommunityDiscussion.count({
          where: {
            Reference: comment.DiscussionID,
            Likes: { [db.Sequelize.Op.gt]: 0 },
            delStatus: 0,
          },
        });

        const userLike = await CommunityDiscussion.count({
          where: {
            Reference: comment.DiscussionID,
            Likes: { [db.Sequelize.Op.gt]: 0 },
            UserID: userId,
            delStatus: 0,
          },
        });

        commentsWithNested.push({
          ...comment.get({ plain: true }),
          comment: replies,
          likeCount,
          userLike: userLike > 0 ? 1 : 0,
        });
      }

      return commentsWithNested;
    };

    const updatedDiscussions = [];
    for (const discussion of discussions) {
      const discussionPlain = discussion.get({ plain: true });

      const likeCount = await CommunityDiscussion.count({
        where: {
          Reference: discussion.DiscussionID,
          Likes: { [db.Sequelize.Op.gt]: 0 },
          delStatus: 0,
        },
      });

      const userLike = await CommunityDiscussion.count({
        where: {
          Reference: discussion.DiscussionID,
          Likes: { [db.Sequelize.Op.gt]: 0 },
          UserID: userId,
          delStatus: 0,
        },
      });

      const commentCount = await CommunityDiscussion.count({
        where: {
          Reference: discussion.DiscussionID,
          Comment: { [db.Sequelize.Op.ne]: null },
          delStatus: 0,
        },
      });

      const comments = await fetchComments(discussion.DiscussionID);

      updatedDiscussions.push({
        ...discussionPlain,
        UserName: discussion.user?.Name || null,
        likeCount,
        userLike: userLike > 0 ? 1 : 0,
        commentCount,
        comment: comments,
        ImageUrl: discussion.DiscussionImagePath
          ? `${process.env.BASE_URL}/${discussion.DiscussionImagePath}`
          : null,
      });
    }

    logInfo(`Discussions fetched successfully for user: ${userEmail}`);
    return {
      status: 200,
      response: {
        success: true,
        message: "Discussions fetched successfully",
        data: { updatedDiscussions },
      },
    };
  } catch (error) {
    console.error("getDiscussions error:", error);
    logError(error);
    return {
      status: 500,
      response: {
        success: false,
        message: "Something went wrong, please try again",
        data: {},
      },
    };
  }
};
