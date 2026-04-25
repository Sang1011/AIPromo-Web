import { useEffect, useState } from "react";
import { MdStore, MdVisibility, MdChevronLeft, MdChevronRight, MdRefresh } from "react-icons/md";
import AdminFinanceTransactionDetailModal from "./AdminFinanceTransactionDetailModal";
import type { AdminPaymentTransaction } from "../../../types/payment/payment";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAdminPaymentTransactions } from "../../../store/paymentSlice";

// Lưu page ngoài component để không bị reset khi unmount/remount (chuyển tab)
let _persistedPage = 1;

export default function AdminFinanceTransactionsTable() {
    const dispatch = useDispatch<AppDispatch>();
    const { adminTransactions } = useSelector((state: RootState) => state.PAYMENT);

    const [currentPage, setCurrentPage] = useState(_persistedPage);
    const [tableLoading, setTableLoading] = useState(true);

    const pageSize = 10;

    const loadTransactions = async (pageNumber: number) => {
        try {
            setTableLoading(true);
            await dispatch(fetchAdminPaymentTransactions({
                PageNumber: pageNumber,
                PageSize: pageSize,
                SortColumn: "CreatedAt",
                SortOrder: "desc",
            })).unwrap();
        } catch (e) {
            console.error("Failed to load admin payment transactions", e);
        } finally {
            setTableLoading(false);
        }
    };

    // Sync currentPage ra ngoài mỗi khi thay đổi để persist qua remount
    useEffect(() => {
        _persistedPage = currentPage;
        loadTransactions(currentPage);
    }, [currentPage]);

    const handleRefresh = async () => {
        await loadTransactions(currentPage);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Completed":
                return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Hoàn tất" };
            case "Pending":
                return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "Đang chờ" };
            case "AwaitingGateway":
            case "AWAITINGGATEWAY":
                return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "Đang chờ cổng thanh toán" };
            case "Failed":
                return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", label: "Thất bại" };
            case "Refunded":
                return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", label: "Đã hoàn tiền" };
            default:
                return { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20", label: status };
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "BatchDirectPay":
                return { bg: "bg-blue-500/10", text: "text-blue-400", label: "Chuyển khoản" };
            case "BatchWalletPay":
                return { bg: "bg-violet-500/10", text: "text-violet-400", label: "Ví" };
            case "WalletTopUp":
            case "WALLETTOPUP":
                return { bg: "bg-teal-500/10", text: "text-teal-400", label: "Nạp ví" };
            default:
                return { bg: "bg-slate-500/10", text: "text-slate-400", label: type };
        }
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number) => {
        return `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
    };

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);

    const handleViewDetail = (transactionId: string) => {
        setSelectedTxnId(transactionId);
        setDetailOpen(true);
    };

    const apiData = adminTransactions;
    const displayTransactions: AdminPaymentTransaction[] = apiData?.items ?? [];

    const totalCount = apiData?.totalCount ?? 0;
    const totalPages = apiData?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));

    const pageNumberFromApi = apiData?.pageNumber ?? currentPage;

    const currentStartIndex =
        apiData?.currentStartIndex ??
        ((pageNumberFromApi - 1) * pageSize + 1);

    const currentEndIndex =
        apiData?.currentEndIndex ??
        Math.min(
            (pageNumberFromApi - 1) * pageSize + displayTransactions.length,
            totalCount
        );

    useEffect(() => {
        if (totalPages && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages]);

    return (
        <>
        <div className="glass-effect rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#1a122b] to-[#241838]">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        Lịch sử Giao dịch Chi tiết
                    </h2>
                    <p className="text-[#a592c8] text-xs mt-1">
                        Xem và quản lý tất cả các hoạt động tài chính trong hệ sinh thái
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={tableLoading}
                    className="bg-[#1b1230] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <MdRefresh className={tableLoading ? 'animate-spin' : ''} />
                    Làm mới
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">
                            <th className="px-8 py-4">Người dùng</th>
                            <th className="px-8 py-4">Loại</th>
                            <th className="px-8 py-4">Số tiền</th>
                            <th className="px-8 py-4">Trạng thái</th>
                            <th className="px-8 py-4">Thời gian hoàn tất</th>
                            <th className="px-8 py-4 text-right">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {tableLoading ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-[#7c3bed] border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : displayTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-[#1a1625] flex items-center justify-center">
                                            <MdStore className="text-3xl text-[#a592c8]" />
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium">Chưa có dữ liệu</p>
                                        <p className="text-[#a592c8] text-xs">Không có giao dịch nào phù hợp với bộ lọc hiện tại</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            displayTransactions.map((tx: AdminPaymentTransaction) => {
                                const statusBadge = getStatusBadge(tx.internalStatus);
                                const typeBadge = getTypeBadge(tx.type);
                                return (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#302447] flex items-center justify-center border border-white/10">
                                                    <MdStore className="text-xs text-[#7c3bed]" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{tx.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${typeBadge.bg} ${typeBadge.text}`}>
                                                {typeBadge.label}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 font-mono font-bold text-[#7c3bed] text-sm">
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                                                {statusBadge.label}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-[11px] text-slate-500 font-bold">
                                            {formatDateTime(tx.completedAt)}
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleViewDetail(tx.id)}
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
                    {displayTransactions.length === 0 ? (
                        <span>Không có dữ liệu</span>
                    ) : (
                        <>
                            Hiển thị <span className="text-white font-bold">{currentStartIndex}–{currentEndIndex}</span> trong tổng <span className="text-white font-bold">{totalCount}</span> giao dịch
                        </>
                    )}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 text-slate-500 hover:bg-white/5 disabled:opacity-30"
                        disabled={currentPage === 1 || tableLoading}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                        <MdChevronLeft className="text-sm" />
                    </button>

                    {(() => {
                        const windowSize = 5;
                        const half = Math.floor(windowSize / 2);
                        let startPage = Math.max(1, currentPage - half);
                        let endPage = Math.min(totalPages, startPage + windowSize - 1);
                        if (endPage - startPage + 1 < windowSize) {
                            startPage = Math.max(1, endPage - windowSize + 1);
                        }
                        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                disabled={tableLoading}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                                    currentPage === page
                                        ? "bg-[#7c3bed] text-white"
                                        : "border border-white/5 text-slate-400 hover:bg-white/5"
                                }`}
                            >
                                {page}
                            </button>
                        ));
                    })()}

                    <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 text-slate-400 hover:bg-white/5 disabled:opacity-30"
                        disabled={currentPage === totalPages || tableLoading}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                        <MdChevronRight className="text-sm" />
                    </button>
                </div>
            </div>
        </div>

        <AdminFinanceTransactionDetailModal open={detailOpen} transactionId={selectedTxnId} onClose={() => setDetailOpen(false)} />
        </>
    );
}