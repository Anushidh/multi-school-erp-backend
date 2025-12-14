import { User } from "../models/index.js";
import { AppError } from "../utils/AppError.util.js";
import { catchAsync } from "../utils/catchAsync.util.js";

export const loadTargetUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  req.targetUser = user;
  next();
});

export const requireUserAccess = (req, res, next) => {
  const { user, targetUser } = req;

  // Own profile
  if (user.userId === targetUser.id) return next();

  // Admin – same school
  if (
    user.role === "admin" &&
    Number(user.schoolId) === Number(targetUser.schoolId)
  ) {
    return next();
  }

  // Superadmin
  if (user.role === "superadmin") return next();

  throw new AppError("Access denied", 403);
};
