import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const platformData = [
    { name: "AIPromo", value: 61 },
    { name: "Facebook", value: 35 },
    { name: "Instagram", value: 14 },
];

const COLORS = {
    AIPromo: "#8884d8",
    Facebook: "#8B5CF6",
    Instagram: "#EC4899",
};

export default function PlatformContributionDonut() {
    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card-dark/95 backdrop-blur-sm border border-primary/20 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold text-sm mb-1">
                        {payload[0].name}
                    </p>
                    <p className="text-primary font-bold text-lg">
                        {payload[0].value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom label hiển thị % bên trong donut
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                className="font-bold text-sm"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="glass rounded-[32px] p-8 border border-primary/10">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2">
                    Đóng góp Marketing theo nền tảng
                </h3>
                <p className="text-slate-400 text-xs">
                    Chỉ bao gồm Facebook & Instagram (nền tảng ngoài)
                </p>
            </div>

            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={platformData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={100}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            strokeWidth={2}
                            stroke="#0B0B12"
                        >
                            {platformData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[entry.name as keyof typeof COLORS]}
                                    className="transition-all duration-300 hover:opacity-80"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
                {platformData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
                        ></div>
                        <span className="text-sm text-slate-300 font-semibold">
                            {entry.name}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                            ({entry.value}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}