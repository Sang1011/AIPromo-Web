import { useEffect, useMemo, useState } from "react";
import {
    RiCalendarEventLine,
    RiLineChartLine,
    RiMoneyDollarCircleLine,
    RiRefund2Line,
} from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import "../../components/Organizer/shared/datetime.css"
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

function EmptyChart({ message = "Chưa có dữ liệu" }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
            <div className="w-12 h-12 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center">
                <span className="text-xl text-slate-600">∅</span>
            </div>
            <p className="text-sm text-text-muted">{message}</p>
        </div>
    );
}

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
    const [areaSeries, setAreaSeries] = useState<"net" | "gross">("net");
    const [showGross, setShowGross] = useState(true);
    const [showNet, setShowNet] = useState(true);
    const [trendRange, setTrendRange] = useState<TrendRange>(3);
    const [customStart, setCustomStart] = useState<string>("");
    const [customEnd, setCustomEnd] = useState<string>("");
    const [useCustomRange, setUseCustomRange] = useState(false);
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
        const endDate = useCustomRange && customEnd ? new Date(customEnd) : new Date();
        const startDate = useCustomRange && customStart
            ? new Date(customStart)
            : (() => { const d = new Date(); d.setMonth(d.getMonth() - trendRange); return d; })();

        dispatch(fetchAllEventSalesTrend({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        }));
    }, [dispatch, trendRange, useCustomRange, customStart, customEnd]);

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
                // ← Switch field theo areaSeries
                const val = areaSeries === "net" ? point.netRevenue : point.grossRevenue;
                row[title] = (row[title] ?? 0) + val;
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
    }, [allEventSalesTrend, trendRange, areaSeries]);

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
                        sub="Sau khi trừ tiền hoàn vé, khuyến mãi & phí nền tảng"
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
                    ) : barData.length === 0 ? (
                        <EmptyChart message="Chưa có dữ liệu doanh thu" />
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
                    ) : totalGross === 0 ? (
                        <EmptyChart message="Chưa có doanh thu để phân bổ" />
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

            <SectionCard
                title="Xu hướng doanh thu theo sự kiện"
                sub={
                    useCustomRange
                        ? `Tùy chọn · ${areaScale.unit}đ · ${areaSeries === "net" ? "Doanh thu ròng" : "Doanh thu gộp"}`
                        : trendRange === 1
                            ? `Theo ngày — 1 tháng gần nhất (${areaScale.unit}đ) · ${areaSeries === "net" ? "Doanh thu ròng" : "Doanh thu gộp"}`
                            : `Theo tuần — ${trendRange} tháng gần nhất (${areaScale.unit}đ) · ${areaSeries === "net" ? "Doanh thu ròng" : "Doanh thu gộp"}`
                }
                headerRight={
                    <div className="flex items-center gap-2 -mt-0.5 flex-wrap justify-end">
                        {/* Gross/Net toggle */}
                        <div className="flex items-center gap-1 border border-slate-800 rounded-lg p-0.5">
                            <button onClick={() => setAreaSeries("net")}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${areaSeries === "net" ? "bg-primary text-white" : "text-text-muted hover:text-white"}`}>
                                Ròng
                            </button>
                            <button onClick={() => setAreaSeries("gross")}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${areaSeries === "gross" ? "bg-primary text-white" : "text-text-muted hover:text-white"}`}>
                                Gộp
                            </button>
                        </div>

                        {/* Preset range */}
                        <div className="flex items-center gap-1">
                            {RANGE_OPTIONS.map((opt) => (
                                <button key={opt.value} onClick={() => { setTrendRange(opt.value); setUseCustomRange(false); }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                                    ${!useCustomRange && trendRange === opt.value
                                            ? "bg-primary text-white"
                                            : "bg-surface-dark text-text-muted hover:text-white"}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom date range */}
                        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => { setCustomStart(e.target.value); setUseCustomRange(true); }}
                                className="bg-surface-dark border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300
                                focus:outline-none focus:border-primary/60 transition cursor-pointer"
                            />
                            <span className="text-slate-600 text-xs">→</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => { setCustomEnd(e.target.value); setUseCustomRange(true); }}
                                className="bg-surface-dark border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300
                                focus:outline-none focus:border-primary/60 transition cursor-pointer"
                            />
                            {useCustomRange && (
                                <button onClick={() => { setUseCustomRange(false); setCustomStart(""); setCustomEnd(""); }}
                                    className="text-slate-500 hover:text-red-400 transition text-xs px-1">✕</button>
                            )}
                        </div>
                    </div>
                }
            >
                {allEventSalesTrendLoading ? (
                    <div className="h-64 bg-surface-dark rounded-lg animate-pulse" />
                ) : areaData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-sm text-text-muted">
                        Chưa có dữ liệu xu hướng
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={260}>
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
                                <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} interval={xAxisInterval} />
                                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false}
                                    tickFormatter={(v) => `${+(v / areaScale.divisor).toFixed(1)}${areaScale.unit[0]}`} width={48} />
                                <Tooltip {...TooltipStyle}
                                    formatter={(val: number | undefined, name: string | undefined) => [`${fmtMoneyVND(val ?? 0)} đồng`, name]} />
                                {eventTitles.map((title, i) => (
                                    <Area key={title} type="monotone" dataKey={title} stackId="1"
                                        stroke={colorMap[title]} strokeWidth={1.5} fill={`url(#areaGrad${i})`} />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                            {eventTitles.map((title) => (
                                <div key={title} className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0" style={{ background: colorMap[title] }} />
                                    <span className="text-xs text-slate-400 truncate max-w-[150px]">{title}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </SectionCard>

            {/* ── Row 3: Donut hoàn vé (2col) + Bảng chi tiết (3col) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* Donut hoàn vé */}
                <SectionCard className="lg:col-span-2" title="Phân bổ hoàn vé" sub="Tỉ trọng hoàn vé từng sự kiện">
                    {isLoadingBreakdown ? (
                        <div className="h-52 bg-surface-dark rounded-lg animate-pulse" />
                    ) : (() => {
                        const totalRefund = breakdown.reduce((s, x) => s + x.refundAmount, 0);

                        if (totalRefund === 0) {
                            return (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
                                        <span className="text-2xl">✓</span>
                                    </div>
                                    <p className="text-sm font-semibold text-emerald-400">Không có hoàn vé</p>
                                    <p className="text-xs text-slate-500 text-center max-w-[160px]">
                                        Tất cả sự kiện đều không có giao dịch hoàn vé
                                    </p>
                                </div>
                            );
                        }

                        const donutRefundData = breakdown
                            .filter((x) => x.refundAmount > 0)  // chỉ show sự kiện có hoàn
                            .map((x) => ({
                                name: x.eventName ?? x.eventId,
                                value: x.refundAmount,
                                pct: Math.round((x.refundAmount / totalRefund) * 100),
                            }));

                        return (
                            <>
                                <div className="relative">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={donutRefundData} cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                                                {donutRefundData.map((d, i) => (
                                                    <Cell key={i} fill={colorMap[d.name]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={TooltipStyle.contentStyle}
                                                itemStyle={TooltipStyle.itemStyle}
                                                formatter={(val: number | undefined) => [`${fmtMoneyVND(val ?? 0)} đồng`, "Hoàn vé"]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tổng hoàn</p>
                                        <p className="text-sm font-bold text-white">{fmtMoneyVND(totalRefund)}</p>
                                        <p className="text-[10px] text-slate-500">đồng</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 mt-2">
                                    {donutRefundData.map((d, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ background: colorMap[d.name] }} />
                                                <span className="text-xs text-slate-400 truncate max-w-[120px]">{d.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-slate-500">{fmtMoneyVND(d.value)}đ</span>
                                                <span className="text-xs font-semibold text-white w-8 text-right">{d.pct}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        );
                    })()}
                </SectionCard>

                {/* Bảng chi tiết hoàn vé nâng cấp */}
                <SectionCard className="lg:col-span-3" title="Tỉ lệ hoàn vé theo sự kiện" sub="% hoàn · tiền hoàn · phân loại rủi ro">
                    {isLoadingBreakdown ? (
                        <div className="h-40 bg-surface-dark rounded-lg animate-pulse" />
                    ) : breakdown.length === 0 ? (
                        <EmptyChart message="Chưa có dữ liệu hoàn vé" />
                    ) : (
                        <div className="flex flex-col gap-5 mt-1">
                            {breakdown.map((r) => {
                                const riskBadge = r.refundRate < 4
                                    ? { label: "Tốt", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-400/25" }
                                    : r.refundRate < 8
                                        ? { label: "Trung bình", cls: "bg-amber-500/10 text-amber-400 border-amber-400/25" }
                                        : { label: "Cao", cls: "bg-red-500/10 text-red-400 border-red-400/25" };
                                return (
                                    <div key={r.eventId}>
                                        <div className="flex items-center justify-between mb-1.5 gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colorMap[r.eventName ?? r.eventId] }} />
                                                <span className="text-sm text-slate-300 truncate">{r.eventName ?? r.eventId}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-slate-500 tabular-nums">{fmtMoneyVND(r.refundAmount)}đ</span>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskBadge.cls}`}>
                                                    {riskBadge.label}
                                                </span>
                                                <span className="text-sm font-bold tabular-nums w-12 text-right" style={{ color: refundColor(r.refundRate) }}>
                                                    {r.refundRate.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-800">
                                            <div className="h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(r.refundRate * 8, 100)}%`, background: refundColor(r.refundRate) }} />
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Summary footer */}
                            {breakdown.some(r => r.refundAmount > 0) && (
                                <div className="mt-1 pt-3 border-t border-border-dark flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Tổng hoàn vé</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-white">
                                            {fmtMoneyVND(breakdown.reduce((s, r) => s + r.refundAmount, 0))} đồng
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            / {breakdown.length} sự kiện
                                        </span>
                                    </div>
                                </div>
                            )}
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
                            ) : breakdown.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center">
                                        <p className="text-sm text-text-muted">Chưa có dữ liệu sự kiện</p>
                                    </td>
                                </tr>
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