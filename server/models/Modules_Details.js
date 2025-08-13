// models/ModuleDetails.js
export default (sequelize, DataTypes) => {
  const ModuleDetails = sequelize.define(
    "ModuleDetails",
    {
      ModuleID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ModuleName: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      ModuleImage: {
        type: DataTypes.BLOB, // for 'image' type
        allowNull: true
      },
      ModuleDescription: {
        type: DataTypes.STRING(800),
        allowNull: true
      },
      AuthAdd: {
        type: DataTypes.STRING(800),
        allowNull: false
      },
      AddDel: {
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
        allowNull: false
      },
      editOnDt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      delStatus: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      SortingOrder: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      ModuleImagePath: {
        type: DataTypes.STRING(500),
        allowNull: true
      }
    },
    {
      tableName: "ModuleDetails",
      timestamps: false
    }
  );

  return ModuleDetails;
};
