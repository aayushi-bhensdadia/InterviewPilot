import Question from "../models/questions.js";
import Interview from "../models/Interview.js";
import { evaluateAnswer } from "../services/evaluateAnswer.js";

export const createQuestion = async (req, res) => {
  try {
    const { interviewId, question } = req.body;

    const newQuestion = await Question.create({
      interview: interviewId,
      question,
    });

    res.status(201).json({
      success: true,
      question: newQuestion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getQuestionsByInterview = async (req, res) => {
  try {
    const questions = await Question.find({
      interview: req.params.interviewId,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;

    const question = await Question.findById(
      req.params.id
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    try {
      const interview = await Interview.findById(question.interview);
      const evaluation = await evaluateAnswer(question.question, answer, {
        role: interview?.role,
        level: interview?.level,
        topic: question.topic,
      });

      const parsed = JSON.parse(evaluation);

      question.score = parsed.score;
      question.feedback = parsed.feedback;
      question.strengths = parsed.strengths || [];
      question.gaps = parsed.gaps || [];
    } catch (error) {
      question.score = 5;
      question.feedback =
        "AI evaluation unavailable";
    }
    question.answer = answer;
    question.answeredAt = new Date();
    await question.save();

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
