import express from "express";
import { getQuestionsByInterview } from "../controllers/questionController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/interview/:interviewId", protect, getQuestionsByInterview);

export default router;