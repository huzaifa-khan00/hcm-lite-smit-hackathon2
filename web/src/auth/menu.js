const dashboard = { label: "Dashboard", to: "/" };
const checkIn = { label: "Check-in", to: "/check-in" };
const myAttendance = { label: "My Attendance", to: "/my/attendance" };
const myCorrections = { label: "My Corrections", to: "/my/corrections" };
const board = { label: "Attendance Board", to: "/hr/attendance" };
const corrections = { label: "Corrections", to: "/hr/corrections" };

const menus = {
  admin: [
    dashboard,
    { label: "Company Settings", to: "/admin/settings" },
    { label: "Org Setup", to: "/admin/org" },
    { label: "Employees", to: "/hr/employees" },
    board,
    corrections,
  ],
  hr: [
    dashboard,
    checkIn,
    myAttendance,
    myCorrections,
    { label: "Employees", to: "/hr/employees" },
    board,
    corrections,
  ],
  employee: [dashboard, checkIn, myAttendance, myCorrections],
};

export const menuFor = (role) => menus[role] || [dashboard];
