import { useEffect, useState, useMemo, useRef } from "react";
import adminReportsService from "../../../services/adminReportsService";
import type { SalesTrendDataPoint } from "../../../types/adminReports/adminReports";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

const PLATFORM_FEE_PERCENTAGE = 15;

export default function AdminRevenueGrowthChart() {
    const [chartData, setChartData] = useState<SalesTrendDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await adminReportsService.getSalesTrend(days);
                console.log("Sales trend response:", response.data);
                if (response.data?.isSuccess && response.data.data) {
                    const data = response.data.data.chartData || [];
                    console.log("Chart data points:", data.length, data);
                    setChartData(data);
                }
            } catch (error) {
                console.error("Failed to fetch sales trend:", error);
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [days]);

    const maxRevenue = useMemo(() => {
        if (chartData.length === 0) return 1;
        return Math.max(...chartData.map((d) => d.revenue)) || 1;
    }, [chartData]);

    const generateSmoothPath = (
        data: number[],
        width: number,
        height: number,
        max: number
    ): string => {
        if (data.length === 0) return "";

        const points = data.map((value, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * width;
            const y = height - (value / max) * height * 0.85 - height * 0.05;
            return { x, y };
        });

        if (points.length === 1) {
            // For single point, create a small horizontal line
            return `M${Math.max(0, points[0].x - 50)},${points[0].y} L${Math.min(width, points[0].x + 50)},${points[0].y}`;
        }

        if (points.length === 2) {
            // For two points, create a simple line
            return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
        }

        let path = `M${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx1 = prev.x + (curr.x - prev.x) / 3;
            const cpx2 = prev.x + (2 * (curr.x - prev.x)) / 3;
            path += ` C${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
        }

        return path;
    };

    const netRevenueData = chartData.map((d) => d.revenue);
    const systemFeeData = chartData.map((d) => (d.revenue * PLATFORM_FEE_PERCENTAGE) / 100);

    const netRevenuePath = generateSmoothPath(netRevenueData, 980, 240, maxRevenue);
    const systemFeePath = generateSmoothPath(systemFeeData, 980, 240, maxRevenue);

    const netRevenueArea = netRevenuePath
        ? `${netRevenuePath} L980,240 L10,240 Z`
        : "";
    const systemFeeArea = systemFeePath
        ? `${systemFeePath} L980,240 L10,240 Z`
        : "";

    const formatDateLabel = (label: string): string => {
        const parts = label.split("/");
        if (parts.length === 2) {
            return `${parts[0]}/${parts[1]}`;
        }
        return label;
    };

    const displayLabels = chartData
        .filter((_, index) => {
            const step = Math.ceil(chartData.length / 6);
            return index % step === 0 || index === chartData.length - 1;
        })
        .map((d) => formatDateLabel(d.dateLabel));

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || chartData.length === 0) return;

        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;

        // Calculate which data point index corresponds to the mouse position
        const chartWidth = 980;
        const offsetX = 10;
        const relativeX = mouseX - offsetX;
        const index = Math.round((relativeX / chartWidth) * (chartData.length - 1));
        const clampedIndex = Math.max(0, Math.min(chartData.length - 1, index));

        setHoveredIndex(clampedIndex);
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };

    const getTooltipPosition = (index: number) => {
        const x = 10 + (index / Math.max(chartData.length - 1, 1)) * 980;
        const revenue = chartData[index].revenue;
        const fee = (revenue * PLATFORM_FEE_PERCENTAGE) / 100;
        const y = 10 + 240 - (revenue / maxRevenue) * 240 * 0.85;
        return { x, y, revenue, fee };
    };

    const formatCurrencyFull = (value: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    return (
        <div className={`${glassCard} rounded-xl p-8`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        Tăng trưởng Doanh thu
                    </h2>
                    <p className="text-[#a592c8] text-sm">
                        Theo dõi hiệu suất doanh số và phí nền tảng
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4 mr-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-primary" />
                            <span className="text-xs text-[#a592c8]">
                                Doanh thu
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-blue-400" />
                            <span className="text-xs text-[#a592c8]">
                                Phí nền tảng (15%)
                            </span>
                        </div>
                    </div>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="bg-[#302447] border-none text-white text-xs rounded-lg py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-primary cursor-pointer hover:bg-[#3d2f5a] transition-colors"
                    >
                        <option value={7}>7 ngày qua</option>
                        <option value={30}>30 ngày qua</option>
                        <option value={90}>3 tháng qua</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="h-80 flex items-center justify-center">
                    <div className="flex items-center gap-3 text-[#a592c8]">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                    </div>
                </div>
            ) : chartData.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-[#302447] flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#524a6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="text-[#a592c8] text-sm">Không có dữ liệu</span>
                    </div>
                </div>
            ) : (
                <div className="h-80 relative w-full">
                    <svg
                        ref={svgRef}
                        className="w-full h-full cursor-crosshair"
                        viewBox="0 0 1000 260"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <defs>
                            <linearGradient
                                id="revenueGradient"
                                x1="0%"
                                x2="0%"
                                y1="0%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#7c3bed"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#7c3bed"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="feeGradient"
                                x1="0%"
                                x2="0%"
                                y1="0%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#60a5fa"
                                    stopOpacity={0.2}
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#60a5fa"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                            <line
                                key={idx}
                                x1="10"
                                y1={10 + ratio * 240}
                                x2="990"
                                y2={10 + ratio * 240}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="1"
                                strokeDasharray="4,4"
                            />
                        ))}

                        {/* System Fees Area */}
                        {systemFeeArea && (
                            <path
                                d={systemFeeArea}
                                fill="url(#feeGradient)"
                            />
                        )}
                        {/* System Fees Line */}
                        {systemFeePath && (
                            <path
                                d={systemFeePath}
                                fill="none"
                                stroke="#60a5fa"
                                strokeDasharray="8,8"
                                strokeLinecap="round"
                                strokeWidth={2}
                            />
                        )}

                        {/* Net Revenue Area */}
                        {netRevenueArea && (
                            <path
                                d={netRevenueArea}
                                fill="url(#revenueGradient)"
                            />
                        )}
                        {/* Net Revenue Line */}
                        {netRevenuePath && (
                            <path
                                d={netRevenuePath}
                                fill="none"
                                stroke="#7c3bed"
                                strokeLinecap="round"
                                strokeWidth={3}
                            />
                        )}

                        {/* Highlight Point */}
                        {netRevenueData.length > 0 && (
                            <circle
                                cx={980}
                                cy={10 + 240 - (netRevenueData[netRevenueData.length - 1] / maxRevenue) * 240 * 0.85}
                                fill="#7c3bed"
                                r={5}
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        )}

                        {/* Hover Points */}
                        {chartData.map((_, index) => {
                            const x = 10 + (index / Math.max(chartData.length - 1, 1)) * 980;
                            const revenue = chartData[index].revenue;
                            const y = 10 + 240 - (revenue / maxRevenue) * 240 * 0.85;
                            
                            return (
                                <g key={index}>
                                    {/* Invisible hover area */}
                                    <rect
                                        x={x - (980 / Math.max(chartData.length - 1, 1)) / 2}
                                        y={0}
                                        width={980 / Math.max(chartData.length - 1, 1)}
                                        height={260}
                                        fill="transparent"
                                    />
                                    {/* Hover dot */}
                                    {hoveredIndex === index && (
                                        <>
                                            <line
                                                x1={x}
                                                y1={10}
                                                x2={x}
                                                y2={250}
                                                stroke="rgba(124,59,237,0.3)"
                                                strokeWidth={1}
                                                strokeDasharray="3,3"
                                            />
                                            <circle
                                                cx={x}
                                                cy={y}
                                                fill="#7c3bed"
                                                r={6}
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                        </>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Tooltip */}
                    {hoveredIndex !== null && chartData[hoveredIndex] && (() => {
                        const pos = getTooltipPosition(hoveredIndex);
                        const tooltipX = Math.min(Math.max(pos.x - 100, 0), 800);
                        
                        return (
                            <div
                                className="absolute pointer-events-none bg-[#1a122b] border border-[#7c3bed]/30 rounded-xl shadow-2xl p-4 z-50"
                                style={{
                                    left: `${(tooltipX / 1000) * 100}%`,
                                    top: "10px",
                                    transform: "translateX(0)",
                                }}
                            >
                                <div className="text-[10px] text-[#a592c8] font-bold uppercase tracking-wider mb-2">
                                    {chartData[hoveredIndex].dateLabel}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-xs text-[#a592c8]">Doanh thu</span>
                                        </div>
                                        <span className="text-sm font-bold text-white">
                                            {formatCurrencyFull(pos.revenue)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                                            <span className="text-xs text-[#a592c8]">Phí nền tảng</span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-400">
                                            {formatCurrencyFull(pos.fee)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="flex justify-between mt-4 px-3 text-[10px] text-[#a592c8] font-bold uppercase tracking-widest">
                        {displayLabels.map((label, index) => (
                            <span key={index}>{label}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
