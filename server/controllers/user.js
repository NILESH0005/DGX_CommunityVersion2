import { validationResult } from "express-validator";
import bcrypt from 'bcryptjs';
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

dotenv.config();
const JWT_SECRET = process.env.JWTSECRET;
const SIGNATURE = process.env.SIGNATURE;

//Route 0) To verify if User already exists

export const databaseUserVerification = async (req, res) => {
  let success = false;
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage =
      "The data format is incorrect. Please ensure it meets the required format and try again.";
    logWarning(warningMessage); // Log the warning
    res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  try {
    const userEmail = req.body.email;
    console.log("userEmail", userEmail);
    // Connect to the database
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        closeConnection();
        res
          .status(500)
          .json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        //const query = `SELECT * FROM Community_User WHERE EmailId=?`;
        const query =
          "SELECT Name,EmailId,MobileNumber,FlagPasswordChange, Category FROM Community_User WHERE isnull(delStatus,0) = 0 and EmailId=?";
        const rows = await queryAsync(conn, query, [userEmail]);

        if (rows.length > 0) {
          // User found
          if (rows[0].FlagPasswordChange == 0) {
            try {
              const password = await generatePassword(10);
              const salt = await bcrypt.genSalt(10);
              const secPass = await bcrypt.hash(password, salt);

              let referCode;
              while (!success) {
                referCode = await referCodeGenerator(
                  rows[0].Name,
                  rows[0].EmailId,
                  rows[0].MobileNumber
                );
                // console.log(referCode)

                const checkQuery = `SELECT COUNT(UserID) AS userReferCount FROM Community_User WHERE isnull(delStatus,0) = 0 and  ReferalNumber = ?`;
                const checkRows = await queryAsync(conn, checkQuery, [
                  referCode,
                ]);

                // console.log(checkRows[0].Column0)

                if (checkRows[0].userReferCount === 0) {
                  const referCount = rows[0].Category === "Faculty" ? 10 : 2;
                  const updateQuery = `UPDATE Community_User SET Password = ?, AuthLstEdit = ?, editOnDt = GETDATE(), ReferalNumber = ?, ReferalNumberCount = ? WHERE isnull(delStatus,0)=0 and  EmailId = ?`;
                  await queryAsync(conn, updateQuery, [
                    secPass,
                    rows[0].Name,
                    referCode,
                    referCount,
                    userEmail,
                  ]);

                  // Close connection after query execution
                  closeConnection();
                  const message = `Hello,

                    Welcome to the DGX Community! Below are your login credentials:

                    Username: ${userEmail}
                    Password: ${password}

                    Please keep your credentials secure and do not share them with anyone. If you encounter any issues, feel free to contact our support team.

                    Best regards,  
                    The DGX Community Team`;

                  const htmlContent = `<!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            .container {
                                font-family: Arial, sans-serif;
                                color: #333;
                                line-height: 1.6;
                                padding: 20px;
                            }
                            .credentials {
                                margin: 20px 0;
                                font-size: 16px;
                            }
                            .footer {
                                font-size: 12px;
                                color: #777;
                                margin-top: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <p>Hello,</p>
                            <p>Welcome to the DGX Community! Below are your login credentials:</p>
                            <div class="credentials">
                                <p><b>Username:</b> ${userEmail}</p>
                                <p><b>Password:</b> ${password}</p>
                            </div>
                            <p>Please keep your credentials secure and do not share them with anyone. If you encounter any issues, feel free to contact our support team.</p>
                            <p>Best regards,<br/>The DGX Community Team</p>
                            <div class="footer">
                                <p>This is an automated message. Please do not reply directly to this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>`;

                  const mailsent = await mailSender(
                    userEmail,
                    message,
                    htmlContent
                  );

                  // console.log(mailsent.success)
                  // Respond with success message
                  if (mailsent.success) {
                    success = true;
                    logInfo(`Mail sent successfully to ${userEmail}`); // Log the success
                    return res.status(200).json({
                      success: true,
                      data: { username: userEmail },
                      message: "Mail send successfully",
                    });
                  } else {
                    const errorMessage = "Mail isn't sent successfully";
                    logError(new Error(errorMessage)); // Log the error
                    return res.status(200).json({
                      success: false,
                      data: { username: userEmail },
                      message: errorMessage,
                    });
                  }
                }
              }
            } catch (error) {
              const errorMessage = "Error generating password";
              logError(error); // Log the error
              closeConnection();
              return res
                .status(500)
                .json({ success: false, data: error, message: errorMessage });
            }
          } else {
            // User's password change flag is not 0
            const warningMessage = "Credentials already generated, go to login";
            logWarning(warningMessage); // Log the warning
            closeConnection();
            return res
              .status(200)
              .json({ success: false, data: {}, message: warningMessage });
          }
        } else {
          const warningMessage =
            "Access denied. You are not yet a part of this community. Please request a referral from an existing member to join.";

          logWarning(warningMessage); // Log the warning
          closeConnection();
          return res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
        }
      } catch (error) {
        const errorMessage = "Database query error";
        logError(error); // Log the error
        closeConnection();
        return res.status(500).json({
          success: false,
          data: {},
          message: "Something went wrong, please try again",
        });
      }
    });
  } catch (error) {
    const errorMessage = "Failed to connect to database";
    logError(error); // Log the error
    closeConnection();
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong, please try again",
    });
  }
};

//Route 1) create a User using : POST '/api/auth/createuser'. Doesn't require Auth

export const registration = async (req, res) => {
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

  const {
    inviteCode,
    name,
    email,
    password,
    collegeName,
    phoneNumber,
    category,
    designation,
  } = req.body;
  const referalNumberCount = category === "F" ? 10 : 2;
  const FlagPasswordChange = 1;

  // const date = await getCurrentDateTime();

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        closeConnection();
        return res.status(500).json({
          success: false,
          data: err,
          message: "Failed to connect to database",
        });
      }

      try {
        const existingUserQuerry = `SELECT COUNT(UserID) AS userEmailCount FROM Community_User WHERE ISNULL(delStatus,0)=0 AND EmailId = ?`;
        const existingUsers = await queryAsync(conn, existingUserQuerry, [
          email,
        ]);

        if (existingUsers[0].userEmailCount > 0) {
          const warningMessage =
            "An account with this email address already exists. Please log in or use a different email to register.";

          logWarning(warningMessage);
          closeConnection();
          return res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
        }

        // If user does not exist, hash the password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        const checkCreditQuerry = `SELECT ReferalNumberCount, UserID FROM Community_User WHERE ISNULL(delStatus,0)=0 AND ReferalNumber = ?`;
        const checkCredit = await queryAsync(conn, checkCreditQuerry, [
          inviteCode,
        ]);
        // console.log(checkCredit[0].ReferalNumberCount)

        if (checkCredit[0].ReferalNumberCount > 0) {
          const referedBy = checkCredit[0].UserID;
          const RNC = checkCredit[0].ReferalNumberCount - 1;
          // console.log(RNC)
          const referCreditDeductionQuerry = `UPDATE Community_User SET ReferalNumberCount = ${RNC} WHERE ISNULL(delStatus,0)=0 AND ReferalNumber = ?`;
          const referCreditDeduction = await queryAsync(
            conn,
            referCreditDeductionQuerry,
            [inviteCode]
          );
          // console.log(referCreditDeduction)

          let referCode;
          do {
            // Generate a unique referral code
            referCode = await referCodeGenerator(name, email, phoneNumber);
            // console.log(referCode);

            // Check if the referral code already exists
            const checkQuery = `SELECT COUNT(UserID) AS userReferCount FROM Community_User WHERE isnull(delStatus,0) = 0 AND  ReferalNumber = ?`;
            const checkRows = await queryAsync(conn, checkQuery, [referCode]);

            if (checkRows[0].userReferCount === 0) {
              // Insert new user into the database
              // console.log("hi")
              const insertQuerry = `INSERT INTO Community_User (Name, EmailId, CollegeName, MobileNumber, Category, Designation, ReferalNumberCount, ReferalNumber, Password, FlagPasswordChange, ReferedBy, AuthAdd, AddOnDt, delStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?)`;
              const insertResult = await queryAsync(conn, insertQuerry, [
                name,
                email,
                collegeName,
                phoneNumber,
                category,
                designation,
                referalNumberCount,
                referCode,
                secPass,
                FlagPasswordChange,
                referedBy,
                name,
                0,
              ]);

              success = true;

              const infoMessage = "User created successfully";
              logInfo(`infoMessage with ${email}`);
              // Close connection after query execution
              closeConnection();

              // Respond with success message
              return res.status(200).json({
                success: success,
                data: {
                  user: {
                    EmailID: email,
                  },
                },
                message: infoMessage,
              });
            }
          } while (!success);
        } else {
          const warningMessage =
            "This referral code has no remaining credits. Please try again with a different referral code.";

          logWarning(warningMessage);
          closeConnection();
          return res
            .status(200)
            .json({ success: success, data: {}, message: warningMessage });
        }
      } catch (error) {
        logError(error); // Log the error
        closeConnection();
        return res.status(500).json({
          success: false,
          data: error,
          message: "Error generating password or referral code",
        });
      }
    });
  } catch (error) {
    logError(error); // Log the error
    closeConnection();
    return res.status(500).json({
      success: false,
      data: {},
      message: "Internal server error. Please try again",
    });
  }
};

// export const login = async (req, res) => {
//   let success = false;

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const warningMessage =
//       "The data format is incorrect. Please ensure it meets the required format and try again.";
//     logWarning(warningMessage);
//     return res
//       .status(400)
//       .json({ success, data: errors.array(), message: warningMessage });
//   }

//   const { email, password } = req.body;

//   try {
//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         logError(err);
//         closeConnection();
//         return res.status(500).json({
//           success: false,
//           data: err,
//           message: "Failed to connect to database",
//         });
//       }

//       try {
//         const query = `
//           SELECT
//             EmailId,
//             Password,
//             FlagPasswordChange,
//             isAdmin,
//             CASE WHEN ProfilePicture IS NOT NULL THEN 1 ELSE 0 END AS isProfileImage
//           FROM Community_User
//           WHERE isnull(delStatus,0) = 0 AND EmailId = ?
//         `;

//         const result = await queryAsync(conn, query, [email]);
//         console.log("resullttt",result)

//         if (result.length === 0) {
//           console.log("resullttt2",result)
//           const warningMessage = "Please try to login with correct credentials";
//           logWarning(warningMessage);
//           closeConnection();
//           return res
//             .status(200)
//             .json({ success: false, data: {}, message: warningMessage });
//         }

//         const passwordCompare = await bcrypt.compare(
//           password,
//           result[0].Password
//         );
//         console.log("resullttt212",passwordCompare)

//         console.log("resullttt22",result[0].Password
// )
//         if (!passwordCompare) {
//           const warningMessage = "Please try to login with correct credentials";
//           logWarning(warningMessage);
//           closeConnection();
//           return res
//             .status(200)
//             .json({ success: false, data: {}, message: warningMessage });
//         }

//         const data = {
//           user: {
//             id: result[0].EmailId,
//             isAdmin: result[0].isAdmin,
//             uniqueId: result[0].UserID,
//           },
//         };
//         const authtoken = jwt.sign(data, JWT_SECRET);
//         success = true;
//         const infoMessage = "You logged in successfully";
//         logInfo(infoMessage);
//         closeConnection();
//         return res.status(200).json({
//           success: true,
//           data: {
//             authtoken,
//             flag: result[0].FlagPasswordChange,
//             isAdmin: result[0].isAdmin,
//             isProfileImage: result[0].isProfileImage === 1, // Convert to boolean
//           },
//           message: infoMessage,
//         });
//       } catch (queryErr) {
//         logError(queryErr);
//         closeConnection();
//         return res.status(500).json({
//           success: false,
//           data: queryErr,
//           message: "Something went wrong, please try again",
//         });
//       }
//     });
//   } catch (error) {
//     logError(error);
//     closeConnection();
//     return res.status(500).json({
//       success: false,
//       data: {},
//       message: "Something went wrong, please try again",
//     });
//   }
// };

export const login = async (req, res) => {
  let success = false;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage =
      "The data format is incorrect. Please ensure it meets the required format and try again.";
    logWarning(warningMessage);
    return res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
  }

  const { email, password } = req.body;

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success: false,
          data: err,
          message: "Failed to connect to database",
        });
      }

      try {
        // Updated query to check for profile image
        const query = `
          SELECT 
            EmailId, 
            Password, 
            FlagPasswordChange, 
            isAdmin
          FROM Community_User 
          WHERE isnull(delStatus,0) = 0 AND EmailId = ?
        `;

        const result = await queryAsync(conn, query, [email]);

        if (result.length === 0) {
          const warningMessage = "Please try to login with correct credentials";
          logWarning(warningMessage);
          closeConnection();
          return res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
        }
        const passwordCompare = await bcrypt.compare(
          password,
          result[0].Password
        ); 
        console.log("Stored hash:", result[0].Password);
        console.log("Password match result:", passwordCompare);

        if (!passwordCompare) {
          const warningMessage = "Please try to login with correct credentials";
          logWarning(warningMessage);
          closeConnection();
          return res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
        }

        const data = {
          user: {
            id: result[0].EmailId,
            isAdmin: result[0].isAdmin,
            uniqueId: result[0].UserID,
          },
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        const infoMessage = "You logged in successfully";
        logInfo(infoMessage);
        closeConnection();
        return res.status(200).json({
          success: true,
          data: {
            authtoken,
            flag: result[0].FlagPasswordChange,
            isAdmin: result[0].isAdmin,
            isProfileImage: result[0].isProfileImage === 1, // Convert to boolean
          },
          message: infoMessage,
        });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        return res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong, please try again",
        });
      }
    });
  } catch (error) {
    logError(error);
    closeConnection();
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong, please try again",
    });
  }
};

export const changePassword = async (req, res) => {
  let success = false;

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
    const userId = req.user.id;
    // console.log(req.body)
    // console.log(userId);
    const { currentPassword, newPassword } = req.body;

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
        const query = `SELECT Name, Password FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
        const rows = await queryAsync(conn, query, [userId]);

        if (rows.length > 0) {
          try {
            const passwordCompare = await bcrypt.compare(
              currentPassword,
              rows[0].Password
            );
            if (!passwordCompare) {
              const warningMessage =
                "Please try to login with correct credentials";
              logWarning(warningMessage);
              closeConnection();
              return res
                .status(200)
                .json({ success: false, data: {}, message: warningMessage });
            }

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(newPassword, salt);
            // console.log(secPass)
            const updateQuery = `UPDATE Community_User SET Password = ?, FlagPasswordChange = 1, AuthLstEdit = ?, editOnDt = GETDATE() WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
            const updatePassword = await queryAsync(conn, updateQuery, [
              secPass,
              rows[0].Name,
              userId,
            ]);
            closeConnection();
            success = true;
            const infoMessage = "Password Change Successfully ";
            logInfo(infoMessage);
            res
              .status(200)
              .json({ success: true, data: {}, message: infoMessage });
          } catch (queryErr) {
            closeConnection();
            logError(queryErr);
            return res.status(401).json({
              success: false,
              data: queryErr,
              message: "Something went wrong please try again",
            });
          }
        } else {
          const warningMessage = "User not found";
          logWarning(warningMessage);
          closeConnection();
          res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
        }
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
      } finally {
        closeConnection();
      }
    });
  } catch (error) {
    logError(error);
    closeConnection();
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};

export const getuser = async (req, res) => {
  let success = false;

  try {
    const userId = req.user.id;

    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        closeConnection();
        res.status(500).json({
          success: false,
          data: err,
          message: "Failed to connect to database",
        });
        return;
      }

      try {
        const query = `SELECT UserID, Name, EmailId, CollegeName, MobileNumber, Category, Designation,isAdmin, ReferalNumberCount, ReferalNumber, ReferedBy, ProfilePicture,  FlagPasswordChange, AddOnDt FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
        const rows = await queryAsync(conn, query, [userId]);

        if (rows.length > 0) {
          success = true;
          closeConnection();
          const infoMessage = "User data";
          logInfo(infoMessage);
          res
            .status(200)
            .json({ success, data: rows[0], message: infoMessage });
          return;
        } else {
          closeConnection();
          const warningMessage = "User not found";
          logWarning(warningMessage);
          res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
          return;
        }
      } catch (queryErr) {
        closeConnection();
        logError(queryErr);
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
        return;
      }
    });
  } catch (error) {
    logError(queryErr);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};

export const getAllUser = async (req, res) => {
  let success = false;

  const method = req.method;
  if (method === "DELETE") {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required for deletion" });
    }

    try {
      connectToDatabase(async (err, conn) => {
        if (err) {
          logError(err);
          return res
            .status(500)
            .json({ success: false, message: "Failed to connect to database" });
        }

        try {
          const deleteQuery = ""; //`DELETE FROM Community_User WHERE UserID = ?`;
          const result = await queryAsync(conn, deleteQuery, [userId]);

          closeConnection();

          if (result.affectedRows > 0) {
            const successMessage = "User deleted successfully";
            logInfo(successMessage);
            return res
              .status(200)
              .json({ success: true, message: successMessage });
          } else {
            const notFoundMessage = "User not found";
            logWarning(notFoundMessage);
            return res
              .status(404)
              .json({ success: false, message: notFoundMessage });
          }
        } catch (deleteErr) {
          closeConnection();
          logError(deleteErr);
          return res
            .status(500)
            .json({ success: false, message: "Error deleting user" });
        }
      });
    } catch (error) {
      logError(error);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    // Return after handling DELETE method to prevent further execution
    return;
  }

  // GET method to fetch all users
  if (method === "GET") {
    try {
      connectToDatabase(async (err, conn) => {
        if (err) {
          logError(err);
          return res.status(500).json({
            success: false,
            data: err,
            message: "Failed to connect to database",
          });
        }

        try {
          const query = `SELECT 
    UserID, Name, EmailId, CollegeName, MobileNumber, Category, 
    Designation,  
    FlagPasswordChange, AddOnDt, isAdmin, delStatus 
FROM Community_User 
WHERE delStatus = 0 OR delStatus IS NULL;`;
          const rows = await queryAsync(conn, query);

          closeConnection();

          if (rows.length > 0) {
            success = true;
            const infoMessage = "User data retrieved";
            logInfo(infoMessage);
            return res
              .status(200)
              .json({ success, data: rows, message: infoMessage });
          } else {
            const warningMessage = "No users found";
            logWarning(warningMessage);
            return res
              .status(404)
              .json({ success: false, data: {}, message: warningMessage });
          }
        } catch (queryErr) {
          closeConnection();
          logError(queryErr);
          return res.status(500).json({
            success: false,
            message: "Something went wrong with the query",
          });
        }
      });
    } catch (error) {
      logError(error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  } else {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
};

export const sendInvite = async (req, res) => {
  let success = false;

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
    const userId = req.user.id;

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
        const query = `SELECT ReferalNumber FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
        const rows = await queryAsync(conn, query, [userId]);

        if (rows.length > 0) {
          const email = await encrypt(req.body.email);
          const refercode = await encrypt(rows[0].ReferalNumber);

          const registrationLink = `${baseLink}Register?email=${email}&refercode=${refercode}`;

          const message = `Welcome to the DGX Community!

          Welcome to the DGX Community! We’re thrilled to have you join us. To complete your registration, please click the link below:

          Complete your registration: ${registrationLink}

          If you did not sign up for the DGX Community, you can safely disregard this email.

          Thank you,  
          The DGX Community Team`;

          const htmlContent = `<!DOCTYPE html>
          <html>
          <head>
              <style>
                  .button {
                      display: inline-block;
                      padding: 10px 20px;
                      background-color: #28a745;
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
              <p>Welcome to the DGX Community!,</p>
              <p>Welcome to the DGX Community! We’re thrilled to have you join us. To complete your registration, please click the button below:</p>
              <p><a href="${registrationLink}" class="button">Complete Your Registration</a></p>
              <p>If you did not sign up for the DGX Community, you can safely disregard this email.</p>
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
              "Invite Link send successfuly to ${req.body.email}";
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
              data: { username: userEmail },
              message: errorMessage,
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
        logError(queryErr);
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
      }

      // res.json({ success: true, data: { BaseLink }, message:  })
    });
  } catch (queryErr) {
    logError(queryErr);
    res.status(500).json({
      success: false,
      data: queryErr,
      message: "Something went wrong please try again",
    });
  }
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

export const resetPassword = async (req, res) => {
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
        const { email, signature, password } = req.body;
        const query = `SELECT Name, FlagPasswordChange FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
        const rows = await queryAsync(conn, query, [email]);

        if (rows.length > 0 && rows[0].FlagPasswordChange == 2) {
          try {
            if (signature == SIGNATURE) {
              const salt = await bcrypt.genSalt(10);
              const secPass = await bcrypt.hash(password, salt);
              const updateQuery = `UPDATE Community_User SET Password = ?, AuthLstEdit= ?, editOnDt = GETDATE(), FlagPasswordChange = 1 WHERE isnull(delStatus,0) = 0 AND EmailId= ?`;
              const update = await queryAsync(conn, updateQuery, [
                secPass,
                rows[0].Name,
                email,
              ]);
              closeConnection();
              success = true;
              const infoMessage = "Password Reset successfully";
              logInfo(infoMessage); // Log the success
              return res
                .status(200)
                .json({ success: true, data: {}, message: infoMessage });
            } else {
              closeConnection();
              const warningMessage = "This link is not valid";
              logWarning(warningMessage);
              return res
                .status(200)
                .json({ success: false, data: {}, message: warningMessage });
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

export const deleteUser = (req, res) => {
  let success = false;
  const { userId } = req.body;
  const adminName = req.user?.id;
  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success: false,
          data: err,
          message: "Database connection error.",
        });
      }
      try {
        const checkQuery = `SELECT * FROM Community_User WHERE UserID = ? AND (delStatus IS NULL OR delStatus = 0)`;
        const result = await queryAsync(conn, checkQuery, [userId]);
        if (result.length === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found or already deleted.",
          });
        } else {
          try {
            const updateQuery = `UPDATE Community_User SET delStatus = 1, delOnDt = GETDATE(), AuthDel = ? OUTPUT inserted.UserID, inserted.delStatus, inserted.delOnDt, inserted.AuthDel WHERE UserID = ? AND (delStatus IS NULL OR delStatus = 0)`;
            const rows = await queryAsync(conn, updateQuery, [
              adminName,
              userId,
            ]);
            if (rows.length > 0) {
              success = true;
              logInfo("User deleted successfully");
              return res.status(200).json({
                success,
                data: {
                  userId: rows[0].UserID,
                  AuthDel: rows[0].AuthDel,
                  delOnDt: rows[0].delOnDt,
                  delStatus: rows[0].delStatus,
                },
                message: "User deleted successfully.",
              });
            } else {
              logWarning("Failed to delete the user.");
              return res.status(404).json({
                rows,
                success: false,
                message: "Failed to delete the user.",
              });
            }
          } catch (error) {
            logError(updateErr);
            return res.status(500).json({
              success: false,
              data: updateErr,
              message: "Error updating user deletion.",
            });
          }
        }
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: "Error Finding User's data!",
        });
      }
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "Unable to connect to the database!",
    });
  }
};

export const addUser = async (req, res) => {
  let success = false;
  // const userId = req.user.id;
  // console.log(userId)

  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage =
      "Invalid input format. Please check your details and try again.";
    logWarning(warningMessage);
    return res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
  }

  const { Name, EmailId, CollegeName, MobileNumber, Category, Designation } =
    req.body;
  const referalNumberCount = Category === "F" ? 10 : 2;
  const FlagPasswordChange = 0;

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success: false,
          message: "Database connection failed",
          data: err,
        });
      }

      try {
        // Check if the email is already registered
        const existingUserQuery = `SELECT COUNT(UserID) AS userEmailCount FROM Community_User WHERE ISNULL(delStatus,0)=0 AND EmailId = ?`;
        const existingUsers = await queryAsync(conn, existingUserQuery, [
          EmailId,
        ]);

        if (existingUsers[0].userEmailCount > 0) {
          const warningMessage = "User with this email already exists.";
          logWarning(warningMessage);
          closeConnection();
          return res
            .status(200)
            .json({ success: false, message: warningMessage, data: {} });
        }

        // Generate a random password
        const plainPassword = await generatePassword(10);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // Generate a referral code
        let referCode;
        do {
          referCode = await referCodeGenerator(Name, EmailId, MobileNumber);
          const checkQuery = `SELECT COUNT(UserID) AS userReferCount FROM Community_User WHERE isnull(delStatus,0) = 0 AND ReferalNumber = ?`;
          const checkRows = await queryAsync(conn, checkQuery, [referCode]);

          if (checkRows[0].userReferCount === 0) {
            // Insert new user
            const insertQuery = `
               INSERT INTO Community_User 
              (Name, EmailId, CollegeName, MobileNumber, Category, Designation, ReferalNumberCount, ReferalNumber, Password, FlagPasswordChange, AuthAdd, AddOnDt, delStatus) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?)
            `;
            await queryAsync(conn, insertQuery, [
              Name,
              EmailId,
              CollegeName,
              MobileNumber,
              Category,
              Designation,
              referalNumberCount,
              referCode,
              hashedPassword,
              FlagPasswordChange,
              Name,
              0,
            ]);

            success = true;
            const infoMessage = "User added successfully.";
            logInfo(`User added: ${EmailId}`);
            closeConnection();
            return res
              .status(200)
              .json({ success, message: infoMessage, data: { EmailId } });
          }
        } while (!success);
      } catch (error) {
        logError(error);
        closeConnection();
        return res.status(500).json({
          success: false,
          message: "Error processing request",
          data: error,
        });
      }
    });
  } catch (error) {
    logError(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", data: {} });
  }
};

export const sendContactEmail = async (req, res) => {
  let success = false;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Invalid form data",
    });
  }

  try {
    const { name, email, message } = req.body;

    // Create email content
    const emailMessage = `New Contact Form Submission:
    
    Name: ${name}
    Email: ${email}
    Message: ${message}
    
    Received at: ${new Date().toLocaleString()}`;

    const htmlContent = `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .details { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
            .label { font-weight: bold; color: #333; }
        </style>
    </head>
    <body>
        <h2>New Contact Form Submission</h2>
        <div class="details">
            <p><span class="label">Name:</span> ${name}</p>
            <p><span class="label">Email:</span> ${email}</p>
            <p><span class="label">Message:</span><br>${message.replace(
              /\n/g,
              "<br>"
            )}</p>
        </div>
        <p>Received at: ${new Date().toLocaleString()}</p>
    </body>
    </html>`;

    // Send email to your admin
    const adminEmail = "nilesh.thakur@giindia.com";
    const mailSent = await mailSender(adminEmail, emailMessage, htmlContent);

    if (mailSent.success) {
      // Optional: Send confirmation email to the user
      const userMessage = `Thank you for contacting us, ${name}!\n\nWe have received your message and will get back to you soon.\n\nYour message:\n${message}`;

      const userHtml = `<!DOCTYPE html>
      <html>
      <body>
          <p>Thank you for contacting us, ${name}!</p>
          <p>We have received your message and will get back to you soon.</p>
          <p>Your message:</p>
          <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
          <p>Best regards,<br>The DGX Team</p>
      </body>
      </html>`;

      await mailSender(email, userMessage, userHtml);

      return res.status(200).json({
        success: true,
        message: "Your message has been sent successfully",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send email",
      });
    }
  } catch (error) {
    console.error("Error in sendContactEmail:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
