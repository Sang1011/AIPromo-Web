import AdminLogsHeader from "../../components/Admin/logs/AdminLogsHeader";
import AdminLogsTable from "../../components/Admin/logs/AdminLogsTable";
import AdminLogsSummaryCards from "../../components/Admin/logs/AdminLogsSummaryCards";

export default function SystemLogsPage() {
    return (
        <div className="space-y-8">
            <AdminLogsHeader />
            <AdminLogsTable />
            <AdminLogsSummaryCards />
        </div>
    );
}
