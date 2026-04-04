import { useSelector } from "react-redux";
import type { RootState } from "../../../store";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";
const neonGlow = "shadow-[0_0_15px_rgba(124,59,237,0.4)]";

export default function AdminUserDistribution() {
    const { data, loading } = useSelector((state: RootState) => state.ADMIN_REPORTS);

    if (loading || !data) {
        return (
            <div className={`${glassCard} rounded-xl p-8 animate-pulse`}>
                <div className="h-6 bg-[#302447] rounded w-32 mb-2" />
                <div className="h-4 bg-[#302447] rounded w-48 mb-10" />
                <div className="w-48 h-48 mx-auto bg-[#302447] rounded-full" />
                <div className="mt-8 space-y-4">
                    <div className="h-6 bg-[#302447] rounded" />
                    <div className="h-6 bg-[#302447] rounded" />
                </div>
            </div>
        );
    }

    const userDist = data.userDistribution;
    const circumference = 2 * Math.PI * 80; // r = 80
    const organizersOffset = (userDist.organizers.percentage / 100) * circumference;
    const attendeesOffset = (userDist.attendees.percentage / 100) * circumference;

    return (
        <div className={`${glassCard} rounded-xl p-8`}>
            <h2 className="text-lg font-bold text-white mb-2">
                Phân bổ Người dùng
            </h2>
            <p className="text-[#a592c8] text-sm mb-10">
                Tỷ lệ Người tổ chức so với Người tham dự
            </p>
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={96}
                        cy={96}
                        fill="transparent"
                        r={80}
                        stroke="#302447"
                        strokeWidth={20}
                    />
                    
                    {/* Attendees segment (larger, primary color) */}
                    <circle
                        className={neonGlow}
                        cx={96}
                        cy={96}
                        fill="transparent"
                        r={80}
                        stroke="#7c3bed"
                        strokeDasharray={`${attendeesOffset}, ${circumference}`}
                        strokeDashoffset="0"
                        strokeWidth={20}
                        strokeLinecap="round"
                    />
                    
                    {/* Organizers segment (smaller, different color) */}
                    <circle
                        cx={96}
                        cy={96}
                        fill="transparent"
                        r={80}
                        stroke="#6366f1"
                        strokeDasharray={`${organizersOffset}, ${circumference}`}
                        strokeDashoffset={`-${attendeesOffset}`}
                        strokeWidth={20}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                        {userDist.growthRate}%
                    </span>
                    <span className="text-[10px] text-[#a592c8] uppercase font-bold tracking-widest">
                        Tăng trưởng
                    </span>
                </div>
            </div>
            <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span className="text-sm text-white">
                            Người tham dự
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-[#a592c8]">
                            ({userDist.attendees.percentage}%)
                        </span>
                        <span className="text-sm font-bold text-white">
                            {userDist.attendees.count.toLocaleString("vi-VN")}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span className="text-sm text-white">
                            Người tổ chức
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-[#a592c8]">
                            ({userDist.organizers.percentage}%)
                        </span>
                        <span className="text-sm font-bold text-white">
                            {userDist.organizers.count.toLocaleString("vi-VN")}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
