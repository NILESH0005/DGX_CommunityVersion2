import { validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import { logError, logInfo, logWarning, queryAsync } from "../helper/index.js";
import db from "../models/index.js";

import {
  createQuestionService,
  createQuizQuestionMappingService,
  createQuizService,
  deleteQuestionService,
  deleteQuizService,
  getLeaderboardRankingService,
  getQuestionsByGroupAndLevelService,
  getQuestionsService,
  getQuizQuestionsByQuizIdService,
  getQuizQuestionsService,
  getQuizzesByRefIdService,
  getQuizzesService,
  getUserByEmailService,
  getUserQuizCategoryService,
  getUserQuizHistoryService,
  submitQuizService,
  unmapQuestionService,
  updateQuestionService,
  updateQuizService,
} from "../services/quizService.js";

export const createQuiz = async (req, res) => {
  const userEmail = req.user.id; // From JWT middleware
  try {
    const quizId = await createQuizService(userEmail, req.body);

    return res.status(200).json({
      success: true,
      data: { quizId },
      message: "Quiz created successfully!",
    });
  } catch (error) {
    console.error("Error in createQuiz:", error.message);
    if (error.message === "Missing required fields") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes("User not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Unexpected Error",
      data: error.message,
    });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await getQuizzesService();

    return res.status(200).json({
      success: true,
      data: { quizzes },
      message: "Quizzes fetched successfully",
    });
  } catch (error) {
    console.error("Error in getQuizzes:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again",
      data: error.message,
    });
  }
};

export const deleteQuiz = async (req, res) => {
  const { QuizID } = req.body;
  const userEmail = req.user?.id; // Email from JWT

  try {
    const result = await deleteQuizService(QuizID, userEmail);

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in deleteQuiz:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting quiz.",
      data: error.message,
    });
  }
};

export const createQuestion = async (req, res) => {
  let success = false;
  const userId = req.user.id;

  try {
    const questionId = await createQuestionService(req.body, userId);

    success = true;
    return res.status(200).json({
      success,
      data: { questionId },
      message: "Question and options added successfully!",
    });
  } catch (error) {
    console.error("Error creating question:", error.message);
    return res.status(400).json({
      success,
      message: error.message || "Unexpected error occurred",
    });
  }
};

export const getQuestion = async (req, res) => {
  let success = false;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const data = await getQuestionsService();
    success = true;

    return res.status(200).json({
      success,
      data: {
        quizzes: data, // This matches what frontend expects: data.quizzes
      },
      message: "Questions fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({
      success,
      data: {
        quizzes: [], // Return empty quizzes array on error
      },
      message: "Something went wrong, please try again",
    });
  }
};

export const deleteQuestion = async (req, res) => {
  let success = false;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    logWarning(warningMessage);
    return res.status(400).json({
      success,
      data: errors.array(),
      message: warningMessage,
    });
  }

  const { id } = req.body;
  const adminName = req.user?.uniqueId; // from fetchUser middleware

  try {
    const result = await deleteQuestionService(id, adminName);

    success = true;
    const infoMessage = "Question and associated options deleted successfully";
    logInfo(infoMessage);

    res.status(200).json({
      success,
      data: result,
      message: infoMessage,
    });
  } catch (err) {
    logError(err);
    res.status(500).json({
      success: false,
      data: {},
      message: err.message || "Something went wrong please try again",
    });
  }
};

export const getQuestionsByGroupAndLevel = async (req, res) => {
  const { group_id, level_id } = req.body;

  if (!group_id || !level_id) {
    return res.status(400).json({
      success: false,
      message: "Group ID and Level ID are required",
    });
  }

  const result = await getQuestionsByGroupAndLevelService(group_id, level_id);

  return res.status(result.status).json(result);
};

export const createQuizQuestionMapping = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: errors.array(),
        message: "Data is not in the right format",
      });
    }

    const { mappings } = req.body;
    if (!mappings || !Array.isArray(mappings)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mapping data" });
    }

    // Pass email instead of id
    const userEmail = req.user.id; // in your auth, req.user.id is email
    const result = await createQuizQuestionMappingService(userEmail, mappings);

    return res.status(result.status).json(result.response);
  } catch (error) {
    console.error("Controller Error (createQuizQuestionMapping):", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserQuizCategory = async (req, res) => {
  let success = false;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const userEmail = req.user.id; // assuming JWT gives Email
    const result = await getUserQuizCategoryService(userEmail);

    return res.status(result.status).json(result.response);
  } catch (error) {
    console.error("Controller Error (getUserQuizCategory):", error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Internal server error",
    });
  }
};

export const getQuizQuestions = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const { QuizID } = req.body;

    if (!QuizID) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "QuizID is required",
      });
    }

    const quizId = parseInt(QuizID);
    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "QuizID must be a valid number",
      });
    }

    const result = await getQuizQuestionsService(quizId);

    if (!result) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "No questions found for this quiz",
      });
    }

    success = true;
    return res.status(200).json({
      success,
      data: result,
      message: "Quiz questions fetched successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
    });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    console.log("req.user:", req.user); // <-- Add this line
    console.log("req.body:", req.body);

    const { quizId, answers } = req.body;

    // Fix here: make sure to pass the right user identifier
    const result = await submitQuizService(req.user.id, {
      quizId,
      answers,
    });

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: result,
    });
  } catch (err) {
    console.error("Submit quiz error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// export const updateQuiz = async (req, res) => {
//   console.log("Incoming quiz update request:", req.body);
//   let success = false;
//   const userId = req.user.id;

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success,
//       errors: errors.array(),
//       message: "Invalid data format",
//     });
//   }

//   try {
//     const {
//       QuizID,
//       QuizCategory,
//       QuizName,
//       QuizLevel,
//       QuizDuration,
//       NegativeMarking,
//       StartDateAndTime,
//       EndDateTime,
//       QuizVisibility,
//       AuthLstEdt,
//     } = req.body;

//     if (!QuizID) {
//       return res.status(400).json({
//         success: false,
//         message: "QuizID is required",
//       });
//     }

//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         console.error("Database connection error:", err);
//         return res.status(500).json({
//           success: false,
//           message: "Database connection failed",
//         });
//       }

//       try {
//         const checkQuizQuery = `
//           SELECT QuizID FROM QuizDetails
//           WHERE QuizID = ? AND ISNULL(delStatus, 0) = 0
//         `;
//         const quizRows = await queryAsync(conn, checkQuizQuery, [QuizID]);

//         if (quizRows.length === 0) {
//           return res.status(404).json({
//             success: false,
//             message: "Quiz not found or has been deleted",
//           });
//         }

//         // Update quiz details with current timestamp and editor info
//         const updateQuery = `
//           UPDATE QuizDetails
//           SET
//             QuizCategory = ?,
//             QuizName = ?,
//             QuizLevel = ?,
//             QuizDuration = ?,
//             NegativeMarking = ?,
//             StartDateAndTime = CONVERT(datetime, ?),
//             EndDateTime = CONVERT(datetime, ?),
//             QuizVisibility = ?,
//             AuthLstEdt = ?,
//             editOnDt = GETDATE()
//           WHERE QuizID = ? AND ISNULL(delStatus, 0) = 0
//         `;

//         const updateParams = [
//           QuizCategory,
//           QuizName,
//           QuizLevel,
//           QuizDuration,
//           NegativeMarking,
//           new Date(StartDateAndTime).toISOString(),
//           new Date(EndDateTime).toISOString(),
//           QuizVisibility,
//           AuthLstEdt || req.user.username || "Unknown", // Fallback to current user if not provided
//           QuizID,
//         ];

//         const result = await queryAsync(conn, updateQuery, updateParams);

//         if (result.affectedRows === 0) {
//           return res.status(404).json({
//             success: false,
//             message:
//               "No quiz was updated. Quiz may not exist or data was identical.",
//           });
//         }

//         closeConnection();

//         return res.status(200).json({
//           success: true,
//           message: "Quiz updated successfully",
//           quizId: QuizID,
//         });
//       } catch (queryErr) {
//         closeConnection();
//         console.error("Database query error:", queryErr);
//         return res.status(500).json({
//           success: false,
//           message: "Failed to update quiz",
//           error: queryErr.message,
//         });
//       }
//     });
//   } catch (error) {
//     console.error("Server error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

export const updateQuiz = async (req, res) => {
  console.log("Incoming quiz update request:", req.body);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
      message: "Invalid data format",
    });
  }

  try {
    console.log("Decoded user from JWT:", req.user);

    const userEmail = req.user?.id;

    const result = await updateQuizService(req.body, userEmail);

    return res.status(result.status).json(result.response);
  } catch (error) {
    console.error("Controller Error (updateQuiz):", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const unmapQuestion = async (req, res) => {
  const { mappingIds } = req.body;
  const adminName = req.user?.uniqueId; 

  try {
    const idsToUnmap = Array.isArray(mappingIds) ? mappingIds : [mappingIds];

    const result = await unmapQuestionService(idsToUnmap, adminName);

    return res.status(result.status).json(result.response);
  } catch (error) {
    console.error("Controller Error (unmapQuestion):", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateQuestion = async (req, res) => {
  console.log("Incoming question update request:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
      message: "Validation failed",
    });
  }

  try {
    const result = await updateQuestionService(req.body, req.user.uniqueId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Update Question Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update question",
    });
  }
};

export const getLeaderboardRanking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const result = await getLeaderboardRankingService();
    return res.status(result.status).json(result.response);
  } catch (error) {
    console.error("Controller Error (getLeaderboardRanking):", error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Internal server error",
    });
  }
};

export const getUserQuizHistory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    logWarning(warningMessage);
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: warningMessage,
    });
  }

  try {
    const userEmail = req.user.id;
    console.log("User email from token:", userEmail);

    const user = await getUserByEmailService(userEmail);

    if (!user) {
      const errorMessage = "User not found";
      logError(errorMessage);
      return res.status(404).json({
        success: false,
        message: errorMessage,
      });
    }

    const userId = user.UserID;
    console.log("Found user ID:", userId);

    const result = await getUserQuizHistoryService(userId);

    if (result.response.success) {
      logInfo("Quiz history fetched successfully");
    }

    return res.status(result.status).json(result.response);
  } catch (error) {
    console.error("Controller Error (getUserQuizHistory):", error);
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};

/*----------------LMS quiz-----------------------* */

export const getQuizzesByRefId = async (req, res) => {
  try {
    const { refId } = req.body;

    const result = await getQuizzesByRefIdService(refId);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getQuizQuestionsByQuizId = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logWarning("Data is not in the right format");
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const userEmail = req.user.id; // Ensure req.user is properly set by middleware
    const { QuizID } = req.body;

    const result = await getQuizQuestionsByQuizIdService(userEmail, QuizID);

    return res.status(result.status).json(result.response);
  } catch (err) {
    logError("Unexpected error in getQuizQuestionsByQuizId controller:", err);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
    });
  }
};
