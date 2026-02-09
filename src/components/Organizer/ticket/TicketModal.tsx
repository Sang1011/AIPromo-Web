export default function TicketModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-6">
            <div className="w-full max-w-2xl rounded-2xl bg-[#140f2a] border border-white/10 p-6 space-y-6">

                <h3 className="text-lg font-bold text-white">
                    Tạo loại vé mới
                </h3>

                <input
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                    placeholder="Tên vé"
                />

                <div className="grid grid-cols-2 gap-4">
                    <input
                        className="rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                        placeholder="Giá vé"
                    />
                    <input
                        className="rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                        placeholder="Số lượng"
                    />
                </div>

                <textarea
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                    placeholder="Mô tả vé"
                />

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-400"
                    >
                        Hủy
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold">
                        Lưu loại vé
                    </button>
                </div>
            </div>
        </div>
    );
}
