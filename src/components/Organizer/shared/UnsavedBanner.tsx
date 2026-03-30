import { FiAlertTriangle } from "react-icons/fi";

export function UnsavedBanner({ saving, onSave }: { saving: boolean; onSave: () => void }) {
    return (
        <div className="sticky top-20 z-40">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-500/25 bg-amber-950/60 px-4 py-3 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <FiAlertTriangle size={14} className="text-amber-400 shrink-0" />  {/* import FiAlertTriangle từ react-icons/fi */}
                    <p className="text-sm text-amber-200 font-medium">
                        Bạn có thay đổi thông tin sự kiện chưa được lưu
                    </p>
                </div>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="shrink-0 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors disabled:opacity-60"
                >
                    {saving ? "Đang lưu..." : "Lưu ngay"}
                </button>
            </div>
        </div>
    );
}