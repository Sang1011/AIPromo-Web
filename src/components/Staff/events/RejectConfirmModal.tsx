import { createPortal } from "react-dom";
import { Ban } from "lucide-react";

interface RejectConfirmModalProps {
  eventTitle?: string;
  loadingId: string | null;
  selectedEventId: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RejectConfirmModal({
  eventTitle,
  loadingId,
  selectedEventId,
  onCancel,
  onConfirm,
}: RejectConfirmModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.1)] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-purple-500/20 flex items-center gap-3">
          <div className="size-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <Ban className="text-red-500 text-xl" />
          </div>
          <h3 className="text-lg font-bold text-white">Xác nhận từ chối</h3>
        </div>
        <div className="px-6 py-6">
          <p className="text-slate-300 text-sm">
            Bạn có chắc chắn muốn{" "}
            <span className="text-red-500 font-bold">từ chối</span> sự kiện{" "}
            <span className="text-purple-400 font-bold">{eventTitle}</span>?
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Hành động này sẽ không thể hoàn tác.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-purple-500/20 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loadingId === selectedEventId}
            className="px-5 py-2.5 rounded-xl border border-slate-500/50 text-slate-400 text-sm font-bold hover:bg-slate-500/10 transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loadingId === selectedEventId}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {loadingId === selectedEventId ? "Đang xử lý..." : "Từ chối"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
