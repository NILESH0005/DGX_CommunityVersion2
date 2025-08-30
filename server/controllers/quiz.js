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
  getQuizQuestionsService,
  getQuizzesService,
  getUserQuizCategoryService,
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
  const adminName = req.user?.id; // from fetchUser middleware

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
  const adminName = req.user?.id; // from JWT

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
    const result = await updateQuestionService(req.body, req.user.email);
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
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    logWarning(warningMessage);
    return res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
  }

  try {
    const userEmail = req.user.id; // Assuming this contains the email from JWT
    console.log("User email from token:", userEmail);

    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        return res
          .status(500)
          .json({ success: false, data: err, message: errorMessage });
      }

      try {
        // First get the user ID from email
        const userIdQuery =
          "SELECT UserID FROM Community_User WHERE EmailId = ? AND ISNULL(delStatus, 0) = 0";
        const userResult = await queryAsync(conn, userIdQuery, [userEmail]);

        if (!userResult || userResult.length === 0) {
          const errorMessage = "User not found";
          logError(errorMessage);
          closeConnection();
          return res
            .status(404)
            .json({ success: false, message: errorMessage });
        }

        const userId = userResult[0].UserID;
        console.log("Found user ID:", userId);

        // Main query to get latest quiz attempts with scores
        const query = `
          WITH LatestAttempts AS (
              SELECT 
                  quizID,
                  MAX(noOfAttempts) AS maxAttempt
              FROM 
                  quiz_score
              WHERE 
                  userID = ?
              GROUP BY 
                  quizID
          ),
          LatestAttemptDetails AS (
              SELECT 
                  qs.quizID,
                  qs.noOfAttempts,
                  qd.QuizName,
                  gm.group_name,
                  SUM(qs.ObtainedMarks) AS totalObtained,
                  MAX(qs.totalMarks) AS totalPossible,
                  MAX(qs.AddOnDt) AS latestAttemptDate
              FROM 
                  quiz_score qs
              JOIN 
                  LatestAttempts la ON qs.quizID = la.quizID AND qs.noOfAttempts = la.maxAttempt
              LEFT JOIN 
                  QuizDetails qd ON qs.quizID = qd.QuizID
              LEFT JOIN 
                  GroupMaster gm ON qs.quizID = gm.group_id
              WHERE 
                  qs.userID = ?
              GROUP BY 
                  qs.quizID, qs.noOfAttempts, qd.QuizName, gm.group_name
          )
          SELECT 
              quizID,
              latestAttemptDate,
              QuizName,
              noOfAttempts AS attemptNumber,
              group_name,
              totalObtained,
              totalPossible,
              CASE 
                  WHEN totalPossible > 0 THEN ROUND((totalObtained / totalPossible) * 100, 2)
                  ELSE 0 
              END AS percentageScore
          FROM 
              LatestAttemptDetails
          ORDER BY 
              latestAttemptDate DESC`;

        const quizHistory = await queryAsync(conn, query, [userId, userId]);

        // Filter out any invalid records (though your query structure should prevent this)
        const validHistory = quizHistory.filter(
          (quiz) =>
            quiz.quizID !== null &&
            quiz.QuizName !== null &&
            quiz.latestAttemptDate !== null
        );

        success = true;
        closeConnection();
        const infoMessage = "Quiz history fetched successfully";
        logInfo(infoMessage);
        return res.status(200).json({
          success,
          data: { quizHistory: validHistory },
          message: infoMessage,
        });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        return res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};

/*----------------LMS quiz-----------------------* */

// In your backend API
export const getQuizzesByRefId = async (req, res) => {
  try {
    const { refId } = req.body;

    if (!refId) {
      return res.status(400).json({
        success: false,
        message: "refId is required",
      });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        console.error("Database connection error:", err);
        return res.status(500).json({
          success: false,
          message: "Database connection failed",
        });
      }

      try {
        const query = `
          SELECT * FROM QuizDetails 
          WHERE refId = ? AND delStatus = 0 
          ORDER BY QuizName
        `;

        const quizzes = await queryAsync(conn, query, [refId]);

        return res.status(200).json({
          success: true,
          data: quizzes,
        });
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch quizzes",
        });
      } finally {
        closeConnection();
      }
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

    connectToDatabase(async (err, conn) => {
      if (err) {
        console.error("Database connection error:", err);
        return res.status(500).json({
          success: false,
          data: null,
          message: "Database connection failed",
        });
      }

      try {
        const query = `
          SELECT 
            QuizMapping.idCode,
            QuizMapping.quizGroupID,
            GroupMaster.group_name,
            QuizMapping.quizId,
            QuizMapping.QuestionsID,
            Questions.question_text AS QuestionTxt,
            Questions.Ques_level,
            Questions.question_type,  
            QuizMapping.negativeMarks,
            QuizMapping.totalMarks,
            QuizMapping.AuthAdd,
            QuizMapping.AddOnDt,
            QuizMapping.delStatus,
            QuizDetails.QuizName,
            QuizDetails.QuizDuration,
            QuizDetails.NegativeMarking,
            tblDDReferences.ddValue AS question_level,
            Questions.image AS question_image,
            QuestionOptions.is_correct,
            QuestionOptions.option_text,
            QuestionOptions.id AS optionId
          FROM QuizMapping
          LEFT JOIN Questions ON QuizMapping.QuestionsID = Questions.id
          LEFT JOIN QuizDetails ON QuizMapping.quizId = QuizDetails.QuizID
          LEFT JOIN tblDDReferences ON Questions.Ques_level = tblDDReferences.idCode
          LEFT JOIN QuestionOptions ON Questions.id = QuestionOptions.question_id
          LEFT JOIN GroupMaster ON QuizMapping.quizGroupID = GroupMaster.group_id
          WHERE QuizMapping.quizId = ? AND QuizMapping.delStatus = 0 AND QuestionOptions.delStatus = 0
        `;

        const questions = await queryAsync(conn, query, [quizId]);

        if (!questions || questions.length === 0) {
          closeConnection();
          return res.status(404).json({
            success: false,
            data: null,
            message: "No questions found for this quiz",
          });
        }

        const questionMap = {};
        questions.forEach((q) => {
          if (!questionMap[q.QuestionsID]) {
            questionMap[q.QuestionsID] = {
              idCode: q.idCode,
              quizGroupID: q.quizGroupID,
              group_name: q.group_name,
              quizId: q.quizId,
              QuestionsID: q.QuestionsID,
              QuestionTxt: q.QuestionTxt,
              Ques_level: q.Ques_level,
              question_type: q.question_type,
              negativeMarks: q.negativeMarks,
              negativeMarking: q.NegativeMarking,
              totalMarks: q.totalMarks,
              AuthAdd: q.AuthAdd,
              AddOnDt: q.AddOnDt,
              delStatus: q.delStatus,
              QuizName: q.QuizName,
              QuizDuration: q.QuizDuration,
              question_level: q.question_level,
              question_image: q.question_image,
              options: [],
            };
          }

          if (q.option_text) {
            questionMap[q.QuestionsID].options.push({
              id: q.optionId,
              option_text: q.option_text,
              is_correct: q.is_correct === 1,
            });
          }
        });

        const formattedQuestions = Object.values(questionMap);

        success = true;
        closeConnection();
        return res.status(200).json({
          success,
          data: {
            quizId,
            quizName: questions[0]?.QuizName || "",
            quizDuration: questions[0]?.QuizDuration || 0,
            questions: formattedQuestions,
          },
          message: "Quiz questions fetched successfully",
        });
      } catch (queryErr) {
        console.error("Query error:", queryErr);
        closeConnection();
        return res.status(500).json({
          success: false,
          data: null,
          message: "Failed to execute query",
        });
      }
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
