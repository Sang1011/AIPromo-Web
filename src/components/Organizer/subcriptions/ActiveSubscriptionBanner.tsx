import { Crown, RefreshCw, AlertTriangle } from "lucide-react";
import type { AIPurchasedPackage } from "../../../types/aiPackage/aiPackage";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert any date to Vietnam time (UTC+7) and add 30 days */
export function getVNExpiry(lastPurchasedAt: string): Date {
    const purchased = new Date(lastPurchasedAt);
    // shift to VN time then add 30 days
    const vnOffset = 7 * 60; // minutes
    const utcMs = purchased.getTime() + vnOffset * 60 * 1000;
    const vnDate = new Date(utcMs);
    vnDate.setDate(vnDate.getDate() + 30);
    return vnDate;
}

/** Format a Date as VN locale string (DD/MM/YYYY HH:mm) */
export function formatVNDate(date: Date): string {
    return date.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export type SubscriptionStatus = "active" | "expiring_soon" | "expired";

export function getSubscriptionStatus(lastPurchasedAt: string): SubscriptionStatus {
    const now = new Date();
    const expiry = getVNExpiry(lastPurchasedAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffMs <= 0) return "expired";
    if (diffDays <= 7) return "expiring_soon";
    return "active";
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    pkg: AIPurchasedPackage;
    onUpgrade?: () => void;
}

const tierAccent: Record<string, { ring: string; iconBg: string; iconColor: string }> = {
    topup: {
        ring: "border-slate-400/20",
        iconBg: "bg-slate-500/10",
        iconColor: "text-slate-400",
    },
    subscription: {
        ring: "border-amber-400/20",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-400",
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActiveSubscriptionBanner({ pkg, onUpgrade }: Props) {
    const status = getSubscriptionStatus(pkg.lastPurchasedAt);
    const expiry = getVNExpiry(pkg.lastPurchasedAt);
    const accent = tierAccent[pkg.type.toLowerCase()] ?? tierAccent["subscription"];

    const isExpired = status === "expired";
    const isExpiringSoon = status === "expiring_soon";

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
            {/* Left */}
            <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${accent.iconBg} border ${accent.ring}`}>
                    <Crown size={18} className={accent.iconColor} />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-white">Gói {pkg.name}</p>

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
                            {formatVNDate(expiry)}
                        </span>
                        {!isExpired && (
                            <>
                                <span className="text-slate-700">·</span>
                                <span className="flex items-center gap-1 text-slate-500">
                                    <RefreshCw size={10} />
                                    30 ngày / lần
                                </span>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0">
                {onUpgrade && (
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