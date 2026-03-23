import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const ProfileLayout: React.FC = () => {


  const navClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200",
      isActive
        ? "bg-[#793bed]/20 text-[#793bed] shadow-[0_0_15px_rgba(121,59,237,0.25)]"
        : "text-slate-500 hover:text-slate-200 hover:bg-white/5 hover:translate-x-1",
    ].join(" ");

  return (
    <div className="min-h-screen bg-[#0B0B12] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Header />

      <div className="flex pt-[72px] min-h-screen">

        <aside
          className="hidden md:flex flex-col w-72 shrink-0 sticky top-[72px] h-[calc(100vh-72px)] border-r border-white/5 bg-[#0B0B12] overflow-y-auto"
        >
          <div className="flex flex-col h-full px-4 py-6 space-y-6">

            {/* Navigation */}
            <nav className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-4 mb-3">
                Tài khoản
              </p>
              <NavLink to="/profile/account" className={navClass}>
                <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                Thông tin cá nhân
              </NavLink>
              <NavLink to="/profile/tickets" className={navClass}>
                <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                Vé của tôi
              </NavLink>
              <NavLink to="/profile/events" className={navClass}>
                <span className="material-symbols-outlined text-[20px]">event</span>
                Sự kiện của tôi
              </NavLink>
            </nav>

          </div>
        </aside>

        {/* ── Main content ─────────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>

      </div>

      {/* ── Mobile bottom nav ───────────────────────── */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#18122B]/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-3 z-50">
        <NavLink
          to="/profile/account"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] ${isActive ? "text-[#793bed]" : "text-slate-400"}`
          }
        >
          <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
          Hồ sơ
        </NavLink>
        <NavLink
          to="/profile/tickets"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] ${isActive ? "text-[#793bed]" : "text-slate-400"}`
          }
        >
          <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
          Vé
        </NavLink>
        <NavLink
          to="/profile/events"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] ${isActive ? "text-[#793bed]" : "text-slate-400"}`
          }
        >
          <span className="material-symbols-outlined text-[22px]">event</span>
          Sự kiện
        </NavLink>
      </nav>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProfileLayout;