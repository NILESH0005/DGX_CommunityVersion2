// services/lmsService.js
import db, { sequelize } from "../models/index.js";
import { Op, QueryTypes, Sequelize } from "sequelize";
import UserQueryReplies from "../models/UserQueryReplies.js";

const {
  LMSModulesDetails,
  LMSSubModulesDetails,
  LMSUnitsDetails,
  LMSFilesDetails,
  Group_Master,
  LMSUserProgress,
  User,
  ContentInteraction,
  ContentInteractionLog,
  User_Query_Table,
  User_Query_Replies,
} = db;

export class LMSService {
  // Save module + submodules + units + files
  static async saveLearningMaterials(data, userEmail) {
    return await db.sequelize.transaction(async (t) => {
      // 🔹 Fetch user details first
      const user = await User.findOne({
        where: { EmailId: userEmail, delStatus: 0 },
        attributes: ["UserID", "Name"],
        transaction: t,
      });

      if (!user) {
        throw new Error("User not found, please login first.");
      }

      const cleanUserName = user.UserID; // ✅ use Name (not email)
      const userId = user.UserID;

      // === Save Module ===
      const module = await LMSModulesDetails.create(
        {
          ModuleName: data.ModuleName,
          ModuleImagePath: data.ModuleImagePath
            ? typeof data.ModuleImagePath === "object"
              ? data.ModuleImagePath.filePath // ✅ save only filePath
              : data.ModuleImagePath
            : null,
          ModuleDescription: data.ModuleDescription || null,
          AuthAdd: cleanUserName, // ✅ using Name
          AddOnDt: new Date(),
          delStatus: 0,
        },
        { transaction: t },
      );

      // ✅ Insert into GroupMaster for Module
      await Group_Master.create(
        {
          group_name: data.ModuleName,
          group_category: "quizGroup",
          AuthAdd: cleanUserName, // ✅ using Name
          AddOnDt: new Date(),
          delStatus: 0,
        },
        { transaction: t },
      );

      // === Loop Submodules ===
      for (const sub of data.subModules || []) {
        const subModule = await LMSSubModulesDetails.create(
          {
            SubModuleName: sub.SubModuleName,
            SubModuleImagePath: sub.SubModuleImagePath
              ? typeof sub.SubModuleImagePath === "object"
                ? sub.SubModuleImagePath.filePath
                : sub.SubModuleImagePath
              : null,
            SubModuleDescription: sub.SubModuleDescription || null,
            ModuleID: module.ModuleID,
            AuthAdd: cleanUserName,
            AddOnDt: new Date(),
            delStatus: 0,
          },
          { transaction: t },
        );

        // ✅ Insert into GroupMaster for SubModule
        await Group_Master.create(
          {
            group_name: sub.SubModuleName,
            group_category: "questionGroup",
            SubModuleID: subModule.SubModuleID,
            AuthAdd: cleanUserName, // ✅ using Name
            AddOnDt: new Date(),
            delStatus: 0,
          },
          { transaction: t },
        );

        // === Loop Units ===
        for (const unit of sub.Units || []) {
          const unitObj = await LMSUnitsDetails.create(
            {
              UnitName: unit.UnitName,
              UnitImg: unit.UnitImg || null,
              UnitDescription: unit.UnitDescription || null,
              SubModuleID: subModule.SubModuleID,
              AuthAdd: cleanUserName, // ✅ using Name
              AddOnDt: new Date(),
              delStatus: 0,
            },
            { transaction: t },
          );

          // === Loop Files ===
          for (const file of unit.Files || []) {
            await LMSFilesDetails.create(
              {
                FilesName: file.customFileName || file.FilesName,
                FilePath: file.FilePath,
                FileType: file.FileType,
                UnitID: unitObj.UnitID,
                AuthAdd: cleanUserName, // ✅ using Name
                AddOnDt: new Date(),
                delStatus: 0,
                Percentage: file.Percentage || 0,
                EstimatedTime: file.EstimatedTime || 0,
              },
              { transaction: t },
            );
          }
        }
      }

      return module;
    });
  }

  static async saveFileOrLink(unitId, userId, data) {
    console.log("userId:", userId);

    return await db.sequelize.transaction(async (t) => {
      // ✅ Step 1: Find the user by ID (ensure valid)
      const user = await db.User.findOne({
        where: {
          [Op.or]: [{ UserID: userId }, { id: userId }],
          [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
        },
        transaction: t,
      });

      if (!user) throw new Error("User not found");

      // ✅ Step 2: Count existing files
      const count = await db.LMSFilesDetails.count({
        where: { UnitID: unitId, delStatus: 0 },
        transaction: t,
      });

      const total = count + 1;
      const equalPercentage = (100 / total).toFixed(2);

      // ✅ Step 3: Update existing files with new percentage
      await db.LMSFilesDetails.update(
        { Percentage: equalPercentage },
        { where: { UnitID: unitId, delStatus: 0 }, transaction: t },
      );

      // ✅ Step 4: Create new file or link
      const fileData = {
        FilesName: data.FilesName,
        FilePath: data.FilePath,
        FileType: data.FileType,
        UnitID: unitId,
        AuthAdd: user.UserID, // <-- user ID saved here instead of name
        AddOnDt: new Date(),
        delStatus: 0,
        Percentage: equalPercentage,
        Description: data.Description || null,
        EstimatedTime: data.EstimatedTime || 0,
      };

      const newFile = await db.LMSFilesDetails.create(fileData, {
        transaction: t,
      });

      return newFile;
    });
  }

  static async uploadUpdatedFile(
    unitId,
    userId,
    file,
    description,
    sortingOrder,
    estimatedTime,
  ) {
    return await db.sequelize.transaction(async (t) => {
      const user = await db.User.findOne({
        where: {
          [Op.or]: [{ UserID: userId }, { id: userId }],
          [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
        },
        transaction: t,
      });

      if (!user) throw new Error("User not found");

      await db.LMSFilesDetails.create(
        {
          FilesName: file.originalname,
          FilePath: `/uploads/${file.filename}`,
          FileType: file.mimetype,
          UnitID: unitId,
          AuthAdd: user.UserID, // store user ID instead of name
          AddOnDt: new Date(),
          delStatus: 0,
          Description: description || null,
          SortingOrder: sortingOrder || 0,
          EstimatedTime: estimatedTime || 0,
        },
        { transaction: t },
      );

      // ✅ Step 3: Fetch all active files for the unit
      const allFiles = await db.LMSFilesDetails.findAll({
        where: { UnitID: unitId, delStatus: 0 },
        transaction: t,
      });

      // ✅ Step 4: Distribute equal percentage
      const percentage = (100 / allFiles.length).toFixed(2);

      for (const f of allFiles) {
        await f.update({ Percentage: percentage }, { transaction: t });
      }
      return {
        unitId,
        percentage,
        totalFiles: allFiles.length,
        addedBy: user.Name,
      };
    });
  }
}

export const checkModuleExists = async (moduleName) => {
  const existing = await LMSModulesDetails.findOne({
    where: {
      ModuleName: moduleName.trim(),
    },
  });

  if (existing) {
    return {
      success: true,
      exists: true,
      message: "Module already exists",
    };
  }

  return {
    success: true,
    exists: false,
    message: "Module does not exist",
  };
};

export class LMSViewsService {
  static async getSubModuleViews() {
    try {
      const subModules = await LMSSubModulesDetails.findAll({
        where: { delStatus: 0 },
        attributes: ["SubModuleID", "SubModuleName", "ModuleID"],
        raw: true,
      });

      const results = await Promise.all(
        subModules.map(async (sub) => {
          // Count total views
          const totalViews = await ContentInteractionLog.count({
            where: {
              ProcessName: "LMS",
              reference: sub.SubModuleID,
              delStatus: 0,
              View: 1,
            },
          });

          const units = await LMSUnitsDetails.findAll({
            where: { SubModuleID: sub.SubModuleID, delStatus: 0 },
            attributes: ["UnitID"],
            raw: true,
          });

          const unitIDs = units.map((u) => u.UnitID);

          let totalTimeSpent = 0;
          if (unitIDs.length > 0) {
            const files = await LMSFilesDetails.findAll({
              where: { UnitID: unitIDs, delStatus: 0 },
              attributes: ["FileID"],
              raw: true,
            });

            const fileIDs = files.map((f) => f.FileID);

            if (fileIDs.length > 0) {
              const timeResult = await LMSUserProgress.findAll({
                where: { FileID: fileIDs },
                attributes: [
                  [
                    Sequelize.fn("SUM", Sequelize.col("TimeSpentSeconds")),
                    "totalTime",
                  ],
                ],
                raw: true,
              });

              totalTimeSpent = timeResult[0].totalTime || 0;
            }
          }

          return {
            subModuleID: sub.SubModuleID,
            subModuleName: sub.SubModuleName,
            moduleID: sub.ModuleID,
            totalViews,
            totalTimeSpent,
          };
        }),
      );

      return results;
    } catch (error) {
      console.error("Error in getSubModuleViews:", error);
      throw new Error(error.message);
    }
  }

  // static async getSubModuleViews() {
  //   try {
  //     const subModules = await LMSSubModulesDetails.findAll({
  //       where: { delStatus: 0 },
  //       attributes: ["SubModuleID", "SubModuleName", "ModuleID"],
  //       raw: true,
  //     });

  //     // For each submodule, count views from Content_Interaction_Log
  //     const results = await Promise.all(
  //       subModules.map(async (sub) => {
  //         const totalViews = await ContentInteractionLog.count({
  //           where: {
  //             ProcessName: "LMS",
  //             reference: sub.SubModuleID,
  //             delStatus: 0,
  //             View: 1,
  //           },
  //         });

  //         return {
  //           subModuleID: sub.SubModuleID,
  //           subModuleName: sub.SubModuleName,
  //           moduleID: sub.ModuleID,
  //           totalViews,

  //         };
  //       })
  //     );
  //     return results;
  //   } catch (error) {
  //     console.error("Error in getSubModuleViews:", error);
  //     throw new Error(error.message);
  //   }
  // }

  /**
   * Module-wise total views (unique users)
   */
  // static async getModuleViews() {
  //   try {
  //     const modules = await LMSModulesDetails.findAll({
  //       where: { delStatus: 0 },
  //       attributes: ["ModuleID", "ModuleName"],
  //       raw: true,
  //     });

  //     const results = await Promise.all(
  //       modules.map(async (module) => {
  //         // Find all submodules under this module
  //         const subModules = await LMSSubModulesDetails.findAll({
  //           where: { ModuleID: module.ModuleID, delStatus: 0 },
  //           attributes: ["SubModuleID"],
  //           raw: true,
  //         });

  //         const subModuleIDs = subModules.map((s) => s.SubModuleID);

  //         if (subModuleIDs.length === 0) return { ...module, totalViews: 0 };

  //         // Count unique UserIDs across all submodules (distinct users)
  //         const [results] = await ContentInteractionLog.sequelize.query(
  //           `
  //           SELECT COUNT(DISTINCT UserID) AS uniqueUsers
  //           FROM Content_Interaction_Log
  //           WHERE ProcessName = 'LMS'
  //           AND delStatus = 0
  //           AND View = 1
  //           AND reference IN (:subModuleIDs)
  //         `,
  //           { replacements: { subModuleIDs } }
  //         );

  //         const totalViews = results?.[0]?.uniqueUsers || 0;

  //         return {
  //           moduleID: module.ModuleID,
  //           moduleName: module.ModuleName,
  //           totalViews,
  //         };
  //       })
  //     );

  //     return results;
  //   } catch (error) {
  //     console.error("Error in getModuleViews:", error);
  //     throw new Error(error.message);
  //   }
  // }
  static async getModuleViews() {
    try {
      const modules = await LMSModulesDetails.findAll({
        where: { delStatus: 0 },
        attributes: ["ModuleID", "ModuleName"],
        raw: true,
      });

      const results = await Promise.all(
        modules.map(async (module) => {
          // 1️⃣ Get submodules for this module
          const subModules = await LMSSubModulesDetails.findAll({
            where: { ModuleID: module.ModuleID, delStatus: 0 },
            attributes: ["SubModuleID"],
            raw: true,
          });

          const subModuleIDs = subModules.map((s) => s.SubModuleID);

          if (subModuleIDs.length === 0) {
            return {
              moduleID: module.ModuleID,
              moduleName: module.ModuleName,
              totalViews: 0,
              totalTimeSpent: 0,
              effectiveTimeSpent: 0,
              estimatedTimeTotal: 0,
              totalFiles: 0,
              completedFiles: 0,
              engagementPercentage: 0,
              avgRating: 0,
              ratingCount: 0,
            };
          }

          const [viewsResult] = await ContentInteractionLog.sequelize.query(
            `
          SELECT COUNT(DISTINCT UserID) AS uniqueUsers
          FROM Content_Interaction_Log
          WHERE ProcessName = 'LMS'
            AND delStatus = 0
            AND View = 1
            AND reference IN (:subModuleIDs)
          `,
            { replacements: { subModuleIDs } },
          );

          const totalViews = viewsResult?.[0]?.uniqueUsers || 0;

          const units = await LMSUnitsDetails.findAll({
            where: { SubModuleID: subModuleIDs, delStatus: 0 },
            attributes: ["UnitID"],
            raw: true,
          });

          const unitIDs = units.map((u) => u.UnitID);

          let totalTimeSpent = 0;
          let effectiveTimeSpent = 0;
          let totalEstimatedTime = 0;
          let totalFiles = 0;
          let completedFiles = 0;

          if (unitIDs.length > 0) {
            const files = await LMSFilesDetails.findAll({
              where: {
                UnitID: unitIDs,
                delStatus: 0,
                EstimatedTime: { [Sequelize.Op.not]: null },
              },
              attributes: ["FileID", "EstimatedTime"],
              raw: true,
            });

            const fileIDs = files.map((f) => f.FileID);
            totalFiles = files.length;

            totalEstimatedTime = files.reduce((sum, file) => {
              return sum + (Number(file.EstimatedTime) || 0);
            }, 0);

            if (fileIDs.length > 0) {
              // 6️⃣ Get time spent per file from userlmsprogress
              const timeResults = await LMSUserProgress.findAll({
                where: { FileID: fileIDs, delStatus: 0 },
                attributes: [
                  "FileID",
                  [
                    Sequelize.fn("SUM", Sequelize.col("TimeSpentSeconds")),
                    "fileTimeSpent",
                  ],
                ],
                group: ["FileID"],
                raw: true,
              });

              // Create a map of file times for quick lookup
              const fileTimeMap = {};
              timeResults.forEach((result) => {
                fileTimeMap[result.FileID] = Number(result.fileTimeSpent) || 0;
              });

              // 7️⃣ Calculate total and effective time spent
              files.forEach((file) => {
                const fileEstimatedTimeSeconds =
                  (Number(file.EstimatedTime) || 0) * 60;
                const userTimeSpent = fileTimeMap[file.FileID] || 0;

                totalTimeSpent += userTimeSpent;

                // Effective time = min(user time, estimated time)
                const effectiveTime = Math.min(
                  userTimeSpent,
                  fileEstimatedTimeSeconds,
                );
                effectiveTimeSpent += effectiveTime;

                // Check if file is completed (at least 80% of estimated time)
                if (userTimeSpent >= fileEstimatedTimeSeconds * 0.8) {
                  completedFiles++;
                }
              });
            }
          }

          // 8️⃣ Calculate engagement percentage
          const totalEstimatedTimeSeconds = totalEstimatedTime * 60;
          const engagementPercentage =
            totalEstimatedTimeSeconds > 0
              ? (effectiveTimeSpent / totalEstimatedTimeSeconds) * 100
              : 0;

          // 9️⃣ Get ratings
          const [ratingResult] = await ContentInteractionLog.sequelize.query(
            `SELECT 
            AVG(Rating) AS avgRating,
            COUNT(Rating) AS ratingCount
          FROM content_interaction
          WHERE Type = 'LMS'
            AND delStatus = 0
            AND Rating IS NOT NULL
            AND ReferenceId IN (:subModuleIDs)
          `,
            {
              replacements: { subModuleIDs },
              type: Sequelize.QueryTypes.SELECT,
            },
          );

          const avgRating = ratingResult?.avgRating
            ? Number(parseFloat(ratingResult.avgRating).toFixed(2))
            : 0;

          const ratingCount = ratingResult?.ratingCount || 0;

          return {
            moduleID: module.ModuleID,
            moduleName: module.ModuleName,
            totalViews,
            totalTimeSpent, // Raw total time spent
            effectiveTimeSpent, // Capped time (max = estimated time per file)
            estimatedTimeTotal: totalEstimatedTime, // in minutes
            totalFiles,
            completedFiles,
            engagementPercentage: Number(engagementPercentage.toFixed(2)),
            avgRating,
            ratingCount,
          };
        }),
      );

      return results;
    } catch (error) {
      console.error("Error in getModuleViews:", error);
      throw new Error(error.message);
    }
  }
}

export const getAllActiveFilesService = async () => {
  try {
    const query = `
      SELECT 
        f.FileID,
        f.FilesName,
        f.FilePath,
        f.FileType,
        f.UnitID,
        u.UnitName,
        f.Description,
        f.SortingOrder,
        f.EstimatedTime,
        f.Percentage,
        sm.SubModuleID,     
        sm.SubModuleName,
        m.ModuleID,
        m.ModuleName
      FROM FilesDetails f
      INNER JOIN UnitsDetails u ON f.UnitID = u.UnitID
      INNER JOIN SubModulesDetails sm ON u.SubModuleID = sm.SubModuleID
      INNER JOIN ModuleDetails m ON sm.ModuleID = m.ModuleID
      WHERE 
        f.delStatus = 0
        AND u.delStatus = 0
        AND sm.delStatus = 0
        AND m.delStatus = 0
      ORDER BY 
        m.ModuleID, sm.SubModuleID, u.UnitID, f.SortingOrder;
    `;

    const [results] = await sequelize.query(query);
    const BASE_URL = process.env.API_BASE_URL;
    const UPLOADS_URL = process.env.API_UPLOADS_URL || BASE_URL;

    const updatedResults = results.map((file) => {
      if (file.FileType === "link" || file.FilePath?.startsWith("http")) {
        return {
          ...file,
          FileURL: file.FilePath,
        };
      }

      return {
        ...file,
        FileURL: `${BASE_URL}/lms/download/${file.FileID}`,
        DirectFileURL: `${UPLOADS_URL}/${file.FilePath}`,
      };
    });

    return {
      success: true,
      data: updatedResults,
    };
  } catch (error) {
    console.error("Service Error (getAllActiveFiles):", error);
    return {
      success: false,
      message: "Database query failed while fetching active files",
    };
  }
};

export const getFileByIdService = async (FileID) => {
  try {
    const query = `
      SELECT 
        f.FileID,
        f.FilesName,
        f.FilePath,
        f.FileType,
        f.UnitID,
        f.Description,
        f.SortingOrder,
        f.EstimatedTime,
        f.Percentage,
        u.UnitName,
        sm.SubModuleName,
        sm.SubModuleID,
        m.ModuleName,
        m.ModuleID
      FROM FilesDetails f
      INNER JOIN UnitsDetails u ON f.UnitID = u.UnitID
      INNER JOIN SubModulesDetails sm ON u.SubModuleID = sm.SubModuleID
      INNER JOIN ModuleDetails m ON sm.ModuleID = m.ModuleID
      WHERE 
        f.FileID = ?
        AND f.delStatus = 0
        AND u.delStatus = 0
        AND sm.delStatus = 0
        AND m.delStatus = 0
    `;

    const [results] = await sequelize.query(query, {
      replacements: [FileID],
    });

    if (results.length === 0) {
      return {
        success: false,
        message: "File not found or inactive",
      };
    }

    const file = results[0];

    return {
      success: true,
      data: file,
    };
  } catch (error) {
    console.error("Service Error (getFileByIdService):", error);
    return {
      success: false,
      message: "Database query failed while fetching file details",
    };
  }
};

export const getSubModuleRatingService = async (userEmail, subModuleId) => {
  if (!subModuleId) {
    throw new Error("SubModule reference is required");
  }

  // ---------- 1. Average rating + count ----------
  const ratingStats = await ContentInteraction.findOne({
    attributes: [
      [Sequelize.fn("AVG", Sequelize.col("Rating")), "avgRating"],
      [Sequelize.fn("COUNT", Sequelize.col("Rating")), "ratingCount"],
    ],
    where: {
      Type: "LMS",
      ReferenceId: subModuleId,
      Rating: { [Sequelize.Op.ne]: null },
      delStatus: 0,
    },
    raw: true,
  });

  const avgRating = ratingStats?.avgRating ? Number(ratingStats.avgRating) : 0;

  const ratingCount = ratingStats?.ratingCount
    ? Number(ratingStats.ratingCount)
    : 0;

  // ---------- 2. Logged-in user rating ----------
  let myRating = null;

  if (userEmail) {
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
      attributes: ["UserID"],
      raw: true,
    });

    if (user) {
      const userRating = await ContentInteraction.findOne({
        attributes: ["Rating"],
        where: {
          Type: "LMS",
          ReferenceId: subModuleId,
          UserID: user.UserID,
          Rating: { [Sequelize.Op.ne]: null },
          delStatus: 0,
        },
        raw: true,
      });

      myRating = userRating?.Rating ?? null;
    }
  }

  return {
    avgRating: Number(avgRating.toFixed(1)),
    totalRatings: ratingCount, // ✅ MATCH FRONTEND
    myRating, // ✅ REQUIRED
  };
};

export const handleLmsSubmoduleRateAction = async (userEmail, postData) => {
  try {
    const subModuleId = postData.reference || postData.subModuleId;
    const ratingValue = postData.rating;

    if (!subModuleId) throw new Error("Invalid submodule reference");
    if (ratingValue === undefined || ratingValue < 0 || ratingValue > 5) {
      throw new Error("Invalid rating value. Must be between 0 and 5");
    }

    const user = await User.findOne({
      where: {
        EmailId: userEmail,
        delStatus: 0,
      },
      attributes: ["UserID", "Name", "EmailId"],
    });

    if (!user) throw new Error("User not found");

    const userId = user.UserID;
    const currentDate = new Date();

    const transaction = await User.sequelize.transaction();

    try {
      // ===== 1. Check if user already rated this submodule =====
      const existingRating = await ContentInteraction.findOne({
        where: {
          Type: "LMS",
          ReferenceId: subModuleId,
          UserID: userId,
          Rating: { [Sequelize.Op.ne]: null },
          delStatus: 0,
        },
        transaction,
      });

      if (existingRating) {
        await transaction.rollback();
        throw new Error(
          "You have already rated this submodule. You can rate only once.",
        );
      }

      // ===== 2. Find existing interaction row =====
      let mainInteraction = await ContentInteraction.findOne({
        where: {
          Type: "LMS",
          ReferenceId: subModuleId,
          UserID: userId,
          delStatus: 0,
        },
        transaction,
      });

      if (mainInteraction) {
        // Update rating
        await ContentInteraction.update(
          {
            Rating: ratingValue,
            AuthLstEdt: userId,
            editOnDt: currentDate,
          },
          {
            where: { Id: mainInteraction.Id },
            transaction,
          },
        );
      } else {
        // Create new interaction
        mainInteraction = await ContentInteraction.create(
          {
            Type: "LMS",
            ReferenceId: subModuleId,
            UserID: userId,
            Likes: 0,
            Dislikes: 0,
            Rating: ratingValue,
            View: 0,
            Repost: null,
            Comments: null,
            AuthAdd: userId,
            AuthDel: null,
            AuthLstEdt: null,
            delOnDt: null,
            AddOnDt: currentDate,
            editOnDt: null,
            delStatus: 0,
          },
          { transaction },
        );
      }

      // ===== 3. Create log entry =====
      await ContentInteractionLog.create(
        {
          ProcessName: "LMS",
          reference: subModuleId,
          UserID: userId,
          Likes: null,
          Dislike: null,
          Rating: ratingValue,
          View: null,
          Comments: null,
          Repost: null,
          AuthAdd: userId,
          AuthDel: null,
          AuthLstEdt: null,
          delOnDt: null,
          AddOnDt: currentDate,
          editOnDt: null,
          delStatus: 0,
        },
        { transaction },
      );

      await transaction.commit();

      return {
        success: true,
        data: {
          rated: true,
          rating: ratingValue,
          subModuleId,
          userId,
          interactionId: mainInteraction?.Id,
        },
        message: "Submodule rated successfully",
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("LMS Rating Error:", error);
    throw error;
  }
};

export const getModuleRatingService = async (moduleId) => {
  if (!moduleId) {
    throw new Error("Module reference is required");
  }

  const ratingStats = await ContentInteraction.findOne({
    attributes: [
      [Sequelize.fn("AVG", Sequelize.col("Rating")), "avgRating"],
      [Sequelize.fn("COUNT", Sequelize.col("Rating")), "ratingCount"],
    ],
    include: [
      {
        model: LMSSubModulesDetails, // ✅ FIXED
        attributes: [],
        where: {
          ModuleID: moduleId,
          delStatus: 0,
        },
        required: true,
      },
    ],
    where: {
      Type: "LMS",
      Rating: { [Op.ne]: null },
      delStatus: 0,
    },
    raw: true,
  });

  const avgRating = ratingStats?.avgRating ? Number(ratingStats.avgRating) : 0;

  const ratingCount = ratingStats?.ratingCount
    ? Number(ratingStats.ratingCount)
    : 0;

  return {
    avgRating: Number(avgRating.toFixed(1)),
    totalRatings: ratingCount,
  };
};

export const createUserQuery = async (queryData, userId) => {
  try {
    const requiredFields = [
      "ModuleID",
      "SubModuleID",
      "UnitID",
      "FileID",
      "QueryText",
    ];
    const missingFields = requiredFields.filter(
      (field) => !queryData[field] && queryData[field] !== 0,
    );

    if (missingFields.length > 0) {
      console.warn(`Missing required fields: ${missingFields.join(", ")}`);
      return {
        status: 400,
        response: {
          success: false,
          data: {},
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
      };
    }

    if (queryData.QueryText.length > 1000) {
      console.warn("Query text exceeds 1000 characters");
      return {
        status: 400,
        response: {
          success: false,
          data: {},
          message: "Query text cannot exceed 1000 characters",
        },
      };
    }

    // Get module creator ID
    const module = await LMSModulesDetails.findOne({
      where: { ModuleID: queryData.ModuleID, delStatus: 0 },
      attributes: ["AuthAdd"],
    });

    const moduleCreatorId = module ? module.AuthAdd : null;

    const userQuery = await User_Query_Table.create({
      ModuleID: queryData.ModuleID,
      SubModuleID: queryData.SubModuleID,
      UnitID: queryData.UnitID,
      FileID: queryData.FileID,
      ModuleCreatorID: moduleCreatorId,
      UserID: userId,
      QueryText: queryData.QueryText,
      Status: "Pending",
      AuthAdd: userId.toString(),
      AddOnDt: new Date(),
      delStatus: 0,
    });

    console.log(`User query created successfully: ${userQuery.QueryID}`);

    return {
      status: 201,
      response: {
        success: true,
        data: {
          queryId: userQuery.QueryID,
          queryText: userQuery.QueryText,
          status: userQuery.Status,
          createdAt: userQuery.AddOnDt,
        },
        message: "Query submitted successfully!",
      },
    };
  } catch (error) {
    console.error("User query creation failed:", error);
    return {
      status: 500,
      response: {
        success: false,
        data: error,
        message: "Something went wrong while submitting the query",
      },
    };
  }
};

export const getUserQueries = async (filters = {}, userId) => {
  try {
    let whereConditions = "q.delStatus = 0";
    let replacements = {};

    const query = `
      SELECT 
        q.QueryID AS queryId,
        q.ModuleID AS moduleId,
        q.SubModuleID AS subModuleId,
        q.UnitID AS unitId,
        q.FileID AS fileId,
        q.ModuleCreatorID AS moduleCreatorId,
        q.UserID AS userId,
        q.QueryText AS queryText,
        q.Status AS status,
        q.AddOnDt AS createdAt,
        q.editOnDt AS updatedAt,
        
        u.Name AS userName,
        u.EmailId AS userEmail,
        u.isAdmin AS isAdmin,
        u.ProfilePicture AS profilePicture

      FROM userquerytable q
      LEFT JOIN community_user u 
        ON q.UserID = u.UserID

      WHERE ${whereConditions}

      ORDER BY q.AddOnDt DESC
    `;

    const queries = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    console.log(`Retrieved ${queries.length} queries`);

    return {
      status: 200,
      response: {
        success: true,
        data: queries,
        message: "Queries retrieved successfully",
      },
    };
  } catch (error) {
    console.error("Failed to retrieve queries:", error);
    return {
      status: 500,
      response: {
        success: false,
        data: {},
        message: "Something went wrong while retrieving queries",
      },
    };
  }
};

export const createReply = async (data) => {
  // 1️⃣ Check if reply already exists
  const existingReply = await User_Query_Replies.findOne({
    where: {
      QueryID: data.QueryID,
      delStatus: 0,
    },
  });

  if (existingReply) {
    throw new Error("Reply already exists for this query");
  }

  // 2️⃣ Create Reply
  const reply = await User_Query_Replies.create({
    QueryID: data.QueryID,
    RepliedBy: data.RepliedBy,
    ReplyText: data.ReplyText,
    AuthAdd: data.RepliedBy,
    AddOnDt: new Date(),
    delStatus: 0,
  });

  // 3️⃣ Update Query Status
  await User_Query_Table.update(
    {
      Status: "Answered",
      AuthLstEdt: data.RepliedBy,
      editOnDt: new Date(),
    },
    {
      where: {
        QueryID: data.QueryID,
        delStatus: 0,
      },
    },
  );

  return reply;
};

export const getReplyByQueryId = async (queryId) => {
  const reply = await User_Query_Replies.findOne({
    where: {
      QueryID: queryId,
      delStatus: 0,
    },
  });

  return reply;
};

export const getQueriesByUser = async (userId) => {
  const queries = await User_Query_Table.findAll({
    where: {
      UserID: userId,
      delStatus: 0,
    },
    order: [["AddOnDt", "DESC"]],
  });

  const queryIds = queries.map((q) => q.QueryID);

  const replies = await User_Query_Replies.findAll({
    where: {
      QueryID: queryIds,
      delStatus: 0,
    },
  });

  const finalData = queries.map((query) => {
    const reply = replies.find((r) => r.QueryID === query.QueryID);

    return {
      ...query.toJSON(),
      Reply: reply ? reply.toJSON() : null,
    };
  });

  return finalData;
};
