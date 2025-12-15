// tests/helpers/token.js
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      schoolId: user.schoolId,
      canEditStudents: user.canEditStudents,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};
