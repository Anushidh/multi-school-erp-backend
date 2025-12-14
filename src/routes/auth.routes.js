import express from "express";
import { login, refreshToken, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/reset-password", resetPassword);

export default router;
