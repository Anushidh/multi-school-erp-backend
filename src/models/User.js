import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.ENUM("superadmin", "admin", "user"),
    allowNull: false,
  },

  canEditStudents: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  schoolId: {
    type: DataTypes.INTEGER,
    allowNull: true, // NULL for superadmin
  },

  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default User;
