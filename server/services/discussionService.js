import db from "../models/index.js";
import { Op } from "sequelize"; // ✅ direct import

const { User, CommunityDiscussion, TableDDReference } = db;

export const createDiscussionPost = async (userId, postData) => {
  try {
    const user = await User.findOne({
      where: {
        EmailId: userId,
        delStatus: 0,
      },
    });

    if (!user) {
      throw new Error("User not found login first");
    }

    let visibilityId = null;
    if (postData.visibility) {
      const visibilityRecord = await TableDDReference.findOne({
        where: {
          ddCategory: "Privacy",
          ddValue: postData.visibility,
          delStatus: 0,
        },
      });
      if (visibilityRecord) {
        visibilityId = visibilityRecord.idCode;
      }
    }

    if (postData.likes !== null && postData.reference) {
      const existingLike = await CommunityDiscussion.findOne({
        where: {
          Reference: postData.reference,
          UserID: user.UserID,
          delStatus: 0,
          Likes: { [Op.ne]: null },
        },
      });

      if (existingLike) {
        await existingLike.update({
          Likes: postData.likes,
          AuthLstEdit: user.Name,
          editOnDt: new Date(),
        });

        return {
          success: true,
          data: {
            postId: existingLike.DiscussionID,
            action: "like",
          },
          message: "Like Posted Successfully",
        };
      }
    }

    const newPost = await CommunityDiscussion.create({
      UserID: user.UserID,
      Title: postData.title || null,
      Content: postData.content || null,
      Image: postData.image || null,
      Likes: postData.likes || null,
      Comment: postData.comment || null,
      Tag: postData.tags || null,
      Visibility: visibilityId,
      Reference: postData.reference || 0,
      ResourceUrl: postData.url || null,
      DiscussionImagePath: postData.bannerImagePath || null,
      AuthAdd: user.Name,
      AddOnDt: new Date(),
      delStatus: 0,
    });

    let visibilityValue = null;
    if (visibilityId) {
      const visibilityRecord = await TableDDReference.findByPk(visibilityId);
      visibilityValue = visibilityRecord?.ddValue || null;
    }

    return {
      success: true,
      data: {
        postId: newPost.DiscussionID,
        visibility: {
          value: visibilityValue,
          id: visibilityId,
        },
        action:
          postData.likes !== null
            ? "like"
            : postData.comment !== null
            ? "comment"
            : "post",
      },
      message: "Discussion Posted Successfully",
    };
  } catch (error) {
    console.error("Discussion Service Error:", error);
    throw error;
  }
};

const getCommentsRecursive = async (discussionId, userId) => {
  const comments = await CommunityDiscussion.findAll({
    where: {
      Reference: discussionId,
      delStatus: { [Op.or]: [0, null] },
      Comment: { [Op.not]: null },
    },
    order: [["AddOnDt", "DESC"]],
    attributes: [
      "DiscussionID",
      "UserID",
      "Comment",
      "AddOnDt",
      "Likes",
      "Reference",
      "AuthAdd",
    ],
  });

  const updatedComments = await Promise.all(
    comments.map(async (comment) => {
      const likeCount = await CommunityDiscussion.count({
        where: {
          Reference: comment.DiscussionID,
          Likes: { [Op.gt]: 0 },
          delStatus: { [Op.or]: [0, null] },
        },
      });

      const userLike = await CommunityDiscussion.findOne({
        where: {
          Reference: comment.DiscussionID,
          UserID: userId,
          Likes: 1,
          delStatus: { [Op.or]: [0, null] },
        },
      });

      const nestedComments = await getCommentsRecursive(
        comment.DiscussionID,
        userId
      );

      return {
        DiscussionID: comment.DiscussionID,
        UserID: comment.UserID,
        Comment: comment.Comment,
        UserName: comment.AuthAdd,
        timestamp: comment.AddOnDt,
        Likes: comment.Likes,
        Reference: comment.Reference,
        likeCount,
        userLike: userLike ? 1 : 0,
        comment: nestedComments,
      };
    })
  );

  return updatedComments;
};

/**
 * Count all nested comments (recursively)
 */
const countAllComments = (comments) => {
  let count = comments.length;
  for (const c of comments) {
    count += countAllComments(c.comment || []);
  }
  return count;
};

/**
 * Service to fetch public discussions
 */
export const getPublicDiscussionsService = async (email) => {
  try {
    console.log("📌 Starting getPublicDiscussionsService for email:", email);

    // Step 1: Find user
    const user = await User.findOne({
      where: {
        EmailId: email,
        [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
      },
    });
    console.log("✅ User found:", user ? user.toJSON() : "No user found");

    const userId = user ? user.UserID : null;
    console.log("📌 userId:", userId);

    // Step 2: Get top-level public discussions
    const discussions = await CommunityDiscussion.findAll({
      where: {
        delStatus: {
          [Op.or]: [{ [Op.eq]: 0 }, { [Op.is]: null }],
        },
        Reference: 0,
      },
      order: [["AddOnDt", "DESC"]],
      logging: (sql) => console.log("📝 SQL Executed:", sql),
    });
    console.log("✅ Discussions fetched:", discussions.length);

    // Step 3: Process discussions
    const updatedDiscussions = await Promise.all(
      discussions.map(async (discussion, index) => {
        console.log(
          `\n➡️ Processing discussion #${index + 1}:`,
          discussion.toJSON()
        );

        const likeCount = await CommunityDiscussion.count({
          where: {
            Reference: discussion.DiscussionID,
            Likes: { [Op.gt]: 0 },
            delStatus: { [Op.or]: [0, null] },
          },
        });
        console.log(
          `👍 Like count for discussion ${discussion.DiscussionID}:`,
          likeCount
        );

        const userLike = await CommunityDiscussion.findOne({
          where: {
            Reference: discussion.DiscussionID,
            UserID: userId,
            Likes: 1,
            delStatus: { [Op.or]: [0, null] },
          },
        });
        console.log(
          `❤️ User liked? (discussion ${discussion.DiscussionID}):`,
          !!userLike
        );

        // fetch nested comments
        const comments = await getCommentsRecursive(
          discussion.DiscussionID,
          userId
        );
        console.log(
          `💬 Comments fetched for discussion ${discussion.DiscussionID}:`,
          comments
        );

        const commentCount = countAllComments(comments);
        console.log(
          `📊 Comment count for discussion ${discussion.DiscussionID}:`,
          commentCount
        );

        return {
          ...discussion.toJSON(),
          UserName: discussion.AuthAdd,
          VisibilityName: discussion.visibilityRef?.ddValue || null,
          likeCount,
          userLike: userLike ? 1 : 0,
          commentCount,
          comment: comments,
          ImageUrl: discussion.DiscussionImagePath || null,
        };
      })
    );

    console.log("🎯 Final updated discussions:", updatedDiscussions);

    return { success: true, data: updatedDiscussions };
  } catch (error) {
    console.error("❌ Error in getPublicDiscussionsService:", error);
    return { success: false, error };
  }
};

export const updateDiscussionService = async (userId, payload) => {
  const { reference, title, content, image, tags, url, visibility } = payload;

  if (!reference) throw new Error("Reference ID is required");
  if (!title || !content) throw new Error("Title and content are required");

  // 🔹 Step 1: Resolve userId to numeric UserID
  let actualUser = null;

  if (typeof userId === "string" && userId.includes("@")) {
    // userId is email
    actualUser = await User.findOne({
      where: { EmailId: userId, delStatus: 0 },
    });
  } else {
    // userId is numeric
    actualUser = await User.findOne({
      where: { UserID: userId, delStatus: 0 },
    });
  }

  if (!actualUser) throw new Error("User not found");

  const actualUserId = actualUser.UserID;

  // 🔹 Step 2: Check if discussion exists and belongs to the user
  const discussion = await CommunityDiscussion.findOne({
    where: {
      DiscussionID: reference,
      UserID: actualUserId,
      [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
    },
  });

  if (!discussion) {
    throw new Error("Discussion not found or you don't have permission");
  }

  // 🔹 Step 3: Lookup visibility
  let visibilityId = null;
  if (visibility) {
    const visibilityRef = await TableDDReference.findOne({
      where: {
        ddCategory: "Privacy",
        ddValue: visibility,
        [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
      },
    });
    visibilityId = visibilityRef ? visibilityRef.idCode : null;
  }

  // 🔹 Step 4: Update discussion
  const [rowsUpdated] = await CommunityDiscussion.update(
    {
      Title: title,
      Content: content,
      Image: image || discussion.Image,
      Tag: tags || null,
      ResourceUrl: url || null,
      Visibility: visibilityId,
      AuthLstEdit: actualUser.Name,
      editOnDt: new Date(),
    },
    {
      where: {
        DiscussionID: reference,
        UserID: actualUserId,
        [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
      },
    }
  );

  if (rowsUpdated === 0) {
    throw new Error("No changes made or discussion not found");
  }

  return { message: "Discussion updated successfully" };
};

export const deleteDiscussionService = async (userId, discussionId) => {
  if (!discussionId) {
    throw new Error("Discussion ID is required");
  }

  // 🔹 Check if discussion exists
  const discussion = await CommunityDiscussion.findOne({
    where: {
      DiscussionID: discussionId,
      [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
    },
  });

  if (!discussion) {
    throw new Error("Discussion not found or already deleted.");
  }

  // 🔹 Update discussion to soft delete
  const [rowsUpdated] = await CommunityDiscussion.update(
    {
      delStatus: 1,
      delOnDt: new Date(),
      AuthDel: userId, // save who deleted it
    },
    {
      where: {
        DiscussionID: discussionId,
        [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
      },
    }
  );

  if (rowsUpdated === 0) {
    throw new Error("Failed to delete the discussion.");
  }

  // 🔹 Re-fetch the updated discussion (works in all dialects)
  const deletedDiscussion = await CommunityDiscussion.findOne({
    where: { DiscussionID: discussionId },
  });

  return {
    discussionId: deletedDiscussion.DiscussionID,
    AuthDel: deletedDiscussion.AuthDel,
    delOnDt: deletedDiscussion.delOnDt,
    delStatus: deletedDiscussion.delStatus,
  };
};
