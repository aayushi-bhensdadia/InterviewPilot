import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import NavBar from "../components/NavBar";
import QuestionCard from "../components/QuestionCard";

function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeAnswer, setActiveAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchInterview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/interviews/${id}`);
      setInterview(res.data.interview);
      setQuestions(res.data.questions);
      setActiveAnswer("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load interview.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchInterview(); }, [fetchInterview]);

  const activeQuestion = questions.find((q) => !q.answer?.trim());
  const answeredQuestions = questions.filter((q) => q.answer?.trim());
  const answeredCount = answeredQuestions.length;
  const progress = interview?.maxQuestions
    ? Math.round((answeredCount / interview.maxQuestions) * 100)
    : 0;

  const submitAnswer = async () => {
    if (!activeQuestion || !activeAnswer.trim()) {
      toast.error("Write an answer before submitting.");
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/interviews/${id}/answer`, {
        questionId: activeQuestion._id,
        answer: activeAnswer,
      });
      toast.success("Answer submitted!");
      await fetchInterview();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const finishInterview = async () => {
    try {
      setSubmitting(true);
      await api.post(`/interviews/${id}/complete`);
      toast.success("Interview complete! Generating your report...");
      navigate(`/results/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to complete interview.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-base-200 grid place-items-center">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );

  const difficultyColor = { easy: "text-success", medium: "text-warning", hard: "text-error" };

  return (
    <div className="min-h-screen bg-base-200">
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold capitalize">{interview?.role}</h1>
          <p className="text-base-content/60">
            {interview?.level} · {interview?.techStack?.join(", ")}
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-4">
          <div className="stat bg-base-100 shadow rounded-xl py-3">
            <div className="stat-title text-xs">Progress</div>
            <div className="stat-value text-primary text-2xl">{progress}%</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl py-3">
            <div className="stat-title text-xs">Answered</div>
            <div className="stat-value text-2xl">{answeredCount}/{interview?.maxQuestions}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl py-3">
            <div className="stat-title text-xs">Avg Score</div>
            <div className="stat-value text-2xl">{interview?.analytics?.averageScore || 0}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl py-3">
            <div className="stat-title text-xs">Difficulty</div>
            <div className={`stat-value text-2xl capitalize ${difficultyColor[interview?.currentDifficulty] || ""}`}>
              {interview?.currentDifficulty || "medium"}
            </div>
          </div>
        </div>

        <progress className="progress progress-primary w-full mb-6" value={progress} max="100" />

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Main question panel */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              {activeQuestion ? (
                <>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="badge badge-primary">Question {activeQuestion.order}</span>
                    <span className="badge badge-outline capitalize">{activeQuestion.difficulty}</span>
                    <span className="badge badge-outline">{activeQuestion.topic}</span>
                    {activeQuestion.type === "follow_up" && (
                      <span className="badge badge-warning badge-outline">Follow-up</span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold leading-snug">{activeQuestion.question}</h2>
                  <textarea
                    className="textarea textarea-bordered mt-4 min-h-52 text-sm"
                    placeholder="Answer like you would in a live interview. Include examples and trade-offs when useful."
                    value={activeAnswer}
                    onChange={(e) => setActiveAnswer(e.target.value)}
                    disabled={submitting}
                  />
                  <div className="flex flex-wrap justify-between items-center mt-4 gap-3">
                    <p className="text-xs text-base-content/40">{activeAnswer.length} chars</p>
                    <div className="flex gap-3">
                      {answeredCount > 0 && (
                        <button className="btn btn-success btn-sm" disabled={submitting} onClick={finishInterview}>
                          {submitting ? <span className="loading loading-spinner loading-xs" /> : "Finish Early"}
                        </button>
                      )}
                      <button className="btn btn-primary" disabled={submitting} onClick={submitAnswer}>
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <span className="loading loading-spinner loading-sm" /> Evaluating...
                          </span>
                        ) : "Submit & Adapt →"}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-5xl mb-4">🎉</p>
                  <h2 className="text-2xl font-bold">All questions answered!</h2>
                  <p className="mt-2 text-base-content/60">
                    Generate your final AI report and personalized roadmap.
                  </p>
                  <button className="btn btn-success mt-6" disabled={submitting} onClick={finishInterview}>
                    {submitting ? <span className="loading loading-spinner loading-sm" /> : "Generate Final Report"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Candidate state panel */}
          <div className="card bg-base-100 shadow">
            <div className="card-body gap-4">
              <h2 className="card-title text-base">Candidate Profile</h2>
              <p className="text-sm text-base-content/60">{interview?.summary || "Resume analyzed."}</p>
              <div className="divider my-0" />
              <div>
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">Extracted Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {interview?.extractedSkills?.length ? interview.extractedSkills.map((s) => (
                    <span key={s} className="badge badge-success badge-outline badge-sm">{s}</span>
                  )) : <span className="text-xs text-base-content/40">None detected</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">Skill Gaps</p>
                <div className="flex flex-wrap gap-1.5">
                  {interview?.missingSkills?.length ? interview.missingSkills.map((s) => (
                    <span key={s} className="badge badge-warning badge-outline badge-sm">{s}</span>
                  )) : <span className="text-xs text-base-content/40">No major gaps detected</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answered questions */}
        {answeredQuestions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Answered Questions</h2>
            <div className="space-y-2">
              {answeredQuestions.map((q) => <QuestionCard key={q._id} question={q} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewRoom;
