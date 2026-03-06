import {
    MdCalendarMonth,
    MdPendingActions,
    MdStadium,
    MdPayments,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";

export default function AdminEventStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Sự kiện"
                value="1,482"
                change="+5.2%"
                subtext="vs last month"
                icon={<MdCalendarMonth className="text-sm" />}
            />
            <AdminStatsCard
                label="Chờ Phê duyệt"
                value="24"
                change="Requires Action"
                changePositive={false}
                icon={<MdPendingActions className="text-sm" />}
                iconBg="bg-amber-500/10"
                iconColor="text-amber-400"
            />
            <AdminStatsCard
                label="Sự kiện Đang diễn ra"
                value="86"
                change="12 started today"
                icon={<MdStadium className="text-sm" />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
            />
            <AdminStatsCard
                label="Doanh thu Vé"
                value="$124.5k"
                icon={<MdPayments className="text-sm" />}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-400"
            >
                <div className="flex items-end gap-1 h-6 mt-2">
                    <div className="w-1 bg-primary/20 rounded-full h-1/2" />
                    <div className="w-1 bg-primary/20 rounded-full h-3/4" />
                    <div className="w-1 bg-primary rounded-full h-full" />
                    <div className="w-1 bg-primary/40 rounded-full h-2/3" />
                    <div className="w-1 bg-primary/20 rounded-full h-1/2" />
                </div>
            </AdminStatsCard>
        </div>
    );
}
