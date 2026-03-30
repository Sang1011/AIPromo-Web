import { type ReactNode } from "react";
import { MdWarning } from "react-icons/md";

type ConfirmModalProps = {
    open: boolean;
    title?: string;
    description?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmModal({
    open,
    title = "Xác nhận",
    description,
    confirmText = "Xác nhận",
    cancelText = "Huỷ",
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-[#0B0B12] border border-slate-800 rounded-[28px] w-full max-w-md p-6 space-y-5 shadow-2xl">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-yellow-500/10">
                        <MdWarning className="text-yellow-400 text-xl" />
                    </div>
                    <h3 className="text-white font-bold text-lg">{title}</h3>
                </div>

                {/* Content */}
                <div className="text-sm text-slate-300 leading-relaxed">
                    {description}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl text-sm font-semibold
                       border border-slate-700 text-slate-400
                       hover:border-slate-500 hover:text-white transition"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl text-sm font-semibold
                       bg-red-500 text-white hover:bg-red-600
                       disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Đang xử lý..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}