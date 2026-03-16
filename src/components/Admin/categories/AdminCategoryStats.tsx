import {
    MdCategory,
    MdAddBox,
    MdList,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";

export default function AdminCategoryStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Category"
                value="128"
                change="+2%"
                subtext="trong tháng"
                icon={<MdCategory className="text-sm" />}
                showGradientBar
            />
            <AdminStatsCard
                label="Category hoạt động"
                value="112"
                icon={<MdList className="text-sm" />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
            />
            <AdminStatsCard
                label="Mới hôm nay"
                value="3"
                icon={<MdAddBox className="text-sm" />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
            />
        </div>
    );
}
