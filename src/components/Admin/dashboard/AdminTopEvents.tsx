import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../../../store";
import { fetchTopEvents } from "../../../store/adminReportsSlice";
import { MdLocalFireDepartment, MdConfirmationNumber } from "react-icons/md";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

const rankColors = [
    "from-yellow-400 to-amber-500",
    "from-gray-300 to-gray-400",
    "from-amber-600 to-amber-700",
    "from-primary to-purple-600",
    "from-indigo-400 to-indigo-500",
];

const rankGlow = [
    "shadow-[0_0_20px_rgba(250,204,21,0.4)]",
    "shadow-[0_0_20px_rgba(156,163,175,0.4)]",
    "shadow-[0_0_20px_rgba(217,119,6,0.4)]",
    "shadow-[0_0_15px_rgba(124,59,237,0.4)]",
    "shadow-[0_0_15px_rgba(129,140,248,0.4)]",
];

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN").format(value);
};

export default function AdminTopEvents() {
    const dispatch = useDispatch<AppDispatch>();
    const { topEvents, loading } = useSelector((state: RootState) => state.ADMIN_REPORTS);
    const navigate = useNavigate();

    // Only include events with status === "Completed" in the ranking
    const completedEvents = (topEvents ?? []).filter((e: any) => e.status === "Completed");

    useEffect(() => {
        dispatch(fetchTopEvents(5));
    }, [dispatch]);

    if (loading) {
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <MdLocalFireDepartment className="text-primary text-xl" />
                            Bảng Xếp Hạng Sự Kiện
                        </h2>
                        <p className="text-[#a592c8] text-sm mt-1">Top 5 sự kiện có doanh thu cao nhất</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`${glassCard} rounded-xl overflow-hidden animate-pulse`}>
                            <div className="h-40 bg-[#302447]" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 bg-[#302447] rounded w-3/4" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-12 bg-[#302447] rounded" />
                                    <div className="h-12 bg-[#302447] rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!topEvents || topEvents.length === 0) {
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <MdLocalFireDepartment className="text-primary text-xl" />
                            Bảng Xếp Hạng Sự Kiện
                        </h2>
                        <p className="text-[#a592c8] text-sm mt-1">Top 5 sự kiện có doanh thu cao nhất</p>
                    </div>
                </div>
                <div className={`${glassCard} rounded-xl p-16 flex flex-col items-center justify-center`}>
                    <div className="w-20 h-20 rounded-full bg-[#302447] flex items-center justify-center mb-4">
                        <MdLocalFireDepartment className="text-4xl text-[#524a6e]" />
                    </div>
                    <p className="text-[#a592c8] text-sm">Chưa có sự kiện Completed để xếp hạng</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <MdLocalFireDepartment className="text-primary text-xl" />
                        Bảng Xếp Hạng Sự Kiện
                    </h2>
                    <p className="text-[#a592c8] text-sm mt-1">
                        Top {completedEvents.length} sự kiện có doanh thu cao nhất
                    </p>
                </div>
                <button className="text-xs font-bold text-primary hover:underline transition-all" onClick={() => navigate("/admin/events")}>
                    Xem tất cả sự kiện
                </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedEvents.map((event, index) => {
                    const rank = index + 1;
                    const colorGradient = rankColors[index] || rankColors[rankColors.length - 1];
                    const glowClass = rankGlow[index] || rankGlow[rankGlow.length - 1];

                    return (
                        <div
                            key={event.eventId}
                            className={`
                                group ${glassCard} rounded-xl overflow-hidden
                                hover:border-primary/50 transition-all duration-300
                                relative cursor-pointer
                            `}
                        >
                            {/* Rank Badge - Absolute positioned */}
                            <div className="absolute top-3 left-3 z-10">
                                <div
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center
                                        bg-gradient-to-br ${colorGradient} ${glowClass}
                                        shadow-lg
                                    `}
                                >
                                    <span className="text-xs font-bold text-white">
                                        #{rank}
                                    </span>
                                </div>
                            </div>

                            {/* HOT Badge for #1 */}
                            {rank === 1 && (
                                <div className="absolute top-3 right-3 z-10">
                                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full shadow-lg">
                                        🔥 Sự kiện HOT
                                    </span>
                                </div>
                            )}

                            {/* Banner */}
                            <div className="relative h-40 w-full overflow-hidden">
                                {event.bannerUrl ? (
                                    <img
                                        src={event.bannerUrl}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                                        <MdLocalFireDepartment className="text-5xl text-primary/30" />
                                    </div>
                                )}
                                
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#18122B] via-transparent to-transparent" />
                                
                                {/* Rank indicator for top 3 */}
                                {rank <= 3 && (
                                    <div className="absolute bottom-3 left-3">
                                        <span className="text-4xl">
                                            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-5">
                                {/* Event Title */}
                                <h4 className="text-white font-bold text-base mb-4 line-clamp-1 group-hover:text-primary transition-colors">
                                    {event.title}
                                </h4>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Revenue */}
                                    <div>
                                        <p className="text-[10px] text-[#a592c8] uppercase font-bold tracking-widest mb-1">
                                            Doanh thu
                                        </p>
                                        <p className="text-lg font-bold text-primary">
                                            {formatCurrency(event.totalRevenue)}{" "}
                                            <span className="text-xs font-normal">VND</span>
                                        </p>
                                    </div>

                                    {/* Tickets Sold */}
                                    <div>
                                        <p className="text-[10px] text-[#a592c8] uppercase font-bold tracking-widest mb-1">
                                            Vé đã bán
                                        </p>
                                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                                            <span>{event.ticketsSold}</span>
                                            <MdConfirmationNumber className="text-sm text-[#a592c8]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Bar */}
                                <div className="mt-4 pt-4 border-t border-[#302447]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorGradient}`} />
                                        <span className="text-[10px] text-[#a592c8] font-semibold">
                                            Hiệu Suất
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-[#302447] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${colorGradient} rounded-full transition-all duration-700`}
                                            style={{
                                                width: `${((index + 1) / completedEvents.length) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
