const sources = [
    {
        name: "Facebook",
        total: 2184,
        newUsers: 1420,
    },
    {
        name: "Instagram",
        total: 284,
        newUsers: 184,
    },
];
export default function TrafficSourceTable() {
    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                    Hiệu quả theo nền tảng Marketing
                </h3>
                <button className="text-primary text-sm">
                    Xem chi tiết Marketing →
                </button>
            </div>

            <div className="divide-y divide-white/5">
                {sources.map((s) => (
                    <div
                        key={s.name}
                        className="grid grid-cols-3 py-3 text-sm text-slate-300"
                    >
                        <span>{s.name}</span>
                        <span className="text-right">
                            {s.total.toLocaleString()}
                        </span>
                        <span className="text-right text-emerald-400">
                            +{s.newUsers.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
