import { validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import { logError, logInfo, logWarning, queryAsync } from "../helper/index.js";

export const createQuiz = async (req, res) => {
  let success = false;
  const userId = req.user.id;

  console.log("User ID:", userId);

  // Remove validation middleware check since we're handling validation manually
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   logWarning("Data is not in the right format");
  //   return res.status(400).json({ success, data: errors.array(), message: "Data is not in the right format" });
  // }

  try {
    let {
      category,
      name,
      level,
      duration,
      negativeMarking,
      passingPercentage,
      startDate,
      startTime,
      endDate,
      endTime,
      type,
      quizVisibility,
      quizImage,
      refId = 0,
      refName = "quiz",
    } = req.body;

    console.log("Request Body:", req.body);

    // Manual validation
    if (!name || !startDate || !startTime || !endDate || !endTime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    let startDateAndTime = `${startDate} ${startTime}`;
    let endDateTime = `${endDate} ${endTime}`;

    // Set default values for null checks
    category = category ?? null;
    name = name ?? null;
    level = level ?? null;
    duration = duration ?? null;
    negativeMarking = negativeMarking ?? false;
    passingPercentage = passingPercentage ?? 50;
    startDateAndTime = startDateAndTime ?? null;
    endDateTime = endDateTime ?? null;
    type = type ?? null;
    quizVisibility = quizVisibility ?? "Public";
    quizImage = quizImage ?? null;
    refId = refId ?? 0;
    refName = refName ?? "quiz";

    connectToDatabase(async (err, conn) => {
      if (err) {
        logError("Failed to connect to database");
        return res
          .status(500)
          .json({ success: false, message: "Failed to connect to database" });
      }
      logInfo("Database connection established successfully");

      try {
        const userQuery =
          "SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?";
        const userRows = await queryAsync(conn, userQuery, [userId]);
        console.log("User Rows:", userRows);

        if (userRows.length === 0) {
          logWarning("User not found, please login first.");
          return res.status(400).json({
            success: false,
            message: "User not found, please login first.",
          });
        }

        const user = userRows[0];
        const authAdd = user.Name;
        //const AuthLstEdt = "Rohit"//userRows[1];
        // const refId = 0;
        // const refName = 'quiz';
        // Insert quiz data with image
        const quizQuery = `
        INSERT INTO QuizDetails 
        (QuizCategory, QuizName, QuizLevel, QuizDuration, NegativeMarking, PassingPercentage, StartDateAndTime, EndDateTime, QuizVisibility, QuizImage, AuthAdd, AddOnDt, delStatus, refId, refName) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), 0, ?, ?);`;
        console.log("Executing query: ", quizQuery);

        await queryAsync(conn, quizQuery, [
          category,
          name,
          level,
          duration,
          negativeMarking,
          passingPercentage,
          startDateAndTime,
          endDateTime,
          quizVisibility,
          quizImage,
          authAdd,
          refId,
          refName,
        ]);

        // Fetch last inserted Quiz ID
        const lastInsertedIdQuery = `SELECT TOP 1 QuizID FROM QuizDetails WHERE ISNULL(delStatus, 0) = 0 ORDER BY QuizID DESC`;
        const lastInsertedId = await queryAsync(conn, lastInsertedIdQuery);
        console.log("Last Inserted ID:", lastInsertedId);

        success = true;
        logInfo("Quiz created successfully!");
        return res.status(200).json({
          success,
          data: { quizId: lastInsertedId[0].QuizID },
          message: "Quiz created successfully!",
        });
      } catch (queryErr) {
        logError("Database Query Error:", queryErr.message || queryErr);
        return res
          .status(500)
          .json({ success: false, message: "Database Query Error" });
      } finally {
        closeConnection(conn);
      }
    });
  } catch (error) {
    logError("Unexpected Error:", error.stack || JSON.stringify(error));
    console.error("Error Details:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unexpected Error, check logs" });
  }
};

export const getQuizzes = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    logWarning(warningMessage);
    res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        res
          .status(500)
          .json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        const query = `SELECT 
    qd.QuizID,
    qd.QuizCategory,
    qd.QuizName,
    qd.QuizLevel,
    qd.QuizDuration,
    qd.NegativeMarking,
    qd.StartDateAndTime,
    qd.EndDateTime,
    qd.QuizVisibility,
    (SELECT COUNT(*) FROM QuizMapping qm WHERE qm.quizId = qd.QuizID AND ISNULL(qm.delStatus, 0) = 0) AS QuestionMappedCount,
    COUNT(DISTINCT qs.userID) AS UniqueParticipants,
	(SELECT SUM(totalMarks) FROM QuizMapping qm WHERE qm.quizId = qd.QuizID AND ISNULL(qm.delStatus, 0) = 0) AS TotalMarksPerQuiz,
    ISNULL(attempts.totalMaxAttempts, 0) AS totalMaxAttempts


FROM  QuizDetails qd
LEFT JOIN QuizMapping qm ON qd.QuizID = qm.quizId AND ISNULL(qm.delStatus, 0) = 0
LEFT JOIN  quiz_score qs ON qd.QuizID = qs.quizID AND ISNULL(qs.delStatus, 0) = 0
LEFT JOIN (
    SELECT 
        quizID,
        SUM(maxAttempts) AS totalMaxAttempts
    FROM 
        (
            SELECT 
                quizID,
                userID,
                MAX(noOfAttempts) AS maxAttempts
            FROM 
                quiz_score
            WHERE ISNULL(delStatus, 0) = 0
            GROUP BY 
                quizID, userID
        ) AS subquery
    GROUP BY 
        quizID
) AS attempts ON qd.QuizID = attempts.quizID
WHERE 
    ISNULL(qd.delStatus, 0) = 0
GROUP BY 
    qd.QuizID,
    qd.QuizCategory,
    qd.QuizName,
    qd.QuizLevel,
    qd.QuizDuration,
    qd.NegativeMarking,
    qd.StartDateAndTime,
    qd.EndDateTime,
    qd.QuizVisibility,
    attempts.totalMaxAttempts`;
        const quizzes = await queryAsync(conn, query);

        success = true;
        closeConnection();
        const infoMessage = "Quizzes fetched successfully";
        logInfo(infoMessage);
        res
          .status(200)
          .json({ success, data: { quizzes }, message: infoMessage });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};

export const deleteQuiz = (req, res) => {
  let success = false;
  const { QuizID } = req.body;
  const userId = req.user?.id; // This should be the email ID from authentication

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success: false,
          data: err,
          message: "Database connection error.",
        });
      }

      try {
        // First, get the user's name from the database using email ID
        const userQuery =
          "SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?";
        const userRows = await queryAsync(conn, userQuery, [userId]);
        console.log("User Rows:", userRows);

        if (userRows.length === 0) {
          logWarning("User not found, please login first.");
          return res.status(400).json({
            success: false,
            message: "User not found, please login first.",
          });
        }

        const user = userRows[0];
        const adminName = user.Name;

        const checkQuery = `SELECT * FROM QuizDetails WHERE QuizID = ? AND (delStatus IS NULL OR delStatus = 0)`;
        const result = await queryAsync(conn, checkQuery, [QuizID]);

        if (result.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Quiz not found or already deleted.",
          });
        }

        const updateQuery = `
          UPDATE QuizDetails 
          SET 
            delStatus = 1, 
            delOnDt = GETDATE(), 
            AuthDel = ? 
          OUTPUT 
            inserted.QuizID, 
            inserted.delStatus, 
            inserted.delOnDt, 
            inserted.AuthDel 
          WHERE 
            QuizID = ? AND (delStatus IS NULL OR delStatus = 0)
        `;

        const rows = await queryAsync(conn, updateQuery, [adminName, QuizID]);

        if (rows.length > 0) {
          success = true;
          logInfo("Quiz deleted successfully");
          return res.status(200).json({
            success,
            data: {
              QuizID: rows[0].QuizID,
              AuthDel: rows[0].AuthDel,
              delOnDt: rows[0].delOnDt,
              delStatus: rows[0].delStatus,
            },
            message: "Quiz deleted successfully.",
          });
        } else {
          logWarning("Failed to delete the quiz.");
          return res.status(404).json({
            success: false,
            message: "Failed to delete the quiz.",
          });
        }
      } catch (updateErr) {
        logError(updateErr);
        return res.status(500).json({
          success: false,
          data: updateErr,
          message: "Error updating quiz deletion.",
        });
      } finally {
        closeConnection(conn);
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: "Unable to connect to the database!",
    });
  }
};

export const createQuestion = async (req, res) => {
  let success = false;
  const userId = req.user.id;
  console.log("User ID:", userId);

  try {
    const {
      question_text,
      Ques_level,
      image,
      group_id,
      question_type,
      options,
    } = req.body;

    // Validation
    if (
      !question_text ||
      !group_id ||
      !options ||
      options.length < 2 ||
      question_type === undefined
    ) {
      return res.status(400).json({
        success,
        message: "Missing required fields or insufficient options.",
      });
    }

    // Validate question_type is either 0 or 1
    if (question_type !== 0 && question_type !== 1) {
      return res.status(400).json({
        success,
        message:
          "question_type must be either 0 (single answer) or 1 (multiple answers).",
      });
    }

    // Validate that single-answer questions have exactly one correct option
    if (question_type === 0) {
      const correctOptionsCount = options.filter(
        (opt) => opt.is_correct
      ).length;
      if (correctOptionsCount !== 1) {
        return res.status(400).json({
          success: false,
          message:
            "Single-answer questions must have exactly one correct option.",
        });
      }
    }

    // Validate that multiple-answer questions have at least two correct options
    if (question_type === 1) {
      const correctOptionsCount = options.filter(
        (opt) => opt.is_correct
      ).length;
      if (correctOptionsCount < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Multiple-answer questions must have at least two correct options.",
        });
      }
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        return res.status(500).json({
          success: false,
          data: err,
          message: "Failed to connect to database",
        });
      }

      try {
        // Insert the question
        const insertQuestionQuery = `
          INSERT INTO Questions 
          (question_text, Ques_level, image, group_id, question_type, AuthAdd, AddOnDt, delStatus) 
          VALUES (?, ?, ?, ?, ?, ?, GETDATE(), 0);
        `;
        const questionResult = await queryAsync(conn, insertQuestionQuery, [
          question_text,
          Ques_level || null,
          image || null,
          group_id,
          question_type,
          userId,
        ]);

        // Get the inserted question ID
        const lastQuestionIdQuery = `SELECT TOP 1 id FROM Questions ORDER BY id DESC;`;
        const lastQuestionIdResult = await queryAsync(
          conn,
          lastQuestionIdQuery
        );
        const questionId = lastQuestionIdResult[0].id;

        // Insert all options
        for (const option of options) {
          const { option_text, is_correct, image } = option;

          // Skip empty options
          if (!option_text || option_text.trim() === "") continue;

          const insertOptionQuery = `
            INSERT INTO QuestionOptions 
            (question_id, option_text, is_correct, image, AuthAdd, AddOnDt, delStatus) 
            VALUES (?, ?, ?, ?, ?, GETDATE(), 0);
          `;
          await queryAsync(conn, insertOptionQuery, [
            questionId,
            option_text,
            is_correct ? 1 : 0,
            image || null,
            userId,
          ]);
        }

        success = true;
        closeConnection();
        return res.status(200).json({
          success,
          data: { questionId },
          message: "Question and options added successfully!",
        });
      } catch (queryErr) {
        closeConnection();
        console.error("Database Query Error:", queryErr);
        return res.status(500).json({
          success: false,
          data: queryErr,
          message: "Database Query Error",
        });
      }
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      data: error,
      message: "Unexpected Error, check logs",
    });
  }
};

export const getQuestion = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    logWarning(warningMessage);
    res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        res
          .status(500)
          .json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        //         const query = `select distinct  question_id, QuizDetails.QuizID, Questions.id, question_text,GroupMaster.group_name,tblDDReferences.ddValue,option_text,
        //  COUNT(CASE WHEN ISNULL(QuizMapping.delStatus, 0) = 0 THEN QuizMapping.QuestionsID END) AS quiz_count
        // from Questions
        // left join GroupMaster on Questions.group_id = GroupMaster.group_id
        // left join tblDDReferences on Questions.Ques_level = tblDDReferences.idCode
        // left join QuestionOptions on Questions.id = QuestionOptions.question_id
        // left join QuizMapping on Questions.id = QuizMapping.QuestionsID
        // left join QuizDetails on Questions.id = QuizDetails.QuizID

        // where  QuestionOptions.is_correct = 1

        // GROUP BY Questions.id, question_text,QuestionOptions.question_id,QuizDetails.QuizID, GroupMaster.group_name, tblDDReferences.ddValue, option_text,Questions.AddOnDt`;
        const query = `
  SELECT DISTINCT 
    Questions.id AS question_id,
    QuizDetails.QuizID,
    Questions.id,
    question_text,
    GroupMaster.group_name,
    tblDDReferences.ddValue,
    tblDDReferences.idCode, -- Added here
    option_text,
    QuestionOptions.is_correct,
    --question_type,
    COUNT(CASE 
             WHEN ISNULL(QuizMapping.delStatus, 0) = 0 
             THEN QuizMapping.QuestionsID 
         END) AS quiz_count
FROM Questions
LEFT JOIN GroupMaster 
    ON Questions.group_id = GroupMaster.group_id
LEFT JOIN tblDDReferences 
    ON Questions.Ques_level = tblDDReferences.idCode
LEFT JOIN QuestionOptions 
    ON Questions.id = QuestionOptions.question_id 
    AND ISNULL(QuestionOptions.delStatus, 0) = 0 
LEFT JOIN QuizMapping 
    ON Questions.id = QuizMapping.QuestionsID
LEFT JOIN QuizDetails 
    ON Questions.id = QuizDetails.QuizID
WHERE Questions.delStatus = 0
GROUP BY 
    Questions.id,
    QuizDetails.QuizID,
    question_text,
    GroupMaster.group_name,
    tblDDReferences.ddValue,
    tblDDReferences.idCode, -- Added here
    option_text,
    QuestionOptions.question_id,
    QuestionOptions.is_correct,
    Questions.AddOnDt
    --question_type;
`;
        const quizzes = await queryAsync(conn, query);

        success = true;
        closeConnection();
        const infoMessage = "Questions fetched successfully";
        logInfo(infoMessage);
        res
          .status(200)
          .json({ success, data: { quizzes }, message: infoMessage });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};

export const deleteQuestion = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    logWarning(warningMessage);
    res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  const { id } = req.body; // Extract the question ID from the request body
  const adminName = req.user?.id; // Get the admin name from the authenticated user

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        res
          .status(500)
          .json({ success: false, data: err, message: errorMessage });
        return;
      }

      let transactionStarted = false;

      try {
        // Begin transaction
        await queryAsync(conn, "BEGIN TRANSACTION");
        transactionStarted = true;

        // First, check if the question exists and isn't already deleted
        const checkQuestionQuery = `SELECT id FROM Questions WHERE id = ? AND (delStatus IS NULL OR delStatus = 0)`;
        const questionResult = await queryAsync(conn, checkQuestionQuery, [id]);

        if (questionResult.length === 0) {
          await queryAsync(conn, "ROLLBACK");
          closeConnection(conn);
          return res.status(404).json({
            success: false,
            message: "Question not found or already deleted.",
          });
        }

        // Query to soft delete the question by updating the delStatus field
        const deleteQuestionQuery = `
          UPDATE Questions 
          SET 
            delStatus = 1, 
            delOnDt = GETDATE(), 
            AuthDel = ?,
            AuthLstEdt = ?
          WHERE id = ? AND (delStatus IS NULL OR delStatus = 0)`;

        const questionDeleteResult = await queryAsync(
          conn,
          deleteQuestionQuery,
          [adminName, adminName, id]
        );

        // Query to soft delete all options associated with this question
        const deleteOptionsQuery = `
          UPDATE QuestionOptions 
          SET 
            delStatus = 1, 
            delOnDt = GETDATE(), 
            AuthDel = ?,
            AuthLstEdt = ?
          WHERE question_id = ? AND (delStatus IS NULL OR delStatus = 0)`;

        const optionsDeleteResult = await queryAsync(conn, deleteOptionsQuery, [
          adminName,
          adminName,
          id,
        ]);

        // Commit transaction
        await queryAsync(conn, "COMMIT");
        transactionStarted = false;
        closeConnection(conn);

        success = true;
        const infoMessage =
          "Question and associated options deleted successfully";
        logInfo(infoMessage);
        res.status(200).json({
          success,
          data: {
            questionId: id,
            optionsDeleted: optionsDeleteResult.affectedRows,
          },
          message: infoMessage,
        });
      } catch (queryErr) {
        // Rollback transaction if error occurs
        if (transactionStarted) {
          await queryAsync(conn, "ROLLBACK");
        }
        logError(queryErr);
        closeConnection(conn);
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};

export const getQuestionsByGroupAndLevel = async (req, res) => {
  let success = false;
  const { group_id, level_id } = req.body;

  if (!group_id || !level_id) {
    return res.status(400).json({
      success,
      message: "Group ID and Level ID are required",
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database connection failed",
        });
      }

      try {
        const levelQuery = `SELECT ddValue FROM tblDDReferences WHERE idCode = ? AND ddCategory = 'questionLevel'`;
        const [levelResult] = await queryAsync(conn, levelQuery, [level_id]);

        if (!levelResult) {
          return res.status(400).json({
            success: false,
            message: "Invalid level ID",
          });
        }

        const levelName = levelResult.ddValue;
        const allQuestionsQuery = `SELECT  
          Questions.id as question_id,  
          Questions.question_text, 
          Questions.Ques_level as level, 
          Questions.group_id, 
          QuizMapping.quizGroupID as mapped_quiz_id,
          QuizMapping.totalMarks, 
          QuizMapping.negativeMarks, 
		  QuizDetails.NegativeMarking,
	  tblDDReferences.ddValue AS question_level,
	            QuestionOptions.option_text,
				          QuestionOptions.is_correct,
          QuizDetails.QuizName as quiz_name 
        FROM Questions 
        LEFT JOIN QuizMapping ON Questions.id = QuizMapping.QuestionsID
        LEFT JOIN QuizDetails ON QuizMapping.quizGroupID = QuizDetails.QuizID 
	LEFT JOIN tblDDReferences ON Questions.Ques_level = tblDDReferences.idCode
	        LEFT JOIN QuestionOptions ON Questions.id = QuestionOptions.question_id

        WHERE ISNULL(Questions.delStatus, 0) = 0 
          AND Questions.group_id = ?
          AND Questions.Ques_level = ?`;

        const questions = await queryAsync(conn, allQuestionsQuery, [
          group_id,
          level_id,
        ]); // Changed levelName to level_id

        return res.status(200).json({
          success: true,
          data: {
            questions: questions,
            levelInfo: {
              id: level_id,
              name: levelName,
            },
          },
          message: "Data fetched successfully",
        });
      } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          success: false,
          message: "Database query failed",
        });
      } finally {
        closeConnection(conn);
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createQuizQuestionMapping = async (req, res) => {
  let success = false;
  const userId = req.user.id;
  console.log("User ID:", userId);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const { mappings } = req.body;

    if (!mappings || !Array.isArray(mappings)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mapping data" });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        console.error("Database connection error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database connection failed" });
      }

      try {
        const userQuery = `SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);
        console.log("User Rows:", userRows);

        if (userRows.length === 0) {
          return res.status(400).json({
            success: false,
            message: "User not found, please login first.",
          });
        }

        const user = userRows[0];
        const authAdd = user.Name;
        await queryAsync(conn, "BEGIN TRANSACTION");

        const insertPromises = mappings.map(async (mapping) => {
          const {
            quizGroupID,
            QuestionsID,
            QuestionName,
            negativeMarks,
            totalMarks,
            quizId,
            Ques_level,
          } = mapping;

          const params = [
            parseInt(quizGroupID) || 0,
            parseInt(quizId) || 0,
            parseInt(QuestionsID) || 0,
            String(QuestionName || "").substring(0, 500),
            parseFloat(negativeMarks) || 0,
            parseFloat(totalMarks) || 1,
            parseInt(Ques_level) || 0,
            authAdd,
            0,
          ];

          return queryAsync(
            conn,
            `
            INSERT INTO QuizMapping (
              quizGroupID, quizId, QuestionsID, QuestionTxt,
              negativeMarks, totalMarks, Ques_level, AuthAdd, AddOnDt, delStatus
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?)
          `,
            params
          );
        });

        await Promise.all(insertPromises);
        await queryAsync(conn, "COMMIT TRANSACTION");

        success = true;
        return res.json({
          success,
          count: mappings.length,
          message: "Questions mapped successfully",
        });
      } catch (queryErr) {
        try {
          await queryAsync(conn, "ROLLBACK TRANSACTION");
        } catch (rollbackErr) {
          console.error("Rollback error:", rollbackErr);
        }
        console.error("Query error:", queryErr);
        return res.status(500).json({
          success: false,
          message: "Failed to map questions",
          error: queryErr.message,
        });
      } finally {
        closeConnection(conn);
      }
    });
  } catch (error) {
    console.error("Server error:", error);
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

        // Main query with user-specific attempt count
        //         const query = `SELECT
        //     QuizDetails.QuizID,
        //     QuizDetails.QuizName,
        //     QuizDetails.QuizImage,
        //     QuizDetails.StartDateAndTime,
        //     QuizDetails.EndDateTime,
        //     GroupMaster.group_name,
        //     GroupMaster.group_id,
        //     SUM(QuizMapping.totalMarks) AS MaxScore,
        //     COUNT(DISTINCT QuizMapping.QuestionsID) AS Total_Question_No,
        //     ISNULL(UserAttempts.noOfAttempts, 0) AS userAttempts
        // FROM QuizMapping
        // LEFT JOIN QuizDetails ON QuizMapping.quizId = QuizDetails.QuizID
        // LEFT JOIN GroupMaster ON QuizDetails.QuizCategory = GroupMaster.group_id
        // LEFT JOIN (
        //     SELECT quizID, MAX(noOfAttempts) AS noOfAttempts
        //     FROM quiz_score
        //     WHERE userID = ?
        //     GROUP BY quizID
        // ) AS UserAttempts ON QuizMapping.quizId = UserAttempts.quizID
        // WHERE ISNULL(QuizMapping.delStatus, 0) = 0
        // GROUP BY
        //     QuizDetails.QuizID,
        //     QuizDetails.QuizImage,
        //     QuizDetails.QuizName,
        //     GroupMaster.group_id,
        //     GroupMaster.group_name,
        //     QuizDetails.StartDateAndTime,
        //     QuizDetails.EndDateTime,
        //     UserAttempts.noOfAttempts`;

        const query = `SELECT 
    QuizDetails.QuizID,
    QuizDetails.QuizName,
    QuizDetails.QuizImage,
    QuizDetails.StartDateAndTime,
    QuizDetails.EndDateTime,
    GroupMaster.group_name,
    GroupMaster.group_id,
    QuizDetails.refId,
    QuizDetails.refName,
    SUM(QuizMapping.totalMarks) AS MaxScore,
    COUNT(DISTINCT QuizMapping.QuestionsID) AS Total_Question_No,
    MAX(ISNULL(UserAttempts.noOfAttempts, 0)) AS userAttempts
    FROM QuizMapping
    LEFT JOIN QuizDetails ON QuizMapping.quizId = QuizDetails.QuizID
    LEFT JOIN GroupMaster ON QuizDetails.QuizCategory = GroupMaster.group_id
    LEFT JOIN (
    SELECT quizID, MAX(noOfAttempts) AS noOfAttempts
    FROM quiz_score
    WHERE userID = 1
    GROUP BY quizID
) AS UserAttempts ON QuizMapping.quizId = UserAttempts.quizID
WHERE ISNULL(QuizMapping.delStatus, 0) = 0 and ISNULL(QuizDetails.delStatus, 0) = 0
GROUP BY 
    
    QuizDetails.QuizID, 
    QuizDetails.QuizImage, 
    QuizDetails.QuizName,
    GroupMaster.group_id, 
    GroupMaster.group_name, 
    QuizDetails.StartDateAndTime, 
    QuizDetails.EndDateTime,
    QuizDetails.refId,
    QuizDetails.refName

    order by refName, QuizName;`;
        const quizzes = await queryAsync(conn, query, [userId, userId]);

        const validQuizzes = quizzes.filter(
          (quiz) =>
            quiz.QuizID !== null &&
            quiz.QuizName !== null &&
            quiz.group_id !== null &&
            quiz.group_name !== null
        );

        success = true;
        closeConnection();
        const infoMessage = "Quizzes fetched successfully";
        logInfo(infoMessage);
        return res.status(200).json({
          success,
          data: { quizzes: validQuizzes },
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
        const query = `SELECT 
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
        WHERE 
          QuizMapping.quizId = ? 
          AND QuizMapping.delStatus = 0 
          AND QuestionOptions.delStatus = 0
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
              question_type: q.question_type === 1, // Convert 0/1 to boolean
              negativeMarks: q.negativeMarks,
              negativeMarking: q.NegativeMarking === 1, // Ensure consistent boolean
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
              is_correct: q.is_correct === 1, // Convert to boolean
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
// export const getQuizQuestions = async (req, res) => {
//   let success = false;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success,
//       data: errors.array(),
//       message: "Data is not in the right format",
//     });
//   }

//   try {
//     const { QuizID } = req.body;

//     if (!QuizID) {
//       return res.status(400).json({
//         success: false,
//         data: null,
//         message: "QuizID is required",
//       });
//     }

//     const quizId = parseInt(QuizID);
//     if (isNaN(quizId)) {
//       return res.status(400).json({
//         success: false,
//         data: null,
//         message: "QuizID must be a valid number",
//       });
//     }

//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         console.error("Database connection error:", err);
//         return res.status(500).json({
//           success: false,
//           data: null,
//           message: "Database connection failed",
//         });
//       }

//       try {
//         const query = `SELECT
//     QuizMapping.idCode,
//     QuizMapping.quizGroupID,
//     GroupMaster.group_name,
//     QuizMapping.quizId,
//     QuizMapping.QuestionsID,
//     Questions.question_text AS QuestionTxt,
//     Questions.Ques_level,
//     Questions.question_type,
//     QuizMapping.negativeMarks,
//     QuizMapping.totalMarks,
//     QuizMapping.AuthAdd,
//     QuizMapping.AddOnDt,
//     QuizMapping.delStatus,
//     QuizDetails.QuizName,
//     QuizDetails.QuizDuration,
//     QuizDetails.NegativeMarking,
//     tblDDReferences.ddValue AS question_level,
//     Questions.image AS question_image,
//     QuestionOptions.is_correct,
//     QuestionOptions.option_text,
//     QuestionOptions.id AS optionId
// FROM QuizMapping
// LEFT JOIN Questions ON QuizMapping.QuestionsID = Questions.id
// LEFT JOIN QuizDetails ON QuizMapping.quizId = QuizDetails.QuizID
// LEFT JOIN tblDDReferences ON Questions.Ques_level = tblDDReferences.idCode
// LEFT JOIN QuestionOptions ON Questions.id = QuestionOptions.question_id
// LEFT JOIN GroupMaster ON QuizMapping.quizGroupID = GroupMaster.group_id
// WHERE
//     QuizMapping.quizId = ?
//     AND QuizMapping.delStatus = 0
//     AND QuestionOptions.delStatus = 0
// `;

//         const questions = await queryAsync(conn, query, [quizId]);

//         if (!questions || questions.length === 0) {
//           closeConnection();
//           return res.status(404).json({
//             success: false,
//             data: null,
//             message: "No questions found for this quiz",
//           });
//         }
//         const questionMap = {};
//         questions.forEach((q) => {
//           if (!questionMap[q.QuestionsID]) {
//             questionMap[q.QuestionsID] = {
//               idCode: q.idCode,
//               quizGroupID: q.quizGroupID,
//               group_name: q.group_name,
//               quizId: q.quizId,
//               QuestionsID: q.QuestionsID,
//               QuestionTxt: q.QuestionTxt,
//               Ques_level: q.Ques_level,
//               negativeMarks: q.negativeMarks,
//               negativeMarking: q.NegativeMarking,
//               totalMarks: q.totalMarks,
//               AuthAdd: q.AuthAdd,
//               AddOnDt: q.AddOnDt,
//               delStatus: q.delStatus,
//               QuizName: q.QuizName,
//               QuizDuration: q.QuizDuration,
//               question_level: q.question_level,
//               question_image: q.question_image,
//               options: [],
//             };
//           }
//           if (q.option_text) {
//             questionMap[q.QuestionsID].options.push({
//               id: q.optionId,
//               option_text: q.option_text,
//               is_correct: q.is_correct === 1,
//             });
//           }
//         });
//         const formattedQuestions = Object.values(questionMap);
//         success = true;
//         closeConnection();
//         return res.status(200).json({
//           success,
//           data: {
//             quizId,
//             quizName: questions[0]?.QuizName || "",
//             quizDuration: questions[0]?.QuizDuration || 0,
//             questions: formattedQuestions,
//           },
//           message: "Quiz questions fetched successfully",
//         });
//       } catch (queryErr) {
//         console.error("Query error:", queryErr);
//         closeConnection();
//         return res.status(500).json({
//           success: false,
//           data: null,
//           message: "Failed to execute query",
//         });
//       }
//     });
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return res.status(500).json({
//       success: false,
//       data: null,
//       message: "Internal server error",
//     });
//   }
// };

export const submitQuiz = async (req, res) => {
  console.log("Incoming quiz submission:", req.body);
  let success = false;
  const userId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      errors: errors.array(),
      message: "Invalid data format",
    });
  }

  try {
    const { quizId, groupId, answers } = req.body;

    connectToDatabase(async (err, conn) => {
      if (err) {
        console.error("Database connection error:", err);
        return res.status(500).json({
          success: false,
          message: "Database connection failed",
        });
      }

      try {
        // Begin transaction
        await queryAsync(conn, "BEGIN TRANSACTION");

        // Get user details
        const userQuery = `SELECT UserID, Name FROM Community_User 
                         WHERE ISNULL(delStatus,0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length === 0) {
          await queryAsync(conn, "ROLLBACK");
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        const user = userRows[0];
        let obtainedMarks = 0;
        let totalPossibleMarks = 0;

        // Get current attempt count
        const attemptQuery = `SELECT MAX(noOfAttempts) as maxAttempt 
                            FROM quiz_score 
                            WHERE userID = ? AND quizID = ?`;
        const attemptRows = await queryAsync(conn, attemptQuery, [
          user.UserID,
          quizId,
        ]);
        const noOfAttempts = (attemptRows[0]?.maxAttempt || 0) + 1;

        // Calculate total possible marks
        for (const answer of answers) {
          // Handle both single and multiple selection cases
          const selectedOptions = answer.selectedOptionIds
            ? answer.selectedOptionIds
            : (answer.selectedOptionId ? [answer.selectedOptionId] : []);

          if (selectedOptions.length === 0) continue;

          // Get question details once
          const marksQuery = `SELECT totalMarks, negativeMarks FROM QuizMapping
                    WHERE quizId = ? AND QuestionsID = ?`;
          const marksRows = await queryAsync(conn, marksQuery, [
            quizId,
            answer.questionId,
          ]);

          if (marksRows.length === 0) continue;

          const questionMarks = marksRows[0].totalMarks;
          const negativeMarks = marksRows[0].negativeMarks || 0;

          // Check correctness for all options
          let isFullyCorrect = true;
          let obtainedPoints = 0;

          // For each selected option
          for (const optionId of selectedOptions) {
            const optionQuery = `SELECT is_correct FROM QuestionOptions 
                       WHERE id = ? AND question_id = ?`;
            const optionRows = await queryAsync(conn, optionQuery, [
              optionId,
              answer.questionId,
            ]);

            if (optionRows.length === 0) {
              isFullyCorrect = false;
              continue;
            }

            const isCorrect = optionRows[0].is_correct === 1;
            if (!isCorrect) isFullyCorrect = false;

            // Insert a row for each selected option
            const insertQuery = `INSERT INTO quiz_score (
      userID, quizID, questionID, answerID, correctAns, 
      marks, AuthAdd, AddOnDt, delStatus,
      ObtainedMarks, totalMarks, noOfAttempts,
      editOnDt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), 0, ?, ?, ?, NULL)`;

            await queryAsync(conn, insertQuery, [
              user.UserID,
              quizId,
              answer.questionId,
              optionId,
              isCorrect, // Individual option correctness
              questionMarks,
              user.Name,
              isFullyCorrect ? questionMarks : -negativeMarks,
              totalPossibleMarks,
              noOfAttempts,
            ]);
          }

          // Calculate points based on full question correctness
          obtainedMarks += isFullyCorrect ? questionMarks : -negativeMarks;
        }

        await queryAsync(conn, "COMMIT");
        closeConnection();

        return res.status(200).json({
          success: true,
          message: "Quiz submitted successfully",
          data: {
            obtainedMarks,
            totalMarks: totalPossibleMarks,
            noOfAttempts,
          },
        });
      } catch (queryErr) {
        await queryAsync(conn, "ROLLBACK");
        closeConnection();
        console.error("Database query error:", queryErr);
        return res.status(500).json({
          success: false,
          message: "Failed to submit quiz",
          error: queryErr.message,
        });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
  let success = false;
  const userId = req.user.id;

  console.log("User ID:", userId);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      errors: errors.array(),
      message: "Invalid data format",
    });
  }

  try {
    const {
      QuizID,
      QuizCategory,
      QuizName,
      QuizLevel,
      QuizDuration,
      NegativeMarking,
      StartDateAndTime,
      EndDateTime,
      QuizVisibility,
    } = req.body;

    if (!QuizID) {
      return res.status(400).json({
        success: false,
        message: "QuizID is required",
      });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        console.error("Database connection error:", err);
        logError("Failed to connect to database");
        return res.status(500).json({
          success: false,
          message: "Database connection failed",
        });
      }

      logInfo("Database connection established successfully");

      try {
        // First, get the user's name from the database using email ID
        const userQuery =
          "SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?";
        const userRows = await queryAsync(conn, userQuery, [userId]);
        console.log("User Rows:", userRows);

        if (userRows.length === 0) {
          logWarning("User not found, please login first.");
          return res.status(400).json({
            success: false,
            message: "User not found, please login first.",
          });
        }

        const user = userRows[0];
        const authLstEdt = user.Name; // Get the username instead of email

        const checkQuizQuery = `
          SELECT QuizID FROM QuizDetails 
          WHERE QuizID = ? AND ISNULL(delStatus, 0) = 0
        `;
        const quizRows = await queryAsync(conn, checkQuizQuery, [QuizID]);

        if (quizRows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Quiz not found or has been deleted",
          });
        }

        // Update quiz details with current timestamp and editor info
        const updateQuery = `
          UPDATE QuizDetails 
          SET 
            QuizCategory = ?,
            QuizName = ?,
            QuizLevel = ?,
            QuizDuration = ?,
            NegativeMarking = ?,
            StartDateAndTime = CONVERT(datetime, ?),
            EndDateTime = CONVERT(datetime, ?),
            QuizVisibility = ?,
            AuthLstEdt = ?,
            editOnDt = GETDATE()
          WHERE QuizID = ? AND ISNULL(delStatus, 0) = 0
        `;

        const updateParams = [
          QuizCategory,
          QuizName,
          QuizLevel,
          QuizDuration,
          NegativeMarking,
          new Date(StartDateAndTime).toISOString(),
          new Date(EndDateTime).toISOString(),
          QuizVisibility,
          authLstEdt, // Use the username from database
          QuizID,
        ];

        console.log("Executing update query: ", updateQuery);
        const result = await queryAsync(conn, updateQuery, updateParams);

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message:
              "No quiz was updated. Quiz may not exist or data was identical.",
          });
        }

        success = true;
        logInfo("Quiz updated successfully!");

        return res.status(200).json({
          success: true,
          message: "Quiz updated successfully",
          quizId: QuizID,
        });
      } catch (queryErr) {
        logError("Database Query Error:", queryErr.message || queryErr);
        console.error("Database query error:", queryErr);
        return res.status(500).json({
          success: false,
          message: "Failed to update quiz",
          error: queryErr.message,
        });
      } finally {
        closeConnection(conn);
      }
    });
  } catch (error) {
    logError("Unexpected Error:", error.stack || JSON.stringify(error));
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const unmappQuestion = (req, res) => {
  const { mappingIds } = req.body;
  const adminName = req.user?.id;

  if (!mappingIds || (Array.isArray(mappingIds) && mappingIds.length === 0)) {
    return res.status(400).json({
      success: false,
      message: "Mapping ID(s) are required",
    });
  }

  const idsToUnmap = Array.isArray(mappingIds) ? mappingIds : [mappingIds];

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success: false,
          message: "Database connection error.",
        });
      }

      try {
        const updateQuery = `
          UPDATE QuizMapping 
          SET 
            delStatus = 1, 
            delOnDt = GETDATE(), 
            AuthDel = ? 
          WHERE 
            idCode IN (?) AND (delStatus IS NULL OR delStatus = 0)
        `;

        // Execute the update without checking affected rows
        await queryAsync(conn, updateQuery, [adminName, idsToUnmap]);

        // Always return success if the query executed without errors
        return res.status(200).json({
          success: true,
          message: "Unmapping request processed successfully",
        });
      } catch (updateErr) {
        logError(updateErr);
        return res.status(500).json({
          success: false,
          message: "Error updating question unmapping.",
          error: updateErr.message,
        });
      } finally {
        if (conn) closeConnection(conn);
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateQuestion = async (req, res) => {
  console.log("Incoming question update request:", req.body);
  const userId = req.user.id;

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
      message: "Validation failed"
    });
  }

  try {
    const {
      id, // Question ID
      question_text,
      Ques_level,
      group_id,
      image,
      question_type = 0, // 0 for single choice, 1 for multiple choice
      options = [],
      AuthLstEdt
    } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required"
      });
    }

    if (!question_text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question text is required"
      });
    }

    if (!group_id) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required"
      });
    }

    if (!Ques_level) {
      return res.status(400).json({
        success: false,
        message: "Question level is required"
      });
    }

    if (options.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 options are required"
      });
    }

    // Validate correct answers
    const correctOptions = options.filter(opt => opt.is_correct);
    if (correctOptions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one correct answer is required"
      });
    }

    if (question_type === 1 && correctOptions.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Multiple choice requires at least 2 correct answers"
      });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        console.error("Database connection error:", err);
        return res.status(500).json({
          success: false,
          message: "Database connection failed"
        });
      }

      let transactionStarted = false;

      try {
        // Verify question exists and isn't deleted
        const [question] = await queryAsync(conn, `
          SELECT id FROM Questions 
          WHERE id = ? AND ISNULL(delStatus, 0) = 0
        `, [id]);

        if (!question) {
          closeConnection(conn);
          return res.status(404).json({
            success: false,
            message: "Question not found or has been deleted"
          });
        }

        // Verify group exists
        const [group] = await queryAsync(conn, `
          SELECT group_id FROM GroupMaster 
          WHERE group_id = ? AND ISNULL(delStatus, 0) = 0
        `, [group_id]);

        if (!group) {
          closeConnection(conn);
          return res.status(404).json({
            success: false,
            message: "Question group not found"
          });
        }

        // Verify question level exists in tblDDReferences
        const [level] = await queryAsync(conn, `
          SELECT idCode FROM tblDDReferences 
          WHERE idCode = ? AND ddCategory = 'questionLevel' AND ISNULL(delStatus, 0) = 0
        `, [Ques_level]);

        if (!level) {
          closeConnection(conn);
          return res.status(400).json({
            success: false,
            message: "Invalid question level"
          });
        }

        // Get existing options
        const existingOptions = await queryAsync(conn, `
          SELECT id FROM QuestionOptions 
          WHERE question_id = ? AND ISNULL(delStatus, 0) = 0
          ORDER BY id ASC
        `, [id]);

        // Begin transaction
        await queryAsync(conn, "BEGIN TRANSACTION");
        transactionStarted = true;

        // Update question
        await queryAsync(conn, `
          UPDATE Questions SET
            question_text = ?,
            Ques_level = ?,
            group_id = ?,
            image = ?,
            question_type = ?,
            AuthLstEdt = ?,
            editOnDt = GETDATE()
          WHERE id = ?
        `, [
          question_text.trim(),
          Ques_level,
          group_id,
          image || null,
          question_type,
          AuthLstEdt || req.user.email || 'Unknown',
          id
        ]);

        // Process options
        const existingOptionIds = existingOptions.map(opt => opt.id);
        const newOptions = [];
        const optionsToUpdate = [];
        const optionsToDelete = [...existingOptionIds];

        options.forEach((option, index) => {
          if (index < existingOptions.length) {
            optionsToUpdate.push({
              id: existingOptions[index].id,
              ...option
            });
            optionsToDelete.splice(optionsToDelete.indexOf(existingOptions[index].id), 1);
          } else {
            newOptions.push(option);
          }
        });

        // Update existing options
        for (const option of optionsToUpdate) {
          await queryAsync(conn, `
            UPDATE QuestionOptions SET
              option_text = ?,
              is_correct = ?,
              image = ?,
              AuthLstEdt = ?,
              editOnDt = GETDATE()
            WHERE id = ? AND question_id = ?
          `, [
            option.option_text.trim(),
            option.is_correct ? 1 : 0,
            option.image || null,
            AuthLstEdt || req.user.email || 'Unknown',
            option.id,
            id
          ]);
        }

        // Add new options
        for (const option of newOptions) {
          await queryAsync(conn, `
            INSERT INTO QuestionOptions (
              question_id, option_text, is_correct, image,
              AuthAdd, AuthLstEdt, AddOnDt
            ) VALUES (?, ?, ?, ?, ?, ?, GETDATE())
          `, [
            id,
            option.option_text.trim(),
            option.is_correct ? 1 : 0,
            option.image || null,
            AuthLstEdt || req.user.email || 'Unknown',
            AuthLstEdt || req.user.email || 'Unknown'
          ]);
        }

        // Delete removed options
        for (const optionId of optionsToDelete) {
          await queryAsync(conn, `
            UPDATE QuestionOptions SET
              delStatus = 1,
              AuthDel = ?,
              AuthLstEdt = ?,
              delOnDt = GETDATE()
            WHERE id = ?
          `, [
            AuthLstEdt || req.user.email || 'Unknown',
            AuthLstEdt || req.user.email || 'Unknown',
            optionId
          ]);
        }

        // Commit transaction
        await queryAsync(conn, "COMMIT");
        closeConnection(conn);

        return res.status(200).json({
          success: true,
          message: "Question updated successfully",
          data: {
            questionId: id,
            optionsUpdated: optionsToUpdate.length,
            optionsAdded: newOptions.length,
            optionsDeleted: optionsToDelete.length
          }
        });

      } catch (error) {
        if (transactionStarted) {
          await queryAsync(conn, "ROLLBACK");
        }
        closeConnection(conn);
        console.error("Database error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to update question",
          error: error.message
        });
      }
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getLeaderboardRanking = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    logWarning(warningMessage);
    res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        res
          .status(500)
          .json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        const query = `WITH MaxAttempts AS ( SELECT userID, quizID, MAX(noOfAttempts) AS max_attempt FROM quiz_score GROUP BY userID, quizID) SELECT SUM(qs.ObtainedMarks) AS totalPoints, cu.Name FROM quiz_score qs JOIN MaxAttempts ma ON qs.userID = ma.userID 
        AND qs.quizID = ma.quizID AND qs.noOfAttempts = ma.max_attempt LEFT JOIN Community_User cu ON qs.userID = cu.UserID
        GROUP BY cu.Name;`;
        const quizzes = await queryAsync(conn, query);

        success = true;
        closeConnection();
        const infoMessage = "LeaderBoard fetched successfully";
        logInfo(infoMessage);
        res
          .status(200)
          .json({ success, data: { quizzes }, message: infoMessage });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
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