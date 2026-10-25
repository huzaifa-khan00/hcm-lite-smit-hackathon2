import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
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
import AttendanceBoard from "./pages/hr/AttendanceBoard.jsx";
import LeaveInbox from "./pages/hr/LeaveInbox.jsx";
import CheckIn from "./pages/employee/CheckIn.jsx";
import MyAttendance from "./pages/employee/MyAttendance.jsx";
import MyCorrections from "./pages/employee/MyCorrections.jsx";
import MyLeave from "./pages/employee/MyLeave.jsx";
import ApplyLeave from "./pages/employee/ApplyLeave.jsx";
import PayrollDraft from "./pages/hr/PayrollDraft.jsx";
import PayrollFinalize from "./pages/admin/PayrollFinalize.jsx";
import MyPayslips from "./pages/employee/MyPayslips.jsx";
import Announcements from "./pages/shared/Announcements.jsx";
import AuditLogs from "./pages/admin/AuditLogs.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/setup" element={<Setup />} />
      <Route path="/login" element={<Login />} />

      {/* General Authenticated Routes (Employees, HR, and Admins) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePassword />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/my/attendance" element={<MyAttendance />} />
          <Route path="/my/corrections" element={<MyCorrections />} />
          <Route path="/my/leave" element={<MyLeave />} />
          <Route path="/my/leave/apply" element={<ApplyLeave />} />
          <Route path="/employee/payslips" element={<MyPayslips />} />
          <Route path="/announcements" element={<Announcements />} />
        </Route>
      </Route>

      {/* HR & Admin Shared Routes */}
      <Route element={<ProtectedRoute roles={["admin", "hr"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/hr/employees" element={<Employees />} />
          <Route path="/hr/employees/new" element={<EmployeeForm />} />
          <Route path="/hr/employees/:id/edit" element={<EmployeeForm />} />
          <Route path="/hr/attendance" element={<AttendanceBoard />} />
          <Route path="/hr/corrections" element={<Corrections />} />
          <Route path="/hr/leave" element={<LeaveInbox />} />
          <Route path="/hr/payroll/draft" element={<PayrollDraft />} />
        </Route>
      </Route>

      {/* Admin Only Routes */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/settings" element={<CompanySettings />} />
          <Route path="/admin/org" element={<OrgSetup />} />
          <Route path="/admin/payroll/finalize" element={<PayrollFinalize />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
