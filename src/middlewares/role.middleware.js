export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Superadmin only" });
  }
  next();
};

export const isSchoolAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

export const canEditStudents = (req, res, next) => {
  if (
    req.user.role === "admin" ||
    (req.user.role === "user" && req.user.canEditStudents)
  ) {
    return next();
  }
  return res.status(403).json({ message: "Permission denied" });
};
