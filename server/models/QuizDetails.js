// models/QuizDetails.js
export default (sequelize, DataTypes) => {
  const QuizDetails = sequelize.define(
    "QuizDetails",
    {
      QuizID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      QuizCategory: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      QuizName: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      QuizLevel: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      QuizDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NegativeMarking: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      StartDateAndTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      EndDateTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      QuizVisibility: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      QuizImage: {
        type: DataTypes.TEXT, 
        allowNull: true,
      },
      AuthAdd: {
        type: DataTypes.STRING(800),
        allowNull: true,
      },
      AuthDel: {
        type: DataTypes.STRING(800),
        allowNull: true,
      },
      AuthLstEdt: {
        type: DataTypes.STRING(800),
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
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UniqueParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      TotalMarks: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NumberOfAttempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PassingPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      refId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      TotalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      refName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: "QuizDetails",
      timestamps: false,
    }
  );

  return QuizDetails;
};
