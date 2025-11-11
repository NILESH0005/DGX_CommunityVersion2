import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import * as DiscussionService from "../services/discussionService.js";
import dotenv from "dotenv";
import {
  queryAsync,
  mailSender,
  logError,
  logInfo,
  logWarning,
} from "../helper/index.js";
import userModel from "../models/User.js";

dotenv.config();

export const discussionPost = async (req, res) => {
  const userId = req.user.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const {
      title,
      content,
      image,
      likes,
      comment,
      tags,
      url,
      visibility,
      reference,
      bannerImagePath,
      allowRepost,
      repostId,
    } = req.body;

    const postData = {
      title: title || null,
      content: content || null,
      image: image || null,
      likes: likes !== undefined ? likes : null,
      comment: comment || null,
      tags: tags || null,
      url: url || null,
      visibility: visibility || null,
      reference: reference || 0,
      bannerImagePath: bannerImagePath || null,
      allowRepost: allowRepost || false,
      repostId: repostId || null,
    };

    // Enhanced debugging
    console.log("=== CONTROLLER DEBUG ===");
    console.log("Full request body:", JSON.stringify(req.body, null, 2));
    console.log("Processed postData:", JSON.stringify(postData, null, 2));

    const isPureLikeAction =
      postData.reference &&
      (postData.likes === 1 || postData.likes === 0) &&
      !postData.title &&
      !postData.content &&
      !postData.tags &&
      !postData.repostId &&
      !postData.image &&
      !postData.url;

    console.log("Is Pure Like Action:", isPureLikeAction);
    console.log("========================");

    const result = await DiscussionService.createDiscussionPost(
      userId,
      postData
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Discussion Controller Error:", error);
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || "Something went wrong, please try again",
    });
  }
};

export const getDiscussion = async (req, res) => {
  let success = false;
  console.log("Request body:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    logWarning(warningMessage);
    return res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const result = await DiscussionService.getPublicDiscussionsService(email);

    if (result.success) {
      success = true;
      const infoMessage = "Discussions fetched successfully";
      logInfo(infoMessage);
      return res.status(200).json({
        success,
        data: { updatedDiscussions: result.data },
        message: infoMessage,
      });
    } else {
      throw result.error;
    }
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong, please try again",
    });
  }
};

export const updateDiscussion = async (req, res) => {
  let success = false;

  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Invalid input";
    logWarning(warningMessage);
    return res.status(400).json({
      success,
      data: errors.array(),
      message: warningMessage,
    });
  }

  try {
    const userId = req.user.id; // Make sure middleware sets req.user.id as numeric UserID
    const result = await DiscussionService.updateDiscussionService(
      userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    logError(err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteDiscussion = async (req, res) => {
  let success = false;
  const { discussionId } = req.body;
  const adminName = req.user?.id; // set by auth middleware

  try {
    const result = await DiscussionService.deleteDiscussionService(
      adminName,
      discussionId
    );

    success = true;
    return res.status(200).json({
      success,
      data: result,
      message: "Discussion deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Error deleting discussion.",
    });
  }
};

export const deleteUserComment = async (req, res) => {
  let success = false;
  const { commentId } = req.body;
  const userId = req.user?.uniqueId;

  try {
    const result = await DiscussionService.deleteUserCommentService(
      userId,
      commentId
    );

    success = true;
    return res.status(200).json({
      success,
      data: result,
      message: "Comment deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Error deleting comment.",
    });
  }
};

export const discussionLike = async (req, res) => {
  try {
    const userEmail = req.user?.id; // Email from middleware
    const postData = req.body;

    console.log("Discussion Like - User email:", userEmail);
    console.log("Discussion Like - Post data:", postData);

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User not logged in",
      });
    }

    // Directly pass the email to service - service will handle user fetching
    const result = await DiscussionService.handleDiscussionLikeAction(
      userEmail,
      postData
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Discussion Like Controller Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const getDiscussionLikes = async (req, res) => {
  try {
    const { discussionIds } = req.body;
    const userEmail = req.user?.id || null;

    console.log("Get Discussion Likes - Discussion IDs:", discussionIds);
    console.log("Get Discussion Likes - User email:", userEmail);

    if (
      !discussionIds ||
      !Array.isArray(discussionIds) ||
      discussionIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Discussion IDs array is required",
      });
    }

    const likesInfo = await DiscussionService.getDiscussionLikesInfoRaw(
      discussionIds,
      userEmail
    );

    return res.status(200).json({
      success: true,
      data: likesInfo,
      message: "Discussion likes information retrieved successfully",
    });
  } catch (err) {
    console.error("Get Discussion Likes Controller Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

// Controller to get likes information for a single discussion
export const getSingleDiscussionLikeInfo = async (req, res) => {
  try {
    const { discussionId } = req.body;
    const userEmail = req.user?.id || null;

    console.log("Get Single Discussion Like - Discussion ID:", discussionId);
    console.log("Get Single Discussion Like - User email:", userEmail);

    if (!discussionId) {
      return res.status(400).json({
        success: false,
        message: "Discussion ID is required",
      });
    }

    const likesInfo = await DiscussionService.getSingleDiscussionLikes(
      discussionId,
      userEmail
    );

    return res.status(200).json({
      success: true,
      data: likesInfo,
      message: "Discussion like information retrieved successfully",
    });
  } catch (err) {
    console.error("Get Single Discussion Like Controller Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};
