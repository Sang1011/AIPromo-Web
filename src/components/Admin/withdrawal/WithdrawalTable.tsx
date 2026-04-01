import { useEffect, useState } from "react";
import { MdVisibility, MdFilterList, MdChevronLeft, MdChevronRight, MdRefresh, MdPayments } from "react-icons/md";
import { FiChevronDown } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchWithdrawalRequests } from "../../../store/withdrawalSlice";
import type { WithdrawalRequest } from "../../../types/withdrawal/withdrawal";
import WithdrawalDetailModal from "./WithdrawalDetailModal";

interface WithdrawalItem extends WithdrawalRequest {
    userName?: string;
    email?: string;
    avatar?: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
};

const getStatusConfig = (status: string) => {
    switch (status) {
        case "Pending":
            return {
                label: "Đang chờ",
                className: "bg-amber-500/10 text-amber-400 border-amber-500/20"
            };
        case "Approved":
            return {
                label: "Đã duyệt",
                className: "bg-blue-500/10 text-blue-400 border-blue-500/20"
            };
        case "Rejected":
            return {
                label: "Từ chối",
                className: "bg-red-500/10 text-red-400 border-red-500/20"
            };
        case "Completed":
            return {
                label: "Hoàn thành",
                className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            };
        default:
            return {
                label: "Không rõ",
                className: "bg-gray-500/10 text-gray-400 border-gray-500/20"
            };
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function WithdrawalTable() {
    const dispatch = useDispatch<AppDispatch>();
    const { withdrawalList, loading, actionLoading } = useSelector((state: RootState) => state.WITHDRAWAL);
    
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);
    
    // Inline filter state
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        Status: "",
        CreatedFrom: "",
        CreatedTo: ""
    });

    const loadData = async () => {
        const params: any = {
            PageNumber: currentPage,
            PageSize: pageSize,
            SortColumn: "CreatedAt",
            SortOrder: "desc"
        };
        
        if (filters.Status) params.Status = filters.Status;
        
        // Convert dates to UTC format for backend
        if (filters.CreatedFrom) {
            const fromDate = new Date(filters.CreatedFrom);
            fromDate.setHours(0, 0, 0, 0);
            params.CreatedFrom = fromDate.toISOString();
        }
        if (filters.CreatedTo) {
            const toDate = new Date(filters.CreatedTo);
            toDate.setHours(23, 59, 59, 999);
            params.CreatedTo = toDate.toISOString();
        }
        
        await dispatch(fetchWithdrawalRequests(params));
    };

    useEffect(() => {
        loadData();
    }, [dispatch, currentPage]);

    useEffect(() => {
        if (!isModalOpen && withdrawalList) {
            loadData();
        }
    }, [isModalOpen]);

    const handleViewDetail = (id: string) => {
        setSelectedWithdrawalId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWithdrawalId(null);
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setCurrentPage(1);
        setShowFilters(false);
        // Reload data with new filters
        const params: any = {
            PageNumber: 1,
            PageSize: pageSize,
            SortColumn: "CreatedAt",
            SortOrder: "desc"
        };
        if (filters.Status) params.Status = filters.Status;
        
        // Convert dates to UTC format for backend
        if (filters.CreatedFrom) {
            const fromDate = new Date(filters.CreatedFrom);
            fromDate.setHours(0, 0, 0, 0);
            params.CreatedFrom = fromDate.toISOString();
        }
        if (filters.CreatedTo) {
            const toDate = new Date(filters.CreatedTo);
            toDate.setHours(23, 59, 59, 999);
            params.CreatedTo = toDate.toISOString();
        }
        
        dispatch(fetchWithdrawalRequests(params));
    };

    const handleResetFilters = () => {
        setFilters({ Status: "", CreatedFrom: "", CreatedTo: "" });
        setCurrentPage(1);
        setShowFilters(false);
        // Reload data without filters
        const params: any = {
            PageNumber: 1,
            PageSize: pageSize,
            SortColumn: "CreatedAt",
            SortOrder: "desc"
        };
        dispatch(fetchWithdrawalRequests(params));
    };

    const hasActiveFilters = filters.Status || filters.CreatedFrom || filters.CreatedTo;
    
    const statusOptions = [
        { value: "", label: "Tất cả" },
        { value: "Pending", label: "Chờ phê duyệt" },
        { value: "Approved", label: "Đã duyệt" },
        { value: "Rejected", label: "Từ chối" },
        { value: "Completed", label: "Hoàn thành" }
    ];

    const items = withdrawalList?.data?.items || [];
    const totalPages = withdrawalList?.data?.totalPages || 1;
    const totalCount = withdrawalList?.data?.totalCount || 0;

    return (
        <>
            <div className="glass-effect rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#1a122b] to-[#241838]">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <MdPayments className="text-[#7c3bed] text-xl" />
                            Yêu cầu rút tiền
                        </h2>
                        <p className="text-[#a592c8] text-xs mt-1">
                            Quản lý và phê duyệt các yêu cầu thanh toán từ người dùng
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`text-xs px-4 py-2 rounded-lg font-bold transition-all border flex items-center gap-2 ${
                                showFilters
                                    ? "bg-[#7c3bed] text-white border-[#7c3bed] shadow-[0_0_15px_rgba(124,59,237,0.4)]"
                                    : "bg-[#1a1625] text-slate-300 border-white/10 hover:bg-white/5"
                            }`}
                        >
                            <MdFilterList className="text-sm" />
                            {showFilters ? "Ẩn lọc" : "Lọc"}
                            {hasActiveFilters && !showFilters && (
                                <span className="w-2 h-2 bg-[#7c3bed] rounded-full"></span>
                            )}
                        </button>
                        <button
                            onClick={loadData}
                            disabled={loading || actionLoading}
                            className="bg-[#1b1230] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MdRefresh className={loading || actionLoading ? 'animate-spin' : ''} />
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Inline Filter Section */}
                {showFilters && (
                    <div className="px-6 py-5 border-b border-white/5 bg-[#0f172a]/50">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-[#a592c8] uppercase tracking-widest mb-2">
                                    Trạng thái
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.Status}
                                        onChange={(e) => handleFilterChange("Status", e.target.value)}
                                        className="w-full bg-[#1a1625] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-[#7c3bed] focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        {statusOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a592c8] pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-[#a592c8] uppercase tracking-widest mb-2">
                                    Từ ngày
                                </label>
                                <input
                                    type="date"
                                    value={filters.CreatedFrom}
                                    onChange={(e) => handleFilterChange("CreatedFrom", e.target.value)}
                                    className="w-full bg-[#1a1625] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-[#7c3bed] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-[#a592c8] uppercase tracking-widest mb-2">
                                    Đến ngày
                                </label>
                                <input
                                    type="date"
                                    value={filters.CreatedTo}
                                    onChange={(e) => handleFilterChange("CreatedTo", e.target.value)}
                                    min={filters.CreatedFrom || undefined}
                                    className="w-full bg-[#1a1625] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-[#7c3bed] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={applyFilters}
                                className="px-6 py-2 bg-[#7c3bed] text-white text-xs font-bold rounded-lg hover:bg-[#6d28d9] transition-all shadow-[0_0_15px_rgba(124,59,237,0.4)]"
                            >
                                Áp dụng lọc
                            </button>
                            <button
                                onClick={handleResetFilters}
                                className="px-6 py-2 bg-[#1a1625] text-slate-300 text-xs font-bold rounded-lg hover:bg-white/5 transition-all border border-white/10"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">
                                <th className="px-8 py-4">Người dùng</th>
                                <th className="px-8 py-4">Số tiền</th>
                                <th className="px-8 py-4">Ngân hàng</th>
                                <th className="px-8 py-4">Số tài khoản</th>
                                <th className="px-8 py-4">Trạng thái</th>
                                <th className="px-8 py-4">Ngày tạo</th>
                                <th className="px-8 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-12 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-[#7c3bed] border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-[#1a1625] flex items-center justify-center">
                                                <MdPayments className="text-3xl text-[#a592c8]" />
                                            </div>
                                            <p className="text-slate-400 text-sm font-medium">Chưa có dữ liệu</p>
                                            <p className="text-[#a592c8] text-xs">Không có yêu cầu rút tiền nào phù hợp với bộ lọc hiện tại</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((request: WithdrawalItem) => {
                                    const statusConfig = getStatusConfig(request.status);
                                    return (
                                        <tr key={request.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        alt="User"
                                                        className="w-9 h-9 rounded-full border border-white/10"
                                                        src={request.avatar || "https://ui-avatars.com/api/?name=User&background=7c3bed&color=fff"}
                                                    />
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{request.userName || "User Name"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 font-mono font-bold text-[#7c3bed] text-sm">
                                                {formatCurrency(request.amount)}
                                            </td>
                                            <td className="px-8 py-4 text-sm text-slate-300">{request.bankName}</td>
                                            <td className="px-8 py-4 font-mono text-sm text-slate-400">{request.bankAccountNumber}</td>
                                            <td className="px-8 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${statusConfig.className}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-[11px] text-slate-500 font-bold">{formatDate(request.createdAt)}</td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleViewDetail(request.id)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors text-[10px] font-bold uppercase"
                                                    >
                                                        <MdVisibility className="text-sm" />
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-8 py-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        {items.length === 0 ? (
                            <span>Không có dữ liệu</span>
                        ) : (
                            <>
                                Hiển thị <span className="text-white font-bold">1-{items.length}</span> trong số{" "}
                                <span className="text-white font-bold">{totalCount}</span> yêu cầu
                            </>
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 text-slate-500 hover:bg-white/5 disabled:opacity-30"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                            <MdChevronLeft className="text-sm" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                                    currentPage === page
                                        ? "bg-[#7c3bed] text-white"
                                        : "border border-white/5 text-slate-400 hover:bg-white/5"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 text-slate-400 hover:bg-white/5 disabled:opacity-30"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                            <MdChevronRight className="text-sm" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Withdrawal Detail Modal */}
            <WithdrawalDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                withdrawalId={selectedWithdrawalId}
            />
        </>
    );
}
