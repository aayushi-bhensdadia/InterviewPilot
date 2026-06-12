import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import api from "../services/api";
import NavBar from "../components/NavBar";
import QuestionCard from "../components/QuestionCard";

const PERF_STYLE = {
  "Placement ready": { color: "text-success", bg: "bg-success/10 border-success/30", emoji: "🏆" },
  "Almost ready":    { color: "text-warning", bg: "bg-warning/10 border-warning/30", emoji: "📈" },
  "Needs practice":  { color: "text-error",   bg: "bg-error/10 border-error/30",     emoji: "💪" },
};

const scoreColor = (s) => s >= 8 ? "#22c55e" : s >= 5 ? "#f59e0b" : "#ef4444";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-100 border border-base-300 rounded-lg px-3 py-2 shadow text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color || scoreColor(p.value) }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("report");

  const fetchResults = useCallback(async () => {
    try {
      const res = await api.get(`/results/${id}`);
      setResults(res.data);
    } catch {
      toast.error("Could not load results.");
    }
  }, [id]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  if (!results) return (
    <div className="min-h-screen bg-base-200 grid place-items-center">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );

  const answeredQs = results.questions?.filter((q) => q.answer?.trim()) || [];

  // Chart data – per-question scores
  const questionScoreData = answeredQs.map((q) => ({
    name: `Q${q.order}`,
    Score: q.score,
    topic: q.topic,
  }));

  // Radar data – topic avg scores
  const topicScores = {};
  const topicCounts = {};
  answeredQs.forEach((q) => {
    if (!q.topic) return;
    topicScores[q.topic] = (topicScores[q.topic] || 0) + q.score;
    topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
  });
  const radarData = Object.keys(topicScores).map((t) => ({
    topic: t.length > 12 ? t.slice(0, 12) + "…" : t,
    Score: Number((topicScores[t] / topicCounts[t]).toFixed(1)),
    fullMark: 10,
  }));

  const perfStyle = PERF_STYLE[results.performanceLevel] || { color: "text-base-content", bg: "bg-base-200 border-base-300", emoji: "📋" };

  return (
    <div className="min-h-screen bg-base-200">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Interview Report</h1>
            <p className="text-base-content/60 capitalize">
              {results.interview?.role} · {results.interview?.level}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button className="btn btn-outline btn-sm" onClick={() => navigate(`/interview/${id}`)}>Review</button>
          </div>
        </div>

        {/* Top stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
          <div className={`rounded-xl p-4 border ${perfStyle.bg}`}>
            <p className="text-xs text-base-content/50 mb-1">Performance</p>
            <p className={`text-lg font-bold ${perfStyle.color} leading-tight`}>
              {perfStyle.emoji} {results.performanceLevel || "N/A"}
            </p>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl py-3">
            <div className="stat-title text-xs">Avg Score</div>
            <div className="stat-value text-2xl" style={{ color: scoreColor(results.averageScore) }}>
              {results.averageScore}/10
            </div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl py-3">
            <div className="stat-title text-xs">Answered</div>
            <div className="stat-value text-2xl">{results.answeredQuestions}/{results.totalQuestions}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl py-3">
            <div className="stat-title text-xs">Stack</div>
            <div className="stat-value text-sm font-semibold leading-tight mt-1">
              {results.interview?.techStack?.slice(0, 2).join(", ")}
              {results.interview?.techStack?.length > 2 && ` +${results.interview.techStack.length - 2}`}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-100 shadow mb-6 w-fit">
          {["report", "charts", "questions"].map((t) => (
            <button
              key={t}
              className={`tab capitalize ${activeTab === t ? "tab-active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t === "report" ? "📄 Report" : t === "charts" ? "📊 Charts" : "❓ Questions"}
            </button>
          ))}
        </div>

        {/* ── REPORT TAB ─────────────────────────────────────────────────── */}
        {activeTab === "report" && (
          <div className="space-y-5">
            {/* AI Summary */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">🤖 AI Summary</h2>
                <p className="text-base-content/80 leading-relaxed">
                  {results.summary || "Complete the interview to generate a full AI report."}
                </p>
              </div>
            </div>

            {/* Strong / Weak topics */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="font-bold text-success">✅ Strong Areas</h2>
                  {results.strongTopics?.length ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {results.strongTopics.map((t) => (
                        <span key={t} className="badge badge-success badge-outline">{t}</span>
                      ))}
                    </div>
                  ) : <p className="text-sm text-base-content/50 mt-1">No strong areas detected yet.</p>}
                </div>
              </div>
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="font-bold text-error">⚠️ Needs Improvement</h2>
                  {results.weakTopics?.length ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {results.weakTopics.map((t) => (
                        <span key={t} className="badge badge-error badge-outline">{t}</span>
                      ))}
                    </div>
                  ) : <p className="text-sm text-base-content/50 mt-1">No weak areas detected.</p>}
                </div>
              </div>
            </div>

            {/* Roadmap */}
            {results.roadmap?.length > 0 && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title">🗺️ Personalized Improvement Roadmap</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-2">
                    {results.roadmap.map((item, i) => (
                      <div key={i} className="rounded-xl border border-base-300 bg-base-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-primary badge-sm">{i + 1}</span>
                          <h3 className="font-bold text-sm leading-tight">{item.title}</h3>
                        </div>
                        <p className="text-sm text-base-content/70 mb-3">{item.focus}</p>
                        <div className="flex flex-wrap gap-1">
                          {item.resources?.map((r) => (
                            <span key={r} className="badge badge-ghost badge-sm">{r}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CHARTS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "charts" && (
          <div className="space-y-5">
            {answeredQs.length === 0 ? (
              <div className="card bg-base-100 shadow text-center py-12">
                <p className="text-4xl mb-3">📊</p>
                <p className="font-semibold">No answered questions to chart.</p>
              </div>
            ) : (
              <>
                {/* Per-question score bar */}
                <div className="card bg-base-100 shadow">
                  <div className="card-body">
                    <h2 className="card-title text-base">📊 Score Per Question</h2>
                    <p className="text-xs text-base-content/50 mb-3">How you scored on each question (out of 10)</p>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={questionScoreData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const q = questionScoreData.find((d) => d.name === label);
                            return (
                              <div className="bg-base-100 border border-base-300 rounded-lg px-3 py-2 shadow text-sm">
                                <p className="font-semibold">{label} — {q?.topic}</p>
                                <p style={{ color: scoreColor(payload[0].value) }}>
                                  Score: <strong>{payload[0].value}/10</strong>
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="Score" radius={[6, 6, 0, 0]}>
                          {questionScoreData.map((entry) => (
                            <Cell key={entry.name} fill={scoreColor(entry.Score)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {/* Score legend */}
                    <div className="flex gap-4 mt-1 text-xs text-base-content/50">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>8–10 Strong</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>5–7 Average</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>0–4 Weak</span>
                    </div>
                  </div>
                </div>

                {/* Topic radar chart */}
                {radarData.length >= 3 && (
                  <div className="card bg-base-100 shadow">
                    <div className="card-body">
                      <h2 className="card-title text-base">🕸️ Topic Mastery Radar</h2>
                      <p className="text-xs text-base-content/50 mb-3">Average score per topic covered in this interview</p>
                      <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11 }} />
                          <Radar
                            name="Score"
                            dataKey="Score"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.25}
                          />
                          <Tooltip formatter={(v) => [`${v}/10`, "Score"]} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Score summary cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Highest Score", value: Math.max(...answeredQs.map((q) => q.score)), color: "text-success" },
                    { label: "Lowest Score",  value: Math.min(...answeredQs.map((q) => q.score)), color: "text-error" },
                    { label: "Average Score", value: results.averageScore, color: "text-primary" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="card bg-base-100 shadow text-center">
                      <div className="card-body py-5">
                        <p className="text-xs text-base-content/50 mb-1">{label}</p>
                        <p className={`text-4xl font-bold ${color}`}>{value}</p>
                        <p className="text-xs text-base-content/40">out of 10</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── QUESTIONS TAB ──────────────────────────────────────────────── */}
        {activeTab === "questions" && (
          <div className="space-y-2">
            {results.questions?.length ? (
              results.questions.map((q) => <QuestionCard key={q._id} question={q} />)
            ) : (
              <p className="text-center text-base-content/50 py-12">No questions found.</p>
            )}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button className="btn btn-primary" onClick={() => navigate("/createInterview")}>
            Start Another Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;
