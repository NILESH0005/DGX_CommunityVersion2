import db from "../models/index.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";

const { CommunityBlog, User, CommunityEvents } = db;

export const getTrendingBlogsService = async (
  startDate = null,
  endDate = null
) => {
  try {
    const processName = "Blog";

    let dateCondition = "";
    const replacements = { processName };

    if (startDate && endDate) {
      dateCondition =
        "AND CAST(c.AddOnDt AS DATE) BETWEEN :startDate AND :endDate";
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }

    const mainQuery = `
      WITH UserFinalLikes AS (
          SELECT 
              c.reference,
              c.UserID,
              CAST(
                  SUBSTRING_INDEX(
                      GROUP_CONCAT(c.Likes ORDER BY c.AddOnDt DESC),
                      ',', 1
                  ) AS UNSIGNED
              ) AS final_like
          FROM Content_Interaction_Log c
          WHERE c.ProcessName = :processName
            AND IFNULL(c.delStatus, 0) = 0
            ${dateCondition}
          GROUP BY c.reference, c.UserID
      ),

      ReferenceLikes AS (
          SELECT 
              reference,
              SUM(final_like) AS LikeCount
          FROM UserFinalLikes
          GROUP BY reference
      ),

      ReferenceRepost AS (
          SELECT 
              c.reference,
              SUM(IFNULL(c.Repost, 0)) AS RepostCount
          FROM Content_Interaction_Log c
          WHERE c.ProcessName = :processName
            AND IFNULL(c.delStatus, 0) = 0
            ${dateCondition}
            AND c.Repost = 1
          GROUP BY c.reference
      ),

      ReferenceViews AS (
          SELECT 
              c.reference,
              SUM(IFNULL(c.View, 0)) AS ViewCount
          FROM Content_Interaction_Log c
          WHERE c.ProcessName = :processName
            AND IFNULL(c.delStatus, 0) = 0
            ${dateCondition}
            AND c.View = 1
          GROUP BY c.reference
      ),

      ReferenceRating AS (
          SELECT 
              c.reference,
              ROUND(AVG(c.Rating), 2) AS AvgRating,
              COUNT(c.Rating) AS RatingCount
          FROM Content_Interaction_Log c
          WHERE c.ProcessName = :processName
            AND IFNULL(c.delStatus, 0) = 0
            AND c.Rating > 0
            ${dateCondition}
          GROUP BY c.reference
      )

      SELECT 
          rl.reference,
          rl.LikeCount AS claps,
          IFNULL(rv.ViewCount, 0) AS viewCount,
          IFNULL(rr.RepostCount, 0) AS repostCount,
          IFNULL(rt.AvgRating, 0) AS avgRating,
          IFNULL(rt.RatingCount, 0) AS ratingCount,

          cb.title,
          cb.content,
          cb.Category,
          cb.AddOnDt,
          u.Name AS author

      FROM ReferenceLikes rl
      LEFT JOIN ReferenceViews rv ON rl.reference = rv.reference
      LEFT JOIN ReferenceRepost rr ON rl.reference = rr.reference
      LEFT JOIN ReferenceRating rt ON rl.reference = rt.reference

      LEFT JOIN Community_Blog cb ON cb.BlogID = rl.reference
      LEFT JOIN Community_User u ON u.UserID = cb.AuthAdd

      WHERE cb.RepostID IS NULL
        AND IFNULL(cb.delStatus, 0) = 0
        AND IFNULL(u.delStatus, 0) = 0

      ORDER BY rl.LikeCount DESC;
    `;

    const blogStats = await sequelize.query(mainQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    return {
      success: true,
      data: blogStats,
      message: "Trending blogs fetched successfully",
      filters: {
        processName,
        startDate,
        endDate,
      },
    };
  } catch (error) {
    console.error("Blog Trending Service Error:", error);
    throw error;
  }
};

// export const getTrendingDiscussionService = async (
//   startDate = null,
//   endDate = null
// ) => {
//   try {
//     const processName = "Discussion";

//     // Build WHERE conditions dynamically
//     let dateCondition = "";
//     const replacements = { processName };

//     if (startDate && endDate) {
//       dateCondition = "AND ci.AddOnDt BETWEEN :startDate AND :endDate";
//       replacements.startDate = startDate;
//       replacements.endDate = endDate;
//     }

//     const query = `
//       SELECT
//         SUM(ci.Likes = 1) AS likes,
//         COUNT(ci.View) AS viewCount,
//         ci.reference,
//         cd.title,
//         cd.content,
//         cd.AddOnDt,
//         u.Name AS author,
//         ci.ProcessName,
//         COUNT(cd1.DiscussionID) AS repostCount,
//         COUNT(DISTINCT cd2.DiscussionID) AS commentCount

//       FROM Content_Interaction_Log ci
//       LEFT JOIN community_discussions cd
//         ON cd.DiscussionID = ci.Reference
//       LEFT JOIN Community_User u
//         ON cd.AuthAdd = u.UserID
//       LEFT JOIN community_discussions cd1
//         ON cd.DiscussionID = cd1.RepostID
//       LEFT JOIN community_discussions cd2
//         ON cd.DiscussionID = cd2.Reference

//       WHERE
//         ci.ProcessName = :processName
//         AND IFNULL(ci.delStatus, 0) = 0
//         AND IFNULL(cd.delStatus, 0) = 0
//         AND IFNULL(u.delStatus, 0) = 0
//         AND cd.Content IS NOT NULL
//         AND cd.Reference = 0
//         ${dateCondition}

//       GROUP BY
//         ci.reference,
//         ci.Likes,
//         ci.ProcessName

//       ORDER BY likes DESC;
//     `;

//     const discussionStats = await sequelize.query(query, {
//       replacements,
//       type: sequelize.QueryTypes.SELECT,
//     });

//     return {
//       success: true,
//       data: discussionStats,
//       message: "Trending discussions fetched successfully",
//       filters: {
//         processName,
//         startDate,
//         endDate,
//       },
//     };
//   } catch (error) {
//     console.error("Trending Discussion Service Error:", error);
//     throw error;
//   }
// };

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
      FROM Content_Interaction_Log
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

export const getDeviceAnalyticsService = async () => {
  try {
    const logs = await db.UserLoginLog.findAll({
      attributes: ["DeviceInfo"],
    });

    let counts = {
      MobileTablet: 0, // Combined mobile and tablet
      DesktopLaptop: 0, // Combined desktop and laptop
      Unknown: 0,
    };

    logs.forEach((log) => {
      let uaString = "";

      try {
        const parsed = JSON.parse(log.DeviceInfo || "{}");
        uaString = (parsed.userAgent || "").toLowerCase();
      } catch (err) {
        uaString = "";
      }

      let type = "Unknown";

      if (uaString) {
        // Check for mobile/tablet devices
        if (
          uaString.includes("android") ||
          uaString.includes("iphone") ||
          uaString.includes("ipod") ||
          uaString.includes("ipad") ||
          uaString.includes("mobile") ||
          uaString.includes("tablet") ||
          uaString.includes("kindle") ||
          uaString.includes("silk") ||
          uaString.includes("playbook") ||
          (uaString.includes("macintosh") && uaString.includes("ipad")) ||
          uaString.includes("blackberry") ||
          uaString.includes("webos")
        ) {
          type = "MobileTablet";
        }
        // Check for desktop/laptop devices
        else if (
          uaString.includes("windows") ||
          (uaString.includes("macintosh") && !uaString.includes("ipad")) ||
          uaString.includes("linux") ||
          uaString.includes("x11") ||
          uaString.includes("win64") ||
          uaString.includes("win32")
        ) {
          type = "DesktopLaptop";
        }
      }

      counts[type]++;
    });

    const total = logs.length || 1;

    return {
      success: true,
      total,
      data: {
        mobileTablet: {
          users: counts.MobileTablet,
          percentage: ((counts.MobileTablet / total) * 100).toFixed(2),
        },
        desktopLaptop: {
          users: counts.DesktopLaptop,
          percentage: ((counts.DesktopLaptop / total) * 100).toFixed(2),
        },
        unknown: {
          users: counts.Unknown,
          percentage: ((counts.Unknown / total) * 100).toFixed(2),
        },
      },
    };
  } catch (error) {
    console.error("Device Analytics Service Error:", error);
    throw error;
  }
};

export const getTrendingDiscussionService = async (
  startDate = null,
  endDate = null
) => {
  try {
    const processName = "Discussion";

    let dateCondition = "";
    const replacements = { processName };
    if (startDate && endDate) {
      dateCondition =
        "AND CAST(c.AddOnDt AS DATE) BETWEEN :startDate AND :endDate";
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }
    const query = `
      WITH UserFinalLikes AS (
          SELECT 
              c.reference,
              c.UserID,
              CAST(
                  SUBSTRING_INDEX(
                      GROUP_CONCAT(c.Likes ORDER BY c.AddOnDt DESC),
                      ',', 1
                  ) AS UNSIGNED
              ) AS final_like
          FROM Content_Interaction_Log c
          WHERE c.ProcessName = :processName
            AND IFNULL(c.delStatus, 0) = 0
            ${dateCondition}
          GROUP BY c.reference, c.UserID
      ),
      ReferenceLikes AS (
          SELECT 
              reference,
              SUM(final_like) AS LikeCount
          FROM UserFinalLikes
          GROUP BY reference
      ),
      ReferenceComments AS (
          SELECT 
              c.reference,
              SUM(IFNULL(c.Comments, 0)) AS CommentCount
          FROM Content_Interaction_Log c
          WHERE c.ProcessName = :processName
            AND IFNULL(c.delStatus, 0) = 0
            AND c.Comments = 1
            ${dateCondition}
          GROUP BY c.reference
      ),
      ReferenceRepost AS (
          SELECT 
              c.reference,
              SUM(IFNULL(c.Repost, 0)) AS RepostCount
          FROM Content_Interaction_Log c
          WHERE c.ProcessName = :processName
            AND IFNULL(c.delStatus, 0) = 0
            AND c.Repost = 1
            ${dateCondition}
          GROUP BY c.reference
      ),
      ReferenceViews AS (
          SELECT 
              c.reference,
              SUM(IFNULL(c.View, 0)) AS ViewCount
          FROM Content_Interaction_Log c
          WHERE c.ProcessName = :processName
            AND IFNULL(c.delStatus, 0) = 0
            AND c.View = 1
            ${dateCondition}
          GROUP BY c.reference
      )
      SELECT 
          r.reference,
          r.LikeCount,
          IFNULL(c.CommentCount, 0) AS CommentCount,
          IFNULL(rp.RepostCount, 0) AS RepostCount,
          IFNULL(v.ViewCount, 0) AS ViewCount,
          d.title,
          d.content,
          d.AddOnDt,
          u.Name AS author
      FROM ReferenceLikes r
      LEFT JOIN ReferenceComments c ON r.reference = c.reference
      LEFT JOIN ReferenceRepost rp ON r.reference = rp.reference
      LEFT JOIN ReferenceViews v ON r.reference = v.reference
      LEFT JOIN Community_Discussions d ON d.DiscussionID = r.reference
      LEFT JOIN Community_User u ON d.AuthAdd = u.UserID
      WHERE IFNULL(d.delStatus,0) = 0
        AND d.Reference = 0
      ORDER BY r.LikeCount DESC;
    `;
    const trending = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    return {
      success: true,
      data: trending,
      message: "Trending discussions fetched successfully",
      filters: { processName, startDate, endDate },
    };
  } catch (error) {
    console.error("Trending Discussion Service Error:", error);
    throw error;
  }
};

export const getMostActiveUsersService = async () => {
  try {
    const query = `
      WITH LoginScore AS (
    SELECT
        UserID,
        COUNT(*) AS LoginCount,
        COUNT(DISTINCT DATE(LogInDateTime)) AS ActiveDays
    FROM Community_User_Login_Log
    WHERE IFNULL(delStatus, 0) = 0
    GROUP BY UserID
),
ActivityScore AS (
    SELECT
        UserID,
        SUM(
            IFNULL(Likes,0) * 2 +
            IFNULL(Comments,0) * 3 +
            IFNULL(Repost,0) * 4 +
            IFNULL(View,0) * 1
        ) AS InteractionScore
    FROM Content_Interaction_Log
    WHERE IFNULL(delStatus, 0) = 0
    GROUP BY UserID
)
SELECT
    u.UserID,
    u.Name,
    u.EmailId,
    IFNULL(l.LoginCount, 0) AS LoginCount,
    IFNULL(l.ActiveDays, 0) AS ActiveDays,
    IFNULL(a.InteractionScore, 0) AS InteractionScore,
    (
        IFNULL(l.LoginCount, 0) * 1 +
        IFNULL(l.ActiveDays, 0) * 5 +
        IFNULL(a.InteractionScore, 0)
    ) AS TotalScore
FROM Community_User u
inner JOIN LoginScore l ON u.UserID = l.UserID
inner JOIN ActivityScore a ON u.UserID = a.UserID
WHERE IFNULL(u.delStatus, 0) = 0 
ORDER BY TotalScore DESC;
    `;

    const results = await db.sequelize.query(query, {
      type: db.sequelize.QueryTypes.SELECT,
    });

    return {
      success: true,
      message: "Most active users fetched successfully",
      data: results,
    };
  } catch (error) {
    console.error("Most Active Users Service Error:", error);
    throw error;
  }
};
