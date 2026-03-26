import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { fetchHashtagById, fetchUpdateHashtag, fetchAllHashtags } from "../../../store/hashtagSlice";
import toast from "react-hot-toast";

export default function AdminEditHashtagModal({ hashtagId, onClose }: { hashtagId: number; onClose: () => void }) {
    const dispatch = useDispatch<AppDispatch>();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '' });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await dispatch(fetchHashtagById(hashtagId)).unwrap();
                const data = res.data;
                setForm({ name: data.name ?? '' });
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [hashtagId, dispatch]);

    const canSave = form.name.trim().length > 0;

    const handleSave = async () => {
        if (!canSave) return;
        setSaving(true);
        try {
            await dispatch(fetchUpdateHashtag({ id: hashtagId, data: { name: form.name.trim() } })).unwrap();
            toast.success('Đã cập nhật hashtag');
            await dispatch(fetchAllHashtags()).unwrap();
            onClose();
        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message ?? 'Cập nhật thất bại';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const modal = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="w-full max-w-md mx-4 rounded-2xl bg-gradient-to-b from-[#1e1638] to-[#100d1f] border border-white/10 shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold text-base">Cập nhật Hashtag</h4>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><FiX size={18} /></button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Tên</label>
                        <input value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} className="w-full rounded-xl bg-black/40 border border-white/10 py-2 px-3 text-white text-sm outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">Huỷ</button>
                    <button disabled={!canSave || saving} onClick={handleSave} className={`py-2 px-4 rounded-xl text-white font-semibold ${!canSave || saving ? "bg-primary/30" : "bg-primary hover:bg-primary/90"}`}>{saving ? "Đang lưu..." : "Lưu"}</button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
