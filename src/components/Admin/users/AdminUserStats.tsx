import {
    MdGroup,
    MdBusinessCenter,
    MdPerson,
    MdPersonAdd,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";

export default function AdminUserStats() {

    const { users } = useSelector((state: RootState) => state.USER);

    // ===================== CALCULATE =====================
    const totalUsers = users.length;

    const organizers = users.filter((u: any) =>
        u.roles?.includes("Organizer")
    ).length;

    const attendees = users.filter((u: any) =>
        !u.roles?.includes("Organizer")
    ).length;

    const today = new Date().toDateString();

    const newToday = users.filter((u: any) => {
        if (!u.createdAt) return false;
        return new Date(u.createdAt).toDateString() === today;
    }).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Người dùng"
                value={totalUsers.toLocaleString()}
                change="+0%" // nếu chưa có API thống kê thì để tạm
                subtext="from system"
                icon={<MdGroup className="text-sm" />}
                showGradientBar
            />

            <AdminStatsCard
                label="Người tổ chức"
                value={organizers.toLocaleString()}
                change="+0"
                subtext="organizers"
                icon={<MdBusinessCenter className="text-sm" />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
            />

            <AdminStatsCard
                label="Người tham dự"
                value={attendees.toLocaleString()}
                change="+0"
                subtext="attendees"
                icon={<MdPerson className="text-sm" />}
                iconBg="bg-indigo-500/10"
                iconColor="text-indigo-400"
            />

            <AdminStatsCard
                label="Mới hôm nay"
                value={newToday.toLocaleString()}
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