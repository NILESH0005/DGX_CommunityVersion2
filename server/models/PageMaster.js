// models/PageMaster.js
export default (sequelize, DataTypes) => {
  const PageMaster = sequelize.define(
    "PageMaster",
    {
      PageID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // 🔐 SYSTEM / ACCESS KEY (DO NOT CHANGE EXISTING USAGE)
      PageName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      DisplayName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      MenuType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "NONE", 
      },
      AuthAdd: {
        type: DataTypes.STRING(800),
        allowNull: false,
      },
      AuthDel: {
        type: DataTypes.STRING(800),
        allowNull: true,
        defaultValue: null,
      },
      AuthLstEdt: {
        type: DataTypes.STRING(800),
        allowNull: true,
        defaultValue: null,
      },
      delOnDt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      AddOnDt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      editOnDt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      delStatus: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "PageMaster",
      timestamps: false,
    },
  );

  return PageMaster;
};
