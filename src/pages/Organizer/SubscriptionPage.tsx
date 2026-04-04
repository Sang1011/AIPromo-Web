import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Crown, Zap, FileText } from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";
import type { AIPackage } from "../../types/aiPackage";
import type { ActiveSubscription } from "../../components/Organizer/subcriptions/ActiveSubscriptionBanner";
import type { AppDispatch, RootState } from "../../store";
import ActiveSubscriptionBanner from "../../components/Organizer/subcriptions/ActiveSubscriptionBanner";
import PlanCard, { type PlanFeature } from "../../components/Organizer/subcriptions/PlanCard";
import { fetchAIPackages, fetchMyQuota, fetchPurchasedPackages } from "../../store/aiPackageSlice";

// ─── Feature lists per plan type ─────────────────────────────────────────────
const PLAN_FEATURES: Record<string, PlanFeature[]> = {
    free: [
        { label: "3 sự kiện / tháng", included: true },
        { label: "Dashboard cơ bản", included: true },
        { label: "Marketing tools", included: false },
        { label: "Xuất báo cáo PDF/Excel", included: false },
        { label: "Hỗ trợ ưu tiên 24/7", included: false },
    ],
    pro: [
        { label: "50 sự kiện / tháng", included: true },
        { label: "Dashboard nâng cao", included: true },
        { label: "Marketing tools", included: true },
        { label: "Xuất báo cáo PDF/Excel", included: true },
        { label: "Hỗ trợ ưu tiên 24/7", included: false },
    ],
    business: [
        { label: "Không giới hạn sự kiện", included: true },
        { label: "Dashboard nâng cao", included: true },
        { label: "Marketing tools + API", included: true },
        { label: "Xuất báo cáo PDF/Excel", included: true },
        { label: "Hỗ trợ ưu tiên 24/7", included: true },
    ],
};

const PLAN_ACCENT: Record<string, "slate" | "amber" | "purple"> = {
    free: "slate",
    pro: "amber",
    business: "purple",
};

const PLAN_FEATURED_LABEL: Record<string, string | undefined> = {
    pro: "Phổ biến nhất",
};

const planTierStyle: Record<string, string> = {
    free: "text-slate-400",
    pro: "text-amber-400",
    business: "text-purple-400",
};

const statusConfig: Record<string, { label: string; className: string }> = {
    success: {
        label: "Thành công",
        className: "bg-emerald-500/10 text-emerald-400 border border-emerald-400/25",
    },
    expired: {
        label: "Đã hết hạn",
        className: "bg-slate-800 text-slate-500 border border-slate-700",
    },
    pending: {
        label: "Chờ xử lý",
        className: "bg-amber-500/10 text-amber-400 border border-amber-400/25",
    },
    failed: {
        label: "Thất bại",
        className: "bg-red-500/10 text-red-400 border border-red-400/25",
    },
};

const MOCK_HISTORY = [
    {
        id: "1",
        transactionCode: "SUB-20250415",
        planName: "Pro",
        planTier: "pro",
        periodStart: "15/04/2025",
        periodEnd: "15/07/2025",
        amount: 399000,
        purchasedAt: "15/04/2025",
        status: "success",
    },
    {
        id: "2",
        transactionCode: "SUB-20250115",
        planName: "Pro",
        planTier: "pro",
        periodStart: "15/01/2025",
        periodEnd: "15/04/2025",
        amount: 399000,
        purchasedAt: "15/01/2025",
        status: "expired",
    },
    {
        id: "3",
        transactionCode: "SUB-20241015",
        planName: "Free",
        planTier: "free",
        periodStart: "15/10/2024",
        periodEnd: "15/01/2025",
        amount: 0,
        purchasedAt: "15/10/2024",
        status: "expired",
    },
    {
        id: "4",
        transactionCode: "SUB-20250716",
        planName: "Business",
        planTier: "business",
        periodStart: "16/07/2025",
        periodEnd: "16/08/2025",
        amount: 999000,
        purchasedAt: "—",
        status: "pending",
    },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SubscriptionSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Banner skeleton */}
            <div className="h-20 rounded-2xl bg-card-dark border border-border-dark" />

            {/* Quota skeleton */}
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-card-dark border border-border-dark" />
                ))}
            </div>

            {/* Plan cards skeleton */}
            <div>
                <div className="h-4 w-40 rounded bg-border-dark mb-4" />
                <div className="grid grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-80 rounded-2xl bg-card-dark border border-border-dark" />
                    ))}
                </div>
            </div>

            {/* Table skeleton */}
            <div>
                <div className="h-4 w-40 rounded bg-border-dark mb-4" />
                <div className="rounded-2xl border border-border-dark overflow-hidden bg-card-dark">
                    <div className="px-6 py-4 border-b border-border-dark h-14" />
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="px-6 py-4 border-b border-border-dark last:border-0">
                            <div className="h-4 rounded bg-border-dark w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Quota cards ──────────────────────────────────────────────────────────────
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { list: packages, quota, purchasedPackages, loading } = useSelector(
        (state: RootState) => state.PACKAGE
    );

    useEffect(() => {
        dispatch(fetchAIPackages());
        dispatch(fetchMyQuota());
        dispatch(fetchPurchasedPackages());
    }, [dispatch]);

    const isLoadingAll = loading.list && loading.quota && loading.purchased;

    // Derive current plan from purchasedPackages (most recent active)
    const currentPkg = purchasedPackages[0];
    const currentPlanType = currentPkg?.type?.toLowerCase() ?? "free";

    const activeSub: ActiveSubscription = {
        planName: currentPkg?.name ?? "Free",
        planTier: (currentPlanType as "free" | "pro" | "business") ?? "free",
        expiresAt: currentPkg?.lastPurchasedAt
            ? new Date(currentPkg.lastPurchasedAt).toLocaleDateString("vi-VN")
            : "—",
        isAutoRenew: false,
        status: "active",
    };

    const handleSelectPlan = (plan: AIPackage) => {
        console.log("Selected plan:", plan);
    };

    const handleUpgrade = () => {
        document.getElementById("plan-section")?.scrollIntoView({ behavior: "smooth" });
    };

    const isCurrentPlan = (plan: AIPackage) =>
        plan.type.toLowerCase() === currentPlanType;

    if (isLoadingAll) return (
        <div className="min-h-screen bg-background-dark px-8 py-8">
            <div className="max-w-5xl mx-auto">
                <SubscriptionSkeleton />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-dark px-8 py-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* ── Heading ── */}
                <div>
                    <button
                        onClick={() => navigate(-1)}
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

                {/* ── Active banner ── */}
                <ActiveSubscriptionBanner
                    subscription={activeSub}
                    onUpgrade={handleUpgrade}
                    onManage={() => { }}
                />

                {/* ── Quota cards ── */}
                {quota && (
                    <div className="grid grid-cols-3 gap-4">
                        <QuotaCard
                            icon={<Zap size={15} className="text-amber-400" />}
                            label="Token subscription"
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
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 rounded-2xl bg-card-dark border border-border-dark animate-pulse" />
                        ))}
                    </div>
                )}

                {/* ── Plan cards ── */}
                <div id="plan-section">
                    <SectionTitle>Chọn gói phù hợp</SectionTitle>
                    {loading.list ? (
                        <div className="grid grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-80 rounded-2xl bg-card-dark border border-border-dark animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-5">
                            {packages
                                .filter((plan) => plan.isActive && plan.price > 0)
                                .sort((a, b) => a.price - b.price)
                                .map((plan) => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        features={PLAN_FEATURES[plan.type.toLowerCase()] ?? []}
                                        isCurrentPlan={isCurrentPlan(plan)}
                                        isFeatured={!!PLAN_FEATURED_LABEL[plan.type.toLowerCase()]}
                                        featuredLabel={PLAN_FEATURED_LABEL[plan.type.toLowerCase()]}
                                        accentColor={PLAN_ACCENT[plan.type.toLowerCase()] ?? "slate"}
                                        onSelect={handleSelectPlan}
                                    />
                                ))}
                        </div>
                    )}
                </div>

                {/* ── Purchased packages summary ── */}
                {!loading.purchased && purchasedPackages.length > 0 && (
                    <div>
                        <SectionTitle>Gói đã mua</SectionTitle>
                        <div className="rounded-2xl border border-border-dark overflow-hidden bg-card-dark">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border-dark bg-surface-dark">
                                            {["Gói", "Loại", "Số lần mua", "Tổng token đã mua", "Lần mua gần nhất"].map((h) => (
                                                <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-dark">
                                        {purchasedPackages.map((pkg) => (
                                            <tr key={pkg.packageId} className="hover:bg-surface-dark/50 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <span className={`text-sm font-semibold ${planTierStyle[pkg.type?.toLowerCase()] ?? "text-slate-300"}`}>
                                                        {pkg.name}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-400 capitalize">{pkg.type}</td>
                                                <td className="px-5 py-3.5 text-sm text-slate-300 tabular-nums">{pkg.purchaseCount}</td>
                                                <td className="px-5 py-3.5 text-sm text-slate-300 tabular-nums">
                                                    {pkg.totalPurchasedTokens.toLocaleString("vi-VN")}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-400">
                                                    {pkg.lastPurchasedAt
                                                        ? new Date(pkg.lastPurchasedAt).toLocaleDateString("vi-VN")
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

                {/* ── History table ── */}
                <div>
                    <SectionTitle>Lịch sử thanh toán</SectionTitle>
                    <div className="rounded-2xl border border-border-dark overflow-hidden bg-card-dark">
                        <div className="px-6 py-4 border-b border-border-dark flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">Lịch sử</p>
                            <span className="text-xs text-text-muted">{MOCK_HISTORY.length} giao dịch</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border-dark bg-surface-dark">
                                        {["Mã giao dịch", "Gói", "Kỳ hạn", "Số tiền", "Ngày mua", "Trạng thái", ""].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-dark">
                                    {MOCK_HISTORY.map((row) => {
                                        const status = statusConfig[row.status];
                                        return (
                                            <tr key={row.id} className="hover:bg-surface-dark/50 transition-colors">
                                                <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">
                                                    #{row.transactionCode}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`text-sm font-semibold ${planTierStyle[row.planTier]}`}>
                                                        {row.planName}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                                                    {row.periodStart} – {row.periodEnd}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm font-semibold text-slate-200 whitespace-nowrap">
                                                    {row.amount === 0 ? "Miễn phí" : row.amount.toLocaleString("vi-VN") + " ₫"}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-500">{row.purchasedAt}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.className}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {row.status === "success" || row.status === "expired" ? (
                                                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition">
                                                            <FileText size={12} />
                                                            Hoá đơn
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-700 text-xs">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <p className="text-sm font-semibold text-white">{children}</p>
            <div className="flex-1 h-px bg-border-dark" />
        </div>
    );
}