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
import {
  getModuleSubmoduleProgressService,
  getUserFileIDsService,
  ViewService,
} from "../services/progressService.js";

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

export const recordView = async (req, res) => {
  try {
    const userEmail = req.user?.id;
    const viewData = req.body;

    console.log("Record View - User email:", userEmail);
    console.log("Record View - View data:", viewData);

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User not logged in",
      });
    }

    if (!viewData.ProcessName || !viewData.reference) {
      return res.status(400).json({
        success: false,
        message: "ProcessName and reference are required",
      });
    }

    // You can either call the ViewService here or implement the logic directly
    const result = await ViewService.handleViewAction(userEmail, viewData);

    return res.status(200).json(result);
  } catch (err) {
    console.error("Record View Controller Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while recording view",
    });
  }
};

export const getViewStatistics = async (req, res) => {
  try {
    const { ProcessName, reference } = req.query;

    if (!ProcessName || !reference) {
      return res.status(400).json({
        success: false,
        message: "ProcessName and reference are required",
      });
    }

    const result = await ViewService.getViewStats(
      ProcessName,
      parseInt(reference)
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Get View Statistics Controller Error:", err);
    return res.status(500).json({
      success: false,
      message:
        err.message || "Something went wrong while fetching view statistics",
    });
  }
};

export const getUserViewStatus = async (req, res) => {
  try {
    const userEmail = req.user?.id;
    const { ProcessName, reference } = req.query;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User not logged in",
      });
    }

    if (!ProcessName || !reference) {
      return res.status(400).json({
        success: false,
        message: "ProcessName and reference are required",
      });
    }

    const result = await ViewService.checkUserViewStatus(
      userEmail,
      ProcessName,
      parseInt(reference)
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Get User View Status Controller Error:", err);
    return res.status(500).json({
      success: false,
      message:
        err.message || "Something went wrong while checking user view status",
    });
  }
};
