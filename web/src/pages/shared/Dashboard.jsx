import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import { errorMessage } from "../../api/client.js";
import { myLeaves } from "../../api/leave.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    presentToday: 0,
    pendingLeaves: 0,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        setLoading(true);

        if (["admin", "hr"].includes(user?.role)) {
          const leaves = await myLeaves().catch(() => []);
          const pending = Array.isArray(leaves)
            ? leaves.filter((l) => l.status === "pending").length
            : leaves?.items?.filter((l) => l.status === "pending").length || 0;

          if (isMounted) {
            setStats({ presentToday: 0, pendingLeaves: pending });
          }
        } else {
          const leaves = await myLeaves().catch(() => []);
          const pending = Array.isArray(leaves)
            ? leaves.filter((l) => l.status === "pending").length
            : leaves?.items?.filter((l) => l.status === "pending").length || 0;

          if (isMounted) {
            setStats({ pendingLeaves: pending });
          }
        }
      } catch (err) {
        console.error("Dashboard stats error:", errorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const isAdminOrHr = ["admin", "hr"].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="mt-1 text-sm text-blue-100">
          Signed in as <span className="font-semibold">{user?.email}</span> (
          {user?.role?.toUpperCase()})
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isAdminOrHr ? (
          <>
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Attendance Board
              </div>
              <div className="mt-2 text-lg font-bold text-gray-900">
                Daily Records
              </div>
              <Link
                to="/hr/attendance"
                className="mt-3 block text-xs font-medium text-blue-600 hover:underline"
              >
                View Attendance Board →
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Pending Leave Requests
              </div>
              <div className="mt-2 text-3xl font-extrabold text-amber-600">
                {loading ? "…" : (stats.pendingLeaves ?? 0)}
              </div>
              <Link
                to="/hr/leave"
                className="mt-3 block text-xs font-medium text-blue-600 hover:underline"
              >
                Review Requests →
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Workforce
              </div>
              <div className="mt-2 text-lg font-bold text-gray-900">
                Directory
              </div>
              <Link
                to="/hr/employees"
                className="mt-3 block text-xs font-medium text-blue-600 hover:underline"
              >
                Manage Employees →
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Payroll Status
              </div>
              <div className="mt-2 text-lg font-bold text-emerald-600">
                Active Cycle
              </div>
              <Link
                to={
                  user?.role === "admin"
                    ? "/admin/payroll/finalize"
                    : "/hr/payroll/draft"
                }
                className="mt-3 block text-xs font-medium text-blue-600 hover:underline"
              >
                Go to Payroll →
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Quick Action
              </div>
              <div className="mt-2 text-lg font-bold text-blue-600">
                Daily Check-In
              </div>
              <Link
                to="/check-in"
                className="mt-3 block text-xs font-medium text-blue-600 hover:underline"
              >
                Clock In / Out Now →
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                My Pending Leaves
              </div>
              <div className="mt-2 text-3xl font-extrabold text-amber-600">
                {loading ? "…" : (stats.pendingLeaves ?? 0)}
              </div>
              <Link
                to="/my/leave"
                className="mt-3 block text-xs font-medium text-blue-600 hover:underline"
              >
                View Leave History →
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Latest Payslip
              </div>
              <div className="mt-2 text-lg font-bold text-gray-900">
                Available
              </div>
              <Link
                to="/employee/payslips"
                className="mt-3 block text-xs font-medium text-blue-600 hover:underline"
              >
                Download PDF →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
