import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import jwt from "jsonwebtoken";
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
import * as UserService from "../services/userService.js";
import db from "../models/index.js";
import { registerUser } from "../services/userService.js";
import {
  getAllUsersService,
  deleteUserService,
  resetPasswordService,
  addRoleService,
} from "../services/userService.js";

dotenv.config();
const JWT_SECRET = process.env.JWTSECRET;
const SIGNATURE = process.env.SIGNATURE;

const User = db.User;

export const databaseUserVerification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage =
      "The data format is incorrect. Please ensure it meets the required format and try again.";
    logWarning(warningMessage);
    return res
      .status(400)
      .json({ success: false, data: errors.array(), message: warningMessage });
  }

  try {
    const userEmail = req.body.email;
    const result = await UserService.verifyUserAndSendPassword(userEmail);
    return res.status(result.status).json(result.response);
  } catch (error) {
    logError(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const registration = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage =
      "The data format is incorrect. Please ensure it meets the required format and try again.";
    logWarning(warningMessage);
    return res
      .status(400)
      .json({ success: false, data: errors.array(), message: warningMessage });
  }

  try {
    const userInfo = req.user || {}; // Example: { id: 'nilesh.thakur@giindia.com', isAdmin: 1, uniqueId: 1 }
    const result = await UserService.registerUser(req.body, userInfo);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Registration error:", error.message, error.stack);
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Internal server error. Please try again",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Clean & reliable IP detection
  let ipAddress =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  ipAddress = ipAddress?.replace(/^::ffff:/, "") || "UNKNOWN";

  // Clean device info
  const deviceInfo = {
    userAgent: req.headers["user-agent"] || "UNKNOWN",
    platform: req.headers["sec-ch-ua-platform"] || "UNKNOWN",
    mobile: req.headers["sec-ch-ua-mobile"] || "UNKNOWN",
  };

  console.log("IP:", ipAddress);
  console.log("Device:", deviceInfo);

  const result = await UserService.loginUser(
    email,
    password,
    ipAddress,
    deviceInfo
  );
  res.status(result.status).json(result.response);
};

export const getUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    logWarning(warningMessage);
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: warningMessage,
    });
  }

  try {
    const userEmail = req.user.id;
    const result = await UserService.getUserByEmail(userEmail);
    return res.status(result.status).json(result.response);
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Internal server error. Please try again",
    });
  }
};

export const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage =
      "The data format is incorrect. Please ensure it meets the required format and try again.";
    logWarning(warningMessage);
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: warningMessage,
    });
  }

  const { currentPassword, newPassword } = req.body;
  const userEmail = req.user.id; // Assuming req.user.id contains the email

  const result = await UserService.changeUserPassword(
    userEmail,
    currentPassword,
    newPassword
  );
  res.status(result.status).json(result.response);
};

export const getAllUser = async (req, res) => {
  const method = req.method;

  if (method === "DELETE") {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required for deletion" });
    }

    const result = await deleteUserService(userId);
    return res.status(result.status).json(result.response);
  }

  if (method === "GET") {
    const result = await getAllUsersService();
    return res.status(result.status).json(result.response);
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

export const sendInvite = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage =
      "The data format is incorrect. Please ensure it meets the required format and try again.";
    logWarning(warningMessage);
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: warningMessage,
    });
  }

  const userEmail = req.user.id; // Assuming `req.user.id` stores EmailId
  const inviteeEmail = req.body.email;

  const result = await UserService.sendInviteService(userEmail, inviteeEmail);
  res.status(result.status).json(result.response);
};

export const passwordRecovery = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage =
      "The data format is incorrect. Please ensure it meets the required format and try again.";
    logWarning(warningMessage);
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: warningMessage,
    });
  }

  try {
    const { email } = req.body;
    const result = await UserService.passwordRecovery(email);
    return res.status(result.status).json(result.response);
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong, please try again",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);

    const { email, signature, password } = req.body;
    const SIGNATURE = process.env.SIGNATURE;
    console.log("Extracted values:", { email, signature, password });
    console.log("Env SIGNATURE:", SIGNATURE);

    // Validate required fields
    if (!email || !signature || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        received: { email, signature, password },
      });
    }

    const result = await resetPasswordService(
      email,
      signature,
      password,
      SIGNATURE
    );
    console.log("Service result:", result);

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.body;
  const adminName = req.user?.uniqueId;

  try {
    const result = await deleteUserService(userId, adminName);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    logError(err);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting user", error: err });
  }
};

export const addUser = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage =
      "Invalid input format. Please check your details and try again.";
    logWarning(warningMessage);
    return res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
  }

  try {
    const result = await UserService.addUserService(req.body, req.user);

    if (!result.success) {
      logWarning(result.message);
      return res.status(200).json(result);
    }

    logInfo(result.message);
    return res.status(200).json(result);
  } catch (err) {
    logError(err);
    return res
      .status(500)
      .json({ success: false, message: "Error adding user", data: err });
  }
};

export const sendContactEmail = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success, data: errors.array(), message: "Invalid form data" });
  }

  try {
    const { name, email, message } = req.body;
    const result = await UserService.sendContactEmailService(
      name,
      email,
      message
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    logError(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", data: err });
  }
};

export const addRole = async (req, res) => {
  let success = false;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const warningMessage =
      "Invalid input format. Please check your details and try again.";
    logWarning(warningMessage);
    return res.status(400).json({
      success,
      data: errors.array(),
      message: warningMessage,
    });
  }

  try {
    const result = await addRoleService(req.body, req.user);

    if (!result.success) {
      logWarning(result.message);
      return res.status(200).json(result);
    }

    logInfo(result.message);
    return res.status(200).json(result);
  } catch (err) {
    logError(err);
    return res.status(500).json({
      success: false,
      message: "Error adding role",
      data: err,
    });
  }
};

export const getRoles = async (req, res) => {
  try {
    const result = await UserService.getRolesService();

    if (!result.success) {
      logWarning(result.message);
      return res.status(200).json(result);
    }

    logInfo("Roles fetched successfully from controller");
    return res.status(200).json(result);
  } catch (err) {
    console.error("GET ROLES CONTROLLER ERROR 👉", err);
    logError(err);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
      data: [],
    });
  }
};

export const getPages = async (req, res) => {
  try {
    const result = await UserService.getPagesService();

    if (!result.success) {
      logWarning(result.message);
      return res.status(200).json(result);
    }

    logInfo("Pages fetched successfully from controller");
    return res.status(200).json(result);
  } catch (err) {
    console.error("GET Pages CONTROLLER ERROR 👉", err);
    logError(err);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
      data: [],
    });
  }
};

export const assignPagesToRole = async (req, res) => {
  let success = false;

  try {
    const { roleId, pageIds } = req.body;
    const userInfo = req.user; // This should contain user info including uniqueId

    // Basic validation
    if (!roleId || !pageIds || !Array.isArray(pageIds)) {
      const warningMessage = "Role ID and page IDs array are required";
      logWarning(warningMessage);
      return res.status(400).json({
        success,
        message: warningMessage,
      });
    }

    // Validate pageIds array
    if (pageIds.length === 0) {
      const warningMessage = "At least one page must be selected";
      logWarning(warningMessage);
      return res.status(400).json({
        success,
        message: warningMessage,
      });
    }

    const result = await UserService.assignPagesToRoleService(
      roleId,
      pageIds,
      userInfo
    );

    if (!result.success) {
      logWarning(result.message);
      return res.status(200).json(result);
    }

    logInfo(result.message);
    return res.status(200).json(result);
  } catch (err) {
    console.error("ASSIGN PAGES TO ROLE ERROR 👉", err);
    logError(err);

    return res.status(500).json({
      success: false,
      message: err.message || "Error assigning pages to role",
      data: err,
    });
  }
};

export const getRolePageAccess = async (req, res) => {
  try {
    const result = await UserService.getRolePageAccessReportService();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error in getRolePageAccessReport:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate role-page access report",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const assignSingleRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    const currentUser = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        data: {},
      });
    }

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required",
        data: {},
      });
    }

    if (!currentUser || !currentUser.id) {
      return res.status(400).json({
        success: false,
        message: "Current user information is required",
        data: {},
      });
    }

    const result = await UserService.assignSingleRoleService(
      userId,
      roleId,
      currentUser.id
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error in assignSingleRole controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign role",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getUserRole = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        data: null,
      });
    }

    const result = await UserService.getUserRoleService(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error in getUserRole controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user role",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const removeUserRole = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        data: {},
      });
    }

    if (!currentUser || !currentUser.id) {
      return res.status(400).json({
        success: false,
        message: "Current user information is required",
        data: {},
      });
    }

    const result = await UserService.removeUserRoleService(
      userId,
      currentUser.id
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error in removeUserRole controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove user role",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getPagesByRole = async (req, res) => {
  try {
    const roleId = req.user.isAdmin; // coming from auth middleware

    const pages = await UserService.getPagesByRoleService(roleId);

    return res.status(200).json({
      success: true,
      data: pages,
      message: "Accessible pages fetched",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pages",
    });
  }
};
