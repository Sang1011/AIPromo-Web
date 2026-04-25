import { Coins, Crown, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ActiveSubscriptionBanner, { getSubscriptionStatus } from "../../components/Organizer/subcriptions/ActiveSubscriptionBanner";
import PaymentMethodModal from "../../components/Organizer/subcriptions/PaymentMethodModal";
import PlanCard from "../../components/Organizer/subcriptions/PlanCard";
import WalletSection from "../../components/Organizer/subcriptions/WalletSection";
import type { AppDispatch, RootState } from "../../store";
import { fetchAIPackages, fetchMyQuota, fetchPurchasedPackages } from "../../store/aiPackageSlice";
import { fetchWalletUser } from "../../store/walletSlice";
import type { AIPackage } from "../../types/aiPackage/aiPackage";

// ─── Feature lists ────────────────────────────────────────────────────────────


const SUBSCRIPTION_ACCENT: Record<string, "slate" | "amber" | "purple"> = {
    free: "slate",
    pro: "amber",
    business: "purple",
};

const planTierStyle: Record<string, string> = {
    free: "text-slate-400",
    pro: "text-amber-400",
    business: "text-purple-400",
    topup: "text-emerald-400",
    subscription: "text-amber-400",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SubscriptionSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="h-20 rounded-2xl bg-card-dark border border-border-dark" />
            <div className="h-28 rounded-2xl bg-card-dark border border-border-dark" />
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-card-dark border border-border-dark" />
                ))}
            </div>
            <div>
                <div className="h-4 w-40 rounded bg-border-dark mb-4" />
                <div className="grid grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-80 rounded-2xl bg-card-dark border border-border-dark" />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Quota card ───────────────────────────────────────────────────────────────

interface QuotaCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    accent?: string;
}

function QuotaCard({ icon, label, value, sub, accent = "text-white" }: QuotaCardProps) {
    return (
        <div className="bg-card-dark border border-border-dark rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
                {icon}
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
            </div>
            <p className={`text-2xl font-bold mb-1 ${accent}`}>{value}</p>
            {sub && <p className="text-xs text-slate-600">{sub}</p>}
        </div>
    );
}

// ─── Section title ────────────────────────────────────────────────────────────

export function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <p className="text-sm font-semibold text-white">{children}</p>
            <div className="flex-1 h-px bg-border-dark" />
        </div>
    );
}

// ─── TopUp chip ───────────────────────────────────────────────────────────────

interface TopUpChipProps {
    plan: AIPackage;
    onSelect: (plan: AIPackage) => void;
}

function TopUpChip({ plan, onSelect }: TopUpChipProps) {
    return (
        <button
            onClick={() => onSelect(plan)}
            className="group flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border border-emerald-400/15 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-400/30 transition-all duration-200"
        >
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
                <Coins size={16} className="text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white">{plan.name}</p>
            <div className="flex items-center gap-1">
                <Zap size={11} className="text-amber-400" />
                <span className="text-xs text-slate-400">{plan.tokenQuota.toLocaleString("vi-VN")} tokens</span>
            </div>
            <p className="text-base font-bold text-emerald-400">
                {plan.price.toLocaleString("vi-VN")} ₫
            </p>
        </button>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [pendingPlan, setPendingPlan] = useState<AIPackage | null>(null);

    const { list: packages, quota, purchasedPackages, loading } = useSelector(
        (state: RootState) => state.PACKAGE
    );

    useEffect(() => {
        dispatch(fetchAIPackages());
        dispatch(fetchMyQuota());
        dispatch(fetchPurchasedPackages());
        dispatch(fetchWalletUser(5));
    }, [dispatch]);

    const isLoadingAll = loading.list && loading.quota && loading.purchased;

    // ── Split packages by type ─────────────────────────────────────────────────
    const topUpPackages = useMemo(
        () => packages.filter((p) => p.type === "TopUp" && p.isActive),
        [packages]
    );

    const subscriptionPackages = useMemo(
        () => packages.filter((p) => p.type === "Subscription" && p.isActive && p.price > 0).sort((a, b) => a.price - b.price),
        [packages]
    );

    // ── Active subscription (most recent Subscription pkg still within 30d) ────
    const activeSubscriptionPkg = useMemo(() => {
        if (!purchasedPackages?.length) return null;
        const subPurchased = purchasedPackages.filter(
            (p) => p?.type === "Subscription" && p?.lastPurchasedAt
        );
        if (!subPurchased.length) return null;
        const latest = subPurchased.reduce((a, b) =>
            new Date(a.lastPurchasedAt) > new Date(b.lastPurchasedAt) ? a : b
        );
        if (!latest?.lastPurchasedAt) return null;
        const status = getSubscriptionStatus(latest.lastPurchasedAt);
        return status !== "expired" ? latest : null;
    }, [purchasedPackages]);

    const currentSubscriptionType = activeSubscriptionPkg?.name?.toLowerCase() ?? "";

    const isCurrentSubscription = (plan: AIPackage) =>
        activeSubscriptionPkg !== null &&
        plan.name.toLowerCase() === currentSubscriptionType;

    const handleSelectPlan = (plan: AIPackage) => setPendingPlan(plan);
    const handleUpgrade = () =>
        document.getElementById("subscription-section")?.scrollIntoView({ behavior: "smooth" });

    if (isLoadingAll)
        return (
            <div className="min-h-screen bg-background-dark px-8 py-8">
                <div className="max-w-5xl mx-auto">
                    <SubscriptionSkeleton />
                </div>
            </div>
        );
    const handleBack = () => {
        navigate("/organizer/my-events");
    };

    return (
        <>
            <div className="min-h-screen bg-background-dark px-8 py-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* ── Heading ── */}
                    <div>
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition mb-5 group"
                        >
                            <FiArrowLeft className="text-base group-hover:-translate-x-0.5 transition-transform" />
                            Trở về
                        </button>
                        <div className="flex items-center gap-2.5 mb-1">
                            <Crown size={20} className="text-amber-400" />
                            <h1 className="text-2xl font-bold text-white">Subscription</h1>
                        </div>
                        <p className="text-sm text-text-muted">
                            Quản lý gói, theo dõi quyền lợi và lịch sử thanh toán
                        </p>
                    </div>

                    {/* ── Active subscription banner (only if has active sub) ── */}
                    {activeSubscriptionPkg && (
                        <ActiveSubscriptionBanner
                            pkg={activeSubscriptionPkg}
                            onUpgrade={handleUpgrade}
                        />
                    )}

                    {/* ── Wallet ── */}
                    <WalletSection />

                    {/* ── Quota cards ── */}
                    {quota && (
                        <div className="grid grid-cols-3 gap-4">
                            <QuotaCard
                                icon={<Zap size={15} className="text-amber-400" />}
                                label="Token còn lại từ gói"
                                value={quota.subscriptionTokens.toLocaleString("vi-VN")}
                                sub="Từ gói đăng ký hiện tại"
                                accent="text-amber-400"
                            />
                            <QuotaCard
                                icon={<Zap size={15} className="text-purple-400" />}
                                label="Token nạp thêm"
                                value={quota.topUpTokens.toLocaleString("vi-VN")}
                                sub="Top-up thủ công"
                                accent="text-purple-400"
                            />
                            <QuotaCard
                                icon={<Zap size={15} className="text-emerald-400" />}
                                label="Tổng token còn lại"
                                value={quota.totalTokens.toLocaleString("vi-VN")}
                                sub="Subscription + Top-up"
                                accent="text-emerald-400"
                            />
                        </div>
                    )}
                    {loading.quota && !quota && (
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 rounded-2xl bg-card-dark border border-border-dark animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* ── TopUp packages ── */}
                    {topUpPackages.length > 0 && (
                        <div>
                            <SectionTitle>Nạp token lẻ</SectionTitle>
                            <p className="text-xs text-slate-500 mb-4 -mt-2">
                                Mua thêm token một lần, không cần đăng ký gói tháng
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {topUpPackages
                                    .sort((a, b) => a.price - b.price)
                                    .map((plan) => (
                                        <TopUpChip
                                            key={plan.id}
                                            plan={plan}
                                            onSelect={handleSelectPlan}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* ── Subscription packages ── */}
                    {subscriptionPackages.length > 0 && (
                        <div id="subscription-section">
                            <SectionTitle>Gói đăng ký hàng tháng</SectionTitle>
                            <div className="grid grid-cols-3 gap-5">
                                {loading.list ? (
                                    [1, 2, 3].map((i) => (
                                        <div key={i} className="h-80 rounded-2xl bg-card-dark border border-border-dark animate-pulse" />
                                    ))
                                ) : (
                                    subscriptionPackages.map((plan) => (
                                        <PlanCard
                                            key={plan.id}
                                            plan={plan}
                                            isCurrentPlan={isCurrentSubscription(plan)}
                                            accentColor={SUBSCRIPTION_ACCENT[plan.name.toLowerCase()] ?? "slate"}
                                            onSelect={handleSelectPlan}
                                            isLocked={activeSubscriptionPkg !== null && !isCurrentSubscription(plan)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── History table (from purchasedPackages) ── */}
                    {!loading.purchased && purchasedPackages.length > 0 && (
                        <div>
                            <SectionTitle>Lịch sử mua gói</SectionTitle>
                            <div className="rounded-2xl border border-border-dark overflow-hidden bg-card-dark">
                                <div className="px-6 py-4 border-b border-border-dark flex items-center justify-between">
                                    <p className="text-sm font-semibold text-white">Lịch sử</p>
                                    <span className="text-xs text-slate-400">{purchasedPackages.length} gói đã mua</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border-dark bg-surface-dark">
                                                {["Gói", "Loại", "Số lần mua", "Tổng token", "Token / gói", "Lần mua gần nhất"].map((h) => (
                                                    <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-dark">
                                            {purchasedPackages.map((pkg) => (
                                                <tr key={pkg.packageId} className="hover:bg-surface-dark/50 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <span className={`text-sm font-semibold ${planTierStyle[pkg.type?.toLowerCase()] ?? "text-white"}`}>
                                                            {pkg.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border
                                                            ${pkg.type === "TopUp"
                                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-400/25"
                                                                : "bg-amber-500/10 text-amber-400 border-amber-400/25"
                                                            }`}>
                                                            {pkg.type === "TopUp" ? "Token lẻ" : "Subscription"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-white tabular-nums">
                                                        {pkg.purchaseCount}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-white tabular-nums">
                                                        {pkg.totalPurchasedTokens.toLocaleString("vi-VN")}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-slate-300 tabular-nums">
                                                        {pkg.tokenQuota.toLocaleString("vi-VN")}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs text-slate-300">
                                                        {pkg.lastPurchasedAt
                                                            ? new Date(pkg.lastPurchasedAt).toLocaleString("vi-VN", {
                                                                timeZone: "Asia/Ho_Chi_Minh",
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })
                                                            : "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {pendingPlan && (
                <PaymentMethodModal
                    plan={pendingPlan}
                    onClose={() => setPendingPlan(null)}
                />
            )}
        </>
    );
}