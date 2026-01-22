// models/RolePageAccess.js
export default (sequelize, DataTypes) => {
  const RolePageAccess = sequelize.define(
    "RolePageAccess",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      RoleID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      PageID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      Access: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0 
      },
      AuthAdd: {
        type: DataTypes.STRING(800),
        allowNull: false
      },
      AuthLstEdt: {
        type: DataTypes.STRING(800),
        allowNull: true,
        defaultValue: null
      },
      delOnDt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      AddOnDt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      editOnDt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      delStatus: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      AuthDel: {
        type: DataTypes.STRING(800),
        allowNull: true,
        defaultValue: null
      }
    },
    {
      tableName: "RolePageAccess",
      timestamps: false
    }
  );

  return RolePageAccess;
};