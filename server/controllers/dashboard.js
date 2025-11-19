import { validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import { logError, logInfo, logWarning, queryAsync } from "../helper/index.js";
import db from "../models/index.js";
import { getTrendingBlogsService } from "../services/dashboardService.js";

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
