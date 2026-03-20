import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface Props {
    title?: string;
    message?: ReactNode;
    onCancel: () => void;
    onConfirm: () => void;
    confirming?: boolean;
}

export default function AdminConfirmStatusModal({ title = "Xác nhận", message, onCancel, onConfirm, confirming = false }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-b from-[#1e1638] to-[#100d1f] border border-white/10 shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold text-base">{title}</h4>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors"><FiX size={18} /></button>
                </div>
                <div>
                    <p className="text-sm text-slate-300">{message}</p>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-300">Huỷ</button>
                    <button onClick={onConfirm} disabled={confirming} className={`px-4 py-2 text-sm rounded-lg text-white ${confirming ? "bg-primary/30" : "bg-primary hover:bg-primary/90"}`}>{confirming ? "Đang xử lý..." : "Xác nhận"}</button>
                </div>
            </div>
        </div>
    );
}
