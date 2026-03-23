import { useState, useRef, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { fetchCreateCategory, fetchAllCategories } from "../../../store/categorySlice";
import toast from "react-hot-toast";

export default function AdminCreateCategoryModal({ onClose }: { onClose: () => void }) {
    const dispatch = useDispatch<AppDispatch>();
    const [form, setForm] = useState({ code: "", name: "", description: "" });
    const [creating, setCreating] = useState(false);

    const CATEGORY_OPTIONS = [
        { code: "TECH", label: "Công nghệ", gradient: "linear-gradient(90deg,#8b5cf6,#6366f1)" },
        { code: "MUSIC", label: "Âm nhạc", gradient: "linear-gradient(90deg,#ec4899,#f43f5e)" },
        { code: "WORKSHOP", label: "Workshop", gradient: "linear-gradient(90deg,#f59e0b,#f97316)" },
        { code: "ART", label: "Nghệ thuật", gradient: "linear-gradient(90deg,#a855f7,#8b5cf6)" },
        { code: "FINANCE", label: "Tài chính", gradient: "linear-gradient(90deg,#10b981,#14b8a6)" },
        { code: "OTHER", label: "Khác", gradient: "linear-gradient(90deg,#64748b,#94a3b8)" },
    ];

    const [openDropdown, setOpenDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(e.target as Node)) setOpenDropdown(false);
        };
        if (openDropdown) document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [openDropdown]);

    const canSave = form.code.trim().length > 0 && form.name.trim().length > 0;

    const handleCreate = async () => {
        if (!canSave) return;
        setCreating(true);
        try {
            await dispatch(fetchCreateCategory({ code: form.code.trim(), name: form.name.trim(), description: form.description.trim() } as any)).unwrap();
            toast.success("Tạo category thành công");
            await dispatch(fetchAllCategories({})).unwrap();
            onClose();
        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message ?? "Tạo thất bại";
            toast.error(msg);
        } finally {
            setCreating(false);
        }
    };

    const modal = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="w-full max-w-md mx-4 rounded-2xl bg-gradient-to-b from-[#1e1638] to-[#100d1f] border border-white/10 shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold text-base">Tạo Category mới</h4>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><FiX size={18} /></button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Mã (code)</label>
                        <div className="relative" ref={dropdownRef}>
                            <button type="button" onClick={() => setOpenDropdown(v => !v)} className="w-full flex items-center justify-between gap-3 rounded-xl bg-black/40 border border-white/10 py-2 px-3 text-white text-sm outline-none focus:ring-1 focus:ring-primary">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-8 rounded-md border border-white/10 flex items-center justify-center" style={{ background: form.code ? (CATEGORY_OPTIONS.find(c => c.code === form.code)?.gradient ?? 'transparent') : 'transparent' }} />
                                    <div className="text-left">
                                        <div className="text-sm font-medium">{form.code ? `${form.code} — ${CATEGORY_OPTIONS.find(c => c.code === form.code)?.label}` : '-- Chọn mã --'}</div>
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#a592c8]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7"/></svg>
                            </button>

                            {openDropdown && (
                                <div className="absolute left-0 w-full mt-2 rounded-xl bg-[#100d1f] border border-white/10 shadow-xl z-50 py-2">
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <button key={opt.code} onClick={() => { setForm(s => ({ ...s, code: opt.code })); setOpenDropdown(false); }} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-3">
                                            <div className="w-8 h-7 rounded-md border border-white/10" style={{ background: opt.gradient }} />
                                            <div className="text-sm">{opt.code} — {opt.label}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Tên</label>
                        <input value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} className="w-full rounded-xl bg-black/40 border border-white/10 py-2 px-3 text-white text-sm outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Mô tả</label>
                        <textarea value={form.description} onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))} className="w-full rounded-xl bg-black/40 border border-white/10 py-2 px-3 text-white text-sm outline-none focus:ring-1 focus:ring-primary" rows={4} />
                    </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">Huỷ</button>
                    <button disabled={!canSave || creating} onClick={handleCreate} className={`py-2 px-4 rounded-xl text-white font-semibold ${!canSave || creating ? "bg-primary/30" : "bg-primary hover:bg-primary/90"}`}>{creating ? "Đang tạo..." : "Tạo"}</button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
