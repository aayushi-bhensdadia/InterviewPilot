import express from "express";
import { createQuestion,submitAnswer } from "../controllers/questionController.js";
import { protect } from "../middleware/authmiddleware.js";
import { getQuestionsByInterview } from "../controllers/questionController.js";
import { getResults } from "../controllers/resultController.js";

const router = express.Router();

router.post("/", protect, createQuestion);
router.get("/interview/:interviewId",protect,getQuestionsByInterview);
router.put("/:id/answer",protect,submitAnswer);

export default router;
