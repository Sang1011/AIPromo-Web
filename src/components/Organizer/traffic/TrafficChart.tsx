import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { date: "29/12", value: 1200 },
    { date: "03/01", value: 1900 },
    { date: "08/01", value: 1600 },
    { date: "13/01", value: 2800 },
    { date: "18/01", value: 2400 },
    { date: "23/01", value: 3100 },
    { date: "28/01", value: 5200 },
];

export default function TrafficChart() {
    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        Lượt truy cập theo thời gian
                    </h3>
                    <p className="text-sm text-slate-400">
                        Dữ liệu được cập nhật hàng giờ
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs rounded-lg bg-primary text-white">
                        Ngày
                    </button>
                    <button className="px-3 py-1 text-xs rounded-lg bg-white/5 text-slate-400">
                        Tuần
                    </button>
                </div>
            </div>

            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id="trafficGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#8B5CF6"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#8B5CF6"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="date"
                            stroke="#6B7280"
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#6B7280"
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            contentStyle={{
                                background: "#0b0816",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 12,
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            fill="url(#trafficGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
