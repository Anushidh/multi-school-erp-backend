import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createSchoolSchema } from "../validations/school.validation.js";

import {
  createSchool,
  getAllSchools,
  getSchoolById,
} from "../controllers/school.controller.js";

const router = express.Router();

router.post(
  "/",
  auth,
  requireRole("superadmin"),
  validate(createSchoolSchema),
  createSchool
);

router.get("/", auth, requireRole("superadmin"), getAllSchools);

router.get("/:id", auth, requireRole("superadmin"), getSchoolById);

export default router;
