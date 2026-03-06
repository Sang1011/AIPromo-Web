import { type ReactNode } from "react";

export interface AdminStatsCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    change?: string;
    changePositive?: boolean;
    icon: ReactNode;
    iconBg?: string;
    iconColor?: string;
    showGradientBar?: boolean;
    children?: ReactNode;
}

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

export default function AdminStatsCard({
    label,
    value,
    subtext,
    change,
    changePositive = true,
    icon,
    iconBg = "bg-primary/10",
    iconColor = "text-primary",
    showGradientBar = false,
    children,
}: AdminStatsCardProps) {
    return (
        <div
            className={`${glassCard} rounded-xl p-6 relative overflow-hidden transition-all hover:bg-[#1f1837]`}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-[#a592c8] text-xs font-semibold uppercase tracking-wider">
                        {label}
                    </p>
                    <h3 className="text-2xl font-bold text-white mt-1">
                        {value}
                    </h3>
                </div>
                <div className={`p-2 ${iconBg} ${iconColor} rounded-lg`}>
                    {icon}
                </div>
            </div>
            {(change || subtext) && (
                <div className="flex items-center gap-2">
                    {change && (
                        <span
                            className={`text-xs font-bold ${
                                changePositive
                                    ? "text-emerald-400"
                                    : "text-red-400"
                            }`}
                        >
                            {change}
                        </span>
                    )}
                    {subtext && (
                        <span className="text-[#a592c8] text-[10px]">
                            {subtext}
                        </span>
                    )}
                </div>
            )}
            {children}
            {showGradientBar && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
            )}
        </div>
    );
}
