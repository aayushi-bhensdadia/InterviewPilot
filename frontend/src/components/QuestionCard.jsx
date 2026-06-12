const scoreColor = (score) => {
  if (score >= 8) return "text-success";
  if (score >= 5) return "text-warning";
  return "text-error";
};

const difficultyBadge = {
  easy: "badge-success",
  medium: "badge-warning",
  hard: "badge-error",
};

function QuestionCard({ question, index }) {
  return (
    <div className="collapse collapse-arrow bg-base-100 shadow-sm border border-base-200">
      <input type="checkbox" />
      <div className="collapse-title flex items-center gap-3 py-3">
        <span className="badge badge-primary badge-sm shrink-0">Q{question.order}</span>
        <span className={`badge badge-sm capitalize ${difficultyBadge[question.difficulty] || "badge-ghost"}`}>
          {question.difficulty}
        </span>
        <span className="badge badge-outline badge-sm">{question.topic}</span>
        <span className={`ml-auto font-bold shrink-0 ${scoreColor(question.score)}`}>
          {question.score}/10
        </span>
      </div>
      <div className="collapse-content space-y-3">
        <div>
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">Question</p>
          <p className="font-medium">{question.question}</p>
        </div>

        {question.answer && (
          <div>
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">Your Answer</p>
            <p className="text-sm text-base-content/80 bg-base-200 rounded-lg p-3">{question.answer}</p>
          </div>
        )}

        {question.feedback && (
          <div>
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">Feedback</p>
            <p className="text-sm">{question.feedback}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {question.strengths?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-success uppercase tracking-wide mb-1">Strengths</p>
              <ul className="space-y-1">
                {question.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-base-content/70 flex gap-1">
                    <span className="text-success">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {question.gaps?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-error uppercase tracking-wide mb-1">Gaps</p>
              <ul className="space-y-1">
                {question.gaps.map((g, i) => (
                  <li key={i} className="text-xs text-base-content/70 flex gap-1">
                    <span className="text-error">✗</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;
