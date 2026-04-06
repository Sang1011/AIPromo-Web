import { useEffect, useMemo, useState } from "react";
import {
    RiCalendarEventLine,
    RiLineChartLine,
    RiMoneyDollarCircleLine,
    RiRefund2Line,
} from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { AppDispatch, RootState } from "../../store";
import { fetchOrganizerProfile } from "../../store/organizerProfileSlice";
import {
    fetchRevenueBreakdownOrganizer,
    fetchRevenueSummaryOrganizer,
} from "../../store/reportSlice";
import { fetchAllEventSalesTrend } from "../../store/ticketingSlice";
import type { EventStatus } from "../../types/event/event";
import { fmtMoneyVND } from "../../utils/fmtMoneyVND";

const generateColor = (index: number): string => {
    const hue = (index * 137.508) % 360;
    const saturation = 65;
    const lightness = 58;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

type TrendRange = 1 | 3 | 6;
const RANGE_OPTIONS: { label: string; value: TrendRange }[] = [
    { label: "1 tháng", value: 1 },
    { label: "3 tháng", value: 3 },
    { label: "6 tháng", value: 6 },
];

const chartScale = (maxValue: number): { divisor: number; unit: string } => {
    if (maxValue >= 1_000_000_000) return { divisor: 1_000_000_000, unit: "tỷ" };
    if (maxValue >= 1_000_000) return { divisor: 1_000_000, unit: "triệu" };
    if (maxValue >= 1_000) return { divisor: 1_000, unit: "nghìn" };
    return { divisor: 1, unit: "đồng" };
};

/** "W2 T4" = tuần 2 của tháng 4 */
const getWeekKey = (d: Date): string =>
    `T${d.getMonth() + 1}/W${Math.ceil(d.getDate() / 7)}`;

const statusBadge = (status: EventStatus) => {
    const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
        Published: { bg: "bg-emerald-950", text: "text-emerald-400", border: "border-emerald-900", label: "Đang mở" },
        PendingReview: { bg: "bg-blue-950", text: "text-blue-400", border: "border-blue-900", label: "Chờ duyệt" },
        PendingCancellation: { bg: "bg-orange-950", text: "text-orange-400", border: "border-orange-900", label: "Chờ huỷ" },
        Suspended: { bg: "bg-red-950", text: "text-red-400", border: "border-red-900", label: "Đã tạm dừng" },
        Cancelled: { bg: "bg-rose-950", text: "text-rose-400", border: "border-rose-900", label: "Đã huỷ" },
        Completed: { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700", label: "Đã kết thúc" },
    };
    const s = map[status] ?? { bg: "bg-zinc-900", text: "text-zinc-400", border: "border-zinc-700", label: "Bản nháp" };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${s.bg} ${s.text} border ${s.border}`}>
            {s.label}
        </span>
    );
};

const refundColor = (rate: number) => rate < 4 ? "#4ade80" : rate < 8 ? "#fbbf24" : "#f87171";

const TooltipStyle = {
    contentStyle: {
        background: "#0f0c1a",
        border: "1px solid #334155",
        borderRadius: "10px",
        color: "#f1f5f9",
        fontSize: "13px",
        padding: "10px 14px",
    },
    itemStyle: { color: "#cbd5e1" },
    labelStyle: { color: "#94a3b8", marginBottom: 4 },
    cursor: { fill: "rgba(124,59,237,0.06)" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetricCardProps {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: string;
    sub: React.ReactNode;
    subColor?: string;
}
function MetricCard({ icon, iconBg, label, value, sub, subColor }: MetricCardProps) {
    return (
        <div className="bg-card-dark rounded-xl border border-border-dark p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-white uppercase font-bold tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-semibold text-gray-100">{value}</p>
                <p className="text-sm mt-1" style={{ color: subColor ?? "#64748b" }}>{sub}</p>
            </div>
        </div>
    );
}

interface SectionCardProps {
    title: string;
    sub?: string;
    children: React.ReactNode;
    className?: string;
    headerRight?: React.ReactNode;
}
function SectionCard({ title, sub, children, className = "", headerRight }: SectionCardProps) {
    return (
        <div className={`bg-card-dark rounded-xl border border-border-dark p-5 ${className}`}>
            <div className="flex items-start justify-between">
                <p className="text-base font-semibold text-white">{title}</p>
                {headerRight}
            </div>
            {sub
                ? <p className="text-sm text-text-muted mt-0.5 mb-4">{sub}</p>
                : <div className="mb-4" />
            }
            {children}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OrganizerOverviewAllPage() {
    const dispatch = useDispatch<AppDispatch>();

    const { profile } = useSelector((state: RootState) => state.ORGANIZER_PROFILE);
    const { revenueSummaryOrganizer, revenueBreakdownOrganizer, loading } = useSelector(
        (state: RootState) => state.REPORT
    );
    const { allEventSalesTrend, allEventSalesTrendLoading } = useSelector(
        (state: RootState) => state.TICKETING
    );

    const [showGross, setShowGross] = useState(true);
    const [showNet, setShowNet] = useState(true);
    const [trendRange, setTrendRange] = useState<TrendRange>(3);

    // 1. Fetch profile
    useEffect(() => { dispatch(fetchOrganizerProfile()); }, [dispatch]);

    // 2. Fetch summary + breakdown
    useEffect(() => {
        if (!profile?.userId) return;
        dispatch(fetchRevenueSummaryOrganizer(profile.userId));
    }, [dispatch, profile?.userId]);

    useEffect(() => {
        if (!profile?.userId) return;
        dispatch(fetchRevenueBreakdownOrganizer({ organizerId: profile.userId, byNet: false }));
    }, [dispatch, profile?.userId]);

    // 3. Fetch sales trend — re-fetch khi đổi range
    useEffect(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - trendRange);
        dispatch(fetchAllEventSalesTrend({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        }));
    }, [dispatch, trendRange]);

    // ─── Derived: bar + donut ─────────────────────────────────────────────────

    const summary = revenueSummaryOrganizer;
    const breakdown = revenueBreakdownOrganizer ?? [];

    const barData = breakdown.map((item) => ({
        name: item.eventName ?? item.eventId,
        gross: item.grossRevenue,
        net: item.netRevenue,
    }));

    const barMaxValue = Math.max(...breakdown.map((x) => Math.max(x.grossRevenue, x.netRevenue)), 0);
    const barScale = chartScale(barMaxValue);

    const totalGross = breakdown.reduce((s, x) => s + x.grossRevenue, 0);
    const donutData = breakdown.map((x) => ({
        name: x.eventName ?? x.eventId,
        value: totalGross > 0 ? Math.round((x.grossRevenue / totalGross) * 100) : 0,
    }));

    // ─── Derived: stacked area ────────────────────────────────────────────────
    /**
     * Gộp theo ngày khi range = 1 tháng, gộp theo tuần khi range > 1 tháng.
     * Output: [{ label, [eventTitle]: revenue, ... }]
     */
    const { areaData, eventTitles } = useMemo(() => {
        if (!allEventSalesTrend?.events?.length) return { areaData: [], eventTitles: [] };

        const byDay = trendRange === 1;
        const map = new Map<string, Record<string, number>>();
        const keyToDate = new Map<string, Date>();

        for (const event of allEventSalesTrend.events) {
            const title = event.title ?? event.eventId;
            for (const point of event.salesTrend) {
                const d = new Date(point.time);
                const key = byDay
                    ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
                    : getWeekKey(d);

                if (!map.has(key)) {
                    map.set(key, {});
                    keyToDate.set(key, d);
                }
                const row = map.get(key)!;
                row[title] = (row[title] ?? 0) + point.netRevenue;
            }
        }

        const sorted = Array.from(map.entries()).sort(
            ([ka], [kb]) => keyToDate.get(ka)!.getTime() - keyToDate.get(kb)!.getTime()
        );

        const titles = Array.from(
            new Set(allEventSalesTrend.events.map((e) => e.title ?? e.eventId))
        );

        const data = sorted.map(([label, row]) => ({
            label,
            ...Object.fromEntries(titles.map((t) => [t, row[t] ?? 0])),
        }));

        return { areaData: data, eventTitles: titles };
    }, [allEventSalesTrend, trendRange]);

    const areaMaxValue = useMemo(() =>
        areaData.length === 0 ? 0 : Math.max(
            ...areaData.map((row) =>
                eventTitles.reduce((s, t) => s + ((row as unknown as Record<string, number>)[t] ?? 0), 0)
            )
        ),
        [areaData, eventTitles]
    );
    const areaScale = chartScale(areaMaxValue);

    const xAxisInterval = areaData.length > 20
        ? Math.floor(areaData.length / 8)
        : areaData.length > 10 ? 1 : 0;

    const isLoadingSummary = loading?.organizerSummary;
    const isLoadingBreakdown = loading?.organizerBreakdown;

    const colorMap = useMemo(() => {
        const map: Record<string, string> = {};

        const allKeys = [
            ...new Set([
                ...breakdown.map(x => x.eventName ?? x.eventId),
                ...eventTitles
            ])
        ];

        allKeys.forEach((key, i) => {
            map[key] = generateColor(i);
        });

        return map;
    }, [breakdown, eventTitles]);
    return (
        <div className="space-y-6">

            {/* ── Metric cards ── */}
            {isLoadingSummary || !summary ? (
                <div className="grid grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-card-dark rounded-xl border border-border-dark p-5 h-36 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <MetricCard
                        iconBg="#7c3bed" icon={<RiLineChartLine size={20} color="#FFFFFF" />}
                        label="Tổng doanh thu gộp"
                        value={`${fmtMoneyVND(summary.grossRevenue)} đồng`}
                        sub="Tất cả sự kiện"
                    />
                    <MetricCard
                        iconBg="#7c3bed" icon={<RiMoneyDollarCircleLine size={20} color="#FFFFFF" />}
                        label="Doanh thu ròng"
                        value={`${fmtMoneyVND(summary.netRevenue)} đồng`}
                        sub="Sau hoàn vé & khuyến mãi"
                    />
                    <MetricCard
                        iconBg="#7c3bed" icon={<RiCalendarEventLine size={20} color="#FFFFFF" />}
                        label="Số sự kiện"
                        value={String(summary.eventCount)}
                        sub={
                            <>
                                <span className="text-emerald-400">
                                    {summary.completedEventCount} đã hoàn thành
                                </span>
                                {" · "}
                                <span className="text-blue-400">
                                    {summary.activeEventCount} đang mở
                                </span>
                            </>
                        }
                    />
                    <MetricCard
                        iconBg="#7c3bed" icon={<RiRefund2Line size={20} color="#FFFFFF" />}
                        label="Tổng hoàn vé"
                        value={`${fmtMoneyVND(summary.totalRefunds)} đồng`}
                        sub={summary.grossRevenue > 0
                            ? `${((summary.totalRefunds / summary.grossRevenue) * 100).toFixed(2)}% tỉ lệ hoàn`
                            : "0% tỉ lệ hoàn"}
                        subColor="#f87171"
                    />
                </div>
            )}

            {/* ── Bar chart + Donut ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <SectionCard
                    className="lg:col-span-3"
                    title="Doanh thu theo sự kiện"
                    sub={`Doanh thu gộp và ròng từng sự kiện (${barScale.unit}đ)`}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => { if (showNet) setShowGross(v => !v); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showGross ? "bg-primary text-white" : "bg-surface-dark text-text-muted hover:text-white"}`}
                        >
                            Doanh thu gộp
                        </button>
                        <button
                            onClick={() => { if (showGross) setShowNet(v => !v); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showNet ? "bg-primary text-white" : "bg-surface-dark text-text-muted hover:text-white"}`}
                        >
                            Doanh thu ròng
                        </button>
                    </div>

                    {isLoadingBreakdown ? (
                        <div className="h-52 bg-surface-dark rounded-lg animate-pulse" />
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={barData} barCategoryGap="30%">
                                    <CartesianGrid vertical={false} stroke="#1e293b" />
                                    <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis
                                        tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false}
                                        tickFormatter={(v) => `${+(v / barScale.divisor).toFixed(1)}${barScale.unit[0]}`}
                                        width={48}
                                    />
                                    <Tooltip
                                        {...TooltipStyle}
                                        formatter={(val: number | undefined, name: string | undefined) => [
                                            `${fmtMoneyVND(val ?? 0)} đồng`,
                                            name === "gross" ? "Doanh thu gộp" : "Doanh thu ròng",
                                        ]}
                                    />
                                    {showGross && <Bar dataKey="gross" name="gross" fill="#7c3bed" radius={[4, 4, 0, 0]} />}
                                    {showNet && <Bar dataKey="net" name="net" fill="#2dd4bf" radius={[4, 4, 0, 0]} />}
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex items-center gap-5 mt-3">
                                {showGross && (
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
                                        <span className="text-sm text-slate-400">Doanh thu gộp</span>
                                    </div>
                                )}
                                {showNet && (
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#2dd4bf" }} />
                                        <span className="text-sm text-slate-400">Doanh thu ròng</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </SectionCard>

                <SectionCard className="lg:col-span-2" title="Phân bổ doanh thu" sub="Tỉ trọng từng sự kiện (%)">
                    {isLoadingBreakdown ? (
                        <div className="h-52 bg-surface-dark rounded-lg animate-pulse" />
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {donutData.map((d, i) => (
                                            <Cell key={i} fill={colorMap[d.name]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={TooltipStyle.contentStyle}
                                        itemStyle={TooltipStyle.itemStyle}
                                        formatter={(val: number | string | undefined) => [(val ?? 0) + "%"]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-2 mt-1">
                                {donutData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: colorMap[d.name] }} />
                                            <span className="text-sm text-slate-400 truncate max-w-[130px]">{d.name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-white">{d.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </SectionCard>
            </div>

            {/* ── Stacked Area Trend + Refund rates ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Stacked area */}
                <SectionCard
                    title="Xu hướng doanh thu ròng theo sự kiện"
                    sub={trendRange === 1
                        ? `Theo ngày — 1 tháng gần nhất (${areaScale.unit}đ)`
                        : `Theo tuần — ${trendRange} tháng gần nhất (${areaScale.unit}đ)`}
                    headerRight={
                        <div className="flex items-center gap-1 -mt-0.5 flex-shrink-0">
                            {RANGE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setTrendRange(opt.value)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${trendRange === opt.value
                                        ? "bg-primary text-white"
                                        : "bg-surface-dark text-text-muted hover:text-white"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    }
                >
                    {allEventSalesTrendLoading ? (
                        <div className="h-52 bg-surface-dark rounded-lg animate-pulse" />
                    ) : areaData.length === 0 ? (
                        <div className="h-52 flex items-center justify-center text-sm text-text-muted">
                            Chưa có dữ liệu xu hướng
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={areaData}>
                                    <defs>
                                        {eventTitles.map((title, i) => (
                                            <linearGradient key={title} id={`areaGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={colorMap[title]} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={colorMap[title]} stopOpacity={0.05} />
                                            </linearGradient>
                                        ))}

                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#1e293b" />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: "#475569", fontSize: 11 }}
                                        axisLine={false} tickLine={false}
                                        interval={xAxisInterval}
                                    />
                                    <YAxis
                                        tick={{ fill: "#475569", fontSize: 11 }}
                                        axisLine={false} tickLine={false}
                                        tickFormatter={(v) => `${+(v / areaScale.divisor).toFixed(1)}${areaScale.unit[0]}`}
                                        width={48}
                                    />
                                    <Tooltip
                                        {...TooltipStyle}
                                        formatter={(val: number | undefined, name: string | undefined) => [
                                            `${fmtMoneyVND(val ?? 0)} đồng`,
                                            name,
                                        ]}
                                    />
                                    {eventTitles.map((title, i) => (
                                        <Area
                                            key={title}
                                            type="monotone"
                                            dataKey={title}
                                            stackId="1"
                                            stroke={colorMap[title]}
                                            strokeWidth={1.5}
                                            fill={`url(#areaGrad${i})`}
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                                {eventTitles.map((title) => (
                                    <div key={title} className="flex items-center gap-1.5">
                                        <span
                                            className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0"
                                            style={{ background: colorMap[title] }}
                                        />
                                        <span className="text-xs text-slate-400 truncate max-w-[120px]">{title}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </SectionCard>

                {/* Refund rates */}
                <SectionCard title="Tỉ lệ hoàn vé theo sự kiện" sub="% hoàn trên tổng doanh thu gộp">
                    {isLoadingBreakdown ? (
                        <div className="h-40 bg-surface-dark rounded-lg animate-pulse" />
                    ) : (
                        <div className="flex flex-col gap-4 mt-1">
                            {breakdown.map((r) => (
                                <div key={r.eventId}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm text-slate-400 truncate max-w-[170px]">
                                            {r.eventName ?? r.eventId}
                                        </span>
                                        <span className="text-sm font-medium tabular-nums" style={{ color: refundColor(r.refundRate) }}>
                                            {r.refundRate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-slate-800">
                                        <div
                                            className="h-1.5 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min(r.refundRate * 8, 100)}%`,
                                                background: refundColor(r.refundRate),
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* ── Event table ── */}
            <div className="bg-card-dark rounded-xl border border-border-dark overflow-hidden">
                <div className="px-5 py-4 border-b border-border-dark">
                    <p className="text-base font-semibold text-white">Tổng quan tất cả sự kiện</p>
                    <p className="text-sm text-text-muted mt-0.5">Doanh thu gộp · ròng · hoàn vé · trạng thái</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface-dark">
                                {["Sự kiện", "Doanh thu gộp", "Hoàn vé", "Doanh thu ròng", "Tỉ lệ hoàn", "Trạng thái"].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-sm font-medium text-text-muted uppercase tracking-widest whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark">
                            {isLoadingBreakdown ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-5 py-4">
                                            <div className="h-4 bg-surface-dark rounded animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                breakdown.map((row) => (
                                    <tr key={row.eventId} className="hover:bg-surface-dark/50 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-white whitespace-nowrap">
                                            {row.eventName ?? row.eventId}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap tabular-nums">
                                            {fmtMoneyVND(row.grossRevenue)} đồng
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap tabular-nums">
                                            {fmtMoneyVND(row.refundAmount)} đồng
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap tabular-nums">
                                            {fmtMoneyVND(row.netRevenue)} đồng
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-1.5 w-20 rounded-full bg-slate-800">
                                                    <div
                                                        className="h-1.5 rounded-full"
                                                        style={{
                                                            width: `${Math.min(row.refundRate * 8, 100)}%`,
                                                            background: refundColor(row.refundRate),
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium tabular-nums" style={{ color: refundColor(row.refundRate) }}>
                                                    {row.refundRate.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">{statusBadge(row.status)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}