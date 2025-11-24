import db from "../models/index.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";

const { ContentInteraction, CommunityBlog, User, CommunityEvents } = db;

export const getTrendingBlogsService = async () => {
  try {
    const processName = "Blog";
    const mainQuery = `
      SELECT 
        COUNT(ci.Likes) AS claps,
        COUNT(ci.Rating) AS ratingCount,
        COUNT(ci.View) AS viewCount,
        ci.reference,
        cb.title,
        cb.content,
        cb.AddOnDt,
        cb.Category,        -- ✅ NEW FIELD
        u.Name AS author,
        ci.ProcessName,

        (
          SELECT COUNT(*) 
          FROM Community_Blog r
          WHERE r.RepostID = cb.BlogID 
            AND IFNULL(r.delStatus, 0) = 0
        ) AS repostCount

      FROM Content_Interaction ci
      LEFT JOIN Community_Blog cb ON cb.BlogID = ci.Reference
      LEFT JOIN Community_User u ON u.UserID = cb.AuthAdd

      WHERE ci.ProcessName = :processName
        AND cb.RepostID IS NULL       
        AND IFNULL(ci.delStatus, 0) = 0
        AND IFNULL(cb.delStatus, 0) = 0
        AND IFNULL(u.delStatus, 0) = 0

      GROUP BY ci.reference
      ORDER BY claps DESC;
    `;

    const blogStats = await sequelize.query(mainQuery, {
      replacements: { processName },
      type: sequelize.QueryTypes.SELECT,
    });

    const ratingQuery = `
      SELECT 
        COUNT(reference) AS frqBlog,
        reference 
      FROM Content_Interaction
      WHERE ProcessName = :processName
        AND IFNULL(delStatus, 0) = 0
      GROUP BY reference;
    `;

    const ratingFreq = await sequelize.query(ratingQuery, {
      replacements: { processName },
      type: sequelize.QueryTypes.SELECT,
    });

    const ratingMap = {};
    ratingFreq.forEach((row) => {
      ratingMap[row.reference] = row.frqBlog;
    });

    const finalData = blogStats.map((b) => {
      const avgRating =
        b.ratingCount > 0
          ? (b.ratingCount / (ratingMap[b.reference] || 1)).toFixed(2)
          : "0.00";

      return {
        reference: b.reference,
        title: b.title,
        content: b.content,
        category: b.Category, // ✅ NEW FIELD
        author: b.author,
        addedOn: b.AddOnDt,
        claps: b.claps,
        ratings: b.ratingCount,
        avgRating,
        views: b.viewCount,
        repostCount: b.repostCount,
        processName: b.ProcessName,
      };
    });

    return {
      success: true,
      data: finalData,
      message: "Trending blogs fetched successfully",
    };
  } catch (error) {
    console.error("Blog Trending Service Error:", error);
    throw error;
  }
};

export const getTrendingDiscussionService = async () => {
  try {
    const processName = "Discussion";

    const query = `
      SELECT 
        COUNT(ci.Likes) AS likes,
        COUNT(ci.View) AS viewCount,
        ci.reference,
        cd.title,
        cd.content,
        cd.AddOnDt,
        u.Name AS author,
        ci.ProcessName,

        COUNT(cd1.DiscussionID) AS repostCount,
        COUNT(DISTINCT cd2.DiscussionID) AS commentCount

      FROM Content_Interaction ci
      LEFT JOIN community_discussions cd 
        ON cd.DiscussionID = ci.Reference

      LEFT JOIN Community_User u 
        ON cd.AuthAdd = u.UserID

      LEFT JOIN community_discussions cd1 
        ON cd.DiscussionID = cd1.RepostID
        
      LEFT JOIN community_discussions cd2 
        ON cd.DiscussionID = cd2.Reference

      WHERE 
        ci.ProcessName = :processName
        AND IFNULL(ci.delStatus, 0) = 0
        AND IFNULL(cd.delStatus, 0) = 0
        AND IFNULL(u.delStatus, 0) = 0
        AND cd.Content IS NOT NULL
        AND cd.Reference = 0

      GROUP BY ci.reference

      ORDER BY likes DESC;
    `;

    const discussionStats = await sequelize.query(query, {
      replacements: { processName },
      type: sequelize.QueryTypes.SELECT,
    });

    return {
      success: true,
      data: discussionStats,
      message: "Trending discussions fetched successfully",
    };
  } catch (error) {
    console.error("Trending Discussion Service Error:", error);
    throw error;
  }
};

export const getApprovalCountsService = async () => {
  try {
    const pendingBlogs = await CommunityBlog.count({
      where: {
        delStatus: { [Op.or]: [0, null] },
        Status: "Pending",
      },
    });

    const pendingEvents = await CommunityEvents.count({
      where: {
        delStatus: { [Op.or]: [0, null] },
        Status: "Pending",
      },
    });

    const pendingUsers = await User.count({
      where: {
        delStatus: { [Op.or]: [0, null] },
        FlagPasswordChange: 0,
      },
    });

    const totalPending = pendingBlogs + pendingEvents + pendingUsers;

    return {
      success: true,
      data: {
        pendingBlogs,
        pendingEvents,
        pendingUsers,
        totalPending,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching approval counts:", error);
    return {
      success: false,
      error,
    };
  }
};

export const getProcessCountsService = async () => {
  try {
    const query = `
      SELECT 
        ProcessName, 
        COUNT(View) AS viewCount
      FROM Content_Interaction
      WHERE IFNULL(delStatus, 0) = 0
      GROUP BY ProcessName;
    `;

    const result = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    return {
      success: true,
      data: result,
      message: "Process counts fetched successfully",
    };
  } catch (error) {
    console.error("Process Count Service Error:", error);
    throw error;
  }
};
