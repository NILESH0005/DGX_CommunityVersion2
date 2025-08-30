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
import { checkModuleExists, LMSService } from "../services/lmsService.js";

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
    try {
      const { ModuleName, ModuleImagePath, ModuleDescription, subModules } =
        req.body.module;
      const userName = req.user?.id || "system";

      const module = await LMSService.saveLearningMaterials(
        { ModuleName, ModuleImagePath, ModuleDescription, subModules },
        userName
      );

      res.status(201).json({
        success: true,
        message: "Learning materials saved successfully",
        moduleId: module.ModuleID,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async saveFileOrLink(req, res) {
    try {
      const { unitId, link, fileName, fileType, description } = req.body;
      const userName = req.user?.id;

      if (!unitId) {
        return res
          .status(400)
          .json({ success: false, message: "Unit ID is required" });
      }

      let fileData;
      if (req.file) {
        fileData = {
          FilesName: req.file.originalname,
          FilePath: `/uploads/${req.file.filename}`,
          FileType: req.file.mimetype,
          Description: description,
        };
      } else if (link) {
        fileData = {
          FilesName: fileName,
          FilePath: link,
          FileType: fileType || "link",
          Description: description,
        };
      } else {
        return res
          .status(400)
          .json({ success: false, message: "File or link required" });
      }

      const newFile = await LMSService.saveFileOrLink(
        unitId,
        userName,
        fileData
      );

      res
        .status(201)
        .json({ success: true, message: "Saved successfully", data: newFile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async uploadUpdatedFile(req, res) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      const { unitId, description, sortingOrder } = req.body;
      const userName = req.user.id;

      const result = await LMSService.uploadUpdatedFile(
        unitId,
        userName,
        req.file,
        description,
        sortingOrder
      );

      res.status(201).json({
        success: true,
        message: "File uploaded and percentages updated",
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const checkModuleExist = async (req, res) => {
  try {
    const { moduleName } = req.body;

    if (!moduleName) {
      return res
        .status(400)
        .json({ success: false, message: "Module name is required" });
    }

    const result = await checkModuleExists(moduleName);

    return res.json(result);
  } catch (error) {
    console.error("Error checking module:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
