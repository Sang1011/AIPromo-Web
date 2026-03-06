import {
    MdTrendingUp,
    MdGroup,
    MdCalendarToday,
    MdConfirmationNumber,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";

export default function AdminDashboardStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Doanh Thu"
                value="$45,280.50"
                change="+12.5%"
                subtext="so với tháng trước"
                icon={<MdTrendingUp className="text-sm" />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
                showGradientBar
            />
            <AdminStatsCard
                label="Người dùng Hoạt động"
                value="12,480"
                icon={<MdGroup className="text-sm" />}
            >
                <div className="w-full bg-[#302447] h-1.5 rounded-full overflow-hidden flex mt-2">
                    <div className="bg-primary h-full w-[35%]" />
                    <div className="bg-indigo-400 h-full w-[65%]" />
                </div>
                <div className="flex justify-between mt-3">
                    <span className="text-[10px] text-[#a592c8] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                        Người Tổ chức (35%)
                    </span>
                    <span className="text-[10px] text-[#a592c8] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />{" "}
                        Người tham dự (65%)
                    </span>
                </div>
            </AdminStatsCard>
            <AdminStatsCard
                label="Tổng Sự kiện"
                value="1,240"
                change="+42"
                subtext="live events now"
                icon={<MdCalendarToday className="text-sm" />}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-400"
            />
            <AdminStatsCard
                label="Bán Vé"
                value="8,500"
                icon={<MdConfirmationNumber className="text-sm" />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
            >
                <div className="flex items-end gap-1 h-8 mt-2">
                    <div className="w-1.5 bg-primary/20 rounded-full h-1/2" />
                    <div className="w-1.5 bg-primary/20 rounded-full h-3/4" />
                    <div className="w-1.5 bg-primary rounded-full h-full" />
                    <div className="w-1.5 bg-primary/40 rounded-full h-2/3" />
                    <div className="w-1.5 bg-primary/20 rounded-full h-1/2" />
                </div>
            </AdminStatsCard>
        </div>
    );
}
