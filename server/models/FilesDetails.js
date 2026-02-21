// models/FilesDetails.js
export default (sequelize, DataTypes) => {
  const FilesDetails = sequelize.define(
    "FilesDetails",
    {
      FileID: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true,
        allowNull: false,
      },
      FilesName: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      FilePath: {
        type: DataTypes.STRING(800),
        allowNull: true,
      },
      FileType: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      UnitID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      AuthAdd: {
        type: DataTypes.STRING(800),
        allowNull: false,
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
        allowNull: false,
      },
      editOnDt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delStatus: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Percentage: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      Description: {
        type: DataTypes.STRING(800),
        allowNull: true,
      },
      SortingOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      EstimatedTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "FilesDetails",
      timestamps: false,
    }
  );

  return FilesDetails;
};
