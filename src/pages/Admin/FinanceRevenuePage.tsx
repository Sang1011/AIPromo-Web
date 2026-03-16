import AdminFinanceStats from "../../components/Admin/finance/AdminFinanceStats";
import AdminRevenueGrowthChart from "../../components/Admin/finance/AdminRevenueGrowthChart";
import AdminFinanceTransactionsTable from "../../components/Admin/finance/AdminFinanceTransactionsTable";

export default function FinanceRevenuePage() {
    return (
        <div className="space-y-8">
            <AdminFinanceStats />
            <AdminRevenueGrowthChart />
            <AdminFinanceTransactionsTable />
        </div>
    );
}
