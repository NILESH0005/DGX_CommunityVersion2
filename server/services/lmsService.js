// services/lmsService.js
import db from "../models/index.js"; // central sequelize instance with models

const {
  LMSModulesDetails,
  LMSSubModulesDetails,
  LMSUnitsDetails,
  LMSFilesDetails,
  Group_Master,
  User,
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
              ? JSON.stringify(data.ModuleImagePath)
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
                ? JSON.stringify(sub.SubModuleImagePath)
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
