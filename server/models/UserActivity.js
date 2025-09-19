// models/UserActivity.js
export default (sequelize, DataTypes) => {
  return sequelize.define(
    "UserActivity",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      type: { type: DataTypes.STRING(100), allowNull: false },
      refId: { type: DataTypes.INTEGER, allowNull: true },
      repost: { type: DataTypes.INTEGER, defaultValue: 0 },
      view: { type: DataTypes.INTEGER, defaultValue: 0 },
      rating: { type: DataTypes.INTEGER, allowNull: true },
      likes: { type: DataTypes.INTEGER, defaultValue: 0 },
      authAdd: { type: DataTypes.STRING(100), allowNull: true },
      authLstEdit: { type: DataTypes.STRING(100), allowNull: true },
      authDel: { type: DataTypes.STRING(100), allowNull: true },
      addInDt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      editOnDt: { type: DataTypes.DATE, allowNull: true },
      delOnDt: { type: DataTypes.DATE, allowNull: true },
      delStatus: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      tableName: "user_activity",
      timestamps: false,
    }
  );
};
