import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import ComingSoon from "./components/ComingSoon.jsx";
import Setup from "./pages/shared/Setup.jsx";
import Login from "./pages/shared/Login.jsx";
import ChangePassword from "./pages/shared/ChangePassword.jsx";
import Dashboard from "./pages/shared/Dashboard.jsx";
import NotFound from "./pages/shared/NotFound.jsx";
import CompanySettings from "./pages/admin/CompanySettings.jsx";
import OrgSetup from "./pages/admin/OrgSetup.jsx";
import Employees from "./pages/hr/Employees.jsx";
import EmployeeForm from "./pages/hr/EmployeeForm.jsx";
import Corrections from "./pages/hr/Corrections.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/setup" element={<Setup />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePassword />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/settings" element={<CompanySettings />} />
          <Route path="/admin/org" element={<OrgSetup />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin", "hr"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/hr/employees" element={<Employees />} />
          <Route path="/hr/employees/new" element={<EmployeeForm />} />
          <Route path="/hr/employees/:id/edit" element={<EmployeeForm />} />
          <Route path="/hr/corrections" element={<Corrections />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
