import { useEffect } from "react";
import { createPortal } from "react-dom";
import { MdAutoAwesome, MdAttachMoney, MdToken, MdDescription, MdCategory, MdCheckCircle, MdInfo } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAIPackageById } from "../../../store/aiPackageSlice";

interface Props {
    isOpen: boolean;
    packageId: string | null;
    onClose: () => void;
}

export default function AdminViewAIPackageModal({ isOpen, packageId, onClose }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, detail, error } = useSelector((s: RootState) => s.PACKAGE);
    const fetchingDetail = loading?.detail;

    useEffect(() => {
        if (isOpen && packageId) {
            dispatch(fetchAIPackageById(packageId));
        }
    }, [isOpen, packageId, dispatch]);

    if (!isOpen || !packageId) return null;

    const formatCurrency = (amount: number | undefined) => {
        if (!amount && amount !== 0) return "0";
        return new Intl.NumberFormat("vi-VN").format(amount);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="glass-panel neon-border relative w-full max-w-2xl rounded-2xl shadow-2xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-violet-500/20 bg-gradient-to-r from-violet-600/10 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                                <MdAutoAwesome className="text-white text-lg" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Chi tiết gói AI</h2>
                                <p className="text-xs text-slate-400 font-medium">Thông tin chi tiết về gói dịch vụ</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
                    </div>
                </div>

                {/* Content */}
                {fetchingDetail ? (
                    <div className="p-8 flex items-center justify-center min-h-[300px]">
                        <div className="text-slate-400 animate-pulse">Đang tải dữ liệu...</div>
                    </div>
                ) : detail ? (
                    <div className="p-8 flex-1 overflow-y-auto space-y-6">
                        {/* Package Name Banner */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600/20 via-violet-600/10 to-transparent border border-violet-500/20 p-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-transparent"></div>
                            <div className="relative flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-violet-600/30 border-2 border-violet-500/50 flex items-center justify-center">
                                    <MdInfo className="text-violet-400 text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">{detail.name}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Price */}
                            <div className="group p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-violet-500/30 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <MdAttachMoney className="text-emerald-400 text-xl" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá gói</span>
                                </div>
                                <p className="text-xl font-black text-white">
                                    {formatCurrency(detail.price)}
                                    <span className="text-sm font-medium text-slate-500 ml-1">VND/tháng</span>
                                </p>
                            </div>

                            {/* Token Quota */}
                            <div className="group p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-violet-500/30 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <MdToken className="text-blue-400 text-xl" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Giới hạn AI</span>
                                </div>
                                <p className="text-xl font-black text-white">
                                    {formatCurrency(detail.tokenQuota)}
                                    <span className="text-sm font-medium text-slate-500 ml-1">nội dung/tháng</span>
                                </p>
                            </div>

                            {/* Type */}
                            <div className="group p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-violet-500/30 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <MdCategory className="text-amber-400 text-xl" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại gói</span>
                                </div>
                                <p className="text-lg font-bold text-white">
                                    {detail.type === "Subscription" ? "Subscription" : "TopUp"}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="group p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-violet-500/30 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${detail.isActive ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                                        <MdCheckCircle className={`text-xl ${detail.isActive ? "text-emerald-400" : "text-red-400"}`} />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</span>
                                </div>
                                <p className={`text-lg font-bold ${detail.isActive ? "text-emerald-400" : "text-red-400"}`}>
                                    {detail.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="group p-5 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-violet-500/30 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                    <MdDescription className="text-violet-400 text-xl" />
                                </div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mô tả gói</span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {detail.description || <span className="text-slate-600 italic">Không có mô tả</span>}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                            <p className="text-slate-400">Không tìm thấy dữ liệu gói</p>
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
