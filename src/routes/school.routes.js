import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { isSuperAdmin } from "../middlewares/role.middleware.js";
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
  isSuperAdmin,
  validate(createSchoolSchema),
  createSchool
);

router.get("/", auth, isSuperAdmin, getAllSchools);

router.get("/:id", auth, isSuperAdmin, getSchoolById);

export default router;
