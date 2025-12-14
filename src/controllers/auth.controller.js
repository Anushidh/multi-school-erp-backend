import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Op } from "sequelize";
import { User } from "../models/index.js";
import { catchAsync } from "../utils/catchAsync.util.js";
import { AppError } from "../utils/AppError.util.js";

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email, isDeleted: false },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }
  if (user.mustChangePassword) {
    throw new AppError(
      "Password reset required. Please reset your password.",
      403
    );
  }

  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      schoolId: user.schoolId || null,
      canEditStudents: user.canEditStudents,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.json({
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
    },
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.mustChangePassword = false;

  await user.save();

  res.json({ message: "Password reset successful" });
});

export const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new AppError("Refresh token missing", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new AppError("Invalid or expired refresh token", 403);
  }

  const user = await User.findByPk(decoded.userId);
  if (!user || user.isDeleted) {
    throw new AppError("Invalid refresh token", 401);
  }

  const newAccessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      schoolId: user.schoolId || null,
      canEditStudents: user.canEditStudents,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ accessToken: newAccessToken });
});
