import { useAuth } from "../../auth/useAuth.js";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <p className="mt-1 text-gray-600">
        Signed in as {user.email} ({user.role})
      </p>
    </div>
  );
}
