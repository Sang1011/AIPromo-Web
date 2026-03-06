import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdFactCheck, MdBadge, MdSearch, MdNotifications, MdSettings } from "react-icons/md";
import { FiZap } from "react-icons/fi";

const staffMenuItems = [
    { icon: MdDashboard, label: "Tổng quan", path: "/staff" },
    { icon: MdFactCheck, label: "Duyệt sự kiện", path: "/staff/event-approval" },
    { icon: MdBadge, label: "Duyệt nhà tổ chức", path: "/staff/organizer-profile" },
];

const pageTitles: Record<string, string> = {
    "/staff": "Tổng quan Dashboard",
    "/staff/event-approval": "Danh sách chờ duyệt sự kiện",
    "/staff/organizer-profile": "Duyệt nhà tổ chức",
};

export default function StaffLayout() {
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const pageTitle =
        pageTitles[location.pathname] || "Tổng quan Dashboard";

    return (
        <div className="flex h-screen overflow-hidden bg-[#0B0B12] text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col border-r border-primary/10 bg-[#0B0B12] shrink-0">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(124,59,237,0.4)]">
                        <FiZap className="text-white text-xl" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold leading-tight tracking-tight dark:text-white">
                            AIPromo
                        </h1>
                        <p className="text-xs text-primary font-medium uppercase tracking-widest">
                            Cổng Nhân Viên
                        </p>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {staffMenuItems.map((item) => {
                        const isActive =
                            location.pathname === item.path ||
                            (item.path !== "/staff" &&
                                location.pathname.startsWith(item.path || ""));
                        return (
                            <Link
                                key={item.path}
                                to={item.path || "/staff"}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-400 hover:bg-primary/10 hover:text-primary"
                                }`}
                            >
                                <item.icon
                                    size={20}
                                    className={isActive ? "opacity-100" : "group-hover:text-primary"}
                                />
                                <span
                                    className={`text-sm ${
                                        isActive ? "font-semibold" : "font-medium"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-primary/10">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-primary/5">
                        <img
                            className="size-9 rounded-full object-cover border border-primary/20"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2SWvpHRV5ngFZqjGFBBuO4f85Xr2NO53XwN7dpCs57cvku7PW_2mKS1pAKrFv4seq32tBeICCvRilI9gvp4o39c3CNNRot_l_7TjG30QApOUKzzaAMTI1mxnx7wq3jc9x2qjeC-R68djgpncLV99wTRstnX6_XdQUru-wEr4_WGzUpa4phu-8UelN6sUBPIFn82TtFN2NMoqKR6bYonZX7vxNMk3XD_KDwPOc63ciMpCbysrlvn7OVRYZpb1Fzfl0qmkgRTql--Ad"
                            alt="Staff avatar"
                        />
                        <div className="flex flex-col min-w-0">
                            <p className="text-xs font-bold truncate">Hoàng Nguyễn</p>
                            <p className="text-[10px] text-slate-500 uppercase">
                                Kiểm duyệt viên cao cấp
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 bg-[#0B0B12]/50 backdrop-blur-md z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold">{pageTitle}</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input
                                className="pl-10 pr-4 py-1.5 bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-1 focus:ring-primary transition-all text-white placeholder:text-slate-500"
                                placeholder="Tìm kiếm hệ thống..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 border-l border-primary/10 pl-6">
                            <button className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors text-slate-500">
                                <MdNotifications size={20} />
                            </button>
                            <button className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors text-slate-500">
                                <MdSettings size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-[#0B0B12] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#0B0B12] [&::-webkit-scrollbar-thumb]:bg-[#302447] [&::-webkit-scrollbar-thumb]:rounded-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
