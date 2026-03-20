import AdminCategoryStats from "../../components/Admin/categories/AdminCategoryStats";
import AdminCategoryTable from "../../components/Admin/categories/AdminCategoryTable";

export default function AdminCategoryPage() {
    return (
        <div className="space-y-8">
            <AdminCategoryStats />
            <AdminCategoryTable />
        </div>
    );
}
