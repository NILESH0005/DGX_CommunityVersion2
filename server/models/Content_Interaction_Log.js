export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Content_Interaction_Log",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ProcessName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      reference: {
        type: DataTypes.INTEGER, 
        allowNull: false,
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Likes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      View: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Comments:{
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Repost: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Dislike:{
        type: DataTypes.INTEGER,
        allowNull: true
      },
      AuthAdd: { type: DataTypes.STRING(800), allowNull: true },
      AuthDel: { type: DataTypes.STRING(800), allowNull: true },
      AuthLstEdt: { type: DataTypes.STRING(800), allowNull: true },
      delOnDt: { type: DataTypes.DATE, allowNull: true },
      AddOnDt: { type: DataTypes.DATE, allowNull: true },
      editOnDt: { type: DataTypes.DATE, allowNull: true },
      delStatus: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "Content_Interaction_Log",
      timestamps: false,
    }
  );
};
