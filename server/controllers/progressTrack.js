import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import {
  queryAsync,
  mailSender,
  logError,
  logInfo,
  logWarning,
} from "../helper/index.js";

dotenv.config();

export const getUserFileIDs = async (req, res) => {
  let success = false;
  const userId = req.user.id;
  // console.log("Received request for getUserFileIDs. User ID:", userId);

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Database connection failed";
        logError(err);
        return res.status(500).json({
          success: false,
          data: err,
          message: errorMessage,
        });
      }

      try {
        const userQuery = `
                    SELECT UserID 
                    FROM Community_User 
                    WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?
                `;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length === 0 || !userRows[0].UserID) {
          closeConnection();
          return res.status(404).json({
            success: false,
            message: "User not found",
            data: [],
          });
        }

        const dbUserID = userRows[0].UserID;
        const countQuery = `
                    SELECT COUNT(*) as totalCount 
                    FROM UserLmsProgress 
                    WHERE UserID = ? AND ISNULL(delStatus, 0) = 0
                `;
        const countResult = await queryAsync(conn, countQuery, [dbUserID]);
        const totalCount = countResult[0].totalCount;

        const fileQuery = `
                    SELECT FileID 
                    FROM UserLmsProgress 
                    WHERE UserID = ? AND ISNULL(delStatus, 0) = 0
                    ORDER BY FileID DESC
                `;
        const fileIds = await queryAsync(conn, fileQuery, [dbUserID]);

        success = true;
        closeConnection();

        const successMessage = "File IDs fetched successfully";
        logInfo(successMessage);

        res.status(200).json({
          success,
          data: {
            fileIds,
            totalCount,
          },
          message: successMessage,
        });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        res.status(500).json({
          success: false,
          message: "Query execution failed",
          data: queryErr,
        });
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      data: {},
      message: "Unexpected error occurred",
    });
  }
};

export const getModuleSubmoduleProgress = async (req, res) => {
  let success = false;
  const userEmail = req.user.id;
  const { moduleID } = req.body;

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Database connection failed";
        logError(err);
        return res.status(500).json({
          success: false,
          data: err,
          message: errorMessage,
        });
      }

      try {
        // Get user ID
        const userQuery = `SELECT UserID FROM Community_User WHERE EmailId = ? AND ISNULL(delStatus, 0) = 0`;
        const userResult = await queryAsync(conn, userQuery, [userEmail]);

        if (!userResult || userResult.length === 0) {
          closeConnection(conn);
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        const userID = userResult[0].UserID;

        // Get progress data - CORRECTED QUERY
        const progressQuery = `
          SELECT 
            SM.SubModuleID,
            SM.SubModuleName,
            COUNT(FD.FileID) AS totalFileCount,
            SUM(CASE WHEN ULP.FileID IS NOT NULL THEN 1 ELSE 0 END) AS readCount,
            CAST(
              CASE 
                WHEN COUNT(FD.FileID) = 0 THEN 0
                ELSE (SUM(CASE WHEN ULP.FileID IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(FD.FileID))
              END AS DECIMAL(5,2)
            ) AS ProgressPer
          FROM SubModulesDetails AS SM WITH (NOLOCK)
          LEFT JOIN UnitsDetails AS UD WITH (NOLOCK) 
            ON SM.SubModuleID = UD.SubModuleID AND ISNULL(UD.delStatus, 0) = 0
          LEFT JOIN FilesDetails AS FD WITH (NOLOCK) 
            ON UD.UnitID = FD.UnitID AND ISNULL(FD.delStatus, 0) = 0
          LEFT JOIN UserLmsProgress AS ULP WITH (NOLOCK) 
            ON FD.FileID = ULP.FileID AND ULP.UserID = ? AND ISNULL(ULP.delStatus, 0) = 0
          WHERE SM.ModuleID = ? AND ISNULL(SM.delStatus, 0) = 0
          GROUP BY SM.SubModuleID, SM.SubModuleName
        `;

        const result = await queryAsync(conn, progressQuery, [
          userID,
          moduleID,
        ]);

        success = true;
        closeConnection(conn);

        return res.status(200).json({
          success,
          data: result,
          message: "Submodule progress fetched successfully",
        });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection(conn);
        return res.status(500).json({
          success: false,
          message: "Query execution failed",
          data: queryErr,
        });
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Unexpected error occurred",
    });
  }
};
