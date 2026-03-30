import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdCalendarToday, MdHourglassEmpty, MdRefresh } from "react-icons/md";
import { fetchPendingOrganizers } from "../../../store/organizerProfileSlice";
import type { RootState, AppDispatch } from "../../../store/index";
import StaffOrganizerDetailModal from "./StaffOrganizerDetailModal";
import toast from "react-hot-toast";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

interface StaffOrganizerProfileListProps {

}

export default function StaffOrganizerProfileList({}: StaffOrganizerProfileListProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { pendingOrganizers } = useSelector(
        (state: RootState) => state.ORGANIZER_PROFILE
    );
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const pageSize = 10;

    // Tính toán pagination dựa trên số hồ sơ thực tế đang hiển thị (client-side)
    const currentCount = pendingOrganizers.length;
    const displayTotalPages = Math.max(1, Math.ceil(currentCount / pageSize));
    const endCount = Math.min(page * pageSize, currentCount);

    useEffect(() => {
        fetchPendingList();
    }, []);

    const fetchPendingList = async () => {
        setIsLoading(true);
        try {
            await dispatch(
                fetchPendingOrganizers({
                    PageNumber: 1,
                    PageSize: 1000, // Lấy tất cả để phân trang client-side
                    SortColumn: "CreatedAt",
                    SortOrder: "desc",
                })
            ).unwrap();
        } catch (error: any) {
            toast.error("Không thể tải danh sách hồ sơ");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            await fetchPendingList();
            setPage(1);
            toast.success("Đã làm mới danh sách");
        } catch (error: any) {
            toast.error("Không thể làm mới danh sách");
        }
    };

    const handleViewProfile = (userId: string) => {
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUserId(null);
    };

    const handleActionSuccess = () => {
        // Sau khi approve/reject, quay về trang 1 và load lại
        setPage(1);
        fetchPendingList();
        handleCloseModal();
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString("vi-VN");
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "Pending":
                return "Chờ xác minh";
            case "Approved":
                return "Đã phê duyệt";
            case "Rejected":
                return "Bị từ chối";
            default:
                return status;
        }
    };

    return (
        <>
            <div className={`${glassCard} rounded-xl overflow-hidden`}>
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#302447] flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-white">Duyệt hồ sơ Nhà tổ chức</h2>
                        <p className="text-[#a592c8] text-sm">Quản lý và xác minh hồ sơ nhà tổ chức</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="bg-[#1b1230] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                            <MdRefresh className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="p-6 space-y-4">
                    {isLoading && pendingOrganizers.length === 0 ? (
                        <div className="text-center text-sm text-[#a592c8] py-8">Đang tải...</div>
                    ) : (
                        <>
                            {pendingOrganizers.map((org) => (
                                <div
                                    key={org.profileId}
                                    className={`${glassCard} p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/30 transition-all group`}
                                >
                                    <div className="flex items-center gap-5 w-full md:w-auto">
                                        <div className="relative">
                                            <img
                                                alt="Organizer avatar"
                                                className="size-16 rounded-2xl object-cover border-2 border-primary/20"
                                                src={org.logo}
                                            />
                                            <div className="absolute -bottom-1 -right-1 size-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-[#18122B]">
                                                <MdHourglassEmpty className="text-[10px] text-white font-bold" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-lg font-bold group-hover:text-primary transition-colors">
                                                {org.displayName}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <MdCalendarToday className="text-sm" />{" "}
                                                    {formatDate(org.createdAt)}
                                                </span>
                                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold uppercase tracking-wide border border-amber-500/20">
                                                    {getStatusLabel(org.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => handleViewProfile(org.userId)}
                                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all border border-primary/30"
                                        >
                                            Xem hồ sơ
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {pendingOrganizers.length === 0 && (
                                <div className="text-center text-sm text-[#a592c8] py-8">
                                    Không có hồ sơ nào đang chờ phê duyệt
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Pagination - Always show when there's data */}
                {currentCount > 0 && (
                    <div className="px-8 py-4 border-t border-[#302447] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white/5">
                        <p className="text-xs text-[#a592c8]">
                            Hiển thị <span className="text-white font-bold">{endCount}</span> trên{" "}
                            <span className="text-white font-bold">{currentCount}</span> hồ sơ
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    page <= 1
                                        ? 'text-[#6b5b86] bg-[#0f0b16]'
                                        : 'text-white bg-[#302447] hover:bg-white/10'
                                }`}
                            >
                                Prev
                            </button>
                            <div className="hidden sm:flex items-center gap-1">
                                {Array.from({ length: displayTotalPages }, (_, idx) => idx + 1).map((p) => {
                                    const show =
                                        displayTotalPages <= 10 ||
                                        Math.abs(p - page) <= 3 ||
                                        p === 1 ||
                                        p === displayTotalPages;

                                    if (!show) {
                                        if (p === 2 && page > 6) return <span key={p} className="px-2">...</span>;
                                        if (p === displayTotalPages - 1 && page < displayTotalPages - 5) return <span key={p} className="px-2">...</span>;
                                        return null;
                                    }

                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`px-3 py-1 rounded-md text-sm ${
                                                p === page
                                                    ? 'bg-primary text-white'
                                                    : 'bg-[#1b1230] text-[#a592c8] hover:bg-white/5'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                disabled={page >= displayTotalPages}
                                onClick={() => setPage(p => Math.min(displayTotalPages, p + 1))}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    page >= displayTotalPages
                                        ? 'text-[#6b5b86] bg-[#0f0b16]'
                                        : 'text-white bg-[#302447] hover:bg-white/10'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <StaffOrganizerDetailModal
                userId={selectedUserId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onActionSuccess={handleActionSuccess}
            />
        </>
    );
}
