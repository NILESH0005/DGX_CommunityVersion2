const userLoginLogModel = (sequelize, DataTypes) => {
  return sequelize.define(
    "UserLoginLog",
    {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      LogInDateTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      LogOutDateTime: {
        type: DataTypes.DATE,
        allowNull: true, // null if user hasn't logged out yet
      },

      IPAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },

      DeviceInfo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      AuthAdd: { type: DataTypes.STRING(100), allowNull: true },
      AuthDel: { type: DataTypes.STRING(100), allowNull: true },
      AuthLstEdt: { type: DataTypes.STRING(100), allowNull: true },
      delOnDt: { type: DataTypes.DATE, allowNull: true },
      AddOnDt: { type: DataTypes.DATE, allowNull: true },
      editOnDt: { type: DataTypes.DATE, allowNull: true },
      delStatus: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "Community_User_Login_Log",
      timestamps: false,
      indexes: [
        { fields: ["UserID"] },
        { fields: ["LogInDateTime"] },
        { fields: ["IPAddress"] },
        { fields: ["DeviceInfo"] },
      ],
    }
  );
};

export default userLoginLogModel;
