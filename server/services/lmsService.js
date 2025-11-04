// services/lmsService.js
import db from "../models/index.js"; // central sequelize instance with models
import { Op, Sequelize } from "sequelize";
const {
  LMSModulesDetails,
  LMSSubModulesDetails,
  LMSUnitsDetails,
  LMSFilesDetails,
  Group_Master,
  LMSUserProgress,
  User,
  ContentInteraction,
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

      const cleanUserName = user.Name; // ✅ use Name (not email)
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
        { transaction: t }
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
        { transaction: t }
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
            AuthAdd: cleanUserName, // ✅ using Name
            AddOnDt: new Date(),
            delStatus: 0,
          },
          { transaction: t }
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
          { transaction: t }
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
            { transaction: t }
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
              { transaction: t }
            );
          }
        }
      }

      return module;
    });
  }

  // Save file or link for unit
  static async saveFileOrLink(unitId, userName, data) {
    return await db.sequelize.transaction(async (t) => {
      // Count existing files
      const count = await LMSFilesDetails.count({
        where: { UnitID: unitId, delStatus: 0 },
        transaction: t,
      });

      const total = count + 1;
      const equalPercentage = (100 / total).toFixed(2);

      // Update existing files with new percentage
      await LMSFilesDetails.update(
        { Percentage: equalPercentage },
        { where: { UnitID: unitId, delStatus: 0 }, transaction: t }
      );

      // Insert new file or link
      const fileData = {
        FilesName: data.FilesName,
        FilePath: data.FilePath,
        FileType: data.FileType,
        UnitID: unitId,
        AuthAdd: userName,
        AddOnDt: new Date(),
        delStatus: 0,
        Percentage: equalPercentage,
        Description: data.Description || null,
        EstimatedTime: data.EstimatedTime || 0,
      };

      const newFile = await LMSFilesDetails.create(fileData, {
        transaction: t,
      });
      return newFile;
    });
  }

  // Upload updated file + recalc percentage
  static async uploadUpdatedFile(
    unitId,
    userName,
    file,
    description,
    sortingOrder,
    estimatedTime
  ) {
    return await db.sequelize.transaction(async (t) => {
      await LMSFilesDetails.create(
        {
          FilesName: file.originalname,
          FilePath: `/uploads/${file.filename}`,
          FileType: file.mimetype,
          UnitID: unitId,
          AuthAdd: userName,
          AddOnDt: new Date(),
          delStatus: 0,
          Description: description || null,
          SortingOrder: sortingOrder || 0,
          EstimatedTime: estimatedTime || 0,
        },
        { transaction: t }
      );

      // Fetch all files in this unit
      const allFiles = await LMSFilesDetails.findAll({
        where: { UnitID: unitId, delStatus: 0 },
        transaction: t,
      });

      const percentage = (100 / allFiles.length).toFixed(2);

      // Update percentage for all
      for (const f of allFiles) {
        await f.update({ Percentage: percentage }, { transaction: t });
      }

      return { unitId, percentage, totalFiles: allFiles.length };
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
          const totalViews = await ContentInteraction.count({
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
        })
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

  //     // For each submodule, count views from Content_Interaction
  //     const results = await Promise.all(
  //       subModules.map(async (sub) => {
  //         const totalViews = await ContentInteraction.count({
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
  //         const [results] = await ContentInteraction.sequelize.query(
  //           `
  //           SELECT COUNT(DISTINCT UserID) AS uniqueUsers
  //           FROM Content_Interaction
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
          // Find all submodules under this module
          const subModules = await LMSSubModulesDetails.findAll({
            where: { ModuleID: module.ModuleID, delStatus: 0 },
            attributes: ["SubModuleID"],
            raw: true,
          });

          const subModuleIDs = subModules.map((s) => s.SubModuleID);

          if (subModuleIDs.length === 0)
            return { ...module, totalViews: 0, totalTimeSpent: 0 };

          // Count unique UserIDs across all submodules (distinct users)
          const [viewsResult] = await ContentInteraction.sequelize.query(
            `
          SELECT COUNT(DISTINCT UserID) AS uniqueUsers
          FROM Content_Interaction
          WHERE ProcessName = 'LMS'
          AND delStatus = 0
          AND View = 1
          AND reference IN (:subModuleIDs)
        `,
            { replacements: { subModuleIDs } }
          );

          const totalViews = viewsResult?.[0]?.uniqueUsers || 0;

          // Get all units of the submodules
          const units = await LMSUnitsDetails.findAll({
            where: { SubModuleID: subModuleIDs, delStatus: 0 },
            attributes: ["UnitID"],
            raw: true,
          });

          const unitIDs = units.map((u) => u.UnitID);

          let totalTimeSpent = 0;
          if (unitIDs.length > 0) {
            // Get all files of the units
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
            moduleID: module.ModuleID,
            moduleName: module.ModuleName,
            totalViews,
            totalTimeSpent, // <-- include total time here
          };
        })
      );

      return results;
    } catch (error) {
      console.error("Error in getModuleViews:", error);
      throw new Error(error.message);
    }
  }
}
