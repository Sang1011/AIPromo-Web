import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { fetchAllUsers } from "../../../store/userSlice";
import { MdFilterList, MdPersonAdd, MdMoreVert } from "react-icons/md";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const glassCard = "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

export interface UserItem {
    id: string;
    name: string;
    role: string;
    email: string;
    joinDate: string;
    status: "active" | "suspended";
    avatar: string | null;
}

export default function AdminUserManagementTable() {
    const dispatch = useDispatch<AppDispatch>();
    
    const { users, pagination, loading } = useSelector((state: RootState) => state.USER);
    
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 10;

    // ====================== CALL API ======================
    useEffect(() => {
        dispatch(fetchAllUsers({
            PageNumber: pageNumber,
            PageSize: pageSize,
            SortColumn: "userId",   // hoặc "email", "userName" tùy bạn
            Dir: "desc",            // ← Bắt buộc phải có
        })).unwrap().catch((err: any) => {
            console.error(err);
            toast.error("Không thể tải danh sách người dùng");
        });
    }, [dispatch, pageNumber]);

    // ====================== MAP DATA ======================
    const tableUsers: UserItem[] = users.map((user: any) => ({
        id: user.userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.userName,
        role: user.roles?.[0] || "Attendee",
        email: user.email,
        joinDate: user.birthday 
            ? new Date(user.birthday).toLocaleDateString("vi-VN")
            : "Chưa cập nhật",
        status: user.status === "Active" ? "active" : "suspended",
        avatar: user.profileImageUrl,
    }));

    const handlePageChange = (newPage: number) => {
        const total = pagination?.totalCount ?? users.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (newPage < 1 || newPage > totalPages) return;
        setPageNumber(newPage);
    };

    return (
        <div className={`${glassCard} rounded-xl overflow-hidden`}>
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#302447] flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-white">Quản lý Người dùng</h2>
                    <p className="text-[#a592c8] text-sm">
                        Quản lý và giám sát người dùng hệ thống theo mọi vai trò
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-[#302447] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors">
                        <MdFilterList className="text-base" /> Lọc
                    </button>
                    <button className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.4)]">
                        <MdPersonAdd className="text-base" /> Thêm người dùng
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Table + Pagination */}
            {!loading && (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-[10px] text-[#a592c8] uppercase tracking-widest font-bold">
                                    <th className="px-8 py-4">Người dùng</th>
                                    <th className="px-8 py-4">Vai trò</th>
                                    <th className="px-8 py-4">Email</th>
                                    <th className="px-8 py-4">Ngày tham gia</th>
                                    <th className="px-8 py-4 text-center">Trạng thái</th>
                                    <th className="px-8 py-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#302447]">
                                {tableUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <div
                                                        className="w-9 h-9 rounded-full bg-cover bg-center border border-[#302447]"
                                                        style={{ backgroundImage: `url('${user.avatar}')` }}
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-[#302447] flex items-center justify-center border border-[#302447]">
                                                        <span className="text-xs font-bold text-white">
                                                            {user.name.split(" ").map((n: string) => n[0]).join("")}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{user.name}</p>
                                                    <p className="text-[10px] text-[#a592c8]">ID: {user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                                user.role === "Organizer" 
                                                    ? "bg-primary/10 text-primary" 
                                                    : "bg-indigo-500/10 text-indigo-400"
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-[#a592c8]">{user.email}</td>
                                        <td className="px-8 py-5 text-sm text-white">{user.joinDate}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                                                user.status === "active"
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : "bg-amber-500/10 text-amber-400"
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    user.status === "active" ? "bg-emerald-400" : "bg-amber-400"
                                                }`} />
                                                {user.status === "active" ? "Hoạt động" : "Bị đình chỉ"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-1.5 rounded-lg text-[#a592c8] hover:text-white hover:bg-white/5 transition-colors">
                                                <MdMoreVert className="text-lg" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {(() => {
                        const serverTotal = pagination?.totalCount ?? 0;
                        const localTotal = users.length;
                        // If server reports a larger total but current returned rows are fewer than a full page,
                        // prefer the local total to avoid showing an inflated totalCount from stale/mocked responses.
                        const total = (serverTotal > localTotal && localTotal < pageSize) ? localTotal : (serverTotal || localTotal);
                        const totalPages = Math.max(1, Math.ceil(total / pageSize));
                        return (
                            <div className="px-8 py-4 border-t border-[#302447] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white/5">
                                {(() => {
                                    const currentCount = tableUsers.length ?? users.length;
                                    return (
                                        <p className="text-xs text-[#a592c8]">Hiển thị <span className="text-white font-bold">{currentCount}</span> trên <span className="text-white font-bold">{total}</span> người dùng</p>
                                    );
                                })()}

                                <div className="flex items-center gap-2">
                                    <button disabled={pageNumber <= 1} onClick={() => handlePageChange(Math.max(1, pageNumber - 1))} className={`px-3 py-1 rounded-md text-sm ${pageNumber <= 1 ? 'text-[#6b5b86] bg-[#0f0b16]' : 'text-white bg-[#302447] hover:bg-white/10'}`}>Prev</button>
                                    <div>
                                        <button className="px-3 py-1 rounded-md text-sm bg-primary text-white">{pageNumber}</button>
                                    </div>
                                    <button disabled={pageNumber >= totalPages} onClick={() => handlePageChange(Math.min(totalPages, pageNumber + 1))} className={`px-3 py-1 rounded-md text-sm ${pageNumber >= totalPages ? 'text-[#6b5b86] bg-[#0f0b16]' : 'text-white bg-[#302447] hover:bg-white/10'}`}>Next</button>
                                </div>
                            </div>
                        );
                    })()}
                </>
            )}
        </div>
    );
}