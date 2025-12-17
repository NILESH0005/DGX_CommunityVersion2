import { validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import { logError, logInfo, logWarning, queryAsync } from "../helper/index.js";
import db from "../models/index.js";
import {
  getApprovalCountsService,
  getDeviceAnalyticsService,
  getMostActiveUsersService,
  getProcessCountsService,
  getTrendingBlogsService,
  getTrendingDiscussionService,
} from "../services/dashboardService.js";

export const getTrendingBlogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          data: null,
          message: "Invalid date format. Please use YYYY-MM-DD format.",
        });
      }

      if (start > end) {
        return res.status(400).json({
          success: false,
          data: null,
          message: "Start date cannot be after end date.",
        });
      }
    }

    const response = await getTrendingBlogsService(startDate, endDate);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Blog Trending Controller Error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error while fetching trending blogs",
    });
  }
};

export const getTrendingDiscussion = async (req, res) => {
  try {
    // Extract query parameters
    const { startDate, endDate } = req.query;

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          data: null,
          message: "Invalid date format. Please use YYYY-MM-DD format.",
        });
      }

      if (start > end) {
        return res.status(400).json({
          success: false,
          data: null,
          message: "Start date cannot be after end date.",
        });
      }
    }

    const response = await getTrendingDiscussionService(startDate, endDate);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Trending Discussion Controller Error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message:
        error?.original?.sqlMessage || // MySQL error
        error?.message || // Sequelize / JS error
        "Internal server error",
      errorName: error?.name || null,
      sqlState: error?.original?.sqlState || null,
      sql: error?.sql || null, // ⚠️ remove in prod
      parameters: error?.parameters || null, // ⚠️ remove in prod
    });
  }
};

export const getApprovalCounts = async (req, res) => {
  try {
    const response = await getApprovalCountsService();

    if (!response.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch approval counts",
      });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Approval Counts Controller Error:", error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error while fetching approval counts",
    });
  }
};

export const getProcessCounts = async (req, res) => {
  try {
    const response = await getProcessCountsService();
    return res.status(200).json(response);
  } catch (error) {
    console.error("Process Count Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching process counts",
    });
  }
};

export const getDeviceAnalytics = async (req, res) => {
  try {
    const response = await getDeviceAnalyticsService();
    return res.status(200).json(response);
  } catch (error) {
    console.error("Device Analytics Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal error while fetching device analytics",
    });
  }
};

export const getMostActiveUsers = async (req, res) => {
  try {
    const response = await getMostActiveUsersService();
    return res.status(200).json(response);
  } catch (error) {
    console.error("Most Active Users Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal error while fetching most active users",
    });
  }
};
