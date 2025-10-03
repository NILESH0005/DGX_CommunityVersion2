// models/ContactUs.js
export default (sequelize, DataTypes) => {
  return sequelize.define('ContactUs', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: true },
    phone: { type: DataTypes.STRING(50), allowNull: true },
    working_hours: { type: DataTypes.STRING(255), allowNull: true },
    map_embed_code: { type: DataTypes.TEXT, allowNull: true },
    AuthAdd: { type: DataTypes.STRING(800), allowNull: true },
    AuthDel: { type: DataTypes.STRING(800), allowNull: true },
    AuthLstEdt: { type: DataTypes.STRING(800), allowNull: true },
    delOnDt: { type: DataTypes.DATE, allowNull: true },
    AddOnDt: { type: DataTypes.DATE, allowNull: true },
    editOnDt: { type: DataTypes.DATE, allowNull: true },
    delStatus: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'ContactUs',
    timestamps: false
  });
};
