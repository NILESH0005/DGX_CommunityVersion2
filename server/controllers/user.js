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
  // Validate request
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
    const result = await UserService.registerUser(req.body);
    console.log(result);
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: "Validation error",
    });
  }

  const { email, password } = req.body;
  const result = await UserService.loginUser(email, password);
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
    const userEmail = req.user.id; // assuming req.user.id contains the EmailId
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
    const { email, signature, password } = req.body;
    const SIGNATURE = process.env.SIGNATURE;

    const result = await resetPasswordService(
      email,
      signature,
      password,
      SIGNATURE
    );

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.body;
  const adminName = req.user?.id;

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
    const result = await UserService.addUserService(req.body);

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
