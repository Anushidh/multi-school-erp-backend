import express from "express";
import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { requireSameSchoolOrSuperAdmin } from "../middlewares/school.middleware.js";
import { requireStudentWriteAccess } from "../middlewares/student.middleware.js";

import {
  createStudentSchema,
  updateStudentSchema,
} from "../validations/student.validation.js";

import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";

const router = express.Router();

/* CREATE student */
router.post(
  "/schools/:schoolId/students",
  auth,
  requireSameSchoolOrSuperAdmin("schoolId"),
  requireStudentWriteAccess,
  validate(createStudentSchema),
  createStudent
);

/* READ students */
router.get(
  "/schools/:schoolId/students",
  auth,
  requireSameSchoolOrSuperAdmin("schoolId"),
  getStudents
);

router.get(
  "/schools/:schoolId/students/:id",
  auth,
  requireSameSchoolOrSuperAdmin("schoolId"),
  getStudentById
);

/* UPDATE student */
router.patch(
  "/schools/:schoolId/students/:id",
  auth,
  requireSameSchoolOrSuperAdmin("schoolId"),
  requireStudentWriteAccess,
  validate(updateStudentSchema),
  updateStudent
);

/* DELETE student */
router.delete(
  "/schools/:schoolId/students/:id",
  auth,
  requireSameSchoolOrSuperAdmin("schoolId"),
  requireStudentWriteAccess,
  deleteStudent
);

export default router;
