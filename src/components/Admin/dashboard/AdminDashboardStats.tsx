import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { fetchAdminReportsOverview } from "../../../store/adminReportsSlice";
import {
    MdTrendingUp,
    MdGroup,
    MdCalendarToday,
    MdConfirmationNumber,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";

export default function AdminDashboardStats() {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading } = useSelector((state: RootState) => state.ADMIN_REPORTS);

    useEffect(() => {
        dispatch(fetchAdminReportsOverview());
    }, [dispatch]);

    if (loading || !data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-32 bg-[#302447] rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat("vi-VN").format(num);
    };

    const formatCurrency = (num: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(num);
    };

    const formatPercentage = (rate: number): string => {
        return `${rate >= 0 ? "+" : ""}${rate}%`;
    };

    const revenueData = data.kpis.totalRevenue;
    const activeUsersData = data.kpis.activeUsers;
    const eventsData = data.kpis.events;
    const ticketsData = data.kpis.ticketsSold;
    const userDistData = data.userDistribution;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Doanh Thu"
                value={formatCurrency(revenueData.value)}
                change={formatPercentage(revenueData.monthlyGrowthRate || 0)}
                subtext="so với tháng trước"
                icon={<MdTrendingUp className="text-sm" />}
                iconBg={revenueData.isPositiveGrowth ? "bg-emerald-500/10" : "bg-red-500/10"}
                iconColor={revenueData.isPositiveGrowth ? "text-emerald-400" : "text-red-400"}
                showGradientBar
            />
            <AdminStatsCard
                label="Người dùng Hoạt động"
                value={formatNumber(activeUsersData.total)}
                icon={<MdGroup className="text-sm" />}
            >
                <div className="w-full bg-[#302447] h-1.5 rounded-full overflow-hidden flex mt-2">
                    <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ width: `${userDistData.organizers.percentage}%` }} 
                    />
                    <div 
                        className="bg-indigo-400 h-full rounded-full" 
                        style={{ width: `${userDistData.attendees.percentage}%` }} 
                    />
                </div>
                <div className="flex justify-between mt-3">
                    <span className="text-[10px] text-[#a592c8] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                        Người Tổ chức ({userDistData.organizers.percentage}%)
                    </span>
                    <span className="text-[10px] text-[#a592c8] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />{" "}
                        Người tham dự ({userDistData.attendees.percentage}%)
                    </span>
                </div>
            </AdminStatsCard>
            <AdminStatsCard
                label="Tổng Sự kiện"
                value={formatNumber(eventsData.total)}
                change={`+${eventsData.liveNow}`}
                subtext="live events now"
                icon={<MdCalendarToday className="text-sm" />}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-400"
            />
            <AdminStatsCard
                label="Bán Vé"
                value={formatNumber(ticketsData.total)}
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
