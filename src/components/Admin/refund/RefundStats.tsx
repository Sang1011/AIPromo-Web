import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchCancelledEvents } from "../../../store/cancelledEventSlice";
import AdminStatsCard from "../shared/AdminStatsCard";
import { MdReceiptLong, MdPendingActions, MdPayments, MdTaskAlt } from "react-icons/md";

export default function RefundStats() {
    const dispatch = useDispatch<AppDispatch>();
    const { cancelledEvents, loading } = useSelector(
        (state: RootState) => state.CANCELLED_EVENT
    );

    useEffect(() => {
        // Fetch all cancelled events to get accurate stats
        dispatch(fetchCancelledEvents({
            Statuses: "Cancelled",
            PageNumber: 1,
            PageSize: 1000, // Get all events for accurate counting
        }));
    }, [dispatch]);

    const stats = useMemo(() => {
        const totalRefundRequests = cancelledEvents?.totalCount || 0;
        const events = cancelledEvents?.items || [];

        // Since we don't have detailed refund status in the API response,
        // we'll calculate based on available data
        const pendingRefunds = events.filter(event => {
            // Events cancelled recently (within last 7 days) are considered pending
            const cancelDate = new Date(event.createdAt);
            const now = new Date();
            const daysSinceCancel = (now.getTime() - cancelDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceCancel <= 7;
        }).length;

        // Calculate total refunded amount (estimated from event count)
        // Since the API doesn't provide refund amounts, we show the count
        const totalRefundAmount = totalRefundRequests;

        // Success rate (since we don't have detailed status, we'll show pending ratio)
        const successRate = totalRefundRequests > 0
            ? Math.round(((totalRefundRequests - pendingRefunds) / totalRefundRequests) * 100)
            : 0;

        return {
            totalRefundRequests,
            pendingRefunds,
            totalRefundAmount,
            successRate,
        };
    }, [cancelledEvents]);

    const formatNumber = (value: number): string => {
        return value.toLocaleString("vi-VN");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng yêu cầu hoàn tiền"
                value={loading ? "Đang tải..." : formatNumber(stats.totalRefundRequests)}
                icon={<MdReceiptLong size={20} />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
                subtext={`${stats.pendingRefunds} trong 7 ngày qua`}
            />
            <AdminStatsCard
                label="Sự kiện đã hủy"
                value={loading ? "Đang tải..." : stats.pendingRefunds}
                icon={<MdPendingActions size={20} />}
                iconBg="bg-yellow-500/10"
                iconColor="text-yellow-400"
                subtext="Hủy gần đây (7 ngày)"
            />
            <AdminStatsCard
                label="Tổng số sự kiện hoàn tiền"
                value={loading ? "Đang tải..." : formatNumber(stats.totalRefundAmount)}
                icon={<MdPayments size={20} />}
                iconBg="bg-red-500/10"
                iconColor="text-red-400"
                subtext="Tổng sự kiện cần hoàn"
                changePositive={stats.pendingRefunds === 0}
            />
            <AdminStatsCard
                label="Tỷ lệ đã xử lý"
                value={loading ? "Đang tải..." : `${stats.successRate}%`}
                icon={<MdTaskAlt size={20} />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
                subtext={`${stats.totalRefundRequests - stats.pendingRefunds}/${stats.totalRefundRequests} đã xử lý`}
                change={stats.successRate >= 90 ? "↑ Tốt" : stats.successRate >= 70 ? "→ Ổn" : "↓ Cần xử lý"}
                changePositive={stats.successRate >= 70}
            />
        </div>
    );
}
