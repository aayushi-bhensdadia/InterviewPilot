import { useNavigate } from "react-router-dom";

const statusColors = {
  completed: "badge-success",
  in_progress: "badge-warning",
  created: "badge-ghost",
};

const scoreColor = (score) => {
  if (score >= 8) return "text-success";
  if (score >= 6) return "text-warning";
  if (score > 0) return "text-error";
  return "text-base-content/40";
};

function InterviewCard({ interview, onDelete }) {
  const navigate = useNavigate();
  const isCompleted = interview.status === "completed";

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
      <div className="card-body gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="card-title capitalize text-lg leading-tight">
              {interview.role}
            </h2>
            <p className="text-xs text-base-content/50 mt-0.5">
              {new Date(interview.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <span className={`badge badge-sm ${statusColors[interview.status] || "badge-ghost"} capitalize`}>
            {interview.status?.replace("_", " ")}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="badge badge-primary badge-outline badge-sm capitalize">
            {interview.level}
          </span>
          {interview.techStack?.slice(0, 3).map((tech) => (
            <span key={tech} className="badge badge-ghost badge-sm">
              {tech}
            </span>
          ))}
          {interview.techStack?.length > 3 && (
            <span className="badge badge-ghost badge-sm">
              +{interview.techStack.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="text-center">
            <p className={`text-2xl font-bold ${scoreColor(interview.score)}`}>
              {interview.score || 0}
              <span className="text-xs text-base-content/40">/10</span>
            </p>
            <p className="text-xs text-base-content/50">Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {interview.analytics?.answeredQuestions || 0}
              <span className="text-xs text-base-content/40">/{interview.maxQuestions || 6}</span>
            </p>
            <p className="text-xs text-base-content/50">Answered</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-base-content/70 mt-1 leading-tight">
              {interview.performanceLevel || "Not started"}
            </p>
            <p className="text-xs text-base-content/50">Level</p>
          </div>
        </div>

        {/* Actions */}
        <div className="card-actions justify-end mt-1 gap-2">
          <button
            className="btn btn-sm btn-ghost text-error"
            onClick={() => onDelete(interview._id)}
          >
            Delete
          </button>
          {isCompleted && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => navigate(`/results/${interview._id}`)}
            >
              Results
            </button>
          )}
          <button
            className="btn btn-sm btn-primary"
            onClick={() => navigate(`/interview/${interview._id}`)}
          >
            {isCompleted ? "Review" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewCard;
