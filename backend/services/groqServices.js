import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const MODEL = "llama-3.3-70b-versatile";

const KNOWN_SKILLS = [
  "javascript", "typescript", "react", "node.js", "node", "express",
  "mongodb", "mongoose", "sql", "mysql", "postgresql", "java", "python",
  "c++", "html", "css", "tailwind", "redux", "jwt", "rest api", "git",
  "docker", "aws", "dsa", "data structures", "algorithms",
];

const cleanJson = (text) =>
  text.replace(/```json/gi, "").replace(/```/g, "").trim();

const parseJson = (text, fallback) => {
  try {
    return JSON.parse(cleanJson(text));
  } catch {
    return fallback;
  }
};

const splitTechStack = (techStack = []) => {
  if (Array.isArray(techStack)) return techStack.filter(Boolean);
  return String(techStack).split(",").map((skill) => skill.trim()).filter(Boolean);
};

const inferSkills = (resumeText = "", techStack = []) => {
  const searchable = resumeText.toLowerCase();
  const stack = splitTechStack(techStack);
  const detected = KNOWN_SKILLS.filter((skill) => searchable.includes(skill));
  return [...new Set([...stack, ...detected].map((skill) => skill.trim()))];
};

const callGroq = async (prompt) => {
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  const message = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  return message.choices[0].message.content;
};

export const analyzeResume = async ({ resumeText, role, techStack }) => {
  const fallbackSkills = inferSkills(resumeText, techStack);
  const stack = splitTechStack(techStack);
  const fallback = {
    extractedSkills: fallbackSkills,
    missingSkills: stack.filter(
      (skill) => !fallbackSkills.some((known) => known.toLowerCase() === skill.toLowerCase())
    ),
    resumeSummary:
      resumeText?.trim().length > 0
        ? "Resume parsed locally. AI insights will improve once Groq is configured."
        : "No resume text provided.",
  };

  try {
    const text = await callGroq(`
You are an ATS-grade technical recruiter.

Target role: ${role}
Target stack: ${stack.join(", ")}

Resume text:
${resumeText || "No resume provided"}

Return strict JSON only:
{
  "extractedSkills": ["skill"],
  "missingSkills": ["skill"],
  "resumeSummary": "2 sentence placement-focused summary"
}
`);
    const parsed = parseJson(text, fallback);
    return {
      extractedSkills: parsed.extractedSkills?.length ? parsed.extractedSkills : fallback.extractedSkills,
      missingSkills: parsed.missingSkills || fallback.missingSkills,
      resumeSummary: parsed.resumeSummary || fallback.resumeSummary,
    };
  } catch (err) {
    console.error("[analyzeResume] Groq error:", err.message);
    return fallback;
  }
};

export const generateNextQuestion = async ({
  role, level, techStack, extractedSkills, missingSkills,
  previousQuestions, lastQuestion, lastScore, lastFeedback, currentDifficulty,
}) => {
  const fallbackTopic = missingSkills?.[0] || splitTechStack(techStack)[0] || "fundamentals";
  const fallback = {
    question:
      lastScore < 6
        ? `Can you explain ${fallbackTopic} from first principles and give one practical example?`
        : `How would you apply ${fallbackTopic} in a production ${role} project, including trade-offs?`,
    topic: fallbackTopic,
    difficulty: lastScore >= 8 ? "hard" : lastScore <= 4 ? "easy" : (currentDifficulty || "medium"),
  };

  try {
    const text = await callGroq(`
You are an adaptive technical interviewer. Ask one next question only.

Role: ${role}
Level: ${level}
Tech stack: ${splitTechStack(techStack).join(", ")}
Candidate resume skills: ${(extractedSkills || []).join(", ")}
Skill gaps: ${(missingSkills || []).join(", ")}
Current difficulty: ${currentDifficulty || "medium"}
Previous questions: ${(previousQuestions || []).join(" | ")}
Last question: ${lastQuestion || "None"}
Last score: ${lastScore ?? "None"}/10
Last feedback: ${lastFeedback || "None"}

Rules:
- Adapt difficulty up if score >= 8, down if score <= 4, otherwise stay close.
- Prefer missing skills and weak topics, but do not repeat previous questions.
- Return strict JSON only:
{
  "question": "single interview question",
  "topic": "primary topic",
  "difficulty": "easy|medium|hard"
}
`);
    const parsed = parseJson(text, fallback);
    return {
      question: parsed.question || fallback.question,
      topic: parsed.topic || fallback.topic,
      difficulty: ["easy", "medium", "hard"].includes(parsed.difficulty)
        ? parsed.difficulty
        : fallback.difficulty,
    };
  } catch (err) {
    console.error("[generateNextQuestion] Groq error:", err.message);
    return fallback;
  }
};

export const buildReport = async ({ interview, questions }) => {
  const answered = questions.filter((q) => q.answer?.trim());
  const averageScore = answered.length
    ? answered.reduce((sum, q) => sum + q.score, 0) / answered.length
    : 0;
  const weakTopics = [...new Set(answered.filter((q) => q.score < 6).map((q) => q.topic))];
  const strongTopics = [...new Set(answered.filter((q) => q.score >= 8).map((q) => q.topic))];
  const fallback = {
    performanceLevel:
      averageScore >= 8 ? "Placement ready" : averageScore >= 6 ? "Almost ready" : "Needs practice",
    summary:
      "Report generated from saved answer scores. Configure Groq for deeper qualitative analysis.",
    strongTopics,
    weakTopics,
    roadmap: weakTopics.length
      ? weakTopics.map((topic) => ({
          title: `Strengthen ${topic}`,
          focus: `Revise fundamentals, build one mini project feature, and practice 5 interview answers on ${topic}.`,
          resources: ["Official docs", "One project-based tutorial", "Timed mock interview practice"],
        }))
      : [
          {
            title: "Maintain interview momentum",
            focus: "Keep practicing system design explanations, edge cases, and concise communication.",
            resources: ["Mock interviews", "Project README review", "DSA revision"],
          },
        ],
  };

  try {
    const text = await callGroq(`
You are a placement mentor creating a concise technical interview report.

Interview:
Role: ${interview.role}
Level: ${interview.level}
Stack: ${interview.techStack.join(", ")}
Resume skills: ${interview.extractedSkills.join(", ")}

Answers:
${answered
  .map(
    (q) =>
      `Q: ${q.question}\nA: ${q.answer}\nScore: ${q.score}/10\nFeedback: ${q.feedback}`
  )
  .join("\n\n")}

Return strict JSON only:
{
  "performanceLevel": "Placement ready|Almost ready|Needs practice",
  "summary": "3 sentence candidate report",
  "strongTopics": ["topic"],
  "weakTopics": ["topic"],
  "roadmap": [
    {
      "title": "week or milestone title",
      "focus": "specific improvement task",
      "resources": ["resource type"]
    }
  ]
}
`);
    return parseJson(text, fallback);
  } catch (err) {
    console.error("[buildReport] Groq error:", err.message);
    return fallback;
  }
};
