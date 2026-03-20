import AdminHashtagStats from "../../components/Admin/hashtags/AdminHashtagStats";
import AdminHashtagTable from "../../components/Admin/hashtags/AdminHashtagTable";

export default function AdminHashtagPage() {
    return (
        <div className="space-y-8">
            <AdminHashtagStats />
            <AdminHashtagTable />
        </div>
    );
}
