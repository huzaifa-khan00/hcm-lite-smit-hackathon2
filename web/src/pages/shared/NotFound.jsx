import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link className="text-blue-600 underline" to="/">
        Go home
      </Link>
    </div>
  );
}
