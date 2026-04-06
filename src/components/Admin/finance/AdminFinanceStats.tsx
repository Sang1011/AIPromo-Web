import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchGlobalRevenue } from "../../../store/revenueSlice";
import {
    MdTrendingUp,
    MdAccountBalanceWallet,
    MdOutbound,
    MdReceiptLong,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";

export default function AdminFinanceStats() {
    const dispatch = useDispatch<AppDispatch>();
    const { globalRevenue, loading, error } = useSelector(
        (state: RootState) => state.REVENUE
    );

    useEffect(() => {
        dispatch(fetchGlobalRevenue());
    }, [dispatch]);

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const grossRevenue = globalRevenue?.data?.grossRevenue ?? 0;
    const netRevenue = globalRevenue?.data?.netRevenue ?? 0;
    const eventCount = globalRevenue?.data?.eventCount ?? 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Doanh Thu"
                value={loading ? "Đang tải..." : formatCurrency(grossRevenue)}
                change={error ? "Lỗi" : `${eventCount} sự kiện`}
                subtext={error ? error : "tháng trước"}
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
                value={loading ? "Đang tải..." : formatCurrency(netRevenue)}
                change={error ? "Lỗi" : `${eventCount} sự kiện`}
                subtext={error ? error : "đang chờ duyệt"}
                icon={<MdOutbound className="text-sm" />}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-400"
            />
            <AdminStatsCard
                label="Giao dịch"
                value="4,812"
                change="+210"
                subtext="trong 24 giờ qua"
                icon={<MdReceiptLong className="text-sm" />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
            />
        </div>
    );
}
