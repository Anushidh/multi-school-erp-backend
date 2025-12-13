import express from "express";
import auth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
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

// School scoped
router.post(
  "/schools/:schoolId/users",
  auth,
  validate(createUserSchema),
  createUser
);

router.get("/schools/:schoolId/users", auth, listUsersBySchool);

// User scoped
router.get("/users/:id", auth, getUserById);
router.put("/users/:id", auth, validate(updateUserSchema), updateUser);

export default router;
