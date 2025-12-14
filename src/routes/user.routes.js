import express from "express";
import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { requireSameSchoolOrSuperAdmin } from "../middlewares/school.middleware.js";
import {
  loadTargetUser,
  requireUserAccess,
} from "../middlewares/userAccess.middleware.js";

import {
  createUserSchema,
  updateUserSchema,
} from "../validations/user.validation.js";

import {
  createUser,
  listUsersBySchool,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

/* School scoped */
router.post(
  "/schools/:schoolId/users",
  auth,
  requireRole("superadmin", "admin"),
  requireSameSchoolOrSuperAdmin("schoolId"),
  validate(createUserSchema),
  createUser
);

router.get(
  "/schools/:schoolId/users",
  auth,
  requireRole("superadmin", "admin"),
  requireSameSchoolOrSuperAdmin("schoolId"),
  listUsersBySchool
);

/* User scoped */
router.get("/users/:id", auth, loadTargetUser, requireUserAccess, getUserById);

router.patch(
  "/users/:id",
  auth,
  loadTargetUser,
  requireUserAccess,
  validate(updateUserSchema),
  updateUser
);

export default router;
