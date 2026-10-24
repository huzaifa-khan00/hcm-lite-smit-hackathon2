import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Setup from "./pages/shared/Setup.jsx";
import Login from "./pages/shared/Login.jsx";
import ChangePassword from "./pages/shared/ChangePassword.jsx";
import Dashboard from "./pages/shared/Dashboard.jsx";
import NotFound from "./pages/shared/NotFound.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/setup" element={<Setup />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
