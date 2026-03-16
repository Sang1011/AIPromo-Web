import { MdTag, MdTrendingUp, MdAdd } from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";

export default function AdminHashtagStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Hashtag"
                value="412"
                change="+8%"
                subtext="trong tháng"
                icon={<MdTag className="text-sm" />}
                showGradientBar
            />
            <AdminStatsCard
                label="Hashtag thịnh hành"
                value="#MusicFest"
                icon={<MdTrendingUp className="text-sm" />}
                iconBg="bg-indigo-500/10"
                iconColor="text-indigo-400"
            />
            <AdminStatsCard
                label="Mới hôm nay"
                value="7"
                icon={<MdAdd className="text-sm" />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
            />
        </div>
    );
}
