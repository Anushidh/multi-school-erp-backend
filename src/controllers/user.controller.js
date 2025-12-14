import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User, sequelize } from "../models/index.js";
import { generatePassword } from "../utils/password.util.js";
import { sendUserPassword } from "../services/email.service.js";
import { catchAsync } from "../utils/catchAsync.util.js";
import { AppError } from "../utils/AppError.util.js";

// export const createUser = catchAsync(async (req, res) => {
//   const { schoolId } = req.params;
//   const { name, email, phone, role, canEditStudents } = req.body;

//   if (req.user.role === "admin" && role === "admin") {
//     throw new AppError("Admin cannot create another admin", 403);
//   }

//   const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
//   const rawPassword = generatePassword(phone, name, date);
//   const password_hash = await bcrypt.hash(rawPassword, 10);

//   const user = await User.create({
//     name,
//     email,
//     phone,
//     role,
//     canEditStudents,
//     schoolId,
//     password_hash,
//   });

//   await sendUserPassword(email, rawPassword);

//   res.status(201).json({
//     id: user.id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     schoolId: user.schoolId,
//     canEditStudents: user.canEditStudents,
//   });
// });

export const createUser = catchAsync(async (req, res) => {
  const { schoolId } = req.params;
  const { name, email, phone, role, canEditStudents } = req.body;

  if (req.user.role === "admin" && role === "admin") {
    throw new AppError("Admin cannot create another admin", 403);
  }

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rawPassword = generatePassword(phone, name, date);
  const password_hash = await bcrypt.hash(rawPassword, 10);

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const transaction = await sequelize.transaction();

  try {
    const user = await User.create(
      {
        name,
        email,
        phone,
        role,
        canEditStudents,
        schoolId,
        password_hash,
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: Date.now() + 15 * 60 * 1000,
        mustChangePassword: true,
      },
      { transaction }
    );

    await sendUserPassword(email, rawPassword, resetLink);

    await transaction.commit();

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      canEditStudents: user.canEditStudents,
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

export const listUsersBySchool = catchAsync(async (req, res) => {
  const users = await User.findAll({
    where: {
      schoolId: req.params.schoolId,
      isDeleted: false,
    },
    attributes: { exclude: ["password_hash"] },
  });

  res.json(users);
});

export const getUserById = catchAsync(async (req, res) => {
  const user = req.targetUser;
  const { password_hash, ...safeUser } = user.toJSON();
  res.json(safeUser);
});

export const updateUser = catchAsync(async (req, res) => {
  const user = req.targetUser;
  const updates = {};

  const isOwnProfile = req.user.userId === user.id;
  const isAdminSameSchool =
    req.user.role === "admin" &&
    Number(req.user.schoolId) === Number(user.schoolId);
  const isSuperAdmin = req.user.role === "superadmin";

  if (isOwnProfile) {
    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;
  }

  if (isAdminSameSchool) {
    if (typeof req.body.canEditStudents === "boolean") {
      updates.canEditStudents = req.body.canEditStudents;
    }
  }

  if (isSuperAdmin) {
    Object.assign(updates, req.body);
    delete updates.password;
    delete updates.password_hash;
  }

  if (!isSuperAdmin) {
    delete updates.role;
    delete updates.schoolId;
  }

  await user.update(updates);

  res.json({ message: "User updated successfully" });
});
