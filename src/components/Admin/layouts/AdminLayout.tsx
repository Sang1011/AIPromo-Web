import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import {
    MdDashboard,
    MdGroup,
    MdGavel,
    MdPayments,
    MdTerminal,
    MdRocketLaunch,
    MdSearch,
    MdNotifications,
    MdSettings,
    MdDownload,
    MdCategory,
    MdLocalOffer,
} from "react-icons/md";

const adminMenuItems = [
    { icon: MdDashboard, label: "Tổng quan", path: "/admin" },
    { icon: MdGroup, label: "Quản lý Người dùng", path: "/admin/users" },
    { icon: MdGavel, label: "Duyệt Sự kiện", path: "/admin/events" },
    { icon: MdCategory, label: "Quản lý Category", path: "/admin/categories" },
    { icon: MdLocalOffer, label: "Quản lý Hashtags", path: "/admin/hashtags" },
    { icon: MdPayments, label: "Tài chính & Doanh thu", path: "/admin/finance" },
    { icon: MdTerminal, label: "Nhật ký Hệ thống", path: "/admin/logs" },
];

export default function AdminLayout() {
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();

    return (
        <div className="flex h-screen overflow-hidden bg-[#0B0B12] text-slate-100">
            {/* Sidebar */}
            <aside className="w-72 bg-[#120D1D] border-r border-[#302447] flex flex-col justify-between py-6 shrink-0">
                <div>
                    <div className="px-6 mb-10 flex items-center gap-3">
                        <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center shadow-[0_0_15px_rgba(124,59,237,0.4)]">
                            <MdRocketLaunch className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-white text-lg font-bold leading-tight tracking-tight">
                                AIPromo Admin
                            </h1>
                            <p className="text-[#a592c8] text-xs font-medium">
                                Giám sát Hệ thống
                            </p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-1 px-3">
                        {adminMenuItems.map((item) => {
                            const isActive =
                                location.pathname === item.path ||
                                (item.path !== "/admin" &&
                                    location.pathname.startsWith(item.path || ""));
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path || "/admin"}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-primary/10 text-primary border-r-4 border-primary"
                                            : "text-[#a592c8] hover:bg-white/5"
                                    }`}
                                >
                                    <item.icon
                                        className={
                                            isActive ? "opacity-100" : ""
                                        }
                                        size={20}
                                    />
                                    <p
                                        className={`text-sm ${
                                            isActive ? "font-semibold" : "font-medium"
                                        }`}
                                    >
                                        {item.label}
                                    </p>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="px-6">
                    <button className="w-full flex items-center justify-center rounded-lg h-11 bg-primary text-white text-sm font-bold tracking-wide transition-all hover:bg-primary/90 shadow-[0_0_15px_rgba(124,59,237,0.4)]">
                        <MdDownload className="mr-2 text-base" />
                        Tải báo cáo
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-[#302447] flex items-center justify-between px-8 bg-[#0B0B12]/50 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-6 flex-1">
                        <label className="relative w-full max-w-md">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a592c8] text-xl" />
                            <input
                                className="w-full bg-[#18122B] border-none rounded-lg py-2 pl-11 pr-4 text-sm text-white focus:ring-1 focus:ring-primary placeholder-[#a592c8]/50"
                                placeholder="Tìm kiếm phân tích, người dùng hoặc sự kiện..."
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                            />
                        </label>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-lg bg-[#18122B] text-[#a592c8] hover:text-white transition-colors relative">
                            <MdNotifications size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0B0B12]" />
                        </button>
                        <button className="p-2 rounded-lg bg-[#18122B] text-[#a592c8] hover:text-white transition-colors">
                            <MdSettings size={20} />
                        </button>
                        <div className="h-8 w-px bg-[#302447] mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white">
                                    Alex Rivera
                                </p>
                                <p className="text-[10px] text-[#a592c8]">
                                    Super Admin
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5">
                                <div
                                    className="w-full h-full rounded-full bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9irLgmMhxd6f3j25fVXJck-IOqBCeQ3iy2GWgfqENZsArdhDSBErV1la_mITMsuVfHLbB44zkjSSoFgHqcC8UjsML4ddQemZjbJeIy0qMRtlfB2uM1yHfc97Ii094sYRCZfS1OaELqauTN5vvPwVKPQDpde-p69IVYC2niqJ07st1R9BGT1-CliJS35aHxNmR0ziqtwIXKiqUu8FbwZEes5Gfxtov6knd1j2PUdr-mhpzYD5vx7gIyDbrO42J30rRi9hCM7PG1dJo')`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#0B0B12] [&::-webkit-scrollbar-thumb]:bg-[#302447] [&::-webkit-scrollbar-thumb]:rounded-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
