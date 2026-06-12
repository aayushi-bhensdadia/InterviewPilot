import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!name || !email || !password) {
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
      await api.post("/users/signup", { name, email, password });
      toast.success("Account created! Please log in.");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-center px-4">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body gap-5">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">🧠 InterviewAI</h1>
            <p className="text-base-content/60 text-sm mt-1">
              Start your placement preparation journey
            </p>
          </div>

          <h2 className="text-xl font-bold">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3 items-end">
              <label className="col-span-1 form-control">
                <span className="label-text font-semibold">Full Name</span>
              </label>
              <input
                type="text"
                placeholder="Rahul Sharma"
                className="col-span-2 input input-bordered input-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

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
                placeholder="Min. 6 characters"
                className="col-span-2 input input-bordered input-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Already have an account?{" "}
            <Link to="/" className="text-primary font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
