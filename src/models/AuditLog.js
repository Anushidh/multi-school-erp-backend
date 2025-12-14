import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AuditLog = sequelize.define("AuditLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  actorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  entity: {
    type: DataTypes.STRING,
    allowNull: false, // "Student"
  },

  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  action: {
    type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE"),
    allowNull: false,
  },

  before: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  after: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

export default AuditLog;
