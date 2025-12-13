import express from "express";
import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
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

router.post(
  "/schools/:schoolId/students",
  auth,
  validate(createStudentSchema),
  createStudent
);

router.get("/schools/:schoolId/students", auth, getStudents);

router.get("/schools/:schoolId/students/:id", auth, getStudentById);

router.put(
  "/schools/:schoolId/students/:id",
  auth,
  validate(updateStudentSchema),
  updateStudent
);

router.delete("/schools/:schoolId/students/:id", auth, deleteStudent);

export default router;
