import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3">
      <button
        className="text-2xl md:hidden"
        onClick={onMenu}
        aria-label="Open menu"
      >
        ☰
      </button>
      <div className="ml-auto flex items-center gap-4 text-sm">
        <span>
          {user.name}{" "}
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs uppercase text-gray-600">
            {user.role}
          </span>
        </span>
        <Link className="text-blue-600 hover:underline" to="/change-password">
          Change password
        </Link>
        <button className="text-red-600 hover:underline" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
