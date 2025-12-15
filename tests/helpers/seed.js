import bcrypt from "bcryptjs";
import { User, School } from "../../src/models/index.js";

export const seedBasicData = async () => {
  const schoolA = await School.create({ name: "School A" });
  const schoolB = await School.create({ name: "School B" });

  const passwordHash = await bcrypt.hash("password123", 10);

  const superadmin = await User.create({
    name: "Super Admin",
    email: "super@admin.com",
    phone: "9999999999",
    password_hash: passwordHash,
    role: "superadmin",
    schoolId: null,
    mustChangePassword: false,
  });

  const adminA = await User.create({
    name: "Admin A",
    email: "admin@schoola.com",
    phone: "9999999999",
    password_hash: passwordHash,
    role: "admin",
    schoolId: schoolA.id,
    canEditStudents: true,
    mustChangePassword: false,
  });

  const userB = await User.create({
    name: "User B",
    email: "user@schoolb.com",
    phone: "9999999999",
    password_hash: passwordHash,
    role: "user",
    schoolId: schoolB.id,
    canEditStudents: false,
    mustChangePassword: false,
  });

  return { schoolA, schoolB, superadmin, adminA, userB };
};
