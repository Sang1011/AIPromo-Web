import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { clearAuth, fetchMe } from "../../../store/authSlice";
import { createPortal } from "react-dom";
import {
    MdDashboard,
    MdGroup,
    MdGavel,
    MdPayments,
    MdAssignmentReturn,
    MdRocketLaunch,
    MdAutoAwesome,
    MdCategory,
    MdLocalOffer,
    MdAccountBalanceWallet,
    MdLogout,
    MdKeyboardArrowDown,
} from "react-icons/md";

const adminMenuItems = [
    { icon: MdDashboard, label: "Tổng quan", path: "/admin" },
    { icon: MdGroup, label: "Quản lý Người dùng", path: "/admin/users" },
    { icon: MdGavel, label: "Theo dõi Sự kiện", path: "/admin/events" },
    { icon: MdCategory, label: "Quản lý Category", path: "/admin/categories" },
    { icon: MdLocalOffer, label: "Quản lý Hashtags", path: "/admin/hashtags" },
    { icon: MdAutoAwesome, label: "Quản lý gói AI", path: "/admin/ai-packages" },
    { icon: MdAccountBalanceWallet, label: "Yêu cầu rút tiền", path: "/admin/withdrawals" },
    { icon: MdAssignmentReturn, label: "Quản lý hoàn tiền", path: "/admin/refunds" },
    { icon: MdPayments, label: "Tài chính & Doanh thu", path: "/admin/finance" },
];

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { currentInfor } = useSelector((state: RootState) => state.AUTH);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchMe());
    }, [dispatch]);

    const user = (currentInfor as any) || {};
    const userName = user.name || user.userName || "Admin";
    const userEmail = user.email || "";
    const userRoles = user.roles ? (Array.isArray(user.roles) ? user.roles : [user.roles]) : [];
    const roleLabel = userRoles.includes("Admin") ? "Super Admin" : userRoles[0] || "Admin";

    const handleLogoutClick = () => {
        setDropdownOpen(false);
        setConfirmLogoutOpen(true);
    };

    const handleConfirmLogout = () => {
        setConfirmLogoutOpen(false);
        dispatch(clearAuth());
        navigate("/login");
    };

    const handleCancelLogout = () => {
        setConfirmLogoutOpen(false);
    };

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
                            const Icon = item.icon;
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
                                    <Icon
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
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-[#302447] flex items-center justify-between px-8 bg-[#0B0B12]/50 backdrop-blur-md shrink-0">
                    {/* Welcome message */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-purple-400 rounded-full" />
                            <p className="text-base text-slate-300">
                                Chào mừng đến với trung tâm giám sát của{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 font-semibold text-lg">
                                    AIPromo
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* User section */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 hover:bg-white/5 rounded-xl px-3 py-1.5 transition-colors"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white">
                                    {userName}
                                </p>
                                <p className="text-[10px] text-[#a592c8]">
                                    {roleLabel}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5 bg-[#302447] flex items-center justify-center text-sm font-bold text-primary">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <MdKeyboardArrowDown
                                className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* Dropdown via Portal to escape overflow-hidden */}
                        {dropdownOpen && createPortal(
                            <>
                                <div
                                    className="fixed inset-0 z-[9998]"
                                    onClick={() => setDropdownOpen(false)}
                                />
                                <div className="fixed z-[9999] right-8 top-14 w-56 bg-[#1a1232] border border-purple-500/20 rounded-xl shadow-2xl overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[#302447]">
                                        <p className="text-sm font-semibold text-white">{userName}</p>
                                        <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={handleLogoutClick}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <MdLogout className="text-base" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </>,
                            document.body
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#0B0B12] [&::-webkit-scrollbar-thumb]:bg-[#302447] [&::-webkit-scrollbar-thumb]:rounded-full">
                    <Outlet />
                </main>
            </div>

            {/* Logout Confirm Modal */}
            {confirmLogoutOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleCancelLogout}
                    />
                    <div className="relative w-full max-w-sm bg-[#1a1232] border border-purple-500/20 rounded-2xl shadow-2xl">
                        <div className="p-6 pb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20">
                                    <MdLogout className="text-lg text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Đăng xuất</h3>
                            </div>
                            <p className="text-sm text-slate-300">
                                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#302447] bg-[#0B0B12]/30">
                            <button
                                onClick={handleCancelLogout}
                                className="px-5 py-2 rounded-xl text-sm font-medium text-slate-300 bg-[#302447] hover:bg-[#3d2f5a] border border-[#302447] transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20 transition-all"
                            >
                                <MdLogout className="text-base" />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
