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
import type { TicketTypeBreakdown, TicketStat } from "../../../types/ticketing/ticketing";

// ─── Normalize ────────────────────────────────────────────────────────────────

interface NormalizedTicket {
    name: string;
    totalQuantity: number;
    quantitySold: number;
    quantityCheckedIn: number;
}

function normalize(items: TicketTypeBreakdown[] | TicketStat[]): NormalizedTicket[] {
    return items.map((item) => {
        if ("totalQuantity" in item) {
            // TicketTypeBreakdown
            return {
                name: item.ticketTypeName,
                totalQuantity: item.totalQuantity,
                quantitySold: item.quantitySold,
                quantityCheckedIn: item.quantityCheckedIn,
            };
        }
        // TicketStat
        return {
            name: item.ticketTypeName,
            totalQuantity: item.quantity,
            quantitySold: item.sold,
            quantityCheckedIn: item.checkedIn,
        };
    });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TicketTypeBarChartProps {
    breakdown: TicketTypeBreakdown[] | TicketStat[];
}

// ─── Custom tooltip / legend ──────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function TicketTypeBarChart({ breakdown }: TicketTypeBarChartProps) {
    if (!Array.isArray(breakdown) || breakdown.length === 0) {
        return (
            <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <p className="text-sm text-slate-500">Không có dữ liệu vé.</p>
            </div>
        );
    }

    const chartData = normalize(breakdown).map((t) => ({
        name: t.name,
        "Tổng vé": t.totalQuantity,
        "Đã bán": t.quantitySold,
        "Đã check-in": t.quantityCheckedIn,
    }));

    const manyTypes = breakdown.length > 4;
    const chartHeight = manyTypes ? 380 : 320;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-600/5 to-transparent border border-violet-500/20 p-6 hover:border-violet-500/30 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/15 transition-all duration-300" />

            <div className="relative mb-5">
                <h3 className="text-lg font-bold text-white">Theo loại vé</h3>
                <p className="text-sm text-slate-400 mt-1">
                    So sánh tổng vé, đã bán và đã check-in theo từng loại
                </p>
            </div>

            <div className="relative" style={{ height: chartHeight }}>
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
                        <defs>
                            <linearGradient id="totalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#9199A5" />
                                <stop offset="100%" stopColor="#64748b" />
                            </linearGradient>
                            <linearGradient id="soldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#7c3bed" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                            <linearGradient id="checkinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#06b6d4" />
                                <stop offset="100%" stopColor="#0891b2" />
                            </linearGradient>
                        </defs>
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

                        <Bar dataKey="Tổng vé" fill="url(#totalGradient)" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Đã bán" fill="url(#soldGradient)" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Đã check-in" fill="url(#checkinGradient)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}