const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.1)]";

const stats = [
    {
        label: "Hồ sơ đang chờ",
        value: "15",
        valueColor: "text-amber-500",
        blurColor: "bg-amber-500/10",
    },
    {
        label: "Đã xác minh hôm nay",
        value: "8",
        valueColor: "text-emerald-500",
        blurColor: "bg-emerald-500/10",
    },
    {
        label: "Thời gian xử lý TB",
        value: "20",
        suffix: "phút",
        valueColor: "text-primary",
        blurColor: "bg-primary/10",
    },
];

export default function StaffOrganizerStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={`${glassCard} p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group`}
                >
                    <div
                        className={`absolute -right-4 -top-4 size-24 ${stat.blurColor} rounded-full blur-3xl group-hover:opacity-80 transition-all`}
                    />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {stat.label}
                    </p>
                    <h4
                        className={`text-3xl font-bold ${stat.valueColor}`}
                    >
                        {stat.value}{" "}
                        {stat.suffix && (
                            <span className="text-lg font-normal">
                                {stat.suffix}
                            </span>
                        )}
                    </h4>
                </div>
            ))}
        </div>
    );
}
