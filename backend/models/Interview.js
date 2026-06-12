import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      required: true,
    },

    techStack: [
      {
        type: String,
      },
    ],

    resumeText: {
      type: String,
      default: "",
    },

    extractedSkills: [
      {
        type: String,
      },
    ],

    missingSkills: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["created", "in_progress", "completed"],
      default: "created",
    },

    currentDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    maxQuestions: {
      type: Number,
      default: 6,
    },

    score: {
      type: Number,
      default: 0,
    },

    performanceLevel: {
      type: String,
      default: "Not started",
    },

    summary: {
      type: String,
      default: "",
    },

    roadmap: [
      {
        title: String,
        focus: String,
        resources: [String],
      },
    ],

    analytics: {
      answeredQuestions: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      strongTopics: [String],
      weakTopics: [String],
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model(
  "Interview",
  interviewSchema
);

export default Interview;
