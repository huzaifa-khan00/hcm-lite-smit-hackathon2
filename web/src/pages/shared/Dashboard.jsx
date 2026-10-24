import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <p className="mt-1 text-gray-600">
        Signed in as {user.email} ({user.role})
      </p>
      <div className="mt-6 flex gap-4">
        <Link className="text-blue-600 underline" to="/change-password">
          Change password
        </Link>
        <button className="text-red-600 underline" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}
