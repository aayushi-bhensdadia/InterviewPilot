import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar bg-base-100 shadow-sm px-4 lg:px-8">
      <div className="flex-1">
        <button
          className="btn btn-ghost text-xl font-bold text-primary"
          onClick={() => navigate("/dashboard")}
        >
          🧠 interviewPilot
        </button>
      </div>

      <div className="flex-none gap-2">
        <div className="hidden sm:flex gap-1">
          <button
            className={`btn btn-ghost btn-sm ${isActive("/dashboard") ? "btn-active" : ""}`}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/createInterview")}
          >
            + New Interview
          </button>
        </div>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-9 rounded-full bg-primary text-primary-content grid place-items-center text-base font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
          >
            <li className="menu-title px-3 py-1">
              <span className="text-xs text-base-content/60">{user?.email}</span>
            </li>
            <li>
              <button onClick={() => navigate("/profile")}>Profile</button>
            </li>
            <li>
              <button onClick={() => navigate("/dashboard")} className="sm:hidden">
                Dashboard
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/createInterview")} className="sm:hidden">
                New Interview
              </button>
            </li>
            <li>
              <button className="text-error" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
