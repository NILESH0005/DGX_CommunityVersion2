// import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import { queryAsync, logError, logInfo } from "../helper/index.js";
import {
  getAdminModulesService,
  getBlogStatsService,
  getDiscussionStatsService,
  getDropdownValuesService,
  getModuleByIdService,
  getModulesService,
  getQuestionGroups,
  getQuizGroups,
  getSubModulesService,
  getUnitsWithFilesService,
} from "../services/dropdownService.js";
import { getQuizDropdownService } from "../services/quizService.js";

dotenv.config();

export const getDropdownValues = async (req, res) => {
  try {
    const { category } = req.query;

    const result = await getDropdownValuesService(category);

    if (!result.success) {
      logInfo(result.message);
      return res.status(404).json(result);
    }

    logInfo("Dropdown values fetched successfully");
    return res.status(200).json(result);
  } catch (error) {
    logError(error.message || "Unexpected error", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getQuizDropdown = async (req, res) => {
  try {
    const result = await getQuizDropdownService();

    if (!result.success) {
      logInfo(result.message);
      return res.status(404).json(result);
    }

    logInfo(result.message);
    return res.status(200).json(result);
  } catch (error) {
    logError(error); // log the error
    return res.status(500).json({
      success: false,
      message: error.message || "Unexpected error occurred",
    });
  }
};

export const getQuizGroupDropdown = async (req, res) => {
  try {
    const result = await getQuizGroups();

    if (!result.data || result.data.length === 0) {
      logInfo(result.message);
      return res.status(404).json({ success: false, message: result.message });
    }

    logInfo(result.message);
    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      data: error.message,
    });
  }
};

export const getQuestionGroupDropdown = async (req, res) => {
  try {
    const result = await getQuestionGroups();

    if (!result.data || result.data.length === 0) {
      logInfo(result.message);
      return res.status(404).json({ success: false, message: result.message });
    }

    logInfo(result.message);
    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      data: error.message,
    });
  }
};

export const getModuleById = async (req, res) => {
  const { moduleId } = req.query;

  if (!moduleId) {
    return res.status(400).json({
      success: false,
      message: "Module ID is required",
    });
  }

  try {
    const result = await getModuleByIdService(moduleId);

    if (!result.success) {
      logInfo(result.message);
      return res.status(404).json(result);
    }

    logInfo(result.message);
    return res.status(200).json(result);
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      data: error.message,
    });
  }
};

export const getModules = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const result = await getModulesService(baseUrl);

    if (!result.success) {
      logInfo(result.message);
      return res.status(404).json(result);
    }

    logInfo(result.message);
    return res.status(200).json(result);
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      data: error.message,
    });
  }
};

export const getAdminModules = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const loggedInUser = req.user; // 👈 from fetchUser middleware

    const result = await getAdminModulesService(baseUrl, loggedInUser);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      data: error.message,
    });
  }
};


export const getSubModules = async (req, res) => {
  let success = false;
  const { moduleId } = req.query;

  if (!moduleId) {
    return res.status(400).json({
      success,
      message: "moduleId is required",
    });
  }

  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const result = await getSubModulesService(moduleId, baseUrl);

    if (!result.success || result.data.length === 0) {
      logInfo(result.message);
      return res.status(404).json({
        success: false,
        message: "No submodules found",
      });
    }

    logInfo(result.message);
    return res.status(200).json(result);
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      data: error.message,
    });
  }
};

export const getUnitsWithFiles = async (req, res) => {
  const { subModuleId } = req.params;

  if (!req.user || !req.user.uniqueId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  const userId = req.user.uniqueId; // <-- numeric ID
  // const userEmail = req.user.id; // if you need email

  try {
    const result = await getUnitsWithFilesService(subModuleId, userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      data: error.message,
    });
  }
};

export const getDiscussionStats = async (req, res) => {
  try {
    const userId = req.user?.uniqueId; // from JWT

    const result = await getDiscussionStatsService(userId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch discussion stats",
    });
  }
};

export const getBlogStats = async (req, res) => {
  const result = await getBlogStatsService();
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
};
