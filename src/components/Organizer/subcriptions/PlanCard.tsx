import { Check, X, Zap } from "lucide-react";
import type { AIPackage } from "../../../types/aiPackage";

export interface PlanFeature {
    label: string;
    included: boolean;
}

interface PlanCardProps {
    plan: AIPackage;
    features: PlanFeature[];
    isCurrentPlan?: boolean;
    isFeatured?: boolean;
    featuredLabel?: string;
    onSelect: (plan: AIPackage) => void;
    accentColor?: "amber" | "purple" | "slate";
}

const accentMap = {
    amber: {
        name: "text-amber-400",
        badge: "bg-amber-500/15 text-amber-400 border border-amber-400/30",
        btn: "border-amber-400/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20",
        card: "border-amber-400/20",
        featuredBadge: "bg-amber-500 text-white",
    },
    purple: {
        name: "text-purple-400",
        badge: "bg-purple-500/15 text-purple-400 border border-purple-400/30",
        btn: "border-purple-400/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20",
        card: "border-purple-400/30",
        featuredBadge: "bg-primary text-white",
    },
    slate: {
        name: "text-slate-400",
        badge: "bg-white/5 text-slate-400 border border-white/10",
        btn: "border-white/10 text-slate-400 hover:bg-white/5",
        card: "border-white/10",
        featuredBadge: "bg-slate-600 text-white",
    },
};

export default function PlanCard({
    plan,
    features,
    isCurrentPlan = false,
    isFeatured = false,
    featuredLabel = "Phổ biến nhất",
    onSelect,
    accentColor = "slate",
}: PlanCardProps) {
    const accent = accentMap[accentColor];

    return (
        <div
            className={`relative flex flex-col rounded-2xl border bg-[#18122B] p-6 transition-all duration-200
                ${isFeatured ? `${accent.card} shadow-lg` : "border-white/10"}
                ${isCurrentPlan ? "ring-1 ring-primary/40" : ""}
            `}
        >
            {/* Featured badge */}
            {isFeatured && (
                <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${accent.featuredBadge}`}
                >
                    {featuredLabel}
                </div>
            )}

            {/* Plan name */}
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${accent.name}`}>
                {plan.name}
            </p>

            {/* Price */}
            <div className="mb-1">
                <span className="text-3xl font-bold text-white">
                    {plan.price === 0 ? "0" : plan.price.toLocaleString("vi-VN")}
                </span>
                {plan.price > 0 && (
                    <span className="text-sm text-slate-500 ml-1">₫ / tháng</span>
                )}
                {plan.price === 0 && (
                    <span className="text-sm text-slate-500 ml-1">VND</span>
                )}
            </div>

            <p className="text-xs text-slate-500 mb-1">{plan.description}</p>

            {/* Token quota */}
            <div className="flex items-center gap-1.5 mb-5">
                <Zap size={12} className="text-amber-400" />
                <span className="text-xs text-slate-400">
                    {plan.tokenQuota.toLocaleString("vi-VN")} tokens / tháng
                </span>
            </div>

            <hr className="border-white/8 mb-5" />

            {/* Features */}
            <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        {f.included ? (
                            <Check size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                            <X size={13} className="text-slate-600 mt-0.5 shrink-0" />
                        )}
                        <span className={`text-xs leading-relaxed ${f.included ? "text-slate-300" : "text-slate-600"}`}>
                            {f.label}
                        </span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            {isCurrentPlan ? (
                <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-sm font-semibold border border-emerald-400/25 text-emerald-400 bg-emerald-500/8 cursor-default"
                >
                    Gói hiện tại
                </button>
            ) : (
                <button
                    onClick={() => onSelect(plan)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition ${accent.btn}`}
                >
                    {plan.price === 0 ? "Hạ xuống Free" : `Chuyển sang ${plan.name}`}
                </button>
            )}
        </div>
    );
}