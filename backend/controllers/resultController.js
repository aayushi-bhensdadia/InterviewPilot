import Question from "../models/questions.js";
import Interview from "../models/Interview.js";

export const getResults = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.interviewId,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const questions = await Question.find({
      interview: req.params.interviewId,
    }).sort({ order: 1 });

    const totalQuestions = questions.length;

    const totalScore = questions.reduce(
      (sum, q) => sum + q.score,
      0
    );

    const answeredQuestions = questions.filter(
      (q) => q.answer && q.answer.trim() !== ""
    ).length;

    const averageScore =
      answeredQuestions > 0
        ? totalScore / answeredQuestions
        : 0;

    const strongTopics = [
      ...new Set(
        questions
          .filter((q) => q.answer?.trim() && q.score >= 8)
          .map((q) => q.topic)
      ),
    ];
    const weakTopics = [
      ...new Set(
        questions
          .filter((q) => q.answer?.trim() && q.score < 6)
          .map((q) => q.topic)
      ),
    ];

    res.status(200).json({
      success: true,
      interview,
      totalQuestions,
      answeredQuestions,
      totalScore,
      averageScore: Number(averageScore.toFixed(1)),
      performanceLevel: interview.performanceLevel,
      summary: interview.summary,
      roadmap: interview.roadmap,
      strongTopics: interview.analytics?.strongTopics?.length
        ? interview.analytics.strongTopics
        : strongTopics,
      weakTopics: interview.analytics?.weakTopics?.length
        ? interview.analytics.weakTopics
        : weakTopics,
      questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
