import { Loader2 } from "lucide-react";
import { MdToken } from "react-icons/md";
import type { AIPackage } from "../../../types/aiPackage/aiPackage";

export interface PlanFeature {
    label: string;
    included: boolean;
}

interface PlanCardProps {
    plan: AIPackage;
    isCurrentPlan?: boolean;
    onSelect: (plan: AIPackage) => void;
    accentColor?: "amber" | "purple" | "slate" | "emerald";
    isPaymentLoading?: boolean;
    isLocked?: boolean;
}

export default function PlanCard({
    plan,
    isCurrentPlan = false,
    onSelect,
    accentColor = "slate",
    isPaymentLoading = false,
    isLocked = false,
}: PlanCardProps) {
    const isSubscription = plan.type === "Subscription";
    const isTopUp = plan.type === "TopUp";

    const formattedPrice = plan.price
        ? new Intl.NumberFormat("vi-VN").format(plan.price)
        : "0";

    const formattedToken = plan.tokenQuota
        ? new Intl.NumberFormat("vi-VN").format(plan.tokenQuota)
        : "0";

    const accentStyles = {
        amber: {
            bar: "from-amber-500 to-orange-400",
            price: "text-amber-400",
            tokenIcon: "text-amber-400",
            tokenBg: "bg-amber-500/10",
            infoBadge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
            btn: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/10 hover:border-amber-500/30",
        },
        purple: {
            bar: "from-violet-600 to-violet-400",
            price: "text-violet-400",
            tokenIcon: "text-violet-400",
            tokenBg: "bg-violet-500/10",
            infoBadge: "bg-violet-500/10 text-violet-300 border-violet-500/20",
            btn: "bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border-violet-500/10 hover:border-violet-500/30",
        },
        emerald: {
            bar: "from-emerald-500 to-teal-400",
            price: "text-emerald-400",
            tokenIcon: "text-emerald-400",
            tokenBg: "bg-emerald-500/10",
            infoBadge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
            btn: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/10 hover:border-emerald-500/30",
        },
        slate: {
            bar: "from-slate-500 to-slate-400",
            price: "text-slate-300",
            tokenIcon: "text-slate-400",
            tokenBg: "bg-slate-500/10",
            infoBadge: "bg-white/5 text-slate-400 border-white/10",
            btn: "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:border-white/20",
        },
    };

    const s = accentStyles[accentColor] ?? accentStyles.slate;

    return (
        <div className={`glass-card rounded-2xl flex flex-col transition-all duration-300 hover:border-violet-500/40 relative overflow-hidden group
            ${isCurrentPlan ? "ring-1 ring-emerald-500/40" : ""}
        `}>
            {/* Top accent bar */}
            <div className={`h-1 bg-gradient-to-r ${s.bar}`} />

            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{plan.name}</h3>
                    <div className="flex items-baseline gap-1.5 mt-2">
                        <span className={`text-2xl font-black ${s.price}`}>
                            {plan.price === 0 ? "Miễn phí" : formattedPrice}
                        </span>
                        {plan.price > 0 && (
                            <span className="text-sm text-slate-500">
                                {isTopUp ? "VND/gói" : "VND/tháng"}
                            </span>
                        )}
                    </div>
                </div>

                {/* Type badge */}
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0
                    ${isSubscription
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                    {isSubscription ? "Subscription" : "TopUp"}
                </span>
            </div>

            {/* Description */}
            {plan.description && (
                <div className="px-6 pb-4">
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                        {plan.description}
                    </p>
                </div>
            )}

            {/* Token quota */}
            <div className="px-6 pb-4">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.tokenBg}`}>
                        <MdToken className={`text-base ${s.tokenIcon}`} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            {isSubscription ? "Token / tháng" : "Token nạp thêm"}
                        </p>
                        <p className="text-sm font-bold text-white">
                            {formattedToken}{" "}
                            <span className="text-slate-500 font-normal text-xs">
                                {isSubscription ? "tokens/tháng" : "tokens/gói"}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Info badge */}
            <div className="px-6 pb-4">
                <div className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium border ${s.infoBadge}`}>
                    {isSubscription
                        ? "Gia hạn và reset quota theo chu kỳ tháng"
                        : "Mua 1 lần để cộng thêm token sử dụng"}
                </div>
            </div>

            {/* CTA */}
            <div className="mt-auto px-6 py-4 border-t border-white/5">
                {isCurrentPlan ? (
                    <div className="w-full h-10 flex items-center justify-center rounded-lg
                        border border-emerald-400/25 text-emerald-400 bg-emerald-500/10
                        text-sm font-semibold">
                        ✓ Gói hiện tại
                    </div>
                ) : isLocked ? (
                    <div className="w-full h-10 flex items-center justify-center rounded-lg
                        border border-slate-700 text-slate-500 bg-white/[0.02]
                        text-sm font-semibold cursor-not-allowed">
                        Đang có gói đăng ký
                    </div>
                ) : (
                    <button
                        onClick={() => onSelect(plan)}
                        disabled={isPaymentLoading}
                        className={`w-full h-10 flex items-center justify-center gap-2 rounded-lg
                            border transition-all font-semibold text-sm
                            ${s.btn}
                            disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                        {isPaymentLoading ? (
                            <><Loader2 size={13} className="animate-spin" />Đang xử lý...</>
                        ) : (
                            isTopUp ? `Nạp ${plan.name}` : `Đăng ký ${plan.name}`
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}