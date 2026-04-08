import { useEffect, useState, useMemo } from "react";
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
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="bg-[rgba(48,36,71,0.5)] text-[9px] text-[#a592c8] uppercase tracking-wider font-bold">
                            <th className="px-6 py-4 text-left">TÊN SỰ KIỆN</th>
                            <th className="px-6 py-4 text-left">ĐỊA ĐIỂM</th>
                            <th className="px-6 py-4 text-left">
                                <div className="flex items-center gap-1.5">
                                    <MdAccessTime className="text-xs" />
                                    THỜI GIAN
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left">NGÀY TẠO</th>
                            <th className="px-6 py-4 text-center">TRẠNG THÁI</th>
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 border border-[#302447] group-hover:border-primary/50 transition-all"
                                                style={{
                                                    backgroundImage: `url('${evt.bannerUrl}')`,
                                                }}
                                            />
                                            <span className="text-sm font-semibold text-white break-words leading-relaxed">
                                                {evt.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-[#a592c8] truncate block max-w-[180px]" title={evt.location}>
                                            {evt.location || "—"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
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
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] text-[#524a6e] uppercase font-bold">Ngày tạo</span>
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#1a122b]/80 border border-[#302447] w-fit">
                                                <MdCalendarToday className="text-xs text-[#a592c8]" />
                                                <span className="text-xs font-medium text-white">{formatDate(evt.createdAt)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(evt.status)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-[#302447] flex items-center justify-between bg-[rgba(24,18,43,0.4)]">
                    <p className="text-[10px] text-[#a592c8] font-bold uppercase tracking-widest">
                        <span className="text-primary">{filteredEvents.length > 0 ? (pagination.pageNumber - 1) * pagination.pageSize + 1 : 0}</span>
                        {" - "}
                        <span className="text-primary">{Math.min(pagination.pageNumber * pagination.pageSize, filteredEvents.length)}</span>
                        {" "}trên{" "}
                        <span className="text-white">{filteredEvents.length}</span>{" "}
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
