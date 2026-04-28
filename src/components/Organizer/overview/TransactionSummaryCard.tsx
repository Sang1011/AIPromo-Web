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
import { fmtMoneyVND } from "../../../utils/fmtMoneyVND";

interface Props {
    data: TransactionSummaryReportItem;
    loading?: boolean;
}
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
        walletPayAmount,
        directPayAmount,
    } = data;

    const statusData = [
        { name: "Thành công", value: completedCount, color: "#22c55e", key: "completed" },
        { name: "Thất bại", value: failedCount, color: "#ef4444", key: "failed" },
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent border border-cyan-500/20 p-6 hover:border-cyan-500/30 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/15 transition-all duration-300" />

            {/* Header */}
            <div className="relative flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-primary text-lg">
                        receipt_long
                    </span>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm uppercase tracking-widest">
                        Tổng quan giao dịch
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Transaction summary</p>
                </div>

                {/* Total badge */}
                <div className="ml-auto bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/30 rounded-xl px-4 py-2 text-center backdrop-blur-sm">
                    <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{totalTransactions}</div>
                    <div className="text-slate-400 text-[10px] font-semibold">tổng GD</div>
                </div>
            </div>

            {/* Status bar chart */}
            <div className="relative mb-5">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-3">
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
                            <defs>
                                <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#22c55e" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                                <linearGradient id="failedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#f97316" />
                                </linearGradient>
                                <linearGradient id="refundedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f97316" />
                                    <stop offset="100%" stopColor="#f59e0b" />
                                </linearGradient>
                            </defs>
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
                                    border: "1px solid rgba(124,59,237,0.3)",
                                    borderRadius: 12,
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
                                {statusData.map((_entry, index) => (
                                    <Cell key={index} fill={`url(#${index === 0 ? 'success' : index === 1 ? 'failed' : 'refunded'}Gradient)`} />
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
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm border"
                            style={{
                                background: `${s.color}15`,
                                borderColor: `${s.color}30`
                            }}
                        >
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: s.color }}
                            />
                            <span style={{ color: s.color }} className="font-semibold">
                                {s.value}
                            </span>
                            <span className="text-slate-400">{s.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment method breakdown */}
            <div className="relative">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-3">
                    Phương thức thanh toán
                </p>
                <div className="space-y-3">
                    {paymentData.map((p) => (
                        <div key={p.name}>
                            <div className="flex justify-between text-sm mb-1.5">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shadow-lg"
                                        style={{ background: p.color }}
                                    />
                                    <span className="text-slate-300 font-medium">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400 font-semibold">{p.pct}%</span>
                                    <span className="text-white font-bold">
                                        {fmtMoneyVND(p.value)}
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
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
                <div className="mt-5 pt-4 border-t border-white/5 flex justify-between">
                    <div className="text-center flex-1">
                        <div className="text-slate-400 text-xs mb-1">Ví điện tử</div>
                        <div className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                            {fmtMoneyVND(walletPayAmount)}
                        </div>
                    </div>
                    <div className="text-center flex-1">
                        <div className="text-slate-400 text-xs mb-1">Trực tiếp</div>
                        <div className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                            {fmtMoneyVND(directPayAmount)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}