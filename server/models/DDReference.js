export default (sequelize, DataTypes) => {
  const DDReference = sequelize.define("tblDDReference", {
    idCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ddValue: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ddCategory: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    AuthAdd: {
      type: DataTypes.STRING(800),
      allowNull: true
    },
    AuthDel: {
      type: DataTypes.STRING(800),
      allowNull: true
    },
    AuthLstEdit: {
      type: DataTypes.STRING(800),
      allowNull: true
    },
    delOnDt: {
      type: DataTypes.DATE,
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
    delStatus: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: "tblDDReference",
    timestamps: false
  });

  return DDReference;
};
