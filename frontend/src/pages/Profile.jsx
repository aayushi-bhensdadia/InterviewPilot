import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NavBar from "../components/NavBar";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return (
    <div className="min-h-screen bg-base-200 grid place-items-center">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      <NavBar />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body gap-5">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-content grid place-items-center text-4xl font-bold shadow">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-base-content/60 text-sm">{user.email}</p>
              </div>
            </div>

            <div className="divider" />

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-base-200">
                <span className="font-semibold text-sm">User ID</span>
                <span className="text-xs text-base-content/50 font-mono">{user._id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-base-200">
                <span className="font-semibold text-sm">Name</span>
                <span className="text-sm">{user.name}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-sm">Email</span>
                <span className="text-sm">{user.email}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button className="btn btn-outline flex-1" onClick={() => navigate("/dashboard")}>
                Dashboard
              </button>
              <button className="btn btn-error flex-1" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
