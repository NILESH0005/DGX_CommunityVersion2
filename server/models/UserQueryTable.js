// models/UserQueryTable.js
export default (sequelize, DataTypes) => {
  return sequelize.define(
    "UserQueryTable",
    {
      QueryID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      ModuleID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      SubModuleID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      UnitID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      FileID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      ModuleCreatorID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      UserID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      QueryText: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },

      Status: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "Pending",
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
      tableName: "UserQueryTable",
      timestamps: false,
    },
  );
};
