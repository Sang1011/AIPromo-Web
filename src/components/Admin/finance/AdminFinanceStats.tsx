import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAdminPaymentTransactions } from "../../../store/paymentSlice";
import { fetchAdminReportsOverview } from "../../../store/adminReportsSlice";
import {
    MdTrendingUp,
    MdAccountBalanceWallet,
    MdOutbound,
    MdReceiptLong,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";

const PLATFORM_FEE_PERCENTAGE = 15; 

export default function AdminFinanceStats() {
    const dispatch = useDispatch<AppDispatch>();
    const { globalRevenue, loading: revenueLoading, error } = useSelector(
        (state: RootState) => state.REVENUE
    );
    const { data: reportsData } = useSelector((state: RootState) => state.ADMIN_REPORTS);
    const { adminTransactions, loading: transactionLoading } = useSelector(
        (state: RootState) => state.PAYMENT
    );

    useEffect(() => {
        dispatch(fetchAdminReportsOverview());
        dispatch(fetchAdminPaymentTransactions({
            PageNumber: 1,
            PageSize: 1,
            SortColumn: "CreatedAt",
            SortOrder: "desc",
        }));
    }, [dispatch]);

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const grossRevenue = reportsData?.kpis?.totalRevenue?.value ?? globalRevenue?.data?.grossRevenue ?? 0;
    const netRevenue = globalRevenue?.data?.netRevenue ?? 0;
    const eventCount = reportsData?.kpis?.events?.total ?? globalRevenue?.data?.eventCount ?? 0;
    const totalTransactions = adminTransactions?.totalCount ?? 0;

    // Calculate platform fee (15% of gross revenue)
    const platformFee = useMemo(() => {
        return (grossRevenue * PLATFORM_FEE_PERCENTAGE) / 100;
    }, [grossRevenue]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Doanh Thu"
                value={revenueLoading ? "Đang tải..." : formatCurrency(grossRevenue)}
                change={error ? "Lỗi" : `${eventCount} sự kiện`}
                subtext={error ? error : "tháng trước"}
                icon={<MdTrendingUp className="text-sm" />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
                showGradientBar
            />
            <AdminStatsCard
                label="Phí nền tảng"
                value={revenueLoading ? "Đang tải..." : formatCurrency(platformFee)}
                change={`${PLATFORM_FEE_PERCENTAGE}% phí`}
                subtext="chiết khấu từ tổng doanh thu"
                icon={<MdAccountBalanceWallet className="text-sm" />}
            />
            <AdminStatsCard
                label="Tổng Thanh toán"
                value={revenueLoading ? "Đang tải..." : formatCurrency(netRevenue)}
                change={error ? "Lỗi" : `${eventCount} sự kiện`}
                subtext={error ? error : "đang chờ duyệt"}
                icon={<MdOutbound className="text-sm" />}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-400"
            />
            <AdminStatsCard
                label="Giao dịch"
                value={transactionLoading.adminTransactions ? "Đang tải..." : totalTransactions.toLocaleString("vi-VN")}
                icon={<MdReceiptLong className="text-sm" />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
            />
        </div>
    );
}
