import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { generatePassword } from "../utils/password.util.js";
import { sendUserPassword } from "../services/email.service.js";

export const createUser = async (req, res) => {
  const { schoolId } = req.params;
  const { name, email, phone, role, canEditStudents } = req.body;

  // Only superadmin or admin
  if (!["superadmin", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Not allowed" });
  }

  // Admin cannot create admin
  if (req.user.role === "admin" && role === "admin") {
    return res
      .status(403)
      .json({ message: "Admin cannot create another admin" });
  }

  // Admin must stay in same school
  if (
    req.user.role === "admin" &&
    Number(req.user.schoolId) !== Number(schoolId)
  ) {
    return res.status(403).json({ message: "Cross-school access denied" });
  }

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rawPassword = generatePassword(phone, name, date);
  const password_hash = await bcrypt.hash(rawPassword, 10);

  const user = await User.create({
    name,
    email,
    phone,
    role,
    canEditStudents,
    schoolId,
    password_hash,
  });

  await sendUserPassword(email, rawPassword);

  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
    canEditStudents: user.canEditStudents,
  });
};

export const listUsersBySchool = async (req, res) => {
  const { schoolId } = req.params;

  if (
    req.user.role !== "superadmin" &&
    Number(req.user.schoolId) !== Number(schoolId)
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  const users = await User.findAll({
    where: { schoolId, isDeleted: false },
    attributes: { exclude: ["password_hash"] },
  });

  res.json(users);
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ["password_hash"] },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Own profile
  if (req.user.userId === user.id) {
    return res.json(user);
  }

  // Admin: same school
  if (
    req.user.role === "admin" &&
    Number(req.user.schoolId) === Number(user.schoolId)
  ) {
    return res.json(user);
  }

  // Superadmin: all access
  if (req.user.role === "superadmin") {
    return res.json(user);
  }

  return res.status(403).json({ message: "Access denied" });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 🔐 Check access
  const isOwnProfile = req.user.userId === user.id;
  const isAdminSameSchool =
    req.user.role === "admin" &&
    Number(req.user.schoolId) === Number(user.schoolId);
  const isSuperAdmin = req.user.role === "superadmin";

  if (!isOwnProfile && !isAdminSameSchool && !isSuperAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }

  // 🧹 Sanitize updates (CRITICAL)
  const updates = {};

  // 👤 User: can update only own basic info
  if (isOwnProfile) {
    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;
  }

  // 🏫 Admin: can toggle canEditStudents for users in same school
  if (isAdminSameSchool) {
    if (typeof req.body.canEditStudents === "boolean") {
      updates.canEditStudents = req.body.canEditStudents;
    }
  }

  // 🌍 Superadmin: can update everything EXCEPT password
  if (isSuperAdmin) {
    const { password, password_hash } = req.body;

    Object.assign(updates, {
      ...req.body,
    });

    // Explicitly block password updates here
    delete updates.password;
    delete updates.password_hash;
  }

  // 🚫 Prevent role escalation by admin/user
  if (!isSuperAdmin) {
    delete updates.role;
    delete updates.schoolId;
  }

  await user.update(updates);

  return res.json({
    message: "User updated successfully",
  });
};
