import { Outlet } from "react-router-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdFactCheck, MdBadge, MdPostAdd } from "react-icons/md";
import { FiZap } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { clearAuth } from "../../../store/authSlice";
import { useState, useRef, useEffect } from "react";

const staffMenuItems = [
    { icon: MdFactCheck, label: "Duyệt sự kiện", path: "/staff/event-approval" },
    { icon: MdBadge, label: "Duyệt nhà tổ chức", path: "/staff/organizer-profile" },
    { icon: MdPostAdd, label: "Duyệt bài đăng", path: "/staff/post-approval" },
];

const pageTitles: Record<string, string> = {
    "/staff/event-approval": "Danh sách chờ duyệt sự kiện",
    "/staff/organizer-profile": "Duyệt nhà tổ chức",
    "/staff/post-approval": "Duyệt bài đăng Marketing",
};

export default function StaffLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { currentInfor } = useSelector((state: RootState) => state.AUTH);

    const pageTitle = pageTitles[location.pathname] || "Tổng quan Dashboard";
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const user = currentInfor as {
        userId?: string;
        name?: string;
        userName?: string;
        email?: string;
        roles?: string[];
    };

    const handleLogout = () => {
        dispatch(clearAuth());
        navigate("/login");
    };

    const getInitials = (name?: string) => {
        if (!name) return "S";
        return name.charAt(0).toUpperCase();
    };

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen((prev) => !prev)}
                            className="w-full flex items-center gap-3 p-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                            <div
                                className="size-9 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-purple-500 to-purple-700 border border-primary/20"
                            >
                                {getInitials(user?.name)}
                            </div>
                            <div className="flex flex-col min-w-0 text-left">
                                <p className="text-sm font-bold text-white truncate">{user?.userName}</p>
                                <p className="text-[10px] text-slate-400 uppercase">Nhân viên</p>
                            </div>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#13131f] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                                {/* User info */}
                                <div className="px-4 py-3 border-b border-white/8">
                                    <p className="text-white text-sm font-semibold">{user?.name || "Staff"}</p>
                                    <p className="text-slate-500 text-xs truncate">{user?.email || ""}</p>
                                    <p className="text-slate-600 text-[10px] mt-1">Nhân viên</p>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    <span className="text-sm font-medium">Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 bg-[#0B0B12]/50 backdrop-blur-md z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold">{pageTitle}</h2>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-[#0B0B12] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#0B0B12] [&::-webkit-scrollbar-thumb]:bg-[#302447] [&::-webkit-scrollbar-thumb]:rounded-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
