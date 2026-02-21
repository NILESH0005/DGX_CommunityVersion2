// services/progressService.js
import db, { sequelize } from "../models/index.js";
import { Sequelize } from "sequelize";
const { ContentInteractionLog } = db;

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
      const currentDate = new Date();

      const result = await db.sequelize.transaction(async (transaction) => {
        const existingView = await ContentInteractionLog.findOne({
          where: {
            ProcessName,
            UserID: userId,
            reference,
            View: 1,
            delStatus: 0,
          },
          transaction,
        });

        if (existingView) {
          console.log("User has already viewed this content, skipping");
          return {
            success: true,
            data: {
              viewId: existingView.id,
              viewCount: 1,
              message: "View was already recorded previously",
              alreadyViewed: true,
            },
          };
        }

        const newViewRecord = await ContentInteractionLog.create(
          {
            ProcessName,
            UserID: userId,
            reference,
            Likes: null,
            Dislike: null,
            Rating: null,
            View: 1, 
            Comments: null,
            AuthAdd: userId.toString(),
            AuthDel: null,
            AuthLstEdt: null,
            delOnDt: null,
            AddOnDt: currentDate,
            editOnDt: null,
            delStatus: 0,
          },
          { transaction }
        );

        console.log("Created new view record:", newViewRecord.id);

        // Update the main content_interaction table
        let mainInteraction = await db.ContentInteraction.findOne({
          where: {
            Type: ProcessName,
            UserID: userId,
            ReferenceId: reference,
            delStatus: 0,
          },
          transaction,
        });

        if (mainInteraction) {
          // Update view count in main table
          await db.ContentInteraction.update(
            {
              View: 1, // Set to 1 to indicate user has viewed
              AuthLstEdt: userId.toString(),
              editOnDt: currentDate,
            },
            {
              where: { Id: mainInteraction.Id },
              transaction,
            }
          );
        } else {
          // Create new entry in main table
          mainInteraction = await db.ContentInteraction.create(
            {
              Type: ProcessName,
              ReferenceId: reference,
              UserID: userId,
              Likes: 0,
              Dislikes: 0,
              View: 1, // First view
              Rating: null,
              Repost: null,
              Comments: null,
              AuthAdd: userId.toString(),
              AuthDel: null,
              AuthLstEdt: null,
              delOnDt: null,
              AddOnDt: currentDate,
              editOnDt: null,
              delStatus: 0,
            },
            { transaction }
          );
        }

        return {
          success: true,
          data: {
            viewId: newViewRecord.id,
            mainInteractionId: mainInteraction.Id,
            viewCount: 1,
            message: "View recorded successfully for the first time",
            alreadyViewed: false,
          },
        };
      });

      return result;
    } catch (error) {
      console.error("View Service Error:", error);

      // Handle unique constraint violations
      if (error.name === "SequelizeUniqueConstraintError") {
        console.log("Unique constraint violation - view might already exist");
        try {
          const user = await db.User.findOne({
            where: { EmailId: userEmail, delStatus: 0 },
            attributes: ["UserID"],
          });

          const existing = await ContentInteractionLog.findOne({
            where: {
              ProcessName: viewData.ProcessName,
              UserID: user.UserID,
              reference: viewData.reference,
              View: 1,
              delStatus: 0,
            },
          });

          if (existing) {
            return {
              success: true,
              data: {
                viewId: existing.id,
                viewCount: 1,
                message: "View was already recorded",
                alreadyViewed: true,
              },
            };
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
        }
      }

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
      const views = await ContentInteractionLog.findAll({
        where: {
          ProcessName,
          reference,
          delStatus: 0,
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

      const interaction = await ContentInteractionLog.findOne({
        where: {
          ProcessName,
          UserID: user.UserID,
          reference,
          delStatus: 0,
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
