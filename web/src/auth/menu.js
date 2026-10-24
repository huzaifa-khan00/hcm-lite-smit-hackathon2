const dashboard = { label: "Dashboard", to: "/" };

const menus = {
  admin: [
    dashboard,
    { label: "Company Settings", to: "/admin/settings" },
    { label: "Org Setup", to: "/admin/org" },
    { label: "Employees", to: "/hr/employees" },
  ],
  hr: [dashboard, { label: "Employees", to: "/hr/employees" }],
  employee: [dashboard],
};

export const menuFor = (role) => menus[role] || [dashboard];
