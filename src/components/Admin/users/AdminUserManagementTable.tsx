import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { fetchAllUsers, updateUserStatus } from "../../../store/userSlice";
import { MdPersonAdd, MdAccessTime } from "react-icons/md";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import CreateStaffUserModal from "./CreateStaffUserModal";
import UserStatusDropdown, { type UserStatus } from "./UserStatusDropdown";
import ConfirmStatusChangeModal from "./ConfirmStatusChangeModal";

const glassCard = "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";


function formatDate(dateString: string | undefined | null) {
    if (!dateString) return "—";
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch (e) {
        return dateString;
    }
}

function formatTime(dateString: string | undefined | null) {
    if (!dateString) return "—";
    try {
        const d = new Date(dateString);
        return d.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (e) {
        return dateString;
    }
}

export interface UserItem {
    id: string;
    name: string;
    role: string;
    email: string;
    createdAt: string;
    status: UserStatus;
    avatar: string | null;
}

interface StatusChangeState {
    userId: string;
    userName: string;
    currentStatus: UserStatus;
    newStatus: UserStatus;
}

export default function AdminUserManagementTable() {
    const dispatch = useDispatch<AppDispatch>();

    const { users, pagination, loading } = useSelector((state: RootState) => state.USER);
    const { loading: statusUpdating } = useSelector((state: RootState) => state.USER);

    const [pageNumber, setPageNumber] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [statusChange, setStatusChange] = useState<StatusChangeState | null>(null);
    const pageSize = 10;

    useEffect(() => {
        dispatch(fetchAllUsers({
            PageNumber: pageNumber,
            PageSize: pageSize,
            SortColumn: "userId",   
            Dir: "desc",            
        })).unwrap().catch((err: any) => {
            console.error(err);
            toast.error("Không thể tải danh sách người dùng");
        });
    }, [dispatch, pageNumber]);

    const tableUsers: UserItem[] = users.map((user: any) => ({
        id: user.userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.userName,
        role: user.roles?.[0] || "Attendee",
        email: user.email,
        createdAt: user.createdAt,
        status: user.status as UserStatus,
        avatar: user.profileImageUrl,
    }));

    const handlePageChange = (newPage: number) => {
        const total = pagination?.totalCount ?? users.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (newPage < 1 || newPage > totalPages) return;
        setPageNumber(newPage);
    };

    const handleCreateSuccess = () => {
        // Refresh user list after successful creation
        dispatch(fetchAllUsers({
            PageNumber: pageNumber,
            PageSize: pageSize,
            SortColumn: "userId",
            Dir: "desc",
        })).unwrap().catch((err: any) => {
            console.error(err);
        });
    };

    const handleStatusSelect = (userId: string, userName: string, currentStatus: UserStatus, newStatus: UserStatus) => {
        setStatusChange({
            userId,
            userName,
            currentStatus,
            newStatus,
        });
    };

    const handleConfirmStatusChange = async () => {
        if (!statusChange) return;

        try {
            await dispatch(updateUserStatus({
                userId: statusChange.userId,
                userStatus: statusChange.newStatus,
            })).unwrap();

            toast.success(`Đã cập nhật trạng thái cho ${statusChange.userName}`);
            setStatusChange(null);

            // Refresh user list
            dispatch(fetchAllUsers({
                PageNumber: pageNumber,
                PageSize: pageSize,
                SortColumn: "userId",
                Dir: "desc",
            }));
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái");
        }
    };

    const handleCloseModal = () => {
        if (!statusUpdating) {
            setStatusChange(null);
        }
    };

    const getRoleStyles = (role: string) => {
        switch (role) {
            case "Admin":
                return "bg-red-500/10 text-red-400 border-red-500/20";
            case "Staff":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "Organizer":
                return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            case "Attendee":
            default:
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        }
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
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.4)]"
                    >
                        <MdPersonAdd className="text-base" /> Thêm tài khoản nhân viên
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
                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-[10px] text-[#a592c8] uppercase tracking-widest font-bold">
                                    <th className="px-8 py-4">Người dùng</th>
                                    <th className="px-8 py-4">Vai trò</th>
                                    <th className="px-8 py-4">Email</th>
                                    <th className="px-8 py-4">Ngày tham gia</th>
                                    <th className="px-8 py-4 text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#302447] overflow-visible">
                                {tableUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors overflow-visible">
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
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getRoleStyles(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-[#a592c8]">{user.email}</td>
                                        <td className="px-8 py-5 text-sm text-white">
                                            <div className="inline-flex w-full justify-end">
                                                <div
                                                    title={user.createdAt || "-"}
                                                    className="flex flex-col items-end gap-0 px-3 py-1 rounded-full bg-gradient-to-r from-[#0b1020]/40 to-[#171025]/40 border border-[#2b2236] text-right transition-transform transform hover:-translate-y-0.5 hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/6 border border-white/6">
                                                            <MdAccessTime className="text-[12px] text-purple-300" />
                                                        </span>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-sm font-bold text-white leading-tight">{formatTime(user.createdAt)}</span>
                                                            <span className="text-xs text-[#a592c8]">{formatDate(user.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center overflow-visible">
                                            <div className="overflow-visible">
                                                <UserStatusDropdown
                                                    currentStatus={user.status}
                                                    onStatusSelect={(newStatus) => handleStatusSelect(user.id, user.name, user.status, newStatus)}
                                                    disabled={statusUpdating}
                                                />
                                            </div>
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

            {/* Create Staff User Modal */}
            <CreateStaffUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* Confirm Status Change Modal */}
            {statusChange && (
                <ConfirmStatusChangeModal
                    isOpen={!!statusChange}
                    userName={statusChange.userName}
                    currentStatus={statusChange.currentStatus}
                    newStatus={statusChange.newStatus}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmStatusChange}
                    loading={statusUpdating}
                />
            )}
        </div>
    );
}