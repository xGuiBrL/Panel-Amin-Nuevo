import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [open, setOpen] = useState(!collapsed);

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Usuarios", path: "/usuarios", icon: "👥" },
    { name: "Productores", path: "/productores", icon: "🧑‍🌾" },
    { name: "Productos", path: "/productos", icon: "📦" },
    { name: "Ventas", path: "/ventas", icon: "💸" },
    { name: "Comprobadores", path: "/comprobadores", icon: "🔎" },
    { name: "Admin Forms", path: "/admin-forms", icon: "✏️" },
  ];

  return (
    <aside className={`sidebar-bg text-white h-full transition-all duration-300 ${open ? 'w-64' : 'w-16'} flex flex-col` }>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/images/mercadea_logo.jpeg" alt="logo" className={`h-10 w-10 rounded-full shadow-md transition-transform ${open ? '' : 'scale-90'}`} />
          {open && <span className="font-bold">Mercadea</span>}
        </div>

        <button
          aria-label="Toggle sidebar"
          onClick={() => { setOpen(!open); if(onToggle) onToggle(!open); }}
          className="p-2 rounded bg-white/6 hover:bg-white/12 transition"
        >
          {open ? '⬅️' : '➡️'}
        </button>
      </div>

      <nav className="flex-1 overflow-auto p-3">
        <ul className="space-y-1">
          {links.map((l) => {
            const active = location.pathname === l.path;
            return (
              <li key={l.path}>
                <Link to={l.path} className={`flex items-center gap-3 p-2 rounded-md hover:bg-white/6 transition ${active ? 'bg-white/12' : ''}`}>
                  <span className="text-lg">{l.icon}</span>
                  {open && <span className="text-sm">{l.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="text-sm opacity-90 text-center">v1.0</div>
      </div>
    </aside>
  );
}
