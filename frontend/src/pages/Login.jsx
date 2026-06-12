import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!email || !password) {
      toast.error("All fields are required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/users/login", { email, password });
      login(res.data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-center px-4">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body gap-5">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">🧠 interviewPilot</h1>
            <p className="text-base-content/60 text-sm mt-1">
              Adaptive technical mock interviews
            </p>
          </div>

          <h2 className="text-xl font-bold">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3 items-end">
              <label className="col-span-1 form-control">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="col-span-2 input input-bordered input-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 items-end">
              <label className="col-span-1 form-control">
                <span className="label-text font-semibold">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="col-span-2 input input-bordered input-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
