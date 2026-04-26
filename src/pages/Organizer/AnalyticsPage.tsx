"use client";

import {
    MdFacebook,
    MdOutlineBarChart,
    MdOutlineBookmark,
    MdOutlineChatBubbleOutline,
    MdOutlineConfirmationNumber,
    MdOutlinePeopleAlt,
    MdOutlineRefresh,
    MdOutlineShare,
    MdOutlineThumbUp,
    MdOutlineTouchApp,
    MdOutlineTrendingUp,
    MdOutlineVisibility,
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
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useAnalyticsData } from "../../hooks/useAnalyticsData";
import type { DistributionMetricsFacebook, DistributionMetricsInstagram, GetPostsParams, PostListItem } from "../../types/post/post";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function truncate(s: string, max = 16): string {
    return s.length > max ? s.slice(0, max) + "…" : s;
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    color: string;
    borderColor: string;
    bgColor: string;
    platformIcon?: React.ReactNode;
}

function KpiCard({ icon, label, value, sub, color, borderColor, bgColor, platformIcon }: KpiCardProps) {
    return (
        <div className={`rounded-2xl border ${borderColor} ${bgColor} px-5 py-4 flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                <div className="flex items-center gap-1.5">
                    {platformIcon && <span className="text-sm opacity-60">{platformIcon}</span>}
                    <div className={`${color} text-lg opacity-70`}>{icon}</div>
                </div>
            </div>
            <p className={`text-2xl font-black ${color} tabular-nums`}>{value}</p>
            <p className="text-xs text-slate-600">{sub}</p>
        </div>
    );
}

// ─── SummaryKpis ──────────────────────────────────────────────────────────────

function SummaryKpis({ fb, ig }: { fb: PostWithMetrics[]; ig: PostWithIGMetrics[] }) {
    // Facebook aggregates
    const fbReach = fb.reduce((s, d) => s + d.metrics.reach, 0);
    const fbClicks = fb.reduce((s, d) => s + d.metrics.clicks, 0);
    const fbLikes = fb.reduce((s, d) => s + d.metrics.likes, 0);
    const fbComments = fb.reduce((s, d) => s + d.metrics.comments, 0);
    const fbShares = fb.reduce((s, d) => s + d.metrics.shares, 0);
    const fbTickets = fb.reduce((s, d) => s + d.metrics.ticketsSold, 0);
    const fbEng = fbLikes + fbComments + fbShares;

    // Instagram aggregates
    const igReach = ig.reduce((s, d) => s + d.metrics.reach, 0);
    const igLikes = ig.reduce((s, d) => s + d.metrics.likes, 0);
    const igComments = ig.reduce((s, d) => s + d.metrics.comments, 0);
    const igSaves = ig.reduce((s, d) => s + d.metrics.saves, 0);
    const igShares = ig.reduce((s, d) => s + d.metrics.shares, 0);
    const igTickets = ig.reduce((s, d) => s + d.metrics.ticketsSold, 0);
    const igEng = igLikes + igComments + igSaves + igShares;

    // Combined
    const totalReach = fbReach + igReach;
    const totalEng = fbEng + igEng;
    const totalTickets = fbTickets + igTickets;

    return (
        <div className="space-y-4">
            {/* Combined overview */}
            <div className="grid grid-cols-3 gap-4">
                <KpiCard
                    icon={<MdOutlinePeopleAlt />}
                    label="Tổng Reach (tất cả)"
                    value={fmt(totalReach)}
                    sub={`FB ${fmt(fbReach)} · IG ${fmt(igReach)}`}
                    color="text-blue-400"
                    borderColor="border-blue-500/20"
                    bgColor="bg-blue-500/5"
                />
                <KpiCard
                    icon={<MdOutlineBarChart />}
                    label="Tổng Tương tác (tất cả)"
                    value={fmt(totalEng)}
                    sub={`FB ${fmt(fbEng)} · IG ${fmt(igEng)}`}
                    color="text-violet-400"
                    borderColor="border-violet-500/20"
                    bgColor="bg-violet-500/5"
                />
                <KpiCard
                    icon={<MdOutlineConfirmationNumber />}
                    label="Tổng Vé bán (tất cả)"
                    value={fmt(totalTickets)}
                    sub={`FB ${fmt(fbTickets)} · IG ${fmt(igTickets)}`}
                    color="text-amber-400"
                    borderColor="border-amber-500/20"
                    bgColor="bg-amber-500/5"
                />
            </div>

            {/* Facebook row */}
            {fb.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <MdFacebook className="text-blue-400" />
                        <span className="text-xs font-black text-blue-400/70 uppercase tracking-widest">Facebook · {fb.length} bài</span>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                        <KpiCard icon={<MdOutlinePeopleAlt />} label="Reach" value={fmt(fbReach)} sub="Người tiếp cận"
                            color="text-blue-400" borderColor="border-blue-500/15" bgColor="bg-blue-500/5"
                            platformIcon={<MdFacebook />} />
                        <KpiCard icon={<MdOutlineTouchApp />} label="Clicks" value={fmt(fbClicks)} sub="Lượt click"
                            color="text-emerald-400" borderColor="border-emerald-500/15" bgColor="bg-emerald-500/5"
                            platformIcon={<MdFacebook />} />
                        <KpiCard icon={<MdOutlineThumbUp />} label="Thích" value={fmt(fbLikes)} sub={`${pct(fbLikes, fbEng)} tương tác`}
                            color="text-sky-400" borderColor="border-sky-500/15" bgColor="bg-sky-500/5"
                            platformIcon={<MdFacebook />} />
                        <KpiCard icon={<MdOutlineShare />} label="Chia sẻ" value={fmt(fbShares)} sub={`${pct(fbShares, fbEng)} tương tác`}
                            color="text-cyan-400" borderColor="border-cyan-500/15" bgColor="bg-cyan-500/5"
                            platformIcon={<MdFacebook />} />
                    </div>
                </div>
            )}

            {/* Instagram row */}
            {ig.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <RiInstagramLine className="text-pink-400" />
                        <span className="text-xs font-black text-pink-400/70 uppercase tracking-widest">Instagram · {ig.length} bài</span>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                        <KpiCard icon={<MdOutlinePeopleAlt />} label="Reach" value={fmt(igReach)} sub="Người tiếp cận"
                            color="text-pink-400" borderColor="border-pink-500/15" bgColor="bg-pink-500/5"
                            platformIcon={<RiInstagramLine />} />
                        <KpiCard icon={<MdOutlineThumbUp />} label="Thích" value={fmt(igLikes)} sub={`${pct(igLikes, igEng)} tương tác`}
                            color="text-rose-400" borderColor="border-rose-500/15" bgColor="bg-rose-500/5"
                            platformIcon={<RiInstagramLine />} />
                        <KpiCard icon={<MdOutlineBookmark />} label="Lưu bài" value={fmt(igSaves)} sub={`${pct(igSaves, igEng)} tương tác`}
                            color="text-amber-400" borderColor="border-amber-500/15" bgColor="bg-amber-500/5"
                            platformIcon={<RiInstagramLine />} />
                        <KpiCard icon={<MdOutlineChatBubbleOutline />} label="Bình luận" value={fmt(igComments)} sub={`${pct(igComments, igEng)} tương tác`}
                            color="text-purple-400" borderColor="border-purple-500/15" bgColor="bg-purple-500/5"
                            platformIcon={<RiInstagramLine />} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── PlatformComparisonChart ──────────────────────────────────────────────────
// Grouped bar chart: so sánh FB vs IG trên từng metric tổng hợp

function PlatformComparisonChart({ fb, ig }: { fb: PostWithMetrics[]; ig: PostWithIGMetrics[] }) {
    if (!fb.length && !ig.length) return null;

    const fbReach = fb.reduce((s, d) => s + d.metrics.reach, 0);
    const fbLikes = fb.reduce((s, d) => s + d.metrics.likes, 0);
    const fbComments = fb.reduce((s, d) => s + d.metrics.comments, 0);
    const fbShares = fb.reduce((s, d) => s + d.metrics.shares, 0);
    const fbClicks = fb.reduce((s, d) => s + d.metrics.clicks, 0);
    const fbTickets = fb.reduce((s, d) => s + d.metrics.ticketsSold, 0);
    const fbEng = fbLikes + fbComments + fbShares;

    const igReach = ig.reduce((s, d) => s + d.metrics.reach, 0);
    const igLikes = ig.reduce((s, d) => s + d.metrics.likes, 0);
    const igComments = ig.reduce((s, d) => s + d.metrics.comments, 0);
    const igShares = ig.reduce((s, d) => s + d.metrics.shares, 0);
    const igSaves = ig.reduce((s, d) => s + d.metrics.saves, 0);
    const igTickets = ig.reduce((s, d) => s + d.metrics.ticketsSold, 0);
    const igEng = igLikes + igComments + igShares + igSaves;

    // 2 bộ chart riêng: Volume (reach, clicks, eng) và Conversion (tickets)
    const volumeData = [
        { metric: "Reach", Facebook: fbReach, Instagram: igReach },
        { metric: "Tương tác", Facebook: fbEng, Instagram: igEng },
        { metric: "Thích", Facebook: fbLikes, Instagram: igLikes },
        { metric: "Bình luận", Facebook: fbComments, Instagram: igComments },
        { metric: "Chia sẻ", Facebook: fbShares, Instagram: igShares },
    ];

    const convData = [
        { metric: "Vé bán", Facebook: fbTickets, Instagram: igTickets },
        { metric: "Clicks (FB)", Facebook: fbClicks, Instagram: 0 },
        { metric: "Lưu (IG)", Facebook: 0, Instagram: ig.reduce((s, d) => s + d.metrics.saves, 0) },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[140px]">
                <p className="text-white font-bold">{label}</p>
                {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex justify-between gap-4">
                        <span style={{ color: p.color }}>{p.dataKey}</span>
                        <span className="text-white font-bold">{fmt(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    const CustomLegend = () => (
        <div className="flex items-center gap-5 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1877F2] inline-block" />Facebook
            </span>
            <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#E1306C] inline-block" />Instagram
            </span>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-pink-500 rounded-full" />
                <h3 className="text-base font-bold text-white">So sánh nền tảng tổng hợp</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Volume chart */}
                <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Volume metrics</p>
                    <p className="text-xs text-slate-600 mb-4">Reach · Tương tác · Thích · Bình luận · Chia sẻ</p>
                    <CustomLegend />
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volumeData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="Facebook" fill="#1877F2" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                <Bar dataKey="Instagram" fill="#E1306C" radius={[4, 4, 0, 0]} maxBarSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion chart */}
                <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Chuyển đổi & đặc thù</p>
                    <p className="text-xs text-slate-600 mb-4">Vé bán · Clicks (chỉ FB) · Lưu bài (chỉ IG)</p>
                    <CustomLegend />
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={convData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="Facebook" fill="#1877F2" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="Instagram" fill="#E1306C" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Engagement rate comparison */}
            <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Engagement Rate tổng hợp mỗi nền tảng</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FB eng rate bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MdFacebook className="text-blue-400" />
                                <span className="text-sm text-slate-400">Facebook</span>
                            </div>
                            <span className="text-sm font-black text-blue-300 tabular-nums">
                                {fbReach > 0 ? `${((fbEng / fbReach) * 100).toFixed(2)}%` : "—"}
                            </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500 transition-all duration-700"
                                style={{ width: fbReach > 0 ? `${Math.min((fbEng / fbReach) * 100, 100)}%` : "0%" }} />
                        </div>
                        <p className="text-xs text-slate-600">{fmt(fbEng)} tương tác / {fmt(fbReach)} reach</p>
                    </div>
                    {/* IG eng rate bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <RiInstagramLine className="text-pink-400" />
                                <span className="text-sm text-slate-400">Instagram</span>
                            </div>
                            <span className="text-sm font-black text-pink-300 tabular-nums">
                                {igReach > 0 ? `${((igEng / igReach) * 100).toFixed(2)}%` : "—"}
                            </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-pink-500 transition-all duration-700"
                                style={{ width: igReach > 0 ? `${Math.min((igEng / igReach) * 100, 100)}%` : "0%" }} />
                        </div>
                        <p className="text-xs text-slate-600">{fmt(igEng)} tương tác / {fmt(igReach)} reach</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── ReachTrendChart ──────────────────────────────────────────────────────────

function ReachTrendChart({ fb, ig }: { fb: PostWithMetrics[]; ig: PostWithIGMetrics[] }) {
    // Merge theo publishedAt, mỗi điểm = 1 post có ít nhất 1 nền tảng
    const allPostIds = Array.from(new Set([
        ...fb.map(d => d.post.id),
        ...ig.map(d => d.post.id),
    ]));

    const fbMap = new Map(fb.map(d => [d.post.id, d]));
    const igMap = new Map(ig.map(d => [d.post.id, d]));

    const allPosts = Array.from(new Set([
        ...fb.map(d => d.post),
        ...ig.map(d => d.post),
    ].map(p => p.id)))
        .map(id => fbMap.get(id)?.post ?? igMap.get(id)?.post!)
        .sort((a, b) => new Date(a.publishedAt ?? 0).getTime() - new Date(b.publishedAt ?? 0).getTime());

    const chartData = allPosts.map((post, idx) => ({
        idx: idx + 1,
        date: post.publishedAt ? fmtDate(post.publishedAt) : `#${idx + 1}`,
        title: post.title,
        facebook: fbMap.get(post.id)?.metrics.reach ?? null,
        instagram: igMap.get(post.id)?.metrics.reach ?? null,
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[160px]">
                <p className="text-white font-bold text-sm truncate max-w-[200px]">{payload[0]?.payload?.title}</p>
                <p className="text-slate-500 text-[10px]">{payload[0]?.payload?.date}</p>
                {payload.map((p: any) => p.value != null && (
                    <div key={p.dataKey} className="flex justify-between gap-4">
                        <span style={{ color: p.color }}>{p.dataKey === "facebook" ? "Facebook" : "Instagram"}</span>
                        <span className="text-white font-bold">{fmt(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <div className="mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MdOutlinePeopleAlt className="text-blue-400" />
                    Reach theo bài đăng · Cả 2 nền tảng
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Mỗi điểm = 1 bài, sắp xếp theo publishedAt tăng dần</p>
            </div>
            <div className="flex items-center gap-5 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400 inline-block rounded" />Facebook</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-pink-400 inline-block rounded" />Instagram</span>
            </div>
            <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="fbGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="idx" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `#${v}`} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="facebook" stroke="#3b82f6" strokeWidth={2} fill="url(#fbGrad)" connectNulls />
                        <Area type="monotone" dataKey="instagram" stroke="#ec4899" strokeWidth={2} fill="url(#igGrad)" connectNulls />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── EngagementBreakdown ──────────────────────────────────────────────────────

function EngagementBreakdown({ fb, ig }: { fb: PostWithMetrics[]; ig: PostWithIGMetrics[] }) {
    const fbLikes = fb.reduce((s, d) => s + d.metrics.likes, 0);
    const fbComments = fb.reduce((s, d) => s + d.metrics.comments, 0);
    const fbShares = fb.reduce((s, d) => s + d.metrics.shares, 0);
    const igLikes = ig.reduce((s, d) => s + d.metrics.likes, 0);
    const igComments = ig.reduce((s, d) => s + d.metrics.comments, 0);
    const igSaves = ig.reduce((s, d) => s + d.metrics.saves, 0);
    const igShares = ig.reduce((s, d) => s + d.metrics.shares, 0);

    const fbTotal = fbLikes + fbComments + fbShares;
    const igTotal = igLikes + igComments + igSaves + igShares;

    const perPostData = [
        ...fb.map(d => ({
            shortTitle: `FB·${truncate(d.post.title, 10)}`,
            title: d.post.title,
            platform: "Facebook",
            likes: d.metrics.likes,
            comments: d.metrics.comments,
            shares: d.metrics.shares,
            saves: 0,
        })),
        ...ig.map(d => ({
            shortTitle: `IG·${truncate(d.post.title, 10)}`,
            title: d.post.title,
            platform: "Instagram",
            likes: d.metrics.likes,
            comments: d.metrics.comments,
            shares: d.metrics.shares,
            saves: d.metrics.saves,
        })),
    ];

    const EngTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const isIG = payload[0]?.payload?.platform === "Instagram";
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[160px]">
                <div className="flex items-center gap-1.5">
                    {isIG ? <RiInstagramLine className="text-pink-400" /> : <MdFacebook className="text-blue-400" />}
                    <p className="text-white font-bold truncate max-w-[180px]">{payload[0]?.payload?.title}</p>
                </div>
                {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex justify-between gap-4">
                        <span style={{ color: p.fill }}>{p.name}</span>
                        <span className="text-white font-bold">{fmt(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <h3 className="text-base font-bold text-white mb-5">Phân tích Engagement · Cả 2 nền tảng</h3>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Breakdown bars */}
                <div className="lg:col-span-2 space-y-5">
                    {/* FB breakdown */}
                    {fb.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 mb-2">
                                <MdFacebook className="text-blue-400 text-sm" />
                                <span className="text-[10px] font-black text-blue-400/70 uppercase tracking-widest">Facebook</span>
                            </div>
                            {[
                                { label: "Thích", value: fbLikes, color: "#3b82f6" },
                                { label: "Bình luận", value: fbComments, color: "#8b5cf6" },
                                { label: "Chia sẻ", value: fbShares, color: "#06b6d4" },
                            ].map(b => (
                                <div key={b.label} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 w-16 shrink-0">{b.label}</span>
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full"
                                            style={{ width: `${fbTotal > 0 ? (b.value / fbTotal) * 100 : 0}%`, backgroundColor: b.color }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 tabular-nums w-10 text-right">{fmt(b.value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* IG breakdown */}
                    {ig.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 mb-2">
                                <RiInstagramLine className="text-pink-400 text-sm" />
                                <span className="text-[10px] font-black text-pink-400/70 uppercase tracking-widest">Instagram</span>
                            </div>
                            {[
                                { label: "Thích", value: igLikes, color: "#e1306c" },
                                { label: "Bình luận", value: igComments, color: "#8b5cf6" },
                                { label: "Lưu", value: igSaves, color: "#f59e0b" },
                                { label: "Chia sẻ", value: igShares, color: "#10b981" },
                            ].map(b => (
                                <div key={b.label} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 w-16 shrink-0">{b.label}</span>
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full"
                                            style={{ width: `${igTotal > 0 ? (b.value / igTotal) * 100 : 0}%`, backgroundColor: b.color }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 tabular-nums w-10 text-right">{fmt(b.value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stacked bar per post */}
                <div className="lg:col-span-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Tương tác theo từng bài</p>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={perPostData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="shortTitle" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                <Tooltip content={<EngTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="likes" name="Thích" stackId="a" fill="#3b82f6" maxBarSize={36} />
                                <Bar dataKey="comments" name="Bình luận" stackId="a" fill="#8b5cf6" maxBarSize={36} />
                                <Bar dataKey="shares" name="Chia sẻ" stackId="a" fill="#06b6d4" maxBarSize={36} />
                                <Bar dataKey="saves" name="Lưu" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500" />Thích</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-500" />Bình luận</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-500" />Chia sẻ</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" />Lưu (IG)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── TopPostsTable ────────────────────────────────────────────────────────────

function TopPostsTable({ fb, ig }: { fb: PostWithMetrics[]; ig: PostWithIGMetrics[] }) {
    type Row = {
        id: string; title: string; publishedAt: string | null;
        platform: "Facebook" | "Instagram";
        reach: number; engagement: number; engRate: string; tickets: number;
    };

    const rows: Row[] = [
        ...fb.map(d => ({
            id: d.post.id + "_fb",
            title: d.post.title,
            publishedAt: d.post.publishedAt,
            platform: "Facebook" as const,
            reach: d.metrics.reach,
            engagement: d.metrics.likes + d.metrics.comments + d.metrics.shares,
            engRate: pct(d.metrics.likes + d.metrics.comments + d.metrics.shares, d.metrics.reach),
            tickets: d.metrics.ticketsSold,
        })),
        ...ig.map(d => ({
            id: d.post.id + "_ig",
            title: d.post.title,
            publishedAt: d.post.publishedAt,
            platform: "Instagram" as const,
            reach: d.metrics.reach,
            engagement: d.metrics.likes + d.metrics.comments + d.metrics.saves + d.metrics.shares,
            engRate: pct(d.metrics.likes + d.metrics.comments + d.metrics.saves + d.metrics.shares, d.metrics.reach),
            tickets: d.metrics.ticketsSold,
        })),
    ].sort((a, b) => b.reach - a.reach).slice(0, 8);

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Top bài đăng theo Reach · Tất cả nền tảng</h3>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full font-semibold">
                    Top {rows.length} / {fb.length + ig.length} bài
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Nền tảng</th>
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Bài viết</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Reach</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Tương tác</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Eng. Rate</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Vé bán</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rows.map(r => (
                            <tr key={r.id} className="hover:bg-white/2 transition-colors">
                                <td className="py-3 pr-3">
                                    {r.platform === "Facebook"
                                        ? <MdFacebook className="text-blue-400 text-base" />
                                        : <RiInstagramLine className="text-pink-400 text-base" />
                                    }
                                </td>
                                <td className="py-3 pr-4">
                                    <p className="text-white font-medium truncate max-w-[180px]">{r.title}</p>
                                    <p className="text-xs text-slate-600 mt-0.5">{r.publishedAt ? fmtDate(r.publishedAt) : "—"}</p>
                                </td>
                                <td className="text-right text-blue-400 font-bold py-3 tabular-nums">{fmt(r.reach)}</td>
                                <td className="text-right text-violet-400 py-3 tabular-nums">{fmt(r.engagement)}</td>
                                <td className="text-right text-emerald-400 font-semibold py-3 tabular-nums">{r.engRate}</td>
                                <td className="text-right text-amber-400 py-3 tabular-nums">{fmt(r.tickets)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Skeleton / Empty ─────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-800/50" />)}
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-800/50" />)}
            </div>
            <div className="h-[320px] rounded-2xl bg-slate-800/50" />
            <div className="grid grid-cols-2 gap-4">
                <div className="h-[300px] rounded-2xl bg-slate-800/50" />
                <div className="h-[300px] rounded-2xl bg-slate-800/50" />
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border border-slate-800 p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="flex gap-3 opacity-30">
                <MdFacebook className="text-blue-400 text-5xl" />
                <RiInstagramLine className="text-pink-400 text-5xl" />
            </div>
            <div>
                <p className="text-slate-400 font-semibold">Chưa có dữ liệu phân tích</p>
                <p className="text-slate-600 text-xs mt-1 max-w-xs">
                    Dữ liệu sẽ hiển thị khi bài viết được đăng lên Facebook hoặc Instagram và có metrics.
                </p>
            </div>
        </div>
    );
}

// ─── AnalyticsPage ────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const FETCH_PARAMS: GetPostsParams = {
        pageNumber: 1,
        pageSize: 20,
        sortColumn: "PublishedAt",
        sortOrder: "asc",
        status: "Published",
        hasExternalPostUrl: true,
        eventId,
    };

    const { postsWithMetrics, postsWithIGMetrics, isLoading, refresh } = useAnalyticsData(FETCH_PARAMS);
    const hasData = postsWithMetrics.length > 0 || postsWithIGMetrics.length > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-pink-400 rounded-full" />
                        Phân tích dữ liệu
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 ml-4">
                        Facebook · Instagram · {postsWithMetrics.length} bài FB · {postsWithIGMetrics.length} bài IG
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
            {!isLoading && !hasData && <EmptyState />}

            {!isLoading && hasData && (
                <>
                    {/* 1. KPI tổng hợp */}
                    <SummaryKpis fb={postsWithMetrics} ig={postsWithIGMetrics} />

                    {/* 2. Grouped bar so sánh 2 nền tảng */}
                    <PlatformComparisonChart fb={postsWithMetrics} ig={postsWithIGMetrics} />

                    {/* 3. Reach trend cả 2 nền tảng */}
                    <ReachTrendChart fb={postsWithMetrics} ig={postsWithIGMetrics} />

                    {/* 4. Engagement breakdown */}
                    <EngagementBreakdown fb={postsWithMetrics} ig={postsWithIGMetrics} />

                    {/* 5. Top posts table */}
                    <TopPostsTable fb={postsWithMetrics} ig={postsWithIGMetrics} />
                </>
            )}
        </div>
    );
}