import express from "express";
import {
  register,
  login,
  verifyOtpController
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/verify-otp", verifyOtpController);

export default router;