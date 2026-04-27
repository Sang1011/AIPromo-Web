import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    MdFilterList,
    MdRefresh,
    MdSearch,
    MdCalendarToday,
    MdAccessTime,
} from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
    fetchAllAdminEvents,
    setFilters,
    resetFilters,
    setPageNumber,
} from "../../../store/adminEventSlice";
import type { AppDispatch, RootState } from "../../../store";
import {
    fetchEventById,
} from "../../../store/eventSlice";
import {
    fetchEventRevenueDetail,
    clearRevenueDetail,
} from "../../../store/adminEventReportSlice";
import { fetchEventSpec, clearEventSpec } from "../../../store/staffEventSlice";
import EventRevenueModal from "./AdminRevenueModal";
import toast from "react-hot-toast";
import SeatMapReadOnly from "../../Organizer/seatmap/SeatMapReadOnly";
import type { SeatMapData } from "../../../types/config/seatmap";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

const statusLabels: Record<string, string> = {
    Draft: "Bản nháp",
    PendingReview: "Chờ duyệt",
    Published: "Đã duyệt",
    Suspended: "Đã đình chỉ",
    PendingCancellation: "Chờ hủy",
    Cancelled: "Đã hủy",
    Completed: "Hoàn thành",
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    Draft: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
    PendingReview: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
    Published: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
    Suspended: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
    PendingCancellation: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
    Cancelled: { bg: "bg-gray-500/10", text: "text-gray-400", dot: "bg-gray-400" },
    Completed: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
};

function getStatusBadge(status: string) {
    const c = statusConfig[status] || statusConfig.Draft;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text} whitespace-nowrap`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {statusLabels[status] || status}
        </span>
    );
}

function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

const statusOptions: { value: string; label: string }[] = [
    { value: "PendingReview", label: "Chờ duyệt" },
    { value: "Published", label: "Đã duyệt" },
    { value: "Completed", label: "Hoàn thành" },
    { value: "Draft", label: "Bản nháp" },
    { value: "Suspended", label: "Đã đình chỉ" },
    { value: "Cancelled", label: "Đã hủy" },
];

export default function AdminEventModerationTable() {
    const dispatch = useDispatch<AppDispatch>();
    const { filteredEvents, pagination, filters, loading } = useSelector(
        (state: RootState) => state.ADMIN_EVENT
    );

    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        Title: filters.Title || "",
        Statuses: filters.Statuses || "",
    });

    useEffect(() => {
        dispatch(fetchAllAdminEvents({ PageNumber: 1, PageSize: 10 }));
    }, [dispatch]);

    useEffect(() => {
        setLocalFilters({
            Title: filters.Title || "",
            Statuses: filters.Statuses || "",
        });
    }, [filters]);

    // Detail modal / event spec state (reused from StaffEventApprovalQueue)
    const currentEvent = useSelector((state: RootState) => state.EVENT.currentEvent);
    const eventSpec = useSelector((state: RootState) => state.STAFF_EVENT.eventSpec);
    const eventSpecEventId = useSelector((state: RootState) => state.STAFF_EVENT.eventId);
    const eventSpecLoading = useSelector((state: RootState) => state.STAFF_EVENT.loading);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [showRevenueModal, setShowRevenueModal] = useState(false);
    const [selectedRevenueEventId, setSelectedRevenueEventId] = useState<string | null>(null);
    const revenueDetail = useSelector((state: RootState) => state.ADMIN_EVENT_REPORT.revenueDetail);
    const revenueCurrentEventId = useSelector((state: RootState) => state.ADMIN_EVENT_REPORT.currentEventId);
    const revenueLoading = useSelector((state: RootState) => state.ADMIN_EVENT_REPORT.loading);
    const revenueError = useSelector((state: RootState) => state.ADMIN_EVENT_REPORT.error);

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        dispatch(setFilters(localFilters));
        setShowFilters(false);
    };

    const handleResetFilters = () => {
        setLocalFilters({ Title: "", Statuses: "" });
        dispatch(resetFilters());
        dispatch(setPageNumber(1));
        setShowFilters(false);
    };

    const handlePageChange = (page: number) => {
        dispatch(setPageNumber(page));
    };

    const openDetailModal = async (eventId: string) => {
        setSelectedEventId(eventId);
        setShowDetailModal(true);

        const isSameEvent = currentEvent?.id === eventId;

            try {
                if (!isSameEvent) {
                    await dispatch(fetchEventById(eventId)).unwrap();
                }
                await dispatch(fetchEventSpec(eventId)).unwrap();
            } catch (err: any) {
                toast.error(err?.response?.data?.message ?? err?.message ?? "Không thể tải chi tiết sự kiện");
            }
    };

    const openRevenueModal = async (eventId: string) => {
        setSelectedRevenueEventId(eventId);
        setShowRevenueModal(true);
        dispatch(clearRevenueDetail());
        try {
            await dispatch(fetchEventRevenueDetail(eventId)).unwrap();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? err?.message ?? "Không thể tải doanh thu");
        }
    };

    // view-only: no action handlers

    const currentPageEvents = useMemo(() => {
        if (!pagination) return [];
        const startIndex = (pagination.pageNumber - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        return filteredEvents.slice(startIndex, endIndex);
    }, [filteredEvents, pagination]);

    return (
        <div className={`${glassCard} rounded-xl overflow-hidden`}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#302447] flex justify-between items-center bg-gradient-to-r from-[#1a122b] to-[#241838]">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <MdCalendarToday className="text-primary text-xl" />
                        Quản lý Sự kiện
                    </h2>
                    <p className="text-[#a592c8] text-xs mt-1">
                        Xem xét và quản lý danh sách sự kiện trên nền tảng
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`text-xs px-4 py-2 rounded-lg font-bold transition-all border flex items-center gap-2 ${showFilters
                                ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(124,59,237,0.4)]"
                                : "bg-[#302447] text-[#a592c8] border-[#302447] hover:bg-[#3d2f5a] hover:text-white"
                            }`}
                    >
                        <MdFilterList className="text-sm" />
                        Lọc
                    </button>
                    <button
                        onClick={() => dispatch(fetchAllAdminEvents({ PageNumber: 1, PageSize: 10 }))}
                        className="bg-[#302447] text-[#a592c8] text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#3d2f5a] hover:text-white transition-all border border-[#302447] flex items-center gap-2"
                    >
                        <MdRefresh className={`text-sm ${loading ? "animate-spin" : ""}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="px-6 py-5 border-b border-[#302447] bg-[rgba(24,18,43,0.6)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-[10px] text-[#a592c8] uppercase font-bold mb-2 flex items-center gap-1">
                                <MdSearch className="text-xs" />
                                Tiêu đề
                            </label>
                            <input
                                type="text"
                                value={localFilters.Title}
                                onChange={(e) => handleFilterChange("Title", e.target.value)}
                                placeholder="Tìm kiếm sự kiện..."
                                className="w-full bg-[#1a122b] border border-[#302447] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-[#524a6e]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-[#a592c8] uppercase font-bold mb-2">
                                Trạng thái
                            </label>
                            <select
                                value={localFilters.Statuses}
                                onChange={(e) => handleFilterChange("Statuses", e.target.value)}
                                className="w-full bg-[#1a122b] border border-[#302447] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                            >
                                <option value="">Tất cả</option>
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={applyFilters}
                                className="bg-gradient-to-r from-primary to-purple-600 text-white text-xs px-6 py-2.5 rounded-lg font-bold hover:from-primary/90 hover:to-purple-600/90 transition-all shadow-[0_0_20px_rgba(124,59,237,0.4)] hover:shadow-[0_0_25px_rgba(124,59,237,0.5)]"
                            >
                                Áp dụng lọc
                            </button>
                            <button
                                onClick={handleResetFilters}
                                className="bg-[#302447] text-[#a592c8] text-xs px-6 py-2.5 rounded-lg font-bold hover:bg-[#3d2f5a] hover:text-white transition-all border border-[#302447]"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="bg-[rgba(48,36,71,0.5)] text-[9px] text-[#a592c8] uppercase tracking-wider font-bold">
                            <th className="px-6 py-4 text-left w-[35%]">TÊN SỰ KIỆN</th>
                            <th className="px-6 py-4 text-left w-[25%]">ĐỊA ĐIỂM</th>
                            <th className="px-6 py-4 text-left w-[20%]">
                                <div className="flex items-center gap-1.5">
                                    <MdAccessTime className="text-xs" />
                                    THỜI GIAN
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left w-[10%]">NGÀY TẠO</th>
                            <th className="px-6 py-4 text-center w-[10%]">TRẠNG THÁI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#302447]/50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex items-center justify-center gap-3 text-[#a592c8]">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : currentPageEvents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-[#302447] flex items-center justify-center">
                                            <MdCalendarToday className="text-3xl text-[#524a6e]" />
                                        </div>
                                        <span className="text-[#a592c8] text-sm">Không có sự kiện nào</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            currentPageEvents.map((evt) => (
                                <tr
                                    key={evt.id}
                                    className="group hover:bg-[rgba(124,59,237,0.05)] transition-all duration-200"
                                >
                                    <td className="px-6 py-4 min-w-0">
                                            <div className="flex items-start gap-3 min-w-0">
                                                                    <div
                                                                        className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 border border-[#302447] group-hover:border-primary/50 transition-all"
                                                                        style={{
                                                                            backgroundImage: `url('${evt.bannerUrl}')`,
                                                                        }}
                                                                    />
                                                                        <div className="flex flex-col min-w-0">
                                                                            <span className="text-sm font-semibold text-white block min-w-0 break-words whitespace-normal leading-relaxed">
                                                                                {evt.title}
                                                                            </span>
                                                                        <div className="mt-2">
                                                                            <button
                                                                                onClick={() => openDetailModal(evt.id)}
                                                                                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold shadow-[0_0_8px_rgba(124,59,237,0.2)] hover:scale-[1.02] transition-all"
                                                                            >
                                                                                Xem chi tiết
                                                                            </button>
                                                                            {evt.status === "Completed" && (
                                                                                <button
                                                                                    onClick={() => openRevenueModal(evt.id)}
                                                                                    className="ml-3 px-3 py-1.5 rounded-lg bg-[#1f3a2e] text-emerald-400 text-xs font-bold border border-emerald-500/10 hover:bg-emerald-500/5 transition-all"
                                                                                >
                                                                                    Xem doanh thu
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                    </td>
                                        <td className="px-6 py-4 min-w-0">
                                            <span className="text-sm text-[#a592c8] truncate block min-w-0" title={evt.location}>
                                                {evt.location || "—"}
                                            </span>
                                        </td>
                                    <td className="px-6 py-4 min-w-0">
                                        <div className="flex flex-col gap-1.5">
                                            {/* Start Time Badge */}
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#1a122b]/80 border border-[#302447] w-fit group-hover:border-emerald-500/30 transition-all">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-[8px] text-[#524a6e] uppercase font-bold">Bắt đầu</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-semibold text-emerald-400">{formatTime(evt.eventStartAt)}</span>
                                                        <span className="text-[10px] text-[#a592c8]">•</span>
                                                        <span className="text-xs font-medium text-white">{formatDate(evt.eventStartAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* End Time Badge */}
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#1a122b]/80 border border-[#302447] w-fit group-hover:border-red-500/30 transition-all">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-[8px] text-[#524a6e] uppercase font-bold">Kết thúc</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-semibold text-red-400">{formatTime(evt.eventEndAt)}</span>
                                                        <span className="text-[10px] text-[#a592c8]">•</span>
                                                        <span className="text-xs font-medium text-white">{formatDate(evt.eventEndAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-0">
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <span className="text-[8px] text-[#524a6e] uppercase font-bold">Ngày tạo</span>
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#1a122b]/80 border border-[#302447] w-fit">
                                                <MdCalendarToday className="text-xs text-[#a592c8]" />
                                                <span className="text-xs font-medium text-white">{formatDate(evt.createdAt)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-0 text-center">
                                        {getStatusBadge(evt.status)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* No action modals for admin view-only modal */}

            {/* Detail Modal */}
            {showDetailModal && currentEvent && createPortal(
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
                    onClick={() => {
                        setShowDetailModal(false);
                        dispatch(clearEventSpec());
                        setSelectedEventId(null);
                    }}
                >
                    <div
                        className="relative w-full max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col rounded-2xl bg-[#18122B] border border-purple-500/30 shadow-[0_0_20px_rgba(124,59,237,0.2)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-8 py-5 border-b border-purple-500/30">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-white">
                                    {currentEvent.title}
                                </h1>
                                <p className="text-slate-400 text-sm flex items-center gap-1">
                                    📍 {currentEvent.location}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border border-purple-500/20">
                                <img
                                    src={currentEvent.bannerUrl || "/event-placeholder.jpg"}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-xs text-slate-400">Bắt đầu</p>
                                    <p className="font-bold">{formatDate(currentEvent.eventStartAt)}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-xs text-slate-400">Kết thúc</p>
                                    <p className="font-bold">{formatDate(currentEvent.eventEndAt)}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-xs text-slate-400">Mở bán vé</p>
                                    <p className="font-bold">{formatDate(currentEvent.ticketSaleStartAt)}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-xs text-slate-400">Đóng bán vé</p>
                                    <p className="font-bold">{formatDate(currentEvent.ticketSaleEndAt)}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-3 text-white">Mô tả sự kiện</h3>
                                <div className="text-slate-300 text-sm leading-relaxed bg-white/5 p-5 rounded-xl border border-white/5">
                                    {currentEvent.description}
                                </div>
                            </div>

                            {currentEvent.actorImages?.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4 text-white">Nghệ sĩ</h3>
                                    <div className="flex gap-6 overflow-x-auto pb-2">
                                        {currentEvent.actorImages.map((a: any) => (
                                            <div key={a.id} className="text-center">
                                                <img src={a.image} className="w-20 h-20 rounded-full object-cover border-2 border-purple-500" />
                                                <p className="text-xs mt-2 font-bold text-white">{a.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-bold mb-4 text-white">Sơ đồ chỗ ngồi</h3>

                                {eventSpecLoading && eventSpecEventId === selectedEventId ? (
                                    <div className="h-[500px] w-full bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm text-slate-400">Đang tải sơ đồ...</span>
                                        </div>
                                    </div>
                                ) : eventSpec?.spec && eventSpecEventId === selectedEventId ? (
                                    <div className="h-[500px] w-full bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                        <SeatMapReadOnly seatMapData={JSON.parse(eventSpec.spec) as SeatMapData} ticketTypes={currentEvent.ticketTypes} />
                                    </div>
                                ) : (
                                    <div className="relative aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-purple-500/30 border border-purple-500/50 rounded flex items-center justify-center text-[10px] font-bold text-purple-300">STAGE</div>
                                        <div className="flex flex-col gap-2 mt-10">
                                            <div className="flex gap-1 justify-center">
                                                <div className="h-3 w-8 bg-amber-500/50 rounded-sm"></div>
                                                <div className="h-3 w-8 bg-amber-500/50 rounded-sm"></div>
                                                <div className="h-3 w-8 bg-amber-500/50 rounded-sm"></div>
                                            </div>
                                            <div className="flex gap-1 justify-center">
                                                <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                                                <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                                                <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                                                <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                                            </div>
                                            <div className="flex gap-1 justify-center">
                                                <div className="h-3 w-5 bg-slate-700/40 rounded-sm"></div>
                                                <div className="h-3 w-5 bg-slate-700/40 rounded-sm"></div>
                                                <div className="h-3 w-5 bg-slate-700/40 rounded-sm"></div>
                                                <div className="h-3 w-5 bg-slate-700/40 rounded-sm"></div>
                                                <div className="h-3 w-5 bg-slate-700/40 rounded-sm"></div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 italic">Sơ đồ minh hoạ</div>
                                    </div>
                                )}
                            </div>

                            {currentEvent.ticketTypes?.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4 text-white">Loại vé</h3>
                                    <div className="space-y-3">
                                        {currentEvent.ticketTypes.map((t: any) => (
                                            <div key={t.id} className="flex justify-between p-3 rounded-lg bg-white/5 border-l-2 border-purple-500">
                                                <span className="text-sm text-slate-300">{t.name}</span>
                                                <span className="text-purple-400 font-bold">{t.price?.toLocaleString?.() ?? t.price}₫</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentEvent.policy && (
                                <div>
                                    <h3 className="text-lg font-bold mb-3 text-white">Chính sách</h3>
                                    <div className="text-sm text-slate-300 bg-white/5 p-5 rounded-xl" dangerouslySetInnerHTML={{ __html: currentEvent.policy }} />
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-purple-500/30 flex justify-end gap-4 bg-[#18122B]">
                            <button onClick={() => { setShowDetailModal(false); dispatch(clearEventSpec()); setSelectedEventId(null); }} className="px-6 py-3 rounded-xl border border-white/10 text-slate-300">Đóng</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

                {/* Revenue Modal */}
                <EventRevenueModal
                    isOpen={showRevenueModal}
                    eventId={selectedRevenueEventId}
                    currentEventId={revenueCurrentEventId}
                    revenueDetail={revenueDetail}
                    loading={revenueLoading}
                    error={revenueError}
                    eventTitle={
                        currentPageEvents.find((e) => e.id === selectedRevenueEventId)?.title
                    }
                    onClose={() => {
                        setShowRevenueModal(false);
                        setSelectedRevenueEventId(null);
                        dispatch(clearRevenueDetail());
                    }}
                />

            {/* Confirmation Modal - Approve */}
            {/* No action confirmations for view-only modal */}

            {/* Pagination */}
            {pagination && (
                <div className="px-6 py-4 border-t border-[#302447] flex items-center justify-between bg-[rgba(24,18,43,0.4)]">
                    <p className="text-[10px] text-[#a592c8] font-bold uppercase tracking-widest">
                        <span className="text-primary">{filteredEvents.length > 0 ? (pagination.pageNumber - 1) * pagination.pageSize + 1 : 0}</span>
                        {" - "}
                        <span className="text-primary">{Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount ?? filteredEvents.length)}</span>
                        {" "}trên{" "}
                        <span className="text-white">{pagination.totalCount ?? filteredEvents.length}</span>{" "}
                        sự kiện
                    </p>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => handlePageChange(pagination.pageNumber - 1)}
                            disabled={!pagination.hasPrevious}
                            className="p-2 rounded-lg bg-[#302447] text-[#a592c8] hover:text-white hover:bg-[#3d2f5a] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#302447]"
                        >
                            <FiChevronLeft className="text-sm" />
                        </button>

                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.pageNumber <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.pageNumber >= pagination.totalPages - 2) {
                                pageNum = pagination.totalPages - 4 + i;
                            } else {
                                pageNum = pagination.pageNumber - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`min-w-[36px] p-2 rounded-lg transition-all font-bold text-xs ${pageNum === pagination.pageNumber
                                            ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-[0_0_15px_rgba(124,59,237,0.4)]"
                                            : "bg-[#302447] text-[#a592c8] hover:text-white hover:bg-[#3d2f5a] border border-[#302447]"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(pagination.pageNumber + 1)}
                            disabled={!pagination.hasNext}
                            className="p-2 rounded-lg bg-[#302447] text-[#a592c8] hover:text-white hover:bg-[#3d2f5a] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#302447]"
                        >
                            <FiChevronRight className="text-sm" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}