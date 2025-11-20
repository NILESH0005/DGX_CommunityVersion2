import db from "../models/index.js";
import { Op } from "sequelize"; // ✅ direct import

const { User, CommunityDiscussion, TableDDReference, ContentInteraction } = db;

// export const createDiscussionPost = async (userId, postData) => {
//   try {
//     const user = await User.findOne({
//       where: { EmailId: userId, delStatus: 0 },
//     });
//     if (!user) throw new Error("User not found, please login first");

//     // Map visibility to internal ID
//     let visibilityId = null;
//     if (postData.visibility) {
//       const visibilityRecord = await TableDDReference.findOne({
//         where: {
//           ddCategory: "Privacy",
//           ddValue: postData.visibility,
//           delStatus: 0,
//         },
//       });
//       visibilityId = visibilityRecord ? visibilityRecord.idCode : null;
//     }

//     // Convert allowRepost to boolean
//     const allowRepost =
//       postData.allowRepost === true ||
//       postData.allowRepost === 1 ||
//       postData.allowRepost === "1";

//     // Handle repost
//     const repostId = postData.repostId || null; // Original discussion ID
//     const repostUserId = repostId ? user.UserID : null; // Current user doing the repost

//     // Create new discussion (original or repost)
//     const newPost = await CommunityDiscussion.create({
//       UserID: user.UserID,
//       Title: postData.title || null,
//       Content: postData.content || null,
//       Image: postData.image || null,
//       Likes: postData.likes || null,
//       Comment: postData.comment || null,
//       Tag: postData.tags || null,
//       Visibility: visibilityId,
//       Reference: postData.reference || 0,
//       ResourceUrl: postData.url || null,
//       DiscussionImagePath: postData.bannerImagePath || null,
//       allowRepost: allowRepost,
//       RepostID: repostId,
//       RepostUserID: repostUserId,
//       AuthAdd: user.Name,
//       AddOnDt: new Date(),
//       delStatus: 0,
//     });

//     // Get human-readable visibility value
//     let visibilityValue = null;
//     if (visibilityId) {
//       const visibilityRecord = await TableDDReference.findByPk(visibilityId);
//       visibilityValue = visibilityRecord?.ddValue || null;
//     }

//     return {
//       success: true,
//       data: {
//         postId: newPost.DiscussionID,
//         visibility: { value: visibilityValue, id: visibilityId },
//         allowRepost,
//         repostId,
//         repostUserId,
//         action: repostId ? "repost" : "post",
//       },
//       message: repostId
//         ? "Discussion Reposted Successfully"
//         : "Discussion Posted Successfully",
//     };
//   } catch (error) {
//     console.error("Discussion Service Error:", error);
//     throw error;
//   }
// };

export const createDiscussionPost = async (userId, postData) => {
  try {
    const user = await User.findOne({
      where: { EmailId: userId, delStatus: 0 },
    });
    if (!user) throw new Error("User not found, please login first");

    // ===== IMPROVED LIKE DETECTION =====
    // Check if this is PURELY a like action (no post content, just reference and likes)
    const isPureLikeAction =
      postData.reference &&
      (postData.likes === 1 || postData.likes === 0) &&
      !postData.title &&
      !postData.content &&
      !postData.tags &&
      !postData.repostId &&
      !postData.image &&
      !postData.url;

    if (isPureLikeAction) {
      return await handleLikeAction(user, postData);
    }

    // ===== REST OF YOUR EXISTING CODE FOR CREATING POSTS =====
    // Map visibility to internal ID
    let visibilityId = null;
    if (postData.visibility) {
      const visibilityRecord = await TableDDReference.findOne({
        where: {
          ddCategory: "Privacy",
          ddValue: postData.visibility,
          delStatus: 0,
        },
      });
      visibilityId = visibilityRecord ? visibilityRecord.idCode : null;
    }

    // Convert allowRepost to boolean
    const allowRepost =
      postData.allowRepost === true ||
      postData.allowRepost === 1 ||
      postData.allowRepost === "1";

    // Handle repost
    const repostId = postData.repostId || null;
    let repostUserId = null;
    if (repostId) {
      // Find the original post to get its UserID
      const originalPost = await CommunityDiscussion.findOne({
        where: { DiscussionID: repostId, delStatus: 0 },
        attributes: ["UserID"],
      });

      if (originalPost) {
        repostUserId = originalPost.UserID;
      }
    }

    // Create new discussion (original or repost)
    const newPost = await CommunityDiscussion.create({
      UserID: user.UserID,
      Title: postData.title || null,
      Content: postData.content || null,
      Image: postData.image || null,
      Likes: postData.likes || 0, // Default to 0 for new posts
      Comment: postData.comment || null,
      Tag: postData.tags || null,
      Visibility: visibilityId,
      Reference: postData.reference || 0,
      ResourceUrl: postData.url || null,
      DiscussionImagePath: postData.bannerImagePath || null,
      allowRepost: allowRepost,
      RepostID: repostId,
      RepostUserID: repostUserId,
      AuthAdd: user.UserID,
      AddOnDt: new Date(),
      delStatus: 0,
    });

    // Get human-readable visibility value
    let visibilityValue = null;
    if (visibilityId) {
      const visibilityRecord = await TableDDReference.findByPk(visibilityId);
      visibilityValue = visibilityRecord?.ddValue || null;
    }

    return {
      success: true,
      data: {
        postId: newPost.DiscussionID,
        visibility: { value: visibilityValue, id: visibilityId },
        allowRepost,
        repostId,
        repostUserId,
        action: repostId ? "repost" : "post",
      },
      message: repostId
        ? "Discussion Reposted Successfully"
        : "Discussion Posted Successfully",
    };
  } catch (error) {
    console.error("Discussion Service Error:", error);
    throw error;
  }
};

const handleLikeAction = async (user, postData) => {
  try {
    const { reference: postId, likes: likeStatus } = postData;

    // Check if the post exists
    const post = await CommunityDiscussion.findOne({
      where: { DiscussionID: postId, delStatus: 0 },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Find existing like entry for this user and post
    // Using Op from the import at the top
    const existingLike = await CommunityDiscussion.findOne({
      where: {
        Reference: postId,
        UserID: user.UserID,
        delStatus: 0,
        Title: { [Op.is]: null },
        Content: { [Op.is]: null },
        Image: { [Op.is]: null },
        Tag: { [Op.is]: null },
        ResourceUrl: { [Op.is]: null },
        RepostID: { [Op.is]: null },
      },
    });

    console.log("=== LIKE ACTION DEBUG ===");
    console.log("Searching for like entry with:", {
      Reference: postId,
      UserID: user.UserID,
      existingLikeFound: !!existingLike,
      existingLikeId: existingLike ? existingLike.DiscussionID : "NOT FOUND",
    });
    console.log("========================");

    if (existingLike) {
      // UPDATE existing like entry
      const updateResult = await CommunityDiscussion.update(
        {
          Likes: likeStatus,
          AuthLstEdt: user.UserID,
          editOnDt: new Date(),
        },
        {
          where: {
            DiscussionID: existingLike.DiscussionID,
          },
        }
      );

      console.log("Update result:", updateResult);
      console.log(
        "✅ Updated existing like:",
        existingLike.DiscussionID,
        "from",
        existingLike.Likes,
        "to",
        likeStatus
      );

      return {
        success: true,
        data: {
          action: likeStatus === 1 ? "liked" : "unliked",
          likeId: existingLike.DiscussionID,
          updated: true,
        },
        message:
          likeStatus === 1
            ? "Post liked successfully"
            : "Post unliked successfully",
      };
    } else {
      // CREATE new like entry (only for first time like)
      const newLike = await CommunityDiscussion.create({
        UserID: user.UserID,
        Title: null,
        Content: null,
        Image: null,
        Likes: likeStatus,
        Comment: null,
        Tag: null,
        Visibility: null,
        Reference: postId,
        ResourceUrl: null,
        DiscussionImagePath: null,
        allowRepost: false,
        RepostID: null,
        RepostUserID: null,
        AuthAdd: user.UserID,
        AddOnDt: new Date(),
        delStatus: 0,
      });

      console.log(
        "🆕 Created new like entry:",
        newLike.DiscussionID,
        "for post:",
        postId
      );

      return {
        success: true,
        data: {
          action: likeStatus === 1 ? "liked" : "unliked",
          likeId: newLike.DiscussionID,
          updated: false,
        },
        message:
          likeStatus === 1
            ? "Post liked successfully"
            : "Post unliked successfully",
      };
    }
  } catch (error) {
    console.error("Like Action Error:", error);
    throw error;
  }
};

const getCommentsRecursive = async (parentId, currentUserId) => {
  const comments = await CommunityDiscussion.findAll({
    where: {
      Reference: parentId,
      delStatus: { [Op.or]: [0, null] },
      Comment: { [Op.ne]: null }, 
    },
    include: [
      {
        model: User,
        attributes: ["UserID", "Name", "ProfilePicture"],
      },
    ],
    order: [["AddOnDt", "ASC"]],
  });

  return Promise.all(
    comments.map(async (c) => {
      const raw = c.toJSON();
      // userLike for this comment
      const userLike = await CommunityDiscussion.findOne({
        where: {
          Reference: c.DiscussionID,
          UserID: currentUserId,
          Likes: 1,
          delStatus: { [Op.or]: [0, null] },
        },
      });

      // recursively fetch nested replies
      const nestedComments = await getCommentsRecursive(
        c.DiscussionID,
        currentUserId
      );

      return {
        DiscussionID: raw.DiscussionID,
        UserID: raw.UserID,
        UserName: raw.User?.Name || raw.UserName, // fallback to stored UserName
        UserImage: raw.User?.ProfilePicture || null, // <-- add this
        Comment: raw.Comment,
        timestamp: raw.AddOnDt || raw.timestamp,
        Likes: raw.Likes,
        Reference: raw.Reference,
        likeCount: raw.Likes || 0,
        userLike: userLike ? 1 : 0,
        comment: nestedComments,
      };
    })
  );
};

const countAllComments = (comments) => {
  let count = comments.length;
  for (const c of comments) {
    count += countAllComments(c.comment || []);
  }
  return count;
};

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

    const discussions = await CommunityDiscussion.findAll({
      where: {
        delStatus: { [Op.or]: [{ [Op.eq]: 0 }, { [Op.is]: null }] },
        Reference: 0,
      },
      include: [
        {
          model: User,
          attributes: ["UserID", "Name", "ProfilePicture"],
        },
      ],
      order: [["AddOnDt", "DESC"]],
      logging: (sql) => console.log("📝 SQL Executed:", sql),
    });
    console.log("✅ Discussions fetched:", discussions.length);

    // Step 3: Process discussions
    const updatedDiscussions = await Promise.all(
      discussions.map(async (discussion) => {
        const comments = await getCommentsRecursive(
          discussion.DiscussionID,
          userId
        );

        let originalPost = null;
        if (discussion.RepostID) {
          const originalDiscussion = await CommunityDiscussion.findOne({
            where: { DiscussionID: discussion.RepostID },
            include: [
              {
                model: User,
                attributes: ["UserID", "Name", "ProfilePicture"],
              },
            ],
          });

          if (originalDiscussion) {
            originalPost = {
              OriginalDiscussionID: originalDiscussion.DiscussionID,
              OriginalUserID: originalDiscussion.User?.UserID || null,
              OriginalUserName: originalDiscussion.User?.Name || null,
              OriginalUserImage:
                originalDiscussion.User?.ProfilePicture || null,
            };
          }
        }

        // Get ALL like entries for this discussion to count properly
        const allLikeEntries = await CommunityDiscussion.findAll({
          where: {
            Reference: discussion.DiscussionID,
            delStatus: { [Op.or]: [0, null] },
          },
          order: [["AddOnDt", "DESC"]],
        });

        const likeCount = await ContentInteraction.count({
          where: {
            ProcessName: "Discussion",
            reference: discussion.DiscussionID,
            Likes: 1,
            delStatus: { [Op.or]: [0, null] },
          },
        });

        const userLike = await ContentInteraction.findOne({
          where: {
            ProcessName: "Discussion",
            reference: discussion.DiscussionID,
            UserID: userId,
            Likes: 1,
            delStatus: { [Op.or]: [0, null] },
          },
        });

        const commentCount = countAllComments(comments);

        // Group by UserID and get only their latest action
        const userLatestActions = new Map();

        // allLikeEntries.forEach((entry) => {
        //   const existingEntry = userLatestActions.get(entry.UserID);
        //   if (
        //     !existingEntry ||
        //     new Date(entry.AddOnDt) > new Date(existingEntry.AddOnDt)
        //   ) {
        //     userLatestActions.set(entry.UserID, entry);
        //   }
        // });

        userLatestActions.forEach((entry) => {
          if (entry.Likes === 1) {
            likeCount++;
            if (entry.UserID === userId) {
              userLike = 1;
            }
          }
        });

        console.log(`📊 Discussion ${discussion.DiscussionID}:`, {
          totalEntries: allLikeEntries.length,
          uniqueUsers: userLatestActions.size,
          likeCount,
          userLike,
          userId,
        });

        return {
          ...discussion.toJSON(),
          UserName: discussion.AuthAdd,
          VisibilityName: discussion.visibilityRef?.ddValue || null,
          likeCount,
          userLike: userLike ? 1 : 0,
          commentCount,
          comment: comments,
          ImageUrl: discussion.User?.ProfilePicture || null,
          originalPost,
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

// export const getPublicDiscussionsService = async (email) => {
//   try {
//     const user = await User.findOne({
//       where: {
//         EmailId: email,
//         [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
//       },
//     });

//     const userId = user ? user.UserID : null;

//     const discussions = await CommunityDiscussion.findAll({
//       where: {
//         delStatus: { [Op.or]: [{ [Op.eq]: 0 }, { [Op.is]: null }] },
//         Reference: 0,
//       },
//       include: [
//         { model: User, attributes: ["UserID", "Name", "ProfilePicture"] },
//       ],
//       order: [["AddOnDt", "DESC"]],
//     });

//     const updatedDiscussions = await Promise.all(
//       discussions.map(async (discussion) => {
//         const comments = await getCommentsRecursive(
//           discussion.DiscussionID,
//           userId
//         );

//         // 🆕 Like count via Content_Interaction
//         const likeCount = await ContentInteraction.count({
//           where: {
//             ProcessName: "Discussion",
//             reference: discussion.DiscussionID,
//             Likes: 1,
//             delStatus: { [Op.or]: [0, null] },
//           },
//         });

//         // 🆕 User like status
//         const userLike = await ContentInteraction.findOne({
//           where: {
//             ProcessName: "Discussion",
//             reference: discussion.DiscussionID,
//             UserID: userId,
//             Likes: 1,
//             delStatus: { [Op.or]: [0, null] },
//           },
//         });

//         // 🆕 Comment count (using recursive result)
//         const commentCount = countAllComments(comments);

//         return {
//           ...discussion.toJSON(),
//           UserName: discussion.AuthAdd,
//           likeCount,
//           userLike: userLike ? 1 : 0,
//           commentCount,
//           comment: comments,
//           ImageUrl: discussion.User?.ProfilePicture || null,
//         };
//       })
//     );

//     return { success: true, data: updatedDiscussions };
//   } catch (error) {
//     console.error("❌ Error in getPublicDiscussionsService:", error);
//     return { success: false, error };
//   }
// };

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
      AuthLstEdt: actualUser.UserID,
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
  const user = await User.findOne({
    where: { EmailId: userId, delStatus: 0 },
  });

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
      AuthDel: user.UserID, // save who deleted it
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

export const deleteUserCommentService = async (userId, commentId) => {
  if (!commentId) {
    throw new Error("Comment ID is required");
  }

  console.log("🔍 Debug - User ID from token:", userId, "Type:", typeof userId);
  console.log("🔍 Debug - Comment ID:", commentId, "Type:", typeof commentId);

  const requestingUser = await User.findOne({
    where: {
      UserID: userId,
      delStatus: 0,
    },
    attributes: ["UserID", "isAdmin", "Name"],
  });

  console.log("requesting User is ", requestingUser);

  if (!requestingUser) {
    throw new Error("User not found.");
  }

  console.log("🔍 Debug - Requesting user isAdmin:", requestingUser.isAdmin);

  const comment = await CommunityDiscussion.findOne({
    where: {
      DiscussionID: commentId,
      [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
    },
    include: [
      {
        model: User,
        as: "User",
        attributes: ["UserID", "Name", "EmailId", "isAdmin"],
      },
    ],
    attributes: [
      "DiscussionID",
      "UserID",
      "Comment",
      "reference",
      "Title",
      "Content",
    ],
  });

  console.log("🔍 Debug - Found comment:", JSON.stringify(comment, null, 2));

  if (!comment) {
    throw new Error("Comment not found or already deleted.");
  }

  console.log(
    "🔍 Debug - Comment UserID:",
    comment.UserID,
    "Type:",
    typeof comment.UserID
  );

  const isOwner = String(comment.UserID) === String(userId);
  const isAdmin = requestingUser.isAdmin === 1;

  console.log("🔍 Debug - isOwner:", isOwner, "isAdmin:", isAdmin);

  if (!isOwner && !isAdmin) {
    console.log("❌ Ownership check failed - User is neither owner nor admin");
    throw new Error("You can only delete your own comments.");
  }

  console.log("✅ Ownership/Admin check passed");

  // Build the where condition dynamically based on user role
  let whereCondition = {
    DiscussionID: commentId,
    [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
  };

  // If user is NOT admin, add UserID restriction (only can delete their own)
  if (!isAdmin) {
    whereCondition.UserID = userId;
  }
  // If user IS admin, no UserID restriction (can delete any comment)

  console.log("🔍 Debug - Where condition for update:", whereCondition);

  const [rowsUpdated] = await CommunityDiscussion.update(
    {
      delStatus: 1,
      delOnDt: new Date(),
      AuthDel: requestingUser.UserID,
    },
    {
      where: whereCondition,
    }
  );

  console.log("🔍 Debug - Rows updated:", rowsUpdated);

  if (rowsUpdated === 0) {
    throw new Error("Failed to delete the comment. No rows were updated.");
  }

  return {
    commentId: commentId,
    message: "Comment deleted successfully",
    deletedBy: isAdmin ? "admin" : "owner",
  };
};

export const handleDiscussionLikeAction = async (userEmail, postData) => {
  try {
    const discussionId = postData.reference;
    if (!discussionId) throw new Error("Invalid discussion reference");

    console.log("Service - Fetching user with email:", userEmail);

    // Fetch user from database using email
    const user = await User.findOne({
      where: {
        EmailId: userEmail,
        delStatus: 0,
      },
      attributes: ["UserID", "Name", "EmailId"],
    });

    if (!user) {
      throw new Error("User not found");
    }

    const userId = user.UserID;
    const userName = user.Name || "Unknown User";

    console.log("User action - UserID:", userId, "DiscussionID:", discussionId);

    // Check if an interaction already exists for this user & discussion
    let interaction = await ContentInteraction.findOne({
      where: {
        ProcessName: "Discussion",
        UserID: userId,
        reference: discussionId,
        delStatus: 0,
      },
    });

    const currentDate = new Date();
    let finalLikeStatus;
    let message;

    if (interaction) {
      // Toggle like status
      if (interaction.Likes === 1) {
        // User already liked - unlike it
        finalLikeStatus = 0;
        message = "Discussion unliked successfully";
      } else {
        // User hasn't liked or was unliked - like it
        finalLikeStatus = 1;
        message = "Discussion liked successfully";
      }

      console.log(
        "Toggle like - Current:",
        interaction.Likes,
        "New:",
        finalLikeStatus
      );

      // Update existing interaction
      await ContentInteraction.update(
        {
          Likes: finalLikeStatus,
          LikeStatus: 0,
          AuthLstEdt: userId,
          editOnDt: currentDate,
        },
        {
          where: { id: interaction.id },
        }
      );

      return {
        success: true,
        data: {
          liked: finalLikeStatus === 1,
          interactionId: interaction.id,
        },
        message: message,
      };
    }

    // No existing interaction - create new one with like (1)
    finalLikeStatus = 1;
    message = "Discussion liked successfully";

    const newInteraction = await ContentInteraction.create({
      ProcessName: "Discussion",
      UserID: userId,
      reference: discussionId,
      Likes: finalLikeStatus,
      LikeStatus: 0,
      Rating: null,
      RatingStatus: null,
      AuthAdd: userId,
      AuthDel: null,
      AuthLstEdt: null,
      delOnDt: null,
      AddOnDt: currentDate,
      editOnDt: null,
      delStatus: 0,
    });

    return {
      success: true,
      data: {
        liked: finalLikeStatus === 1,
        interactionId: newInteraction.id,
      },
      message: message,
    };
  } catch (error) {
    console.error("Discussion Like Error:", error);
    throw error;
  }
};

export const getDiscussionLikesInfoRaw = async (
  discussionIds,
  currentUserEmail = null
) => {
  try {
    if (!discussionIds || discussionIds.length === 0) {
      return {};
    }

    console.log("Getting likes info for discussions (raw):", discussionIds);
    console.log("Current user email:", currentUserEmail);

    let currentUserId = null;

    // If user is logged in, get their UserID
    if (currentUserEmail) {
      const currentUser = await User.findOne({
        where: {
          EmailId: currentUserEmail,
          delStatus: 0,
        },
        attributes: ["UserID"],
      });

      if (currentUser) {
        currentUserId = currentUser.UserID;
        console.log("Current user ID found:", currentUserId);
      }
    }

    // Use raw query to avoid association issues
    const [likes] = await db.sequelize.query(
      `
      SELECT 
        ci.id,
        ci.reference,
        ci.UserID,
        ci.Likes,
        ci.AddOnDt,
        u.Name as UserName,
        u.ProfilePicture
      FROM Content_Interaction ci
      LEFT JOIN Community_User u ON ci.UserID = u.UserID
      WHERE 
        ci.ProcessName = 'Discussion'
        AND ci.reference IN (?)
        AND ci.Likes = 1
        AND ci.delStatus = 0
        AND u.delStatus = 0
    `,
      {
        replacements: [discussionIds],
      }
    );

    console.log("Found likes (raw):", likes.length);

    // Structure the data
    const likesInfo = {};

    // Initialize for all discussion IDs
    discussionIds.forEach((discussionId) => {
      likesInfo[discussionId] = {
        totalLikes: 0,
        userLikes: [],
        currentUserLiked: false,
      };
    });

    // Process each like
    likes.forEach((like) => {
      const discussionId = like.reference;

      if (likesInfo[discussionId]) {
        // Increment total likes count
        likesInfo[discussionId].totalLikes++;

        // Add user like information
        const userLikeInfo = {
          userId: like.UserID,
          userName: like.UserName || "Unknown User",
          profilePicture: like.ProfilePicture,
          likedAt: like.AddOnDt,
        };

        likesInfo[discussionId].userLikes.push(userLikeInfo);

        // Check if current user liked this discussion
        if (currentUserId && like.UserID === currentUserId) {
          likesInfo[discussionId].currentUserLiked = true;
        }
      }
    });

    console.log("Processed likes info (raw):", likesInfo);
    return likesInfo;
  } catch (error) {
    console.error("Error getting discussion likes info (raw):", error);
    throw error;
  }
};
