import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import type { SalesTrendData, SalesTrendPeriod } from "../../../types/ticketing/ticketing";

interface RevenueChartProps {
    trendData: SalesTrendData | null;
    period: SalesTrendPeriod;
    loading: boolean;
    onPeriodChange: (period: SalesTrendPeriod) => void;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatRevenue(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return `${value}`;
}

/**
 * Shift UTC → VN (UTC+7) rồi dùng getUTC* để tránh phụ thuộc locale trình duyệt.
 */
function toVNDate(raw: string): Date {
    const d = new Date(raw);
    return new Date(d.getTime() + 7 * 60 * 60 * 1000);
}

function pad(n: number): string {
    return String(n).padStart(2, "0");
}

/**
 * Tick label trên X-axis:
 *   Day  → "03/04"   (ngày/tháng VN — mỗi điểm = 1 ngày trong 30 ngày gần nhất)
 *   Week → "30/03–05/04" (thứ Hai đầu tuần → Chủ nhật)
 */
function formatTimeLabel(raw: string, period: SalesTrendPeriod): string {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;

    const vn = toVNDate(raw);

    if (period === "Day") {
        return `${pad(vn.getUTCDate())}/${pad(vn.getUTCMonth() + 1)}`;
    }

    // Week: backend trả ngày đầu tuần (Monday 00:00 UTC)
    const weekEnd = new Date(vn.getTime() + 6 * 24 * 60 * 60 * 1000);
    return `${pad(vn.getUTCDate())}/${pad(vn.getUTCMonth() + 1)}–${pad(weekEnd.getUTCDate())}/${pad(weekEnd.getUTCMonth() + 1)}`;
}

/**
 * Tooltip header — đầy đủ hơn tick:
 *   Day  → "03/04/2026"
 *   Week → "Tuần 30/03 – 05/04/2026"
 */
function formatTooltipLabel(raw: string, period: SalesTrendPeriod): string {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;

    const vn = toVNDate(raw);

    if (period === "Day") {
        return `${pad(vn.getUTCDate())}/${pad(vn.getUTCMonth() + 1)}/${vn.getUTCFullYear()}`;
    }

    const weekEnd = new Date(vn.getTime() + 6 * 24 * 60 * 60 * 1000);
    return `Tuần ${pad(vn.getUTCDate())}/${pad(vn.getUTCMonth() + 1)} – ${pad(weekEnd.getUTCDate())}/${pad(weekEnd.getUTCMonth() + 1)}/${weekEnd.getUTCFullYear()}`;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODS: { label: string; value: SalesTrendPeriod }[] = [
    { label: "Theo ngày", value: "Day" },
    { label: "Theo tuần", value: "Week" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function RevenueChart({ trendData, period, loading, onPeriodChange }: RevenueChartProps) {
    const chartData = (trendData?.trend ?? []).map((item) => ({
        ...item,
        _tickLabel: formatTimeLabel(item.timeLabel, period),
        _tooltipLabel: formatTooltipLabel(item.timeLabel, period),
    }));

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-5 text-sm">
                    <span className="flex items-center gap-2 text-primary font-semibold uppercase">
                        <span className="w-3 h-0.5 bg-primary inline-block rounded" />
                        Doanh thu
                    </span>
                    <span className="flex items-center gap-2 text-slate-400 font-semibold uppercase">
                        <span
                            className="w-3 inline-block"
                            style={{ borderTop: "2px dashed #94a3b8", opacity: 0.6 }}
                        />
                        Số vé bán
                    </span>
                </div>

                <div className="flex gap-2">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => onPeriodChange(p.value)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${period === p.value
                                ? "bg-primary text-white"
                                : "bg-white/5 text-slate-400 hover:bg-white/10"
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="h-[280px] relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0b0816]/60 rounded-xl z-10">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {chartData.length === 0 && !loading ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        Không có dữ liệu cho khoảng thời gian này.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />

                            <XAxis
                                dataKey="_tickLabel"
                                stroke="#6B7280"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                padding={{ left: 24, right: 24 }}
                                interval="preserveStartEnd"
                            />

                            <YAxis
                                yAxisId="revenue"
                                orientation="left"
                                stroke="#6B7280"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={formatRevenue}
                                tick={{ fontSize: 11 }}
                                width={48}
                            />

                            <YAxis
                                yAxisId="tickets"
                                orientation="right"
                                stroke="#6B7280"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                width={36}
                            />

                            <Tooltip
                                contentStyle={{
                                    background: "#18122B",
                                    border: "1px solid rgba(124,59,237,0.2)",
                                    borderRadius: "12px",
                                    fontSize: "13px",
                                }}
                                labelStyle={{ color: "#c4b5fd", marginBottom: "4px" }}
                                labelFormatter={(_label, payload) => {
                                    const raw = payload?.[0]?.payload?._tooltipLabel as string | undefined;
                                    return raw ?? _label;
                                }}
                                formatter={(
                                    value: number | string | undefined,
                                    name: string | undefined
                                ): [string, string] => {
                                    const v = typeof value === "number" ? value : 0;
                                    if (name === "revenue")
                                        return [v.toLocaleString("vi-VN") + " VND", "DOANH THU"];
                                    return [v.toLocaleString("vi-VN"), "VÉ BÁN"];
                                }}
                            />

                            <Line
                                yAxisId="revenue"
                                type="monotone"
                                dataKey="revenue"
                                stroke="#7c3bed"
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: "#7c3bed", strokeWidth: 0 }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />

                            <Line
                                yAxisId="tickets"
                                type="monotone"
                                dataKey="ticketsSold"
                                stroke="#94a3b8"
                                strokeWidth={2}
                                strokeDasharray="6 4"
                                dot={false}
                                opacity={0.7}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}