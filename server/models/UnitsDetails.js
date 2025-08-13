// models/UnitsDetails.js
export default (sequelize, DataTypes) => {
  const UnitsDetails = sequelize.define(
    "UnitsDetails",
    {
      UnitID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      UnitName: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      UnitImg: {
        type: DataTypes.BLOB("long"), // For 'image' in SQL Server
        allowNull: true,
      },
      UnitDescription: {
        type: DataTypes.STRING(800),
        allowNull: true,
      },
      SubModuleID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      AuthAdd: {
        type: DataTypes.STRING(800),
        allowNull: false,
      },
      AddDel: {
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
        allowNull: false,
      },
      editOnDt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delStatus: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      SortingOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "UnitsDetails",
      timestamps: false,
    }
  );

  return UnitsDetails;
};
