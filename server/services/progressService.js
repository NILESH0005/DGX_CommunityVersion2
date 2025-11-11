// services/progressService.js
import db, { sequelize } from "../models/index.js";
import { Sequelize } from "sequelize";
const { ContentInteraction } = db;

export const getModuleSubmoduleProgressService = async (
  userEmail,
  moduleID
) => {
  // First, find user
  const user = await db.User.findOne({
    where: { EmailId: userEmail, delStatus: 0 },
    attributes: ["UserID"],
  });

  if (!user) {
    throw new Error("User not found");
  }

  const userID = user.UserID;

  const results = await db.LMSSubModulesDetails.findAll({
    where: { ModuleID: moduleID, delStatus: 0 },
    attributes: [
      "SubModuleID",
      "SubModuleName",
      [
        sequelize.literal(`(
        SELECT COUNT(F.FileID)
        FROM UnitsDetails U
        JOIN FilesDetails F ON U.UnitID = F.UnitID AND IFNULL(F.delStatus,0)=0
        WHERE U.SubModuleID = submodulesdetails.SubModuleID AND IFNULL(U.delStatus,0)=0
      )`),
        "totalFileCount",
      ],
      [
        sequelize.literal(`(
        SELECT COUNT(F.FileID)
        FROM UnitsDetails U
        JOIN FilesDetails F ON U.UnitID = F.UnitID AND IFNULL(F.delStatus,0)=0
        JOIN UserLmsProgress P ON P.FileID = F.FileID AND P.UserID = ${userID} AND IFNULL(P.delStatus,0)=0
        WHERE U.SubModuleID = submodulesdetails.SubModuleID AND IFNULL(U.delStatus,0)=0
      )`),
        "readCount",
      ],
    ],
    raw: true,
  });

  return results;
};

export const getUserFileIDsService = async (userEmail) => {
  // Find user by email
  const user = await db.User.findOne({
    where: { EmailId: userEmail, delStatus: 0 },
    attributes: ["UserID"],
  });

  if (!user) {
    throw new Error("User not found");
  }

  const userID = user.UserID;

  // Count total files in progress
  const totalCount = await db.LMSUserProgress.count({
    where: { UserID: userID, delStatus: 0 },
  });

  // Fetch all FileIDs in descending order
  const fileIds = await db.LMSUserProgress.findAll({
    where: { UserID: userID, delStatus: 0 },
    attributes: ["FileID"],
    order: [["FileID", "DESC"]],
    raw: true,
  });

  return { fileIds, totalCount };
};

export class ViewService {
  /**
   * Record a view for any module (Discussion, Blog, Event, LMS) - ONLY ONCE per user per content
   * @param {string} userEmail - User's email
   * @param {Object} viewData - View data containing module info
   * @returns {Object} - Result of the view recording operation
   */
  static async handleViewAction(userEmail, viewData) {
    try {
      const { ProcessName, reference } = viewData;

      if (!ProcessName || !reference) {
        throw new Error("ProcessName and reference are required");
      }

      // Validate ProcessName
      const validProcesses = ["Discussion", "Blog", "Event", "LMS"];
      if (!validProcesses.includes(ProcessName)) {
        throw new Error(
          "Invalid ProcessName. Must be one of: Discussion, Blog, Event, LMS"
        );
      }

      console.log("Service - Recording view for:", {
        ProcessName,
        reference,
        userEmail,
      });

      // Fetch user from database using email
      const user = await db.User.findOne({
        where: {
          EmailId: userEmail,
          delStatus: 0,
        },
        attributes: ["UserID", "Name", "EmailId"],
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userId = user.UserID;
      const userName = user.Name || "Unknown User";
      const currentDate = new Date();

      // Check if any interaction exists for this user & content
      let interaction = await ContentInteraction.findOne({
        where: {
          ProcessName,
          UserID: userId,
          reference,
          delStatus: 0,
        },
      });

      if (interaction) {
        if (!interaction.View) {
          // Row exists but View is empty → update it
          interaction.View = 1;
          interaction.ViewStatus = 0;
          interaction.AuthLstEdt = userName;
          interaction.editOnDt = currentDate;
          await interaction.save();

          console.log(
            "Updated existing interaction with new view:",
            interaction.id
          );

          return {
            success: true,
            data: {
              viewId: interaction.id,
              viewCount: interaction.View,
              message: "View recorded successfully",
              alreadyViewed: false,
            },
          };
        } else {
          // Row exists and View already recorded → do nothing
          console.log("View already recorded, skipping");
          return {
            success: true,
            data: {
              viewId: interaction.id,
              viewCount: interaction.View,
              message: "View was already recorded previously",
              alreadyViewed: true,
            },
          };
        }
      }

      // No row exists → create new interaction
      const newInteraction = await ContentInteraction.create({
        ProcessName,
        UserID: userId,
        reference,
        Likes: null,
        LikeStatus: null,
        Rating: null,
        RatingStatus: null,
        SubModuleID: viewData.SubModuleID || null,
        ViewStatus: 0,
        View: 1,
        AuthAdd: userId,
        AddOnDt: currentDate,
        delStatus: 0,
      });

      console.log("Created new view record:", newInteraction.id);

      return {
        success: true,
        data: {
          viewId: newInteraction.id,
          viewCount: 1,
          message: "View recorded successfully for the first time",
          alreadyViewed: false,
        },
      };

    } catch (error) {
      console.error("View Service Error:", error);
      throw error;
    }
  }

  /**
   * Get view count for specific content
   * @param {string} ProcessName - Module name
   * @param {number} reference - Content ID
   * @returns {Object} - View statistics
   */
  static async getViewStats(ProcessName, reference) {
    try {
      const views = await ContentInteraction.findAll({
        where: {
          ProcessName,
          reference,
          delStatus: 0,
          ViewStatus: 0,
        },
        attributes: [
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "uniqueViewers"],
        ],
        raw: true,
      });

      return {
        success: true,
        data: {
          uniqueViewers: parseInt(views[0]?.uniqueViewers) || 0,
        },
      };
    } catch (error) {
      console.error("Get View Stats Error:", error);
      throw error;
    }
  }

  /**
   * Check if user has viewed specific content
   * @param {string} userEmail - User's email
   * @param {string} ProcessName - Module name
   * @param {number} reference - Content ID
   * @returns {Object} - View status
   */
  static async checkUserViewStatus(userEmail, ProcessName, reference) {
    try {
      const user = await db.User.findOne({
        where: {
          EmailId: userEmail,
          delStatus: 0,
        },
        attributes: ["UserID"],
      });

      if (!user) {
        throw new Error("User not found");
      }

      const interaction = await ContentInteraction.findOne({
        where: {
          ProcessName,
          UserID: user.UserID,
          reference,
          delStatus: 0,
          ViewStatus: 0,
        },
        attributes: ["id", "View", "AddOnDt"],
      });

      return {
        success: true,
        data: {
          hasViewed: !!interaction,
          viewCount: interaction?.View || 0,
          firstViewed: interaction?.AddOnDt || null,
        },
      };
    } catch (error) {
      console.error("Check User View Status Error:", error);
      throw error;
    }
  }
}
