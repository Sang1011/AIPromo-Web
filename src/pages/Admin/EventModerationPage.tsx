import AdminEventStats from "../../components/Admin/events/AdminEventStats";
import AdminEventModerationTable from "../../components/Admin/events/AdminEventModerationTable";

export default function EventModerationPage() {
    return (
        <div className="space-y-8">
            <AdminEventStats />
            <AdminEventModerationTable />
        </div>
    );
}
