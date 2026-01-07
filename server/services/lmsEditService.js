import path from "path";
import fs from "fs";
// import db from "../models/index.js";
import { logInfo, logWarning, logError } from "../helper/index.js";
import { Op } from "sequelize";
import UserLmsProgress from "../models/UserLmsProgress.js";
import db, { sequelize } from "../models/index.js";

const User = db.User;
const ModuleDetails = db.LMSModulesDetails;
const SubModulesDetails = db.LMSSubModulesDetails;
const LMSFilesDetails = db.LMSFilesDetails;
const LMSUserProgress = db.LMSUserProgress;
const LMSUnitsDetails = db.LMSUnitsDetails;

export const updateModuleService = async (userEmail, moduleId, payload) => {
  try {
    const user = await User.findOne({
      where: {
        EmailId: userEmail,
        delStatus: { [Op.or]: [0, null] },
      },
    });

    if (!user) {
      logWarning("User not found during module update");
      return {
        status: 404,
        response: {
          success: false,
          data: {},
          message: "User not found",
        },
      };
    }

    // Fetch existing module
    const existingModule = await ModuleDetails.findOne({
      where: { ModuleID: moduleId, delStatus: 0 },
    });

    if (!existingModule) {
      return {
        status: 404,
        response: {
          success: false,
          data: {},
          message: "Module not found or already deleted",
        },
      };
    }

    // Handle old image cleanup
    if (
      payload.ModuleImagePath &&
      existingModule.ModuleImagePath !== payload.ModuleImagePath
    ) {
      if (existingModule.ModuleImagePath) {
        // Add this guard
        const oldImagePath = path.join(
          process.cwd(),
          existingModule.ModuleImagePath
        );

        if (fs.existsSync(oldImagePath)) {
          const deletedFolder = path.join(
            process.cwd(),
            "uploads/deleted-files"
          );
          if (!fs.existsSync(deletedFolder))
            fs.mkdirSync(deletedFolder, { recursive: true });

          const oldFileName = path.basename(existingModule.ModuleImagePath);
          const newTrashPath = path.join(deletedFolder, oldFileName);

          try {
            fs.renameSync(oldImagePath, newTrashPath);
          } catch (moveErr) {
            logError("Failed to move old image", moveErr);
          }
        }
      }
    }

    // Perform update
    await existingModule.update({
      ModuleName: payload.ModuleName,
      ModuleDescription: payload.ModuleDescription,
      AuthLstEdt: user.UserID,
      editOnDt: new Date(),
      ModuleImagePath:
        payload.ModuleImagePath ?? existingModule.ModuleImagePath,
      SortingOrder: payload.SortingOrder ?? existingModule.SortingOrder,
    });

    logInfo("Module updated successfully");

    return {
      status: 200,
      response: {
        success: true,
        data: existingModule,
        message: "Module updated successfully",
      },
    };
  } catch (error) {
    logError("Module update failed", error);
    console.error("Detailed Error:", error); // Add this line for debug visibility

    return {
      status: 500,
      response: {
        success: false,
        data: error,
        message: "Something went wrong during module update",
      },
    };
  }
};

export const updateModuleOrderService = async (modules) => {
  const transaction = await db.sequelize.transaction();

  try {
    for (const module of modules) {
      await ModuleDetails.update(
        {
          SortingOrder: module.SortingOrder,
          editOnDt: new Date(),
        },
        {
          where: { ModuleID: module.ModuleID },
          transaction,
        }
      );
    }

    await transaction.commit();

    logInfo("Module order updated successfully");
    return {
      status: 200,
      response: {
        success: true,
        message: "Module order updated successfully",
      },
    };
  } catch (error) {
    await transaction.rollback();
    logError("Failed to update module order", error);

    return {
      status: 500,
      response: {
        success: false,
        message: "Error updating module order",
        data: error,
      },
    };
  }
};

export const updateSubModuleService = async (
  userEmail,
  subModuleId,
  payload
) => {
  try {
    const user = await User.findOne({
      where: {
        EmailId: userEmail,
        delStatus: { [Op.or]: [0, null] },
      },
    });

    if (!user) {
      logWarning("User not found during submodule update");
      return {
        status: 404,
        response: { success: false, data: {}, message: "User not found" },
      };
    }

    const subModule = await SubModulesDetails.findOne({
      where: { SubModuleID: subModuleId, delStatus: 0 },
    });

    if (!subModule) {
      return {
        status: 404,
        response: {
          success: false,
          data: {},
          message: "SubModule not found or already deleted",
        },
      };
    }

    if (
      payload.SubModuleImagePath &&
      typeof subModule.SubModuleImagePath === "string" &&
      subModule.SubModuleImagePath !== payload.SubModuleImagePath
    ) {
      const oldImagePath = path.join(
        process.cwd(),
        subModule.SubModuleImagePath
      );

      if (fs.existsSync(oldImagePath)) {
        const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");
        if (!fs.existsSync(deletedFolder))
          fs.mkdirSync(deletedFolder, { recursive: true });

        const oldFileName = path.basename(subModule.SubModuleImagePath);
        const newTrashPath = path.join(deletedFolder, oldFileName);

        try {
          fs.renameSync(oldImagePath, newTrashPath);
          logInfo(`Moved old submodule image → ${newTrashPath}`);
        } catch (err) {
          logError("Failed to move old submodule image", err);
        }
      }
    }

    await subModule.update({
      SubModuleName: payload.SubModuleName,
      SubModuleDescription:
        payload.SubModuleDescription === ""
          ? null
          : payload.SubModuleDescription,
      SubModuleImagePath:
        payload.SubModuleImagePath ?? subModule.SubModuleImagePath,
      SortingOrder: payload.SortingOrder ?? subModule.SortingOrder,
      AuthLstEdt: user.UserID,
      editOnDt: new Date(),
    });

    logInfo("SubModule updated successfully");

    return {
      status: 200,
      response: {
        success: true,
        data: subModule,
        message: "SubModule updated successfully",
      },
    };
  } catch (error) {
    logError("SubModule update failed", error);
    return {
      status: 500,
      response: {
        success: false,
        data: error,
        message: "Something went wrong during submodule update",
      },
    };
  }
};

// export const deleteModuleService = async (userEmail, moduleId) => {
//   try {
//     const user = await User.findOne({
//       where: {
//         EmailId: userEmail,
//         delStatus: { [Op.or]: [0, null] },
//       },
//     });

//     if (!user) {
//       logWarning(`User not found for email: ${userEmail}`);
//       return {
//         status: 404,
//         response: {
//           success: false,
//           message: "User not found",
//         },
//       };
//     }

//     const existingModule = await ModuleDetails.findOne({
//       where: { ModuleID: moduleId, delStatus: 0 },
//     });

//     if (!existingModule) {
//       return {
//         status: 404,
//         response: {
//           success: false,
//           message: "Module not found or already deleted",
//         },
//       };
//     }
//     if (
//       existingModule.ModuleImagePath &&
//       typeof existingModule.ModuleImagePath === "string"
//     ) {
//       const originalPath = path.join(
//         process.cwd(),
//         existingModule.ModuleImagePath
//       );

//       if (fs.existsSync(originalPath)) {
//         const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");
//         if (!fs.existsSync(deletedFolder)) {
//           fs.mkdirSync(deletedFolder, { recursive: true });
//         }

//         const fileName = path.basename(existingModule.ModuleImagePath);
//         const newPath = path.join(deletedFolder, fileName);

//         try {
//           fs.renameSync(originalPath, newPath);
//           logInfo(`Moved module image to trash → ${newPath}`);
//         } catch (err) {
//           logError("Error moving module image to trash", err);
//         }
//       }
//     }

//     await existingModule.update({
//       delStatus: 1,
//       delOnDt: new Date(),
//       AddDel: user.UserID,
//     });

//     logInfo(`Module ID ${moduleId} soft deleted by ${user.Name}`);

//     return {
//       status: 200,
//       response: {
//         success: true,
//         data: {
//           moduleId,
//           deletedAt: existingModule.delOnDt,
//           deletedBy: user.Name,
//           movedToTrash: !!existingModule.ModuleImagePath,
//         },
//         message: "Module soft-deleted successfully",
//       },
//     };

//   } catch (error) {
//     logError("Module deletion failed", error);

//     return {
//       status: 500,
//       response: {
//         success: false,
//         message: "Something went wrong during module deletion",
//         data: error,
//       },
//     };
//   }
// };

export const deleteModuleService = async (userEmail, moduleId) => {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findOne({
      where: {
        EmailId: userEmail,
        delStatus: { [Op.or]: [0, null] },
      },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      logWarning(`User not found for email: ${userEmail}`);
      return {
        status: 404,
        response: {
          success: false,
          message: "User not found",
        },
      };
    }
    const existingModule = await ModuleDetails.findOne({
      where: { ModuleID: moduleId, delStatus: 0 },
      transaction,
    });

    if (!existingModule) {
      await transaction.rollback();
      return {
        status: 404,
        response: {
          success: false,
          message: "Module not found or already deleted",
        },
      };
    }

    const subModules = await SubModulesDetails.findAll({
      where: { ModuleID: moduleId, delStatus: 0 },
      transaction,
    });

    const subModuleIds = subModules.map((s) => s.SubModuleID);

    const units = await LMSUnitsDetails.findAll({
      where: {
        SubModuleID: { [Op.in]: subModuleIds },
        delStatus: 0,
      },
      transaction,
    });

    const unitIds = units.map((u) => u.UnitID);

    const files = await LMSFilesDetails.findAll({
      where: {
        UnitID: { [Op.in]: unitIds },
        delStatus: 0,
      },
      transaction,
    });

    const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");

    if (!fs.existsSync(deletedFolder)) {
      fs.mkdirSync(deletedFolder, { recursive: true });
    }

    for (const file of files) {
      if (file.FilePath) {
        const originalPath = path.join(process.cwd(), file.FilePath);

        if (fs.existsSync(originalPath)) {
          fs.renameSync(
            originalPath,
            path.join(deletedFolder, path.basename(originalPath))
          );
        }
      }
    }

    const [filesDeleted] = await LMSFilesDetails.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AddDel: user.UserID,
      },
      {
        where: {
          UnitID: { [Op.in]: unitIds },
          delStatus: 0,
        },
        transaction,
      }
    );

    const [unitsDeleted] = await LMSUnitsDetails.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AuthDel: user.UserID,
      },
      {
        where: {
          SubModuleID: { [Op.in]: subModuleIds },
          delStatus: 0,
        },
        transaction,
      }
    );

    for (const sub of subModules) {
      if (sub.SubModuleImagePath) {
        const originalPath = path.join(process.cwd(), sub.SubModuleImagePath);

        if (fs.existsSync(originalPath)) {
          fs.renameSync(
            originalPath,
            path.join(deletedFolder, path.basename(originalPath))
          );
        }
      }
    }

    const [subModulesDeleted] = await SubModulesDetails.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AddDel: user.UserID,
      },
      {
        where: { ModuleID: moduleId, delStatus: 0 },
        transaction,
      }
    );

    if (existingModule.ModuleImagePath) {
      const originalPath = path.join(
        process.cwd(),
        existingModule.ModuleImagePath
      );

      if (fs.existsSync(originalPath)) {
        fs.renameSync(
          originalPath,
          path.join(deletedFolder, path.basename(originalPath))
        );
      }
    }

    await existingModule.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AddDel: user.UserID,
      },
      { transaction }
    );

    await transaction.commit();

    logInfo(
      `Module ${moduleId} deleted → ${subModulesDeleted} submodules, ${unitsDeleted} units, ${filesDeleted} files by ${user.Name}`
    );
    return {
      status: 200,
      response: {
        success: true,
        message:
          "Module, submodules, units, and files soft-deleted successfully",
        data: {
          moduleId,
          deletedBy: user.Name,
          subModulesDeleted,
          unitsDeleted,
          filesDeleted,
        },
      },
    };
  } catch (error) {
    await transaction.rollback();
    logError("Module deletion failed", error);

    return {
      status: 500,
      response: {
        success: false,
        message: "Something went wrong during module deletion",
        error: error.message,
      },
    };
  }
};

// export const deleteSubModuleService = async (subModuleId, adminId) => {
//   try {
//     const existingSubModule = await SubModulesDetails.findOne({
//       where: { SubModuleID: subModuleId, delStatus: 0 },
//     });

//     if (!existingSubModule) {
//       return {
//         status: 404,
//         response: {
//           success: false,
//           message: "Sub-module not found or already deleted",
//         },
//       };
//     }

//     if (
//       existingSubModule.SubModuleImagePath &&
//       typeof existingSubModule.SubModuleImagePath === "string"
//     ) {
//       const originalPath = path.join(
//         process.cwd(),
//         existingSubModule.SubModuleImagePath
//       );

//       if (fs.existsSync(originalPath)) {
//         const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");
//         if (!fs.existsSync(deletedFolder)) {
//           fs.mkdirSync(deletedFolder, { recursive: true });
//         }

//         const fileName = path.basename(existingSubModule.SubModuleImagePath);
//         const newPath = path.join(deletedFolder, fileName);

//         try {
//           fs.renameSync(originalPath, newPath);
//           logInfo(`Moved submodule image to trash → ${newPath}`);
//         } catch (err) {
//           logError("Error moving submodule image to trash", err);
//         }
//       }
//     }

//     existingSubModule.delStatus = 1;
//     existingSubModule.delOnDt = new Date();
//     existingSubModule.AddDel = adminId;
//     await existingSubModule.save();

//     return {
//       status: 200,
//       response: {
//         success: true,
//         data: {
//           subModuleId,
//           deletedAt: existingSubModule.delOnDt,
//           deletedBy: adminId,
//         },
//         message: "Sub-module soft-deleted & image moved to trash",
//       },
//     };
//   } catch (error) {
//     logError("Sub-module deletion failed", error);
//     return {
//       status: 500,
//       response: {
//         success: false,
//         data: { message: error.message, stack: error.stack },
//         message: "Something went wrong during sub-module deletion",
//       },
//     };
//   }
// };

export const deleteSubModuleService = async (subModuleId, adminId) => {
  const transaction = await sequelize.transaction();

  try {
    const existingSubModule = await SubModulesDetails.findOne({
      where: { SubModuleID: subModuleId, delStatus: 0 },
      transaction,
    });

    if (!existingSubModule) {
      await transaction.rollback();
      return {
        status: 404,
        response: {
          success: false,
          message: "Sub-module not found or already deleted",
        },
      };
    }

    const units = await LMSUnitsDetails.findAll({
      where: {
        SubModuleID: subModuleId,
        delStatus: 0,
      },
      transaction,
    });

    const unitIds = units.map((u) => u.UnitID);
    const files = await LMSFilesDetails.findAll({
      where: {
        UnitID: { [Op.in]: unitIds },
        delStatus: 0,
      },
      transaction,
    });

    const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");

    if (!fs.existsSync(deletedFolder)) {
      fs.mkdirSync(deletedFolder, { recursive: true });
    }
    for (const file of files) {
      if (file.FilePath) {
        const originalPath = path.join(process.cwd(), file.FilePath);

        if (fs.existsSync(originalPath)) {
          fs.renameSync(
            originalPath,
            path.join(deletedFolder, path.basename(originalPath))
          );
        }
      }
    }
    const [filesDeleted] = await LMSFilesDetails.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AddDel: adminId,
      },
      {
        where: {
          UnitID: { [Op.in]: unitIds },
          delStatus: 0,
        },
        transaction,
      }
    );
    const [unitsDeleted] = await LMSUnitsDetails.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AuthDel: adminId,
      },
      {
        where: {
          SubModuleID: subModuleId,
          delStatus: 0,
        },
        transaction,
      }
    );
    if (existingSubModule.SubModuleImagePath) {
      const originalPath = path.join(
        process.cwd(),
        existingSubModule.SubModuleImagePath
      );

      if (fs.existsSync(originalPath)) {
        fs.renameSync(
          originalPath,
          path.join(deletedFolder, path.basename(originalPath))
        );
      }
    }
    await existingSubModule.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AddDel: adminId,
      },
      { transaction }
    );

    await transaction.commit();

    logInfo(
      `SubModule ${subModuleId} deleted → ${unitsDeleted} units, ${filesDeleted} files by admin ${adminId}`
    );

    return {
      status: 200,
      response: {
        success: true,
        message: "Sub-module, units, and files soft-deleted successfully",
        data: {
          subModuleId,
          unitsDeleted,
          filesDeleted,
          deletedBy: adminId,
        },
      },
    };
  } catch (error) {
    await transaction.rollback();
    logError("Sub-module deletion failed", error);

    return {
      status: 500,
      response: {
        success: false,
        message: "Something went wrong during sub-module deletion",
        error: error.message,
      },
    };
  }
};

export const updateFileService = async (userId, fileId, updateData) => {
  try {
    // Find user
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { UserID: !isNaN(Number(userId)) ? Number(userId) : null },
          {
            EmailId:
              typeof userId === "string" && userId.includes("@")
                ? userId
                : null,
          },
        ],
        delStatus: { [Op.or]: [0, null] },
      },
    });

    if (!user) {
      logWarning("User not found during file update");
      return {
        success: false,
        data: {},
        message: "User not found - please login first",
      };
    }

    // Find the file
    const file = await LMSFilesDetails.findOne({
      where: {
        FileID: fileId,
        delStatus: { [Op.or]: [0, null] },
      },
    });

    if (!file) {
      logWarning("File not found or already deleted");
      return {
        success: false,
        data: {},
        message: "File not found or already deleted",
      };
    }

    // Prepare update data
    const updatePayload = {
      FilesName: updateData.fileName ?? file.FilesName,
      Description: updateData.description ?? file.Description,
      EstimatedTime: updateData.estimatedTime ?? file.EstimatedTime,
      AuthLstEdt: user.UserID,
      editOnDt: new Date(),
    };

    // Add link update if file type is link
    if (file.FileType === "link" && updateData.link) {
      updatePayload.FilePath = updateData.link;
    }

    // Update the file
    await file.update(updatePayload);

    logInfo("File updated successfully");

    return {
      success: true,
      data: file,
      message: "File updated successfully",
    };
  } catch (error) {
    logError("File update failed", error);
    console.error("Database Error:", error);

    return {
      success: false,
      data: error,
      message: error.message.includes("Conversion failed")
        ? "Invalid data type in database operation"
        : "Something went wrong please try again",
    };
  }
};

export const recordFileViewService = async (userEmail, FileID) => {
  if (!FileID) {
    return { success: false, status: 400, message: "FileID is required" };
  }

  try {
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
    });

    if (!user) {
      return { success: false, status: 404, message: "User not found" };
    }

    // Create a new progress record with StartTime
    const progress = await LMSUserProgress.create({
      UserID: user.UserID,
      FileID,
      AuthAdd: user.UserID,
      AddOnDt: new Date(),
      StartTime: new Date(),
      delStatus: 0,
    });

    return {
      success: true,
      message: "File view recorded successfully",
      progressId: progress.ProgressID, // Important! Return ProgressID
    };
  } catch (error) {
    console.error("Error in recordFileViewService:", error);
    return {
      success: false,
      status: 500,
      message: "Failed to record file view",
    };
  }
};

export const updateFileViewEndTimeService = async (userEmail, FileID) => {
  if (!FileID || !userEmail) {
    return {
      success: false,
      status: 400,
      message: "FileID and userEmail are required",
    };
  }

  try {
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
    });

    if (!user) {
      return { success: false, status: 404, message: "User not found" };
    }

    // Find the latest progress record
    const latestProgress = await LMSUserProgress.findOne({
      where: {
        FileID: FileID,
        UserID: user.UserID,
        delStatus: 0,
        EndTime: null, // only active record
      },
      order: [["StartTime", "DESC"]],
    });

    if (!latestProgress) {
      return {
        success: false,
        status: 404,
        message: "No active progress record found to update",
      };
    }

    const endTime = new Date();
    const startTime = latestProgress.StartTime;

    if (!startTime) {
      return {
        success: false,
        status: 400,
        message: "Start time not recorded for this file",
      };
    }

    // Calculate time spent in seconds
    const diffMs = endTime - new Date(startTime);
    const diffSeconds = Math.floor(diffMs / 1000); // seconds

    // Update with EndTime + calculated time
    await LMSUserProgress.update(
      {
        EndTime: endTime,
        TimeSpentSeconds: diffSeconds,
        editOnDt: new Date(),
      },
      {
        where: {
          ID: latestProgress.ID, // use your actual PK column
          UserID: user.UserID,
          delStatus: 0,
        },
      }
    );

    return {
      success: true,
      message: `File view end time updated successfully. Time spent: ${diffSeconds} seconds`,
    };
  } catch (error) {
    console.error("Error in updateFileViewEndTimeService:", error);
    return {
      success: false,
      status: 500,
      message: "Internal server error",
    };
  }
};

export const addSubmoduleService = async ({
  SubModuleName,
  SubModuleDescription,
  ModuleID,
  SubModuleImagePath,
  SubModuleImage,
  userId,
}) => {
  const transaction = await db.sequelize.transaction();

  try {
    // ✅ Step 1: Validate Module
    const module = await db.LMSModulesDetails.findOne({
      where: { ModuleID, delStatus: 0 },
    });

    if (!module) throw new Error("Module not found");

    // ✅ Step 2: Validate User — FIXED Op import here
    const user = await db.User.findOne({
      where: {
        [Op.or]: [{ UserID: userId }, { id: userId }],
        [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
      },
    });

    if (!user) throw new Error("User not found");

    // ✅ Step 3: Determine Image Path
    let imagePath = null;
    if (SubModuleImage) {
      imagePath = SubModuleImage.path?.replace("public/", "");
    } else if (SubModuleImagePath) {
      imagePath = SubModuleImagePath;
    }

    // ✅ Step 4: Create Submodule
    const newSubmodule = await db.LMSSubModulesDetails.create(
      {
        SubModuleName,
        SubModuleImagePath: imagePath,
        SubModuleDescription,
        ModuleID,
        AuthAdd: user.UserID,
        AddOnDt: new Date(),
        delStatus: 0,
      },
      { transaction }
    );

    // ✅ Step 5: Create Corresponding Group
    const groupName = `${SubModuleName} (${module.ModuleName})`;
    await db.Group_Master.create(
      {
        group_name: groupName,
        group_category: "submodule",
        SubModuleID: newSubmodule.SubModuleID,
        AuthAdd: user.Name,
        AddOnDt: new Date(),
        delStatus: 0,
      },
      { transaction }
    );

    // ✅ Step 6: Commit Transaction
    await transaction.commit();

    // ✅ Step 7: Return new submodule
    const result = await db.LMSSubModulesDetails.findOne({
      where: { SubModuleID: newSubmodule.SubModuleID },
    });

    return {
      success: true,
      message: "Submodule and corresponding group added successfully",
      data: result,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const addUnitService = async ({
  UnitName,
  UnitDescription,
  SubModuleID,
  userId,
}) => {
  const t = await db.sequelize.transaction();
  try {
    // Find user by ID or email
    const user = await db.User.findOne({
      where: {
        [Op.or]: [{ UserID: userId }, { EmailId: userId }],
        delStatus: 0,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Create Unit
    const newUnit = await db.LMSUnitsDetails.create(
      {
        UnitName,
        UnitDescription: UnitDescription || null,
        SubModuleID,
        AuthAdd: user.UserID,
        AddOnDt: new Date(),
        delStatus: 0,
      },
      { transaction: t }
    );

    await t.commit();
    return { success: true, data: newUnit };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const deleteUnitService = async (userEmail, unitId) => {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findOne({
      where: {
        EmailId: userEmail,
        delStatus: { [Op.or]: [0, null] },
      },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      logWarning(`User not found for email: ${userEmail}`);
      return {
        status: 404,
        response: {
          success: false,
          message: "User not found",
        },
      };
    }

    const existingUnit = await LMSUnitsDetails.findOne({
      where: { UnitID: unitId, delStatus: 0 },
      transaction,
    });

    if (!existingUnit) {
      await transaction.rollback();
      return {
        status: 404,
        response: {
          success: false,
          message: "Unit not found or already deleted",
        },
      };
    }

    const files = await LMSFilesDetails.findAll({
      where: {
        UnitID: unitId,
        delStatus: 0,
      },
      transaction,
    });

    const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");

    if (!fs.existsSync(deletedFolder)) {
      fs.mkdirSync(deletedFolder, { recursive: true });
    }

    for (const file of files) {
      if (file.FilePath) {
        const originalPath = path.join(process.cwd(), file.FilePath);

        if (fs.existsSync(originalPath)) {
          fs.renameSync(
            originalPath,
            path.join(deletedFolder, path.basename(originalPath))
          );
        }
      }
    }
    const [filesDeleted] = await LMSFilesDetails.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AddDel: user.UserID,
      },
      {
        where: {
          UnitID: unitId,
          delStatus: 0,
        },
        transaction,
      }
    );

    await existingUnit.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AuthDel: user.UserID,
      },
      { transaction }
    );

    await transaction.commit();

    logInfo(
      `Unit ${unitId} deleted with ${filesDeleted} files by ${user.Name}`
    );

    return {
      status: 200,
      response: {
        success: true,
        message: "Unit and related files soft-deleted successfully",
        data: {
          unitId,
          filesDeleted,
          deletedBy: user.Name,
          deletedAt: new Date(),
        },
      },
    };
  } catch (error) {
    await transaction.rollback();
    logError("❌ Error deleting unit:", error);

    return {
      status: 500,
      response: {
        success: false,
        message: "Something went wrong during unit deletion",
        error: error.message,
      },
    };
  }
};

export const deleteFileService = async (userEmail, fileId) => {
  try {
    // 🔹 Step 1: Find the user performing deletion
    const user = await User.findOne({
      where: {
        EmailId: userEmail,
        delStatus: { [Op.or]: [0, null] },
      },
    });

    if (!user) {
      logWarning(`User not found for email: ${userEmail}`);
      return {
        status: 404,
        response: {
          success: false,
          message: "User not found",
        },
      };
    }

    // 🔹 Step 2: Find the file
    const existingFile = await LMSFilesDetails.findOne({
      where: { FileID: fileId, delStatus: { [Op.or]: [0, null] } },
    });

    if (!existingFile) {
      return {
        status: 404,
        response: {
          success: false,
          message: "File not found or already deleted",
        },
      };
    }

    const unitId = existingFile.UnitID;

    // 🔹 Step 3: Move file to deleted-files folder if exists
    if (existingFile.FilePath && typeof existingFile.FilePath === "string") {
      const originalPath = path.join(process.cwd(), existingFile.FilePath);

      if (fs.existsSync(originalPath)) {
        const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");
        if (!fs.existsSync(deletedFolder)) {
          fs.mkdirSync(deletedFolder, { recursive: true });
        }

        const fileName = path.basename(existingFile.FilePath);
        const newPath = path.join(deletedFolder, fileName);

        try {
          fs.renameSync(originalPath, newPath);
          logInfo(`Moved file to trash → ${newPath}`);
        } catch (err) {
          logError("Error moving file to trash", err);
        }
      }
    }

    // 🔹 Step 4: Perform soft delete
    await existingFile.update({
      delStatus: 1,
      delOnDt: new Date(),
      AddDel: user.UserID,
    });

    // 🔹 Step 5: Count remaining active files in this unit
    const remainingFilesCount = await LMSFilesDetails.count({
      where: { UnitID: unitId, delStatus: { [Op.or]: [0, null] } },
    });

    // 🔹 Step 6: Update percentage for remaining files
    let newPercentage = 0;
    if (remainingFilesCount > 0) {
      newPercentage = (100 / remainingFilesCount).toFixed(2);
      await LMSFilesDetails.update(
        { Percentage: newPercentage },
        { where: { UnitID: unitId, delStatus: { [Op.or]: [0, null] } } }
      );
    }

    // 🔹 Step 7: Return response
    logInfo(`File ID ${fileId} soft deleted by ${user.Name}`);

    return {
      status: 200,
      response: {
        success: true,
        data: {
          fileId,
          deletedAt: new Date(),
          deletedBy: user.Name,
          fileName: existingFile.FilesName,
          unitId,
          remainingFiles: remainingFilesCount,
          newPercentage,
        },
        message: "File soft-deleted successfully",
      },
    };
  } catch (error) {
    logError("❌ Error deleting file:", error);
    return {
      status: 500,
      response: {
        success: false,
        message: "Something went wrong during file deletion",
        data: error,
      },
    };
  }
};

export const updateUnitOrderService = async (units) => {
  const transaction = await db.sequelize.transaction();

  try {
    for (const unit of units) {
      await LMSUnitsDetails.update(
        {
          SortingOrder: unit.SortingOrder,
          editOnDt: new Date(),
        },
        {
          where: { UnitID: unit.UnitID },
          transaction,
        }
      );
    }

    await transaction.commit();

    logInfo("Unit order updated successfully");
    return {
      status: 200,
      response: {
        success: true,
        message: "Unit order updated successfully",
      },
    };
  } catch (error) {
    await transaction.rollback();
    logError("Failed to update unit order", error);

    return {
      status: 500,
      response: {
        success: false,
        message: "Error updating unit order",
        error: error.message,
      },
    };
  }
};

export const updateUnitService = async (userEmail, unitId, payload) => {
  try {
    const user = await User.findOne({
      where: {
        EmailId: userEmail,
        delStatus: { [Op.or]: [0, null] },
      },
    });

    if (!user) {
      logWarning("User not found during unit update");
      return {
        status: 404,
        response: {
          success: false,
          data: {},
          message: "User not found",
        },
      };
    }

    const unit = await LMSUnitsDetails.findOne({
      where: {
        UnitID: unitId,
        delStatus: 0,
      },
    });

    if (!unit) {
      return {
        status: 404,
        response: {
          success: false,
          data: {},
          message: "Unit not found or already deleted",
        },
      };
    }
    if (
      payload.UnitImagePath &&
      typeof unit.UnitImagePath === "string" &&
      unit.UnitImagePath !== payload.UnitImagePath
    ) {
      const oldImagePath = path.join(process.cwd(), unit.UnitImagePath);

      if (fs.existsSync(oldImagePath)) {
        const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");
        if (!fs.existsSync(deletedFolder)) {
          fs.mkdirSync(deletedFolder, { recursive: true });
        }

        const oldFileName = path.basename(unit.UnitImagePath);
        const newTrashPath = path.join(deletedFolder, oldFileName);

        try {
          fs.renameSync(oldImagePath, newTrashPath);
          logInfo(`Moved old unit image → ${newTrashPath}`);
        } catch (err) {
          logError("Failed to move old unit image", err);
        }
      }
    }

    const updateData = {
      UnitName: payload.UnitName,
      UnitDescription:
        payload.UnitDescription === "" ? null : payload.UnitDescription,
      AuthLstEdt: user.Name, 
      editOnDt: new Date(),
    };
    if (payload.UnitImagePath !== undefined) {
      updateData.UnitImagePath = payload.UnitImagePath;
    }

    if (payload.UnitImg !== undefined) {
      updateData.UnitImg = payload.UnitImg;
    }
    if (payload.SortingOrder !== undefined) {
      updateData.SortingOrder = payload.SortingOrder;
    }

    await unit.update(updateData);

    logInfo("Unit updated successfully");
    return {
      status: 200,
      response: {
        success: true,
        data: unit,
        message: "Unit updated successfully",
      },
    };
  } catch (error) {
    logError("Unit update failed", error);
    return {
      status: 500,
      response: {
        success: false,
        data: error,
        message: "Something went wrong during unit update",
      },
    };
  }
};

const getUserByIdOrEmail = async (userId) => {
  const connection = await connectToDatabase();

  try {
    let userQuery, userRows;

    if (!isNaN(Number(userId))) {
      userQuery = `
        SELECT UserID, Name, isAdmin FROM Community_User 
        WHERE ISNULL(delStatus, 0) = 0 AND UserID = ?
      `;
      userRows = await queryAsync(connection, userQuery, [Number(userId)]);
    }

    if (
      (!userRows || userRows.length === 0) &&
      typeof userId === "string" &&
      userId.includes("@")
    ) {
      userQuery = `
        SELECT UserID, Name, isAdmin FROM Community_User 
        WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?
      `;
      userRows = await queryAsync(connection, userQuery, [userId]);
    }

    closeConnection(connection);
    return userRows && userRows.length > 0 ? userRows[0] : null;
  } catch (error) {
    closeConnection(connection);
    logError("Error fetching user", error);
    return null;
  }
};
