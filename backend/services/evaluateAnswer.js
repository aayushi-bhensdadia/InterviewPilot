import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const MODEL = "llama-3.3-70b-versatile";

const cleanJson = (text) =>
  text.replace(/```json/gi, "").replace(/```/g, "").trim();

const localScore = (answer = "") => {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  if (words >= 90) return 7;
  if (words >= 45) return 6;
  if (words >= 18) return 4;
  return 2;
};

export const evaluateAnswer = async (question, answer, context = {}) => {
  const fallbackScore = localScore(answer);
  const fallbackResult = JSON.stringify({
    score: fallbackScore,
    feedback:
      "Groq is not configured, so this score is a local estimate based on answer completeness.",
    strengths: fallbackScore >= 6 ? ["Provided a reasonably complete response"] : [],
    gaps: fallbackScore < 6 ? ["Add clearer concepts, examples, and trade-offs"] : [],
  });

  if (!groq) {
    return fallbackResult;
  }

  const prompt = `
You are a strict but fair technical interviewer evaluating a candidate's answer.

Role: ${context.role || "Technical role"}
Level: ${context.level || "Not specified"}
Topic: ${context.topic || "General"}

Question:
${question}

Candidate Answer:
${answer}

Evaluate the answer and return strict JSON only (no markdown, no extra text):
{
  "score": <number 0-10>,
  "feedback": "<2-3 sentence specific feedback>",
  "strengths": ["<specific strength>"],
  "gaps": ["<specific gap or missing concept>"]
}
`;

  try {
    const message = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });
    const responseText = message.choices[0].message.content;
    // Validate it's parseable JSON, otherwise return fallback
    const cleaned = cleanJson(responseText);
    JSON.parse(cleaned); // throws if invalid
    return cleaned;
  } catch (err) {
    console.error("[evaluateAnswer] Groq error:", err.message);
    return fallbackResult;
  }
};
