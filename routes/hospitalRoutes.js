import express from "express";

import {
  getHospitals,
  createdHospital,
  getHospitalById,
} from "../controllers/hospitalcontroller.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admins can create hospitals
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

// Public routes: anyone can view hospitals
router.get("/", getHospitals);
router.get("/:id", getHospitalById);

// Protected route: only logged-in admins can create hospitals
router.post("/", protect, adminOnly, createdHospital);

export default router;
