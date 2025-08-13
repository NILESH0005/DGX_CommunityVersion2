export default (sequelize, DataTypes) => {
  const QuizMapping = sequelize.define(
    "QuizMapping",
    {
      idCode: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      quizGroupID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      quizId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      QuestionsID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      QuestionTxt: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      Ques_level: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      negativeMarks: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      totalMarks: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      AuthAdd: {
        type: DataTypes.STRING(800),
        allowNull: true
      },
      AuthDel: {
        type: DataTypes.STRING(800),
        allowNull: true
      },
      AuthLstEdit: {
        type: DataTypes.STRING(800),
        allowNull: true
      },
      delOnDt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      AddOnDt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      editOnDt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      delStatus: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: "QuizMapping",
      timestamps: false,
      indexes: [
        {
          name: "idx_quizGroupID",
          fields: ["quizGroupID"]
        },
        {
          name: "idx_quizId",
          fields: ["quizId"]
        },
        {
          name: "idx_QuestionsID",
          fields: ["QuestionsID"]
        }
      ]
    }
  );

  return QuizMapping;
};
