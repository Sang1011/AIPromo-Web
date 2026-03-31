import { useEffect, useState } from "react";
import { MdVisibility, MdFilterList, MdChevronLeft, MdChevronRight } from "react-icons/md";
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
        case "Success":
            return {
                label: "Thành công",
                className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            };
        case "Rejected":
            return {
                label: "Từ chối",
                className: "bg-red-500/10 text-red-400 border-red-500/20"
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
    const { withdrawalList, loading } = useSelector((state: RootState) => state.WITHDRAWAL);
    
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchWithdrawalRequests({
            PageNumber: currentPage,
            PageSize: pageSize,
            SortColumn: "CreatedAt",
            SortOrder: "desc"
        }));
    }, [dispatch, currentPage]);

    const handleViewDetail = (id: string) => {
        setSelectedWithdrawalId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWithdrawalId(null);
    };

    const items = withdrawalList?.data?.items || [];
    const totalPages = withdrawalList?.data?.totalPages || 1;
    const totalCount = withdrawalList?.data?.totalCount || 0;

    return (
        <>
            <div className="glass-effect rounded-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Yêu cầu rút tiền</h2>
                    <p className="text-xs text-slate-500 mt-1">Danh sách các yêu cầu đang chờ và đã xử lý trong hệ thống</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-[#1a1625] hover:bg-white/5 border border-white/10 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all">
                        <MdFilterList className="text-sm" />
                        Bộ lọc
                    </button>
                </div>
            </div>
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
                                                    <p className="text-[10px] text-slate-500 font-bold">{request.email || request.userId}</p>
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
                    Hiển thị <span className="text-white font-bold">{items.length > 0 ? 1 : 0}-{items.length}</span> trong số{" "}
                    <span className="text-white font-bold">{totalCount}</span> yêu cầu
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
