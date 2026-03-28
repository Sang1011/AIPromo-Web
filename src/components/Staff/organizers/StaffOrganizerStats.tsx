import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPendingOrganizers } from "../../../store/organizerProfileSlice";
import type { RootState, AppDispatch } from "../../../store/index";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.1)]";

export default function StaffOrganizerStats() {
    const dispatch = useDispatch<AppDispatch>();
    const { pendingOrganizers } = useSelector(
        (state: RootState) => state.ORGANIZER_PROFILE
    );

    useEffect(() => {
        dispatch(
            fetchPendingOrganizers({
                PageNumber: 1,
                PageSize: 1000, // Lấy tất cả để thống kê
                SortColumn: "CreatedAt",
                SortOrder: "desc",
            })
        );
    }, [dispatch]);

    // Thống kê business type
    const businessTypeStats = useMemo(() => {
        const stats: Record<string, number> = {};
        pendingOrganizers.forEach((org) => {
            const type = org.businessType || "Khác";
            stats[type] = (stats[type] || 0) + 1;
        });

        // Tìm loại hình nhiều nhất
        let maxType = "";
        let maxCount = 0;
        Object.entries(stats).forEach(([type, count]) => {
            if (count > maxCount) {
                maxType = type;
                maxCount = count;
            }
        });

        return { type: maxType, count: maxCount };
    }, [pendingOrganizers]);

    const pendingCount = pendingOrganizers.length;

    const stats = [
        {
            label: "Hồ sơ đang chờ",
            value: pendingCount.toString(),
            valueColor: "text-amber-500",
            blurColor: "bg-amber-500/10",
        },
        {
            label: "Loại hình phổ biến nhất",
            value: businessTypeStats.type || "N/A",
            suffix: businessTypeStats.count > 0 ? `(${businessTypeStats.count} hồ sơ)` : undefined,
            valueColor: "text-emerald-500",
            blurColor: "bg-emerald-500/10",
        },
        {
            label: "Tổng số hồ sơ",
            value: pendingCount.toString(),
            valueColor: "text-primary",
            blurColor: "bg-primary/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={`${glassCard} p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group`}
                >
                    <div
                        className={`absolute -right-4 -top-4 size-24 ${stat.blurColor} rounded-full blur-3xl group-hover:opacity-80 transition-all`}
                    />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {stat.label}
                    </p>
                    <h4
                        className={`text-3xl font-bold ${stat.valueColor}`}
                    >
                        {stat.value}{" "}
                        {stat.suffix && (
                            <span className="text-lg font-normal text-slate-400">
                                {stat.suffix}
                            </span>
                        )}
                    </h4>
                </div>
            ))}
        </div>
    );
}
