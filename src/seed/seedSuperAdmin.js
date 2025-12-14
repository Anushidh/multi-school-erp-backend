import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const seedSuperAdmin = async () => {
  const exists = await User.findOne({
    where: { role: "superadmin" },
  });

  if (exists) {
    console.log("Superadmin already exists");
    return;
  }

  const password = "Admin@123";
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name: "Super Admin",
    email: "superadmin@erp.com",
    phone: "9999999999",
    password_hash: hash,
    role: "superadmin",
    mustChangePassword: false,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });

  console.log("Superadmin created");
  console.log("Email: superadmin@erp.com");
  console.log("Password: Admin@123");
};
