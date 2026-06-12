import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import api from "../services/api";
import NavBar from "../components/NavBar";
import InterviewCard from "../components/InterviewCard";

// ── helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (s) => s >= 8 ? "#22c55e" : s >= 6 ? "#f59e0b" : "#ef4444";

const PERF_COLORS = {
  "Placement ready": "#22c55e",
  "Almost ready":    "#f59e0b",
  "Needs practice":  "#ef4444",
  "Not started":     "#6b7280",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-100 border border-base-300 rounded-lg px-3 py-2 shadow text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
function Dashboard() {
  const [interviews, setInterviews]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("overview"); // overview | interviews
  const navigate = useNavigate();

  const fetchInterviews = useCallback(async () => {
    try {
      const res = await api.get("/interviews");
      setInterviews(res.data.interviews);
    } catch {
      toast.error("Could not load interviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInterview = async (id) => {
    if (!window.confirm("Delete this interview?")) return;
    try {
      await api.delete(`/interviews/${id}`);
      setInterviews((prev) => prev.filter((i) => i._id !== id));
      toast.success("Interview deleted.");
    } catch {
      toast.error("Could not delete.");
    }
  };

  useEffect(() => { fetchInterviews(); }, [fetchInterviews]);

  // ── derived data ──────────────────────────────────────────────────────────
  const completed    = interviews.filter((i) => i.status === "completed");
  const inProgress   = interviews.filter((i) => i.status === "in_progress");
  const placementReady = interviews.filter((i) => i.performanceLevel === "Placement ready");

  const avgScore = completed.length
    ? (completed.reduce((s, i) => s + (i.score || 0), 0) / completed.length).toFixed(1)
    : "—";

  const best = completed.length
    ? completed.reduce((b, i) => (i.score > b.score ? i : b), completed[0])
    : null;

  // Chart 1 – score trend over time (all completed, chronological)
  const scoreTrend = [...completed]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((i, idx) => ({
      name: `#${idx + 1} ${i.role.split(" ")[0]}`,
      Score: Number(i.score) || 0,
      fill: scoreColor(i.score),
    }));

  // Chart 2 – topic performance (aggregate strong / weak counts)
  const topicMap = {};
  completed.forEach((i) => {
    (i.analytics?.strongTopics || []).forEach((t) => {
      topicMap[t] = topicMap[t] || { topic: t, Strong: 0, Weak: 0 };
      topicMap[t].Strong += 1;
    });
    (i.analytics?.weakTopics || []).forEach((t) => {
      topicMap[t] = topicMap[t] || { topic: t, Strong: 0, Weak: 0 };
      topicMap[t].Weak += 1;
    });
  });
  const topicData = Object.values(topicMap).slice(0, 8);

  // Chart 3 – performance level distribution (pie)
  const perfMap = {};
  interviews.forEach((i) => {
    const lvl = i.performanceLevel || "Not started";
    perfMap[lvl] = (perfMap[lvl] || 0) + 1;
  });
  const perfPieData = Object.entries(perfMap).map(([name, value]) => ({ name, value }));

  // Chart 4 – interviews per role (bar)
  const roleMap = {};
  interviews.forEach((i) => {
    const role = i.role || "Unknown";
    roleMap[role] = roleMap[role] || { role, Count: 0, AvgScore: 0, _scores: [] };
    roleMap[role].Count += 1;
    if (i.score) roleMap[role]._scores.push(i.score);
  });
  const roleData = Object.values(roleMap).map((r) => ({
    role: r.role.length > 14 ? r.role.slice(0, 14) + "…" : r.role,
    Count: r.Count,
    AvgScore: r._scores.length
      ? Number((r._scores.reduce((a, b) => a + b, 0) / r._scores.length).toFixed(1))
      : 0,
  }));

  const hasChartData = completed.length > 0;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-base-200">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-base-content/60 mt-1">
            Track your mock interviews, scores, and placement readiness.
          </p>
        </div>

        {/* Top stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
          <div className="stat bg-base-100 shadow rounded-xl">
            <div className="stat-figure text-primary text-3xl">📋</div>
            <div className="stat-title">Total Mocks</div>
            <div className="stat-value">{interviews.length}</div>
            {inProgress.length > 0 && <div className="stat-desc">{inProgress.length} in progress</div>}
          </div>
          <div className="stat bg-base-100 shadow rounded-xl">
            <div className="stat-figure text-success text-3xl">✅</div>
            <div className="stat-title">Completed</div>
            <div className="stat-value text-success">{completed.length}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl">
            <div className="stat-figure text-primary text-3xl">⭐</div>
            <div className="stat-title">Avg Score</div>
            <div className="stat-value text-primary">{avgScore}</div>
            <div className="stat-desc">across completed</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl">
            <div className="stat-figure text-warning text-3xl">🏆</div>
            <div className="stat-title">Placement Ready</div>
            <div className="stat-value">{placementReady.length}</div>
            <div className="stat-desc">of {completed.length} completed</div>
          </div>
        </div>

        {/* Best performance banner */}
        {best && (
          <div className="alert bg-primary/10 border border-primary/20 mb-6">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold">Best performance: {best.role}</p>
              <p className="text-sm text-base-content/60">
                Score {best.score}/10 · {best.level} · {best.performanceLevel}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-100 shadow mb-6 w-fit">
          <button
            className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Analytics
          </button>
          <button
            className={`tab ${activeTab === "interviews" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("interviews")}
          >
            🎙️ Interviews {interviews.length > 0 && `(${interviews.length})`}
          </button>
        </div>

        {/* ── ANALYTICS TAB ───────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <>
            {!hasChartData ? (
              <div className="card bg-base-100 shadow text-center py-16">
                <p className="text-5xl mb-4">📊</p>
                <h2 className="text-2xl font-bold">No analytics yet</h2>
                <p className="text-base-content/60 mt-2 mb-6">
                  Complete at least one interview to see charts and insights.
                </p>
                <div className="flex justify-center">
                  <button className="btn btn-primary" onClick={() => navigate("/createInterview")}>
                    Start Your First Interview
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Row 1: Score Trend + Performance Distribution */}
                <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">

                  {/* Score trend line chart */}
                  <div className="card bg-base-100 shadow">
                    <div className="card-body">
                      <h2 className="card-title text-base">📈 Score Trend Over Time</h2>
                      <p className="text-xs text-base-content/50 mb-2">Average score per completed interview (chronological)</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={scoreTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="Score"
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            dot={(props) => {
                              const { cx, cy, payload } = props;
                              return <circle key={payload.name} cx={cx} cy={cy} r={5} fill={scoreColor(payload.Score)} stroke="#fff" strokeWidth={2} />;
                            }}
                            activeDot={{ r: 7 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="flex gap-4 mt-1 text-xs text-base-content/50">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>≥8 Strong</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>6–7 Good</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>&lt;6 Needs work</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance level pie */}
                  <div className="card bg-base-100 shadow">
                    <div className="card-body">
                      <h2 className="card-title text-base">🥧 Performance Distribution</h2>
                      <p className="text-xs text-base-content/50 mb-2">All interviews by readiness level</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={perfPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {perfPieData.map((entry) => (
                              <Cell key={entry.name} fill={PERF_COLORS[entry.name] || "#6b7280"} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v, n) => [v, n]} />
                          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Row 2: Topic Performance + Role breakdown */}
                <div className="grid gap-6 lg:grid-cols-2">

                  {/* Topic strong vs weak bar */}
                  {topicData.length > 0 && (
                    <div className="card bg-base-100 shadow">
                      <div className="card-body">
                        <h2 className="card-title text-base">🧠 Topic Performance</h2>
                        <p className="text-xs text-base-content/50 mb-2">How many times each topic was strong vs weak</p>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={topicData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <YAxis type="category" dataKey="topic" tick={{ fontSize: 11 }} width={80} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="Strong" fill="#22c55e" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="Weak"   fill="#ef4444" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Role breakdown */}
                  {roleData.length > 0 && (
                    <div className="card bg-base-100 shadow">
                      <div className="card-body">
                        <h2 className="card-title text-base">💼 Interviews by Role</h2>
                        <p className="text-xs text-base-content/50 mb-2">Interview count and average score per role</p>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={roleData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="role" tick={{ fontSize: 10 }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                            <Bar yAxisId="left"  dataKey="Count"    fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="AvgScore" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 3: Quick insights */}
                <div className="card bg-base-100 shadow">
                  <div className="card-body">
                    <h2 className="card-title text-base">💡 Quick Insights</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-2">
                      {/* Improvement delta */}
                      {scoreTrend.length >= 2 && (() => {
                        const delta = (scoreTrend[scoreTrend.length - 1].Score - scoreTrend[0].Score).toFixed(1);
                        const positive = delta >= 0;
                        return (
                          <div className={`rounded-xl p-4 border ${positive ? "border-success/30 bg-success/10" : "border-error/30 bg-error/10"}`}>
                            <p className="text-xs text-base-content/50 mb-1">Score change</p>
                            <p className={`text-2xl font-bold ${positive ? "text-success" : "text-error"}`}>
                              {positive ? "+" : ""}{delta}
                            </p>
                            <p className="text-xs text-base-content/50">first → latest</p>
                          </div>
                        );
                      })()}

                      {/* Best score */}
                      {best && (
                        <div className="rounded-xl p-4 border border-primary/30 bg-primary/10">
                          <p className="text-xs text-base-content/50 mb-1">Best score</p>
                          <p className="text-2xl font-bold text-primary">{best.score}/10</p>
                          <p className="text-xs text-base-content/50 truncate">{best.role}</p>
                        </div>
                      )}

                      {/* Top strong topic */}
                      {topicData.length > 0 && (() => {
                        const top = [...topicData].sort((a, b) => b.Strong - a.Strong)[0];
                        return (
                          <div className="rounded-xl p-4 border border-success/30 bg-success/10">
                            <p className="text-xs text-base-content/50 mb-1">Strongest topic</p>
                            <p className="text-lg font-bold text-success truncate">{top.topic}</p>
                            <p className="text-xs text-base-content/50">{top.Strong}× scored high</p>
                          </div>
                        );
                      })()}

                      {/* Most repeated weak topic */}
                      {topicData.length > 0 && (() => {
                        const weak = [...topicData].sort((a, b) => b.Weak - a.Weak)[0];
                        if (!weak.Weak) return null;
                        return (
                          <div className="rounded-xl p-4 border border-warning/30 bg-warning/10">
                            <p className="text-xs text-base-content/50 mb-1">Focus area</p>
                            <p className="text-lg font-bold text-warning truncate">{weak.topic}</p>
                            <p className="text-xs text-base-content/50">{weak.Weak}× scored low</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </>
        )}

        {/* ── INTERVIEWS TAB ───────────────────────────────────────────────── */}
        {activeTab === "interviews" && (
          <>
            {loading ? (
              <div className="grid place-items-center py-20">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : interviews.length === 0 ? (
              <div className="card bg-base-100 shadow text-center py-16">
                <p className="text-5xl mb-4">🎙️</p>
                <h2 className="text-2xl font-bold">No interviews yet</h2>
                <p className="text-base-content/60 mt-2 mb-6">
                  Start your first adaptive mock interview to get AI-powered feedback.
                </p>
                <div className="flex justify-center">
                  <button className="btn btn-primary" onClick={() => navigate("/createInterview")}>
                    Create Your First Interview
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">All Interviews ({interviews.length})</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate("/createInterview")}>
                    + New Interview
                  </button>
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {interviews.map((interview) => (
                    <InterviewCard
                      key={interview._id}
                      interview={interview}
                      onDelete={deleteInterview}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
