export default (sequelize, DataTypes) => {
  const QuestionOptions = sequelize.define(
    "QuestionOptions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      option_text: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_correct: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      image: {
        type: DataTypes.TEXT, // nvarchar(MAX) in SQL maps to TEXT in Sequelize
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
    },
    {
      tableName: "QuestionOptions",
      timestamps: false, 
    }
  );

  return QuestionOptions;
};
