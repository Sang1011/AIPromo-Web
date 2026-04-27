import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
    MdCalendarMonth,
    MdPendingActions,
    MdStadium,
    MdPayments,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";
import type { RootState } from "../../../store";

// Không gọi API ở đây — AdminEventModerationTable đã fetch PageSize=1000
// vào store chung, Stats chỉ đọc lại allEvents từ store.
export default function AdminEventStats() {
    const { allEvents, pagination, loading } = useSelector(
        (state: RootState) => state.ADMIN_EVENT
    );

    const stats = useMemo(() => {
        const totalEvents = pagination?.totalCount ?? allEvents.length;

        const pendingReview = allEvents.filter((e) => e.status === "PendingReview").length;
        const published = allEvents.filter((e) => e.status === "Published").length;
        const ongoing = allEvents.filter((e) => {
            const now = new Date();
            const start = new Date(e.eventStartAt);
            const end = new Date(e.eventEndAt);
            return e.status === "Published" && now >= start && now <= end;
        }).length;

        return { totalEvents, pendingReview, published, ongoing };
    }, [allEvents, pagination]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Sự kiện"
                value={loading ? "..." : stats.totalEvents.toLocaleString("vi-VN")}
                change={`${stats.published} đã duyệt`}
                icon={<MdCalendarMonth className="text-sm" />}
            />
            <AdminStatsCard
                label="Chờ Phê duyệt"
                value={loading ? "..." : stats.pendingReview}
                change={stats.pendingReview > 0 ? "Cần xử lí" : "Không có yêu cầu"}
                changePositive={stats.pendingReview === 0}
                icon={<MdPendingActions className="text-sm" />}
                iconBg="bg-amber-500/10"
                iconColor="text-amber-400"
            />
            <AdminStatsCard
                label="Sự kiện Đang diễn ra"
                value={loading ? "..." : stats.ongoing}
                change={`${stats.published} đang hoạt động`}
                icon={<MdStadium className="text-sm" />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
            />
            <AdminStatsCard
                label="Sự kiện Đã duyệt"
                value={loading ? "..." : stats.published.toLocaleString("vi-VN")}
                icon={<MdPayments className="text-sm" />}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-400"
            >
                <div className="flex items-end gap-1 h-6 mt-2">
                    <div className="w-1 bg-primary/20 rounded-full h-1/2" />
                    <div className="w-1 bg-primary/20 rounded-full h-3/4" />
                    <div className="w-1 bg-primary rounded-full h-full" />
                    <div className="w-1 bg-primary/40 rounded-full h-2/3" />
                    <div className="w-1 bg-primary/20 rounded-full h-1/2" />
                </div>
            </AdminStatsCard>
        </div>
    );
}