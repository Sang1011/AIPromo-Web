import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MarketingData {
    title: string;
    value: number;
}

const mockData: MarketingData[] = [
    { title: "Chiến dịch vé sớm Facebook", value: 120 },
    { title: "Email mời tham dự VIP", value: 85 },
    { title: "Bài viết blog PR sự kiện", value: 72 },
    { title: "Instagram Stories highlight", value: 60 },
    { title: "LinkedIn post B2B", value: 45 },
];

export default function MarketingPerformanceBarChart() {
    // Tìm giá trị cao nhất để highlight
    const maxValue = Math.max(...mockData.map(item => item.value));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card-dark/95 backdrop-blur-sm border border-primary/20 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold text-sm mb-1">
                        {payload[0].payload.title}
                    </p>
                    <p className="text-primary font-bold text-lg">
                        {payload[0].value} chuyển đổi
                    </p>
                </div>
            );
        }
        return null;
    };

    // Rút gọn tên bài marketing cho trục X
    const formatXAxis = (value: string) => {
        if (value.length > 20) {
            return value.substring(0, 18) + "...";
        }
        return value;
    };

    return (
        <section>
            <div className="glass neon-glow-purple p-8 rounded-[32px] border border-primary/10">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">
                        So sánh hiệu suất các nội dung Marketing
                    </h2>
                    <p className="text-slate-400 text-sm">
                        So sánh theo tổng lượt chuyển đổi (30 ngày)
                    </p>
                </div>

                <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={mockData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                        >
                            <XAxis
                                dataKey="title"
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                                tickLine={{ stroke: "#334155" }}
                                axisLine={{ stroke: "#334155" }}
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                tickFormatter={formatXAxis}
                            />
                            <YAxis
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                                tickLine={{ stroke: "#334155" }}
                                axisLine={{ stroke: "#334155" }}
                                label={{
                                    value: "Lượt chuyển đổi",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { fill: "#94a3b8", fontSize: 12 }
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124, 59, 237, 0.1)" }} />
                            <Bar
                                dataKey="value"
                                radius={[8, 8, 0, 0]}
                            >
                                {mockData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.value === maxValue ? "#7c3bed" : "#7c3bed80"}
                                        className="transition-all duration-300 hover:opacity-80"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend - Highlight bài có hiệu suất cao nhất */}
                <div className="mt-6 flex items-center justify-center gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-primary"></div>
                        <span className="text-xs text-slate-400">Hiệu suất cao nhất</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <div className="w-3 h-3 rounded-sm bg-primary/50"></div>
                        <span className="text-xs text-slate-400">Các bài khác</span>
                    </div>
                </div>
            </div>
        </section>
    );
}