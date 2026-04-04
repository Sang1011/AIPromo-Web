import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchCancelledEvents, massRefund } from "../../../store/cancelledEventSlice";
import ConfirmModal from "./ConfirmModal";
import RefundResultModal from "./RefundResultModal";
import {
    MdChevronLeft,
    MdChevronRight,
    MdListAlt,
    MdCalendarToday,
    MdLocationOn,
    MdMonetizationOn,
} from "react-icons/md";

const ITEMS_PER_PAGE = 10;

interface FailureItem {
    paymentTransactionId: string;
    failureReason: string;
}

export default function RefundTable() {
    const dispatch = useDispatch<AppDispatch>();
    const { cancelledEvents, loading, refundLoading } = useSelector(
        (state: RootState) => state.CANCELLED_EVENT
    );

    const [currentPage, setCurrentPage] = useState(1);
    const [confirmEventId, setConfirmEventId] = useState<string | null>(null);
    const [processingEventId, setProcessingEventId] = useState<string | null>(null);
    const [resultModal, setResultModal] = useState<{
        isOpen: boolean;
        eventTitle: string;
        succeeded: number;
        skipped: number;
        failed: number;
        totalFound: number;
        failureReasons: FailureItem[];
    }>({
        isOpen: false,
        eventTitle: "",
        succeeded: 0,
        skipped: 0,
        failed: 0,
        totalFound: 0,
        failureReasons: [],
    });

    useEffect(() => {
        dispatch(fetchCancelledEvents({
            Statuses: "Cancelled",
            PageNumber: currentPage,
            PageSize: ITEMS_PER_PAGE,
        }));
    }, [dispatch, currentPage]);

    const handleConfirmRefund = async () => {
        if (!confirmEventId) return;

        const event = cancelledEvents?.items.find(e => e.id === confirmEventId);
        if (!event) return;

        setProcessingEventId(confirmEventId);
        setConfirmEventId(null);

        try {
            const result = await dispatch(massRefund(confirmEventId)).unwrap();

            const failedItems = result.items
                .filter(item => !item.success)
                .map(item => ({
                    paymentTransactionId: item.paymentTransactionId,
                    failureReason: item.failureReason,
                }));

            setResultModal({
                isOpen: true,
                eventTitle: event.title,
                succeeded: result.succeeded,
                skipped: result.skipped,
                failed: result.failed,
                totalFound: result.totalFound,
                failureReasons: failedItems,
            });

            // Refresh the list after refund
            dispatch(fetchCancelledEvents({
                Statuses: "Cancelled",
                PageNumber: currentPage,
                PageSize: ITEMS_PER_PAGE,
            }));
        } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.message || "Không thể xử lý hoàn tiền. Vui lòng thử lại.";
            alert(errorMessage);
        } finally {
            setProcessingEventId(null);
        }
    };

    const openConfirmModal = (eventId: string) => {
        setConfirmEventId(eventId);
    };

    const closeConfirmModal = () => {
        setConfirmEventId(null);
    };

    const closeResultModal = () => {
        setResultModal(prev => ({ ...prev, isOpen: false }));
    };

    const formatDateTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getSelectedEvent = () => {
        if (!confirmEventId) return null;
        return cancelledEvents?.items.find(e => e.id === confirmEventId);
    };

    const totalPages = cancelledEvents?.totalPages ?? 1;
    const events = cancelledEvents?.items ?? [];
    const selectedEvent = getSelectedEvent();

    return (
        <div className="bg-[#18122B]/70 backdrop-blur-md border border-purple-500/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#302447] flex justify-between items-center bg-[#0B0B12]/30">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MdListAlt className="text-primary" /> Sự kiện đã hủy
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Tổng số:</span>
                    <span className="text-xs font-bold text-primary">
                        {cancelledEvents?.totalCount ?? 0} sự kiện
                    </span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0B0B12]/50">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sự kiện</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Địa điểm</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Thời gian sự kiện</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#302447]">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : events.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    Không có sự kiện nào bị hủy
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => {
                                const isProcessing = processingEventId === event.id;
                                return (
                                    <tr key={event.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={event.bannerUrl || "https://via.placeholder.com/40"}
                                                    alt={event.title}
                                                    className="w-10 h-10 rounded-lg object-cover border border-slate-700 group-hover:border-purple-500/50 transition-colors"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-200 line-clamp-1">{event.title}</p>
                                                    <p className="text-xs text-slate-500">ID: {event.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <MdLocationOn className="text-slate-500" />
                                                <span className="line-clamp-1">{event.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <MdCalendarToday className="text-slate-500" />
                                                    <span>{formatDate(event.eventStartAt)}</span>
                                                </div>
                                                <span className="text-xs text-slate-500 ml-6">
                                                    {formatDateTime(event.eventStartAt)} - {formatDateTime(event.eventEndAt)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {formatDateTime(event.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                Đã hủy
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                    isProcessing
                                                        ? "bg-yellow-500/20 text-yellow-400 cursor-wait"
                                                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                                }`}
                                                onClick={() => openConfirmModal(event.id)}
                                                disabled={isProcessing || refundLoading}
                                                title="Hoàn tiền cho tất cả người mua vé"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <div className="w-3.5 h-3.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <MdMonetizationOn className="text-sm" />
                                                        Hoàn tiền
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-4 border-t border-[#302447] flex justify-between items-center bg-[#0B0B12]/30">
                <p className="text-xs text-slate-500">
                    Hiển thị {events.length}/{cancelledEvents?.totalCount ?? 0} sự kiện
                </p>
                <div className="flex gap-2">
                    <button
                        className="p-1.5 rounded-md border border-[#302447] text-slate-400 hover:bg-[#302447] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!cancelledEvents?.hasPrevious}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                        <MdChevronLeft className="text-sm" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page: number;
                        if (totalPages <= 5) {
                            page = i + 1;
                        } else if (currentPage <= 3) {
                            page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                        } else {
                            page = currentPage - 2 + i;
                        }
                        return (
                            <button
                                key={page}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                    page === currentPage
                                        ? "bg-primary text-white font-bold"
                                        : "border border-[#302447] text-slate-400 hover:bg-[#302447]"
                                }`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        );
                    })}
                    <button
                        className="p-1.5 rounded-md border border-[#302447] text-slate-400 hover:bg-[#302447] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!cancelledEvents?.hasNext}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                        <MdChevronRight className="text-sm" />
                    </button>
                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmEventId !== null}
                title="Xác nhận hoàn tiền"
                message={
                    selectedEvent
                        ? `Bạn có chắc chắn muốn hoàn tiền cho tất cả người dùng đã mua vé của sự kiện "${selectedEvent.title}"?\n\nHành động này không thể hoàn tác.`
                        : ""
                }
                onConfirm={handleConfirmRefund}
                onCancel={closeConfirmModal}
                confirmText="Xác nhận hoàn tiền"
                cancelText="Hủy"
                isProcessing={processingEventId !== null}
            />

            {/* Result Modal */}
            <RefundResultModal
                isOpen={resultModal.isOpen}
                onClose={closeResultModal}
                eventTitle={resultModal.eventTitle}
                succeeded={resultModal.succeeded}
                skipped={resultModal.skipped}
                failed={resultModal.failed}
                totalFound={resultModal.totalFound}
                failureReasons={resultModal.failureReasons}
            />
        </div>
    );
}
