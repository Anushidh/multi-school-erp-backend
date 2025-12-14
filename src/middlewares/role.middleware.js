import { AppError } from "../utils/AppError.util.js";

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError("Not allowed", 403);
    }
    next();
  };
};
