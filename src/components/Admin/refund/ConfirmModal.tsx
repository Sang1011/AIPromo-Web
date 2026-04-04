import { createPortal } from "react-dom";
import { MdWarning, MdClose } from "react-icons/md";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isProcessing?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    isProcessing = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={!isProcessing ? onCancel : undefined}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#1a1232] border border-purple-500/20 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-[#302447]">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                            <MdWarning className="text-lg text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                    </div>
                    {!isProcessing && (
                        <button
                            onClick={onCancel}
                            className="p-1.5 hover:bg-[#302447] rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                            <MdClose className="text-lg" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#302447] bg-[#0B0B12]/30">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-5 py-2 rounded-xl text-sm font-medium text-slate-300 bg-[#302447] hover:bg-[#3d2f5a] border border-[#302447] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
