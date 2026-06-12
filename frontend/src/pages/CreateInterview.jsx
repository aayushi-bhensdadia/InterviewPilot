import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import NavBar from "../components/NavBar";

async function extractTextFromFile(file) {
  if (file.type === "application/pdf") {
    // Read PDF as ArrayBuffer and extract text line by line
    const arrayBuffer = await file.arrayBuffer();
    // Use a simple approach: read the PDF byte stream and extract readable text
    const bytes = new Uint8Array(arrayBuffer);
    let text = "";
    // Decode text from PDF stream (basic extraction for plain text PDFs)
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const raw = decoder.decode(bytes);
    // Extract text between BT...ET blocks (PDF text objects)
    const btEt = raw.match(/BT[\s\S]*?ET/g) || [];
    for (const block of btEt) {
      const strings = block.match(/\((.*?)\)\s*Tj/g) || [];
      for (const s of strings) {
        text += s.replace(/^\(/, "").replace(/\)\s*Tj$/, "") + " ";
      }
    }
    // Also grab any readable ASCII chunks
    if (text.trim().length < 50) {
      // Fallback: pull printable ASCII runs
      const printable = raw.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s{3,}/g, "\n");
      text = printable;
    }
    return text.trim();
  }

  // Plain text
  return file.text();
}

function CreateInterview() {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Entry level");
  const [techStack, setTechStack] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [maxQuestions, setMaxQuestions] = useState(6);
  const [loading, setLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const navigate = useNavigate();

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ["text/plain", "application/pdf"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".pdf")) {
      toast.error("Please upload a .txt or .pdf resume file.");
      return;
    }

    try {
      setFileUploading(true);
      setFileName(file.name);
      const text = await extractTextFromFile(file);
      if (text.trim().length < 20) {
        toast.error("Could not extract enough text from the file. Try pasting your resume manually.");
        return;
      }
      setResumeText(text);
      toast.success(`Resume loaded from ${file.name}`);
    } catch (err) {
      toast.error("Failed to read file. Please paste resume text manually.");
    } finally {
      setFileUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!role.trim() || !level.trim() || !techStack.trim()) {
      toast.error("Role, level, and tech stack are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/interviews", {
        role,
        level,
        techStack,
        resumeText,
        maxQuestions,
      });
      toast.success("Interview created! Good luck 🎯");
      navigate(`/interview/${res.data.interview._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <NavBar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create Adaptive Interview</h1>
          <p className="text-base-content/60 mt-1">
            Gemini analyzes your resume, generates personalized questions, and adapts difficulty in real time.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Interview config */}
          <div className="card bg-base-100 shadow">
            <div className="card-body gap-5">
              <h2 className="card-title">Interview Setup</h2>

              <label className="form-control w-full">
                <span className="label-text font-semibold mb-1">Target Role *</span>
                <input
                  type="text"
                  placeholder="e.g. MERN Stack Developer"
                  className="input input-bordered w-full"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </label>

              <label className="form-control w-full">
                <span className="label-text font-semibold mb-1">Interview Level *</span>
                <select
                  className="select select-bordered w-full"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option>Internship</option>
                  <option>Entry level</option>
                  <option>Junior</option>
                  <option>Mid level</option>
                  <option>Advanced</option>
                </select>
              </label>

              <label className="form-control w-full">
                <span className="label-text font-semibold mb-1">Tech Stack *</span>
                <input
                  type="text"
                  placeholder="React, Node.js, Express, MongoDB"
                  className="input input-bordered w-full"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                />
                <span className="label-text-alt text-base-content/50 mt-1">
                  Separate with commas
                </span>
              </label>

              <label className="form-control w-full">
                <span className="label-text font-semibold mb-1">
                  Number of Questions: <span className="text-primary font-bold">{maxQuestions}</span>
                </span>
                <div className="flex items-center gap-4 mt-2">
                  <input
                    type="range"
                    min="4"
                    max="10"
                    value={maxQuestions}
                    className="range range-primary flex-1"
                    onChange={(e) => setMaxQuestions(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, hsl(var(--p)) 0%, hsl(var(--p)) ${((maxQuestions - 4) / 6) * 100}%, hsl(var(--bc)) ${((maxQuestions - 4) / 6) * 100}%, hsl(var(--bc)) 100%)`
                    }}
                  />
                  <span className="text-sm font-semibold text-base-content/70 min-w-fit">{maxQuestions}</span>
                </div>
                <div className="flex justify-between text-xs text-base-content/40 mt-3 px-0">
                  <span>4</span><span>10</span>
                </div>
              </label>
            </div>
          </div>

          {/* Right: Resume */}
          <div className="card bg-base-100 shadow">
            <div className="card-body gap-5">
              <div>
                <h2 className="card-title">Resume (Optional)</h2>
                <p className="text-sm text-base-content/50">
                  Improves question personalization and skill gap analysis.
                </p>
              </div>

              <label className="form-control w-full">
                <span className="label-text font-semibold mb-1">Upload Resume</span>
                <input
                  type="file"
                  accept=".txt,.pdf,text/plain,application/pdf"
                  className="file-input file-input-bordered w-full"
                  onChange={handleResumeUpload}
                  disabled={fileUploading}
                />
                {fileUploading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-base-content/60">
                    <span className="loading loading-spinner loading-xs" />
                    Extracting text...
                  </div>
                )}
                {fileName && !fileUploading && (
                  <span className="label-text-alt text-success mt-1">✓ {fileName}</span>
                )}
                <span className="label-text-alt text-base-content/40 mt-1">
                  Supported: .txt, .pdf
                </span>
              </label>

              <label className="form-control w-full">
                <span className="label-text font-semibold mb-1">Or Paste Resume Text</span>
                <textarea
                  className="textarea textarea-bordered min-h-52 text-sm w-full"
                  placeholder="Paste your resume content here. Include skills, experience, and projects for the best personalization."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                {resumeText && (
                  <span className="label-text-alt text-base-content/50 mt-1">
                    {resumeText.length} characters
                  </span>
                )}
              </label>

              <button
                className="btn btn-primary w-full mt-auto"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm" />
                    Building your interview...
                  </span>
                ) : (
                  "Start Adaptive Interview →"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateInterview;
