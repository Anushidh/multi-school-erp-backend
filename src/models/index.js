import sequelize from "../config/db.js";

import School from "./School.js";
import User from "./User.js";
import Student from "./Student.js";

// Associations
School.hasMany(User, { foreignKey: "schoolId" });
User.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(Student, { foreignKey: "schoolId" });
Student.belongsTo(School, { foreignKey: "schoolId" });

export { sequelize, School, User, Student };
