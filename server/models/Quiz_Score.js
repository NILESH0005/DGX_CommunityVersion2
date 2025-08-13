// models/quiz_score.js
export default (sequelize, DataTypes) => {
  const Quiz_Score = sequelize.define(
    "Quiz_Score",
    {
      quizScoreId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      quizID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      questionID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      answerID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      correctAns: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      marks: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      AuthAdd: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      AuthDel: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      AuthLstEdit: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      delOnDt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      AddOnDt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      editOnDt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      ObtainedMarks: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      totalMarks: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      noOfAttempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "Quiz_Score",
      timestamps: false,
    }
  );

  return Quiz_Score;
};
