import { createPortal } from "react-dom";
import { MdCheckCircle, MdError, MdClose, MdMonetizationOn } from "react-icons/md";

interface RefundResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventTitle: string;
    succeeded: number;
    skipped: number;
    failed: number;
    totalFound: number;
    failureReasons: { paymentTransactionId: string; failureReason: string }[];
}

export default function RefundResultModal({
    isOpen,
    onClose,
    eventTitle,
    succeeded,
    skipped,
    failed,
    totalFound,
    failureReasons,
}: RefundResultModalProps) {
    if (!isOpen) return null;

    const isSuccess = failed === 0 && failureReasons.length === 0;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-[#1a1232] border border-purple-500/20 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-[#302447]">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full border ${
                                isSuccess
                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                    : "bg-yellow-500/10 border-yellow-500/20"
                            }`}
                        >
                            {isSuccess ? (
                                <MdCheckCircle className="text-lg text-emerald-400" />
                            ) : (
                                <MdMonetizationOn className="text-lg text-yellow-400" />
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-white">Kết quả hoàn tiền</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-[#302447] rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <MdClose className="text-lg" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Event info */}
                    <div className="mb-5 p-4 rounded-xl bg-[#0B0B12]/50 border border-[#302447]">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sự kiện</p>
                        <p className="text-sm font-semibold text-white">{eventTitle}</p>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <MdCheckCircle className="text-emerald-400" />
                                <span className="text-xs text-slate-400">Thành công</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-400">{succeeded}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-slate-400">Đã bỏ qua</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-400">{skipped}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Đã hoàn trước đó</p>
                        </div>
                        {failed > 0 && (
                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 col-span-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <MdError className="text-red-400" />
                                    <span className="text-xs text-slate-400">Thất bại</span>
                                </div>
                                <p className="text-2xl font-bold text-red-400">{failed}</p>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="p-4 rounded-xl bg-[#0B0B12]/50 border border-[#302447] mb-5">
                        <p className="text-xs text-slate-500">Tổng giao dịch đã xử lý</p>
                        <p className="text-lg font-bold text-white">{totalFound}</p>
                    </div>

                    {/* Failure reasons */}
                    {failureReasons.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-3">
                                <MdError className="text-base" />
                                Chi tiết lỗi ({failureReasons.length})
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {failureReasons.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"
                                    >
                                        <p className="text-xs text-slate-500 mb-1">
                                            GD: {item.paymentTransactionId.slice(0, 8)}...
                                        </p>
                                        <p className="text-sm text-red-300">
                                            {item.failureReason || "Lỗi không xác định"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#302447] bg-[#0B0B12]/30">
                    <button
                        onClick={onClose}
                        className="w-full px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/20 transition-all"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
