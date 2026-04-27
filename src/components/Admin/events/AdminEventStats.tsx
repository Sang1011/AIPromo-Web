import { useEffect, useMemo, useState } from "react";
import {
    MdCalendarMonth,
    MdPendingActions,
    MdStadium,
    MdPayments,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";

// Kiểu dữ liệu tối thiểu cần cho stats (không import từ slice để tránh coupling)
interface EventSummary {
    status: string;
    eventStartAt: string;
    eventEndAt: string;
}

interface StatsState {
    events: EventSummary[];
    totalCount: number;
    loading: boolean;
}

// Gọi API trực tiếp, không qua Redux → không conflict với AdminEventModerationTable
async function fetchStatsEvents(): Promise<{ events: EventSummary[]; totalCount: number }> {
    // Bước 1: Lấy totalCount bằng 1 request nhỏ
    const firstRes = await fetch("/api/events?PageNumber=1&PageSize=1");
    if (!firstRes.ok) throw new Error("Failed to fetch stats");
    const firstData = await firstRes.json();
    const totalCount: number = firstData.totalCount ?? 0;

    if (totalCount === 0) return { events: [], totalCount: 0 };

    // Bước 2: Lấy toàn bộ events để tính stats (chỉ cần status + dates)
    const allRes = await fetch(`/api/events?PageNumber=1&PageSize=${totalCount}`);
    if (!allRes.ok) throw new Error("Failed to fetch all stats events");
    const allData = await allRes.json();

    return {
        events: allData.data ?? allData.items ?? [],
        totalCount,
    };
}

export default function AdminEventStats() {
    const [state, setState] = useState<StatsState>({
        events: [],
        totalCount: 0,
        loading: true,
    });

    useEffect(() => {
        let cancelled = false;

        fetchStatsEvents()
            .then(({ events, totalCount }) => {
                if (!cancelled) {
                    setState({ events, totalCount, loading: false });
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setState((prev) => ({ ...prev, loading: false }));
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const stats = useMemo(() => {
        const { events, totalCount } = state;

        const pendingReview = events.filter((e) => e.status === "PendingReview").length;
        const published = events.filter((e) => e.status === "Published").length;
        const ongoing = events.filter((e) => {
            const now = new Date();
            const start = new Date(e.eventStartAt);
            const end = new Date(e.eventEndAt);
            return e.status === "Published" && now >= start && now <= end;
        }).length;

        return { totalEvents: totalCount, pendingReview, published, ongoing };
    }, [state]);

    const { loading } = state;

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