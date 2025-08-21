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

dotenv.config();

export const discussionPost = async (req, res) => {
  console.log("incoming req body", req.body);
  let success = false;
  const userId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    logWarning(warningMessage);
    return res.status(400).json({
      success,
      data: errors.array(),
      message: warningMessage,
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
    } = req.body;

    const postData = {
      title: title || null,
      content: content || null,
      image: image || null,
      likes: likes || null,
      comment: comment || null,
      tags: tags || null,
      url: url || null,
      visibility: visibility || null,
      reference: reference || 0,
      bannerImagePath: bannerImagePath || null,
    };

    const result = await DiscussionService.createDiscussionPost(
      userId,
      postData
    );

    logInfo(result.message);
    return res.status(200).json(result);
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || "Something went wrong please try again",
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
