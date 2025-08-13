// models/SubModulesDetails.js
export default (sequelize, DataTypes) => {
  const SubModulesDetails = sequelize.define(
    "SubModulesDetails",
    {
      SubModuleID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      SubModuleName: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      SubModuleImage: {
        type: DataTypes.BLOB("long"),
        allowNull: true
      },
      SubModuleDescription: {
        type: DataTypes.STRING(800),
        allowNull: true
      },
      ModuleID: {
        type: DataTypes.INTEGER,
        allowNull: false
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
      SubModuleImagePath: {
        type: DataTypes.STRING(500),
        allowNull: true
      }
    },
    {
      tableName: "SubModulesDetails",
      timestamps: false
    }
  );

  return SubModulesDetails;
};
