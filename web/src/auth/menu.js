const dashboard = { label: "Dashboard", to: "/" };
const checkIn = { label: "Check-in", to: "/check-in" };
const myAttendance = { label: "My Attendance", to: "/my/attendance" };
const myCorrections = { label: "My Corrections", to: "/my/corrections" };
const myLeave = { label: "My Leave", to: "/my/leave" };
const board = { label: "Attendance Board", to: "/hr/attendance" };
const corrections = { label: "Corrections", to: "/hr/corrections" };
const leaveInbox = { label: "Leave Requests", to: "/hr/leave" };

const menus = {
  admin: [
    dashboard,
    { label: "Company Settings", to: "/admin/settings" },
    { label: "Org Setup", to: "/admin/org" },
    { label: "Employees", to: "/hr/employees" },
    board,
    corrections,
    leaveInbox,
  ],
  hr: [
    dashboard,
    checkIn,
    myAttendance,
    myCorrections,
    myLeave,
    { label: "Employees", to: "/hr/employees" },
    board,
    corrections,
    leaveInbox,
  ],
  employee: [dashboard, checkIn, myAttendance, myCorrections, myLeave],
};

export const menuFor = (role) => menus[role] || [dashboard];
