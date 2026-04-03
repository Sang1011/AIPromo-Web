import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Crown, Zap, CalendarDays, Wallet } from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";
import type { AIPackage } from "../../types/aiPackage";
import type { ActiveSubscription } from "../../components/Organizer/subcriptions/ActiveSubscriptionBanner";
import type { AppDispatch, RootState } from "../../store";
import ActiveSubscriptionBanner from "../../components/Organizer/subcriptions/ActiveSubscriptionBanner";
import SubscriptionHistoryTable from "../../components/Organizer/subcriptions/SubscriptionHistoryTable";
import PlanCard, { type PlanFeature } from "../../components/Organizer/subcriptions/PlanCard";
import { fetchAIPackages } from "../../store/aiPackageSlice";

// ── Toggle this to false when real APIs are ready ─────────────────────────────
const USE_MOCK = true;
// ─────────────────────────────────────────────────────────────────────────────

// ── Mock packages (mirrors AIPackage shape) ───────────────────────────────────
const MOCK_PACKAGES: AIPackage[] = [
    {
        id: "pkg-free",
        name: "Free",
        description: "Dành cho người mới bắt đầu",
        type: "free",
        price: 0,
        tokenQuota: 10000,
        isActive: true,
    },
    {
        id: "pkg-pro",
        name: "Pro",
        description: "Phù hợp organizer chuyên nghiệp",
        type: "pro",
        price: 399000,
        tokenQuota: 200000,
        isActive: true,
    },
    {
        id: "pkg-business",
        name: "Business",
        description: "Cho doanh nghiệp & sự kiện lớn",
        type: "business",
        price: 999000,
        tokenQuota: 1000000,
        isActive: true,
    },
];

// ── Mock active subscription ──────────────────────────────────────────────────
const MOCK_ACTIVE_SUB: ActiveSubscription = {
    planName: "Pro",
    planTier: "pro",
    expiresAt: "15/07/2025",
    isAutoRenew: true,
    status: "active",
};

// ── Mock stats ────────────────────────────────────────────────────────────────
interface SubStats {
    eventsCreated: number;
    eventsLimit: number;
    daysRemaining: number;
    totalSpent: number;
}
const MOCK_STATS: SubStats = {
    eventsCreated: 12,
    eventsLimit: 50,
    daysRemaining: 47,
    totalSpent: 1200000,
};

// ── Feature lists per plan type ───────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { list: packages, loading } = useSelector((state: RootState) => state.PACKAGE);

    // Active sub & stats — swap with real API state when ready
    const [activeSub] = useState<ActiveSubscription>(MOCK_ACTIVE_SUB);
    const [stats] = useState<SubStats>(MOCK_STATS);

    const displayPackages: AIPackage[] = USE_MOCK ? MOCK_PACKAGES : packages;

    useEffect(() => {
        if (!USE_MOCK) {
            dispatch(fetchAIPackages());
        }
    }, [dispatch]);

    const handleSelectPlan = (plan: AIPackage) => {
        // TODO: open payment modal or navigate to checkout
        console.log("Selected plan:", plan);
    };

    const handleUpgrade = () => {
        document.getElementById("plan-section")?.scrollIntoView({ behavior: "smooth" });
    };

    const isCurrentPlan = (plan: AIPackage) =>
        plan.type.toLowerCase() === activeSub.planTier;

    const isLoading = !USE_MOCK && loading.list;

    return (
        <div className="min-h-screen bg-[#0B0B12] px-8 py-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* ── Page heading ── */}
                <div>
                    {/* Back button */}
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
                    <p className="text-sm text-slate-500">
                        Quản lý gói, theo dõi quyền lợi và lịch sử thanh toán
                    </p>
                </div>

                {/* ── Active subscription banner ── */}
                <ActiveSubscriptionBanner
                    subscription={activeSub}
                    onUpgrade={handleUpgrade}
                    onManage={() => { }}
                />

                {/* ── Stats row ── */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard
                        icon={<Zap size={16} className="text-amber-400" />}
                        label="Sự kiện đã tạo"
                        value={`${stats.eventsCreated}`}
                        sub={`Giới hạn: ${stats.eventsLimit} / tháng`}
                    />
                    <StatCard
                        icon={<CalendarDays size={16} className="text-purple-400" />}
                        label="Ngày còn lại"
                        value={`${stats.daysRemaining}`}
                        sub={`Đến ${activeSub.expiresAt}`}
                    />
                    <StatCard
                        icon={<Wallet size={16} className="text-emerald-400" />}
                        label="Tổng đã chi"
                        value={stats.totalSpent.toLocaleString("vi-VN") + " ₫"}
                        sub="Tất cả kỳ thanh toán"
                        valueClassName="text-emerald-400"
                    />
                </div>

                {/* ── Plan cards ── */}
                <div id="plan-section">
                    <SectionTitle>Chọn gói phù hợp</SectionTitle>

                    {isLoading ? (
                        <div className="grid grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-80 rounded-2xl bg-white/5 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-5">
                            {displayPackages.map((plan) => (
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

                {/* ── History ── */}
                <div>
                    <SectionTitle>Lịch sử thanh toán</SectionTitle>
                    <SubscriptionHistoryTable />
                </div>
            </div>
        </div>
    );
}

// ── Small reusable sub-components ─────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <p className="text-sm font-semibold text-white">{children}</p>
            <div className="flex-1 h-px bg-white/8" />
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    valueClassName?: string;
}

function StatCard({ icon, label, value, sub, valueClassName = "text-white" }: StatCardProps) {
    return (
        <div className="bg-[#18122B] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
                {icon}
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {label}
                </p>
            </div>
            <p className={`text-2xl font-bold mb-1 ${valueClassName}`}>{value}</p>
            <p className="text-xs text-slate-600">{sub}</p>
        </div>
    );
}