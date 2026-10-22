import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmailOtp,
  resendEmailOtp
} from "../controllers/authcontrollers.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmailOtp);
router.post("/resend-otp", resendEmailOtp);

export default router;