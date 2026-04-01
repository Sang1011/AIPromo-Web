import {
    MdQueryStats,
    MdPendingActions,
    MdPayments,
    MdReport
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";

export default function WithdrawalStats() {
    const { withdrawalList } = useSelector((state: RootState) => state.WITHDRAWAL);
    
    const items = withdrawalList?.data?.items || [];
    const totalCount = withdrawalList?.data?.totalCount || 0;
    
    // Calculate stats from API data
    const totalRequests = totalCount;
    const pendingCount = items.filter(item => item.status === "Pending").length;
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const rejectedCount = items.filter(item => item.status === "Rejected").length;
    const rejectionRate = totalRequests > 0 ? ((rejectedCount / totalRequests) * 100).toFixed(1) : "0";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Số Yêu Cầu"
                value={totalRequests.toLocaleString()}
                change="+0%"
                subtext="so với tháng trước"
                icon={<MdQueryStats className="text-sm" />}
                iconBg="bg-emerald-400/10"
                iconColor="text-emerald-400"
                showGradientBar
            />

            <AdminStatsCard
                label="Chờ Phê Duyệt"
                value={pendingCount.toLocaleString()}
                change=""
                subtext="Cần xử lý gấp"
                icon={<MdPendingActions className="text-sm" />}
                iconBg="bg-[#7c3bed]/10"
                iconColor="text-[#7c3bed]"
            />

            <AdminStatsCard
                label="Tổng Tiền Rút"
                value={new Intl.NumberFormat("vi-VN").format(totalAmount) + " ₫"}
                change=""
                subtext="Hôm nay: 0 ₫"
                icon={<MdPayments className="text-sm" />}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-400"
            />

            <AdminStatsCard
                label="Tỷ Lệ Từ Chối"
                value={`${rejectionRate}%`}
                change="-0%"
                subtext="trong tuần qua"
                icon={<MdReport className="text-sm" />}
                iconBg="bg-red-500/10"
                iconColor="text-red-400"
                changePositive={true}
            />
        </div>
    );
}
