const dashboard = { label: "Dashboard", to: "/" };

const menus = {
  admin: [
    dashboard,
    { label: "Company Settings", to: "/admin/settings" },
    { label: "Org Setup", to: "/admin/org" },
    { label: "Employees", to: "/hr/employees" },
    { label: "Attendance Board", to: "/hr/attendance" },
    { label: "Corrections", to: "/hr/corrections" },
    { label: "Leave Inbox", to: "/hr/leave" },
    { label: "Payroll Draft", to: "/hr/payroll/draft" }, // <-- Added here
    { label: "Payroll Finalize", to: "/admin/payroll/finalize" }, // <-- Added here
  ],
  hr: [
    dashboard,
    { label: "Employees", to: "/hr/employees" },
    { label: "Attendance Board", to: "/hr/attendance" },
    { label: "Corrections", to: "/hr/corrections" },
    { label: "Leave Inbox", to: "/hr/leave" },
    { label: "Payroll Draft", to: "/hr/payroll/draft" }, // <-- Added here
  ],
  employee: [
    dashboard,
    { label: "Check In", to: "/check-in" },
    { label: "My Attendance", to: "/my/attendance" },
    { label: "My Corrections", to: "/my/corrections" },
    { label: "My Leave", to: "/my/leave" },
    { label: "My Payslips", to: "/employee/payslips" }, // <-- Added here
  ],
};

export const menuFor = (role) => menus[role] || [dashboard];
