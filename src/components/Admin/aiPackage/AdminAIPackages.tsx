import { useEffect, useState } from "react";
import { MdAddCircle, MdRefresh, MdTrendingUp } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAIPackages, fetchAIPackageOverview } from "../../../store/aiPackageSlice";
import type { AIPackage } from "../../../types/aiPackage/aiPackage";
import AdminCreateAIPackageModal from "./AdminCreateAIPackageModal";
import AdminDeletePackageConfirmModal from "./AdminDeletePackageConfirmModal";
import AdminEditAIPackageModal from "./AdminEditAIPackageModal";
import AdminPlanCard from "./AdminPlanCard";
import AdminToggleStatusConfirmModal from "./AdminToggleStatusConfirmModal";
import AdminViewAIPackageModal from "./AdminViewAIPackageModal";
import { SectionTitle } from "../../../pages/Organizer/SubscriptionPage";

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

    const subscriptionPackages = packages.filter(
        (pkg: AIPackage) => pkg.type === "Subscription"
    );

    const topUpPackages = packages.filter(
        (pkg: AIPackage) => pkg.type === "TopUp"
    );

    const renderPackageGrid = (list: AIPackage[], emptyText: string) => {
        if (list.length === 0) {
            return (
                <div className="p-8 rounded-2xl text-center text-slate-400 bg-[#0B0B12]/30 border border-white/5">
                    {emptyText}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {list.map((pkg: AIPackage) => (
                    <AdminPlanCard
                        key={pkg.id}
                        pkg={pkg}
                        onView={setViewingPackageId}
                        onEdit={setEditingPackageId}
                        onDelete={setDeletingPackage}
                        onToggle={setTogglingPackage}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8">
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

            <div className="space-y-10">
                {/* Subscription */}
                <div>
                    <SectionTitle>Subscription Plans</SectionTitle>
                    {renderPackageGrid(subscriptionPackages, "Chưa có gói subscription nào được tạo")}
                </div>

                {/* TopUp */}
                <div>
                    <SectionTitle>TopUp Packages</SectionTitle>
                    {renderPackageGrid(topUpPackages, "Chưa có gói top-up nào được tạo")}
                </div>
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

            
        </div>
    );
}