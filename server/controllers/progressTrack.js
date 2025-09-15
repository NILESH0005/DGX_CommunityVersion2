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
import { getModuleSubmoduleProgressService, getUserFileIDsService } from "../services/progressService.js";

dotenv.config();

export const getUserFileIDs = async (req, res) => {
  let success = false;
  const userEmail = req.user.id; // comes from auth middleware

  try {
    const { fileIds, totalCount } = await getUserFileIDsService(userEmail);

    success = true;
    return res.status(200).json({
      success,
      data: { fileIds, totalCount },
      message: "File IDs fetched successfully",
    });
  } catch (error) {
    console.error("Error in getUserFileIDs:", error.message);
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: [],
      });
    }
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      data: error.message,
    });
  }
};

export const getModuleSubmoduleProgress = async (req, res) => {
  const userEmail = req.user.id; // from auth middleware
  const { moduleID } = req.body;

  try {
    const result = await getModuleSubmoduleProgressService(userEmail, moduleID);
    return res.status(200).json({
      success: true,
      data: result,
      message: "Submodule progress fetched successfully",
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch submodule progress",
    });
  }
};
