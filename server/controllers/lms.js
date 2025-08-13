import { upload } from "../config/multerConfig.js";
import {
  queryAsync,
  mailSender,
  logError,
  logInfo,
  logWarning,
} from "../helper/index.js";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import { log } from "console";
import path from "path";

export class LMS {
  static upload = upload;

  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      const { moduleId, subModuleId, unitId } = req.body;

      // ✅ Multer already saved in the correct folder
      // req.file.path is the actual saved path (e.g. uploads/LMS/module-banners/file.jpg)
      const savedPath = req.file.path.replace(/\\/g, "/"); // fix Windows slashes
      console.log(req);
      

      const fileData = {
        fileName: req.file.originalname,
        filePath: savedPath, // ✅ real path, no need to rebuild manually
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        moduleId,
        subModuleId,
        unitId,
        uploadedBy: req.user?.id || "system",
      };

      return res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        ...fileData, // spread so response matches your frontend expectations
      });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "File upload failed",
      });
    }
  }

  static async getSubModules(req, res) {
    try {
      // Your existing sub-modules logic
      const subModules = []; // Fetch from database
      res.json({ success: true, subModules });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUnits(req, res) {
    try {
      // Your existing units logic
      const units = []; // Fetch from database
      res.json({ success: true, units });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async saveLearningMaterials(req, res) {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields in request body",
        data: req.body,
      });
    }

    const { ModuleName, ModuleImage, ModuleDescription, subModules } =
      req.body.module;

    const userEmail = req.user.id;

    const currentDateTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    let conn;

    try {
      conn = await new Promise((resolve, reject) => {
        connectToDatabase((err, connection) => {
          if (err) {
            console.error("Database connection error:", err);
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });

      await queryAsync(conn, "BEGIN TRANSACTION");

      const userQuery = `
      SELECT UserID, Name, isAdmin 
      FROM Community_User 
      WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?
    `;
      const userRows = await queryAsync(conn, userQuery, [userEmail]);

      if (userRows.length === 0) {
        throw new Error("User not found, please login first.");
      }
      const user = userRows[0];

      const moduleInsertQuery = `
        INSERT INTO ModulesDetails 
        (ModuleName,  ModuleImagePath, ModuleDescription, AuthAdd, AddOnDt, delStatus) 
        OUTPUT INSERTED.ModuleID
        VALUES (?, ?, ?, ?, ?, 0)
        `;
      console.log(req.body);

      const moduleResult = await queryAsync(conn, moduleInsertQuery, [
        ModuleName,
        req.body.module.ModuleImagePath?.filePath || null,
        ModuleDescription || null,
        user.Name,
        currentDateTime,
        0,
      ]);

      if (!moduleResult || moduleResult.length === 0) {
        throw new Error("Failed to insert module - no ID returned");
      }
      const moduleId = moduleResult[0].ModuleID;
      console.log("Success in Module Query : Module ID - ", moduleId);
      console.log("Submodule here :- ", subModules);

      for (const subModule of subModules) {
        const subModuleInsertQuery = `
        INSERT INTO SubModulesDetails 
            (SubModuleName,  SubModuleImagePath, SubModuleDescription, ModuleID, AuthAdd, AddOnDt, delStatus) 
            OUTPUT INSERTED.SubModuleID
            VALUES (?, ?, ?, ?, ?, ?, 0)
      `;
        const subModuleResult = await queryAsync(conn, subModuleInsertQuery, [
          subModule.SubModuleName,
          subModule.SubModuleImagePath?.filePath || null,
          subModule.SubModuleDescription || null,
          moduleId,
          user.Name,
          currentDateTime,
        ]);

        if (!subModuleResult || subModuleResult.length === 0) {
          throw new Error("Failed to insert submodule - no ID returned");
        }
        const subModuleId = subModuleResult[0].SubModuleID;
        console.log(
          "Success in submodule Query : sub Module ID - ",
          subModuleId
        );

        for (const unit of subModule.Units || []) {
          const unitInsertQuery = `
          INSERT INTO UnitsDetails 
          (UnitName, UnitImg, UnitDescription, SubModuleID, AuthAdd, AddOnDt, delStatus) 
          OUTPUT INSERTED.UnitID
          VALUES (?, ?, ?, ?, ?, ?, 0)
        `;
          const unitResult = await queryAsync(conn, unitInsertQuery, [
            unit.UnitName,
            unit.UnitImg ? Buffer.from(unit.UnitImg, "base64") : null,
            unit.UnitDescription || null,
            subModuleId,
            user.Name,
            currentDateTime,
          ]);

          if (!unitResult || unitResult.length === 0) {
            throw new Error("Failed to insert unit - no ID returned");
          }
          const unitId = unitResult[0].UnitID;

          // ✅ Fixed file insert logic (loop one-by-one)
          if (unit.Files && unit.Files.length > 0) {
            console.log("file data", unit.Files);

            for (const file of unit.Files) {
              const fileInsertQuery = `
              INSERT INTO FilesDetails 
              (FilesName, FilePath, FileType, UnitID, AuthAdd, AddOnDt, delStatus, Percentage) 
              VALUES (?, ?, ?, ?, ?, ?, 0, ?)
            `;
              await queryAsync(conn, fileInsertQuery, [
                file.customFileName || file.FilesName, // Use customFileName if available
                file.FilePath,
                file.FileType,
                unitId,
                user.Name,
                currentDateTime,
                file.Percentage || 0,
              ]);
              console.log("Success in unit Query ");
            }
          }
        }
      }

      await queryAsync(conn, "COMMIT TRANSACTION");

      return res.status(201).json({
        success: true,
        message: "Learning materials saved successfully",
        moduleId,
      });
    } catch (error) {
      console.error("Error saving learning materials:", error);

      if (conn) {
        await queryAsync(conn, "ROLLBACK TRANSACTION").catch((rbErr) =>
          console.error("Rollback failed:", rbErr)
        );
        conn.release?.();
      }

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to save learning materials",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      });
    }
  }

  static async saveFileOrLink(req, res) {
    // Parse percentage as decimal number
    let percentage = parseFloat(req.body.percentage) || 0;
    percentage = Math.min(100, Math.max(0, percentage)); // Ensure between 0-100

    const { unitId, link, fileName, fileType, description } = req.body;
    const userEmail = req.user?.id;

    if (!unitId) {
      return res.status(400).json({
        success: false,
        message: "Unit ID is required",
      });
    }

    let conn;
    try {
      conn = await new Promise((resolve, reject) => {
        connectToDatabase((err, connection) => {
          if (err) reject(err);
          else resolve(connection);
        });
      });

      await queryAsync(conn, "BEGIN TRANSACTION");

      // Get user details
      const userRows = await queryAsync(
        conn,
        `SELECT UserID, Name FROM Community_User WHERE EmailId = ? AND ISNULL(delStatus, 0) = 0`,
        [userEmail]
      );

      if (userRows.length === 0) {
        throw new Error("User not found, please login first.");
      }
      const user = userRows[0];

      const currentDateTime = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // First, count existing files to calculate new percentage
      const [countResult] = await queryAsync(
        conn,
        `SELECT COUNT(*) as fileCount FROM FilesDetails 
             WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)`,
        [unitId]
      );

      const totalFiles = countResult.fileCount + 1; // +1 for the new file
      const equalPercentage = (100 / totalFiles).toFixed(2);

      // Update all existing files' percentages
      await queryAsync(
        conn,
        `UPDATE FilesDetails 
             SET Percentage = ?
             WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)`,
        [equalPercentage, unitId]
      );

      // Handle file upload
      if (req.file) {
        const fileData = {
          FilesName: req.file.originalname,
          FilePath: `/uploads/${req.file.filename}`,
          FileType: req.file.mimetype,
          UnitID: unitId,
          AuthAdd: user.Name,
          AddOnDt: currentDateTime,
          delStatus: 0,
          Percentage: equalPercentage,
          Description: description || null,
        };

        await queryAsync(
          conn,
          `INSERT INTO FilesDetails 
                 (FilesName, FilePath, FileType, UnitID, AuthAdd, AddOnDt, delStatus, Percentage, Description)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          Object.values(fileData)
        );

        await queryAsync(conn, "COMMIT TRANSACTION");

        return res.status(201).json({
          success: true,
          message: "File uploaded and metadata saved",
          data: fileData,
        });
      }
      // Handle link (with nullable fields)
      else if (link) {
        const linkData = {
          FilesName: fileName || null,
          FilePath: link,
          FileType: fileType || "link" || null,
          UnitID: unitId,
          AuthAdd: user.Name,
          AddOnDt: currentDateTime,
          delStatus: 0,
          Percentage: equalPercentage,
          Description: description || null,
        };

        await queryAsync(
          conn,
          `INSERT INTO FilesDetails 
                 (FilesName, FilePath, FileType, UnitID, AuthAdd, AddOnDt, delStatus, Percentage, Description)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          Object.values(linkData)
        );

        await queryAsync(conn, "COMMIT TRANSACTION");

        return res.status(201).json({
          success: true,
          message: "Link saved successfully",
          data: linkData,
        });
      } else {
        await queryAsync(conn, "ROLLBACK TRANSACTION");
        return res.status(400).json({
          success: false,
          message: "Either a file or link must be provided",
        });
      }
    } catch (error) {
      if (conn) {
        await queryAsync(conn, "ROLLBACK TRANSACTION").catch((rbErr) =>
          console.error("Rollback failed:", rbErr)
        );
      }
      console.error("Database Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to save data",
      });
    } finally {
      if (conn) conn.release?.();
    }
  }

  static async uploadUpdatedFile(req, res) {
    let success = false;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success,
        message: "No file uploaded",
        data: {},
      });
    }

    const { unitId, description, sortingOrder } = req.body;

    try {
      connectToDatabase(async (err, conn) => {
        if (err) {
          logError(err);
          return res.status(500).json({
            success,
            message: "Failed to connect to database",
            data: err,
          });
        }

        try {
          // Get uploader name
          const userQuery = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
          const userResult = await queryAsync(conn, userQuery, [userId]);

          if (userResult.length === 0) {
            closeConnection();
            return res.status(401).json({
              success,
              message: "User not found. Please login.",
              data: {},
            });
          }

          const uploaderName = userResult[0].Name;

          // Step 1: Insert new file
          const insertQuery = `
            INSERT INTO FilesDetails (
              FilesName, FilePath, FileType, UnitID,
              AuthAdd, AddOnDt, delStatus, Description,
              SortingOrder
            ) VALUES (?, ?, ?, ?, ?, GETDATE(), ?, ?, ?)
          `;

          await queryAsync(conn, insertQuery, [
            file.originalname,
            `/uploads/${file.filename}`,
            file.mimetype,
            unitId,
            uploaderName,
            0,
            description || "",
            sortingOrder || 0,
          ]);

          // Step 2: Get all file IDs for this UnitID
          const filesQuery = `
            SELECT FileID FROM FilesDetails
            WHERE ISNULL(delStatus, 0) = 0 AND UnitID = ?
          `;
          const fileRows = await queryAsync(conn, filesQuery, [unitId]);

          const totalFiles = fileRows.length;
          const calculatedPercentage = parseFloat(
            (100 / totalFiles).toFixed(2)
          );

          // Step 3: Update percentage for all files under the unit
          const updateQuery = `
            UPDATE FilesDetails
            SET Percentage = ?
            WHERE FileID = ?
          `;

          for (const row of fileRows) {
            await queryAsync(conn, updateQuery, [
              calculatedPercentage,
              row.FileID,
            ]);
          }

          closeConnection();

          success = true;
          const message =
            "File uploaded and percentage updated for all unit files";
          logInfo(message);

          return res.status(201).json({
            success,
            message,
            data: {
              name: file.originalname,
              unitId,
              percentage: calculatedPercentage,
              uploadedBy: uploaderName,
            },
          });
        } catch (queryErr) {
          closeConnection();
          logError(queryErr);
          return res.status(500).json({
            success,
            message: "File uploaded, but percentage update failed",
            data: queryErr,
          });
        }
      });
    } catch (error) {
      logError(error);
      return res.status(500).json({
        success: false,
        message: "Unexpected error",
        data: error,
      });
    }
  }
}
