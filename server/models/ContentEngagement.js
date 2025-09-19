// models/ContentEngagement.js
export default (sequelize, DataTypes) => {
  return sequelize.define(
    "ContentEngagement",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      type: { type: DataTypes.STRING(100), allowNull: false },
      contentId: { type: DataTypes.INTEGER, allowNull: false },
      likes: { type: DataTypes.INTEGER, defaultValue: 0 },
      comments: { type: DataTypes.INTEGER, defaultValue: 0 },
      views: { type: DataTypes.INTEGER, defaultValue: 0 },
      reposts: { type: DataTypes.INTEGER, defaultValue: 0 },
      rating: { type: DataTypes.INTEGER, allowNull: true },
       authAdd: { type: DataTypes.STRING(100), allowNull: true },
      authLstEdit: { type: DataTypes.STRING(100), allowNull: true },
      authDel: { type: DataTypes.STRING(100), allowNull: true },
      addInDt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      editOnDt: { type: DataTypes.DATE, allowNull: true },
      delOnDt: { type: DataTypes.DATE, allowNull: true },
      delStatus: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      tableName: "contentEngagement",
      timestamps: false,
    }
  );
};
