import Interview from "../models/Interview.js";
import Question from "../models/questions.js";
import {
  analyzeResume,
  buildReport,
  generateNextQuestion,
} from "../services/groqServices.js";
import { evaluateAnswer } from "../services/evaluateAnswer.js";

const normalizeStack = (techStack = []) => {
  if (Array.isArray(techStack)) return techStack.filter(Boolean);
  return String(techStack)
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const parseEvaluation = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return {
      score: 5,
      feedback: "AI evaluation was unavailable. Saved a neutral score.",
      strengths: [],
      gaps: ["Retry evaluation after checking Gemini configuration."],
    };
  }
};

const summarizePerformance = (averageScore) => {
  if (averageScore >= 8) return "Placement ready";
  if (averageScore >= 6) return "Almost ready";
  if (averageScore > 0) return "Needs practice";
  return "Not started";
};

const refreshInterviewAnalytics = async (interviewId) => {
  const interview = await Interview.findById(interviewId);
  const questions = await Question.find({ interview: interviewId }).sort({
    order: 1,
  });
  const answered = questions.filter((question) => question.answer?.trim());
  const totalScore = answered.reduce(
    (sum, question) => sum + question.score,
    0
  );
  const averageScore = answered.length ? totalScore / answered.length : 0;
  const strongTopics = [
    ...new Set(
      answered
        .filter((question) => question.score >= 8)
        .map((question) => question.topic)
    ),
  ];
  const weakTopics = [
    ...new Set(
      answered
        .filter((question) => question.score < 6)
        .map((question) => question.topic)
    ),
  ];

  interview.score = Number(averageScore.toFixed(1));
  interview.performanceLevel = summarizePerformance(averageScore);
  interview.analytics = {
    answeredQuestions: answered.length,
    averageScore: Number(averageScore.toFixed(1)),
    strongTopics,
    weakTopics,
  };

  await interview.save();
  return { interview, questions, answered, averageScore };
};

export const createInterview = async (req, res) => {
  try {
    const { role, level, techStack, resumeText, maxQuestions } = req.body;
    const stack = normalizeStack(techStack);
    const resume = await analyzeResume({ resumeText, role, techStack: stack });

    const interview = await Interview.create({
      user: req.user.id,
      role,
      level,
      techStack: stack,
      resumeText,
      extractedSkills: resume.extractedSkills,
      missingSkills: resume.missingSkills,
      summary: resume.resumeSummary,
      maxQuestions: Number(maxQuestions) || 6,
      status: "in_progress",
    });

    const firstQuestion = await generateNextQuestion({
      role,
      level,
      techStack: stack,
      extractedSkills: resume.extractedSkills,
      missingSkills: resume.missingSkills,
      previousQuestions: [],
      currentDifficulty: "medium",
      lastScore: 6,
    });

    const question = await Question.create({
      interview: interview._id,
      question: firstQuestion.question,
      topic: firstQuestion.topic,
      difficulty: firstQuestion.difficulty,
      type: "initial",
      order: 1,
    });

    res.status(201).json({
      success: true,
      interview,
      questions: [question],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user.id,
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const questions = await Question.find({
      interview: interview._id,
    }).sort({ order: 1 });

    res.status(200).json({
      interview,
      questions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    await Question.deleteMany({ interview: interview._id });
    await interview.deleteOne();

    res.status(200).json({
      success: true,
      message: "Interview deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitInterviewAnswer = async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const question = await Question.findOne({
      _id: questionId,
      interview: interview._id,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const evaluation = parseEvaluation(
      await evaluateAnswer(question.question, answer, {
        role: interview.role,
        level: interview.level,
        topic: question.topic,
      })
    );

    question.answer = answer;
    question.score = Math.max(0, Math.min(10, Number(evaluation.score) || 0));
    question.feedback = evaluation.feedback || "Answer saved.";
    question.strengths = evaluation.strengths || [];
    question.gaps = evaluation.gaps || [];
    question.answeredAt = new Date();
    await question.save();

    const existingQuestions = await Question.find({
      interview: interview._id,
    }).sort({ order: 1 });
    let nextQuestion = null;

    if (existingQuestions.length < interview.maxQuestions) {
      const adaptiveQuestion = await generateNextQuestion({
        role: interview.role,
        level: interview.level,
        techStack: interview.techStack,
        extractedSkills: interview.extractedSkills,
        missingSkills: interview.missingSkills,
        previousQuestions: existingQuestions.map((item) => item.question),
        lastQuestion: question.question,
        lastScore: question.score,
        lastFeedback: question.feedback,
        currentDifficulty: interview.currentDifficulty,
      });

      nextQuestion = await Question.create({
        interview: interview._id,
        question: adaptiveQuestion.question,
        topic: adaptiveQuestion.topic,
        difficulty: adaptiveQuestion.difficulty,
        type: "follow_up",
        order: existingQuestions.length + 1,
      });

      interview.currentDifficulty = adaptiveQuestion.difficulty;
      interview.status = "in_progress";
      await interview.save();
    } else {
      interview.status = "completed";
      await interview.save();
    }

    const analytics = await refreshInterviewAnalytics(interview._id);

    res.status(200).json({
      success: true,
      question,
      nextQuestion,
      interview: analytics.interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const questions = await Question.find({
      interview: interview._id,
    }).sort({ order: 1 });
    const report = await buildReport({ interview, questions });

    interview.status = "completed";
    interview.performanceLevel = report.performanceLevel;
    interview.summary = report.summary;
    interview.roadmap = report.roadmap || [];
    interview.analytics = {
      ...interview.analytics,
      strongTopics: report.strongTopics || interview.analytics.strongTopics,
      weakTopics: report.weakTopics || interview.analytics.weakTopics,
    };
    await interview.save();
    await refreshInterviewAnalytics(interview._id);

    res.status(200).json({
      success: true,
      interview,
      questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
