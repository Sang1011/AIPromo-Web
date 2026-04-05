import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { MdSave, MdAutoAwesome } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAIPackageById, updateAIPackage, fetchAIPackages } from "../../../store/aiPackageSlice";

interface Props {
    isOpen: boolean;
    packageId: string | null;
    onClose: () => void;
}

export default function AdminEditAIPackageModal({ isOpen, packageId, onClose }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, detail, error } = useSelector((s: RootState) => s.PACKAGE);
    const updating = loading?.update;
    const fetchingDetail = loading?.detail;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("Subscription");
    const [price, setPrice] = useState<number | undefined>(undefined);
    const [tokenQuota, setTokenQuota] = useState<number | undefined>(undefined);
    const [isActive, setIsActive] = useState(true);

    // Store original values for comparison
    const [originalValues, setOriginalValues] = useState<{
        name: string;
        description: string;
        type: string;
        price: number | undefined;
        tokenQuota: number | undefined;
    } | null>(null);

    // Fetch package detail when modal opens
    useEffect(() => {
        if (isOpen && packageId) {
            dispatch(fetchAIPackageById(packageId));
        }
    }, [isOpen, packageId, dispatch]);

    // Populate form when detail is loaded
    useEffect(() => {
        if (detail && isOpen) {
            const nameVal = detail.name || "";
            const descVal = detail.description || "";
            const typeVal = detail.type || "Subscription";
            const priceVal = detail.price;
            const quotaVal = detail.tokenQuota;
            const activeVal = detail.isActive ?? true;

            setName(nameVal);
            setDescription(descVal);
            setType(typeVal);
            setPrice(priceVal);
            setTokenQuota(quotaVal);
            setIsActive(activeVal);

            setOriginalValues({
                name: nameVal,
                description: descVal,
                type: typeVal,
                price: priceVal,
                tokenQuota: quotaVal,
            });
        }
    }, [detail, isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setName("");
            setDescription("");
            setType("Subscription");
            setPrice(undefined);
            setTokenQuota(undefined);
            setIsActive(true);
            setOriginalValues(null);
        }
    }, [isOpen]);

    // Check if any field has changed
    const hasChanges = useMemo(() => {
        if (!originalValues) return false;
        return (
            name !== originalValues.name ||
            description !== originalValues.description ||
            type !== originalValues.type ||
            price !== originalValues.price ||
            tokenQuota !== originalValues.tokenQuota
        );
    }, [name, description, type, price, tokenQuota, originalValues]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!packageId) return;

        const payload: any = {
            name,
            description,
            type,
            price: price ?? 0,
            tokenQuota: tokenQuota ?? 0,
            isActive,
        };

        const result = await dispatch(updateAIPackage({ id: packageId, payload }));
        // @ts-ignore
        if (result?.meta?.requestStatus === "fulfilled") {
            dispatch(fetchAIPackages());
            onClose();
        }
    };

    if (!isOpen || !packageId) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="glass-panel neon-border relative w-full max-w-2xl rounded-2xl shadow-2xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-violet-500/20 flex justify-between items-center bg-gradient-to-r from-violet-600/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                            <MdAutoAwesome className="text-white text-lg" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Chỉnh sửa gói AI</h2>
                            <p className="text-xs text-slate-400 font-medium">Cập nhật thông số và tính năng cho gói dịch vụ</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                {/* Form Body */}
                {fetchingDetail ? (
                    <div className="p-8 flex items-center justify-center min-h-[300px]">
                        <div className="text-slate-400">Đang tải dữ liệu...</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 flex-1 overflow-y-auto space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-semibold text-slate-300 block mb-2">Tên gói dịch vụ</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-slate-900/50 border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-violet-500/50 outline-none"
                                    placeholder="VD: Gói Business Premium"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-300 block mb-2">Giá gói (VND/tháng)</label>
                                <div className="relative">
                                    <input
                                        value={price ?? ""}
                                        onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : undefined)}
                                        type="number"
                                        className="w-full bg-slate-900/50 border-slate-700 rounded-lg pl-4 pr-16 py-2.5 text-slate-100 focus:ring-2 focus:ring-violet-500/50 outline-none"
                                        placeholder="2000000"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">VND</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Số lượng nội dung AI tối đa (mỗi tháng)</label>
                            <div className="relative">
                                <input
                                    value={tokenQuota ?? ""}
                                    onChange={(e) => setTokenQuota(e.target.value ? Number(e.target.value) : undefined)}
                                    type="number"
                                    className="w-full bg-slate-900/50 border-slate-700 rounded-lg pl-4 pr-12 py-2.5 text-slate-100 focus:ring-2 focus:ring-violet-500/50 outline-none"
                                    placeholder="500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Mô tả gói</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-slate-900/50 border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-violet-500/50 outline-none"
                                placeholder="Nhập mô tả chi tiết về lợi ích và mục tiêu của gói này..."
                            />
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

                        {/* Footer Actions */}
                        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-700/50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={updating || !hasChanges}
                                className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${
                                    hasChanges
                                        ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20"
                                        : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                                }`}
                            >
                                <MdSave /> {updating ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                        {error && <p className="text-sm text-red-400 pt-2">{error}</p>}
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
}
