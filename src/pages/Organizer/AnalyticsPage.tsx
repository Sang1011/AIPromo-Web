"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
    MdFacebook, MdOutlineVisibility, MdOutlineTouchApp,
    MdOutlinePeopleAlt, MdOutlineBarChart, MdOutlineRefresh,
    MdOutlineThumbUp, MdOutlineChatBubbleOutline, MdOutlineShare,
} from "react-icons/md";
import type { AppDispatch, RootState } from "../../store";
import { fetchAllDistributionMetrics, fetchOrganizerPosts } from "../../store/postSlice";
import type { DistributionMetricsFacebook, PostListItem } from "../../types/post/post";

function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

function pct(num: number, den: number, decimals = 2): string {
    if (!den) return "0%";
    return `${((num / den) * 100).toFixed(decimals)}%`;
}

function fmtDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
}

function truncate(s: string, max = 18): string {
    return s.length > max ? s.slice(0, max) + "…" : s;
}

interface PostWithMetrics {
    post: PostListItem;
    metrics: DistributionMetricsFacebook;
    distributionId: string;
}

const FETCH_PARAMS = {
    pageNumber: 1,
    pageSize: 20,
    sortColumn: "PublishedAt",
    sortOrder: "asc" as const,
    status: "Published" as const,
    hasExternalPostUrl: true,
};

function useAnalyticsData() {
    const dispatch = useDispatch<AppDispatch>();
    const { posts, loading, distributionMetricsMap } = useSelector((s: RootState) => s.POST);

    const refresh = useCallback(() => {
        dispatch(fetchOrganizerPosts(FETCH_PARAMS));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchOrganizerPosts(FETCH_PARAMS));
    }, [dispatch]);

    useEffect(() => {
        if (!posts.length) return;
        const targets = posts.flatMap(post =>
            (post.distributions ?? [])
                .filter(d => d.platform === "Facebook" && d.status === "Sent")
                .map(d => ({ postId: post.id, distributionId: d.id }))
        );
        if (targets.length) dispatch(fetchAllDistributionMetrics(targets));
    }, [posts, dispatch]);

    const postsWithMetrics = useMemo((): PostWithMetrics[] => {
        return posts
            .map(post => {
                const fbDist = (post.distributions ?? [])
                    .filter(d => d.platform === "Facebook" && d.status === "Sent")
                    .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime())[0];
                if (!fbDist) return null;
                const metrics = distributionMetricsMap[fbDist.id];
                if (!metrics) return null;
                return { post, metrics, distributionId: fbDist.id };
            })
            .filter((x): x is PostWithMetrics => x !== null)
            .sort((a, b) =>
                new Date(a.post.publishedAt ?? 0).getTime() - new Date(b.post.publishedAt ?? 0).getTime()
            );
    }, [posts, distributionMetricsMap]);

    const isLoading = loading.fetchList || loading.fetchDistributionMetrics;

    return { postsWithMetrics, isLoading, refresh };
}

interface KpiCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    color: string;
    borderColor: string;
    bgColor: string;
}

function KpiCard({ icon, label, value, sub, color, borderColor, bgColor }: KpiCardProps) {
    return (
        <div className={`rounded-2xl border ${borderColor} ${bgColor} px-5 py-4 flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                <div className={`${color} text-lg opacity-70`}>{icon}</div>
            </div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-600">{sub}</p>
        </div>
    );
}

function SummaryKpis({ data }: { data: PostWithMetrics[] }) {
    if (!data.length) return null;

    const totalReach = data.reduce((s, d) => s + d.metrics.reach, 0);
    const totalImpressions = data.reduce((s, d) => s + d.metrics.impressions, 0);
    const totalClicks = data.reduce((s, d) => s + d.metrics.clicks, 0);
    const totalLikes = data.reduce((s, d) => s + d.metrics.likes, 0);
    const totalComments = data.reduce((s, d) => s + d.metrics.comments, 0);
    const totalShares = data.reduce((s, d) => s + d.metrics.shares, 0);
    const totalEngagements = totalLikes + totalComments + totalShares;
    const avgEngRate = totalReach > 0 ? ((totalEngagements / totalReach) * 100).toFixed(2) : "0";
    const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0";

    const cards: KpiCardProps[] = [
        {
            icon: <MdOutlinePeopleAlt />,
            label: "Tổng Reach",
            value: fmt(totalReach),
            sub: `${fmt(totalImpressions)} impressions`,
            color: "text-blue-400",
            borderColor: "border-blue-500/20",
            bgColor: "bg-blue-500/5",
        },
        {
            icon: <MdOutlineTouchApp />,
            label: "Tổng Clicks",
            value: fmt(totalClicks),
            sub: `CTR tổng hợp ${avgCtr}%`,
            color: "text-emerald-400",
            borderColor: "border-emerald-500/20",
            bgColor: "bg-emerald-500/5",
        },
        {
            icon: <MdOutlineBarChart />,
            label: "Tổng Tương tác",
            value: fmt(totalEngagements),
            sub: `Eng. Rate tổng hợp ${avgEngRate}%`,
            color: "text-violet-400",
            borderColor: "border-violet-500/20",
            bgColor: "bg-violet-500/5",
        },
        {
            icon: <MdOutlineVisibility />,
            label: "Số bài phân tích",
            value: `${data.length}`,
            sub: "bài có Facebook distribution",
            color: "text-amber-400",
            borderColor: "border-amber-500/20",
            bgColor: "bg-amber-500/5",
        },
        {
            icon: <MdOutlineThumbUp />,
            label: "Tổng Lượt thích",
            value: fmt(totalLikes),
            sub: `${pct(totalLikes, totalEngagements)} tổng tương tác`,
            color: "text-sky-400",
            borderColor: "border-sky-500/20",
            bgColor: "bg-sky-500/5",
        },
        {
            icon: <MdOutlineChatBubbleOutline />,
            label: "Tổng Bình luận",
            value: fmt(totalComments),
            sub: `${pct(totalComments, totalEngagements)} tổng tương tác`,
            color: "text-pink-400",
            borderColor: "border-pink-500/20",
            bgColor: "bg-pink-500/5",
        },
        {
            icon: <MdOutlineShare />,
            label: "Tổng Chia sẻ",
            value: fmt(totalShares),
            sub: `${pct(totalShares, totalEngagements)} tổng tương tác`,
            color: "text-orange-400",
            borderColor: "border-orange-500/20",
            bgColor: "bg-orange-500/5",
        }
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {cards.slice(0, 4).map(c => <KpiCard key={c.label} {...c} />)}
            </div>
            <div className="grid grid-cols-3 gap-4">
                {cards.slice(4).map(c => <KpiCard key={c.label} {...c} />)}
            </div>
        </div>
    );
}

function ReachTrendChart({ data }: { data: PostWithMetrics[] }) {
    const chartData = data.map((d, idx) => ({
        idx: idx + 1,
        date: d.post.publishedAt ? fmtDate(d.post.publishedAt) : `#${idx + 1}`,
        label: d.post.publishedAt ? `${fmtDate(d.post.publishedAt)} #${idx + 1}` : `#${idx + 1}`,
        title: d.post.title,
        reach: d.metrics.reach,
        impressions: d.metrics.impressions,
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[160px]">
                <p className="text-white font-bold text-sm truncate max-w-[200px]">{payload[0]?.payload?.title}</p>
                <p className="text-slate-500 text-[10px]">{payload[0]?.payload?.date}</p>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-blue-400">Reach</span>
                    <span className="text-white font-bold">{fmt(payload[0]?.value ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Impressions</span>
                    <span className="text-slate-300 font-semibold">{fmt(payload[1]?.value ?? 0)}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <div className="mb-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MdOutlinePeopleAlt className="text-blue-400" />
                    Reach & Impressions theo bài đăng
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Mỗi điểm = 1 bài đăng Facebook, sắp xếp theo publishedAt tăng dần</p>
            </div>
            <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="impressionsGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="idx" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `#${v}`} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="impressions" stroke="#8b5cf6" strokeWidth={2} fill="url(#impressionsGrad)" strokeDasharray="4 2" />
                        <Area type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={2.5} fill="url(#reachGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400 inline-block rounded" />Reach</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-400 inline-block rounded border-dashed border-t border-violet-400" />Impressions</span>
            </div>
        </div>
    );
}

function CtrPerPostChart({ data }: { data: PostWithMetrics[] }) {
    const chartData = data.map(d => ({
        shortTitle: truncate(d.post.title),
        title: d.post.title,
        ctr: d.metrics.impressions > 0
            ? +((d.metrics.clicks / d.metrics.impressions) * 100).toFixed(2)
            : 0,
        engRate: d.metrics.reach > 0
            ? +(((d.metrics.likes + d.metrics.comments + d.metrics.shares) / d.metrics.reach) * 100).toFixed(2)
            : 0,
    }));

    const maxCtr = Math.max(...chartData.map(d => d.ctr));
    const maxEng = Math.max(...chartData.map(d => d.engRate));

    const CtrTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[160px]">
                <p className="text-white font-bold text-sm truncate max-w-[200px]">{payload[0]?.payload?.title}</p>
                <div className="flex justify-between gap-4">
                    <span className="text-emerald-400">CTR</span>
                    <span className="text-white font-bold">{payload[0]?.value}%</span>
                </div>
            </div>
        );
    };

    const EngTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[160px]">
                <p className="text-white font-bold text-sm truncate max-w-[200px]">{payload[0]?.payload?.title}</p>
                <div className="flex justify-between gap-4">
                    <span className="text-violet-400">Engagement Rate</span>
                    <span className="text-white font-bold">{payload[0]?.value}%</span>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <MdOutlineTouchApp className="text-emerald-400" />
                        CTR theo bài đăng
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Clicks ÷ Impressions × 100</p>
                </div>
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="shortTitle" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                            <Tooltip content={<CtrTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                            <Bar dataKey="ctr" radius={[6, 6, 0, 0]} maxBarSize={44}>
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.ctr === maxCtr ? "#10b981" : "#10b98150"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <MdOutlineBarChart className="text-violet-400" />
                        Engagement Rate theo bài đăng
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">(Likes + Comments + Shares) ÷ Reach × 100</p>
                </div>
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="shortTitle" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                            <Tooltip content={<EngTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                            <Bar dataKey="engRate" radius={[6, 6, 0, 0]} maxBarSize={44}>
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.engRate === maxEng ? "#8b5cf6" : "#8b5cf650"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function EngagementBreakdown({ data }: { data: PostWithMetrics[] }) {
    const totalLikes = data.reduce((s, d) => s + d.metrics.likes, 0);
    const totalComments = data.reduce((s, d) => s + d.metrics.comments, 0);
    const totalShares = data.reduce((s, d) => s + d.metrics.shares, 0);
    const total = totalLikes + totalComments + totalShares;

    const breakdown = [
        { label: "Lượt thích", value: totalLikes, color: "#3b82f6", icon: <MdOutlineThumbUp /> },
        { label: "Bình luận", value: totalComments, color: "#8b5cf6", icon: <MdOutlineChatBubbleOutline /> },
        { label: "Chia sẻ", value: totalShares, color: "#ec4899", icon: <MdOutlineShare /> },
    ];

    const perPostData = data.map(d => ({
        shortTitle: truncate(d.post.title),
        title: d.post.title,
        likes: d.metrics.likes,
        comments: d.metrics.comments,
        shares: d.metrics.shares,
    }));

    const EngTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[160px]">
                <p className="text-white font-bold text-sm truncate max-w-[200px]">{payload[0]?.payload?.title}</p>
                {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex justify-between gap-4">
                        <span style={{ color: p.color }}>{p.name}</span>
                        <span className="text-white font-bold">{fmt(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <h3 className="text-base font-bold text-white mb-5">Phân tích Engagement</h3>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {breakdown.map(b => (
                        <div key={b.label} className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${b.color}20`, color: b.color }}>
                                {b.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-slate-400">{b.label}</p>
                                    <p className="text-sm font-bold text-white">{fmt(b.value)}</p>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full"
                                        style={{
                                            width: `${total > 0 ? (b.value / total) * 100 : 0}%`,
                                            backgroundColor: b.color,
                                        }} />
                                </div>
                                <p className="text-[10px] text-slate-600 mt-0.5">{pct(b.value, total)} tổng tương tác</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Theo từng bài</p>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={perPostData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="shortTitle" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                <Tooltip content={<EngTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="likes" name="Thích" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="comments" name="Bình luận" stackId="a" fill="#8b5cf6" maxBarSize={40} />
                                <Bar dataKey="shares" name="Chia sẻ" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TopPostsTable({ data }: { data: PostWithMetrics[] }) {
    const sorted = [...data].sort((a, b) => b.metrics.reach - a.metrics.reach);
    const top5 = sorted.slice(0, 5);

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Top bài đăng theo Reach</h3>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full font-semibold">
                    Top {top5.length} / {data.length} bài
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Bài viết</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Reach</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Impressions</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Clicks</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">CTR</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Eng. Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {top5.map(({ post, metrics }) => {
                            const ctr = pct(metrics.clicks, metrics.impressions);
                            const engRate = pct(metrics.likes + metrics.comments + metrics.shares, metrics.reach);
                            return (
                                <tr key={post.id} className="hover:bg-white/2 transition-colors">
                                    <td className="py-3 pr-4">
                                        <p className="text-white font-medium truncate max-w-[200px]">{post.title}</p>
                                        <p className="text-xs text-slate-600 mt-0.5">
                                            {post.publishedAt ? fmtDate(post.publishedAt) : "—"}
                                        </p>
                                    </td>
                                    <td className="text-right text-blue-400 font-bold py-3">{fmt(metrics.reach)}</td>
                                    <td className="text-right text-slate-400 py-3">{fmt(metrics.impressions)}</td>
                                    <td className="text-right text-emerald-400 py-3">{fmt(metrics.clicks)}</td>
                                    <td className="text-right text-emerald-300 font-semibold py-3">{ctr}</td>
                                    <td className="text-right text-violet-400 font-semibold py-3">{engRate}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-slate-800/50" />
                ))}
            </div>
            <div className="h-[320px] rounded-2xl bg-slate-800/50" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-[300px] rounded-2xl bg-slate-800/50" />
                <div className="h-[300px] rounded-2xl bg-slate-800/50" />
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border border-slate-800 p-16 flex flex-col items-center justify-center text-center gap-4">
            <MdFacebook className="text-blue-400/30 text-5xl" />
            <div>
                <p className="text-slate-400 font-semibold">Chưa có dữ liệu Facebook</p>
                <p className="text-slate-600 text-xs mt-1 max-w-xs">
                    Phân tích dữ liệu sẽ hiển thị khi các bài viết được đăng lên Facebook và có dữ liệu metrics.
                </p>
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const { postsWithMetrics, isLoading, refresh } = useAnalyticsData();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-400 rounded-full" />
                        Phân tích dữ liệu
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 ml-4">
                        Dữ liệu thực từ Facebook distribution · {postsWithMetrics.length} bài đã phân tích
                    </p>
                </div>
                <button
                    onClick={refresh}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all disabled:opacity-50"
                >
                    <MdOutlineRefresh className={isLoading ? "animate-spin" : ""} />
                    Làm mới
                </button>
            </div>

            {isLoading && <Skeleton />}

            {!isLoading && postsWithMetrics.length === 0 && <EmptyState />}

            {!isLoading && postsWithMetrics.length > 0 && (
                <>
                    <SummaryKpis data={postsWithMetrics} />
                    <ReachTrendChart data={postsWithMetrics} />
                    <CtrPerPostChart data={postsWithMetrics} />
                    <EngagementBreakdown data={postsWithMetrics} />
                    <TopPostsTable data={postsWithMetrics} />
                </>
            )}
        </div>
    );
}