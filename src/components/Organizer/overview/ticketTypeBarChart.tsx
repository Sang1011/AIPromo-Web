import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    CartesianGrid,
} from "recharts";
import type { TicketTypeBreakdown } from "../../../types/ticketing/ticketing";

interface TicketTypeBarChartProps {
    breakdown: TicketTypeBreakdown[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-[#18122B] border border-primary/20 rounded-xl p-3 shadow-xl text-sm">
            <p className="text-white font-semibold mb-2">{label}</p>
            {payload.map((entry: any) => (
                <p key={entry.name} style={{ color: entry.color }} className="mb-0.5">
                    {entry.name}:{" "}
                    <span className="font-bold">{entry.value.toLocaleString("vi-VN")}</span>
                </p>
            ))}
        </div>
    );
};

const CustomLegend = ({ payload }: any) => (
    <div className="flex items-center justify-center gap-6 mt-4">
        {payload?.map((entry: any) => (
            <div key={entry.value} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: entry.color }} />
                <span className="text-xs text-slate-400">{entry.value}</span>
            </div>
        ))}
    </div>
);

export default function TicketTypeBarChart({ breakdown }: TicketTypeBarChartProps) {
    if (!Array.isArray(breakdown) || breakdown.length === 0) {
        return (
            <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <p className="text-sm text-slate-500">Không có dữ liệu vé.</p>
            </div>
        );
    }

    const chartData = breakdown.map((t) => ({
        name: t.ticketTypeName,
        "Tổng vé": t.totalQuantity,
        "Đã bán": t.quantitySold,
        "Đã check-in": t.quantityCheckedIn,
    }));

    // > 4 loại vé: nghiêng label + tăng chiều cao để tránh chồng chéo
    const manyTypes = breakdown.length > 4;
    const chartHeight = manyTypes ? 380 : 320;

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <div className="mb-5">
                <h3 className="text-lg font-semibold text-white">Theo loại vé</h3>
                <p className="text-sm text-slate-500 mt-1">
                    So sánh tổng vé, đã bán và đã check-in theo từng loại
                </p>
            </div>

            <div style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 8,
                            right: 16,
                            left: 0,
                            bottom: manyTypes ? 24 : 8,
                        }}
                        barCategoryGap="28%"
                        barGap={3}
                    >
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />

                        <XAxis
                            dataKey="name"
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            {...(manyTypes
                                ? { angle: -35, textAnchor: "end", height: 64 }
                                : { height: 32 })}
                        />

                        <YAxis
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                            tickFormatter={(v) => v.toLocaleString()}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "rgba(124,59,237,0.07)", radius: 8 }}
                        />

                        <Legend content={<CustomLegend />} />

                        <Bar dataKey="Tổng vé" fill="#9199A5" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Đã bán" fill="#7c3bed" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Đã check-in" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}