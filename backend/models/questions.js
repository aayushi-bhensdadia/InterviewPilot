import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    topic: {
      type: String,
      default: "General",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    type: {
      type: String,
      enum: ["initial", "follow_up"],
      default: "initial",
    },

    order: {
      type: Number,
      default: 1,
    },

    answer: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
      default: 0,
    },

    feedback: {
      type: String,
      default: "",
    },

    strengths: [String],

    gaps: [String],

    answeredAt: Date,
  },
  { timestamps: true }
);

const Question = mongoose.model(
  "Question",
  questionSchema
);

export default Question;
