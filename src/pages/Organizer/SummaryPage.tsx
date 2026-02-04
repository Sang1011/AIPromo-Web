import ManagementLayout from "../../components/Organizer/ManagementLayout";
import RevenueCards from "../../components/Organizer/RevenueCard";
import RevenueChart from "../../components/Organizer/RevenueChart";
import TicketSummaryTable from "../../components/Organizer/TicketSummaryTable";

export default function SummaryPage() {
    return (
        <ManagementLayout>
            <div className="space-y-8">
                {/* KPI cards */}
                <RevenueCards />

                {/* Chart */}
                <RevenueChart />

                {/* Detail table */}
                <TicketSummaryTable />
            </div>
        </ManagementLayout>
    );
}
