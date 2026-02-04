import DashboardLayout from "../../components/Organizer/DashboardLayout";
import ReportTable from "../../components/Organizer/ReportTable";

export default function ReportManagement() {
    return (
        <DashboardLayout title="Quản lý báo cáo">
            <div className="space-y-6">
                <ReportTable />
            </div>
        </DashboardLayout>
    );
}
