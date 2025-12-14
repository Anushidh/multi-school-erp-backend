import { AppError } from "../utils/AppError.util.js";

export const requireStudentWriteAccess = (req, res, next) => {
  console.log("requireStudentWriteAccess: ", req.user)
  const canWrite =
    req.user.role === "superadmin" ||
    req.user.role === "admin" ||
    req.user.canEditStudents === true;

  if (!canWrite) {
    throw new AppError("No edit permission", 403);
  }

  next();
};
