// models/UserQueryReplies.js
export default (sequelize, DataTypes) => {
  return sequelize.define(
    "UserQueryReplies",
    {
      ReplyID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      QueryID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      RepliedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      ReplyText: {
        type: DataTypes.STRING(1000),
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
        defaultValue: 0,
      },
    },
    {
      tableName: "UserQueryReplies",
      timestamps: false,
    },
  );
};
