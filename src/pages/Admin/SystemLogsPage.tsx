import AdminLogsHeader from "../../components/Admin/systemlogs/AdminLogsHeader";
import AdminLogsTable from "../../components/Admin/systemlogs/AdminLogsTable";
import AdminLogsSummaryCards from "../../components/Admin/systemlogs/AdminLogsSummaryCards";

export default function SystemLogsPage() {
    return (
        <div className="space-y-8">
            <AdminLogsHeader />
            <AdminLogsTable />
            <AdminLogsSummaryCards />
        </div>
    );
}
