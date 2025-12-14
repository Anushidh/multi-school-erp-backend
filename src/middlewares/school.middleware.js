import { AppError } from "../utils/AppError.util.js";

export const requireSameSchoolOrSuperAdmin = (paramKey = "schoolId") => {
  return (req, res, next) => {
    
    if (req.user.role === "superadmin") return next();

    const routeSchoolId = Number(req.params[paramKey]);
    const userSchoolId = Number(req.user.schoolId);

    if (routeSchoolId !== userSchoolId) {
      throw new AppError("Cross-school access denied", 403);
    }

    next();
  };
};
