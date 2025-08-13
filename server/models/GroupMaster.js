export default (sequelize, DataTypes) => {
  const GroupMaster = sequelize.define(
    "GroupMaster",
    {
      group_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      group_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      group_category: {
        type: DataTypes.STRING(255),
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
      SubModuleID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "GroupMaster",
      timestamps: false,
    }
  );

  return GroupMaster;
};
    