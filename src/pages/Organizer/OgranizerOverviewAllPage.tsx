import { CalendarDays, DollarSign, RotateCcw, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import type { AppDispatch, RootState } from "../../store";
import {
    fetchRevenueBreakdownOrganizer,
    fetchRevenueSummaryOrganizer,
} from "../../store/reportSlice";

// ─── Mock / placeholder data ──────────────────────────────────────────────────

const MOCK_ORGANIZER_ID = "org-001";

const mockBreakdown = [
    { eventId: "AI Hội thảo 2025", revenue: 294_700_000 },
    { eventId: "Music Fest HCM", revenue: 235_800_000 },
    { eventId: "Tech Summit 2025", revenue: 168_500_000 },
    { eventId: "Food Expo Saigon", revenue: 85_300_000 },
    { eventId: "Design Week 2024", revenue: 58_200_000 },
];

const mockBreakdownNet = [
    { eventId: "AI Hội thảo 2025", revenue: 288_500_000 },
    { eventId: "Music Fest HCM", revenue: 219_800_000 },
    { eventId: "Tech Summit 2025", revenue: 163_100_000 },
    { eventId: "Food Expo Saigon", revenue: 75_600_000 },
    { eventId: "Design Week 2024", revenue: 57_200_000 },
];

const mockRefundRates = [
    { eventId: "AI Hội thảo 2025", rate: 2.1, status: "active" },
    { eventId: "Music Fest HCM", rate: 6.8, status: "upcoming" },
    { eventId: "Tech Summit 2025", rate: 3.2, status: "active" },
    { eventId: "Food Expo Saigon", rate: 11.4, status: "ended" },
    { eventId: "Design Week 2024", rate: 1.7, status: "ended" },
];

const mockTrend = [
    { month: "T10", revenue: 42 },
    { month: "T11", revenue: 68 },
    { month: "T12", revenue: 115 },
    { month: "T1", revenue: 88 },
    { month: "T2", revenue: 143 },
    { month: "T3", revenue: 176 },
    { month: "T4", revenue: 166 },
];

const DONUT_COLORS = ["#7c3bed", "#2dd4bf", "#fbbf24", "#f87171", "#60a5fa"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtVND = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    return n.toLocaleString("vi-VN");
};

const statusBadge = (status: string) => {
    switch (status) {
        case "active":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-900">
                    Đang mở
                </span>
            );
        case "upcoming":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-400 border border-amber-900">
                    Sắp diễn ra
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                    Đã kết thúc
                </span>
            );
    }
};

const refundColor = (rate: number) => {
    if (rate < 4) return "#4ade80";
    if (rate < 8) return "#fbbf24";
    return "#f87171";
};

// ─── Custom tooltip styles (dark, readable) ───────────────────────────────────

const TooltipStyle = {
    contentStyle: {
        background: "#0f0c1a",
        border: "1px solid #334155",
        borderRadius: "10px",
        color: "#f1f5f9",
        fontSize: "12px",
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
    sub: string;
    subColor?: string;
}

function MetricCard({ icon, iconBg, label, value, sub, subColor }: MetricCardProps) {
    return (
        <div className="bg-card-dark rounded-xl border border-border-dark p-5 flex flex-col gap-3">
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: iconBg }}
            >
                {icon}
            </div>
            <div>
                <p className="text-xs text-text-muted uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-medium text-white">{value}</p>
                <p className="text-xs mt-1" style={{ color: subColor ?? "#64748b" }}>
                    {sub}
                </p>
            </div>
        </div>
    );
}

interface SectionCardProps {
    title: string;
    sub: string;
    children: React.ReactNode;
    className?: string;
}

function SectionCard({ title, sub, children, className = "" }: SectionCardProps) {
    return (
        <div className={`bg-card-dark rounded-xl border border-border-dark p-5 ${className}`}>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-text-muted mt-0.5 mb-4">{sub}</p>
            {children}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OrganizerOverviewAllPage() {
    const dispatch = useDispatch<AppDispatch>();

    const { revenueSummaryOrganizer, loading } = useSelector(
        (state: RootState) => state.REPORT
    );

    const [byNet, setByNet] = useState(false);

    useEffect(() => {
        dispatch(fetchRevenueSummaryOrganizer(MOCK_ORGANIZER_ID));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchRevenueBreakdownOrganizer({ organizerId: MOCK_ORGANIZER_ID, byNet }));
    }, [dispatch, byNet]);

    // Use redux data if available, otherwise fall back to mock
    const summary = revenueSummaryOrganizer ?? {
        organizerId: MOCK_ORGANIZER_ID,
        grossRevenue: 842_500_000,
        totalRefunds: 44_200_000,
        netRevenue: 798_300_000,
        eventCount: 12,
    };

    const grossBreakdown = mockBreakdown;
    const netBreakdown = mockBreakdownNet;

    // Merge gross + net for grouped bar chart
    const barData = grossBreakdown.map((g, i) => ({
        name: g.eventId.replace(" 2025", "").replace(" 2024", ""),
        gross: Math.round(g.revenue / 1_000_000),
        net: Math.round((netBreakdown[i]?.revenue ?? 0) / 1_000_000),
    }));

    // Donut data
    const totalGross = grossBreakdown.reduce((s, x) => s + x.revenue, 0);
    const donutData = grossBreakdown.map((x) => ({
        name: x.eventId.replace(" 2025", "").replace(" 2024", ""),
        value: Math.round((x.revenue / totalGross) * 100),
    }));

    const isLoadingSummary = loading?.organizerSummary;
    const isLoadingBreakdown = loading?.organizerBreakdown;

    return (
        <div className="space-y-6">

            {/* ── Metric cards ── */}
            {isLoadingSummary ? (
                <div className="grid grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-card-dark rounded-xl border border-border-dark p-5 h-32 animate-pulse"
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <MetricCard
                        iconBg="#1a0f33"
                        icon={<TrendingUp size={16} color="#9d6ef5" />}
                        label="Tổng doanh thu gộp"
                        value={fmtVND(summary.grossRevenue) + " VND"}
                        sub="Tất cả sự kiện"
                    />
                    <MetricCard
                        iconBg="#0a2a1a"
                        icon={<DollarSign size={16} color="#4ade80" />}
                        label="Doanh thu ròng"
                        value={fmtVND(summary.netRevenue) + " VND"}
                        sub="Sau hoàn vé & khuyến mãi"
                    />
                    <MetricCard
                        iconBg="#2a1206"
                        icon={<CalendarDays size={16} color="#fbbf24" />}
                        label="Số sự kiện"
                        value={String(summary.eventCount)}
                        sub="8 đã hoàn thành · 4 đang mở"
                    />
                    <MetricCard
                        iconBg="#2a0a0f"
                        icon={<RotateCcw size={16} color="#f87171" />}
                        label="Tổng hoàn vé"
                        value={fmtVND(summary.totalRefunds) + " VND"}
                        sub={
                            (
                                ((summary.totalRefunds / summary.grossRevenue) * 100).toFixed(2)
                            ) + "% tỉ lệ hoàn"
                        }
                        subColor="#f87171"
                    />
                </div>
            )}

            {/* ── Bar chart + Donut ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <SectionCard
                    className="lg:col-span-3"
                    title="Doanh thu theo sự kiện"
                    sub="Doanh thu gộp và ròng từng sự kiện (triệu VND)"
                >
                    {/* Toggle */}
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => setByNet(false)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${!byNet
                                ? "bg-primary text-white"
                                : "bg-surface-dark text-text-muted hover:text-white"
                                }`}
                        >
                            Doanh thu gộp
                        </button>
                        <button
                            onClick={() => setByNet(true)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${byNet
                                ? "bg-primary text-white"
                                : "bg-surface-dark text-text-muted hover:text-white"
                                }`}
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
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: "#475569", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "#475569", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => v + "M"}
                                        width={42}
                                    />
                                    <Tooltip
                                        {...TooltipStyle}
                                        formatter={(val: number | string | undefined) => [
                                            (val ?? 0) + "M VND",
                                        ]}
                                    />
                                    <Bar
                                        dataKey="gross"
                                        name="Doanh thu gộp"
                                        fill="#7c3bed"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="net"
                                        name="Doanh thu ròng"
                                        fill="#2dd4bf"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>

                            {/* Legend */}
                            <div className="flex items-center gap-5 mt-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
                                    <span className="text-xs text-slate-400">Doanh thu gộp</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#2dd4bf" }} />
                                    <span className="text-xs text-slate-400">Doanh thu ròng</span>
                                </div>
                            </div>
                        </>
                    )}
                </SectionCard>

                <SectionCard
                    className="lg:col-span-2"
                    title="Phân bổ doanh thu"
                    sub="Tỉ trọng từng sự kiện (%)"
                >
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={donutData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {donutData.map((_, i) => (
                                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={TooltipStyle.contentStyle}
                                itemStyle={TooltipStyle.itemStyle}
                                formatter={(val: number | string | undefined) => [
                                    (val ?? 0) + "%",
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="flex flex-col gap-2 mt-1">
                        {donutData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-2.5 h-2.5 rounded-sm inline-block"
                                        style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                                    />
                                    <span className="text-xs text-slate-400 truncate max-w-[130px]">{d.name}</span>
                                </div>
                                <span className="text-xs font-medium text-white">{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* ── Trend + Refund rates ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SectionCard
                    title="Xu hướng doanh thu ròng"
                    sub="Theo tháng (triệu VND)"
                >
                    <ResponsiveContainer width="100%" height={190}>
                        <LineChart data={mockTrend}>
                            <CartesianGrid vertical={false} stroke="#1e293b" />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: "#475569", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: "#475569", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => v + "M"}
                                width={42}
                            />
                            <Tooltip
                                {...TooltipStyle}
                                formatter={(val: number | string | undefined) => [
                                    (val ?? 0) + "M VND",
                                    "Doanh thu ròng",
                                ]}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#7c3bed"
                                strokeWidth={2}
                                dot={{ fill: "#7c3bed", r: 3, strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: "#9d6ef5" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </SectionCard>

                <SectionCard
                    title="Tỉ lệ hoàn vé theo sự kiện"
                    sub="% hoàn trên tổng doanh thu gộp"
                >
                    <div className="flex flex-col gap-4 mt-1">
                        {mockRefundRates.map((r) => (
                            <div key={r.eventId}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs text-slate-400 truncate max-w-[170px]">
                                        {r.eventId}
                                    </span>
                                    <span
                                        className="text-xs font-medium tabular-nums"
                                        style={{ color: refundColor(r.rate) }}
                                    >
                                        {r.rate}%
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-800">
                                    <div
                                        className="h-1.5 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(r.rate * 8, 100)}%`,
                                            background: refundColor(r.rate),
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* ── Event table ── */}
            <div className="bg-card-dark rounded-xl border border-border-dark overflow-hidden">
                <div className="px-5 py-4 border-b border-border-dark">
                    <p className="text-sm font-medium text-white">Tổng quan tất cả sự kiện</p>
                    <p className="text-xs text-text-muted mt-0.5">
                        Doanh thu gộp · ròng · hoàn vé · trạng thái
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface-dark">
                                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-widest whitespace-nowrap">
                                    Sự kiện
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-widest whitespace-nowrap">
                                    Doanh thu gộp
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-widest whitespace-nowrap">
                                    Hoàn vé
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-widest whitespace-nowrap">
                                    Doanh thu ròng
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-widest whitespace-nowrap">
                                    Tỉ lệ hoàn
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-widest whitespace-nowrap">
                                    Trạng thái
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark">
                            {grossBreakdown.map((row, i) => {
                                const netRev = netBreakdown[i]?.revenue ?? 0;
                                const refund = row.revenue - netRev;
                                const rate = mockRefundRates[i];
                                return (
                                    <tr
                                        key={row.eventId}
                                        className="hover:bg-surface-dark/50 transition-colors"
                                    >
                                        <td className="px-5 py-3.5 font-medium text-white whitespace-nowrap">
                                            {row.eventId}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap tabular-nums">
                                            {fmtVND(row.revenue)} VND
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap tabular-nums">
                                            {fmtVND(refund)} VND
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap tabular-nums">
                                            {fmtVND(netRev)} VND
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-1.5 w-20 rounded-full bg-slate-800">
                                                    <div
                                                        className="h-1.5 rounded-full"
                                                        style={{
                                                            width: `${Math.min(rate.rate * 8, 100)}%`,
                                                            background: refundColor(rate.rate),
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className="text-xs font-medium tabular-nums"
                                                    style={{ color: refundColor(rate.rate) }}
                                                >
                                                    {rate.rate}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">{statusBadge(rate.status)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}