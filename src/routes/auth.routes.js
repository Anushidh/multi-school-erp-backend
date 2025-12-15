import express from "express";
import {
  login,
  refreshToken,
  resetPassword,
} from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validations/auth.validation.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/reset-password", resetPassword);

export default router;
