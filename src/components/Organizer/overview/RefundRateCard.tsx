import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { RefundRateReportItem } from "../../../types/report/report";

interface Props {
    data: RefundRateReportItem;
    loading?: boolean;
}

const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

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
        <div className="bg-card-dark rounded-2xl p-6 border border-white/5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-400 text-lg">
                        currency_exchange
                    </span>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm uppercase tracking-widest">
                        Phân tích hoàn tiền
                    </h3>
                    <p className="text-white/40 text-sm mt-0.5">Refund analytics</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Donut chart */}
                <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={44}
                                outerRadius={62}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined) => formatVND(value ?? 0)}
                                contentStyle={{
                                    background: "#18122B",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 8,
                                    color: "#fff",
                                    fontSize: 12,
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-red-400">
                            {refundRate.toFixed(1)}%
                        </span>
                        <span className="text-white/40 text-[10px]">Tỉ lệ HT</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <StatRow
                        label="Doanh thu gộp"
                        value={formatVND(data.grossRevenue)}
                        color="text-white"
                        dot="#7c3bed"
                    />
                    <StatRow
                        label="Đã hoàn tiền"
                        value={formatVND(data.totalRefunds)}
                        color="text-red-400"
                        dot="#ef4444"
                    />
                    <div className="border-t border-white/5 pt-3">
                        <StatRow
                            label="Còn lại"
                            value={formatVND(retained)}
                            color="text-green-400"
                            dot="#22c55e"
                        />
                    </div>
                </div>
            </div>

            {/* Rate bar */}
            <div className="mt-5">
                <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/50">Tỉ lệ hoàn tiền</span>
                    <span className="text-red-400 font-semibold">{refundRate.toFixed(2)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700"
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