import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import { menuFor } from "../auth/menu.js";

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = menuFor(user.role);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 shrink-0 transform bg-slate-900 text-slate-200 transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-4 text-lg font-bold text-white">HCM Lite</div>
        <nav className="space-y-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm ${
                  isActive ? "bg-slate-700 text-white" : "hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
