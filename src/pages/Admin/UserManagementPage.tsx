import AdminUserStats from "../../components/Admin/users/AdminUserStats";
import AdminUserManagementTable from "../../components/Admin/users/AdminUserManagementTable";

export default function UserManagementPage() {
    return (
        <div className="space-y-8">
            <AdminUserStats />
            <AdminUserManagementTable />
        </div>
    );
}
