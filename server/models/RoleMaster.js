// models/RoleMaster.js
export default (sequelize, DataTypes) => {
  const RoleMaster = sequelize.define(
    "RoleMaster",
    {
      RoleID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      RoleName: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      CanRoleEdit: {
        type: DataTypes.TINYINT, 
        allowNull: false,
        defaultValue: 0,
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
      tableName: "RoleMaster",
      timestamps: false,
    },
  );

  return RoleMaster;
};
