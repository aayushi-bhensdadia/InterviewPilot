import express from "express";
import { createInterview,getMyInterviews,getInterviewById,deleteInterview,submitInterviewAnswer,completeInterview } from "../controllers/interviewController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", protect, createInterview);
router.get("/", protect, getMyInterviews);
router.get("/:id",protect,getInterviewById);
router.post("/:id/answer", protect, submitInterviewAnswer);
router.post("/:id/complete", protect, completeInterview);
router.delete("/:id",protect,deleteInterview);

export default router;
