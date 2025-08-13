export default (sequelize, DataTypes) => {
  return sequelize.define('User', {
    UserID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    Name: { type: DataTypes.STRING(500), allowNull: true },
    EmailId: { type: DataTypes.STRING(500), allowNull: false },
    CollegeName: { type: DataTypes.STRING(500), allowNull: true },
    MobileNumber: { type: DataTypes.STRING(15), allowNull: true },
    Category: { type: DataTypes.STRING(50), allowNull: true },
    Designation: { type: DataTypes.STRING(50), allowNull: true },
    ReferalNumberCount: { type: DataTypes.INTEGER, allowNull: true },
    ReferalNumber: { type: DataTypes.STRING(50), allowNull: true },
    ReferedBy: { type: DataTypes.INTEGER, allowNull: true },
    Password: { type: DataTypes.STRING(100), allowNull: true },
    FlagPasswordChange: { type: DataTypes.INTEGER, allowNull: true },
    AuthAdd: { type: DataTypes.STRING(800), allowNull: true },
    AuthDel: { type: DataTypes.STRING(800), allowNull: true },
    AuthLstEdit: { type: DataTypes.STRING(800), allowNull: true },
    delOnDt: { type: DataTypes.DATE, allowNull: true },
    AddOnDt: { type: DataTypes.DATE, allowNull: true },
    editOnDt: { type: DataTypes.DATE, allowNull: true },
    delStatus: { type: DataTypes.INTEGER, allowNull: true },
    isAdmin: { type: DataTypes.INTEGER, allowNull: true },
    ProfilePicture: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'Community_User',
    timestamps: false
  });
};
