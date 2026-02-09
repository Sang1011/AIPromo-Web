import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { day: "05", revenue: 5, tickets: 3 },
    { day: "06", revenue: 10, tickets: 6 },
    { day: "07", revenue: 25, tickets: 15 },
    { day: "08", revenue: 50, tickets: 35 },
    { day: "09", revenue: 110, tickets: 85 },
    { day: "10", revenue: 85, tickets: 65 },
    { day: "11", revenue: 65, tickets: 50 },
    { day: "12", revenue: 80, tickets: 60 },
];

export default function RevenueChart() {
    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-2 text-primary font-bold">
                        ● Doanh thu (VND)
                    </span>
                    <span className="flex items-center gap-2 text-slate-400 font-bold">
                        ● Số vé bán
                    </span>
                </div>

                <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs rounded-lg bg-white/5 text-slate-400 font-semibold">
                        24 giờ
                    </button>
                    <button className="px-3 py-1 text-xs rounded-lg bg-primary text-white font-semibold">
                        30 ngày
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="day"
                            stroke="#6B7280"
                            tickLine={false}
                            axisLine={false}
                        />

                        <YAxis
                            stroke="#6B7280"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${v}M`}
                        />

                        <Tooltip
                            contentStyle={{
                                background: "#0b0816",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                            }}
                            labelStyle={{ color: "#c4b5fd" }}
                        />

                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            dot={{ r: 5, fill: "#8B5CF6" }}
                            activeDot={{ r: 7 }}
                        />

                        <Line
                            type="monotone"
                            dataKey="tickets"
                            stroke="#8B5CF6"
                            strokeWidth={2}
                            strokeDasharray="6 6"
                            dot={false}
                            opacity={0.5}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
