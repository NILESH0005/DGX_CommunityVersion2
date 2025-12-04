import db, { sequelize } from "../models/index.js";

const {
  TableDDReference,
  Group_Master,
  LMSModulesDetails,
  LMSSubModulesDetails,
  LMSUnitsDetails,
  LMSFilesDetails,
  LMSUserProgress,
  ContentInteractionLog,
  CommunityDiscussion,
  CommunityBlog,
} = db;
import { Op } from "sequelize";

export const getDropdownValuesService = async (category) => {
  if (!category) {
    return { success: false, message: "Category is required", data: [] };
  }

  const results = await TableDDReference.findAll({
    where: {
      ddCategory: category,
      delStatus: { [Op.or]: [0, null] },
    },
    attributes: ["idCode", "ddValue"],
    order: [["ddValue", "ASC"]],
  });

  if (!results || results.length === 0) {
    return {
      success: false,
      message: `No data found for ${category} category`,
      data: [],
    };
  }

  return {
    success: true,
    message: "Dropdown values fetched successfully",
    data: results,
  };
};

export const getQuizGroups = async () => {
  try {
    const groups = await Group_Master.findAll({
      where: {
        delStatus: 0,
        group_category: "quizGroup",
      },
      attributes: ["group_id", "group_name"],
      order: [["group_name", "ASC"]],
    });

    return {
      success: true,
      data: groups,
      message: groups.length
        ? "Quiz group names fetched successfully"
        : "No quiz groups found",
    };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch quiz groups");
  }
};

export const getQuestionGroups = async () => {
  try {
    const groups = await Group_Master.findAll({
      where: {
        delStatus: 0,
        group_category: "questionGroup",
      },
      attributes: ["group_id", "group_name"],
      order: [["group_name", "ASC"]],
    });

    return {
      success: true,
      data: groups,
      message: groups.length
        ? "Question group names fetched successfully"
        : "No question groups found",
    };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch question groups");
  }
};

export const getModuleByIdService = async (moduleId) => {
  try {
    const module = await LMSModulesDetails.findOne({
      where: {
        ModuleID: moduleId,
        delStatus: 0,
      },
      attributes: [
        "ModuleID",
        "ModuleName",
        "ModuleImage",
        "ModuleDescription",
      ],
    });

    if (!module) {
      return {
        success: false,
        data: null,
        message: "Module not found",
      };
    }

    // ✅ handle image (convert blob to base64 if exists)
    let moduleData = module.toJSON();
    moduleData.ModuleImage = module.ModuleImage
      ? {
          data: Buffer.isBuffer(module.ModuleImage)
            ? module.ModuleImage.toString("base64")
            : module.ModuleImage,
        }
      : null;

    return {
      success: true,
      data: moduleData,
      message: "Module fetched successfully",
    };
  } catch (error) {
    throw new Error(error.message || "Error fetching module");
  }
};

export const getModulesService = async (baseUrl) => {
  try {
    const modules = await LMSModulesDetails.findAll({
      where: { delStatus: 0 },
      attributes: [
        "ModuleID",
        "ModuleName",
        "ModuleImage",
        "ModuleImagePath",
        "ModuleDescription",
        "SortingOrder",
      ],
      order: [
        [
          db.sequelize.literal(
            "CASE WHEN SortingOrder IS NULL THEN 1 ELSE 0 END"
          ),
        ],
        ["SortingOrder", "ASC"],
        ["ModuleID", "ASC"],
      ],
    });

    // Transform results to include image URLs
    const modulesWithImageUrls = modules.map((module) => {
      const moduleData = module.toJSON();
      let imageUrl = null;

      if (moduleData.ModuleImagePath) {
        if (moduleData.ModuleImagePath.startsWith("http")) {
          imageUrl = moduleData.ModuleImagePath;
        } else {
          const filePath = moduleData.ModuleImagePath.replace(
            /^\/?uploads\//,
            ""
          );
          imageUrl = `${baseUrl}/uploads/${filePath}`;
        }
      }

      return {
        ...moduleData,
        ModuleImageUrl: imageUrl,
      };
    });
    console.log("imggg", modulesWithImageUrls);

    return {
      success: true,
      data: modulesWithImageUrls,
      message: "Modules fetched successfully",
    };
  } catch (error) {
    throw new Error(error.message || "Error fetching modules");
  }
};

export const getSubModulesService = async (moduleId, baseUrl) => {
  try {
    const subModules = await LMSSubModulesDetails.findAll({
      where: {
        ModuleID: moduleId,
        delStatus: 0,
      },
      attributes: [
        "SubModuleID",
        "SubModuleName",
        "SubModuleImagePath",
        "SubModuleDescription",
        "ModuleID",
        "SortingOrder",
      ],
      order: [
        [
          db.sequelize.literal(
            "CASE WHEN SortingOrder IS NULL THEN 1 ELSE 0 END"
          ),
        ],
        ["SortingOrder", "ASC"],
        ["SubModuleID", "ASC"],
      ],
    });

    const subModulesWithImageUrls = subModules.map((subModule) => {
      const subModuleData = subModule.toJSON();
      let imageUrl = null;

      if (subModuleData.SubModuleImagePath) {
        if (subModuleData.SubModuleImagePath.startsWith("http")) {
          imageUrl = subModuleData.SubModuleImagePath;
        } else {
          const cleanPath = subModuleData.SubModuleImagePath.replace(
            /^\/?uploads\//,
            ""
          );
          imageUrl = `${baseUrl}/uploads/${cleanPath}`;
        }
      }

      return {
        ...subModuleData,
        SubModuleImageUrl: imageUrl,
      };
    });

    return {
      success: true,
      data: subModulesWithImageUrls,
      message: "SubModules fetched successfully",
    };
  } catch (error) {
    throw new Error(error.message || "Error fetching submodules");
  }
};

export const getUnitsWithFilesService = async (subModuleId, userId) => {
  try {
    const units = await LMSUnitsDetails.findAll({
      where: { SubModuleID: subModuleId, delStatus: 0 },
      attributes: [
        "UnitID",
        "UnitName",
        "UnitImg",
        "UnitDescription",
        "SubModuleID",
        "AuthAdd",
        ["SortingOrder", "UnitSortingOrder"],
      ],
      include: [
        {
          model: LMSFilesDetails,
          required: false,
          where: { delStatus: 0 },
          attributes: [
            "FileID",
            "FilesName",
            "FilePath",
            "FileType",
            "Description",
            ["AuthAdd", "FileAuthAdd"],
            "Percentage",
            "EstimatedTime",
            ["SortingOrder", "FileSortingOrder"],
          ],
          include: [
            {
              model: LMSUserProgress,
              required: false,
              as: "UserLmsProgresses", // make sure alias matches your model association
              attributes: ["TimeSpentSeconds"],
              where: { UserID: userId, delStatus: 0 },
            },
          ],
        },
      ],
      order: [
        [
          sequelize.literal(
            "CASE WHEN `UnitsDetails`.`SortingOrder` IS NULL THEN 1 ELSE 0 END"
          ),
          "ASC",
        ],
        ["SortingOrder", "ASC"],
        ["UnitID", "ASC"],
        [
          sequelize.literal(
            "CASE WHEN `FilesDetails`.`SortingOrder` IS NULL THEN 1 ELSE 0 END"
          ),
          "ASC",
        ],
        [LMSFilesDetails, "SortingOrder", "ASC"],
        [LMSFilesDetails, "FileID", "ASC"],
      ],
    });

    let totalTimeAllUnits = 0;

    const result = units.map((unit) => {
      const unitData = unit.toJSON();
      let totalTimePerUnit = 0;

      const filesWithTime = (unitData.FilesDetails || []).map((file) => {
        const fileTime = (file.UserLmsProgresses || []).reduce(
          (sum, progress) => sum + (progress.TimeSpentSeconds || 0),
          0
        );
        totalTimePerUnit += fileTime;
        return { ...file, totalTimeSpent: fileTime };
      });

      totalTimeAllUnits += totalTimePerUnit;

      return {
        ...unitData,
        files: filesWithTime,
        totalTimeSpent: totalTimePerUnit,
      };
    });

    return {
      success: true,
      data: result,
      totalTimeAllUnits,
      message: "Units with files fetched successfully",
    };
  } catch (error) {
    throw new Error(error.message || "Error fetching units with files");
  }
};

// export const getUnitsWithFilesService = async (subModuleId, sequelize) => {
//   try {
//     const units = await LMSUnitsDetails.findAll({
//       where: {
//         SubModuleID: subModuleId,
//         delStatus: 0,
//       },
//       attributes: [
//         "UnitID",
//         "UnitName",
//         "UnitImg",
//         "UnitDescription",
//         "SubModuleID",
//         "AuthAdd",
//         ["SortingOrder", "UnitSortingOrder"],
//       ],
//       include: [
//         {
//           model: LMSFilesDetails,
//           required: false, // LEFT JOIN
//           where: { delStatus: 0 },
//           attributes: [
//             "FileID",
//             "FilesName",
//             "FilePath",
//             "FileType",
//             "Description",
//             ["AuthAdd", "FileAuthAdd"],
//             "Percentage",
//             ["SortingOrder", "FileSortingOrder"],
//           ],
//         },
//       ],
//       order: [
//         // Units ordering: NULLs last
//         [
//           sequelize.literal(
//             "CASE WHEN `UnitsDetails`.`SortingOrder` IS NULL THEN 1 ELSE 0 END"
//           ),
//           "ASC",
//         ],
//         ["SortingOrder", "ASC"],
//         ["UnitID", "ASC"],

//         // Files ordering: NULLs last
//         [
//           sequelize.literal(
//             "CASE WHEN `FilesDetails`.`SortingOrder` IS NULL THEN 1 ELSE 0 END"
//           ),
//           "ASC",
//         ],
//         [LMSFilesDetails, "SortingOrder", "ASC"],
//         [LMSFilesDetails, "FileID", "ASC"],
//       ],
//     });

//     // Transform results: ensure files key exists and sorted
//     const result = units.map((unit) => {
//       const unitData = unit.toJSON();
//       return {
//         ...unitData,
//         files: (unitData.LMSFilesDetails || []).sort(
//           (a, b) =>
//             (a.FileSortingOrder ?? Number.MAX_SAFE_INTEGER) -
//             (b.FileSortingOrder ?? Number.MAX_SAFE_INTEGER)
//         ),
//       };
//     });

//     return {
//       success: true,
//       data: result,
//       message: "Units with files fetched successfully",
//     };
//   } catch (error) {
//     throw new Error(error.message || "Error fetching units with files");
//   }
// };

export const getQuizDropdownService = async () => {
  try {
    const results = await QuizDetails.findAll({
      attributes: [
        "QuizID",
        "QuizName",
        "NegativeMarking",
        "QuizDuration",
        "QuizLevel",
        "StartDateAndTime",
        "EndDateTime",
        [fn("COUNT", col("QuizMapps.QuestionsID")), "QuestionCount"], // ✅ matches alias
      ],
      include: [
        {
          model: QuizMapp,
          as: "QuizMapps", // ✅ must match association in index.js
          attributes: [],
          required: false,
          where: {
            [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
          },
        },
      ],
      where: {
        delStatus: 0,
        EndDateTime: { [Op.gt]: new Date() },
      },
      group: [
        "QuizDetails.QuizID",
        "QuizDetails.QuizName",
        "QuizDetails.NegativeMarking",
        "QuizDetails.QuizDuration",
        "QuizDetails.QuizLevel",
        "QuizDetails.StartDateAndTime",
        "QuizDetails.EndDateTime",
      ],
      order: [["StartDateAndTime", "ASC"]],
      raw: true,
    });

    return {
      success: true,
      data: results,
      message:
        results.length > 0
          ? "Quiz dropdown data fetched successfully"
          : "No active quizzes found",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getDiscussionStatsService = async () => {
  try {
    const discussions = await CommunityDiscussion.findAll({
      where: {
        delStatus: 0,
        [Op.or]: [{ Reference: null }, { Reference: 0 }],
      },
      attributes: ["DiscussionID", "Title"],
    });

    const results = await Promise.all(
      discussions.map(async (discussion) => {
        // ✅ Count only top-level comments
        const commentCount = await CommunityDiscussion.count({
          where: {
            Reference: discussion.DiscussionID,
            delStatus: 0,
            [Op.or]: [
              { Comment: { [Op.ne]: null } },
              { Comment: { [Op.ne]: "" } },
            ],
          },
        });

        const likeCount = await ContentInteractionLog.count({
          where: {
            ProcessName: "Discussion",
            reference: discussion.DiscussionID,
            Likes: 1,
            delStatus: 0,
          },
        });

        const viewCount = await ContentInteractionLog.count({
          where: {
            ProcessName: "Discussion",
            reference: discussion.DiscussionID,
            delStatus: 0,
            View: 1,
          },
        });

        return {
          DiscussionID: discussion.DiscussionID,
          Title: discussion.Title,
          TotalLikes: likeCount,
          TotalComments: commentCount,
          TotalViews: viewCount,
        };
      })
    );

    return { success: true, data: results };
  } catch (error) {
    console.error("Error in getDiscussionStatsService:", error);
    return { success: false, message: error.message };
  }
};

export const getBlogStatsService = async () => {
  try {
    const blogs = await CommunityBlog.findAll({
      where: { delStatus: 0 },
      attributes: ["BlogID", "title"],
    });

    const results = await Promise.all(
      blogs.map(async (blog) => {
        // ✅ Count likes
        const likeCount = await ContentInteractionLog.count({
          where: {
            ProcessName: "Blog",
            reference: blog.BlogID,
            LikeStatus: 1,
            delStatus: 0,
          },
        });

        // ✅ Calculate average rating only for rated entries
        const ratingData = await ContentInteractionLog.findAll({
          where: {
            ProcessName: "Blog",
            reference: blog.BlogID,
            delStatus: 0,
            Rating: { [Op.ne]: null },
          },
          attributes: ["Rating"],
        });

        let avgRating = null;
        if (ratingData.length > 0) {
          const validRatings = ratingData
            .map((r) => parseFloat(r.Rating))
            .filter((r) => !isNaN(r));
          const total = validRatings.reduce((sum, r) => sum + r, 0);
          avgRating = (total / validRatings.length).toFixed(2);
        }
        const viewCount = await ContentInteractionLog.count({
          where: {
            ProcessName: "Blog",
            reference: blog.BlogID,
            delStatus: 0,
            View: 1,
          },
        });

        return {
          BlogID: blog.BlogID,
          Title: blog.title,
          TotalLikes: likeCount,
          AvgRating: avgRating,
          TotalViews: viewCount,
        };
      })
    );

    return { success: true, data: results };
  } catch (error) {
    console.error("Error in getBlogStatsService:", error);
    return { success: false, message: error.message };
  }
};
