import StaffStatsCards from "../../components/Staff/dashboard/StaffStatsCards";
import StaffRecentActivityTable from "../../components/Staff/dashboard/StaffRecentActivityTable";

export default function StaffDashboardPage() {
    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h3 className="text-3xl font-black tracking-tight mb-2 uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                    TỔNG QUAN HỆ THỐNG
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                    Báo cáo tổng quát về hoạt động của hệ thống AIPromo và các chỉ
                    số vận hành quan trọng.
                </p>
            </div>
            <StaffStatsCards />
            <StaffRecentActivityTable />
        </div>
    );
}
