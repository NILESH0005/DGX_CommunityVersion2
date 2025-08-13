export default (sequelize, DataTypes) => {
  const UserLmsProgress = sequelize.define("UserLmsProgress", {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    FileID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    AuthAdd: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    AuthLstEdt: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    AddDel: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    AddOnDt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    editOnDt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delOnDt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delStatus: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: "UserLmsProgress",
    timestamps: false
  });

  return UserLmsProgress;
};
