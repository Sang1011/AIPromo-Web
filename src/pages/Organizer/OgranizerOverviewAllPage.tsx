import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    RiMoneyDollarCircleLine,
    RiRefund2Line,
    RiCalendarEventLine,
    RiLineChartLine,
} from "react-icons/ri";
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
import { fetchOrganizerProfile } from "../../store/organizerProfileSlice";
import type { EventStatus } from "../../types/event/event";

// ─── Mock trend (no API available) ───────────────────────────────────────────
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
const fmtVND = (n: number): string => {
    if (n === 0) return "0";

    const ty = Math.floor(n / 1_000_000_000);
    const trieu = Math.floor((n % 1_000_000_000) / 1_000_000);
    const nghin = Math.floor((n % 1_000_000) / 1_000);

    const parts: string[] = [];
    if (ty > 0) parts.push(`${ty} tỷ`);
    if (trieu > 0) parts.push(`${trieu} triệu`);
    if (nghin > 0) parts.push(`${nghin} nghìn`);

    return parts.join(" ");
};

const statusBadge = (status: EventStatus) => {
    switch (status) {
        case "Published":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-emerald-950 text-emerald-400 border border-emerald-900">
                    Đang mở
                </span>
            );
        case "PendingReview":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-950 text-blue-400 border border-blue-900">
                    Chờ duyệt
                </span>
            );
        case "PendingCancellation":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-orange-950 text-orange-400 border border-orange-900">
                    Chờ huỷ
                </span>
            );
        case "Suspended":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-950 text-red-400 border border-red-900">
                    Đã tạm dừng
                </span>
            );
        case "Cancelled":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-rose-950 text-rose-400 border border-rose-900">
                    Đã huỷ
                </span>
            );
        case "Completed":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-slate-800 text-slate-400 border border-slate-700">
                    Đã kết thúc
                </span>
            );
        case "Draft":
        default:
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-zinc-900 text-zinc-400 border border-zinc-700">
                    Bản nháp
                </span>
            );
    }
};

const refundColor = (rate: number) => {
    if (rate < 4) return "#4ade80";
    if (rate < 8) return "#fbbf24";
    return "#f87171";
};

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
    sub: string;
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
    sub: string;
    children: React.ReactNode;
    className?: string;
}

function SectionCard({ title, sub, children, className = "" }: SectionCardProps) {
    return (
        <div className={`bg-card-dark rounded-xl border border-border-dark p-5 ${className}`}>
            <p className="text-base font-semibold text-white">{title}</p>
            <p className="text-sm text-text-muted mt-0.5 mb-4">{sub}</p>
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

    const [showGross, setShowGross] = useState(true);
    const [showNet, setShowNet] = useState(true);

    // 1. Fetch profile trước để lấy profileId
    useEffect(() => {
        dispatch(fetchOrganizerProfile());
    }, [dispatch]);

    // 2. Khi đã có profileId → fetch summary + breakdown
    useEffect(() => {
        if (!profile?.userId) return;
        dispatch(fetchRevenueSummaryOrganizer(profile.userId));
    }, [dispatch, profile?.userId]);

    useEffect(() => {
        if (!profile?.userId) return;
        dispatch(fetchRevenueBreakdownOrganizer({ organizerId: profile.userId, byNet: false }));
    }, [dispatch, profile?.userId]);

    // ─── Derived data ─────────────────────────────────────────────────────────

    const summary = revenueSummaryOrganizer;
    const breakdown = revenueBreakdownOrganizer ?? [];

    const barData = breakdown.map((item) => ({
        name: item.eventName ?? item.eventId,
        gross: Math.round(item.grossRevenue / 1_000_000),
        net: Math.round(item.netRevenue / 1_000_000),
    }));

    const totalGross = breakdown.reduce((s, x) => s + x.grossRevenue, 0);
    const donutData = breakdown.map((x) => ({
        name: x.eventName ?? x.eventId,
        value: totalGross > 0 ? Math.round((x.grossRevenue / totalGross) * 100) : 0,
    }));

    const isLoadingSummary = loading?.organizerSummary;
    const isLoadingBreakdown = loading?.organizerBreakdown;

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
                        iconBg="#7c3bed"
                        icon={<RiLineChartLine size={20} color="#FFFFFF" />}
                        label="Tổng doanh thu gộp"
                        value={fmtVND(summary.grossRevenue) + " đồng"}
                        sub="Tất cả sự kiện"
                    />
                    <MetricCard
                        iconBg="#7c3bed"
                        icon={<RiMoneyDollarCircleLine size={20} color="#FFFFFF" />}
                        label="Doanh thu ròng"
                        value={fmtVND(summary.netRevenue) + " đồng"}
                        sub="Sau hoàn vé & khuyến mãi"
                    />
                    <MetricCard
                        iconBg="#7c3bed"
                        icon={<RiCalendarEventLine size={20} color="#FFFFFF" />}
                        label="Số sự kiện"
                        value={String(summary.eventCount)}
                        sub={`${summary.completedEventCount} đã hoàn thành · ${summary.activeEventCount} đang mở`}
                    />
                    <MetricCard
                        iconBg="#7c3bed"
                        icon={<RiRefund2Line size={20} color="#FFFFFF" />}
                        label="Tổng hoàn vé"
                        value={fmtVND(summary.totalRefunds) + " đồng"}
                        sub={
                            summary.grossRevenue > 0
                                ? ((summary.totalRefunds / summary.grossRevenue) * 100).toFixed(2) + "% tỉ lệ hoàn"
                                : "0% tỉ lệ hoàn"
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
                    sub="Doanh thu gộp và ròng từng sự kiện (triệuđ)"
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
                                    <YAxis tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => v + "M"} width={44} />
                                    <Tooltip
                                        {...TooltipStyle}
                                        formatter={(val, name) => {
                                            return [
                                                `${val ?? 0} triệu đồng`,
                                                name === "Doanh thu gộp" ? "Doanh thu gộp" : "Doanh thu ròng"
                                            ];
                                        }}
                                    />
                                    {showGross && <Bar dataKey="gross" name="Doanh thu gộp" fill="#7c3bed" radius={[4, 4, 0, 0]} />}
                                    {showNet && <Bar dataKey="net" name="Doanh thu ròng" fill="#2dd4bf" radius={[4, 4, 0, 0]} />}
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
                                        {donutData.map((_, i) => (
                                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
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
                                            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
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

            {/* ── Trend + Refund rates ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SectionCard title="Xu hướng doanh thu ròng" sub="Theo tháng (triệu đồng)">
                    <ResponsiveContainer width="100%" height={190}>
                        <LineChart data={mockTrend}>
                            <CartesianGrid vertical={false} stroke="#1e293b" />
                            <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => v + "M"} width={44} />
                            <Tooltip
                                {...TooltipStyle}
                                formatter={(val: number | string | undefined) => [(val ?? 0) + " triệu đồng", "Doanh thu ròng"]}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#7c3bed" strokeWidth={2} dot={{ fill: "#7c3bed", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#9d6ef5" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </SectionCard>

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
                                            {fmtVND(row.grossRevenue)}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap tabular-nums">
                                            {fmtVND(row.refundAmount)}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap tabular-nums">
                                            {fmtVND(row.netRevenue)}
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