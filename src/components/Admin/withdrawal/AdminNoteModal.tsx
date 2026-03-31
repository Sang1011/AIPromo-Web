import { useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdEditNote, MdInfo } from "react-icons/md";

interface AdminNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (adminNote: string) => void;
    actionType: "approve" | "reject" | "complete";
    loading: boolean;
}

const actionConfig = {
    approve: {
        title: "Phê duyệt yêu cầu",
        buttonLabel: "Phê duyệt ngay",
        buttonColor: "bg-emerald-600 hover:bg-emerald-500",
        iconFill: 1
    },
    reject: {
        title: "Từ chối yêu cầu",
        buttonLabel: "Từ chối ngay",
        buttonColor: "bg-red-600 hover:bg-red-500",
        iconFill: 1
    },
    complete: {
        title: "Hoàn tất giao dịch",
        buttonLabel: "Hoàn tất ngay",
        buttonColor: "bg-blue-600 hover:bg-blue-500",
        iconFill: 1
    }
};

export default function AdminNoteModal({ isOpen, onClose, onConfirm, actionType, loading }: AdminNoteModalProps) {
    const [adminNote, setAdminNote] = useState("");
    const config = actionConfig[actionType];

    const handleSubmit = () => {
        onConfirm(adminNote);
    };

    const handleClose = () => {
        setAdminNote("");
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-[#0a0516]/90 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-[#0f172a] border border-[#302447] shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-[#302447] flex justify-between items-center bg-[#0f172a]/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#7c3bed]/20 rounded-lg">
                            <MdEditNote className="text-[#7c3bed] text-xl" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{config.title}</h3>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="text-[#a592c8] hover:text-white transition-colors"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#a592c8] mb-2">
                            Ghi chú của quản trị viên (Admin Note)
                        </label>
                        <textarea
                            className="w-full bg-[#0a0516] border border-[#302447] rounded-lg px-4 py-3 text-slate-200 placeholder-[#a592c8]/50 focus:ring-2 focus:ring-[#7c3bed] focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Nhập lý do phê duyệt hoặc từ chối tại đây..."
                            rows={4}
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                        />
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-[#7c3bed]/10 rounded-lg border border-[#7c3bed]/20">
                        <MdInfo className="text-[#7c3bed] text-sm mt-0.5" />
                        <p className="text-xs text-[#a592c8] leading-relaxed">
                            Ghi chú này sẽ được gửi đến email của người dùng và hiển thị trong lịch sử giao dịch của họ.
                        </p>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-[#0f172a]/50 border-t border-[#302447] flex gap-3 justify-end">
                    <button 
                        onClick={handleClose}
                        disabled={loading}
                        className="px-5 py-2 text-sm font-semibold text-[#a592c8] hover:text-white hover:bg-[#1a1625] rounded-lg transition-all border border-[#302447]"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || !adminNote.trim()}
                        className={`px-5 py-2 text-sm font-semibold text-white ${config.buttonColor} rounded-lg shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {config.buttonLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
