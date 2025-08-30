// services/progressService.js
import db, { sequelize } from "../models/index.js";
import { Sequelize } from "sequelize";

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
