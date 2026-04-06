import  { useEffect } from "react";
import { MdAddCircle, MdTrendingUp, MdVisibility, MdEdit, MdDeleteOutline, MdToken, MdDescription, MdRefresh } from "react-icons/md";
import AdminCreateAIPackageModal from "./AdminCreateAIPackageModal";
import AdminEditAIPackageModal from "./AdminEditAIPackageModal";
import AdminViewAIPackageModal from "./AdminViewAIPackageModal";
import AdminDeletePackageConfirmModal from "./AdminDeletePackageConfirmModal";
import AdminToggleStatusConfirmModal from "./AdminToggleStatusConfirmModal";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAIPackages, fetchAIPackageOverview } from "../../../store/aiPackageSlice";

export default function AdminAIPackages() {
    const dispatch = useDispatch<AppDispatch>();
    const { list: packages = [], loading, overview } = useSelector((state: RootState) => state.PACKAGE);

    useEffect(() => {
        dispatch(fetchAIPackages());
        dispatch(fetchAIPackageOverview());
    }, [dispatch]);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
    const [viewingPackageId, setViewingPackageId] = useState<string | null>(null);
    const [deletingPackage, setDeletingPackage] = useState<{ id: string; name: string } | null>(null);
    const [togglingPackage, setTogglingPackage] = useState<{ id: string; name: string; isActive: boolean } | null>(null);

    if (loading?.list) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Quản lý gói AI</h1>
                        <p className="text-slate-400 text-sm">Thiết lập và tùy chỉnh các gói dịch vụ AI dành cho nhà tổ chức sự kiện.</p>
                    </div>
                    <div>
                        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-3 bg-gradient-to-r from-[#8b5cf6] to-[#7c3bed] text-white px-5 py-3 rounded-xl font-bold transition-all shadow-[0_10px_30px_rgba(124,59,237,0.18)]">
                            <MdAddCircle className="text-lg" />
                            Tạo gói mới
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-card rounded-2xl p-8 h-80 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Quản lý gói AI</h1>
                    <p className="text-slate-400 text-sm">Thiết lập và tùy chỉnh các gói dịch vụ AI dành cho nhà tổ chức sự kiện.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => dispatch(fetchAIPackages())}
                        aria-label="reload"
                        className="flex items-center gap-2 bg-[#1a2a3a] hover:bg-[#253545] text-slate-300 px-4 py-3 rounded-xl font-semibold transition-all border border-slate-700/50"
                    >
                        <MdRefresh className="text-lg" />
                        Tải lại
                    </button>
                    <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-3 bg-gradient-to-r from-[#8b5cf6] to-[#7c3bed] text-white px-5 py-3 rounded-xl font-bold transition-all shadow-[0_10px_30px_rgba(124,59,237,0.18)]">
                        <MdAddCircle className="text-lg" />
                        Tạo gói mới
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 p-8 rounded-2xl text-center text-slate-400 bg-[#0B0B12]/30">
                        Chưa có gói nào được tạo
                    </div>
                ) : (
                    packages.map((pkg: any) => (
                        <div key={pkg.id} className="glass-card rounded-2xl flex flex-col transition-all duration-300 hover:border-violet-500/40 relative overflow-hidden group">
                            {/* Top accent bar */}
                            <div className="h-1 bg-gradient-to-r from-violet-600 to-violet-400"></div>
                            
                            {/* Header: Name + Type badge + Toggle */}
                            <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white truncate">{pkg.name}</h3>
                                    <div className="flex items-baseline gap-1.5 mt-2">
                                        <span className="text-2xl font-black text-violet-400">
                                            {pkg.price ? new Intl.NumberFormat('vi-VN').format(pkg.price) : '0'}
                                        </span>
                                        <span className="text-sm text-slate-500">VND/tháng</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                        pkg.type === 'Subscription'
                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}>
                                        {pkg.type === 'Subscription' ? 'Subscription' : 'TopUp'}
                                    </span>
                                    {/* Toggle Status Switch */}
                                    <button
                                        onClick={() => setTogglingPackage({ id: pkg.id, name: pkg.name, isActive: pkg.isActive })}
                                        className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${
                                            pkg.isActive
                                                ? 'bg-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                                                : 'bg-slate-700'
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-[2px] left-[2px] w-[20px] h-[20px] bg-white rounded-full transition-transform duration-300 shadow-md ${
                                                pkg.isActive ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="px-6 pb-4">
                                <div className="flex items-start gap-2.5">
                                    <MdDescription className="text-slate-600 text-sm mt-0.5 shrink-0" />
                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{pkg.description || "Không có mô tả"}</p>
                                </div>
                            </div>

                            {/* Info row: Token Quota */}
                            <div className="px-6 pb-4">
                                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                        <MdToken className="text-violet-400 text-base" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Giới hạn AI</p>
                                        <p className="text-sm font-bold text-white">
                                            {pkg.tokenQuota ? new Intl.NumberFormat('vi-VN').format(pkg.tokenQuota) : '0'} <span className="text-slate-500 font-normal text-xs">nội dung/tháng</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider + Action buttons */}
                            <div className="mt-auto px-6 py-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    {/* View button */}
                                    <button
                                        onClick={() => setViewingPackageId(pkg.id)}
                                        aria-label="view"
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all border border-blue-500/10 hover:border-blue-500/30"
                                    >
                                        <MdVisibility className="text-lg" />
                                    </button>
                                    {/* Edit button */}
                                    <button
                                        onClick={() => setEditingPackageId(pkg.id)}
                                        aria-label="edit"
                                        className="flex-1 h-10 flex items-center justify-center gap-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 transition-all border border-violet-500/10 hover:border-violet-500/30 font-semibold text-sm"
                                    >
                                        <MdEdit className="text-base" />
                                        <span>Edit</span>
                                    </button>
                                    {/* Delete button */}
                                    <button 
                                        onClick={() => setDeletingPackage({ id: pkg.id, name: pkg.name })}
                                        aria-label="delete" 
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/10 hover:border-red-500/30"
                                    >
                                        <MdDeleteOutline className="text-lg" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AdminViewAIPackageModal
                isOpen={!!viewingPackageId}
                packageId={viewingPackageId}
                onClose={() => setViewingPackageId(null)}
            />
            <AdminDeletePackageConfirmModal
                isOpen={!!deletingPackage}
                packageId={deletingPackage?.id ?? null}
                packageName={deletingPackage?.name ?? ""}
                onClose={() => setDeletingPackage(null)}
                onConfirm={() => setDeletingPackage(null)}
            />
            <AdminToggleStatusConfirmModal
                isOpen={!!togglingPackage}
                packageId={togglingPackage?.id ?? null}
                packageName={togglingPackage?.name ?? ""}
                currentStatus={togglingPackage?.isActive ?? false}
                onClose={() => setTogglingPackage(null)}
                onConfirm={() => setTogglingPackage(null)}
            />
            <AdminEditAIPackageModal
                isOpen={!!editingPackageId}
                packageId={editingPackageId}
                onClose={() => setEditingPackageId(null)}
            />
            <AdminCreateAIPackageModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 glass-card rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-violet-600/20 rounded-2xl flex items-center justify-center">
                            <MdTrendingUp className="text-violet-400 text-3xl" />
                        </div>
                        <div>
                            <h4 className="text-slate-400 text-sm uppercase tracking-wider font-bold">Tổng doanh thu gói AI</h4>
                            <p className="text-2xl font-black text-white">
                                {loading.overview ? (
                                    <span className="inline-block w-32 h-8 bg-slate-700/50 rounded animate-pulse" />
                                ) : overview ? (
                                    `${new Intl.NumberFormat('vi-VN').format(overview.totalRevenue.value)} VND`
                                ) : (
                                    '0 VND'
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Tăng trưởng tháng này</p>
                        <p className={`font-bold ${
                            overview?.totalRevenue.isPositiveGrowth ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                            {loading.overview ? (
                                <span className="inline-block w-12 h-6 bg-slate-700/50 rounded animate-pulse" />
                            ) : overview ? (
                                `${overview.totalRevenue.isPositiveGrowth ? '+' : ''}${overview.totalRevenue.monthlyGrowthRate}%`
                            ) : (
                                '+0%'
                            )}
                        </p>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 flex flex-col justify-center text-center">
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Gói hoạt động nhất</h4>
                    {loading.overview ? (
                        <>
                            <span className="inline-block w-32 h-7 bg-slate-700/50 rounded animate-pulse mx-auto mt-1" />
                            <span className="inline-block w-24 h-4 bg-slate-700/50 rounded animate-pulse mx-auto mt-2" />
                        </>
                    ) : (
                        <>
                            <p className="text-xl font-bold text-violet-400">
                                {overview?.mostActivePackage.packageName || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                                {overview?.mostActivePackage.organizationsUsing || 0} tổ chức đang dùng
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}