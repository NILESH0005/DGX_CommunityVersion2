import db from "../models/index.js";

const { User, CommunityDiscussion, TableDDReference } = db;

export const createDiscussionPost = async (userId, postData) => {
  try {
    // Find user
    const user = await User.findOne({
      where: {
        EmailId: userId,
        delStatus: 0,
      },
    });

    if (!user) {
      throw new Error("User not found login first");
    }

    // Handle visibility lookup if provided
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

    // Handle likes update if reference exists
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

    // Create new discussion post
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

    // Get visibility value if it exists
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
