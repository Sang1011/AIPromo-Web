import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList,
} from "recharts";
import type { TransactionSummaryReportItem } from "../../../types/report/report";

interface Props {
    data: TransactionSummaryReportItem;
    loading?: boolean;
}

const truncate = (num: number, decimals: number) => {
    const factor = Math.pow(10, decimals);
    return Math.floor(num * factor) / factor;
};

const formatShort = (value: number) => {
    if (value >= 1_000_000_000) {
        const val = truncate(value / 1_000_000_000, 2);
        return `${Number.isInteger(val) ? val : val}B`;
    }
    if (value >= 1_000_000) {
        const val = truncate(value / 1_000_000, 2);
        return `${Number.isInteger(val) ? val : val}tr`;
    }
    if (value >= 1_000) {
        const val = truncate(value / 1_000, 1);
        return `${Number.isInteger(val) ? val : val}K`;
    }
    return String(value);
};

export default function TransactionSummaryCard({ data, loading }: Props) {
    if (loading) {
        return (
            <div className="bg-card-dark rounded-2xl p-6 animate-pulse">
                <div className="h-4 w-40 bg-white/10 rounded mb-4" />
                <div className="h-40 bg-white/5 rounded" />
            </div>
        );
    }

    const {
        totalTransactions,
        completedCount,
        failedCount,
        refundedCount,
        walletPayAmount,
        directPayAmount,
    } = data;

    const statusData = [
        { name: "Thành công", value: completedCount, color: "#22c55e", key: "completed" },
        { name: "Thất bại", value: failedCount, color: "#ef4444", key: "failed" },
        { name: "Hoàn tiền", value: refundedCount, color: "#f97316", key: "refunded" },
    ];

    const paymentData = [
        {
            name: "Ví điện tử",
            value: walletPayAmount,
            color: "#7c3bed",
            pct:
                walletPayAmount + directPayAmount > 0
                    ? ((walletPayAmount / (walletPayAmount + directPayAmount)) * 100).toFixed(1)
                    : "0",
        },
        {
            name: "Thanh toán trực tiếp",
            value: directPayAmount,
            color: "#06b6d4",
            pct:
                walletPayAmount + directPayAmount > 0
                    ? ((directPayAmount / (walletPayAmount + directPayAmount)) * 100).toFixed(1)
                    : "0",
        },
    ];

    return (
        <div className="bg-card-dark rounded-2xl p-6 border border-white/5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg">
                        receipt_long
                    </span>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm uppercase tracking-widest">
                        Tổng quan giao dịch
                    </h3>
                    <p className="text-white/40 text-sm mt-0.5">Transaction summary</p>
                </div>

                {/* Total badge */}
                <div className="ml-auto bg-white/5 rounded-xl px-3 py-1.5 text-center">
                    <div className="text-lg font-bold text-white">{totalTransactions}</div>
                    <div className="text-white/40 text-[10px]">tổng GD</div>
                </div>
            </div>

            {/* Status bar chart */}
            <div className="mb-5">
                <p className="text-white/40 text-sm uppercase tracking-wider mb-3">
                    Trạng thái giao dịch
                </p>
                <div style={{ height: 120 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={statusData}
                            layout="vertical"
                            margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
                            barSize={14}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={72}
                            />
                            <Tooltip
                                formatter={(value: number | undefined) => [`${value ?? 0} Giao dịch`, ""]}
                                contentStyle={{
                                    background: "#18122B",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 8,
                                }}
                                itemStyle={{
                                    color: "#fff",
                                    fontSize: 12,
                                }}
                                labelStyle={{
                                    color: "#fff",
                                }}
                                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} minPointSize={3}>
                                {statusData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                                <LabelList
                                    dataKey="value"
                                    position="right"
                                    formatter={(v: unknown) => (v as number) === 0 ? "–" : String(v as number)}
                                    style={{ fill: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Count chips */}
                <div className="flex gap-2 mt-2">
                    {statusData.map((s) => (
                        <div
                            key={s.key}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm"
                            style={{ background: `${s.color}18` }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: s.color }}
                            />
                            <span style={{ color: s.color }} className="font-semibold">
                                {s.value}
                            </span>
                            <span className="text-white/40">{s.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment method breakdown */}
            <div>
                <p className="text-white/40 text-sm uppercase tracking-wider mb-3">
                    Phương thức thanh toán
                </p>
                <div className="space-y-2.5">
                    {paymentData.map((p) => (
                        <div key={p.name}>
                            <div className="flex justify-between text-sm mb-1">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: p.color }}
                                    />
                                    <span className="text-white/60">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white/40">{p.pct}%</span>
                                    <span className="text-white font-semibold">
                                        {formatShort(p.value)}
                                    </span>
                                </div>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${p.pct}%`,
                                        background: p.color,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total amounts */}
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
                    <div className="text-center">
                        <div className="text-white/40 text-sm mb-0.5">Ví điện tử</div>
                        <div className="text-primary text-sm font-bold">
                            {formatShort(walletPayAmount)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-white/40 text-sm mb-0.5">Trực tiếp</div>
                        <div className="text-cyan-400 text-sm font-bold">
                            {formatShort(directPayAmount)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}