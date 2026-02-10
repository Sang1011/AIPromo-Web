import AnalyticsCards from "../../components/Organizer/analytics/AnalyticsCards";
import TrafficChart from "../../components/Organizer/traffic/TrafficChart";
import TrafficSourceDonut from "../../components/Organizer/traffic/TrafficSourceDonut";
import TrafficSourceTable from "../../components/Organizer/traffic/TrafficSourceTable";


export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <AnalyticsCards />
            <TrafficChart />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TrafficSourceDonut />
                <TrafficSourceTable />
            </div>
        </div>
    );
}
