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
// import { log } from "util";
import { Console } from "console";
import fs from "fs";
import path from "path";
import {
  addSubmoduleService,
  addUnitService,
  deleteFileService,
  deleteModuleService,
  deleteSubModuleService,
  deleteUnitService,
  recordFileViewService,
  updateFileService,
  updateFileViewEndTimeService,
  updateModuleOrderService,
  updateModuleService,
  updateSubModuleService,
  updateUnitOrderService,
  updateUnitService,
} from "../services/lmsEditService.js";

dotenv.config();

export const updateModule = async (req, res) => {
  const userId = req.user?.UserID || req.user?.id;
  const moduleId = parseInt(req.params.id, 10);
  const { ModuleName, ModuleDescription, ModuleImagePath, SortingOrder } =
    req.body;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  if (isNaN(moduleId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid module ID" });
  }

  if (!ModuleName || !ModuleDescription) {
    return res.status(400).json({
      success: false,
      message: "ModuleName and ModuleDescription are required",
    });
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
  const userEmail = req.user?.EmailId || req.user?.email || req.user?.id;

  if (!moduleId || isNaN(moduleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid module ID provided",
    });
  }

  if (!userEmail) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  const result = await deleteModuleService(userEmail, moduleId);
  return res.status(result.status).json(result.response);
};

export const deleteSubModule = async (req, res) => {
  const { subModuleId } = req.body;
  const adminId = req.user?.uniqueId;

  if (!subModuleId || isNaN(subModuleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid sub-module ID provided",
    });
  }

  if (!adminId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  const result = await deleteSubModuleService(subModuleId, adminId);

  return res.status(result.status).json(result.response);
};

export const updateSubModule = async (req, res) => {
  const userEmail = req.user?.EmailId || req.user?.email || req.user?.id;
  const subModuleId = parseInt(req.params.id, 10);

  if (!userEmail) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  if (isNaN(subModuleId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid SubModule ID" });
  }

  const {
    SubModuleName,
    SubModuleDescription,
    SubModuleImagePath,
    SortingOrder,
  } = req.body;

  if (!SubModuleName || !SubModuleDescription) {
    return res.status(400).json({
      success: false,
      message: "SubModuleName and SubModuleDescription are required",
    });
  }

  const result = await updateSubModuleService(userEmail, subModuleId, {
    SubModuleName,
    SubModuleDescription,
    SubModuleImagePath,
    SortingOrder,
  });

  return res.status(result.status).json(result.response);
};

export const addSubmodule = async (req, res) => {
  console.log("Incoming request body:", req.body);

  try {
    const {
      SubModuleName,
      SubModuleDescription,
      ModuleID,
      SubModuleImagePath,
    } = req.body;
    const SubModuleImage = req.file;

    // ✅ Ensure compatibility: user might have either UserID or id
    const userId = req.user?.uniqueId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        data: {},
      });
    }

    if (!ModuleID) {
      return res.status(400).json({
        success: false,
        message: "ModuleID is required",
        data: {},
      });
    }

    const result = await addSubmoduleService({
      SubModuleName,
      SubModuleDescription,
      ModuleID,
      SubModuleImagePath,
      SubModuleImage,
      userId,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error adding submodule:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      data: {},
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

    const result = await addUnitService({
      UnitName,
      UnitDescription,
      SubModuleID,
      userId,
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      UnitID: result.data.UnitID,
      message: "Unit added successfully",
    });
  } catch (error) {
    console.error("Error in addUnit controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
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
  console.log("=== UPDATE UNIT ORDER ENDPOINT CALLED ===");
  console.log("Body:", JSON.stringify(req.body));

  const { units } = req.body;

  if (!Array.isArray(units) || units.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Units array is required and cannot be empty",
    });
  }

  const result = await updateUnitOrderService(units);
  return res.status(result.status).json(result.response);
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
            index + 1,
            file.Percentage || 0,
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

export const deleteUnit = async (req, res) => {
  const { unitId } = req.body;
  const userEmail = req.user?.EmailId || req.user?.email || req.user?.id;

  if (!unitId || isNaN(unitId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid unit ID provided",
    });
  }

  if (!userEmail) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  const result = await deleteUnitService(userEmail, unitId);
  return res.status(result.status).json(result.response);
};

export const updateUnit = async (req, res) => {
  const userEmail = req.user?.EmailId || req.user?.email || req.user?.id;
  const unitId = parseInt(req.params.id, 10);

  if (!userEmail) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  if (isNaN(unitId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid unit ID",
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logWarning("Data validation failed", errors.array());
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  const { UnitName, UnitDescription, UnitImagePath, UnitImg, SortingOrder } =
    req.body;

  const result = await updateUnitService(userEmail, unitId, {
    UnitName,
    UnitDescription,
    UnitImagePath,
    UnitImg,
    SortingOrder,
  });

  return res.status(result.status).json(result.response);
};

export const deleteFile = async (req, res) => {
  const { fileId } = req.body;
  const userEmail = req.user?.EmailId || req.user?.email || req.user?.id;

  if (!fileId || isNaN(fileId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file ID provided",
    });
  }

  if (!userEmail) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  const result = await deleteFileService(userEmail, fileId);
  return res.status(result.status).json(result.response);
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
        const unitIds = [...new Set(existingFiles.map((file) => file.UnitID))];

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

export const recordFileView = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { FileID } = req.body;

    const result = await recordFileViewService(userId, FileID);

    return res.status(result.status || 200).json({
      success: result.success,
      message: result.message,
      progressId: result.progressId,
    });
  } catch (error) {
    console.error("Unexpected error in recordFileView controller:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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
      message: warningMessage,
    });
  }

  try {
    const { fileId, fileName, description, link, estimatedTime } = req.body;

    if (!fileId) {
      const warningMessage = "File ID is required";
      logWarning(warningMessage);
      return res.status(400).json({
        success,
        message: warningMessage,
      });
    }
    const result = await updateFileService(userId, fileId, {
      fileName,
      description,
      link,
      estimatedTime,
    });

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};

export const updateFileViewEndTime = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { FileID } = req.body;

    const result = await updateFileViewEndTimeService(userId, FileID);

    return res
      .status(result.status || 200)
      .json({ success: result.success, message: result.message });
  } catch (error) {
    console.error(
      "Unexpected error in updateFileViewEndTime controller:",
      error
    );
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
