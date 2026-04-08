import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { fetchSalesTrend } from "../../../store/adminReportsSlice";
import type { SalesTrendDataPoint } from "../../../types/adminReports/adminReports";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";
const neonGlow = "shadow-[0_0_15px_rgba(124,59,237,0.4)]";

type TimeRange = 7 | 14 | 30;

const timeRangeOptions: { label: string; value: TimeRange }[] = [
    { label: "7 ngày", value: 7 },
    { label: "14 ngày", value: 14 },
    { label: "30 ngày", value: 30 },
];

// Helper to format date as YYYY-MM-DD
const formatDateKey = (date: Date): string => {
    return date.toISOString().split("T")[0];
};

export default function AdminRevenueChart() {
    const dispatch = useDispatch<AppDispatch>();
    const { salesTrend, loading } = useSelector((state: RootState) => state.ADMIN_REPORTS);
    const [selectedDays, setSelectedDays] = useState<TimeRange>(7);
    const [hoveredBar, setHoveredBar] = useState<{
        index: number;
        data: SalesTrendDataPoint;
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);

    useEffect(() => {
        dispatch(fetchSalesTrend(selectedDays));
    }, [dispatch, selectedDays]);

    const formatCurrency = (value: number): string => {
        if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return new Intl.NumberFormat("vi-VN").format(value);
    };

    const formatCurrencyFull = (value: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    // Chart calculations - Fill in missing days with zero values
    const chartData = useMemo(() => {
        if (!salesTrend || salesTrend.length === 0) return null;

        // Create a map of existing data by date
        const dataMap = new Map<string, SalesTrendDataPoint>();
        salesTrend.forEach(d => {
            dataMap.set(d.dateLabel, d);
        });

        // Generate all dates from (selectedDays ago) to today
        const allDays: SalesTrendDataPoint[] = [];
        const today = new Date();
        for (let i = selectedDays - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = formatDateKey(date);
            
            // Use existing data or create empty entry
            if (dataMap.has(dateKey)) {
                allDays.push(dataMap.get(dateKey)!);
            } else {
                allDays.push({
                    dateLabel: dateKey,
                    revenue: 0,
                    transactions: 0,
                });
            }
        }

        const maxRevenue = Math.max(...allDays.map(d => d.revenue), 1);

        const width = 800;
        const height = 240;
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const barCount = allDays.length;
        const barGap = Math.max(4, Math.min(12, chartWidth / barCount * 0.2));
        const barWidth = (chartWidth - barGap * (barCount + 1)) / barCount;

        const bars = allDays.map((data, index) => {
            const x = padding.left + barGap + index * (barWidth + barGap);
            const barHeight = (data.revenue / maxRevenue) * chartHeight;
            const y = padding.top + chartHeight - barHeight;
            return { x, y, width: barWidth, height: barHeight, data };
        });

        // Y-axis labels (5 levels)
        const yLevels = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
            y: padding.top + chartHeight * (1 - ratio),
            value: Math.round(maxRevenue * ratio),
            label: formatCurrency(maxRevenue * ratio),
        }));

        // X-axis labels (show some labels based on data count)
        const labelCount = Math.min(7, barCount);
        const labelIndices = Array.from({ length: labelCount }, (_, i) => {
            if (barCount === 1) return 0;
            return Math.floor((i / (labelCount - 1)) * (barCount - 1));
        });
        const xLabels = labelIndices.map(i => ({
            x: bars[i]?.x + bars[i]?.width / 2 || 0,
            label: formatDate(allDays[i]?.dateLabel || ""),
        }));

        console.log(`Bar chart: ${bars.length} bars, ${salesTrend.length} from API, Max: ${maxRevenue}`);

        return {
            bars,
            xLabels,
            yLevels,
            maxRevenue,
            width,
            height,
            padding,
            chartWidth,
            chartHeight,
        };
    }, [salesTrend, selectedDays]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            if (!chartData || !chartData.bars.length) return;

            const svg = e.currentTarget;
            const rect = svg.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * chartData.width;
            const mouseY = ((e.clientY - rect.top) / rect.height) * chartData.height;

            // Find which bar the mouse is over
            const bar = chartData.bars.find(b => 
                mouseX >= b.x && mouseX <= b.x + b.width &&
                mouseY >= b.y && mouseY <= chartData!.padding.top + chartData!.chartHeight
            );

            if (bar) {
                const index = chartData.bars.indexOf(bar);
                setHoveredBar({
                    index,
                    data: bar.data,
                    x: bar.x,
                    y: bar.y,
                    width: bar.width,
                    height: bar.height,
                });
            } else {
                setHoveredBar(null);
            }
        },
        [chartData]
    );

    const handleMouseLeave = useCallback(() => {
        setHoveredBar(null);
    }, []);

    if (loading) {
        return (
            <div
                className={`lg:col-span-2 ${glassCard} rounded-xl p-8 ${neonGlow}`}
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            Xu hướng Doanh thu & Giao dịch
                        </h2>
                        <p className="text-[#a592c8] text-sm">
                            Đang tải dữ liệu...
                        </p>
                    </div>
                </div>
                <div className="h-64 bg-[#302447] rounded-lg animate-pulse" />
            </div>
        );
    }

    if (!chartData) {
        return (
            <div
                className={`lg:col-span-2 ${glassCard} rounded-xl p-8 ${neonGlow}`}
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            Xu hướng Doanh thu & Giao dịch
                        </h2>
                        <p className="text-[#a592c8] text-sm">
                            Số liệu {selectedDays} ngày gần nhất
                        </p>
                    </div>
                    <select
                        className="bg-[#302447] border-none text-white text-xs rounded-lg py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-primary cursor-pointer"
                        value={selectedDays}
                        onChange={(e) => setSelectedDays(Number(e.target.value) as TimeRange)}
                    >
                        {timeRangeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-[#302447] flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#524a6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="text-[#a592c8] text-sm">Không có dữ liệu</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`lg:col-span-2 ${glassCard} rounded-xl p-8 ${neonGlow}`}
        >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        Xu hướng Doanh thu & Giao dịch
                    </h2>
                    <p className="text-[#a592c8] text-sm">
                        Số liệu {selectedDays} ngày gần nhất
                    </p>
                </div>
                <select
                    className="bg-[#302447] border-none text-white text-xs rounded-lg py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-primary cursor-pointer hover:bg-[#3d2f5a] transition-colors"
                    value={selectedDays}
                    onChange={(e) => setSelectedDays(Number(e.target.value) as TimeRange)}
                >
                    {timeRangeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="h-64 relative w-full">
                <svg
                    className="w-full h-full"
                    viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: hoveredBar ? "pointer" : "default" }}
                >
                    <defs>
                        <linearGradient
                            id="barGradient"
                            x1="0%"
                            x2="0%"
                            y1="0%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#7c3bed"
                                stopOpacity={1}
                            />
                            <stop
                                offset="100%"
                                stopColor="#6d28d9"
                                stopOpacity={0.8}
                            />
                        </linearGradient>
                        <linearGradient
                            id="barGradientHover"
                            x1="0%"
                            x2="0%"
                            y1="0%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#8b5cf6"
                                stopOpacity={1}
                            />
                            <stop
                                offset="100%"
                                stopColor="#7c3bed"
                                stopOpacity={1}
                            />
                        </linearGradient>
                    </defs>

                    {/* Grid lines and Y-axis labels */}
                    {chartData.yLevels.map((level, index) => (
                        <g key={index}>
                            <line
                                x1={chartData.padding.left}
                                y1={level.y}
                                x2={chartData.width - chartData.padding.right}
                                y2={level.y}
                                stroke="rgba(124, 59, 237, 0.1)"
                                strokeWidth="1"
                            />
                            <text
                                x={chartData.padding.left - 10}
                                y={level.y + 4}
                                textAnchor="end"
                                fill="#a592c8"
                                fontSize="10"
                                fontWeight="bold"
                            >
                                {level.label}
                            </text>
                        </g>
                    ))}

                    {/* Bars */}
                    {chartData.bars.map((bar, index) => {
                        const isHovered = hoveredBar?.index === index;
                        return (
                            <g key={index}>
                                {/* Invisible hit area for easier hovering */}
                                <rect
                                    x={bar.x - 2}
                                    y={chartData.padding.top}
                                    width={bar.width + 4}
                                    height={chartData.chartHeight}
                                    fill="transparent"
                                />
                                {/* Bar */}
                                <rect
                                    x={bar.x}
                                    y={bar.y}
                                    width={bar.width}
                                    height={bar.height}
                                    fill={isHovered ? "url(#barGradientHover)" : "url(#barGradient)"}
                                    rx="4"
                                    ry="4"
                                    style={{
                                        filter: isHovered ? "drop-shadow(0 0 8px rgba(124, 59, 237, 0.6))" : "none",
                                        transition: "all 0.2s ease",
                                    }}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Tooltip */}
                {hoveredBar && (
                    <div
                        className="absolute bg-[rgba(24,18,43,0.95)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.4)] rounded-xl p-4 shadow-[0_0_20px_rgba(124,59,237,0.5)] pointer-events-none z-10"
                        style={{
                            left: `${((hoveredBar.x + hoveredBar.width / 2) / chartData.width) * 100}%`,
                            top: "0%",
                            transform: `translateX(-50%) translateY(calc(-100% - 10px))`,
                        }}
                    >
                        <div className="text-[10px] text-[#a592c8] mb-2 font-bold uppercase tracking-wider">
                            {new Date(hoveredBar.data.dateLabel).toLocaleDateString("vi-VN", {
                                weekday: "long",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            })}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-xs text-[#a592c8]">Doanh thu</span>
                                </div>
                                <span className="text-sm font-bold text-white">
                                    {formatCurrencyFull(hoveredBar.data.revenue)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                    <span className="text-xs text-[#a592c8]">Giao dịch</span>
                                </div>
                                <span className="text-sm font-bold text-white">
                                    {hoveredBar.data.transactions}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* X-axis labels */}
                <div className="flex justify-between mt-2 text-[10px] text-[#a592c8] font-bold px-2">
                    {chartData.xLabels.map((label, index) => (
                        <span key={index} style={{ position: 'absolute', left: `${(label.x / chartData.width) * 100}%`, transform: 'translateX(-50%)' }}>
                            {label.label}
                        </span>
                    ))}
                </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-[#a592c8]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded" />
                    <span>Doanh thu theo ngày</span>
                </div>
            </div>
        </div>
    );
}
