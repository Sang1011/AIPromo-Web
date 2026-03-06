import {
    MdGroup,
    MdBusinessCenter,
    MdPerson,
    MdPersonAdd,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";

export default function AdminUserStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Người dùng"
                value="24,512"
                change="+5.2%"
                subtext="from last month"
                icon={<MdGroup className="text-sm" />}
                showGradientBar
            />
            <AdminStatsCard
                label="Người tổ chức"
                value="3,842"
                change="+12"
                subtext="verified today"
                icon={<MdBusinessCenter className="text-sm" />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
            />
            <AdminStatsCard
                label="Người tham dự"
                value="20,670"
                change="+184"
                subtext="new registrations"
                icon={<MdPerson className="text-sm" />}
                iconBg="bg-indigo-500/10"
                iconColor="text-indigo-400"
            />
            <AdminStatsCard
                label="Mới hôm nay"
                value="196"
                icon={<MdPersonAdd className="text-sm" />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
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
