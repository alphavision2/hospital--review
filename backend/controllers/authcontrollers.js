import bcrypt from "bcryptjs";
import User from "../models/User.models.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

const OTP_EXPIRY_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const createOtp = () =>
  crypto.randomInt(100000, 1000000).toString();

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const emailConfigured = () =>
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const sendOtpEmail = async (email, otp) => {
  if (!emailConfigured()) {
    throw new Error("Email configuration is missing");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your MediReview+ email",
    text: `Your MediReview+ verification code is ${otp}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
        <h2>Welcome to MediReview+</h2>
        <p>Use this code to verify your email address:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this code, ignore this email.</p>
      </div>
    `
  });
};


export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !fullName.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    
   if (existingUser) {
  if (!existingUser.isEmailVerified) {
    const otp = createOtp();

    existingUser.emailOtpHash = hashOtp(otp);
    existingUser.emailOtpExpiresAt =
      new Date(Date.now() + OTP_EXPIRY_MS);
    existingUser.emailOtpAttempts = 0;
    existingUser.emailOtpLastSentAt = new Date();

    await existingUser.save();
    await sendOtpEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      requiresEmailVerification: true,
      message: "A new verification code has been sent to your email.",
      email: normalizedEmail,
    });
  }

  return res.status(409).json({
    success: false,
    message: "This email is already registered. Please log in.",
  });
}

    const otp = createOtp();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the pending account and save the OTP hash first.
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isEmailVerified: false,
      emailOtpHash: hashOtp(otp),
      emailOtpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      emailOtpAttempts: 0,
      emailOtpLastSentAt: new Date(),
    });

    

    // Send the OTP immediately as part of the Create Account request.
    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error("OTP email sending failed:", emailError.message);

      // Remove the pending account if the initial email could not be sent.
      await User.deleteOne({ _id: user._id });

      return res.status(502).json({
        success: false,
        message:
          "Your verification email could not be sent. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      requiresEmailVerification: true,
      message: "Verification code sent to your email.",
      email: normalizedEmail,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not complete registration. Please try again.",
    });
  }
};



export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !email.trim() ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email and 6-digit OTP.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select(
      "+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code or email.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified. You can log in.",
      });
    }

    if (
      !user.emailOtpHash ||
      !user.emailOtpExpiresAt ||
      user.emailOtpExpiresAt.getTime() <= Date.now()
    ) {
      return res.status(400).json({
        success: false,
        code: "OTP_EXPIRED",
        message: "Verification code expired. Please request a new OTP.",
      });
    }

    if ((user.emailOtpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new code.",
      });
    }

    if (hashOtp(otp) !== user.emailOtpHash) {
      user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    // The OTP is correct: verify the account and invalidate the code.
    user.isEmailVerified = true;
    user.emailOtpHash = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during email verification.",
    });
  }
};


export const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts +emailOtpLastSentAt");

    if (!user || user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Unable to resend a code. Check the email or log in."
      });
    }

    if (
      user.emailOtpLastSentAt &&
      Date.now() - user.emailOtpLastSentAt.getTime() <
        RESEND_COOLDOWN_MS
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait 60 seconds before requesting another code."
      });
    }

   const otp = createOtp();

    user.emailOtpHash = hashOtp(otp);
    user.emailOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = new Date();

    await user.save();
    await sendOtpEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent."
    });
  } catch (error) {
    console.error("Resend OTP error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not resend the verification code."
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        requiresEmailVerification: true,
        message: "Please verify your email before logging in."
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from .env");

      return res.status(500).json({
        success: false,
        message: "Server configuration error."
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login."
    });
  }
};