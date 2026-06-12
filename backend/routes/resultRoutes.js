import express from "express";
import { getResults } from "../controllers/resultController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/:interviewId", protect, getResults);                    

export default router;  
