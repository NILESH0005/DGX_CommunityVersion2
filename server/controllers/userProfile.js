import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
import dotenv from "dotenv";
import {
  generatePassword,
  referCodeGenerator,
  encrypt,
} from "../utility/index.js";
import {
  queryAsync,
  mailSender,
  logError,
  logInfo,
  logWarning,
} from "../helper/index.js";
import path from "path";
import { promises as fs } from "fs";
import {
  getUserDiscussionsService,
  getUserProfileService,
} from "../services/userProfileService.js";

import db from "../models/index.js";
const { User } = db;

dotenv.config();
const JWT_SECRET = process.env.JWTSECRET;
const SIGNATURE = process.env.SIGNATURE;

export const getUserProfile = async (req, res) => {
  const { userId } = req.params; // passed in route

  try {
    const result = await getUserProfileService(userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    logInfo(result.message);
    return res.status(200).json(result);
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || "Something went wrong, please try again",
    });
  }
};

export const profileDetail = async (req, res) => {
  let success = false;
  const userId = req.user.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    logWarning(warningMessage); // Log the warning
    return res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        res.status(500).json({
          success: false,
          data: err,
          message: "Failed to connect to database",
        });
        return;
      }

      try {
        let {
          userPicture,
          userMobile,
          userDesignation,
          userCollege,
          userAbout,
        } = req.body;
        userPicture = userPicture ?? null;
        userMobile = userMobile ?? null;
        userDesignation = userDesignation ?? null;
        userCollege = userCollege ?? null;
        userAbout = userAbout ?? null;
        const query = `SELECT Name FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
        const rows = await queryAsync(conn, query, [userId]);

        if (rows.length > 0) {
          try {
            if (
              userPicture != null ||
              userMobile != null ||
              userDesignation != null ||
              userCollege != null ||
              userAbout != null
            ) {
              const updateQuery = `UPDATE Community_User SET MobileNumber = ?, Designation = ?, CollegeName = ?, About = ?, ProfilePicture = ?, AuthLstEdt= ?, editOnDt = GETDATE() WHERE isnull(delStatus,0) = 0 AND EmailId= ?`;
              const update = await queryAsync(conn, updateQuery, [
                userMobile,
                userDesignation,
                userCollege,
                userAbout,
                userPicture,
                rows[0].Name,
                userId,
              ]);
            }
            const getQuery = `SELECT Name, EmailId, CollegeName, MobileNumber, Designation, About, ProfilePicture FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
            const getRows = await queryAsync(conn, getQuery, [userId]);
            const userData = getRows[0];
            closeConnection();
            const warningMessage = "This link is not valid";
            logWarning(warningMessage);
            return res.status(200).json({
              success: false,
              data: { userData },
              message: warningMessage,
            });
          } catch (Err) {
            closeConnection();
            logError(Err);
            res.status(500).json({
              success: false,
              data: Err,
              message: "Something went wrong please try again",
            });
          }
        } else {
          closeConnection();
          const warningMessage = "invalid link";
          logWarning(warningMessage);
          res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
        }
      } catch (queryErr) {
        closeConnection();
        logError(queryErr);
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
      }
    });
  } catch (Err) {
    closeConnection();
    logError(Err);
    res.status(500).json({
      success: false,
      data: Err,
      message: "Something went wrong please try again",
    });
  }
};

export const getUserDiscussion = async (req, res) => {
  let success = false;
  const userId = req.user.id || req.user.UserID;
  console.log("Fetched userId from JWT:", userId);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    logWarning(warningMessage);
    return res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
  }

  try {
    const result = await getUserDiscussionsService(userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    success = true;
    logInfo(result.message);
    return res.status(200).json(result);
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};

export const deleteUserDiscussion = async (req, res) => {
  let success = false;
  const userId = req.user.id;
  const { discussionId } = req.body; // Get discussionId from request body

  // Validate the discussionId
  if (!discussionId) {
    const warningMessage = "Discussion ID is required";
    logWarning(warningMessage);
    return res.status(400).json({ success, message: warningMessage });
  }

  try {
    // Connect to the database
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        return res.status(500).json({ success: false, message: errorMessage });
      }

      try {
        // Check if the discussion exists and if the user is the owner
        const checkQuery = `SELECT UserID FROM Community_Discussion WHERE DiscussionID = ? AND ISNULL(delStatus, 0) = 0`;
        const discussion = await queryAsync(conn, checkQuery, [discussionId]);

        if (discussion.length === 0) {
          const errorMessage = "Discussion not found or already deleted";
          logWarning(errorMessage);
          return res.status(404).json({ success, message: errorMessage });
        }

        if (discussion[0].UserID !== userId) {
          const errorMessage =
            "You are not authorized to delete this discussion";
          logWarning(errorMessage);
          return res.status(403).json({ success, message: errorMessage });
        }

        // Proceed to delete the discussion by setting delStatus to 1 (soft delete)
        const deleteQuery = `UPDATE Community_Discussion SET delStatus = 1 WHERE DiscussionID = ?`;
        await queryAsync(conn, deleteQuery, [discussionId]);

        success = true;
        const infoMessage = "Discussion deleted successfully";
        logInfo(infoMessage);
        res.status(200).json({ success, message: infoMessage });
      } catch (queryErr) {
        logError(queryErr);
        res.status(500).json({
          success: false,
          message: "Something went wrong, please try again",
        });
      } finally {
        closeConnection(); // Always close the database connection
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong, please try again",
    });
  }
};

export const updateUserDetails = async (req, res) => {
  console.log("Incoming user update request:", req.body);

  // Verify authentication
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Please login first",
    });
  }

  const userEmail = req.user.id; // Assuming req.user.id = EmailId

  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: "Invalid data format",
      });
    }

    const { Name, CollegeName, MobileNumber, Designation, UserDescription } =
      req.body;

    // Required fields check
    if (!Name || !CollegeName || !MobileNumber || !Designation) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Mobile number validation
    if (!/^\d{10}$/.test(MobileNumber)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits",
      });
    }

    // Find user
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user
    await user.update({
      Name,
      CollegeName,
      MobileNumber,
      Designation,
      UserDescription: UserDescription || "",
      AuthLstEdt: user.Name, // keeping last editor
      editOnDt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        Name,
        CollegeName,
        MobileNumber,
        Designation,
        UserDescription: UserDescription || "",
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// controllers/userProfile.js
export const uploadUserAvatar = async (req, res) => {
  try {
    const { email, avatar } = req.body; // avatar = base64 string

    if (!email || !avatar) {
      return res
        .status(400)
        .json({ success: false, message: "Email and avatar are required" });
    }

    // Update using EmailId (string) not UserID (integer)
    await User.update(
      { ProfilePicture: avatar },
      { where: { EmailId: email, delStatus: 0 } }
    );

    return res.json({ success: true, message: "Avatar updated successfully" });
  } catch (err) {
    console.error("Error uploading avatar:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error uploading avatar" });
  }
};
