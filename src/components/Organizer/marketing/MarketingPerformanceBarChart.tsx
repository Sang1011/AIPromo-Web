import { useCallback, useEffect, useMemo, useState } from "react";
import { MdFacebook, MdOutlineBarChart, MdOutlineRefresh, MdOutlineTouchApp, MdOutlineVisibility } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis,
} from "recharts";
import postService from "../../../services/postService";
import type { AppDispatch, RootState } from "../../../store";
import { clearDistributionMetricsMap, fetchAllDistributionMetrics } from "../../../store/postSlice";
import type { DistributionMetricsFacebook, PostListItem } from "../../../types/post/post";
import { EmptyStateFacebook } from "../shared/EmtyState";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(n < 10 ? 2 : 0);
}

function truncateTitle(s: string, max = 22): string {
    return s.length > max ? s.slice(0, max) + "…" : s;
}

// ─── Parse facebook metrics from distribution platformMetadata ────────────────
// platformMetadata có thể chứa JSON metrics, hoặc dùng fallback từ distributions

interface ParsedFbMetrics {
    reach: number;
    clicks: number;
    likes: number;
    comments: number;
}

function parseFbMetrics(
    post: PostListItem,
    metricsMap: Record<string, DistributionMetricsFacebook>
): ParsedFbMetrics | null {
    const fbDist = (post.distributions ?? [])
        .filter(d => d.platform === "Facebook" && d.status === "Sent")
        .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime())[0];

    if (!fbDist) return null;

    const m = metricsMap[fbDist.id];
    if (!m) return null;

    return {
        reach: m.reach ?? 0,
        clicks: m.clicks ?? 0,
        likes: m.likes ?? 0,
        comments: m.comments ?? 0
    };
}

type ChartConfigType = {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    dimColor: string;
    tooltipUnit: string;
    getMetric: (m: ParsedFbMetrics) => number;
    getSecondary: ((m: ParsedFbMetrics) => number) | null;
    secondaryLabel: string;
    primaryLabel: string;
    description: string;
};

const CHART_CONFIGS: ChartConfigType[] = [
    {
        id: "reach",
        title: "Reach",
        subtitle: "Độ phủ nội dung",
        icon: <MdOutlineVisibility />,
        color: "#3b82f6",
        dimColor: "#3b82f680",
        tooltipUnit: "",
        getMetric: (m: ParsedFbMetrics) => m.reach,
        getSecondary: null,
        secondaryLabel: "",
        primaryLabel: "Reach",
        description: "Số người tiếp cận bài viết. Đo độ phủ của nội dung.",
    },
    {
        id: "engagement",
        title: "Engagement Rate",
        subtitle: "Tỷ lệ tương tác",
        icon: <MdOutlineBarChart />,
        color: "#8b5cf6",
        dimColor: "#8b5cf680",
        tooltipUnit: "%",
        getMetric: (m: ParsedFbMetrics) =>
            m.reach > 0 ? +(((m.likes + m.comments) / m.reach) * 100).toFixed(2) : 0,
        getSecondary: null,
        secondaryLabel: "",
        primaryLabel: "Engagement Rate",
        description: "(Likes + Comments) ÷ Reach × 100. Đo chất lượng nội dung.",
    },
    {
        id: "clickThrough",
        title: "Click Rate",
        subtitle: "Tỷ lệ click",
        icon: <MdOutlineTouchApp />,
        color: "#10b981",
        dimColor: "#10b98180",
        tooltipUnit: "",
        getMetric: (m: ParsedFbMetrics) => m.clicks,
        getSecondary: null,
        secondaryLabel: "",
        primaryLabel: "Clicks",
        description: "Số lượt click vào bài viết. Đo hiệu quả dẫn traffic mua vé.",
    },
];

// ─── CustomTooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, unit, primaryLabel, secondaryLabel }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl px-4 py-3 shadow-xl text-xs space-y-1.5 min-w-[140px]">
            <p className="text-white font-bold text-sm truncate max-w-[180px]">{payload[0].payload.title}</p>
            <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">{primaryLabel}</span>
                <span className="text-white font-bold">{payload[0].value}{unit}</span>
            </div>
            {secondaryLabel && payload[1] && (
                <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">{secondaryLabel}</span>
                    <span className="text-slate-300 font-semibold">{fmt(payload[1].value)}</span>
                </div>
            )}
        </div>
    );
}

// ─── SingleChart ──────────────────────────────────────────────────────────────

type ChartConfig = typeof CHART_CONFIGS[number];

function SingleChart({ config, data }: { config: ChartConfig; data: any[] }) {
    const maxVal = Math.max(...data.map(d => d.primary));

    return (
        <div className="glass border border-slate-800/50 rounded-[28px] p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                    {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{config.title}</h3>
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full font-semibold">
                            {config.subtitle}
                        </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{config.description}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="shortTitle"
                            tick={{ fill: "#64748b", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: "#64748b", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={config.tooltipUnit === "%" ? (v) => `${v}%` : fmt}
                        />
                        <Tooltip
                            content={
                                <CustomTooltip
                                    unit={config.tooltipUnit}
                                    primaryLabel={config.primaryLabel}
                                    secondaryLabel={config.secondaryLabel}
                                />
                            }
                            cursor={{ fill: "rgba(255,255,255,0.03)" }}
                        />
                        <Bar dataKey="primary" radius={[6, 6, 0, 0]} maxBarSize={48}>
                            {data.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={entry.primary === maxVal ? config.color : config.dimColor}
                                />
                            ))}
                        </Bar>
                        {config.getSecondary && (
                            <Bar dataKey="secondary" radius={[4, 4, 0, 0]} maxBarSize={48}
                                fill={`${config.color}30`} />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function SummaryCards({ metricsMap }: { metricsMap: Record<string, DistributionMetricsFacebook> }) {
    const all = Object.values(metricsMap);
    if (!all.length) return null;

    const totalReach = all.reduce((s, m) => s + m.reach, 0);
    const totalClicks = all.reduce((s, m) => s + m.clicks, 0);
    const totalEngagements = all.reduce((s, m) => s + m.likes + m.comments, 0);
    const avgEngRate = totalReach > 0
        ? +((totalEngagements / totalReach) * 100).toFixed(2)
        : 0;

    const cards = [
        { label: "Tổng Reach", value: fmt(totalReach), sub: "Người tiếp cận duy nhất", color: "#3b82f6" },
        { label: "Tổng Clicks", value: fmt(totalClicks), sub: "Lượt click vào bài", color: "#10b981" },
        { label: "Tổng Tương tác", value: fmt(totalEngagements), sub: `Eng. Rate TB ${avgEngRate}%`, color: "#8b5cf6" },
        { label: "Số bài đã phân tích", value: `${all.length}`, sub: "bài có Facebook distribution", color: "#f59e0b" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map(card => (
                <div key={card.label}
                    className="glass border border-slate-800/50 rounded-2xl px-4 py-3 space-y-1">
                    <p className="text-[11px] text-slate-500 font-medium">{card.label}</p>
                    <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                    <p className="text-[10px] text-slate-600">{card.sub}</p>
                </div>
            ))}
        </div>
    );
}

export default function MarketingPerformanceBarChart() {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, distributionMetricsMap } = useSelector((s: RootState) => s.POST);
    const { eventId } = useParams<{ eventId: string }>();
    const [localPosts, setLocalPosts] = useState<PostListItem[]>([]);

    useEffect(() => {
        dispatch(clearDistributionMetricsMap());
        postService.getOrganizerPosts({
            pageNumber: 1,
            pageSize: 50,
            sortColumn: "PublishedAt",
            sortOrder: "desc",
            status: "Published",
            hasExternalPostUrl: true,
            eventId: eventId
        }).then(res => {
            if (res.data.isSuccess) setLocalPosts(res.data.data.items);
        });
    }, []);

    useEffect(() => {
        if (!localPosts.length) return;
        const targets = localPosts.flatMap(post =>
            (post.distributions ?? [])
                .filter(d => d.platform === "Facebook" && d.status === "Sent")
                .map(d => ({ postId: post.id, distributionId: d.id }))
        );
        if (targets.length) dispatch(fetchAllDistributionMetrics(targets));
    }, [localPosts]);

    const handleRefresh = useCallback(() => {
        postService.getOrganizerPosts({
            pageNumber: 1,
            pageSize: 20,
            sortColumn: "PublishedAt",
            sortOrder: "desc",
            status: "Published",
            hasExternalPostUrl: true,
            eventId: eventId
        }).then(res => {
            if (res.data.isSuccess) setLocalPosts(res.data.data.items);
        });
    }, [eventId]);

    const isLoading = loading.fetchList || loading.fetchAllDistributionMetrics;

    const chartData = useMemo(() => {
        const postsWithFb = localPosts
            .map(post => ({ post, metrics: parseFbMetrics(post, distributionMetricsMap) }))
            .filter((x): x is { post: PostListItem; metrics: ParsedFbMetrics } => x.metrics !== null);

        if (!postsWithFb.length) return null;

        return CHART_CONFIGS.map(config => ({
            config,
            data: postsWithFb.map(({ post, metrics }) => ({
                title: post.title,
                shortTitle: truncateTitle(post.title),
                primary: config.getMetric(metrics),
                ...(config.getSecondary ? { secondary: config.getSecondary(metrics) } : {}),
                hasRealData: metrics.reach > 0,
            })),
        }));
    }, [localPosts, distributionMetricsMap]);

    const hasData = chartData && chartData.length > 0 && chartData[0].data.length > 0;

    return (
        <section className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center mb-1">
                        <span className="w-1.5 h-6 bg-blue-400 rounded-full mr-3" />
                        Hiệu suất Marketing — Facebook
                    </h2>
                    <p className="text-xs text-slate-500 ml-6">
                        So sánh các bài Published có phân phối Facebook. Metric tính từ dữ liệu distribution thực tế.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-xl border border-blue-500/20">
                        <MdFacebook />
                        Dữ liệu bài đăng Facebook
                    </span>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all disabled:opacity-50"
                    >
                        <MdOutlineRefresh className={isLoading ? "animate-spin" : ""} />
                        Làm mới
                    </button>
                </div>
            </div>

            {!isLoading && hasData && (
                <>
                    <SummaryCards metricsMap={distributionMetricsMap} />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {chartData!.map(({ config, data }) => (
                            <SingleChart key={config.id} config={config} data={data} />
                        ))}
                    </div>
                </>
            )}

            {isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="glass border border-slate-800/50 rounded-[28px] h-[320px] animate-pulse" />
                    ))}
                </div>
            )}

            {!isLoading && !hasData && <EmptyStateFacebook />}

            {/* Legend */}
            {hasData && (
                <div className="flex items-center gap-6 text-xs text-slate-600 pl-2">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />Reach tốt nhất
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-blue-500/40 inline-block" />Các bài còn lại
                    </span>
                    <span className="ml-auto text-slate-700">
                        Hiển thị {chartData![0].data.length} bài gần nhất
                    </span>
                </div>
            )}
        </section>
    );
}