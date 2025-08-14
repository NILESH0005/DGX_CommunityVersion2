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
  let success = false;

  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage =
      "The data format is incorrect. Please ensure it meets the required format and try again.";

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
        const baseLink = process.env.RegistrationLink;
        const query = `SELECT EmailId, Name FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
        const rows = await queryAsync(conn, query, [req.body.email]);

        if (rows.length > 0) {
          const email = await encrypt(req.body.email);
          const signature = await encrypt(SIGNATURE);

          try {
            const updateQuery = `UPDATE Community_User SET FlagPasswordChange = 2, AuthLstEdit= ?, editOnDt = GETDATE() WHERE isnull(delStatus,0) = 0 AND EmailId= ?`;
            const update = await queryAsync(conn, updateQuery, [
              "Server",
              req.body.email,
            ]);

            const registrationLink = `${baseLink}ResetPassword?email=${email}&signature=${signature}`;

            const message = `Hello,

              We received a request to reset the password for your DGX Community account. Please click the link below to create a new password:

              Reset your password: ${registrationLink}

              If you did not request a password reset, please disregard this email. Your account remains secure.

              For questions, contact us at support@yourdomain.com.

              Thank you,
              The DGX Community Team`;

            const htmlContent = `<!DOCTYPE html>
              <html>
              <head>
                  <style>
                      .button {
                          display: inline-block;
                          padding: 10px 15px;
                          background-color:rgb(154, 188, 224);
                          color: white;
                          text-decoration: none;
                          border-radius: 5px;
                          font-size: 16px;
                      }
                      .footer {
                          font-size: 12px;
                          color: #777;
                          margin-top: 20px;
                      }
                  </style>
              </head>
              <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                  <p>Hello,</p>
                  <p>We received a request to reset the password for your DGX Community account. Please click the button below to create a new password:</p>
                  <p><a href="${registrationLink}" class="button">Reset Your Password</a></p>
                  <p>If you did not request a password reset, you can safely ignore this message. Your account remains secure.</p>
                  <p>For questions, contact us at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.</p>
                  <p>Thank you,<br>The DGX Community Team</p>
                  <div class="footer">
                      <p>This is an automated message. Please do not reply directly to this email.</p>
                  </div>
              </body>
              </html>`;

            closeConnection();
            const mailsent = await mailSender(
              req.body.email,
              message,
              htmlContent
            );
            if (mailsent.success) {
              success = true;
              const infoMessage =
                "Password Reset Link send successfuly to ${req.body.email}";
              logInfo(infoMessage); // Log the success
              return res.status(200).json({
                success: true,
                data: { registrationLink },
                message: "Mail send successfully",
              });
            } else {
              const errorMessage = "Mail isn't sent successfully";
              logError(new Error(errorMessage)); // Log the error
              return res.status(200).json({
                success: false,
                data: { username: req.body.email },
                message: errorMessage,
              });
            }
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
          const warningMessage = "User not found";
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

export const resetPassword = async (
  email,
  signature,
  password,
  SIGNATURE
) => {
  // Find the user
  const user = await User.findOne({
    where: {
      EmailId: email,
      delStatus: { [Op.or]: [0, null] },
    },
  });

  if (!user || user.FlagPasswordChange !== 2) {
    return { success: false, message: "Invalid link" };
  }

  // Verify signature
  if (signature !== SIGNATURE) {
    return { success: false, message: "This link is not valid" };
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update user
  await user.update({
    Password: hashedPassword,
    AuthLstEdt: user.Name,
    editOnDt: new Date(),
    FlagPasswordChange: 1,
  });

  return { success: true, message: "Password Reset successfully" };
};

export const deleteUser = async (req, res) => {
  let success = false;
  const { userId } = req.body;
  const adminName = req.user?.id;

  try {
    const result = await deleteUserService(userId, adminName);

    if (!result.success) {
      logWarning(result.message);
      return res.status(404).json(result);
    }

    logInfo(result.message);
    return res
      .status(200)
      .json({ success: true, data: result.data, message: result.message });
  } catch (err) {
    logError(err);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting user", data: err });
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
    const result = await UserService.sendContactEmailService(name, email, message);

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
