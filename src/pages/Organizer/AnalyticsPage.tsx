import AnalyticsCards from "../../components/Organizer/AnalyticsCards";
import ManagementLayout from "../../components/Organizer/ManagementLayout";
import TrafficChart from "../../components/Organizer/TrafficChart";
import TrafficSourceDonut from "../../components/Organizer/TrafficSourceDonut";
import TrafficSourceTable from "../../components/Organizer/TrafficSourceTable";


export default function AnalyticsPage() {
    return (
        <ManagementLayout>
            <div className="space-y-8">
                <AnalyticsCards />

                <TrafficChart />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <TrafficSourceDonut />
                    <TrafficSourceTable />
                </div>
            </div>
        </ManagementLayout>
    );
}
