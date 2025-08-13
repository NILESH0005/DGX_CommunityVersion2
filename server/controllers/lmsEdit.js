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

dotenv.config();

export const updateModule = async (req, res) => {
  let success = false;

  // ✅ 1. Authentication check
  const userId = req.user?.UserID || req.user?.id;
  if (!userId) {
    return res.status(401).json({ success, message: "User not authenticated" });
  }

  // ✅ 2. Validate module ID
  const moduleId = parseInt(req.params.id, 10);
  if (isNaN(moduleId)) {
    return res.status(400).json({ success, message: "Invalid module ID" });
  }

  // ✅ 3. Extract payload
  const {
    ModuleName,
    ModuleDescription,
    ModuleImagePath, // <-- New Image (if provided)
    SortingOrder,
  } = req.body;

  if (!ModuleName || !ModuleDescription) {
    return res.status(400).json({
      success,
      message: "ModuleName and ModuleDescription are required",
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError("Database connection failed", err);
        return res.status(500).json({
          success,
          message: "Database connection error",
        });
      }

      try {
        // ✅ 4. Get user details
        let userQuery, userRows;

        if (!isNaN(Number(userId))) {
          userQuery = `
            SELECT UserID, Name, isAdmin FROM Community_User 
            WHERE ISNULL(delStatus, 0) = 0 AND UserID = ?
          `;
          userRows = await queryAsync(conn, userQuery, [Number(userId)]);
        }

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

        // ✅ 5. If image is changing, move old one to deleted-files
        if (ModuleImagePath) {
          const oldImageQuery = `
            SELECT ModuleImagePath FROM ModulesDetails 
            WHERE ModuleID = ? AND ISNULL(delStatus, 0) = 0
          `;
          const [existingModule] = await queryAsync(conn, oldImageQuery, [
            moduleId,
          ]);

          if (
            existingModule &&
            existingModule.ModuleImagePath &&
            existingModule.ModuleImagePath !== ModuleImagePath
          ) {
            const oldImagePath = path.join(
              process.cwd(),
              existingModule.ModuleImagePath
            );

            if (fs.existsSync(oldImagePath)) {
              // ✅ Ensure deleted-files folder exists
              const deletedFolder = path.join(
                process.cwd(),
                "uploads/deleted-files"
              );
              if (!fs.existsSync(deletedFolder)) {
                fs.mkdirSync(deletedFolder, { recursive: true });
              }

              const oldFileName = path.basename(existingModule.ModuleImagePath);
              const newTrashPath = path.join(deletedFolder, oldFileName);

              // ✅ Move old file → deleted-files folder
              try {
                fs.renameSync(oldImagePath, newTrashPath);
                console.log(`Moved old image → ${newTrashPath}`);
              } catch (moveErr) {
                console.error("Failed to move old image:", moveErr);
              }
            }
          }
        }

        // ✅ 6. Build dynamic UPDATE query
        let updateFields = `
          ModuleName = ?,
          ModuleDescription = ?,
          AuthLstEdit = ?,
          editOnDt = ?
        `;
        let updateParams = [
          ModuleName,
          ModuleDescription,
          user.Name,
          new Date(),
        ];

        // ✅ If ModuleImagePath is provided, update it
        if (ModuleImagePath) {
          updateFields += `, ModuleImagePath = ?`;
          updateParams.push(ModuleImagePath);
        }

        // ✅ If SortingOrder is provided, update it
        if (SortingOrder !== undefined) {
          updateFields += `, SortingOrder = ?`;
          updateParams.push(SortingOrder);
        }

        const updateQuery = `
          UPDATE ModulesDetails
          SET ${updateFields}
          WHERE ModuleID = ? AND ISNULL(delStatus, 0) = 0
        `;
        updateParams.push(moduleId);

        // ✅ 7. Execute update
        const result = await queryAsync(conn, updateQuery, updateParams);

        if (result.affectedRows === 0) {
          closeConnection(conn);
          return res.status(404).json({
            success,
            message: "Module not found or already deleted",
          });
        }

        // ✅ 8. Fetch updated module
        const fetchQuery = `
          SELECT ModuleID, ModuleName, ModuleDescription,
                 ModuleImagePath, SortingOrder,
                 AuthLstEdit, editOnDt
          FROM ModulesDetails
          WHERE ModuleID = ? AND ISNULL(delStatus, 0) = 0
        `;
        const updatedModule = await queryAsync(conn, fetchQuery, [moduleId]);

        success = true;
        closeConnection(conn);

        return res.status(200).json({
          success,
          data: updatedModule[0],
          message: "Module updated successfully",
        });
      } catch (queryErr) {
        closeConnection(conn);
        logError("Database query failed", queryErr);
        return res.status(500).json({
          success,
          message: "Database operation failed",
          details: queryErr.message,
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

export const updateModuleOrder = async (req, res) => {
  let success = false;
  const { modules } = req.body;

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

        // Update each module's sorting order
        for (const module of modules) {
          const updateQuery = `
                        UPDATE ModulesDetails 
                        SET 
                            SortingOrder = ?,
                            editOnDt = CURRENT_TIMESTAMP
                        WHERE ModuleID = ?
                    `;
          await queryAsync(conn, updateQuery, [
            module.SortingOrder,
            module.ModuleID,
          ]);
        }

        await conn.commit();
        success = true;
        res.status(200).json({
          success,
          message: "Module order updated successfully",
        });
      } catch (queryErr) {
        await conn.rollback();
        logError(queryErr);
        res.status(500).json({
          success,
          message: "Error updating module order",
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

export const deleteModule = (req, res) => {
  const { moduleId } = req.body;

  if (!moduleId || isNaN(moduleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid module ID provided",
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Database connection error" });
      }

      try {
        const checkQuery = `
          SELECT ModuleImagePath FROM ModulesDetails 
          WHERE ModuleID = ? AND (delStatus IS NULL OR delStatus = 0)
        `;
        const [existingModule] = await queryAsync(conn, checkQuery, [moduleId]);

        if (!existingModule) {
          closeConnection(conn);
          return res.status(404).json({
            success: false,
            message: "Module not found or already deleted",
          });
        }

        if (existingModule.ModuleImagePath) {
          const originalPath = path.join(
            process.cwd(),
            existingModule.ModuleImagePath
          );

          if (fs.existsSync(originalPath)) {
            const deletedFolder = path.join(
              process.cwd(),
              "uploads/deleted-files/"
            );
            if (!fs.existsSync(deletedFolder)) {
              fs.mkdirSync(deletedFolder, { recursive: true });
            }

            const fileName = path.basename(existingModule.ModuleImagePath);
            const newPath = path.join(deletedFolder, fileName);
            fs.renameSync(originalPath, newPath);
          }
        }
        const deleteQuery = `
          UPDATE ModulesDetails
          SET delStatus = 1, delOnDt = GETDATE()
          WHERE ModuleID = ? AND (delStatus IS NULL OR delStatus = 0)
        `;
        const result = await queryAsync(conn, deleteQuery, [moduleId]);
        closeConnection(conn);

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Module not found or already deleted",
          });
        }

        return res.status(200).json({
          success: true,
          data: {
            moduleId,
            deletedAt: new Date().toISOString(),
            movedToTrash: true,
          },
          message: "Module soft-deleted & file moved to trash folder",
        });
      } catch (error) {
        closeConnection(conn);
        return res.status(500).json({
          success: false,
          message: `Error deleting module: ${error.message}`,
        });
      }
    });
  } catch (outerError) {
    return res.status(500).json({
      success: false,
      message: `Unexpected error: ${outerError.message}`,
    });
  }
};

export const deleteSubModule = (req, res) => {
  const { subModuleId } = req.body;

  // Input validation
  if (!subModuleId || isNaN(subModuleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid sub-module ID provided",
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
        // Check if sub-module exists and isn't deleted
        const checkQuery = `
                    SELECT * FROM SubModulesDetails 
                    WHERE SubModuleID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;
        const [existingSubModule] = await queryAsync(conn, checkQuery, [
          subModuleId,
        ]);

        if (!existingSubModule) {
          closeConnection(conn);
          return res.status(404).json({
            success: false,
            message: "Sub-module not found or already deleted",
          });
        }

        // Perform the soft delete
        const deleteQuery = `
                    UPDATE SubModulesDetails
                    SET 
                        delStatus = 1,
                        delOnDt = GETDATE(),
                        AddDel = ?
                    WHERE SubModuleID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;

        const adminId = req.user?.id; // Get current user ID
        await queryAsync(conn, deleteQuery, [adminId, subModuleId]);
        closeConnection(conn);

        return res.status(200).json({
          success: true,
          data: {
            subModuleId: subModuleId,
            deletedAt: new Date().toISOString(),
            deletedBy: adminId,
          },
          message: "Sub-module deleted successfully",
        });
      } catch (error) {
        closeConnection(conn);
        logError(`Error deleting sub-module: ${error.message}`);
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

export const updateSubModule = async (req, res) => {
  let success = false;

  // ✅ 1. Authentication check
  const userId = req.user?.UserID || req.user?.id;
  if (!userId) {
    return res.status(401).json({ success, message: "User not authenticated" });
  }

  // ✅ 2. Validate SubModule ID
  const subModuleId = parseInt(req.params.id, 10);
  if (isNaN(subModuleId)) {
    return res.status(400).json({ success, message: "Invalid SubModule ID" });
  }

  // ✅ 3. Extract payload
  const {
    SubModuleName,
    SubModuleDescription,
    SubModuleImagePath, // <-- New Image (if provided)
    SortingOrder,
  } = req.body;

  if (!SubModuleName || !SubModuleDescription) {
    return res.status(400).json({
      success,
      message: "SubModuleName and SubModuleDescription are required",
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError("Database connection failed", err);
        return res
          .status(500)
          .json({ success, message: "Database connection error" });
      }

      try {
        // ✅ 4. Get user details
        let userQuery, userRows;

        if (!isNaN(Number(userId))) {
          userQuery = `
            SELECT UserID, Name, isAdmin FROM Community_User 
            WHERE ISNULL(delStatus, 0) = 0 AND UserID = ?
          `;
          userRows = await queryAsync(conn, userQuery, [Number(userId)]);
        }

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

        // ✅ 5. If image is changing, move old one to deleted-files
        if (SubModuleImagePath) {
          const oldImageQuery = `
            SELECT SubModuleImagePath FROM SubModulesDetails 
            WHERE SubModuleID = ? AND ISNULL(delStatus, 0) = 0
          `;
          const [existingSubModule] = await queryAsync(conn, oldImageQuery, [
            subModuleId,
          ]);

          if (
            existingSubModule &&
            existingSubModule.SubModuleImagePath &&
            existingSubModule.SubModuleImagePath !== SubModuleImagePath
          ) {
            const oldImagePath = path.join(
              process.cwd(),
              existingSubModule.SubModuleImagePath
            );

            if (fs.existsSync(oldImagePath)) {
              // ✅ Ensure deleted-files folder exists
              const deletedFolder = path.join(
                process.cwd(),
                "uploads/deleted-files"
              );
              if (!fs.existsSync(deletedFolder)) {
                fs.mkdirSync(deletedFolder, { recursive: true });
              }

              const oldFileName = path.basename(
                existingSubModule.SubModuleImagePath
              );
              const newTrashPath = path.join(deletedFolder, oldFileName);

              // ✅ Move old file → deleted-files folder
              try {
                fs.renameSync(oldImagePath, newTrashPath);
                console.log(`Moved old submodule image → ${newTrashPath}`);
              } catch (moveErr) {
                console.error("Failed to move old submodule image:", moveErr);
              }
            }
          }
        }

        // ✅ 6. Build dynamic UPDATE query
        let updateFields = `
          SubModuleName = ?,
          SubModuleDescription = ?,
          AuthLstEdit = ?,
          editOnDt = ?
        `;
        let updateParams = [
          SubModuleName,
          SubModuleDescription,
          user.Name,
          new Date(),
        ];

        // ✅ If SubModuleImagePath is provided, update it
        if (SubModuleImagePath) {
          updateFields += `, SubModuleImagePath = ?`;
          updateParams.push(SubModuleImagePath);
        }

        // ✅ If SortingOrder is provided, update it
        if (SortingOrder !== undefined) {
          updateFields += `, SortingOrder = ?`;
          updateParams.push(SortingOrder);
        }

        // ✅ Final query
        const updateQuery = `
          UPDATE SubModulesDetails
          SET ${updateFields}
          WHERE SubModuleID = ? AND ISNULL(delStatus, 0) = 0
        `;
        updateParams.push(subModuleId);

        // ✅ 7. Execute update
        const result = await queryAsync(conn, updateQuery, updateParams);

        if (result.affectedRows === 0) {
          closeConnection(conn);
          return res.status(404).json({
            success,
            message: "SubModule not found or already deleted",
          });
        }

        // ✅ 8. Fetch updated submodule
        const fetchQuery = `
          SELECT SubModuleID, SubModuleName, SubModuleDescription,
                 SubModuleImagePath, SortingOrder,
                 AuthLstEdit, editOnDt
          FROM SubModulesDetails
          WHERE SubModuleID = ? AND ISNULL(delStatus, 0) = 0
        `;

        const updatedSubModule = await queryAsync(conn, fetchQuery, [
          subModuleId,
        ]);

        success = true;
        closeConnection(conn);

        return res.status(200).json({
          success,
          data: updatedSubModule[0],
          message: "SubModule updated successfully",
        });
      } catch (queryErr) {
        closeConnection(conn);
        logError("Database query failed", queryErr);
        return res.status(500).json({
          success,
          message: "Database operation failed",
          details: queryErr.message,
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
    const { SubModuleName, SubModuleDescription, ModuleID, SubModuleImagePath } = req.body;
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
                        AuthLstEdit = ?,
                        editOnDt = ?
                    WHERE UnitID = ? AND ISNULL(delStatus, 0) = 0
                `;

        const updateParams = [
          UnitName || null,
          UnitDescription || null,
          user.Name, // AuthLstEdit
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
                        AuthLstEdit, 
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
        const placeholders = fileIds.map(() => '?').join(', ');
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

        const validPlaceholders = validFileIds.map(() => '?').join(', ');
        const deleteQuery = `
          UPDATE FilesDetails
          SET 
            delStatus = 1,
            delOnDt = ?,
            AddDel = ?
          WHERE FileID IN (${validPlaceholders})
        `;
        await queryAsync(conn, deleteQuery, [currentTime, adminId, ...validFileIds]);

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
  console.log("Incoming file view request");
  var success = false;
  var infoMessage = "";
  const userId = req.user.id;

  try {
    const { FileID } = req.body;

    if (!FileID) {
      const warningMessage = "FileID is required";
      logWarning(warningMessage);
      return res.status(400).json({ success, message: warningMessage });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Database connection failed";
        logError(err);
        return res.status(500).json({ success: false, message: errorMessage });
      }

      try {
        // Get current user details
        const userQuery = `SELECT UserID, Name FROM Community_User 
                                 WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length === 0) {
          closeConnection(conn);
          const warningMessage = "User not found";
          logWarning(warningMessage);
          return res
            .status(404)
            .json({ success: false, message: warningMessage });
        }

        const user = userRows[0];

        // Check if THIS USER has already viewed THIS FILE
        const checkQuery = `SELECT UserID, FileID FROM UserLmsProgress 
                                  WHERE FileID = ? AND UserID = ? AND isnull(delStatus,0)=0`;
        const existingViews = await queryAsync(conn, checkQuery, [
          FileID,
          user.UserID,
        ]);

        if (existingViews.length > 0) {
          // This user has already viewed this file
          infoMessage = "File view already recorded for this user";
          success = true;
        } else {
          // Record new view for this user
          const insertQuery = `
                        INSERT INTO UserLmsProgress 
                        (UserID, FileID, AuthAdd, AddOnDt, delStatus) 
                        VALUES (?, ?, ?, GETDATE(), 0);
                    `;

          await queryAsync(conn, insertQuery, [user.UserID, FileID, user.Name]);
          success = true;
          infoMessage = "File view recorded successfully";
        }

        closeConnection(conn);
        logInfo(infoMessage);
        return res.status(200).json({
          success,
          message: infoMessage,
        });
      } catch (queryErr) {
        closeConnection(conn);
        console.error("Database Query Error:", queryErr);
        logError(queryErr);
        return res.status(500).json({
          success: false,
          message: "Failed to record file view",
        });
      }
    });
  } catch (error) {
    logError(error);
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
    res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  try {
    console.log(req.body);
    const { fileId, fileName, description, link } = req.body; // Extract fileId from body

    if (!fileId) {
      const warningMessage = "File ID is required";
      logWarning(warningMessage);
      res.status(400).json({ success, message: warningMessage });
      return;
    }

    // Connect to the database
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        res
          .status(500)
          .json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        // Get user details (same as before)
        let userQuery, userRows;
        if (!isNaN(Number(userId))) {
          userQuery = `SELECT UserID, Name FROM Community_User WHERE isnull(delStatus,0) = 0 AND UserID = ?`;
          userRows = await queryAsync(conn, userQuery, [Number(userId)]);
        }

        if (
          (!userRows || userRows.length === 0) &&
          typeof userId === "string" &&
          userId.includes("@")
        ) {
          userQuery = `SELECT UserID, Name FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
          userRows = await queryAsync(conn, userQuery, [userId]);
        }

        if (!userRows || userRows.length === 0) {
          closeConnection();
          const warningMessage = "User not found - please login first";
          logWarning(warningMessage);
          res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
          return;
        }

        const user = userRows[0];

        // Get current file details to determine type
        const getFileQuery = `SELECT FileType FROM FilesDetails WHERE FileID = ? AND ISNULL(delStatus, 0) = 0`;
        const fileRows = await queryAsync(conn, getFileQuery, [fileId]); // Use fileId from body

        if (!fileRows || fileRows.length === 0) {
          closeConnection();
          const warningMessage = "File not found or already deleted";
          logWarning(warningMessage);
          res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
          return;
        }

        const fileType = fileRows[0].FileType;

        // Build update query based on file type
        let updateQuery, updateParams;
        if (fileType === "link") {
          updateQuery = `
            UPDATE FilesDetails
            SET 
              FilesName = ?,
              Description = ?,
              FilePath = ?,
              AuthLstEdit = ?,
              editOnDt = GETDATE()
            WHERE FileID = ? AND ISNULL(delStatus, 0) = 0
          `;
          updateParams = [
            fileName ?? null,
            description ?? null,
            link ?? null,
            user.Name,
            fileId, // Use fileId from body
          ];
        } else {
          updateQuery = `
            UPDATE FilesDetails
            SET 
              FilesName = ?,
              Description = ?,
              AuthLstEdit = ?,
              editOnDt = GETDATE()
            WHERE FileID = ? AND ISNULL(delStatus, 0) = 0
          `;
          updateParams = [
            fileName ?? null,
            description ?? null,
            user.Name,
            fileId, // Use fileId from body
          ];
        }

        // Execute update
        const result = await queryAsync(conn, updateQuery, updateParams);

        if (result.affectedRows === 0) {
          closeConnection();
          const warningMessage =
            "File not updated - may not exist or already deleted";
          logWarning(warningMessage);
          res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
          return;
        }

        // Get updated file details
        const fetchQuery = `
          SELECT 
            FileID,
            FilesName,
            FilePath,
            FileType,
            Description,
            AuthLstEdit, 
            editOnDt
          FROM FilesDetails
          WHERE FileID = ? AND ISNULL(delStatus, 0) = 0
        `;
        const updatedFile = await queryAsync(conn, fetchQuery, [fileId]);

        success = true;
        closeConnection();
        const infoMessage = "File updated successfully";
        logInfo(infoMessage);
        res.status(200).json({
          success,
          data: updatedFile[0],
          message: infoMessage,
        });
        return;
      } catch (queryErr) {
        closeConnection();
        console.error("Database Query Error:", queryErr);
        logError(queryErr);
        res.status(500).json({
          success: false,
          data: queryErr,
          message: queryErr.message.includes("Conversion failed")
            ? "Invalid data type in database operation"
            : "Something went wrong please try again",
        });
        return;
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};
