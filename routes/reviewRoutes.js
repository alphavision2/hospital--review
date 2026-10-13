import express from "express";

import { createReview,getHospitalReviews } from "../controllers/reviewcontroller.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/hospital/:hospitalId",getHospitalReviews);

router.post("/hospital/:hospitalId",protect,createReview);


export default router;