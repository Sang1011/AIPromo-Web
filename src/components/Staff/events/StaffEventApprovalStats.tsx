import { MdPendingActions, MdTaskAlt, MdSchedule, MdHistory } from "react-icons/md";

const glassCard =
    "bg-[rgba(24,18,43,0.6)] backdrop-blur-[16px] border border-[rgba(124,64,237,0.15)]";

const stats = [
    {
        label: "Sự kiện đang chờ",
        value: "24",
        badge: "+5",
        badgeColor: "bg-emerald-500/10 text-emerald-400",
        icon: MdPendingActions,
    },
    {
        label: "Đã xử lý hôm nay",
        value: "12",
        badge: "Hôm nay",
        badgeColor: "bg-primary/20 text-primary",
        icon: MdTaskAlt,
    },
    {
        label: "Thời gian phản hồi",
        value: "15",
        suffix: "phút",
        icon: MdSchedule,
    },
];

export default function StaffEventApprovalStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                <div
                    key={stat.label}
                    className={`relative group overflow-hidden ${glassCard} p-8 rounded-3xl transition-all hover:scale-[1.02]`}
                >
                    <div className="absolute top-0 right-0 p-8">
                        <Icon className="text-primary/20 text-5xl" />
                    </div>
                    <div className="absolute -right-10 -bottom-10 size-40 bg-primary/10 rounded-full blur-[80px]" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                        {stat.label}
                    </p>
                    <div className="flex items-baseline gap-4">
                        <h4 className="text-6xl font-black text-white tracking-tighter">
                            {stat.value}
                        </h4>
                        {stat.badge && (
                            <div
                                className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold ${stat.badgeColor}`}
                            >
                                {stat.badge === "Hôm nay" && (
                                    <MdHistory className="text-sm mr-1" />
                                )}
                                {stat.badge === "+5" && (
                                    <span className="mr-1">↑</span>
                                )}
                                {stat.badge}
                            </div>
                        )}
                        {stat.suffix && (
                            <span className="text-xl font-bold text-slate-500">
                                {stat.suffix}
                            </span>
                        )}
                    </div>
                </div>
                );
            })}
        </div>
    );
}
