import {
    MdTrendingUp,
    MdAccountBalanceWallet,
    MdOutbound,
    MdReceiptLong,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";

export default function AdminFinanceStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Doanh Thu"
                value="$128,450.00"
                change="+14.2%"
                subtext="from last month"
                icon={<MdTrendingUp className="text-sm" />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
                showGradientBar
            />
            <AdminStatsCard
                label="Phí nền tảng"
                value="$19,267.50"
                change="15% Fee"
                subtext="platform average"
                icon={<MdAccountBalanceWallet className="text-sm" />}
            />
            <AdminStatsCard
                label="Tổng Thanh toán"
                value="$102,182.50"
                change="84"
                subtext="pending approvals"
                icon={<MdOutbound className="text-sm" />}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-400"
            />
            <AdminStatsCard
                label="Giao dịch"
                value="4,812"
                change="+210"
                subtext="in last 24h"
                icon={<MdReceiptLong className="text-sm" />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
            />
        </div>
    );
}
