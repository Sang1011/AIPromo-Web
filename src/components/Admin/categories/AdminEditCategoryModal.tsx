import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchCategoryById, fetchUpdateCategory, fetchAllCategories } from "../../../store/categorySlice";
import type { Category } from "../../../types/category/category";

interface AdminEditCategoryModalProps {
    categoryId: number;
    onClose: () => void;
}

export default function AdminEditCategoryModal({ categoryId, onClose }: AdminEditCategoryModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const current = useSelector((s: RootState) => s.CATEGORY.currentCategory) as Category | null;
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<{ code: string; name: string; description: string; isActive: boolean }>({ code: "", name: "", description: "", isActive: false });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                await dispatch(fetchCategoryById(categoryId)).unwrap();
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [categoryId]);

    useEffect(() => {
        if (current) {
            setForm({ code: current.code, name: current.name, description: current.description, isActive: current.isActive });
        }
    }, [current]);

    const isDirty = () => {
        if (!current) return false;
        return form.code !== current.code || form.name !== current.name || form.description !== current.description;
    };

    const handleSave = async () => {
        if (!isDirty()) return;
        setSaving(true);
        try {
            await dispatch(fetchUpdateCategory({ id: categoryId, data: { code: form.code, name: form.name, description: form.description } })).unwrap();
            toast.success("Cập nhật category thành công");
            await dispatch(fetchAllCategories({})).unwrap();
            onClose();
        } catch (e) {
            console.error(e);
            const msg = (e as any)?.response?.data?.detail ?? (e as any)?.message ?? "Cập nhật thất bại";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const modal = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="w-full max-w-2xl mx-4 rounded-2xl bg-gradient-to-b from-[#1e1638] to-[#100d1f] border border-white/10 shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold text-base">Cập nhật Category</h4>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><FiX size={18} /></button>
                </div>

                {loading ? (
                    <p className="text-sm text-[#a592c8]">Đang tải chi tiết...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Mã (code)</label>
                            <input value={form.code} onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))} className="w-full rounded-xl bg-black/40 border border-white/10 py-2 px-3 text-white text-sm outline-none focus:ring-1 focus:ring-primary" />
                        </div>

                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Tên</label>
                            <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="w-full rounded-xl bg-black/40 border border-white/10 py-2 px-3 text-white text-sm outline-none focus:ring-1 focus:ring-primary" />
                        </div>

                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Mô tả</label>
                            <textarea value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} className="w-full rounded-xl bg-black/40 border border-white/10 py-2 px-3 text-white text-sm outline-none focus:ring-1 focus:ring-primary" rows={4} />
                        </div>
                    </div>
                )}

                <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">Huỷ</button>
                    <button disabled={!isDirty() || saving} onClick={handleSave} className={`py-2 px-4 rounded-xl text-white font-semibold ${!isDirty() || saving ? "bg-primary/30" : "bg-primary hover:bg-primary/90"}`}>{saving ? "Đang lưu..." : "Cập nhật"}</button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
