import AdminDashboardStats from "../../components/Admin/dashboard/AdminDashboardStats";
import AdminRevenueChart from "../../components/Admin/dashboard/AdminRevenueChart";
import AdminUserDistribution from "../../components/Admin/dashboard/AdminUserDistribution";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <AdminDashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <AdminRevenueChart />
                <AdminUserDistribution />
            </div>      
        </div>
    );
}
