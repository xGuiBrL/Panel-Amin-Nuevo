import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={(v)=>setCollapsed(!v)} />

      <div className={`flex-1 flex flex-col transition-all duration-300`}>
        <header className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-white border-b">
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="md:hidden p-2 rounded bg-gray-100" onClick={()=>setCollapsed(false)}>☰</button>
            <h2 className="text-base sm:text-lg font-semibold text-[color:var(--color-secondary)]">Panel Administrativo</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={handleLogout} className="py-1 sm:py-2 px-2 sm:px-3 rounded bg-[color:var(--color-primary)] text-white hover:brightness-95 transition text-sm sm:text-base">Cerrar sesión</button>
          </div>
        </header>

        <main className="p-3 sm:p-4 md:p-6 overflow-auto">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
