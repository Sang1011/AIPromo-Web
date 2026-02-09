import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";

const data = [
    { name: "Facebook", value: 68 },
    { name: "Instagram", value: 32 },
];

const COLORS = ["#8B5CF6", "#EC4899"];

export default function TrafficSourceDonut() {
    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-1">
                Đóng góp Marketing
            </h3>
            <p className="text-xs text-slate-400 mb-4">
                Chỉ bao gồm Facebook & Instagram (ngoài nền tảng)
            </p>

            <div className="h-[260px]">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {data.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={COLORS[i]}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4 text-sm">
                {data.map((d, i) => (
                    <div
                        key={d.name}
                        className="flex justify-between text-slate-300"
                    >
                        <span className="flex items-center gap-2">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: COLORS[i] }}
                            />
                            {d.name}
                        </span>
                        <span>{d.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
