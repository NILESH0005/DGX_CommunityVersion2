// models/Questions.js
export default (sequelize, DataTypes) => {
  const Questions = sequelize.define(
    "Questions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      question_text: {
        type: DataTypes.TEXT, // nvarchar(MAX) → TEXT
        allowNull: true,
      },
      Ques_level: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      image: {
        type: DataTypes.TEXT, // nvarchar(MAX) → TEXT
        allowNull: true,
      },
      group_id: {
        type: DataTypes.INTEGER,
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
      question_type: {
        type: DataTypes.BOOLEAN, // bit → BOOLEAN
        allowNull: false,
      },
    },
    {
      tableName: "Questions",
      timestamps: false,
    }
  );

  return Questions;
};
