// models/CommunityEvents.js
export default (sequelize, DataTypes) => {
  const CommunityEvents = sequelize.define(
    "CommunityEvents",
    {
      EventID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      EventTitle: {
        type: DataTypes.TEXT, // nvarchar(MAX) equivalent
        allowNull: true,
      },
      StartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      EndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      EventType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Venue: {
        type: DataTypes.TEXT, // nvarchar(MAX) equivalent
        allowNull: true,
      },
      Host: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      RegistrationLink: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      EventImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      EventDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      AuthAdd: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      AuthDel: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      AuthLstEdit: {
        type: DataTypes.TEXT,
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
        type: DataTypes.BOOLEAN, // bit equivalent
        allowNull: true,
      },
      Category: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Status: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      AdminRemark: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ApprovedBy: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ApprovedOn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "Community_Events",
      timestamps: false,
    }
  );

  return CommunityEvents;
};
