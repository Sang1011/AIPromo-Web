import { Crown, RefreshCw, AlertTriangle } from "lucide-react";

export interface ActiveSubscription {
    planName: string;
    planTier: "free" | "pro" | "business";
    expiresAt: string;
    isAutoRenew: boolean;
    status: "active" | "expiring_soon" | "expired";
}

interface Props {
    subscription: ActiveSubscription;
    onUpgrade?: () => void;
    onManage?: () => void;
}

const tierAccent: Record<string, { dot: string; ring: string; iconBg: string; iconColor: string }> = {
    free: {
        dot: "bg-slate-400",
        ring: "border-slate-400/20",
        iconBg: "bg-slate-500/10",
        iconColor: "text-slate-400",
    },
    pro: {
        dot: "bg-amber-400",
        ring: "border-amber-400/20",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-400",
    },
    business: {
        dot: "bg-purple-400",
        ring: "border-purple-400/20",
        iconBg: "bg-purple-500/10",
        iconColor: "text-purple-400",
    },
};

export default function ActiveSubscriptionBanner({ subscription, onUpgrade, onManage }: Props) {
    const accent = tierAccent[subscription.planTier];
    const isExpiringSoon = subscription.status === "expiring_soon";
    const isExpired = subscription.status === "expired";

    return (
        <div
            className={`rounded-2xl border p-5 flex items-center justify-between gap-4
                ${isExpired
                    ? "bg-red-500/5 border-red-500/20"
                    : isExpiringSoon
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-primary/5 border-primary/20"
                }
            `}
        >
            {/* Left — icon + info */}
            <div className="flex items-center gap-4">
                <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${accent.iconBg} border ${accent.ring}`}
                >
                    <Crown size={18} className={accent.iconColor} />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-white">
                            Gói {subscription.planName}
                        </p>
                        {/* Status badge */}
                        {isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-400/25">
                                <AlertTriangle size={9} />
                                Đã hết hạn
                            </span>
                        ) : isExpiringSoon ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-400/25">
                                <AlertTriangle size={9} />
                                Sắp hết hạn
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-400/25">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                Đang hoạt động
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                        {isExpired ? "Hết hạn từ" : "Hết hạn"}:{" "}
                        <span className={isExpired ? "text-red-400" : "text-slate-400"}>
                            {subscription.expiresAt}
                        </span>
                        {subscription.isAutoRenew && !isExpired && (
                            <>
                                <span className="text-slate-700">·</span>
                                <span className="flex items-center gap-1 text-emerald-500">
                                    <RefreshCw size={10} />
                                    Tự gia hạn
                                </span>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Right — CTAs */}
            <div className="flex items-center gap-2 shrink-0">
                {onManage && (
                    <button
                        onClick={onManage}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 text-slate-400 hover:bg-white/5 transition"
                    >
                        Quản lý
                    </button>
                )}
                {onUpgrade && subscription.planTier !== "business" && (
                    <button
                        onClick={onUpgrade}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white transition"
                    >
                        {isExpired ? "Gia hạn ngay" : "Nâng cấp"}
                    </button>
                )}
            </div>
        </div>
    );
}