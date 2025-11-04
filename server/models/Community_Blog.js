// models/Community_Blog.js
export default (sequelize, DataTypes) => {
  return sequelize.define('Community_Blog', {
    BlogID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(500), allowNull: true },
    author: { type: DataTypes.STRING(500), allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true },
    publishedDate: { type: DataTypes.DATE, allowNull: true },
    AuthAdd: { type: DataTypes.STRING(800), allowNull: true },
    AuthDel: { type: DataTypes.STRING(800), allowNull: true },
    AuthLstEdt: { type: DataTypes.STRING(800), allowNull: true },
    delOnDt: { type: DataTypes.DATE, allowNull: true },
    AddOnDt: { type: DataTypes.DATE, allowNull: true },
    editOnDt: { type: DataTypes.DATE, allowNull: true },
    delStatus: { type: DataTypes.INTEGER, allowNull: true },
    image: { type: DataTypes.TEXT, allowNull: true },
    Category: { type: DataTypes.STRING(500), allowNull: true },
    Status: { type: DataTypes.STRING(100), allowNull: true },
    AdminRemark: { type: DataTypes.TEXT, allowNull: true },
    ApprovedBy: { type: DataTypes.STRING(255), allowNull: true },
    ApprovedOn: { type: DataTypes.DATE, allowNull: true },
    UserID: { type: DataTypes.INTEGER, allowNull: true }, 
    RepostID: { type: DataTypes.INTEGER, allowNull: true },
    RepostUserID: { type: DataTypes.INTEGER, allowNull: true },
    allowRepost: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    Likes: { type: DataTypes.INTEGER, allowNull: true }, 
    Reference: { type: DataTypes.INTEGER, allowNull: true },
    isDraft: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, // Add this line
  }, {
    tableName: 'Community_Blog',
    timestamps: false
  });
};