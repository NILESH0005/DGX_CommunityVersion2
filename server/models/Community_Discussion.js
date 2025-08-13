export default (sequelize, DataTypes) => {
  const CommunityDiscussion = sequelize.define(
    "CommunityDiscussion",
    {
      DiscussionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: true, // "Checked" in SQL Server means nullable
      },
      Title: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      Content: {
        type: DataTypes.TEXT("long"), // nvarchar(MAX) → TEXT
        allowNull: true,
      },
      Image: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      Likes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      Comment: {
        type: DataTypes.STRING(2000),
        allowNull: true,
      },
      Tag: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      Visibility: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      Reference: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ResourceUrl: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      AuthAdd: {
        type: DataTypes.STRING(800),
        allowNull: true,
      },
      AuthDel: {
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
        allowNull: true,
      },
      editOnDt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delStatus: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DiscussionImagePath: {
        type: DataTypes.STRING(800),
        allowNull: true,
      },
    },
    {
      tableName: "Community_Discussions", // match exact DB table name
      timestamps: false, // since you already have date fields
    }
  );

  return CommunityDiscussion;
};
