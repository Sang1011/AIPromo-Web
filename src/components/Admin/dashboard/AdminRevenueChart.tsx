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

export default function AdminRevenueChart() {
    const dispatch = useDispatch<AppDispatch>();
    const { salesTrend, loading } = useSelector((state: RootState) => state.ADMIN_REPORTS);
    const [selectedDays, setSelectedDays] = useState<TimeRange>(30);
    const [hoveredPoint, setHoveredPoint] = useState<{
        index: number;
        data: SalesTrendDataPoint;
        x: number;
        y: number;
    } | null>(null);

    useEffect(() => {
        dispatch(fetchSalesTrend(selectedDays));
    }, [dispatch, selectedDays]);

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    // Chart calculations
    const chartData = useMemo(() => {
        if (!salesTrend || salesTrend.length === 0) return null;

        const maxRevenue = Math.max(...salesTrend.map(d => d.revenue), 1);
        const maxTransactions = Math.max(...salesTrend.map(d => d.transactions), 1);
        
        const width = 800;
        const height = 200;
        const padding = 20;
        
        const points = salesTrend.map((data, index) => {
            const x = padding + (index / (salesTrend.length - 1)) * (width - padding * 2);
            const y = height - padding - (data.revenue / maxRevenue) * (height - padding * 2);
            return { x, y, data };
        });

        // Create smooth curve path
        const linePath = points.length > 1
            ? `M ${points[0].x},${points[0].y} ` +
              points.slice(1).map((point, i) => {
                  const prev = points[i];
                  const cpx1 = prev.x + (point.x - prev.x) / 3;
                  const cpx2 = prev.x + 2 * (point.x - prev.x) / 3;
                  return `C ${cpx1},${prev.y} ${cpx2},${point.y} ${point.x},${point.y}`;
              }).join(" ")
            : "";

        // Create area path
        const areaPath = linePath
            ? `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`
            : "";

        // X-axis labels (show 4-5 labels evenly spaced)
        const labelIndices = [0, Math.floor(salesTrend.length / 3), Math.floor(2 * salesTrend.length / 3), salesTrend.length - 1];
        const xLabels = labelIndices.map(i => ({
            x: points[i]?.x || 0,
            label: formatDate(salesTrend[i]?.dateLabel || ""),
        }));

        return {
            linePath,
            areaPath,
            xLabels,
            points,
            maxRevenue,
            maxTransactions,
        };
    }, [salesTrend]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            if (!chartData || !chartData.points.length) return;

            const svg = e.currentTarget;
            const rect = svg.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * 800;

            // Find closest point
            let closestIndex = 0;
            let closestDistance = Infinity;

            chartData.points.forEach((point, index) => {
                const distance = Math.abs(point.x - mouseX);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            // Only show tooltip if mouse is within reasonable range (50px in SVG coordinates)
            if (closestDistance < 50) {
                const point = chartData.points[closestIndex];
                setHoveredPoint({
                    index: closestIndex,
                    data: point.data,
                    x: point.x,
                    y: point.y,
                });
            } else {
                setHoveredPoint(null);
            }
        },
        [chartData]
    );

    const handleMouseLeave = useCallback(() => {
        setHoveredPoint(null);
    }, []);

    if (loading || !chartData) {
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
                    <div className="bg-[#302447] text-white text-xs rounded-lg py-1.5 pl-3 pr-8 animate-pulse">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                </div>
                <div className="h-64 bg-[#302447] rounded-lg animate-pulse" />
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
                        Số liệu hiệu suất hàng ngày trong {selectedDays} ngày gần nhất
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
            
            <div className="h-64 relative w-full">
                <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 800 200"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: hoveredPoint ? "pointer" : "default" }}
                >
                    <defs>
                        <linearGradient
                            id="adminGradient"
                            x1="0%"
                            x2="0%"
                            y1="0%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#7c3bed"
                                stopOpacity={0.3}
                            />
                            <stop
                                offset="100%"
                                stopColor="#7c3bed"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                        <line
                            key={ratio}
                            x1="20"
                            y1={20 + ratio * 160}
                            x2="780"
                            y2={20 + ratio * 160}
                            stroke="rgba(124, 59, 237, 0.1)"
                            strokeWidth="1"
                        />
                    ))}
                    
                    {/* Area fill */}
                    {chartData.areaPath && (
                        <path
                            d={chartData.areaPath}
                            fill="url(#adminGradient)"
                        />
                    )}
                    
                    {/* Revenue line */}
                    {chartData.linePath && (
                        <path
                            d={chartData.linePath}
                            fill="none"
                            stroke="#7c3bed"
                            strokeLinecap="round"
                            strokeWidth={3}
                        />
                    )}
                    
                    {/* Data points (only show if less than 15 points, otherwise too crowded) */}
                    {chartData.points.length <= 15 && chartData.points.map((point, index) => (
                        <circle
                            key={index}
                            className={neonGlow}
                            cx={point.x}
                            cy={point.y}
                            fill={point.data.revenue > 0 ? "#7c3bed" : "transparent"}
                            stroke="#7c3bed"
                            strokeWidth="2"
                            r={4}
                        />
                    ))}
                    
                    {/* Hovered point indicator */}
                    {hoveredPoint && (
                        <>
                            {/* Vertical line */}
                            <line
                                x1={hoveredPoint.x}
                                y1="20"
                                x2={hoveredPoint.x}
                                y2="180"
                                stroke="rgba(124, 59, 237, 0.5)"
                                strokeWidth="2"
                                strokeDasharray="4,4"
                            />
                            
                            {/* Highlighted circle */}
                            <circle
                                cx={hoveredPoint.x}
                                cy={hoveredPoint.y}
                                fill="#7c3bed"
                                stroke="#fff"
                                strokeWidth="3"
                                r="7"
                                className={neonGlow}
                            />
                        </>
                    )}
                </svg>
                
                {/* Tooltip */}
                {hoveredPoint && (
                    <div
                        className="absolute bg-[rgba(24,18,43,0.95)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.4)] rounded-lg p-3 shadow-[0_0_20px_rgba(124,59,237,0.5)] pointer-events-none z-10"
                        style={{
                            left: `${(hoveredPoint.x / 800) * 100}%`,
                            top: "0%",
                            transform: `translateX(-50%) translateY(calc(-100% - 10px))`,
                        }}
                    >
                        <div className="text-[10px] text-[#a592c8] mb-2 font-bold">
                            {new Date(hoveredPoint.data.dateLabel).toLocaleDateString("vi-VN", {
                                weekday: "long",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-xs text-[#a592c8]">Doanh thu:</span>
                                </div>
                                <span className="text-xs text-white font-bold">
                                    {formatCurrency(hoveredPoint.data.revenue)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                    <span className="text-xs text-[#a592c8]">Giao dịch:</span>
                                </div>
                                <span className="text-xs text-white font-bold">
                                    {hoveredPoint.data.transactions}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* X-axis labels */}
                <div className="flex justify-between mt-4 text-[10px] text-[#a592c8] font-bold px-2">
                    {chartData.xLabels.map((label, index) => (
                        <span key={index}>{label.label}</span>
                    ))}
                </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-[#a592c8]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-primary" />
                    <span>Doanh thu</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary/30 rounded-full" />
                    <span>Giao dịch</span>
                </div>
            </div>
        </div>
    );
}
