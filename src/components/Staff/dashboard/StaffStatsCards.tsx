import { MdArrowUpward } from "react-icons/md";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.1)]";

const stats = [
    {
        label: "Tổng sự kiện hệ thống",
        value: "1,284",
        change: "12%",
    },
    {
        label: "Sự kiện đã phê duyệt",
        value: "856",
        change: "8%",
    },
    {
        label: "Số lượng vé đã bán",
        value: "15,420",
        change: "24%",
    },
];

export default function StaffStatsCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={`${glassCard} p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group`}
                >
                    <div className="absolute -right-4 -top-4 size-24 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {stat.label}
                    </p>
                    <div className="flex items-end gap-3">
                        <h4 className="text-3xl font-bold">{stat.value}</h4>
                        <span className="text-emerald-500 text-xs font-bold mb-1.5 flex items-center">
                            <MdArrowUpward className="text-xs mr-0.5" />{" "}
                            {stat.change}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
