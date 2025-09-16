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
import { log } from "util";
import { Console } from "console";
import fs from "fs";
import path from "path";
import { deleteModuleService, deleteSubModuleService, recordFileViewService, updateFileService, updateFileViewEndTimeService, updateModuleOrderService, updateModuleService, updateSubModuleService } from "../services/lmsEditService.js";

dotenv.config();

export const updateModule = async (req, res) => {
  const userId = req.user?.UserID || req.user?.id;
  const moduleId = parseInt(req.params.id, 10);
  const { ModuleName, ModuleDescription, ModuleImagePath, SortingOrder } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  if (isNaN(moduleId)) {
    return res.status(400).json({ success: false, message: "Invalid module ID" });
  }

  if (!ModuleName || !ModuleDescription) {
    return res.status(400).json({ success: false, message: "ModuleName and ModuleDescription are required" });
  }

  const result = await updateModuleService(userId, moduleId, {
    ModuleName,
    ModuleDescription,
    ModuleImagePath,
    SortingOrder,
  });

  return res.status(result.status).json(result.response);
};


export const updateModuleOrder = async (req, res) => {
  const { modules } = req.body;

  if (!Array.isArray(modules) || modules.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Modules array is required and cannot be empty",
    });
  }

  const result = await updateModuleOrderService(modules);
  return res.status(result.status).json(result.response);
};

// export const deleteModule = (req, res) => {
//   const { moduleId } = req.body;

//   // Input validation
//   if (!moduleId || isNaN(moduleId)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid module ID provided",
//     });
//   }

//   try {
//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         logError(err);
//         return res.status(500).json({
//           success: false,
//           message: "Database connection error",
//         });
//       }

//       try {
//         // Check if module exists and isn't deleted
//         const checkQuery = `
//                     SELECT * FROM ModulesDetails
//                     WHERE ModuleID = ? AND (delStatus IS NULL OR delStatus = 0)
//                 `;
//         const [existingModule] = await queryAsync(conn, checkQuery, [moduleId]);

//         if (!existingModule) {
//           closeConnection(conn);
//           return res.status(404).json({
//             success: false,
//             message: "Module not found or already deleted",
//           });
//         }

//         // Perform the soft delete
//         const deleteQuery = `
//                     UPDATE ModulesDetails
//                     SET
//                         delStatus = 1,
//                         delOnDt = GETDATE()
//                     WHERE ModuleID = ? AND (delStatus IS NULL OR delStatus = 0)
//                 `;

//         const result = await queryAsync(conn, deleteQuery, [moduleId]);
//         closeConnection(conn);

//         // Check if update was successful

//         return res.status(200).json({
//           success: true,
//           data: {
//             moduleId: moduleId,
//             deletedAt: new Date().toISOString(),
//           },
//           message: "Module deleted successfully",
//         });
//       } catch (error) {
//         closeConnection(conn);
//         logError(`Error deleting module: ${error.message}`);
//         return res.status(500).json({
//           success: false,
//           message: "Database error during deletion",
//         });
//       }
//     });
//   } catch (outerError) {
//     logError(`Unexpected error: ${outerError.message}`);
//     return res.status(500).json({
//       success: false,
//       message: "Unexpected server error",
//     });
//   }
// };

export const deleteModule = async (req, res) => {
   const { moduleId } = req.body;

  if (!moduleId || isNaN(moduleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid module ID provided",  // Ensure correct message
    });
  }

  const result = await deleteModuleService(moduleId);

  return res.status(result.status).json(result.response);
};

export const deleteSubModule = async (req, res) => {
  const { subModuleId } = req.body;
  const adminId = req.user?.id;

  if (!subModuleId || isNaN(subModuleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid sub-module ID provided"
    });
  }

  if (!adminId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
  }

  const result = await deleteSubModuleService(subModuleId, adminId);

  return res.status(result.status).json(result.response);
};


export const updateSubModule = async (req, res) => {
  const userEmail = req.user?.EmailId || req.user?.email || req.user?.id;
  const subModuleId = parseInt(req.params.id, 10);

  if (!userEmail) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  if (isNaN(subModuleId)) {
    return res.status(400).json({ success: false, message: "Invalid SubModule ID" });
  }

  const { SubModuleName, SubModuleDescription, SubModuleImagePath, SortingOrder } = req.body;

  if (!SubModuleName || !SubModuleDescription) {
    return res.status(400).json({ success: false, message: "SubModuleName and SubModuleDescription are required" });
  }

  const result = await updateSubModuleService(userEmail, subModuleId, {
    SubModuleName,
    SubModuleDescription,
    SubModuleImagePath,
    SortingOrder,
  });

  return res.status(result.status).json(result.response);
};



export const updateSubmoduleOrder = async (req, res) => {
  let success = false;
  const { submodules } = req.body;

  if (!submodules || !Array.isArray(submodules)) {
    return res.status(400).json({
      success,
      message: "submodules array is required",
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success,
          message: "Database connection error",
        });
      }

      try {
        await conn.beginTransaction();

        for (const submodule of submodules) {
          const updateQuery = `
            UPDATE SubModulesDetails 
            SET 
              SortingOrder = ?,
              editOnDt = CURRENT_TIMESTAMP
            WHERE SubModuleID = ?
          `;
          await queryAsync(conn, updateQuery, [
            submodule.SortingOrder,
            submodule.SubModuleID,
          ]);
        }

        await conn.commit();
        success = true;
        res.status(200).json({
          success,
          message: "Submodule order updated successfully",
        });
      } catch (queryErr) {
        await conn.rollback();
        logError(queryErr);
        res.status(500).json({
          success,
          message: "Error updating submodule order",
        });
      } finally {
        closeConnection();
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success,
      message: "Server error",
    });
  }
};

export const updateUnitOrder = async (req, res) => {
  let success = false;
  const { units } = req.body;

  if (!units || !Array.isArray(units)) {
    return res.status(400).json({
      success,
      message: "units array is required",
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success,
          message: "Database connection error",
        });
      }

      try {
        await conn.beginTransaction();

        // Update each unit's sorting order
        for (const unit of units) {
          const updateQuery = `
                        UPDATE UnitsDetails 
                        SET 
                            SortingOrder = ?,
                            editOnDt = CURRENT_TIMESTAMP
                        WHERE UnitID = ?
                    `;
          await queryAsync(conn, updateQuery, [unit.SortingOrder, unit.UnitID]);
        }

        await conn.commit();
        success = true;
        res.status(200).json({
          success,
          message: "Unit order updated successfully",
        });
      } catch (queryErr) {
        await conn.rollback();
        logError(queryErr);
        res.status(500).json({
          success,
          message: "Error updating unit order",
        });
      } finally {
        closeConnection();
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success,
      message: "Server error",
    });
  }
};

export const updateFilesOrder = async (req, res) => {
  let success = false;
  const { files } = req.body;

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({
      success,
      message: "files array is required",
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success,
          message: "Database connection error",
        });
      }

      try {
        await conn.beginTransaction();

        // Update each file's sorting order
        for (const [index, file] of files.entries()) {
          const updateQuery = `
            UPDATE FilesDetails 
            SET 
                SortingOrder = ?,
                Percentage = ?,
                editOnDt = CURRENT_TIMESTAMP
            WHERE FileID = ?
          `;
          await queryAsync(conn, updateQuery, [
            index + 1, // 1-based sorting order
            file.Percentage || 0, // Keep existing percentage logic
            file.FileID,
          ]);
        }

        await conn.commit();
        success = true;
        res.status(200).json({
          success,
          message: "Files order updated successfully",
        });
      } catch (queryErr) {
        await conn.rollback();
        logError(queryErr);
        res.status(500).json({
          success,
          message: "Error updating files order",
        });
      } finally {
        closeConnection();
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success,
      message: "Server error",
    });
  }
};

export const addSubmodule = async (req, res) => {
  console.log("Incoming request body", req.body);
  let success = false;
  const userId = req.user.id;
  console.log("User ID:", userId);

  try {
    const {
      SubModuleName,
      SubModuleDescription,
      ModuleID,
      SubModuleImagePath,
    } = req.body;
    const SubModuleImage = req.file;

    if (!ModuleID) {
      const warningMessage = "ModuleID is required";
      logWarning(warningMessage);
      return res.status(400).json({
        success: false,
        data: {},
        message: warningMessage,
      });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(errorMessage);
        return res.status(500).json({
          success: false,
          data: err,
          message: errorMessage,
        });
      }

      try {
        const userQuery = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus,0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length === 0) {
          closeConnection();
          const warningMessage = "User not found";
          logWarning(warningMessage);
          return res.status(404).json({
            success: false,
            data: {},
            message: warningMessage,
          });
        }

        let imagePath = null;
        // Handle direct file upload
        if (SubModuleImage) {
          imagePath = SubModuleImage.path.replace("public/", "");
        }
        // Handle pre-uploaded file path from form data
        else if (SubModuleImagePath) {
          imagePath = SubModuleImagePath;
        }

        // Start a transaction
        await queryAsync(conn, "BEGIN TRANSACTION");

        try {
          // Insert new submodule with ModuleID and get the ID back
          const insertQuery = `
            INSERT INTO SubModulesDetails 
            (
                SubModuleName, 
                SubModuleImagePath, 
                SubModuleDescription,
                ModuleID,
                AuthAdd,
                AddOnDt,
                delStatus
            ) 
            OUTPUT INSERTED.SubModuleID
            VALUES (?, ?, ?, ?, ?, GETDATE(), 0);
          `;

          const insertResult = await queryAsync(conn, insertQuery, [
            SubModuleName,
            imagePath,
            SubModuleDescription,
            ModuleID,
            userRows[0].Name,
          ]);

          // Get the newly created SubModuleID
          const newSubmoduleId = insertResult[0].SubModuleID;

          // Get module name for the group name
          const moduleQuery = `SELECT ModuleName FROM ModulesDetails WHERE ModuleID = ?`;
          const moduleRows = await queryAsync(conn, moduleQuery, [ModuleID]);
          const moduleName =
            moduleRows.length > 0 ? moduleRows[0].ModuleName : "";

          // Insert into group table
          const groupName = `${SubModuleName} (${moduleName})`;
          const groupInsertQuery = `
            INSERT INTO GroupMaster 
            (
                group_name,
                group_category,
                SubModuleID,  
                AuthAdd,
                AddOnDt,
                delStatus
            )
            VALUES (?, 'submodule', ?, ?, GETDATE(), 0);`;

          await queryAsync(conn, groupInsertQuery, [
            groupName,
            newSubmoduleId,
            userRows[0].Name,
          ]);

          // Commit the transaction
          await queryAsync(conn, "COMMIT TRANSACTION");

          // Get the newly created submodule with all details
          const newSubmoduleQuery = `
            SELECT * FROM SubModulesDetails 
            WHERE SubModuleID = ?
            AND ISNULL(delStatus,0) = 0;
          `;
          const newSubmodule = await queryAsync(conn, newSubmoduleQuery, [
            newSubmoduleId,
          ]);

          success = true;
          closeConnection();

          const infoMessage =
            "Submodule and corresponding group added successfully";
          logInfo(infoMessage);

          return res.status(200).json({
            success,
            data: newSubmodule[0],
            message: infoMessage,
          });
        } catch (queryErr) {
          // Rollback transaction if any error occurs
          await queryAsync(conn, "ROLLBACK TRANSACTION");
          closeConnection();
          console.error("Database Query Error:", queryErr);
          logError(queryErr);
          return res.status(500).json({
            success: false,
            data: queryErr,
            message: "Failed to add submodule. Please check your input data.",
          });
        }
      } catch (error) {
        closeConnection();
        logError(error);
        return res.status(500).json({
          success: false,
          data: {},
          message: "Internal server error",
        });
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Internal server error",
    });
  }
};

export const deleteUnit = (req, res) => {
  const { unitId } = req.body;

  // Input validation
  if (!unitId || isNaN(unitId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid unit ID provided",
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success: false,
          message: "Database connection error",
        });
      }

      try {
        // Check if unit exists and isn't deleted
        const checkQuery = `
                    SELECT * FROM UnitsDetails 
                    WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;
        const [existingUnit] = await queryAsync(conn, checkQuery, [unitId]);

        if (!existingUnit) {
          closeConnection(conn);
          return res.status(404).json({
            success: false,
            message: "Unit not found or already deleted",
          });
        }

        // Perform the soft delete
        const deleteQuery = `
                    UPDATE UnitsDetails
                    SET 
                        delStatus = 1,
                        delOnDt = GETDATE(),
                        AddDel = ?
                    WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;

        const adminId = req.user?.id; // Get current user ID
        await queryAsync(conn, deleteQuery, [adminId, unitId]);
        closeConnection(conn);

        return res.status(200).json({
          success: true,
          data: {
            unitId: unitId,
            deletedAt: new Date().toISOString(),
            deletedBy: adminId,
          },
          message: "Unit deleted successfully",
        });
      } catch (error) {
        closeConnection(conn);
        logError(`Error deleting unit: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: "Database error during deletion",
        });
      }
    });
  } catch (outerError) {
    logError(`Unexpected error: ${outerError.message}`);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error",
    });
  }
};

export const updateUnit = async (req, res) => {
  let success = false;

  // 1. Authentication and validation
  const userId = req.user?.UserID || req.user?.id;
  if (!userId) {
    return res.status(401).json({ success, message: "User not authenticated" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logWarning("Data validation failed", errors.array());
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  // 2. Parameter extraction
  const unitId = parseInt(req.params.id, 10);
  if (isNaN(unitId)) {
    return res.status(400).json({ success, message: "Invalid unit ID" });
  }

  // 3. Extract body fields
  const { UnitName, UnitDescription } = req.body;

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError("Database connection failed", err);
        return res.status(500).json({
          success,
          message: "Failed to connect to database",
        });
      }

      try {
        let userQuery, userRows;

        if (!isNaN(Number(userId))) {
          userQuery = `
                        SELECT UserID, Name, isAdmin FROM Community_User 
                        WHERE ISNULL(delStatus, 0) = 0 AND UserID = ?
                    `;
          userRows = await queryAsync(conn, userQuery, [Number(userId)]);
        }

        // If not found and userId looks like an email, try by email
        if (
          (!userRows || userRows.length === 0) &&
          typeof userId === "string" &&
          userId.includes("@")
        ) {
          userQuery = `
                        SELECT UserID, Name, isAdmin FROM Community_User 
                        WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?
                    `;
          userRows = await queryAsync(conn, userQuery, [userId]);
        }

        if (!userRows || userRows.length === 0) {
          closeConnection(conn);
          return res.status(404).json({ success, message: "User not found" });
        }

        const user = userRows[0];

        // 5. Build update query
        const updateQuery = `
                    UPDATE UnitsDetails
                    SET 
                        UnitName = ?,
                        UnitDescription = ?,
                        AuthLstEdt = ?,
                        editOnDt = ?
                    WHERE UnitID = ? AND ISNULL(delStatus, 0) = 0
                `;

        const updateParams = [
          UnitName || null,
          UnitDescription || null,
          user.Name, // AuthLstEdt
          new Date(), // editOnDt
          unitId,
        ];

        // 6. Execute update
        const result = await queryAsync(conn, updateQuery, updateParams);

        if (result.affectedRows === 0) {
          closeConnection(conn);
          return res.status(404).json({
            success,
            message: "Unit not found or already deleted",
          });
        }

        // 7. Fetch updated unit
        const fetchQuery = `
                    SELECT 
                        UnitID, 
                        UnitName, 
                        UnitDescription,
                        AuthLstEdt, 
                        editOnDt
                    FROM UnitsDetails
                    WHERE UnitID = ? AND ISNULL(delStatus, 0) = 0
                `;

        const updatedUnit = await queryAsync(conn, fetchQuery, [unitId]);

        success = true;
        closeConnection(conn);
        logInfo("Unit updated successfully");

        return res.status(200).json({
          success,
          data: updatedUnit[0],
          message: "Unit updated successfully",
        });
      } catch (queryErr) {
        closeConnection(conn);
        logError("Database query failed", queryErr);
        return res.status(500).json({
          success,
          message: "Database operation failed",
          details: queryErr.message.includes("Conversion failed")
            ? "Invalid data type in database operation"
            : queryErr.message,
        });
      }
    });
  } catch (error) {
    logError("Unexpected error", error);
    return res.status(500).json({
      success,
      message: "Unexpected server error",
      details: error.message,
    });
  }
};

export const deleteFile = (req, res) => {
  const { fileId } = req.body;

  // Input validation
  if (!fileId || isNaN(fileId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file ID provided",
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success: false,
          message: "Database connection error",
        });
      }

      try {
        await queryAsync(conn, "BEGIN TRANSACTION");

        // Check if file exists and isn't deleted
        const checkQuery = `
                    SELECT * FROM FilesDetails 
                    WHERE FileID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;
        const [existingFile] = await queryAsync(conn, checkQuery, [fileId]);

        if (!existingFile) {
          await queryAsync(conn, "ROLLBACK TRANSACTION");
          closeConnection(conn);
          return res.status(404).json({
            success: false,
            message: "File not found or already deleted",
          });
        }

        // Get the unit ID before deleting
        const unitId = existingFile.UnitID;

        // Perform the soft delete
        const deleteQuery = `
                    UPDATE FilesDetails
                    SET 
                        delStatus = 1,
                        delOnDt = GETDATE(),
                        AddDel = ?
                    WHERE FileID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;

        const adminId = req.user?.id; // Get current user ID
        await queryAsync(conn, deleteQuery, [adminId, fileId]);

        // Count remaining active files in the unit
        const countQuery = `
                    SELECT COUNT(*) as remainingCount 
                    FROM FilesDetails 
                    WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;
        const [countResult] = await queryAsync(conn, countQuery, [unitId]);

        // Update percentages if files remain
        if (countResult.remainingCount > 0) {
          const newPercentage = (100 / countResult.remainingCount).toFixed(2);

          await queryAsync(
            conn,
            `UPDATE FilesDetails 
                         SET Percentage = ?
                         WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)`,
            [newPercentage, unitId]
          );
        }

        await queryAsync(conn, "COMMIT TRANSACTION");
        closeConnection(conn);

        return res.status(200).json({
          success: true,
          data: {
            fileId: fileId,
            deletedAt: new Date().toISOString(),
            deletedBy: adminId,
            fileName: existingFile.FilesName,
            unitId: unitId,
            remainingFiles: countResult.remainingCount,
            newPercentage:
              countResult.remainingCount > 0
                ? (100 / countResult.remainingCount).toFixed(2)
                : 0,
          },
          message: "File deleted successfully",
        });
      } catch (error) {
        await queryAsync(conn, "ROLLBACK TRANSACTION");
        closeConnection(conn);
        logError(`Error deleting file: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: "Database error during deletion",
          details: error.message,
        });
      }
    });
  } catch (outerError) {
    logError(`Unexpected error: ${outerError.message}`);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error",
      details: outerError.message,
    });
  }
};

export const deleteMultipleFiles = (req, res) => {
  const { fileIds } = req.body;
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid file IDs provided - must be a non-empty array",
    });
  }
  const invalidIds = fileIds.filter((id) => isNaN(id));
  if (invalidIds.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid file IDs found: ${invalidIds.join(", ")}`,
      invalidIds,
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success: false,
          message: "Database connection error",
        });
      }

      try {
        await queryAsync(conn, "BEGIN TRANSACTION");

        const adminId = req.user?.id;
        const currentTime = new Date().toISOString();
        const placeholders = fileIds.map(() => "?").join(", ");
        const checkQuery = `
            SELECT FileID, UnitID, FilesName 
            FROM FilesDetails 
            WHERE FileID IN (${placeholders}) AND (delStatus IS NULL OR delStatus = 0)
          `;
        const existingFiles = await queryAsync(conn, checkQuery, fileIds);

        if (existingFiles.length === 0) {
          await queryAsync(conn, "ROLLBACK TRANSACTION");
          closeConnection(conn);
          return res.status(404).json({
            success: false,
            message: "No valid files found to delete",
          });
        }

        const validFileIds = existingFiles.map((file) => file.FileID);
        const unitIds = [...new Set(existingFiles.map((file) => file.UnitID))]; // Get unique unit IDs

        const validPlaceholders = validFileIds.map(() => "?").join(", ");
        const deleteQuery = `
          UPDATE FilesDetails
          SET 
            delStatus = 1,
            delOnDt = ?,
            AddDel = ?
          WHERE FileID IN (${validPlaceholders})
        `;
        await queryAsync(conn, deleteQuery, [
          currentTime,
          adminId,
          ...validFileIds,
        ]);

        const results = {};

        for (const unitId of unitIds) {
          const countQuery = `
            SELECT COUNT(*) as remainingCount 
            FROM FilesDetails 
            WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)
          `;
          const [countResult] = await queryAsync(conn, countQuery, [unitId]);

          // Update percentages if files remain
          if (countResult.remainingCount > 0) {
            const newPercentage = (100 / countResult.remainingCount).toFixed(2);
            await queryAsync(
              conn,
              `UPDATE FilesDetails 
               SET Percentage = ?
               WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)`,
              [newPercentage, unitId]
            );
          }

          results[unitId] = {
            remainingCount: countResult.remainingCount,
            newPercentage:
              countResult.remainingCount > 0
                ? (100 / countResult.remainingCount).toFixed(2)
                : 0,
          };
        }

        await queryAsync(conn, "COMMIT TRANSACTION");
        closeConnection(conn);

        return res.status(200).json({
          success: true,
          data: {
            deletedFileIds: validFileIds,
            deletedAt: currentTime,
            deletedBy: adminId,
            unitResults: results,
            notFoundIds: fileIds.filter((id) => !validFileIds.includes(id)),
          },

          message: `Successfully deleted ${validFileIds.length} file(s)`,
        });
      } catch (error) {
        await queryAsync(conn, "ROLLBACK TRANSACTION");
        closeConnection(conn);
        logError(`Error deleting multiple files: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: "Database error during bulk deletion",
          details: error.message,
        });
      }
    });
  } catch (outerError) {
    logError(`Unexpected error: ${outerError.message}`);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error during bulk deletion",
      details: outerError.message,
    });
  }
};

export const addUnit = async (req, res) => {
  console.log("Incoming request body", req.body);
  let success = false;
  const userId = req.user?.id || req.user?.UserID;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const { UnitName, UnitDescription, SubModuleID } = req.body;

    if (!SubModuleID) {
      return res.status(400).json({
        success: false,
        message: "SubModuleID is required",
      });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database connection failed",
        });
      }

      try {
        // Get user details
        let userRows;
        if (!isNaN(Number(userId))) {
          userRows = await queryAsync(
            conn,
            `SELECT UserID, Name FROM Community_User 
                         WHERE ISNULL(delStatus,0) = 0 AND UserID = ?`,
            [Number(userId)]
          );
        }

        if (
          (!userRows || userRows.length === 0) &&
          typeof userId === "string" &&
          userId.includes("@")
        ) {
          userRows = await queryAsync(
            conn,
            `SELECT UserID, Name FROM Community_User 
                         WHERE ISNULL(delStatus,0) = 0 AND EmailId = ?`,
            [userId]
          );
        }

        if (!userRows || userRows.length === 0) {
          closeConnection(conn);
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // Start transaction
        await queryAsync(conn, "BEGIN TRANSACTION");

        // Insert new unit
        const insertQuery = `
                    INSERT INTO UnitsDetails 
                    (UnitName, UnitDescription, SubModuleID, AuthAdd, AddOnDt, delStatus) 
                    OUTPUT INSERTED.UnitID, INSERTED.UnitName, INSERTED.UnitDescription,
                           INSERTED.SubModuleID, INSERTED.AuthAdd, INSERTED.AddOnDt
                    VALUES (?, ?, ?, ?, GETDATE(), 0);
                `;

        const [newUnit] = await queryAsync(conn, insertQuery, [
          UnitName,
          UnitDescription || null,
          SubModuleID,
          userRows[0].Name,
        ]);

        // Commit transaction
        await queryAsync(conn, "COMMIT TRANSACTION");
        closeConnection(conn);

        return res.status(200).json({
          success: true,
          UnitID: newUnit.UnitID,
          data: newUnit,
          message: "Unit added successfully",
        });
      } catch (queryErr) {
        await queryAsync(conn, "ROLLBACK TRANSACTION");
        closeConnection(conn);
        console.error("Database Error:", queryErr);
        return res.status(500).json({
          success: false,
          message: "Failed to add unit",
        });
      }
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*-----------------------progress api -------------------------*/

export const recordFileView = async (req, res) => {
  try {
    const userEmail = req.user?.id; // assuming req.user.id contains email
    const { FileID } = req.body;

    const result = await recordFileViewService(userEmail, FileID);

    return res
      .status(result.status || 200)
      .json({ success: result.success, message: result.message });
  } catch (error) {
    console.error("Unexpected error in recordFileView controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateFile = async (req, res) => {
  console.log("incoming req body", req.body);
  let success = false;

  const userId = req.user?.UserID || req.user?.id;
  console.log(userId);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    logWarning(warningMessage);
    return res.status(400).json({
      success,
      data: errors.array(),
      message: warningMessage
    });
  }

  try {
    const { fileId, fileName, description, link, estimatedTime } = req.body;

    if (!fileId) {
      const warningMessage = "File ID is required";
      logWarning(warningMessage);
      return res.status(400).json({
        success,
        message: warningMessage
      });
    }

    // Call the service
    const result = await updateFileService(userId, fileId, {
      fileName,
      description,
      link,
      estimatedTime
    });

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again"
    });
  }
};

export const updateFileViewEndTime = async (req, res) => {
  try {
    const userEmail = req.user?.id;
    const { FileID } = req.body;

    const result = await updateFileViewEndTimeService(userEmail, FileID);

    return res
      .status(result.status || 200)
      .json({ success: result.success, message: result.message });
  } catch (error) {
    console.error("Unexpected error in updateFileViewEndTime controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};