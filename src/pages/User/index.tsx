import React, { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "../../components/Header";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import type { UserProfile } from "../../types/auth/auth";
import { fetchUserDetail } from "../../store/authSlice";

const ProfileLayout: React.FC = () => {
  const { currentInfor } = useSelector((state: RootState) => state.AUTH);
  const userId = (currentInfor as any)?.userId as string | undefined;
  const user = useSelector((state: RootState) => state.AUTH.userDetail) as UserProfile | null;

  const roles: string[] = user?.roles ?? [];

  const isEventMember =
    roles.some(r => r.toLowerCase() === "attendee") &&
    !roles.some(r => r.toLowerCase() === "organizer");
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserDetail(userId));
    }
  }, [userId, dispatch]);
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
          className="hidden md:flex flex-col w-72 shrink-0 sticky top-[72px] h-[calc(100vh-72px)] border-r border-white/5 bg-[#0B0B12] overflow-y-auto pt-20"
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
              <NavLink to="/profile/ticking-user" className={navClass}>
                <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                Vé của tôi
              </NavLink>
              <NavLink to="/profile/events" className={navClass}>
                <span className="material-symbols-outlined text-[20px]">event</span>
                Sự kiện của tôi
              </NavLink>
              {isEventMember &&
                <NavLink to="/organizer/my-events" className={navClass}>
                  <span className="material-symbols-outlined text-[20px]">event</span>
                  Sự kiện được phân công
                </NavLink>
              }
              <NavLink to="/profile/payment-history" className={navClass}>
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                Lịch sử giao dịch
              </NavLink>
                <NavLink to="/profile/history-withdraw" className={navClass}>
               <span className="material-symbols-outlined text-[20px]">payments</span>
                Lịch sử rút tiền
              </NavLink>
            </nav>

          </div>
        </aside>

        {/* ── Main content ─────────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-y-auto pt-20">
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


    </div>
  );
};

export default ProfileLayout;