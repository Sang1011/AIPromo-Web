import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MdSave } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { createAIPackage, fetchAIPackages } from "../../../store/aiPackageSlice";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminCreateAIPackageModal({ isOpen, onClose }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((s: RootState) => s.PACKAGE);
    const creating = loading?.create;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("Subscription");
    const [price, setPrice] = useState<number | undefined>(undefined);
    const [tokenQuota, setTokenQuota] = useState<number | undefined>(undefined);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setDescription("");
            setType("Subscription");
            setPrice(undefined);
            setTokenQuota(undefined);
            setIsActive(true);
        }
    }, [isOpen]);

    const priceLabel = type === "Subscription" ? "Giá gói (VND/tháng)" : "Giá gói (VND)";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            name,
            description,
            type,
            price: price ?? 0,
            tokenQuota: tokenQuota ?? 0,
            isActive,
        };

        const result = await dispatch(createAIPackage(payload));
        // @ts-ignore
        if (result?.meta?.requestStatus === "fulfilled") {
            // refresh list
            dispatch(fetchAIPackages());
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="glass-panel neon-border relative w-full max-w-2xl rounded-2xl shadow-2xl max-h-[95vh] flex flex-col">
                <div className="px-8 py-6 border-b border-violet-500/20 flex justify-between items-center bg-violet-600/5">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <MdSave className="text-violet-400" /> Tạo gói AI mới
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Thiết lập thông số và tính năng cho gói dịch vụ AI của bạn</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 flex-1 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Tên gói dịch vụ</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-slate-900/50 border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-violet-500/50 outline-none" placeholder="VD: Gói Business Premium" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2">{priceLabel}</label>
                            <div className="relative">
                                <input value={price ?? ''} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : undefined)} type="number" className="w-full bg-slate-900/50 border-slate-700 rounded-lg pl-4 pr-16 py-2.5 text-slate-100 focus:ring-2 focus:ring-violet-500/50 outline-none" placeholder="2000000" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">VND</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-300 block mb-2">Số lượng nội dung AI tối đa (mỗi tháng)</label>
                        <input value={tokenQuota ?? ''} onChange={(e) => setTokenQuota(e.target.value ? Number(e.target.value) : undefined)} type="number" className="w-full bg-slate-900/50 border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-violet-500/50 outline-none" placeholder="500" />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-300 block mb-2">Mô tả gói</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-slate-900/50 border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-violet-500/50 outline-none" placeholder="Nhập mô tả chi tiết về lợi ích và mục tiêu của gói này..." />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-300 block mb-2">Loại gói</label>
                        <div className="relative">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full appearance-none bg-slate-900/50 border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-violet-500/50 outline-none cursor-pointer pr-10"
                            >
                                <option value="Subscription" className="bg-slate-800 text-white">Subscription</option>
                                <option value="TopUp" className="bg-slate-800 text-white">TopUp</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400">
                                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-violet-600/10 border border-violet-500/20 rounded-xl">
                        <div>
                            <p className="text-sm font-bold text-white leading-none">Trạng thái kích hoạt</p>
                            <p className="text-xs text-slate-400 mt-1">Kích hoạt để người dùng có thể thấy gói này ngay lập tức</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" type="checkbox" />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer-checked:bg-violet-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                    </div>

                    <div className="flex justify-end items-center gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white">Hủy bỏ</button>
                        <button type="submit" disabled={creating} className="neon-button bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2">
                            <MdSave /> {creating ? "Đang lưu..." : "Lưu gói mới"}
                        </button>
                    </div>
                    {error && <p className="text-sm text-red-400 pt-2">{error}</p>}
                </form>
            </div>
        </div>,
        document.body
    );
}
