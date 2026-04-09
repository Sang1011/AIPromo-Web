import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { RefundRateReportItem } from "../../../types/report/report";
import { fmtMoneyVND } from "../../../utils/fmtMoneyVND";

interface Props {
    data: RefundRateReportItem;
    loading?: boolean;
}

export default function RefundRateCard({ data, loading }: Props) {
    if (loading) {
        return (
            <div className="bg-card-dark rounded-2xl p-6 animate-pulse">
                <div className="h-4 w-32 bg-white/10 rounded mb-4" />
                <div className="h-40 bg-white/5 rounded" />
            </div>
        );
    }

    const retained = data.grossRevenue - data.totalRefunds;
    const refundRate = data.refundRatePercent;

    const pieData = [
        { name: "Đã hoàn tiền", value: data.totalRefunds, color: "#ef4444" },
        { name: "Doanh thu giữ lại", value: retained, color: "#7c3bed" },
    ];

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 via-orange-600/5 to-transparent border border-red-500/20 p-6 hover:border-red-500/30 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/15 transition-all duration-300" />

            {/* Header */}
            <div className="relative flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/20">
                    <span className="material-symbols-outlined text-red-400 text-lg">
                        currency_exchange
                    </span>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm uppercase tracking-widest">
                        Phân tích hoàn tiền
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Refund analytics</p>
                </div>
            </div>

            <div className="relative flex items-center gap-6">
                {/* Donut chart */}
                <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <defs>
                                <linearGradient id="refundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#f97316" />
                                </linearGradient>
                                <linearGradient id="retainedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7c3bed" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={44}
                                outerRadius={62}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                strokeWidth={2}
                                stroke="#18122B"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={index} fill={index === 0 ? "url(#refundGradient)" : "url(#retainedGradient)"} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined) => fmtMoneyVND(value ?? 0)}
                                contentStyle={{
                                    background: "#18122B",
                                    border: "1px solid rgba(124,59,237,0.3)",
                                    borderRadius: 12,
                                    color: "#fff",
                                    fontSize: 12,
                                }}
                                itemStyle={{
                                    color: "#fff"
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                            {refundRate.toFixed(1)}%
                        </span>
                        <span className="text-slate-400 text-[10px] font-semibold">Tỉ lệ HT</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <StatRow
                        label="Doanh thu gộp"
                        value={fmtMoneyVND(data.grossRevenue)}
                        color="text-white"
                        dot="#7c3bed"
                    />
                    <StatRow
                        label="Đã hoàn tiền"
                        value={fmtMoneyVND(data.totalRefunds)}
                        color="text-red-400"
                        dot="#ef4444"
                    />
                    <div className="border-t border-white/5 pt-3">
                        <StatRow
                            label="Còn lại"
                            value={fmtMoneyVND(retained)}
                            color="text-emerald-400"
                            dot="#22c55e"
                        />
                    </div>
                </div>
            </div>

            {/* Rate bar */}
            <div className="relative mt-5">
                <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-400">Tỉ lệ hoàn tiền</span>
                    <span className="text-red-400 font-semibold">{refundRate.toFixed(2)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-700"
                        style={{ width: `${Math.min(refundRate, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

function StatRow({
    label,
    value,
    color,
    dot,
}: {
    label: string;
    value: string;
    color: string;
    dot: string;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
                <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: dot }}
                />
                <span className="text-white/50 text-sm truncate">{label}</span>
            </div>
            <span className={`text-sm font-semibold ${color} flex-shrink-0`}>{value}</span>
        </div>
    );
}