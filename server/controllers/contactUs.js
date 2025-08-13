import { validationResult } from "express-validator";
import dotenv from "dotenv";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import {
  queryAsync,
  logError,
  logInfo,
  logWarning
} from "../helper/index.js";

dotenv.config();

export const getContactDetails = async (req, res) => {

  let success = false;

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
        const query = `
          SELECT 
            id, 
            address, 
            email, 
            phone, 
            working_hours, 
            map_embed_code, 
            AuthAdd, 
            AuthDel, 
            AuthLstEdt, 
            delOnDt, 
            AddOnDt, 
            editOnDt, 
            delStatus 
          FROM ContactUs 
          WHERE ISNULL(delStatus, 0) = 0
        `;

        const rows = await queryAsync(conn, query);

        closeConnection();

        if (rows.length > 0) {
          success = true;
          const infoMessage = "Contact details fetched successfully";
          logInfo(infoMessage);
          return res.status(200).json({
            success,
            data: rows[0],
            message: infoMessage,
          });
        } else {
          const warningMessage = "No contact details found";
          logWarning(warningMessage);
          return res.status(200).json({
            success: false,
            data: {},
            message: warningMessage,
          });
        }
      } catch (queryErr) {
        closeConnection();
        logError(queryErr);
        return res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong, please try again",
        });
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong, please try again",
    });
  }
};


export const updateContactDetails = async (req, res) => {
  let success = false;
  const userId = req.user.id;
  // console.log("User ID:", userId);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.warn("Validation errors:", errors.array());
    return res.status(400).json({
      success,
      message: "Invalid input format",
      data: errors.array(),
    });
  }

  try {
    const {
      address,
      email,
      phone,
      working_hours,
      map_embed_code,
    } = req.body;

    connectToDatabase(async (err, conn) => {
      if (err) {
        // console.error("DB Connection Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to connect to database",
          data: err,
        });
      }

      try {
        // Get user name using userId
        const userQuery = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length === 0) {
          closeConnection();
          return res.status(401).json({
            success: false,
            message: "User not found. Please login again.",
          });
        }

        const userName = userRows[0].Name;

        // Soft delete previous contact details
        const softDeleteQuery = `UPDATE ContactUs SET delStatus = 1, delOnDt = GETDATE(), AuthDel = ? WHERE ISNULL(delStatus, 0) = 0`;
        await queryAsync(conn, softDeleteQuery, [userName]);

        // Insert new contact details
        const insertQuery = `
          INSERT INTO ContactUs 
          (address, email, phone, working_hours, map_embed_code, AuthAdd, AddOnDt, delStatus)
          VALUES (?, ?, ?, ?, ?, ?, GETDATE(), 0)
        `;
        const result = await queryAsync(conn, insertQuery, [
          address,
          email,
          phone,
          working_hours,
          map_embed_code,
          userName,
        ]);

        success = true;
        closeConnection();
        // console.log("Contact details updated successfully!");

        return res.status(200).json({
          success,
          message: "Contact details updated successfully",
          data: { newRecordId: result.insertId },
        });

      } catch (queryErr) {
        closeConnection();
        // console.error("Query Error:", queryErr);
        return res.status(500).json({
          success: false,
          message: "Database query failed",
          data: queryErr,
        });
      }
    });

  } catch (error) {
    // console.error("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error",
      data: error,
    });
  }
};
