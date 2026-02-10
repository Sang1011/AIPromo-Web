import RevenueCards from "../../components/Organizer/overview/RevenueCard";
import RevenueChart from "../../components/Organizer/overview/RevenueChart";
import TicketSummaryTable from "../../components/Organizer/ticket/TicketSummaryTable";

export default function SummaryPage() {
    return (
        <div className="space-y-8">
            {/* KPI cards */}
            <RevenueCards />

            {/* Chart */}
            <RevenueChart />

            {/* Detail table */}
            <TicketSummaryTable />
        </div>
    );
}
