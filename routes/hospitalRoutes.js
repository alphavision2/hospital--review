import express from "express";

import { getHospitals, createdHospital, getHospitalById } from "../controllers/hospitalcontroller.js";

import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",getHospitals);

router.post("/",protect,createdHospital);

router.get("/:id",getHospitalById);

export default router;