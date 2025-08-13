// models/tblCMSContent.js
export default (sequelize, DataTypes) => {
  const tblCMSContent = sequelize.define(
    "tblCMSContent",
    {
      idCode: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ComponentName: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      ComponentIdName: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      Title: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      Location: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      Image: {
        type: DataTypes.TEXT("long"), // nvarchar(MAX) → TEXT
        allowNull: true,
      },
      Link: {
        type: DataTypes.TEXT("long"), // nvarchar(MAX) → TEXT
        allowNull: true,
      },
      Content: {
        type: DataTypes.TEXT, // text type
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
      AuthLstEdit: {
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
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      TechStack: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: "tblCMSContent", // exact DB table name
      timestamps: false,
    }
  );

  return tblCMSContent;
};
