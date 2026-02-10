import { MdFacebook, MdOutlinePhotoCamera } from "react-icons/md";

const platformMetrics = [
    {
        platform: "AIPromo",
        icon: "A",
        color: "bg-violet-800",
        totalVisits: "4,184",
        newUsers: "2,420",
    },
    {
        platform: "Facebook",
        icon: <MdFacebook />,
        color: "bg-violet-500",
        totalVisits: "2,184",
        newUsers: "1,420",
    },
    {
        platform: "Instagram",
        icon: <MdOutlinePhotoCamera />,
        color: "bg-pink-500",
        totalVisits: "284",
        newUsers: "184",
    },
];

export default function PlatformPerformanceTable() {
    return (
        <div className="glass rounded-[32px] p-8 border border-primary/10">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2">
                    Hiệu quả theo nền tảng Marketing
                </h3>
                <p className="text-slate-400 text-xs">
                    So sánh chi tiết hiệu suất trên từng nền tảng
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Nền tảng
                            </th>
                            <th className="text-right py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Tổng lượt truy cập
                            </th>
                            <th className="text-right py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Người dùng mới
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {platformMetrics.map((metric, idx) => (
                            <tr
                                key={metric.platform}
                                className={`border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors ${idx === 0 ? "bg-slate-900/10" : ""
                                    }`}
                            >
                                <td className="py-5 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`${metric.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                                            {metric.icon}
                                        </div>
                                        <span className="font-bold text-white text-sm">
                                            {metric.platform}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-5 px-4 text-right">
                                    <div className="font-bold text-white text-lg">
                                        {metric.totalVisits}
                                    </div>
                                    <div className="text-xs text-slate-500 font-semibold mt-1">
                                        lượt truy cập
                                    </div>
                                </td>
                                <td className="py-5 px-4 text-right">
                                    <div className="font-bold text-primary text-lg">
                                        {metric.newUsers}
                                    </div>
                                    <div className="text-xs text-slate-500 font-semibold mt-1">
                                        người dùng
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tổng kết */}
            <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-semibold">
                    Tổng cộng 2 nền tảng
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Tổng truy cập</div>
                        <div className="font-bold text-white text-lg">2,468</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Tổng người dùng mới</div>
                        <div className="font-bold text-primary text-lg">1,604</div>
                    </div>
                </div>
            </div>
        </div>
    );
}