import path from "path";
import fs from "fs";
import db from "../models/index.js";
import { logInfo, logWarning, logError } from "../helper/index.js";
import { Op } from "sequelize";
import UserLmsProgress from "../models/UserLmsProgress.js";


const User = db.User;
const ModuleDetails = db.LMSModulesDetails;
const SubModulesDetails = db.LMSSubModulesDetails;
const LMSFilesDetails = db.LMSFilesDetails
const LMSUserProgress = db.LMSUserProgress



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
    if (payload.ModuleImagePath && existingModule.ModuleImagePath !== payload.ModuleImagePath) {
      if (existingModule.ModuleImagePath) {  // Add this guard
        const oldImagePath = path.join(process.cwd(), existingModule.ModuleImagePath);

        if (fs.existsSync(oldImagePath)) {
          const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");
          if (!fs.existsSync(deletedFolder)) fs.mkdirSync(deletedFolder, { recursive: true });

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
      AuthLstEdt: user.Name,
      editOnDt: new Date(),
      ModuleImagePath: payload.ModuleImagePath ?? existingModule.ModuleImagePath,
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
    console.error("Detailed Error:", error);  // Add this line for debug visibility

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

export const updateSubModuleService = async (userEmail, subModuleId, payload) => {
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
      where: { SubModuleID: subModuleId, delStatus: 0 }
    });

    if (!subModule) {
      return {
        status: 404,
        response: { success: false, data: {}, message: "SubModule not found or already deleted" },
      };
    }

    if (
      payload.SubModuleImagePath &&
      typeof subModule.SubModuleImagePath === "string" &&
      subModule.SubModuleImagePath !== payload.SubModuleImagePath
    ) {
      const oldImagePath = path.join(process.cwd(), subModule.SubModuleImagePath);

      if (fs.existsSync(oldImagePath)) {
        const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");
        if (!fs.existsSync(deletedFolder)) fs.mkdirSync(deletedFolder, { recursive: true });

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
      SubModuleDescription: payload.SubModuleDescription === "" ? null : payload.SubModuleDescription,
      SubModuleImagePath: payload.SubModuleImagePath ?? subModule.SubModuleImagePath,
      SortingOrder: payload.SortingOrder ?? subModule.SortingOrder,
      AuthLstEdt: user.Name,
      editOnDt: new Date()
    });

    logInfo("SubModule updated successfully");

    return {
      status: 200,
      response: { success: true, data: subModule, message: "SubModule updated successfully" },
    };
  } catch (error) {
    logError("SubModule update failed", error);
    return {
      status: 500,
      response: { success: false, data: error, message: "Something went wrong during submodule update" },
    };
  }
};

export const deleteModuleService = async (moduleId) => {
  try {
    // Find the module by ID and delStatus
    const existingModule = await ModuleDetails.findOne({
      where: { ModuleID: moduleId, delStatus: 0 }
    });

    if (!existingModule) {
      return {
        status: 404,
        response: { success: false, message: "Module not found or already deleted" }
      };
    }

    // Move image to deleted-files folder if present
    if (existingModule.ModuleImagePath && typeof existingModule.ModuleImagePath === "string") {
      const originalPath = path.join(process.cwd(), existingModule.ModuleImagePath);

      if (fs.existsSync(originalPath)) {
        const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");
        if (!fs.existsSync(deletedFolder)) {
          fs.mkdirSync(deletedFolder, { recursive: true });
        }

        const fileName = path.basename(existingModule.ModuleImagePath);
        const newPath = path.join(deletedFolder, fileName);

        try {
          fs.renameSync(originalPath, newPath);
          logInfo(`Moved module image to trash → ${newPath}`);
        } catch (err) {
          logError("Error moving module image to trash", err);
        }
      }
    }

    // Perform soft delete
    existingModule.delStatus = 1;
    existingModule.delOnDt = new Date();
    await existingModule.save();

    return {
      status: 200,
      response: {
        success: true,
        data: { moduleId, deletedAt: existingModule.delOnDt, movedToTrash: true },
        message: "Module soft-deleted & image moved to trash"
      }
    };
  } catch (error) {
    logError("Module deletion failed", error);
    return {
      status: 500,
      response: {
        success: false,
        data: error,
        message: "Something went wrong during module deletion"
      }
    };
  }
};

export const deleteSubModuleService = async (subModuleId, adminId) => {
  try {
    const existingSubModule = await SubModulesDetails.findOne({
      where: { SubModuleID: subModuleId, delStatus: 0 }
    });

    if (!existingSubModule) {
      return {
        status: 404,
        response: {
          success: false,
          message: "Sub-module not found or already deleted"
        }
      };
    }

    if (existingSubModule.SubModuleImagePath && typeof existingSubModule.SubModuleImagePath === "string") {
      const originalPath = path.join(process.cwd(), existingSubModule.SubModuleImagePath);

      if (fs.existsSync(originalPath)) {
        const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");
        if (!fs.existsSync(deletedFolder)) {
          fs.mkdirSync(deletedFolder, { recursive: true });
        }

        const fileName = path.basename(existingSubModule.SubModuleImagePath);
        const newPath = path.join(deletedFolder, fileName);

        try {
          fs.renameSync(originalPath, newPath);
          logInfo(`Moved submodule image to trash → ${newPath}`);
        } catch (err) {
          logError("Error moving submodule image to trash", err);
        }
      }
    }

    existingSubModule.delStatus = 1;
    existingSubModule.delOnDt = new Date();
    existingSubModule.AddDel = adminId;
    await existingSubModule.save();

    return {
      status: 200,
      response: {
        success: true,
        data: {
          subModuleId,
          deletedAt: existingSubModule.delOnDt,
          deletedBy: adminId,
        },
        message: "Sub-module soft-deleted & image moved to trash"
      }
    };
  } catch (error) {
    logError("Sub-module deletion failed", error);
    return {
      status: 500,
      response: {
        success: false,
        data: { message: error.message, stack: error.stack },
        message: "Something went wrong during sub-module deletion"
      }
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
          { EmailId: typeof userId === "string" && userId.includes("@") ? userId : null }
        ],
        delStatus: { [Op.or]: [0, null] }
      }
    });

    if (!user) {
      logWarning("User not found during file update");
      return {
        success: false,
        data: {},
        message: "User not found - please login first"
      };
    }

    // Find the file
    const file = await LMSFilesDetails.findOne({
      where: {
        FileID: fileId,
        delStatus: { [Op.or]: [0, null] }
      }
    });

    if (!file) {
      logWarning("File not found or already deleted");
      return {
        success: false,
        data: {},
        message: "File not found or already deleted"
      };
    }

    // Prepare update data
    const updatePayload = {
      FilesName: updateData.fileName ?? file.FilesName,
      Description: updateData.description ?? file.Description,
      EstimatedTime: updateData.estimatedTime ?? file.EstimatedTime,
      AuthLstEdt: user.Name,
      editOnDt: new Date()
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
      message: "File updated successfully"
    };
  } catch (error) {
    logError("File update failed", error);
    console.error("Database Error:", error);

    return {
      success: false,
      data: error,
      message: error.message.includes("Conversion failed")
        ? "Invalid data type in database operation"
        : "Something went wrong please try again"
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
      AuthAdd: user.Name,
      AddOnDt: new Date(),
      StartTime: new Date(),
      delStatus: 0,
    });

    return {
      success: true,
      message: "File view recorded successfully",
      progressId: progress.ProgressID,  // Important! Return ProgressID
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
    return { success: false, status: 400, message: "FileID and userEmail are required" };
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
        AuthAdd: user.Name,
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







