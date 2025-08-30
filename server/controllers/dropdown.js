// import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import { queryAsync, logError, logInfo } from "../helper/index.js";
import {
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
  let success = false;
  const { subModuleId } = req.params;

  try {
    const result = await getUnitsWithFilesService(subModuleId);

    success = true;
    return res.status(200).json(result);
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({
      success,
      message: "Unexpected error occurred",
      data: error.message,
    });
  }
};
