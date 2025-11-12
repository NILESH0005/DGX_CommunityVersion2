// import { use } from "react";
import db, { sequelize } from "../models/index.js";

const {
  QuizDetails,
  User,
  QuizQuestions,
  Group_Master,
  TableDDReference,
  QuizMapp,
  QuizQuestionOptions,
  QuizScore,
} = db;
import { Op, fn, col, literal, Sequelize } from "sequelize";

const { QueryTypes } = Sequelize;

export const createQuizService = async (userEmail, quizData) => {
  // Find user by email
  const user = await db.User.findOne({
    where: { EmailId: userEmail, delStatus: 0 },
    attributes: ["UserID", "Name", "isAdmin"],
  });

  if (!user) {
    throw new Error("User not found, please login first.");
  }

  const authAdd = user.UserID;

  let {
    category = null,
    name = null,
    level = null,
    duration = null,
    negativeMarking = false,
    passingPercentage = 50,
    startDate,
    startTime,
    endDate,
    endTime,
    type = null,
    quizVisibility = "Public",
    quizImage = null,
    refId = 0,
    refName = "quiz",
  } = quizData;

  if (!name || !startDate || !startTime || !endDate || !endTime) {
    throw new Error("Missing required fields");
  }

  // Combine date + time into full datetime
  const startDateAndTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);

  // Create quiz record
  const quiz = await db.QuizDetails.create({
    QuizCategory: category,
    QuizName: name,
    QuizLevel: level,
    QuizDuration: duration,
    NegativeMarking: negativeMarking,
    PassingPercentage: passingPercentage,
    StartDateAndTime: startDateAndTime,
    EndDateTime: endDateTime,
    QuizVisibility: quizVisibility,
    QuizImage: quizImage,
    AuthAdd: authAdd,
    AddOnDt: new Date(),
    delStatus: 0,
    refId,
    refName,
  });

  return quiz.QuizID;
};

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

export const getQuizzesService = async () => {
  const quizzes = await db.QuizDetails.findAll({
    attributes: [
      "QuizID",
      "QuizCategory",
      "QuizName",
      "QuizLevel",
      "QuizDuration",
      "NegativeMarking",
      "StartDateAndTime",
      "EndDateTime",
      "QuizVisibility",

      // Subquery: QuestionMappedCount
      [
        db.sequelize.literal(`(
          SELECT COUNT(*)
          FROM QuizMapping qm
          WHERE qm.quizId = QuizDetails.QuizID AND IFNULL(qm.delStatus,0) = 0
        )`),
        "QuestionMappedCount",
      ],

      // UniqueParticipants
      [
        db.sequelize.literal(`(
          SELECT COUNT(DISTINCT qs.userID)
          FROM Quiz_Score qs
          WHERE qs.quizID = QuizDetails.QuizID AND IFNULL(qs.delStatus,0) = 0
        )`),
        "UniqueParticipants",
      ],

      // TotalMarksPerQuiz
      [
        db.sequelize.literal(`(
          SELECT SUM(totalMarks)
          FROM QuizMapping qm
          WHERE qm.quizId = QuizDetails.QuizID AND IFNULL(qm.delStatus,0) = 0
        )`),
        "TotalMarksPerQuiz",
      ],

      // totalMaxAttempts
      [
        db.sequelize.literal(`(
          SELECT COALESCE(SUM(maxAttempts),0)
          FROM (
              SELECT quizID, userID, MAX(noOfAttempts) as maxAttempts
              FROM Quiz_Score
              WHERE IFNULL(delStatus,0)=0
              GROUP BY quizID, userID
          ) as subquery
          WHERE subquery.quizID = QuizDetails.QuizID
        )`),
        "totalMaxAttempts",
      ],
    ],
    where: db.sequelize.where(
      db.sequelize.fn("IFNULL", db.sequelize.col("QuizDetails.delStatus"), 0),
      0
    ),
    raw: true,
  });

  return quizzes;
};

export const deleteQuizService = async (quizId, userEmail) => {
  // 1. Find user by email
  const user = await User.findOne({
    attributes: ["UserID", "Name", "isAdmin"],
    where: {
      EmailId: userEmail,
      delStatus: 0,
    },
  });

  if (!user) {
    return {
      success: false,
      status: 400,
      message: "User not found, please login first.",
    };
  }
  if (user.isAdmin !== 1) {
    return {
      success: false,
      status: 403,
      message: "Only admins can delete quizzes.",
    };
  }

  const quiz = await QuizDetails.findOne({
    where: {
      QuizID: quizId,
      delStatus: 0,
    },
  });

  if (!quiz) {
    return {
      success: false,
      status: 404,
      message: "Quiz not found or already deleted.",
    };
  }

  // 3. Update quiz (soft delete)
  quiz.delStatus = 1;
  quiz.delOnDt = new Date();
  quiz.AuthDel = user.UserID;

  await quiz.save();

  return {
    success: true,
    status: 200,
    message: "Quiz deleted successfully.",
    data: {
      QuizID: quiz.QuizID,
      AuthDel: quiz.AuthDel,
      delOnDt: quiz.delOnDt,
      delStatus: quiz.delStatus,
    },
  };
};

export const createQuestionService = async (payload, userEmail) => {
  const { question_text, Ques_level, image, group_id, question_type, options } =
    payload;

  // ✅ Find user by email
  const user = await User.findOne({
    where: { EmailId: userEmail, delStatus: 0 },
    attributes: ["UserID", "Name"],
  });

  if (!user) {
    throw new Error("User not found, please login first.");
  }

  const authAdd = user.UserID; // 👈 store Name instead of Email

  // ✅ Validation
  if (
    !question_text ||
    !group_id ||
    !options ||
    options.length < 2 ||
    question_type === undefined
  ) {
    throw new Error("Missing required fields or insufficient options.");
  }

  if (question_type !== 0 && question_type !== 1) {
    throw new Error(
      "question_type must be either 0 (single answer) or 1 (multiple answers)."
    );
  }

  if (question_type === 0) {
    const correctOptions = options.filter((opt) => opt.is_correct).length;
    if (correctOptions !== 1) {
      throw new Error(
        "Single-answer questions must have exactly one correct option."
      );
    }
  }

  if (question_type === 1) {
    const correctOptions = options.filter((opt) => opt.is_correct).length;
    if (correctOptions < 2) {
      throw new Error(
        "Multiple-answer questions must have at least two correct options."
      );
    }
  }

  // ✅ Save Question + Options
  return await db.sequelize.transaction(async (t) => {
    const question = await QuizQuestions.create(
      {
        question_text,
        Ques_level,
        image,
        group_id,
        question_type,
        AuthAdd: authAdd, // 👈 Name here
        AddOnDt: new Date(),
        delStatus: 0,
      },
      { transaction: t }
    );

    const questionId = question.id;

    const optionData = options
      .filter((opt) => opt.option_text && opt.option_text.trim() !== "")
      .map((opt) => ({
        question_id: questionId,
        option_text: opt.option_text,
        is_correct: opt.is_correct ? 1 : 0,
        image: opt.image || null,
        AuthAdd: authAdd, // 👈 Name here too
        AddOnDt: new Date(),
        delStatus: 0,
      }));

    if (optionData.length > 0) {
      await QuizQuestionOptions.bulkCreate(optionData, { transaction: t });
    }

    return questionId;
  });
};

export const getQuestionsService = async () => {
  try {
    const query = `
     SELECT 
        q.id AS question_id,
        q.question_text,
        gm.group_name,
        td.ddValue,
        td.idCode,
        qo.id AS option_id,
        qo.option_text,
        qo.is_correct,
        qm.quizId AS QuizID,
        qd.QuizName,
        q.Ques_level,
        q.question_type,
        q.AddOnDt
      FROM giindiadgx_community.Questions q
      LEFT JOIN giindiadgx_community.GroupMaster gm ON gm.group_id = q.group_id
      LEFT JOIN giindiadgx_community.tblDDReference td ON td.idCode = q.Ques_level
      LEFT JOIN giindiadgx_community.QuestionOptions qo ON qo.question_id = q.id AND (qo.delStatus = 0 OR qo.delStatus IS NULL)
      LEFT JOIN giindiadgx_community.QuizMapping qm ON qm.QuestionsID = q.id AND (qm.delStatus = 0 OR qm.delStatus IS NULL)
      LEFT JOIN giindiadgx_community.QuizDetails qd ON qd.QuizID = qm.quizId
      WHERE q.delStatus = 0
    `;

    const result = await sequelize.query(query, { type: QueryTypes.SELECT });

    // Optionally group options under each question if needed
    const questionsMap = {};
    result.forEach((row) => {
      if (!questionsMap[row.question_id]) {
        questionsMap[row.question_id] = {
          question_id: row.question_id,
          question_text: row.question_text,
          group_name: row.group_name,
          ddValue: row.ddValue,
          idCode: row.idCode,
          Ques_level: row.Ques_level,
          question_type: row.question_type,
          AddOnDt: row.AddOnDt,
          QuizID: row.QuizID,
          QuizName: row.QuizName,
          options: [],
        };
      }

      if (row.option_id) {
        questionsMap[row.question_id].options.push({
          id: row.option_id,
          option_text: row.option_text,
          is_correct: row.is_correct,
        });
      }
    });

    const response = Object.values(questionsMap);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteQuestionService = async (questionId, adminName) => {
  return await db.sequelize.transaction(async (t) => {
    const question = await db.QuizQuestions.findOne({
      where: {
        id: questionId,
        [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
      },
      transaction: t,
    });

    if (!question) {
      throw new Error("Question not found or already deleted.");
    }
    await db.QuizQuestions.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AuthDel: adminName,
        AuthLstEdt: adminName,
      },
      {
        where: { id: questionId },
        transaction: t,
      }
    );

    const optionsDeleted = await db.QuizQuestionOptions.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AuthDel: adminName,
        AuthLstEdt: adminName,
      },
      {
        where: {
          question_id: questionId,
          [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
        },
        transaction: t,
      }
    );

    return {
      questionId,
      optionsDeleted: optionsDeleted[0], // Sequelize returns [affectedCount]
    };
  });
};

export const getQuizQuestionsService = async (quizId) => {
  const query = `
    SELECT 
      qm.idCode,
      qm.quizGroupID,
      gm.group_name,
      qm.quizId,
      qm.QuestionsID,
      q.question_text AS QuestionTxt,
      q.Ques_level,
      q.question_type,               
      qm.negativeMarks,
      qm.totalMarks,
      qm.AuthAdd,
      qm.AddOnDt,
      qm.delStatus,
      qd.QuizName,
      qd.QuizDuration,
      qd.NegativeMarking,
      ref.ddValue AS question_level,
      q.image AS question_image,
      qo.is_correct,
      qo.option_text,
      qo.id AS optionId
    FROM QuizMapping qm
    LEFT JOIN Questions q ON qm.QuestionsID = q.id
    LEFT JOIN QuizDetails qd ON qm.quizId = qd.QuizID
    LEFT JOIN tblDDReference ref ON q.Ques_level = ref.idCode
    LEFT JOIN QuestionOptions qo ON q.id = qo.question_id
    LEFT JOIN GroupMaster gm ON qm.quizGroupID = gm.group_id
    WHERE qm.quizId = :quizId 
      AND qm.delStatus = 0 
      AND qo.delStatus = 0
  `;

  const rows = await db.sequelize.query(query, {
    replacements: { quizId },
    type: db.sequelize.QueryTypes.SELECT,
  });

  if (!rows || rows.length === 0) {
    return null;
  }

  // Format results: group options under each question
  const questionMap = {};
  rows.forEach((q) => {
    if (!questionMap[q.QuestionsID]) {
      questionMap[q.QuestionsID] = {
        idCode: q.idCode,
        quizGroupID: q.quizGroupID,
        group_name: q.group_name,
        quizId: q.quizId,
        QuestionsID: q.QuestionsID,
        QuestionTxt: q.QuestionTxt,
        Ques_level: q.Ques_level,
        question_type: q.question_type === 1,
        negativeMarks: q.negativeMarks,
        negativeMarking: q.NegativeMarking === 1,
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

  return {
    quizId,
    quizName: rows[0]?.QuizName || "",
    quizDuration: rows[0]?.QuizDuration || 0,
    questions: Object.values(questionMap),
  };
};

export const getQuestionsByGroupAndLevelService = async (
  group_id,
  level_id
) => {
  try {
    const [levelResult] = await sequelize.query(
      `SELECT ddValue 
       FROM giindiadgx_community.tblDDReference 
       WHERE idCode = :level_id AND ddCategory = 'questionLevel'`,
      {
        replacements: { level_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!levelResult) {
      return {
        success: false,
        status: 400,
        message: "Invalid level ID",
      };
    }

    const levelName = levelResult.ddValue;

    // Step 2: Get Questions with Joins
    const questions = await sequelize.query(
      `SELECT  
        q.id AS question_id,  
        q.question_text, 
        q.Ques_level AS level, 
        q.group_id, 
        qm.quizGroupID AS mapped_quiz_id,
        qm.totalMarks, 
        qm.negativeMarks, 
        qd.NegativeMarking,
        ddr.ddValue AS question_level,
        qo.option_text,
        qo.is_correct,
        qd.QuizName AS quiz_name 
      FROM giindiadgx_community.Questions q
      LEFT JOIN giindiadgx_community.QuizMapping qm ON q.id = qm.QuestionsID
      LEFT JOIN giindiadgx_community.QuizDetails qd ON qm.quizGroupID = qd.QuizID 
      LEFT JOIN giindiadgx_community.tblDDReference ddr ON q.Ques_level = ddr.idCode
      LEFT JOIN giindiadgx_community.QuestionOptions qo ON q.id = qo.question_id
      WHERE COALESCE(q.delStatus, 0) = 0
        AND q.group_id = :group_id
        AND q.Ques_level = :level_id`,
      {
        replacements: { group_id, level_id }, // <-- pass replacements here
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      success: true,
      status: 200,
      data: {
        questions,
        levelInfo: {
          id: level_id,
          name: levelName,
        },
      },
      message: "Data fetched successfully",
    };
  } catch (error) {
    console.error("Service error (getQuestionsByGroupAndLevelService):", error);
    return {
      success: false,
      status: 500,
      message: "Database query failed",
    };
  }
};

export const createQuizQuestionMappingService = async (userEmail, mappings) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Fetch user (lookup by EmailId, like in createBlogPost)
    const user = await db.User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
      attributes: ["UserID", "Name", "isAdmin"],
    });

    if (!user) {
      return {
        status: 400,
        response: {
          success: false,
          data: {},
          message: "User not found, please login first.",
        },
      };
    }

    const insertData = mappings.map((mapping) => ({
      quizGroupID: parseInt(mapping.quizGroupID) || 0,
      quizId: parseInt(mapping.quizId) || 0,
      QuestionsID: parseInt(mapping.QuestionsID) || 0,
      QuestionTxt: String(mapping.QuestionName || "").substring(0, 500),
      negativeMarks: parseFloat(mapping.negativeMarks) || 0,
      totalMarks: parseFloat(mapping.totalMarks) || 1,
      Ques_level: parseInt(mapping.Ques_level) || 0,
      AuthAdd: user.UserID,
      AddOnDt: new Date(),
      delStatus: 0,
      UserID: user.UserID, // keep track of who added
    }));

    await db.QuizMapp.bulkCreate(insertData, { transaction });
    await transaction.commit();

    return {
      status: 200,
      response: {
        success: true,
        count: mappings.length,
        message: "Questions mapped successfully",
      },
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Service Error (createQuizQuestionMapping):", error);

    return {
      status: 500,
      response: {
        success: false,
        data: error,
        message: "Something went wrong while mapping questions",
      },
    };
  }
};

export const getUserQuizCategoryService = async (userEmail) => {
  try {
    // 1. Find user by email
    const user = await db.User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
      attributes: ["UserID"],
    });

    if (!user) {
      return {
        status: 404,
        response: {
          success: false,
          data: {},
          message: "User not found, please login first.",
        },
      };
    }

    const userId = user.UserID;

    // 2. Raw SQL query (using Sequelize)
    const query = `
      SELECT 
        qd.QuizID,
        qd.QuizName,
        qd.QuizImage,
        qd.StartDateAndTime,
        qd.EndDateTime,
        gm.group_name,
        gm.group_id,
        qd.refId,
        qd.refName,
        SUM(qm.totalMarks) AS MaxScore,
        COUNT(DISTINCT qm.QuestionsID) AS Total_Question_No,
        MAX(IFNULL(us.noOfAttempts, 0)) AS userAttempts
      FROM QuizMapping qm
      LEFT JOIN QuizDetails qd ON qm.quizId = qd.QuizID
      LEFT JOIN GroupMaster gm ON qd.QuizCategory = gm.group_id
      LEFT JOIN (
        SELECT quizID, MAX(noOfAttempts) AS noOfAttempts
        FROM Quiz_Score
        WHERE userID = :userId
        GROUP BY quizID
      ) AS us ON qm.quizId = us.quizID
      WHERE IFNULL(qm.delStatus, 0) = 0 
        AND IFNULL(qd.delStatus, 0) = 0
      GROUP BY 
        qd.QuizID, 
        qd.QuizImage, 
        qd.QuizName,
        gm.group_id, 
        gm.group_name, 
        qd.StartDateAndTime, 
        qd.EndDateTime,
        qd.refId,
        qd.refName
      ORDER BY qd.refName, qd.QuizName;
    `;

    const quizzes = await db.sequelize.query(query, {
      replacements: { userId },
      type: db.sequelize.QueryTypes.SELECT,
    });

    const validQuizzes = quizzes.filter(
      (quiz) =>
        quiz.QuizID !== null &&
        quiz.QuizName !== null &&
        quiz.group_id !== null &&
        quiz.group_name !== null
    );

    return {
      status: 200,
      response: {
        success: true,
        data: { quizzes: validQuizzes },
        message: "Quizzes fetched successfully",
      },
    };
  } catch (error) {
    console.error("Service Error (getUserQuizCategory):", error);
    return {
      status: 500,
      response: {
        success: false,
        data: error,
        message: "Something went wrong while fetching quizzes",
      },
    };
  }
};

export const getLeaderboardRankingService = async () => {
  try {
    const query = `
      WITH MaxAttempts AS (
        SELECT userID, quizID, MAX(noOfAttempts) AS max_attempt
        FROM Quiz_Score
        GROUP BY userID, quizID
      )
      SELECT 
        SUM(qs.ObtainedMarks) AS totalPoints, 
        cu.Name
      FROM Quiz_Score qs
      JOIN MaxAttempts ma 
        ON qs.userID = ma.userID 
        AND qs.quizID = ma.quizID 
        AND qs.noOfAttempts = ma.max_attempt
      LEFT JOIN Community_User cu 
        ON qs.userID = cu.UserID
      GROUP BY cu.Name
      ORDER BY totalPoints DESC;
    `;

    const leaderboard = await db.sequelize.query(query, {
      type: db.sequelize.QueryTypes.SELECT,
    });

    return {
      status: 200,
      response: {
        success: true,
        data: { quizzes: leaderboard },
        message: "Leaderboard fetched successfully",
      },
    };
  } catch (error) {
    console.error("Service Error (getLeaderboardRanking):", error);
    return {
      status: 500,
      response: {
        success: false,
        data: error,
        message: "Something went wrong while fetching leaderboard",
      },
    };
  }
};

export const updateQuizService = async (quizData, userEmail) => {
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
    } = quizData;

    // 1. Get user from DB
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
      attributes: ["UserID", "Name", "isAdmin"],
    });

    if (!user) {
      return {
        status: 404,
        response: {
          success: false,
          message: "User not found, please login first.",
        },
      };
    }

    // 2. Check if quiz exists
    const quiz = await db.QuizDetails.findOne({
      where: { QuizID, delStatus: 0 },
    });

    if (!quiz) {
      return {
        status: 404,
        response: {
          success: false,
          message: "Quiz not found or has been deleted",
        },
      };
    }

    // 3. Update quiz
    quiz.QuizCategory = QuizCategory;
    quiz.QuizName = QuizName;
    quiz.QuizLevel = QuizLevel;
    quiz.QuizDuration = QuizDuration;
    quiz.NegativeMarking = NegativeMarking;
    quiz.StartDateAndTime = StartDateAndTime;
    quiz.EndDateTime = EndDateTime;
    quiz.QuizVisibility = QuizVisibility;
    quiz.AuthLstEdt = user.UserID; // user’s name instead of email
    quiz.editOnDt = new Date();

    await quiz.save();

    return {
      status: 200,
      response: {
        success: true,
        message: "Quiz updated successfully",
        quizId: quiz.QuizID,
      },
    };
  } catch (error) {
    console.error("Service Error (updateQuiz):", error);
    return {
      status: 500,
      response: {
        success: false,
        message: "Failed to update quiz",
        error: error.message,
      },
    };
  }
};

export const unmapQuestionService = async (mappingIds, adminName) => {
  try {
    if (!mappingIds || mappingIds.length === 0) {
      return {
        status: 400,
        response: {
          success: false,
          message: "Mapping ID(s) are required",
        },
      };
    }

    // Update rows in QuizMapping
    await QuizMapp.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AuthDel: adminName,
      },
      {
        where: {
          idCode: mappingIds,
          [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
        },
      }
    );

    return {
      status: 200,
      response: {
        success: true,
        message: "Unmapping request processed successfully",
      },
    };
  } catch (error) {
    console.error("Service Error (unmapQuestion):", error);
    return {
      status: 500,
      response: {
        success: false,
        message: "Error updating question unmapping",
        error: error.message,
      },
    };
  }
};

export const updateQuestionService = async (payload, userId) => {
  const {
    id,
    question_text,
    Ques_level,
    group_id,
    image,
    question_type,
    options,
  } = payload;

  let transaction;
  try {
    transaction = await sequelize.transaction();

    // ✅ Validate user exists and is active
    const user = await User.findOne({
      where: {
        [Op.or]: [{ UserID: userId }, { id: userId }],
        [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
      },
      transaction,
    });

    if (!user) throw new Error("User not found or inactive");

    // ✅ Validate Question exists
    const question = await QuizQuestions.findOne({
      where: { id, delStatus: 0 },
      transaction,
    });
    if (!question) throw new Error("Question not found or deleted");

    // ✅ Validate Group exists
    const group = await Group_Master.findOne({
      where: {
        group_id,
        delStatus: 0,
        group_category: "questionGroup",
      },
      transaction,
    });
    if (!group) throw new Error("Invalid group (group_id not found)");

    // ✅ Validate Level exists
    const level = await TableDDReference.findOne({
      where: {
        idCode: Ques_level,
        ddCategory: "questionLevel",
        delStatus: 0,
      },
      transaction,
    });
    if (!level) throw new Error("Invalid question level");

    // ✅ Update Question
    await question.update(
      {
        question_text,
        Ques_level,
        group_id,
        image: image || null,
        question_type,
        AuthLstEdt: user.UserID, // ⬅️ store user ID, not email
        editOnDt: new Date(),
      },
      { transaction }
    );

    // ✅ Existing Options
    const existingOptions = await QuizQuestionOptions.findAll({
      where: { question_id: id, delStatus: 0 },
      order: [["id", "ASC"]],
      transaction,
    });

    const existingOptionIds = existingOptions.map((o) => o.id);
    const newOptions = [];
    const optionsToUpdate = [];
    const optionsToDelete = [...existingOptionIds];

    options.forEach((option, idx) => {
      if (idx < existingOptions.length) {
        optionsToUpdate.push({ id: existingOptions[idx].id, ...option });
        optionsToDelete.splice(
          optionsToDelete.indexOf(existingOptions[idx].id),
          1
        );
      } else {
        newOptions.push(option);
      }
    });

    // ✅ Update existing options
    for (const option of optionsToUpdate) {
      await QuizQuestionOptions.update(
        {
          option_text: option.option_text.trim(),
          is_correct: option.is_correct ? 1 : 0,
          image: option.image || null,
          AuthLstEdt: user.UserID, // ✅ user ID
          editOnDt: new Date(),
        },
        { where: { id: option.id, question_id: id }, transaction }
      );
    }

    // ✅ Insert new options
    for (const option of newOptions) {
      await QuizQuestionOptions.create(
        {
          question_id: id,
          option_text: option.option_text.trim(),
          is_correct: option.is_correct ? 1 : 0,
          image: option.image || null,
          AuthAdd: user.UserID, // ✅ user ID
          AuthLstEdt: user.UserID,
          AddOnDt: new Date(),
        },
        { transaction }
      );
    }

    // ✅ Soft delete removed options
    if (optionsToDelete.length > 0) {
      await QuizQuestionOptions.update(
        {
          delStatus: 1,
          AuthDel: user.UserID, // ✅ user ID
          AuthLstEdt: user.UserID,
          delOnDt: new Date(),
        },
        { where: { id: optionsToDelete }, transaction }
      );
    }

    await transaction.commit();

    return {
      success: true,
      message: "Question updated successfully",
      data: {
        questionId: id,
        updatedBy: user.Name,
        optionsUpdated: optionsToUpdate.length,
        optionsAdded: newOptions.length,
        optionsDeleted: optionsToDelete.length,
      },
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export const submitQuizService = async (userId, { quizId, answers }) => {
  console.log("submitQuizService received userId:", userId);

  return await sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { EmailId: userId, delStatus: 0 },
      transaction: t,
    });
    console.log("submitQuizService received userId:", userId);

    if (!user) {
      throw new Error("User not found");
    }

    let obtainedMarks = 0;
    let totalPossibleMarks = 0;

    // 2. Get attempt count
    const attemptRow = await QuizScore.findOne({
      where: { userID: user.UserID, quizID: quizId },
      attributes: [
        [sequelize.fn("MAX", sequelize.col("noOfAttempts")), "maxAttempt"],
      ],
      raw: true,
      transaction: t,
    });

    const noOfAttempts = (attemptRow?.maxAttempt || 0) + 1;

    // 3. Loop through answers
    for (const answer of answers) {
      const selectedOptions = answer.selectedOptionIds
        ? answer.selectedOptionIds
        : answer.selectedOptionId
        ? [answer.selectedOptionId]
        : [];

      if (selectedOptions.length === 0) continue;

      // Get question marks
      const mapping = await QuizMapp.findOne({
        where: { quizId, QuestionsID: answer.questionId },
        attributes: ["totalMarks", "negativeMarks"],
        transaction: t,
      });

      if (!mapping) continue;

      const questionMarks = Number(mapping.totalMarks);
      const negativeMarks = Number(mapping.negativeMarks) || 0;
      totalPossibleMarks += questionMarks;

      let isFullyCorrect = true;

      // Check each selected option
      for (const optionId of selectedOptions) {
        const option = await QuizQuestionOptions.findOne({
          where: { id: optionId, question_id: answer.questionId },
          attributes: ["is_correct"],
          transaction: t,
        });

        if (!option) {
          isFullyCorrect = false;
          continue;
        }

        const isCorrect = option.is_correct === 1;
        if (!isCorrect) isFullyCorrect = false;

        // Insert into Quiz_Score
        await QuizScore.create(
          {
            userID: user.UserID,
            quizID: quizId,
            questionID: answer.questionId,
            answerID: optionId,
            correctAns: isCorrect,
            marks: questionMarks,
            AuthAdd: user.UserID,
            AddOnDt: new Date(),
            delStatus: 0,
            ObtainedMarks: isFullyCorrect ? questionMarks : -negativeMarks,
            totalMarks: questionMarks,
            noOfAttempts,
          },
          { transaction: t }
        );
      }

      obtainedMarks += isFullyCorrect ? questionMarks : -negativeMarks;
    }

    return { obtainedMarks, totalMarks: totalPossibleMarks, noOfAttempts };
  });
};

export const getQuizQuestionsByQuizIdService = async (userEmail, QuizID) => {
  try {
    if (!QuizID || isNaN(parseInt(QuizID))) {
      return {
        status: 400,
        response: {
          success: false,
          data: null,
          message: "QuizID is required and must be a valid number",
        },
      };
    }

    const quizId = parseInt(QuizID);

    const questions = await QuizMapping.findAll({
      where: { quizId, delStatus: 0 },
      include: [
        { model: QuizQuestions, include: [{ model: QuestionOptions }] },
        { model: QuizDetails },
        { model: Group_Master },
        {
          model: TableDDReference,
          foreignKey: "Ques_level",
          targetKey: "idCode",
        },
      ],
    });

    if (!questions || questions.length === 0) {
      return {
        status: 404,
        response: {
          success: false,
          data: null,
          message: "No questions found for this quiz",
        },
      };
    }

    const questionMap = {};
    questions.forEach((q) => {
      const ques = q.QuizQuestion;
      const quizDetail = q.QuizDetail;
      const group = q.GroupMaster;

      if (!questionMap[ques.id]) {
        questionMap[ques.id] = {
          idCode: q.idCode,
          quizGroupID: q.quizGroupID,
          group_name: group?.group_name || null,
          quizId: q.quizId,
          QuestionsID: ques.id,
          QuestionTxt: ques.question_text,
          Ques_level: ques.Ques_level,
          question_type: ques.question_type,
          negativeMarks: q.negativeMarks,
          negativeMarking: quizDetail?.NegativeMarking,
          totalMarks: q.totalMarks,
          AuthAdd: q.AuthAdd,
          AddOnDt: q.AddOnDt,
          delStatus: q.delStatus,
          QuizName: quizDetail?.QuizName,
          QuizDuration: quizDetail?.QuizDuration,
          question_level: ques.Ques_level, // Or from TableDDReference if needed
          question_image: ques.image,
          options: [],
        };
      }

      q.QuizQuestion.QuestionOptions.forEach((opt) => {
        questionMap[ques.id].options.push({
          id: opt.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct === 1,
        });
      });
    });

    const formattedQuestions = Object.values(questionMap);

    return {
      status: 200,
      response: {
        success: true,
        data: {
          quizId,
          quizName: formattedQuestions[0]?.QuizName || "",
          quizDuration: formattedQuestions[0]?.QuizDuration || 0,
          questions: formattedQuestions,
        },
        message: "Quiz questions fetched successfully",
      },
    };
  } catch (error) {
    logError("Error in getQuizQuestionsByQuizIdService:", error);
    return {
      status: 500,
      response: {
        success: false,
        data: null,
        message: "Failed to fetch quiz questions",
      },
    };
  }
};

export const getQuizzesByRefIdService = async (refId) => {
  if (!refId) {
    return { success: false, status: 400, message: "refId is required" };
  }

  try {
    const quizzes = await QuizDetails.findAll({
      where: {
        refId,
        delStatus: 0,
      },
      order: [["QuizName", "ASC"]],
    });

    return { success: true, data: quizzes };
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return { success: false, status: 500, message: "Failed to fetch quizzes" };
  }
};

export const getUserQuizHistoryService = async (userId) => {
  try {
    const query = `
      WITH LatestAttempts AS (
          SELECT 
              quizID,
              MAX(noOfAttempts) AS maxAttempt
          FROM 
              Quiz_Score
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

    const quizHistory = await db.sequelize.query(query, {
      replacements: [userId, userId],
      type: db.sequelize.QueryTypes.SELECT,
    });

    // Filter out any invalid records
    const validHistory = quizHistory.filter(
      (quiz) =>
        quiz.quizID !== null &&
        quiz.QuizName !== null &&
        quiz.latestAttemptDate !== null
    );

    return {
      status: 200,
      response: {
        success: true,
        data: { quizHistory: validHistory },
        message: "Quiz history fetched successfully",
      },
    };
  } catch (error) {
    console.error("Service Error (getUserQuizHistory):", error);
    return {
      status: 500,
      response: {
        success: false,
        data: error,
        message: "Something went wrong while fetching quiz history",
      },
    };
  }
};

export const getUserByEmailService = async (email) => {
  try {
    const user = await db.User.findOne({
      where: {
        EmailId: email,
        delStatus: { [Op.or]: [0, null] },
      },
      attributes: ["UserID"],
    });

    return user;
  } catch (error) {
    console.error("Service Error (getUserByEmail):", error);
    throw error;
  }
};
