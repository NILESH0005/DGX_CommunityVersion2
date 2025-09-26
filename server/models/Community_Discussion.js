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
        allowNull: true,
      },
      Title: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      Content: {
        type: DataTypes.TEXT("long"),
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
        field: "Tag",
      },
      Visibility: {
        type: DataTypes.INTEGER(50),
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
      AuthLstEdt: {
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

      // ===== Add repost fields =====
      RepostID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      RepostUserID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      allowRepost: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "Community_Discussions",
      timestamps: false,
    }
  );

  CommunityDiscussion.associate = (models) => {
    CommunityDiscussion.belongsTo(models.TableDDReference, {
      foreignKey: "Visibility",
      targetKey: "idCode",
      as: "visibilityRef",
    });

    // ✅ link repost user
    CommunityDiscussion.belongsTo(models.User, {
      foreignKey: "RepostUserID",
      as: "RepostUser",
    });
  };
  return CommunityDiscussion;
};
