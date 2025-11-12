import { fileURLToPath } from "url";
import { upload } from "../config/multerConfig.js";
import {
  checkModuleExists,
  getAllActiveFilesService,
  LMSService,
  getFileByIdService,
  LMSViewsService,
} from "../services/lmsService.js";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LMS {
  static upload = upload;

  static async uploadFile(req, res) {
    try {
      const { moduleId, subModuleId, unitId, type, url, description, isLink } =
        req.body;

      // Handle file upload
      if (type === "file" || !isLink) {
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, message: "No file uploaded" });
        }

        const savedPath = req.file.path.replace(/\\/g, "/");

        const fileData = {
          fileName: req.file.originalname,
          filePath: savedPath,
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
          ...fileData,
        });
      }

      // Handle link submission
      if (type === "link" || isLink) {
        if (!url) {
          return res
            .status(400)
            .json({ success: false, message: "URL is required for links" });
        }

        const linkData = {
          fileName: req.body.customFileName || "Link",
          filePath: url,
          fileSize: 0,
          mimeType: "link",
          moduleId,
          subModuleId,
          unitId,
          uploadedBy: req.user?.id || "system",
          description: description || "",
        };

        return res.status(201).json({
          success: true,
          message: "Link added successfully",
          ...linkData,
        });
      }

      return res
        .status(400)
        .json({ success: false, message: "Invalid request type" });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Upload failed",
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
      const { unitId, link, fileName, fileType, description, estimatedTime } =
        req.body;
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
          EstimatedTime: estimatedTime || 0,
        };
      } else if (link) {
        fileData = {
          FilesName: fileName,
          FilePath: link,
          FileType: fileType || "link",
          Description: description,
          EstimatedTime: estimatedTime || 0,
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

      const { unitId, description, sortingOrder, estimatedTime } = req.body;
      const userName = req.user.id;

      const result = await LMSService.uploadUpdatedFile(
        unitId,
        userName,
        req.file,
        description,
        sortingOrder,
        estimatedTime
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

export const getSubModuleViews = async (req, res) => {
  try {
    const result = await LMSViewsService.getSubModuleViews();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching submodule views:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModuleViews = async (req, res) => {
  try {
    const result = await LMSViewsService.getModuleViews();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching module views:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllActiveFiles = async (req, res) => {
  try {
    const result = await getAllActiveFilesService();
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // ✅ Dynamically detect host
    const protocol = req.protocol; // http or https
    const host = req.get("host"); // e.g. localhost:5000 or your-domain.com
    const BASE_URL = `${protocol}://${host}`;

    const updatedResults = result.data.map((file) => {
      if (file.FileType === "link" || file.FilePath?.startsWith("http")) {
        return file;
      }

      const normalizedPath = file.FilePath.replace(/^\/+/, "");
      return {
        ...file,
        FileURL: `${BASE_URL}/${normalizedPath}`,
      };
    });

    return res.status(200).json({
      success: true,
      data: updatedResults,
    });
  } catch (error) {
    console.error("Controller Error (getAllActiveFiles):", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching files",
    });
  }
};

export const getFileById = async (req, res) => {
  try {
    const { FileID } = req.body;

    if (!FileID) {
      return res.status(400).json({
        success: false,
        message: "FileID is required in the request body",
      });
    }

    const result = await getFileByIdService(FileID);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    const file = result.data;

    // If it's a link, redirect to the external URL
    if (file.FileType === "link" || file.FilePath?.startsWith("http")) {
      return res.redirect(file.FilePath);
    }

    // For local files - resolve the correct path
    // Since your files are stored directly in uploads folder
    let filePath;

    if (file.FilePath.includes("/") || file.FilePath.includes("\\")) {
      // If path contains slashes, use it as is
      filePath = path.join(process.cwd(), "uploads", file.FilePath);
    } else {
      // If it's just a filename, look directly in uploads folder
      filePath = path.join(process.cwd(), "uploads", file.FilePath);
    }

    console.log("Looking for file at:", filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log("File not found at path:", filePath);

      // Try to find the file in different locations
      const possiblePaths = [
        path.join(process.cwd(), "uploads", file.FilePath), // Direct in uploads
        path.join(process.cwd(), "server", "uploads", file.FilePath), // If running from root
        path.join(__dirname, "..", "uploads", file.FilePath), // Relative to controller
        path.join(process.cwd(), file.FilePath), // Absolute from project root
        file.FilePath, // Raw path
      ];

      let foundPath = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          foundPath = possiblePath;
          console.log("Found file at:", foundPath);
          break;
        }
      }

      if (!foundPath) {
        return res.status(404).json({
          success: false,
          message: "File not found on server",
          debug: {
            fileName: file.FilesName,
            filePathFromDB: file.FilePath,
            searchedPaths: possiblePaths,
          },
        });
      }

      filePath = foundPath;
    }

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.FilesName}"`
    );

    // Determine content type based on file extension
    const ext = path.extname(file.FilesName).toLowerCase();
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".ppt": "application/vnd.ms-powerpoint",
      ".pptx":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ".zip": "application/zip",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    console.log("Downloading file:", filePath);
    // Send the file for download
    return res.sendFile(filePath);
  } catch (error) {
    console.error("Controller Error (getFileById):", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching file details",
    });
  }
};

export const downloadFileById = async (req, res) => {
  try {
    const { FileID } = req.params;

    if (!FileID) {
      return res
        .status(400)
        .json({ success: false, message: "FileID is required" });
    }

    const result = await getFileByIdService(FileID);

    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    const fileData = result.data[0]; // <--- fix: get first item

    if (!fileData.FilePath) {
      return res
        .status(404)
        .json({ success: false, message: "File path is missing on server" });
    }

    // External links
    if (fileData.FileType === "link" || fileData.FilePath.startsWith("http")) {
      return res.redirect(fileData.FilePath);
    }

    const filePath = path.join(
      process.cwd(),
      fileData.FilePath.replace(/^\//, "")
    );
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "File not found on server" });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileData.FilesName}"`
    );
    res.setHeader(
      "Content-Type",
      fileData.FileType || "application/octet-stream"
    );

    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
