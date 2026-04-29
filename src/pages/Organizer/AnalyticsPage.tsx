import { useState } from "react";
import {
    MdFacebook,
    MdOutlineBarChart,
    MdOutlineConfirmationNumber,
    MdOutlinePeopleAlt,
    MdOutlineRefresh,
    MdOutlineTouchApp,
} from "react-icons/md";
import { RiInstagramLine } from "react-icons/ri";
import { useParams } from "react-router-dom";
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
import { useAnalyticsData } from "../../hooks/useAnalyticsData";
import type {
    DistributionMetricsFacebook,
    DistributionMetricsInstagram,
    DistributionMetricsThreads,
    GetPostsParams,
    PostListItem,
} from "../../types/post/post";
import {
    calcFacebookCTR,
    calcFacebookCVR,
    calcFacebookER,
    calcInstagramCTR,
    calcInstagramCVR,
    calcInstagramER,
    calcThreadsCTR,
    calcThreadsCVR,
    calcThreadsER,
    fmtPct
} from "../../utils/metricsFormulas";

// ─── Threads Icon ─────────────────────────────────────────────────────────────

const ThreadsIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg viewBox="0 0 192 192" className={`fill-current ${className}`} xmlns="http://www.w3.org/2000/svg">
        <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.372-39.134 15.265-38.105 34.569.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z" />
    </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PostWithMetrics {
    post: PostListItem;
    metrics: DistributionMetricsFacebook;
    distributionId: string;
}

export interface PostWithIGMetrics {
    post: PostListItem;
    metrics: DistributionMetricsInstagram;
    distributionId: string;
}

export interface PostWithThreadsMetrics {
    post: PostListItem;
    metrics: DistributionMetricsThreads;
    distributionId: string;
}

// ─── Page size options ────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [
    { label: "10 bài gần nhất", value: 10 },
    { label: "20 bài gần nhất", value: 20 },
    { label: "50 bài gần nhất", value: 50 },
    { label: "Tất cả (100)", value: 100 },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
    if (n == null) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

function fmtDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
}

function truncate(s: string, max = 16): string {
    return s.length > max ? s.slice(0, max) + "…" : s;
}

const SCROLL_THRESHOLD = 10;

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({ accent, title, sub }: { accent: string; title: string; sub?: string }) {
    return (
        <div className="flex items-center gap-2.5 mb-4">
            <span className={`w-1 h-6 rounded-full ${accent}`} />
            <h3 className="text-base font-bold text-white">{title}</h3>
            {sub && <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{sub}</span>}
        </div>
    );
}

// ─── PlatformBadge ────────────────────────────────────────────────────────────

function PlatformBadge({ platform, count }: { platform: "Facebook" | "Instagram" | "Threads"; count: number }) {
    const cfg = {
        Facebook: { icon: <MdFacebook />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
        Instagram: { icon: <RiInstagramLine />, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
        Threads: { icon: <ThreadsIcon className="w-3.5 h-3.5" />, color: "text-slate-300", bg: "bg-slate-600/10 border-slate-600/20" },
    }[platform];
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-semibold ${cfg.color} ${cfg.bg}`}>
            {cfg.icon}
            <span>{count} bài</span>
        </div>
    );
}

// ─── OverviewKpiRow ───────────────────────────────────────────────────────────
// Top-level summary: Reach, Engagement, Ticket Contribution, Click Tracking

function OverviewKpiRow({ fb, ig, th }: {
    fb: PostWithMetrics[];
    ig: PostWithIGMetrics[];
    th: PostWithThreadsMetrics[];
}) {
    const fbReach = fb.reduce((s, d) => s + d.metrics.reach, 0);
    const igReach = ig.reduce((s, d) => s + d.metrics.reach, 0);
    const thViews = th.reduce((s, d) => s + (d.metrics.views ?? 0), 0);

    const fbEng = fb.reduce((s, d) => s + d.metrics.likes + d.metrics.comments, 0);
    const igEng = ig.reduce((s, d) => s + d.metrics.likes + d.metrics.comments + d.metrics.saves + d.metrics.shares, 0);
    const thEng = th.reduce((s, d) => s + (d.metrics.likes ?? 0) + (d.metrics.replies ?? 0) + (d.metrics.reposts ?? 0) + (d.metrics.quotes ?? 0), 0);

    // ticketsSold là số vé của sự kiện, lấy từ nguồn nào cũng được vì là dữ liệu chung
    const ticketsSold = fb[0]?.metrics.ticketsSold ?? ig[0]?.metrics.ticketsSold ?? th[0]?.metrics.ticketsSold ?? 0;

    const fbBuy = fb.reduce((s, d) => s + d.metrics.buyCount, 0);
    const igBuy = ig.reduce((s, d) => s + d.metrics.buyCount, 0);
    const thBuy = th.reduce((s, d) => s + (d.metrics.buyCount ?? 0), 0);
    const totalBuy = fbBuy + igBuy + thBuy;

    const fbClickCount = fb.reduce((s, d) => s + d.metrics.clickCount, 0);
    const igClickCount = ig.reduce((s, d) => s + d.metrics.clickCount, 0);
    const thClickCount = th.reduce((s, d) => s + (d.metrics.clickCount ?? 0), 0);
    const totalClickCount = fbClickCount + igClickCount + thClickCount;

    const totalReach = fbReach + igReach + thViews;
    const totalEng = fbEng + igEng + thEng;
    const overallER = totalReach > 0 ? totalEng / totalReach : null;

    const pieData = [
        fbBuy > 0 && { name: "Facebook", value: fbBuy, color: "#3b82f6" },
        igBuy > 0 && { name: "Instagram", value: igBuy, color: "#e1306c" },
        thBuy > 0 && { name: "Threads", value: thBuy, color: "#94a3b8" },
    ].filter(Boolean) as { name: string; value: number; color: string }[];
    const unclaimed = ticketsSold > totalBuy ? ticketsSold - totalBuy : 0;
    if (unclaimed > 0) pieData.push({ name: "AIPromo", value: unclaimed, color: "#7c3bed" });

    const PieTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0].payload;
        const pctVal = ticketsSold > 0 ? ((d.value / ticketsSold) * 100).toFixed(1) : "—";
        return (
            <div className="bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-sm shadow-xl">
                <p className="text-white font-bold">{d.name}</p>
                <p className="text-slate-300">{d.value.toLocaleString()} vé · {pctVal}%</p>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Reach */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900/60 border border-blue-500/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tổng Reach / Views</span>
                    <MdOutlinePeopleAlt className="text-blue-400 text-lg opacity-60" />
                </div>
                <p className="text-4xl font-black text-blue-300 tabular-nums">{fmt(totalReach)}</p>
                <div className="space-y-1.5">
                    {fb.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-slate-500"><MdFacebook className="text-blue-400" />Facebook</span>
                            <span className="text-blue-400 font-semibold tabular-nums">{fmt(fbReach)}</span>
                        </div>
                    )}
                    {ig.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-slate-500"><RiInstagramLine className="text-pink-400" />Instagram</span>
                            <span className="text-pink-400 font-semibold tabular-nums">{fmt(igReach)}</span>
                        </div>
                    )}
                    {th.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-slate-500"><ThreadsIcon className="w-3 h-3" />Threads</span>
                            <span className="text-slate-300 font-semibold tabular-nums">{fmt(thViews)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Engagement */}
            <div className="rounded-2xl bg-gradient-to-br from-violet-950/40 to-slate-900/60 border border-violet-500/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tổng Tương tác</span>
                    <MdOutlineBarChart className="text-violet-400 text-lg opacity-60" />
                </div>
                <div className="flex items-end gap-3">
                    <p className="text-4xl font-black text-violet-300 tabular-nums">{fmt(totalEng)}</p>
                    {overallER != null && (
                        <span className="text-sm text-violet-500 font-semibold mb-1">ER {fmtPct(overallER)}</span>
                    )}
                </div>
                <div className="space-y-1.5">
                    {fb.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-slate-500"><MdFacebook className="text-blue-400" />Facebook <span className="text-slate-700">(likes+comments)</span></span>
                            <span className="text-violet-400 font-semibold tabular-nums">{fmt(fbEng)}</span>
                        </div>
                    )}
                    {ig.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-slate-500"><RiInstagramLine className="text-pink-400" />Instagram <span className="text-slate-700">(+saves+shares)</span></span>
                            <span className="text-violet-400 font-semibold tabular-nums">{fmt(igEng)}</span>
                        </div>
                    )}
                    {th.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-slate-500"><ThreadsIcon className="w-3 h-3" />Threads <span className="text-slate-700">(+replies+reposts+quotes)</span></span>
                            <span className="text-violet-400 font-semibold tabular-nums">{fmt(thEng)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket conversion donut */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-900/60 border border-amber-500/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Đóng góp vé bán</span>
                    <MdOutlineConfirmationNumber className="text-amber-400 text-lg opacity-60" />
                </div>
                <div className="flex items-center gap-4">
                    {pieData.length > 0 ? (
                        <div className="w-[90px] h-[90px] shrink-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={28}
                                        outerRadius={42}
                                        paddingAngle={pieData.length > 1 ? 2 : 0}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {pieData.map((e, i) => (
                                            <Cell key={i} fill={e.color} />
                                        ))}
                                    </Pie>
                                    {/* Tăng z-index để tooltip không bị chữ "Tổng" đè */}
                                    <Tooltip
                                        content={<PieTooltip />}
                                        wrapperStyle={{ zIndex: 9999 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[9px] text-slate-600 font-black uppercase">Tổng</p>
                                <p className="text-sm font-black text-white tabular-nums">
                                    {fmt(ticketsSold)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-[90px] h-[90px] shrink-0 flex items-center justify-center">
                            <MdOutlineConfirmationNumber className="text-5xl text-slate-800" />
                        </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                        {fb.length > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1 text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                    FB
                                </span>
                                <span className="text-amber-400 font-bold tabular-nums">
                                    {fmt(fbBuy)}
                                </span>
                            </div>
                        )}
                        {ig.length > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1 text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                                    IG
                                </span>
                                <span className="text-amber-400 font-bold tabular-nums">
                                    {fmt(igBuy)}
                                </span>
                            </div>
                        )}
                        {th.length > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1 text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                                    TH
                                </span>
                                <span className="text-amber-400 font-bold tabular-nums">
                                    {fmt(thBuy)}
                                </span>
                            </div>
                        )}

                        {/* Kênh khác (AIPromo / bán trực tiếp) */}
                        {unclaimed > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1 text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                    AIPromo
                                </span>
                                <span className="text-amber-400 font-bold tabular-nums">
                                    {fmt(unclaimed)}
                                </span>
                            </div>
                        )}

                        <div className="pt-1 border-t border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 font-black uppercase tracking-wider">
                                    Tổng sự kiện
                                </span>
                                <span className="text-amber-300 font-black text-sm tabular-nums">
                                    {fmt(ticketsSold)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Click Tracking */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/60 border border-emerald-500/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Click Tracking</span>
                    <MdOutlineTouchApp className="text-emerald-400 text-lg opacity-60" />
                </div>
                <p className="text-4xl font-black text-emerald-300 tabular-nums">{fmt(totalClickCount)}</p>
                <div className="space-y-1.5">
                    {fb.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-slate-500"><MdFacebook className="text-blue-400" />FB</span>
                            <span className="text-emerald-400 font-semibold tabular-nums">{fmt(fbClickCount)}</span>
                        </div>
                    )}
                    {ig.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-slate-500"><RiInstagramLine className="text-pink-400" />IG</span>
                            <span className="text-emerald-400 font-semibold tabular-nums">{fmt(igClickCount)}</span>
                        </div>
                    )}
                    {th.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-slate-500"><ThreadsIcon className="w-3 h-3" />TH</span>
                            <span className="text-emerald-400 font-semibold tabular-nums">{fmt(thClickCount)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── PlatformRatesPanel ───────────────────────────────────────────────────────
// Per-platform stat cards + rate bars (đã bổ sung Shares)

function RateBar({ label, value, gradient, formula }: {
    label: string; value: number | null; gradient: string; formula: string;
}) {
    const pctWidth = value != null ? Math.min(value * 100, 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-semibold">{label}</span>
                <span className="text-white font-black tabular-nums">{fmtPct(value)}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pctWidth}%`, background: gradient }} />
            </div>
            <p className="text-xs text-slate-700 font-mono">{formula}</p>
        </div>
    );
}

function PlatformRatesPanel({ fb, ig, th }: {
    fb: PostWithMetrics[];
    ig: PostWithIGMetrics[];
    th: PostWithThreadsMetrics[];
}) {
    const fbReach = fb.reduce((s, d) => s + d.metrics.reach, 0);
    const fbLikes = fb.reduce((s, d) => s + d.metrics.likes, 0);
    const fbComments = fb.reduce((s, d) => s + d.metrics.comments, 0);
    const fbClicks = fb.reduce((s, d) => s + d.metrics.clicks, 0);
    const fbBuyCount = fb.reduce((s, d) => s + d.metrics.buyCount, 0);
    const fbClickCount = fb.reduce((s, d) => s + d.metrics.clickCount, 0);
    const fbShares = fb.reduce((s, d) => s + d.metrics.shares, 0);

    const igReach = ig.reduce((s, d) => s + d.metrics.reach, 0);
    const igLikes = ig.reduce((s, d) => s + d.metrics.likes, 0);
    const igComments = ig.reduce((s, d) => s + d.metrics.comments, 0);
    const igSaves = ig.reduce((s, d) => s + d.metrics.saves, 0);
    const igShares = ig.reduce((s, d) => s + d.metrics.shares, 0);
    const igBuyCount = ig.reduce((s, d) => s + d.metrics.buyCount, 0);
    const igClickCount = ig.reduce((s, d) => s + d.metrics.clickCount, 0);

    const thViews = th.reduce((s, d) => s + (d.metrics.views ?? 0), 0);
    const thLikes = th.reduce((s, d) => s + (d.metrics.likes ?? 0), 0);
    const thReplies = th.reduce((s, d) => s + (d.metrics.replies ?? 0), 0);
    const thReposts = th.reduce((s, d) => s + (d.metrics.reposts ?? 0), 0);
    const thQuotes = th.reduce((s, d) => s + (d.metrics.quotes ?? 0), 0);
    const thShares = th.reduce((s, d) => s + (d.metrics.shares ?? 0), 0);
    const thBuyCount = th.reduce((s, d) => s + (d.metrics.buyCount ?? 0), 0);
    const thClickCount = th.reduce((s, d) => s + (d.metrics.clickCount ?? 0), 0);

    const fbER = calcFacebookER(fbLikes, fbComments, fbReach);
    const fbCTR = calcFacebookCTR(fbClicks, fbReach);
    const fbCVR = calcFacebookCVR(fbBuyCount, fbClickCount);

    const igER = calcInstagramER(igLikes, igComments, igSaves, igShares, igReach);
    const igCTR = calcInstagramCTR(igClickCount, igReach);
    const igCVR = calcInstagramCVR(igBuyCount, igClickCount);

    const thER = calcThreadsER(thLikes, thReplies, thReposts, thQuotes, thViews);
    const thCTR = calcThreadsCTR(thClickCount, thViews);
    const thCVR = calcThreadsCVR(thBuyCount, thClickCount);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {fb.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-b from-[#0d1729] to-[#0b0f1a] border border-blue-500/10 p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <MdFacebook className="text-blue-400 text-lg" />
                        <span className="text-sm font-black text-blue-400/80 uppercase tracking-widest">Facebook · {fb.length} bài</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Reach</p><p className="text-xl font-black text-blue-300 tabular-nums">{fmt(fbReach)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Clicks</p><p className="text-xl font-black text-emerald-400 tabular-nums">{fmt(fbClicks)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Likes</p><p className="text-xl font-black text-blue-400 tabular-nums">{fmt(fbLikes)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Comments</p><p className="text-xl font-black text-violet-400 tabular-nums">{fmt(fbComments)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Shares</p><p className="text-xl font-black text-cyan-400 tabular-nums">{fmt(fbShares)}</p></div>
                    </div>
                    <div className="space-y-3">
                        <RateBar label="Engagement Rate" value={fbER} gradient="linear-gradient(90deg,#3b82f6,#8b5cf6)" formula="(likes+comments)/reach" />
                        <RateBar label="Click-Through Rate" value={fbCTR} gradient="linear-gradient(90deg,#10b981,#06b6d4)" formula="clicks/reach" />
                        <RateBar label="Conversion Rate" value={fbCVR} gradient="linear-gradient(90deg,#f59e0b,#ef4444)" formula="buyCount/clickCount" />
                    </div>
                </div>
            )}

            {ig.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-b from-[#1a0d1a] to-[#0f0b14] border border-pink-500/10 p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <RiInstagramLine className="text-pink-400 text-lg" />
                        <span className="text-sm font-black text-pink-400/80 uppercase tracking-widest">Instagram · {ig.length} bài</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Reach</p><p className="text-xl font-black text-pink-300 tabular-nums">{fmt(igReach)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Saves</p><p className="text-xl font-black text-amber-400 tabular-nums">{fmt(igSaves)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Likes</p><p className="text-xl font-black text-pink-400 tabular-nums">{fmt(igLikes)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Comments</p><p className="text-xl font-black text-violet-400 tabular-nums">{fmt(igComments)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Shares</p><p className="text-xl font-black text-emerald-400 tabular-nums">{fmt(igShares)}</p></div>
                    </div>
                    <div className="space-y-3">
                        <RateBar label="Engagement Rate" value={igER} gradient="linear-gradient(90deg,#e1306c,#833ab4)" formula="(likes+comments+saves+shares)/reach" />
                        <RateBar label="Click-Through Rate" value={igCTR} gradient="linear-gradient(90deg,#10b981,#06b6d4)" formula="clickCount/reach" />
                        <RateBar label="Conversion Rate" value={igCVR} gradient="linear-gradient(90deg,#f59e0b,#ef4444)" formula="buyCount/clickCount" />
                    </div>
                </div>
            )}

            {th.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-b from-[#111418] to-[#0b0c10] border border-slate-600/10 p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <span className="text-slate-300"><ThreadsIcon /></span>
                        <span className="text-sm font-black text-slate-400/80 uppercase tracking-widest">Threads · {th.length} bài</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Views</p><p className="text-xl font-black text-slate-200 tabular-nums">{fmt(thViews)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Reposts</p><p className="text-xl font-black text-emerald-400 tabular-nums">{fmt(thReposts)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Replies</p><p className="text-xl font-black text-sky-400 tabular-nums">{fmt(thReplies)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Quotes</p><p className="text-xl font-black text-violet-400 tabular-nums">{fmt(thQuotes)}</p></div>
                        <div><p className="text-xs text-slate-600 font-black uppercase tracking-widest">Shares</p><p className="text-xl font-black text-amber-400 tabular-nums">{fmt(thShares)}</p></div>
                    </div>
                    <div className="space-y-3">
                        <RateBar label="Engagement Rate" value={thER} gradient="linear-gradient(90deg,#94a3b8,#e2e8f0)" formula="(likes+replies+reposts+quotes)/views" />
                        <RateBar label="Click-Through Rate" value={thCTR} gradient="linear-gradient(90deg,#10b981,#6366f1)" formula="clickCounts/views" />
                        <RateBar label="Conversion Rate" value={thCVR} gradient="linear-gradient(90deg,#f59e0b,#ef4444)" formula="buyCount/clickCount" />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── ReachTrendChart ──────────────────────────────────────────────────────────

function ReachTrendChart({ fb, ig, th }: {
    fb: PostWithMetrics[];
    ig: PostWithIGMetrics[];
    th: PostWithThreadsMetrics[];
}) {
    const fbMap = new Map(fb.map(d => [d.post.id, d]));
    const igMap = new Map(ig.map(d => [d.post.id, d]));
    const thMap = new Map(th.map(d => [d.post.id, d]));

    const allPostIds = Array.from(new Set([
        ...fb.map(d => d.post.id),
        ...ig.map(d => d.post.id),
        ...th.map(d => d.post.id),
    ]));

    const allPosts = allPostIds
        .map(id => fbMap.get(id)?.post ?? igMap.get(id)?.post ?? thMap.get(id)?.post!)
        .sort((a, b) => new Date(a.publishedAt ?? 0).getTime() - new Date(b.publishedAt ?? 0).getTime());

    const chartData = allPosts.map((post, idx) => ({
        idx: idx + 1,
        date: post.publishedAt ? fmtDate(post.publishedAt) : `#${idx + 1}`,
        title: post.title,
        facebook: fbMap.get(post.id)?.metrics.reach ?? null,
        instagram: igMap.get(post.id)?.metrics.reach ?? null,
        threads: thMap.get(post.id)?.metrics.views ?? null,
    }));

    const TrendTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0]?.payload;
        return (
            <div className="bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm shadow-xl space-y-1.5 min-w-[160px]">
                <p className="text-white font-bold truncate max-w-[200px]">{d?.title}</p>
                <p className="text-slate-500 text-[12px]">{d?.date}</p>
                {payload.map((p: any) => p.value != null && (
                    <div key={p.dataKey} className="flex justify-between gap-4">
                        <span style={{ color: p.color }}>
                            {p.dataKey === "facebook" ? "Facebook" : p.dataKey === "instagram" ? "Instagram" : "Threads"}
                        </span>
                        <span className="text-white font-bold">{fmt(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#0e1420] to-[#0b0c12] border border-white/5 p-6">
            <SectionHeader accent="bg-gradient-to-b from-blue-400 via-pink-400 to-slate-400" title="Reach / Views theo bài đăng" sub="tất cả nền tảng · theo thời gian" />
            <div className="flex items-center gap-5 text-sm text-slate-500 mb-4 flex-wrap">
                {fb.length > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400 inline-block rounded" />Facebook</span>}
                {ig.length > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-pink-400 inline-block rounded" />Instagram</span>}
                {th.length > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-400 inline-block rounded" />Threads</span>}
            </div>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="fbG" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="igG" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.25} /><stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="thG" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.2} /><stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="idx" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `#${v}`} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                        <Tooltip content={<TrendTooltip />} cursor={{ stroke: "rgba(255,255,255,0.07)", strokeWidth: 1 }} />
                        {fb.length > 0 && <Area type="monotone" dataKey="facebook" stroke="#3b82f6" strokeWidth={2} fill="url(#fbG)" connectNulls />}
                        {ig.length > 0 && <Area type="monotone" dataKey="instagram" stroke="#ec4899" strokeWidth={2} fill="url(#igG)" connectNulls />}
                        {th.length > 0 && <Area type="monotone" dataKey="threads" stroke="#94a3b8" strokeWidth={2} fill="url(#thG)" connectNulls />}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── EngagementBreakdownPanel ─────────────────────────────────────────────────

function EngagementBreakdownPanel({ fb, ig, th }: {
    fb: PostWithMetrics[];
    ig: PostWithIGMetrics[];
    th: PostWithThreadsMetrics[];
}) {
    const fbLikes = fb.reduce((s, d) => s + d.metrics.likes, 0);
    const fbComments = fb.reduce((s, d) => s + d.metrics.comments, 0);
    const fbShares = fb.reduce((s, d) => s + d.metrics.shares, 0);

    const igLikes = ig.reduce((s, d) => s + d.metrics.likes, 0);
    const igComments = ig.reduce((s, d) => s + d.metrics.comments, 0);
    const igSaves = ig.reduce((s, d) => s + d.metrics.saves, 0);
    const igShares = ig.reduce((s, d) => s + d.metrics.shares, 0);

    const thLikes = th.reduce((s, d) => s + (d.metrics.likes ?? 0), 0);
    const thReplies = th.reduce((s, d) => s + (d.metrics.replies ?? 0), 0);
    const thReposts = th.reduce((s, d) => s + (d.metrics.reposts ?? 0), 0);
    const thQuotes = th.reduce((s, d) => s + (d.metrics.quotes ?? 0), 0);
    const thShares = th.reduce((s, d) => s + (d.metrics.shares ?? 0), 0);

    const fbERTotal = fbLikes + fbComments;
    const igERTotal = igLikes + igComments + igSaves + igShares;
    const thERTotal = thLikes + thReplies + thReposts + thQuotes;

    type BreakdownItem = { label: string; value: number; color: string; inER: boolean };

    const fbBreakdown: BreakdownItem[] = [
        { label: "Likes", value: fbLikes, color: "#3b82f6", inER: true },
        { label: "Comments", value: fbComments, color: "#8b5cf6", inER: true },
        { label: "Shares*", value: fbShares, color: "#06b6d4", inER: false },
    ];
    const igBreakdown: BreakdownItem[] = [
        { label: "Likes", value: igLikes, color: "#e1306c", inER: true },
        { label: "Comments", value: igComments, color: "#8b5cf6", inER: true },
        { label: "Saves", value: igSaves, color: "#f59e0b", inER: true },
        { label: "Shares", value: igShares, color: "#10b981", inER: true },
    ];
    const thBreakdown: BreakdownItem[] = [
        { label: "Likes", value: thLikes, color: "#f43f5e", inER: true },
        { label: "Replies", value: thReplies, color: "#38bdf8", inER: true },
        { label: "Reposts", value: thReposts, color: "#34d399", inER: true },
        { label: "Quotes", value: thQuotes, color: "#a78bfa", inER: true },
        { label: "Shares*", value: thShares, color: "#94a3b8", inER: false },
    ];

    function BreakdownBars({ items, total }: { items: BreakdownItem[]; total: number }) {
        return (
            <div className="space-y-2">
                {items.map(b => (
                    <div key={b.label} className="flex items-center gap-2.5">
                        <span className={`text-sm w-20 shrink-0 ${b.inER ? "text-slate-400" : "text-slate-600"}`}>{b.label}</span>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${total > 0 ? (b.value / total) * 100 : 0}%`, backgroundColor: b.color }} />
                        </div>
                        <span className="text-sm font-bold tabular-nums w-12 text-right" style={{ color: b.inER ? b.color : "#475569" }}>{fmt(b.value)}</span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#0e1420] to-[#0b0c12] border border-white/5 p-6">
            <SectionHeader accent="bg-violet-500" title="Phân tích Engagement" sub="tổng hợp · theo nền tảng" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {fb.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MdFacebook className="text-blue-400" />
                            <span className="text-[10px] font-black text-blue-400/70 uppercase tracking-widest">Facebook</span>
                            <span className="text-xs text-slate-700 ml-auto font-mono">ER=likes+comments</span>
                        </div>
                        <BreakdownBars items={fbBreakdown} total={fbERTotal + fbShares} />
                        <p className="text-xs text-slate-700">* Shares không tính vào ER (độ chính xác thấp)</p>
                    </div>
                )}
                {ig.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <RiInstagramLine className="text-pink-400" />
                            <span className="text-[10px] font-black text-pink-400/70 uppercase tracking-widest">Instagram</span>
                            <span className="text-xs text-slate-700 ml-auto font-mono">ER=all4</span>
                        </div>
                        <BreakdownBars items={igBreakdown} total={igERTotal} />
                    </div>
                )}
                {th.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-300"><ThreadsIcon /></span>
                            <span className="text-[10px] font-black text-slate-400/70 uppercase tracking-widest">Threads</span>
                            <span className="text-xs text-slate-700 ml-auto font-mono">ER=likes+rep+repost+quote</span>
                        </div>
                        <BreakdownBars items={thBreakdown} total={thERTotal + thShares} />
                        <p className="text-xs text-slate-700">* Shares không tính vào ER</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── ConversionRateChart (đã sửa ScrollChart không cần data prop) ─────────────

function ConversionRateChart({ fb, ig, th }: {
    fb: PostWithMetrics[];
    ig: PostWithIGMetrics[];
    th: PostWithThreadsMetrics[];
}) {
    const isLarge = (arr: any[]) => arr.length > SCROLL_THRESHOLD;

    const fbData = fb.map((d, i) => ({
        name: truncate(d.post.title, 12),
        idx: `FB#${i + 1}`,
        cvr: (calcFacebookCVR(d.metrics.buyCount, d.metrics.clickCount) ?? 0) * 100,
        ctr: (calcFacebookCTR(d.metrics.clicks, d.metrics.reach) ?? 0) * 100,
        tickets: d.metrics.ticketsSold,
    }));

    const igData = ig.map((d, i) => ({
        name: truncate(d.post.title, 12),
        idx: `IG#${i + 1}`,
        cvr: (calcInstagramCVR(d.metrics.buyCount, d.metrics.clickCount) ?? 0) * 100,
        ctr: (calcInstagramCTR(d.metrics.clickCount, d.metrics.reach) ?? 0) * 100,
        tickets: d.metrics.ticketsSold,
    }));

    const thData = th.map((d, i) => ({
        name: truncate(d.post.title, 12),
        idx: `TH#${i + 1}`,
        cvr: (calcThreadsCVR(d.metrics.buyCount ?? 0, d.metrics.clickCount ?? 0) ?? 0) * 100,
        ctr: (calcThreadsCTR(d.metrics.clickCount ?? 0, d.metrics.views ?? 0) ?? 0) * 100,
        tickets: d.metrics.ticketsSold ?? 0,
    }));

    const CvrTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0]?.payload;
        return (
            <div className="bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm shadow-xl space-y-1.5 min-w-[160px]">
                <p className="text-white font-bold">{d?.name}</p>
                {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex justify-between gap-4">
                        <span style={{ color: p.fill }}>{p.name}</span>
                        <span className="text-white font-bold">{p.value?.toFixed(2)}%</span>
                    </div>
                ))}
            </div>
        );
    };

    function ScrollChart({ count, children }: { count: number; children: React.ReactNode }) {
        const scrollable = count > SCROLL_THRESHOLD;
        const dynWidth = scrollable ? Math.max(count * 50, 300) : undefined;
        return scrollable ? (
            <div className="overflow-x-auto pb-1">
                <div style={{ width: dynWidth, height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">{children as any}</ResponsiveContainer>
                </div>
            </div>
        ) : (
            <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">{children as any}</ResponsiveContainer>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#0e1420] to-[#0b0c12] border border-white/5 p-6">
            <SectionHeader accent="bg-gradient-to-b from-amber-400 to-orange-500" title="CVR · CTR theo nền tảng" sub="per bài đăng" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Facebook */}
                {fb.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MdFacebook className="text-blue-400" />
                            <p className="text-[10px] font-black text-blue-400/70 uppercase tracking-widest">Facebook · CVR & CTR</p>
                            {isLarge(fbData) && <span className="ml-auto text-xs text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full">scroll →</span>}
                        </div>
                        <ScrollChart count={fbData.length}>
                            <BarChart data={fbData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="idx" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} />
                                <Tooltip content={<CvrTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="cvr" name="CVR" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="ctr" name="CTR" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ScrollChart>
                        <div className="flex gap-3 text-sm text-slate-600">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" />CVR</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500" />CTR</span>
                        </div>
                    </div>
                )}

                {/* Instagram */}
                {ig.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <RiInstagramLine className="text-pink-400" />
                            <p className="text-[10px] font-black text-pink-400/70 uppercase tracking-widest">Instagram · CVR & CTR</p>
                            {isLarge(igData) && <span className="ml-auto text-xs text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full">scroll →</span>}
                        </div>
                        <ScrollChart count={igData.length}>
                            <BarChart data={igData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="idx" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} />
                                <Tooltip content={<CvrTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="cvr" name="CVR" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="ctr" name="CTR" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ScrollChart>
                        <div className="flex gap-3 text-sm text-slate-600">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" />CVR</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500" />CTR</span>
                        </div>
                    </div>
                )}

                {/* Threads */}
                {th.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-300"><ThreadsIcon /></span>
                            <p className="text-[10px] font-black text-slate-400/70 uppercase tracking-widest">Threads · CVR & CTR</p>
                            {isLarge(thData) && <span className="ml-auto text-xs text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full">scroll →</span>}
                        </div>
                        <ScrollChart count={thData.length}>
                            <BarChart data={thData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="idx" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} />
                                <Tooltip content={<CvrTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="cvr" name="CVR" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="ctr" name="CTR" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ScrollChart>
                        <div className="flex gap-3 text-sm text-slate-600">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" />CVR</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500" />CTR</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── TopPostsTable (đã thêm cột chi tiết tương tác) ───────────────────────────

function TopPostsTable({ fb, ig, th }: {
    fb: PostWithMetrics[];
    ig: PostWithIGMetrics[];
    th: PostWithThreadsMetrics[];
}) {
    type SortKey = "reach" | "engagement" | "er" | "tickets" | "cvr";
    const [sortKey, setSortKey] = useState<SortKey>("reach");

    type Row = {
        id: string; title: string; publishedAt: string | null;
        platform: "Facebook" | "Instagram" | "Threads";
        reach: number; engagement: number; erRaw: number | null; engRate: string;
        tickets: number; cvrRaw: number | null; cvr: string;
        ctr: string;
        likes: number; comments: number; shares: number;
        saves?: number; reposts?: number; quotes?: number;
    };

    const rows: Row[] = [
        ...fb.map(d => {
            const eng = d.metrics.likes + d.metrics.comments;
            const er = calcFacebookER(d.metrics.likes, d.metrics.comments, d.metrics.reach);
            const cvr = calcFacebookCVR(d.metrics.buyCount, d.metrics.clickCount);
            const ctr = calcFacebookCTR(d.metrics.clicks, d.metrics.reach);
            return {
                id: d.post.id + "_fb", title: d.post.title, publishedAt: d.post.publishedAt,
                platform: "Facebook" as const,
                reach: d.metrics.reach, engagement: eng, erRaw: er, engRate: fmtPct(er),
                tickets: d.metrics.buyCount, cvrRaw: cvr, cvr: fmtPct(cvr), ctr: fmtPct(ctr),
                likes: d.metrics.likes, comments: d.metrics.comments, shares: d.metrics.shares,
            };
        }),
        ...ig.map(d => {
            const eng = d.metrics.likes + d.metrics.comments + d.metrics.saves + d.metrics.shares;
            const er = calcInstagramER(d.metrics.likes, d.metrics.comments, d.metrics.saves, d.metrics.shares, d.metrics.reach);
            const cvr = calcInstagramCVR(d.metrics.buyCount, d.metrics.clickCount);
            const ctr = calcInstagramCTR(d.metrics.clickCount, d.metrics.reach);
            return {
                id: d.post.id + "_ig", title: d.post.title, publishedAt: d.post.publishedAt,
                platform: "Instagram" as const,
                reach: d.metrics.reach, engagement: eng, erRaw: er, engRate: fmtPct(er),
                tickets: d.metrics.buyCount, cvrRaw: cvr, cvr: fmtPct(cvr), ctr: fmtPct(ctr),
                likes: d.metrics.likes, comments: d.metrics.comments, shares: d.metrics.shares,
                saves: d.metrics.saves,
            };
        }),
        ...th.map(d => {
            const eng = (d.metrics.likes ?? 0) + (d.metrics.replies ?? 0) + (d.metrics.reposts ?? 0) + (d.metrics.quotes ?? 0);
            const er = calcThreadsER(d.metrics.likes ?? 0, d.metrics.replies ?? 0, d.metrics.reposts ?? 0, d.metrics.quotes ?? 0, d.metrics.views ?? 0);
            const cvr = calcThreadsCVR(d.metrics.buyCount ?? 0, d.metrics.clickCount ?? 0);
            const ctr = calcThreadsCTR(d.metrics.clickCount ?? 0, d.metrics.views ?? 0);
            return {
                id: d.post.id + "_th", title: d.post.title, publishedAt: d.post.publishedAt,
                platform: "Threads" as const,
                reach: d.metrics.views ?? 0, engagement: eng, erRaw: er, engRate: fmtPct(er),
                tickets: d.metrics.buyCount ?? 0, cvrRaw: cvr, cvr: fmtPct(cvr), ctr: fmtPct(ctr),
                likes: d.metrics.likes ?? 0, comments: d.metrics.replies ?? 0, shares: d.metrics.shares ?? 0,
                reposts: d.metrics.reposts ?? 0, quotes: d.metrics.quotes ?? 0,
            };
        }),
    ].sort((a, b) => {
        if (sortKey === "reach") return b.reach - a.reach;
        if (sortKey === "engagement") return b.engagement - a.engagement;
        if (sortKey === "er") return (b.erRaw ?? -1) - (a.erRaw ?? -1);
        if (sortKey === "tickets") return b.tickets - a.tickets;
        if (sortKey === "cvr") return (b.cvrRaw ?? -1) - (a.cvrRaw ?? -1);
        return 0;
    });

    const PlatformIcon = ({ p }: { p: Row["platform"] }) => {
        if (p === "Facebook") return <MdFacebook className="text-blue-400 text-base" />;
        if (p === "Instagram") return <RiInstagramLine className="text-pink-400 text-base" />;
        return <span className="text-slate-300"><ThreadsIcon className="w-4 h-4" /></span>;
    };

    const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
        <button
            onClick={() => setSortKey(k)}
            className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all
                ${sortKey === k ? "bg-slate-700 text-white" : "text-slate-600 hover:text-slate-400"}`}
        >
            {label}
        </button>
    );

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#0e1420] to-[#0b0c12] border border-white/5 p-6">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <SectionHeader accent="bg-amber-400" title="Bảng xếp hạng bài đăng" sub={`${rows.length} bài · tất cả nền tảng`} />
                <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-slate-600 mr-1">Sắp xếp:</span>
                    <SortBtn k="reach" label="Reach" />
                    <SortBtn k="engagement" label="Tương tác" />
                    <SortBtn k="er" label="ER" />
                    <SortBtn k="tickets" label="Vé" />
                    <SortBtn k="cvr" label="CVR" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5">
                            {["#", "Nền tảng", "Bài viết", "Reach/Views", "Tương tác", "ER", "CTR", "Vé bán", "CVR"].map(h => (
                                <th key={h} className="text-center text-xs font-black text-slate-600 uppercase tracking-widest pb-3 pr-4 last:pr-0 whitespace-nowrap">{h}</th>
                            ))}
                            <th className="hidden lg:table-cell text-center text-xs font-black text-slate-600 uppercase tracking-widest pb-3 pr-4">Likes</th>
                            <th className="hidden lg:table-cell text-center text-xs font-black text-slate-600 uppercase tracking-widest pb-3 pr-4">Comments</th>
                            <th className="hidden lg:table-cell text-center text-xs font-black text-slate-600 uppercase tracking-widest pb-3 pr-4">Shares</th>
                            <th className="hidden lg:table-cell text-center text-xs font-black text-slate-600 uppercase tracking-widest pb-3 pr-4">Saves/Reposts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {rows.map((r, i) => (
                            <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 pr-4 text-slate-700 text-sm font-bold tabular-nums">{i + 1}</td>
                                <td className="py-3 pr-4"><PlatformIcon p={r.platform} /></td>
                                <td className="py-3 pr-4">
                                    <p
                                        className="text-white font-medium truncate max-w-[160px]"
                                        title={r.title}
                                    >
                                        {r.title}
                                    </p>
                                    <p className="text-sm text-slate-600 mt-0.5">
                                        {r.publishedAt ? fmtDate(r.publishedAt) : "—"}
                                    </p>
                                </td>
                                <td className="text-center text-blue-400 font-bold py-3 pr-4 tabular-nums">{fmt(r.reach)}</td>
                                <td className="text-center text-violet-400 py-3 pr-4 tabular-nums">{fmt(r.engagement)}</td>
                                <td className="text-center text-emerald-400 font-semibold py-3 pr-4 tabular-nums">{r.engRate}</td>
                                <td className="text-center text-sky-400 font-semibold py-3 pr-4 tabular-nums">{r.ctr}</td>
                                <td className="text-center text-amber-400 py-3 pr-4 tabular-nums">
                                    {r.tickets > 0 ? fmt(r.tickets) : <span className="text-slate-700">—</span>}
                                </td>
                                <td className="text-center text-orange-400 py-3 tabular-nums">
                                    {r.cvr !== "—" ? r.cvr : <span className="text-slate-700">—</span>}
                                </td>
                                <td className="hidden lg:table-cell text-center text-blue-400 py-3 pr-4 tabular-nums">{fmt(r.likes)}</td>
                                <td className="hidden lg:table-cell text-center text-purple-400 py-3 pr-4 tabular-nums">{fmt(r.comments)}</td>
                                <td className="hidden lg:table-cell text-center text-cyan-400 py-3 pr-4 tabular-nums">{fmt(r.shares)}</td>
                                <td className="hidden lg:table-cell text-center text-amber-400 py-3 tabular-nums">
                                    {r.platform === "Instagram" ? fmt(r.saves) : r.platform === "Threads" ? fmt(r.reposts) : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── CrossPlatformBarChart ────────────────────────────────────────────────────

function CrossPlatformBarChart({ fb, ig, th }: {
    fb: PostWithMetrics[];
    ig: PostWithIGMetrics[];
    th: PostWithThreadsMetrics[];
}) {
    const fbReach = fb.reduce((s, d) => s + d.metrics.reach, 0);
    const fbLikes = fb.reduce((s, d) => s + d.metrics.likes, 0);
    const fbComments = fb.reduce((s, d) => s + d.metrics.comments, 0);
    const fbShares = fb.reduce((s, d) => s + d.metrics.shares, 0);
    const fbTickets = fb.reduce((s, d) => s + d.metrics.buyCount, 0);

    const igReach = ig.reduce((s, d) => s + d.metrics.reach, 0);
    const igLikes = ig.reduce((s, d) => s + d.metrics.likes, 0);
    const igComments = ig.reduce((s, d) => s + d.metrics.comments, 0);
    const igShares = ig.reduce((s, d) => s + d.metrics.shares, 0);
    const igTickets = ig.reduce((s, d) => s + d.metrics.buyCount, 0);

    const thViews = th.reduce((s, d) => s + (d.metrics.views ?? 0), 0);
    const thLikes = th.reduce((s, d) => s + (d.metrics.likes ?? 0), 0);
    const thReplies = th.reduce((s, d) => s + (d.metrics.replies ?? 0), 0);
    const thShares = th.reduce((s, d) => s + (d.metrics.shares ?? 0), 0);
    const thTickets = th.reduce((s, d) => s + (d.metrics.buyCount ?? 0), 0);

    const volumeData = [
        { metric: "Reach/Views", Facebook: fbReach, Instagram: igReach, Threads: thViews },
        { metric: "Likes", Facebook: fbLikes, Instagram: igLikes, Threads: thLikes },
        { metric: "Comments/Replies", Facebook: fbComments, Instagram: igComments, Threads: thReplies },
        { metric: "Shares", Facebook: fbShares, Instagram: igShares, Threads: thShares },
        { metric: "Vé bán", Facebook: fbTickets, Instagram: igTickets, Threads: thTickets },
    ];

    const PlatformTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm shadow-xl space-y-1.5 min-w-[140px]">
                <p className="text-white font-bold">{label}</p>
                {payload.map((p: any) => p.value > 0 && (
                    <div key={p.dataKey} className="flex justify-between gap-4">
                        <span style={{ color: p.color }}>{p.dataKey}</span>
                        <span className="text-white font-bold">{fmt(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#0e1420] to-[#0b0c12] border border-white/5 p-6">
            <SectionHeader accent="bg-gradient-to-b from-blue-500 via-pink-500 to-slate-400" title="So sánh nền tảng" sub="volume metrics" />
            <div className="flex items-center gap-5 text-sm text-slate-500 mb-4 flex-wrap">
                {fb.length > 0 && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#1877F2] inline-block" />Facebook</span>}
                {ig.length > 0 && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#E1306C] inline-block" />Instagram</span>}
                {th.length > 0 && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#94a3b8] inline-block" />Threads</span>}
            </div>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                        <Tooltip content={<PlatformTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                        {fb.length > 0 && <Bar dataKey="Facebook" fill="#1877F2" radius={[4, 4, 0, 0]} maxBarSize={28} />}
                        {ig.length > 0 && <Bar dataKey="Instagram" fill="#E1306C" radius={[4, 4, 0, 0]} maxBarSize={28} />}
                        {th.length > 0 && <Bar dataKey="Threads" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={28} />}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Skeleton / Empty ─────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-slate-800/50" />)}
            </div>
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-slate-800/50" />)}
            </div>
            <div className="h-[260px] rounded-2xl bg-slate-800/50" />
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border border-slate-800 p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="flex gap-3 opacity-20">
                <MdFacebook className="text-blue-400 text-5xl" />
                <RiInstagramLine className="text-pink-400 text-5xl" />
                <span className="text-slate-300 text-5xl"><ThreadsIcon className="w-12 h-12" /></span>
            </div>
            <div>
                <p className="text-slate-400 font-semibold">Chưa có dữ liệu phân tích</p>
                <p className="text-slate-600 text-sm mt-1 max-w-xs">
                    Dữ liệu sẽ hiển thị khi bài viết được đăng lên Facebook, Instagram hoặc Threads và có metrics.
                </p>
            </div>
        </div>
    );
}

// ─── AnalyticsPage ────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const [pageSize, setPageSize] = useState<number>(20);

    const FETCH_PARAMS: GetPostsParams = {
        pageNumber: 1,
        pageSize,
        sortColumn: "PublishedAt",
        sortOrder: "desc",
        status: "Published",
        hasExternalPostUrl: true,
        eventId,
    };

    const { postsWithMetrics, postsWithIGMetrics, postsWithThreadsMetrics, isLoading, refresh } = useAnalyticsData(FETCH_PARAMS);
    const hasData = postsWithMetrics.length > 0 || postsWithIGMetrics.length > 0 || postsWithThreadsMetrics.length > 0;
    const totalPosts = postsWithMetrics.length + postsWithIGMetrics.length + postsWithThreadsMetrics.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 via-pink-400 to-slate-400 rounded-full" />
                        Phân tích dữ liệu
                    </h1>
                    {!isLoading && hasData && (
                        <div className="flex items-center gap-2 mt-2 ml-4 flex-wrap">
                            {postsWithMetrics.length > 0 && <PlatformBadge platform="Facebook" count={postsWithMetrics.length} />}
                            {postsWithIGMetrics.length > 0 && <PlatformBadge platform="Instagram" count={postsWithIGMetrics.length} />}
                            {postsWithThreadsMetrics.length > 0 && <PlatformBadge platform="Threads" count={postsWithThreadsMetrics.length} />}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={pageSize}
                            onChange={e => setPageSize(Number(e.target.value))}
                            disabled={isLoading}
                            className="appearance-none bg-slate-900 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:border-slate-500 transition-colors disabled:opacity-50 cursor-pointer hover:border-slate-600"
                        >
                            {PAGE_SIZE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">▾</span>
                    </div>
                    <button
                        onClick={refresh}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all disabled:opacity-50"
                    >
                        <MdOutlineRefresh className={isLoading ? "animate-spin" : ""} />
                        Làm mới
                    </button>
                </div>
            </div>

            {totalPosts > SCROLL_THRESHOLD && !isLoading && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/40 border border-slate-700/40 text-sm text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    Đang hiển thị <span className="text-white font-bold mx-1">{totalPosts}</span> bài — biểu đồ per-post có thể cuộn ngang.
                </div>
            )}

            {isLoading && <Skeleton />}
            {!isLoading && !hasData && <EmptyState />}

            {!isLoading && hasData && (
                <>
                    <OverviewKpiRow fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                    <PlatformRatesPanel fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                    <ReachTrendChart fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                    <CrossPlatformBarChart fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                    <EngagementBreakdownPanel fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                    <ConversionRateChart fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                    <TopPostsTable fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                </>
            )}
        </div>
    );
}