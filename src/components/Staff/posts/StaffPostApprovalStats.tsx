import { useEffect, useState, useCallback } from "react";
import { FaChartBar, FaClock, FaCheckCircle } from "react-icons/fa";
import { interceptorAPI } from "../../../utils/attachInterceptors";

interface StaffPostApprovalStatsProps {
    reloadTrigger: number;
}

export default function StaffPostApprovalStats({
    reloadTrigger,
}: StaffPostApprovalStatsProps) {
    return <StatsWithLocalFetch reloadTrigger={reloadTrigger} />;
}

function StatsWithLocalFetch({ reloadTrigger }: { reloadTrigger: number }) {
    const [totalCount, setTotalCount] = useState<number>(0);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [approvedCount, setApprovedCount] = useState<number>(0);
    const [publishedCount, setPublishedCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const fetchCounts = useCallback(async () => {
        setLoading(true);
        try {
            const results = await Promise.all([
                fetchCount(),
                fetchCount("Pending"),
                fetchCount("Approved"),
                fetchCount("Published"),
            ]);
            setTotalCount(results[0]);
            setPendingCount(results[1]);
            setApprovedCount(results[2]);
            setPublishedCount(results[3]);
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    // Re-fetch when parent triggers reload
    useEffect(() => {
        if (reloadTrigger > 0) {
            fetchCounts();
        }
    }, [reloadTrigger, fetchCounts]);

    const processedCount = approvedCount + publishedCount;
    const processedPercent =
        totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

    const stats = [
        {
            label: "Tổng bài đăng",
            value: totalCount,
            subValue: "Hệ thống",
            icon: FaChartBar,
            color: "text-white",
            subColor: "text-slate-500",
        },
        {
            label: "Chờ duyệt",
            value: pendingCount,
            subValue: pendingCount > 0 ? `${pendingCount} mới` : "0",
            icon: FaClock,
            color: "text-fuchsia-500",
            subColor: "text-fuchsia-500/70",
        },
        {
            label: "Đã xử lý thành công",
            value: processedCount,
            subValue: `${processedPercent}%`,
            icon: FaCheckCircle,
            color: "text-emerald-500",
            subColor: "text-emerald-500/70",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="relative overflow-hidden rounded-2xl border border-primary/10 bg-[#18122B]/70 backdrop-blur-md p-6 animate-pulse"
                    >
                        <div className="h-4 w-24 bg-slate-700 rounded mb-3" />
                        <div className="h-10 w-20 bg-slate-700 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="relative overflow-hidden rounded-2xl border border-primary/10 bg-[#18122B]/70 backdrop-blur-md p-6 group hover:border-primary/30 transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <stat.icon className="text-6xl" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                        {stat.label}
                    </p>
                    <div className="flex items-end gap-2">
                        <h2 className={`text-4xl font-black ${stat.color}`}>
                            {formatNumber(stat.value)}
                        </h2>
                        <span
                            className={`text-sm font-medium mb-1 ${stat.subColor}`}
                        >
                            {stat.subValue}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

async function fetchCount(status?: string): Promise<number> {
    const params: Record<string, string | number> = {
        PageNumber: 1,
        PageSize: 1,
        SortColumn: "CreatedAt",
        SortOrder: "desc",
    };
    if (status) params.Status = status;

    const res = await interceptorAPI().get("/admin/posts", { params });
    const data = res.data.data;
    return data.totalCount ?? 0;
}

function formatNumber(n: number): string {
    return n.toLocaleString("vi-VN");
}
