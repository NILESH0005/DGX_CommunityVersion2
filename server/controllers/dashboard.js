import { validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import { logError, logInfo, logWarning, queryAsync } from "../helper/index.js";
import db from "../models/index.js";
import {
  getApprovalCountsService,
  getProcessCountsService,
  getTrendingBlogsService,
  getTrendingDiscussionService,
} from "../services/dashboardService.js";

export const getTrendingBlogs = async (req, res) => {
  try {
    const response = await getTrendingBlogsService();
    return res.status(200).json(response); // 👈 always 200 for success
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
    const response = await getTrendingDiscussionService();
    return res.status(200).json(response);
  } catch (error) {
    console.error("Trending Discussion Controller Error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error while fetching trending discussions",
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
