import { useEffect } from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import { createPortal } from "react-dom";

export type UserStatus = "Active" | "Inactive" | "Banned";

interface ConfirmStatusChangeModalProps {
    isOpen: boolean;
    userName: string;
    currentStatus: UserStatus;
    newStatus: UserStatus;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

const statusConfig = {
    Active: {
        label: "Hoạt động",
        color: "text-emerald-400",
    },
    Inactive: {
        label: "Không hoạt động",
        color: "text-gray-400",
    },
    Banned: {
        label: "Bị cấm",
        color: "text-red-400",
    },
};

export default function ConfirmStatusChangeModal({
    isOpen,
    userName,
    currentStatus,
    newStatus,
    onClose,
    onConfirm,
    loading = false,
}: ConfirmStatusChangeModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !loading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    const currentConfig = statusConfig[currentStatus];
    const newConfig = statusConfig[newStatus];

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                onClick={(e) => {
                    if (e.target === e.currentTarget && !loading) {
                        onClose();
                    }
                }}
                className="w-full max-w-md mx-4"
            >
                {/* Modal Container */}
                <div className="relative bg-gradient-to-b from-[#1e1638] to-[#100d1f] rounded-2xl border border-[rgba(124,59,237,0.3)] shadow-2xl overflow-hidden">
                    {/* Animated Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary animate-pulse" />

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(124,59,237,0.2)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <FiAlertTriangle className="text-amber-400" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Xác nhận thay đổi trạng thái</h3>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 space-y-5">
                        {/* User Info */}
                        <div className="bg-[rgba(124,59,237,0.05)] rounded-xl p-4 border border-[rgba(124,59,237,0.15)]">
                            <p className="text-xs text-[#a592c8] mb-1">Người dùng</p>
                            <p className="text-white font-semibold">{userName}</p>
                        </div>

                        {/* Status Change Display */}
                        <div className="space-y-3">
                            <p className="text-sm text-[#a592c8]">Trạng thái sẽ được thay đổi:</p>
                            <div className="flex items-center justify-center gap-4">
                                {/* Current Status */}
                                <div className="flex-1 text-center">
                                    <div
                                        className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-600 ${currentConfig.color}`}
                                    >
                                        <span className="text-sm font-bold">{currentConfig.label}</span>
                                    </div>
                                    <p className="text-xs text-[#a592c8] mt-2">Hiện tại</p>
                                </div>

                                {/* Arrow */}
                                <div className="text-primary">
                                    <svg
                                        className="w-6 h-6 animate-pulse"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                </div>

                                {/* New Status */}
                                <div className="flex-1 text-center">
                                    <div
                                        className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-primary ${newConfig.color} bg-primary/5`}
                                    >
                                        <span className="text-sm font-bold">{newConfig.label}</span>
                                    </div>
                                    <p className="text-xs text-[#a592c8] mt-2">Mới</p>
                                </div>
                            </div>
                        </div>

                        {/* Warning Message */}
                        {newStatus === "Banned" && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <p className="text-xs text-red-300">
                                    ⚠️ Người dùng bị cấm sẽ không thể đăng nhập hoặc sử dụng hệ thống.
                                </p>
                            </div>
                        )}
                        {newStatus === "Inactive" && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                <p className="text-xs text-yellow-300">
                                    ⚠️ Người dùng không hoạt động sẽ bị hạn chế một số chức năng.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-5 border-t border-[rgba(124,59,237,0.2)] bg-[rgba(15,11,22,0.5)]">
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="px-5 py-2.5 text-sm text-slate-300 hover:text-white transition-colors disabled:opacity-50 rounded-lg"
                            >
                                Huỷ bỏ
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={`
                                    px-6 py-2.5 text-sm rounded-lg font-semibold text-white
                                    transition-all duration-200
                                    ${
                                        loading
                                            ? "bg-primary/30 cursor-not-allowed"
                                            : "bg-primary hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(124,59,237,0.4)] hover:scale-105"
                                    }
                                `}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Đang xử lý...
                                    </span>
                                ) : (
                                    "Xác nhận thay đổi"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
