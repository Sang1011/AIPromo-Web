import {
    MdFacebook,
    MdOutlineBarChart,
    MdOutlineBookmark,
    MdOutlineChatBubbleOutline,
    MdOutlineConfirmationNumber,
    MdOutlinePeopleAlt,
    MdOutlineRefresh,
    MdOutlineRepeat,
    MdOutlineThumbUp,
    MdOutlineTouchApp,
    MdOutlineVisibility
} from "react-icons/md";
import { RiInstagramLine } from "react-icons/ri";
import { useParams } from "react-router-dom";
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { useAnalyticsData } from "../../hooks/useAnalyticsData";
import type {
    DistributionMetricsFacebook,
    DistributionMetricsInstagram,
    DistributionMetricsThreads,
    GetPostsParams,
    PostListItem,
} from "../../types/post/post";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
    if (n == null) return "—";
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

function KpiCard({ icon, label, value, sub, color, borderColor, bgColor, platformIcon }: {
    icon: React.ReactNode; label: string; value: string; sub: string;
    color: string; borderColor: string; bgColor: string; platformIcon?: React.ReactNode;
}) {
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

function SummaryKpis({ fb, ig, th }: {
    fb: PostWithMetrics[];
    ig: PostWithIGMetrics[];
    th: PostWithThreadsMetrics[];
}) {
    // Facebook aggregates
    const fbReach = fb.reduce((s, d) => s + d.metrics.reach, 0);
    const fbLikes = fb.reduce((s, d) => s + d.metrics.likes, 0);
    const fbComments = fb.reduce((s, d) => s + d.metrics.comments, 0);
    const fbShares = fb.reduce((s, d) => s + d.metrics.shares, 0);
    const fbClicks = fb.reduce((s, d) => s + d.metrics.clicks, 0);
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

    // Threads aggregates — ALL fields from DistributionMetricsThreads
    const thViews = th.reduce((s, d) => s + d.metrics.views, 0);
    const thLikes = th.reduce((s, d) => s + d.metrics.likes, 0);
    const thReplies = th.reduce((s, d) => s + d.metrics.replies, 0);
    const thReposts = th.reduce((s, d) => s + d.metrics.reposts, 0);
    const thQuotes = th.reduce((s, d) => s + d.metrics.quotes, 0);
    const thShares = th.reduce((s, d) => s + d.metrics.shares, 0);
    const thTickets = th.reduce((s, d) => s + (d.metrics.ticketsSold ?? 0), 0);
    const thEng = thLikes + thReplies + thReposts + thQuotes + thShares;

    const totalReach = fbReach + igReach + thViews;
    const totalEng = fbEng + igEng + thEng;
    const totalTickets = fbTickets + igTickets + thTickets;

    // Avg CVR per platform (weighted by post count)
    const fbAvgCvr = fb.length > 0
        ? fb.reduce((s, d) => s + (d.metrics.conversionRate ?? 0), 0) / fb.length
        : null;
    const igAvgCvr = ig.length > 0
        ? ig.reduce((s, d) => s + (d.metrics.conversionRate ?? 0), 0) / ig.length
        : null;
    const thAvgCvr = th.length > 0
        ? th.reduce((s, d) => s + (d.metrics.conversionRate ?? 0), 0) / th.length
        : null;

    return (
        <div className="space-y-4">
            {/* Combined overview */}
            <div className="grid grid-cols-3 gap-4">
                <KpiCard icon={<MdOutlinePeopleAlt />} label="Tổng Reach / Views"
                    value={fmt(totalReach)}
                    sub={`FB ${fmt(fbReach)} · IG ${fmt(igReach)} · TH ${fmt(thViews)}`}
                    color="text-blue-400" borderColor="border-blue-500/20" bgColor="bg-blue-500/5" />
                <KpiCard icon={<MdOutlineBarChart />} label="Tổng Tương tác"
                    value={fmt(totalEng)}
                    sub={`FB ${fmt(fbEng)} · IG ${fmt(igEng)} · TH ${fmt(thEng)}`}
                    color="text-violet-400" borderColor="border-violet-500/20" bgColor="bg-violet-500/5" />
                <KpiCard icon={<MdOutlineConfirmationNumber />} label="Tổng Vé bán"
                    value={fmt(totalTickets)}
                    sub={`FB ${fmt(fbTickets)} · IG ${fmt(igTickets)} · TH ${fmt(thTickets)}`}
                    color="text-amber-400" borderColor="border-amber-500/20" bgColor="bg-amber-500/5" />
            </div>

            {/* Facebook */}
            {fb.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <MdFacebook className="text-blue-400" />
                        <span className="text-xs font-black text-blue-400/70 uppercase tracking-widest">Facebook · {fb.length} bài</span>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                        <KpiCard icon={<MdOutlinePeopleAlt />} label="Reach" value={fmt(fbReach)} sub="Người tiếp cận"
                            color="text-blue-400" borderColor="border-blue-500/15" bgColor="bg-blue-500/5" platformIcon={<MdFacebook />} />
                        <KpiCard icon={<MdOutlineTouchApp />} label="Clicks" value={fmt(fbClicks)}
                            sub={`CTR: ${pct(fbClicks, fbReach)}`}
                            color="text-emerald-400" borderColor="border-emerald-500/15" bgColor="bg-emerald-500/5" platformIcon={<MdFacebook />} />
                        <KpiCard icon={<MdOutlineConfirmationNumber />} label="Vé bán" value={fmt(fbTickets)}
                            sub={`CVR TB: ${fbAvgCvr != null ? `${(fbAvgCvr * 100).toFixed(2)}%` : "—"}`}
                            color="text-amber-400" borderColor="border-amber-500/15" bgColor="bg-amber-500/5" platformIcon={<MdFacebook />} />
                        <KpiCard icon={<MdOutlineThumbUp />} label="Thích" value={fmt(fbLikes)}
                            sub={`${pct(fbLikes, fbEng)} tương tác`}
                            color="text-sky-400" borderColor="border-sky-500/15" bgColor="bg-sky-500/5" platformIcon={<MdFacebook />} />
                    </div>
                </div>
            )}

            {/* Instagram */}
            {ig.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <RiInstagramLine className="text-pink-400" />
                        <span className="text-xs font-black text-pink-400/70 uppercase tracking-widest">Instagram · {ig.length} bài</span>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                        <KpiCard icon={<MdOutlinePeopleAlt />} label="Reach" value={fmt(igReach)} sub="Người tiếp cận"
                            color="text-pink-400" borderColor="border-pink-500/15" bgColor="bg-pink-500/5" platformIcon={<RiInstagramLine />} />
                        <KpiCard icon={<MdOutlineBookmark />} label="Lưu bài" value={fmt(igSaves)}
                            sub={`Save Rate: ${pct(igSaves, igReach)}`}
                            color="text-amber-400" borderColor="border-amber-500/15" bgColor="bg-amber-500/5" platformIcon={<RiInstagramLine />} />
                        <KpiCard icon={<MdOutlineConfirmationNumber />} label="Vé bán" value={fmt(igTickets)}
                            sub={`CVR TB: ${igAvgCvr != null ? `${(igAvgCvr * 100).toFixed(2)}%` : "—"}`}
                            color="text-orange-400" borderColor="border-orange-500/15" bgColor="bg-orange-500/5" platformIcon={<RiInstagramLine />} />
                        <KpiCard icon={<MdOutlineChatBubbleOutline />} label="Bình luận" value={fmt(igComments)}
                            sub={`${pct(igComments, igEng)} tương tác`}
                            color="text-purple-400" borderColor="border-purple-500/15" bgColor="bg-purple-500/5" platformIcon={<RiInstagramLine />} />
                    </div>
                </div>
            )}

            {/* Threads */}
            {th.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-slate-300"><ThreadsIcon /></span>
                        <span className="text-xs font-black text-slate-400/70 uppercase tracking-widest">Threads · {th.length} bài</span>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                        <KpiCard icon={<MdOutlineVisibility />} label="Views" value={fmt(thViews)} sub="Lượt xem"
                            color="text-slate-200" borderColor="border-slate-600/30" bgColor="bg-slate-700/10" platformIcon={<ThreadsIcon />} />
                        <KpiCard icon={<MdOutlineRepeat />} label="Reposts" value={fmt(thReposts)}
                            sub={`Repost Rate: ${pct(thReposts, thViews)}`}
                            color="text-emerald-300" borderColor="border-emerald-500/15" bgColor="bg-emerald-500/5" platformIcon={<ThreadsIcon />} />
                        <KpiCard icon={<MdOutlineConfirmationNumber />} label="Vé bán" value={fmt(thTickets)}
                            sub={`CVR TB: ${thAvgCvr != null ? `${(thAvgCvr * 100).toFixed(2)}%` : "—"}`}
                            color="text-amber-300" borderColor="border-amber-500/15" bgColor="bg-amber-500/5" platformIcon={<ThreadsIcon />} />
                        <KpiCard icon={<MdOutlineChatBubbleOutline />} label="Replies" value={fmt(thReplies)}
                            sub={`${pct(thReplies, thEng)} tương tác`}
                            color="text-sky-300" borderColor="border-sky-500/15" bgColor="bg-sky-500/5" platformIcon={<ThreadsIcon />} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── ConversionRateChart ──────────────────────────────────────────────────────
// Chart mới: CVR từng bài theo nền tảng

function ConversionRateChart({ fb, ig, th }: {
    fb: PostWithMetrics[];
    ig: PostWithIGMetrics[];
    th: PostWithThreadsMetrics[];
}) {
    if (!fb.length && !ig.length && !th.length) return null;

    // Per-post CVR data
    const fbData = fb.map((d, i) => ({
        name: truncate(d.post.title, 12),
        idx: `FB#${i + 1}`,
        platform: "Facebook",
        cvr: (d.metrics.conversionRate ?? 0) * 100,
        ctr: d.metrics.reach > 0 ? (d.metrics.clicks / d.metrics.reach) * 100 : 0,
        tickets: d.metrics.ticketsSold,
    }));

    const igData = ig.map((d, i) => ({
        name: truncate(d.post.title, 12),
        idx: `IG#${i + 1}`,
        platform: "Instagram",
        cvr: (d.metrics.conversionRate ?? 0) * 100,
        saveRate: d.metrics.reach > 0 ? (d.metrics.saves / d.metrics.reach) * 100 : 0,
        tickets: d.metrics.ticketsSold,
    }));

    const thData = th.map((d, i) => ({
        name: truncate(d.post.title, 12),
        idx: `TH#${i + 1}`,
        platform: "Threads",
        cvr: (d.metrics.conversionRate ?? 0) * 100,
        repostRate: d.metrics.views > 0 ? (d.metrics.reposts / d.metrics.views) * 100 : 0,
        tickets: d.metrics.ticketsSold ?? 0,
    }));

    const CvrTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0]?.payload;
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[160px]">
                <p className="text-white font-bold">{d?.name}</p>
                <p className="text-slate-500">{d?.platform}</p>
                {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex justify-between gap-4">
                        <span style={{ color: p.fill || p.color }}>{p.name}</span>
                        <span className="text-white font-bold">{p.value?.toFixed(2)}%</span>
                    </div>
                ))}
                <div className="flex justify-between gap-4 border-t border-slate-700 pt-1 mt-1">
                    <span className="text-amber-400">Vé bán</span>
                    <span className="text-white font-bold">{fmt(d?.tickets)}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
                <h3 className="text-base font-bold text-white">Chuyển đổi & Tỷ lệ hiệu suất</h3>
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">CVR · CTR · Save Rate · Repost Rate</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Facebook CVR + CTR */}
                {fb.length > 0 && (
                    <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <MdFacebook className="text-blue-400" />
                            <p className="text-[10px] font-black text-blue-400/70 uppercase tracking-widest">Facebook · CVR & CTR</p>
                        </div>
                        <div className="h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={fbData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="idx" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} />
                                    <Tooltip content={<CvrTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                    <Bar dataKey="cvr" name="CVR" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                    <Bar dataKey="ctr" name="CTR" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-slate-600">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" />CVR</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500" />CTR</span>
                        </div>
                    </div>
                )}

                {/* Instagram CVR + Save Rate */}
                {ig.length > 0 && (
                    <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <RiInstagramLine className="text-pink-400" />
                            <p className="text-[10px] font-black text-pink-400/70 uppercase tracking-widest">Instagram · CVR & Save Rate</p>
                        </div>
                        <div className="h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={igData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="idx" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} />
                                    <Tooltip content={<CvrTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                    <Bar dataKey="cvr" name="CVR" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                    <Bar dataKey="saveRate" name="Save Rate" fill="#e1306c" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-slate-600">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" />CVR</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-pink-500" />Save Rate</span>
                        </div>
                    </div>
                )}

                {/* Threads CVR + Repost Rate */}
                {th.length > 0 && (
                    <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-slate-300"><ThreadsIcon /></span>
                            <p className="text-[10px] font-black text-slate-400/70 uppercase tracking-widest">Threads · CVR & Repost Rate</p>
                        </div>
                        <div className="h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={thData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="idx" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} />
                                    <Tooltip content={<CvrTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                    <Bar dataKey="cvr" name="CVR" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                    <Bar dataKey="repostRate" name="Repost Rate" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-slate-600">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" />CVR</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" />Repost Rate</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── PlatformComparisonChart ──────────────────────────────────────────────────

function PlatformComparisonChart({ fb, ig, th }: {
    fb: PostWithMetrics[];
    ig: PostWithIGMetrics[];
    th: PostWithThreadsMetrics[];
}) {
    if (!fb.length && !ig.length && !th.length) return null;

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

    const thViews = th.reduce((s, d) => s + d.metrics.views, 0);
    const thLikes = th.reduce((s, d) => s + d.metrics.likes, 0);
    const thReplies = th.reduce((s, d) => s + d.metrics.replies, 0);
    const thReposts = th.reduce((s, d) => s + d.metrics.reposts, 0);
    const thQuotes = th.reduce((s, d) => s + d.metrics.quotes, 0);
    const thShares = th.reduce((s, d) => s + d.metrics.shares, 0);
    const thTickets = th.reduce((s, d) => s + (d.metrics.ticketsSold ?? 0), 0);
    const thEng = thLikes + thReplies + thReposts + thQuotes + thShares;

    const volumeData = [
        { metric: "Reach/Views", Facebook: fbReach, Instagram: igReach, Threads: thViews },
        { metric: "Tương tác", Facebook: fbEng, Instagram: igEng, Threads: thEng },
        { metric: "Thích", Facebook: fbLikes, Instagram: igLikes, Threads: thLikes },
        { metric: "Bình luận", Facebook: fbComments, Instagram: igComments, Threads: thReplies },
        { metric: "Chia sẻ", Facebook: fbShares, Instagram: igShares, Threads: thShares },
    ];

    const convData = [
        { metric: "Vé bán", Facebook: fbTickets, Instagram: igTickets, Threads: thTickets },
        { metric: "Clicks (FB)", Facebook: fbClicks, Instagram: 0, Threads: 0 },
        { metric: "Lưu (IG)", Facebook: 0, Instagram: igSaves, Threads: 0 },
        { metric: "Reposts (TH)", Facebook: 0, Instagram: 0, Threads: thReposts },
        { metric: "Quotes (TH)", Facebook: 0, Instagram: 0, Threads: thQuotes },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[140px]">
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

    const Legend = () => (
        <div className="flex items-center gap-5 text-xs text-slate-500 mb-3 flex-wrap">
            {fb.length > 0 && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#1877F2] inline-block" />Facebook</span>}
            {ig.length > 0 && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#E1306C] inline-block" />Instagram</span>}
            {th.length > 0 && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#94a3b8] inline-block" />Threads</span>}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 via-pink-500 to-slate-400 rounded-full" />
                <h3 className="text-base font-bold text-white">So sánh nền tảng tổng hợp</h3>
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">FB · IG · Threads</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Volume */}
                <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Volume metrics</p>
                    <p className="text-xs text-slate-600 mb-3">Reach · Tương tác · Thích · Bình luận · Chia sẻ</p>
                    <Legend />
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volumeData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                {fb.length > 0 && <Bar dataKey="Facebook" fill="#1877F2" radius={[4, 4, 0, 0]} maxBarSize={28} />}
                                {ig.length > 0 && <Bar dataKey="Instagram" fill="#E1306C" radius={[4, 4, 0, 0]} maxBarSize={28} />}
                                {th.length > 0 && <Bar dataKey="Threads" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={28} />}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion & đặc thù — Threads tickets now included */}
                <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Chuyển đổi & đặc thù</p>
                    <p className="text-xs text-slate-600 mb-3">Vé · Clicks(FB) · Lưu(IG) · Reposts/Quotes(TH)</p>
                    <Legend />
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={convData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                {fb.length > 0 && <Bar dataKey="Facebook" fill="#1877F2" radius={[4, 4, 0, 0]} maxBarSize={32} />}
                                {ig.length > 0 && <Bar dataKey="Instagram" fill="#E1306C" radius={[4, 4, 0, 0]} maxBarSize={32} />}
                                {th.length > 0 && <Bar dataKey="Threads" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={32} />}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Engagement rate 3 nền tảng */}
            <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Engagement Rate tổng hợp mỗi nền tảng</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {fb.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><MdFacebook className="text-blue-400" /><span className="text-sm text-slate-400">Facebook</span></div>
                                <span className="text-sm font-black text-blue-300 tabular-nums">
                                    {fbReach > 0 ? `${((fbEng / fbReach) * 100).toFixed(2)}%` : "—"}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-blue-500 transition-all duration-700"
                                    style={{ width: fbReach > 0 ? `${Math.min((fbEng / fbReach) * 100, 100)}%` : "0%" }} />
                            </div>
                            <p className="text-xs text-slate-600">{fmt(fbEng)} tương tác / {fmt(fbReach)} reach</p>
                            <p className="text-xs text-slate-600">CTR: {pct(fbClicks, fbReach)} · Vé: {fmt(fbTickets)}</p>
                        </div>
                    )}
                    {ig.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><RiInstagramLine className="text-pink-400" /><span className="text-sm text-slate-400">Instagram</span></div>
                                <span className="text-sm font-black text-pink-300 tabular-nums">
                                    {igReach > 0 ? `${((igEng / igReach) * 100).toFixed(2)}%` : "—"}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-pink-500 transition-all duration-700"
                                    style={{ width: igReach > 0 ? `${Math.min((igEng / igReach) * 100, 100)}%` : "0%" }} />
                            </div>
                            <p className="text-xs text-slate-600">{fmt(igEng)} tương tác / {fmt(igReach)} reach</p>
                            <p className="text-xs text-slate-600">Save Rate: {pct(igSaves, igReach)} · Vé: {fmt(igTickets)}</p>
                        </div>
                    )}
                    {th.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><span className="text-slate-300"><ThreadsIcon /></span><span className="text-sm text-slate-400">Threads</span></div>
                                <span className="text-sm font-black text-slate-300 tabular-nums">
                                    {thViews > 0 ? `${((thEng / thViews) * 100).toFixed(2)}%` : "—"}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-slate-400 transition-all duration-700"
                                    style={{ width: thViews > 0 ? `${Math.min((thEng / thViews) * 100, 100)}%` : "0%" }} />
                            </div>
                            <p className="text-xs text-slate-600">{fmt(thEng)} tương tác / {fmt(thViews)} views</p>
                            <p className="text-xs text-slate-600">Repost Rate: {pct(thReposts, thViews)} · Vé: {fmt(thTickets)}</p>
                        </div>
                    )}
                </div>
            </div>
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

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[160px]">
                <p className="text-white font-bold text-sm truncate max-w-[200px]">{payload[0]?.payload?.title}</p>
                <p className="text-slate-500 text-[10px]">{payload[0]?.payload?.date}</p>
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
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <div className="mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MdOutlinePeopleAlt className="text-blue-400" />
                    Reach / Views theo bài đăng · Tất cả nền tảng
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Mỗi điểm = 1 bài, sắp xếp theo publishedAt tăng dần</p>
            </div>
            <div className="flex items-center gap-5 text-xs text-slate-500 mb-3 flex-wrap">
                {fb.length > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400 inline-block rounded" />Facebook</span>}
                {ig.length > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-pink-400 inline-block rounded" />Instagram</span>}
                {th.length > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-400 inline-block rounded" />Threads</span>}
            </div>
            <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="fbGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} /><stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="thGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.3} /><stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="idx" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `#${v}`} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
                        {fb.length > 0 && <Area type="monotone" dataKey="facebook" stroke="#3b82f6" strokeWidth={2} fill="url(#fbGrad)" connectNulls />}
                        {ig.length > 0 && <Area type="monotone" dataKey="instagram" stroke="#ec4899" strokeWidth={2} fill="url(#igGrad)" connectNulls />}
                        {th.length > 0 && <Area type="monotone" dataKey="threads" stroke="#94a3b8" strokeWidth={2} fill="url(#thGrad)" connectNulls />}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── EngagementBreakdown ──────────────────────────────────────────────────────

function EngagementBreakdown({ fb, ig, th }: {
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
    const thLikes = th.reduce((s, d) => s + d.metrics.likes, 0);
    const thReplies = th.reduce((s, d) => s + d.metrics.replies, 0);
    const thReposts = th.reduce((s, d) => s + d.metrics.reposts, 0);
    const thQuotes = th.reduce((s, d) => s + d.metrics.quotes, 0);
    const thShares = th.reduce((s, d) => s + d.metrics.shares, 0);

    const fbTotal = fbLikes + fbComments + fbShares;
    const igTotal = igLikes + igComments + igSaves + igShares;
    const thTotal = thLikes + thReplies + thReposts + thQuotes + thShares;

    const perPostData = [
        ...fb.map(d => ({
            shortTitle: `FB·${truncate(d.post.title, 8)}`,
            title: d.post.title, platform: "Facebook",
            likes: d.metrics.likes, comments: d.metrics.comments,
            shares: d.metrics.shares, saves: 0, replies: 0, reposts: 0,
        })),
        ...ig.map(d => ({
            shortTitle: `IG·${truncate(d.post.title, 8)}`,
            title: d.post.title, platform: "Instagram",
            likes: d.metrics.likes, comments: d.metrics.comments,
            shares: d.metrics.shares, saves: d.metrics.saves, replies: 0, reposts: 0,
        })),
        ...th.map(d => ({
            shortTitle: `TH·${truncate(d.post.title, 8)}`,
            title: d.post.title, platform: "Threads",
            likes: d.metrics.likes, comments: 0,
            shares: d.metrics.shares, saves: 0,
            replies: d.metrics.replies,
            reposts: d.metrics.reposts + d.metrics.quotes,
        })),
    ];

    const EngTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const plat = payload[0]?.payload?.platform;
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1.5 min-w-[160px]">
                <div className="flex items-center gap-1.5">
                    {plat === "Instagram" ? <RiInstagramLine className="text-pink-400" />
                        : plat === "Threads" ? <span className="text-slate-300"><ThreadsIcon className="w-3 h-3" /></span>
                            : <MdFacebook className="text-blue-400" />}
                    <p className="text-white font-bold truncate max-w-[180px]">{payload[0]?.payload?.title}</p>
                </div>
                {payload.map((p: any) => p.value > 0 && (
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
            <h3 className="text-base font-bold text-white mb-5">Phân tích Engagement · Tất cả nền tảng</h3>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-5">
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
                                        <div className="h-full rounded-full" style={{ width: `${fbTotal > 0 ? (b.value / fbTotal) * 100 : 0}%`, backgroundColor: b.color }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 tabular-nums w-10 text-right">{fmt(b.value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
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
                                        <div className="h-full rounded-full" style={{ width: `${igTotal > 0 ? (b.value / igTotal) * 100 : 0}%`, backgroundColor: b.color }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 tabular-nums w-10 text-right">{fmt(b.value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {th.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-slate-300"><ThreadsIcon className="w-3.5 h-3.5" /></span>
                                <span className="text-[10px] font-black text-slate-400/70 uppercase tracking-widest">Threads</span>
                            </div>
                            {[
                                { label: "Thích", value: thLikes, color: "#f43f5e" },
                                { label: "Replies", value: thReplies, color: "#38bdf8" },
                                { label: "Reposts", value: thReposts, color: "#34d399" },
                                { label: "Quotes", value: thQuotes, color: "#a78bfa" },
                                { label: "Chia sẻ", value: thShares, color: "#94a3b8" },
                            ].map(b => (
                                <div key={b.label} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 w-16 shrink-0">{b.label}</span>
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${thTotal > 0 ? (b.value / thTotal) * 100 : 0}%`, backgroundColor: b.color }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 tabular-nums w-10 text-right">{fmt(b.value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Tương tác theo từng bài</p>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={perPostData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="shortTitle" tick={{ fill: "#64748b", fontSize: 8 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                                <Tooltip content={<EngTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="likes" name="Thích" stackId="a" fill="#3b82f6" maxBarSize={36} />
                                <Bar dataKey="comments" name="Bình luận" stackId="a" fill="#8b5cf6" maxBarSize={36} />
                                <Bar dataKey="shares" name="Chia sẻ" stackId="a" fill="#06b6d4" maxBarSize={36} />
                                <Bar dataKey="saves" name="Lưu (IG)" stackId="a" fill="#f59e0b" maxBarSize={36} />
                                <Bar dataKey="replies" name="Replies (TH)" stackId="a" fill="#38bdf8" maxBarSize={36} />
                                <Bar dataKey="reposts" name="Reposts (TH)" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500" />Thích</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-500" />Bình luận</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-500" />Chia sẻ</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" />Lưu (IG)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-sky-400" />Replies (TH)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400" />Reposts (TH)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── TopPostsTable ────────────────────────────────────────────────────────────

function TopPostsTable({ fb, ig, th }: {
    fb: PostWithMetrics[];
    ig: PostWithIGMetrics[];
    th: PostWithThreadsMetrics[];
}) {
    type Row = {
        id: string; title: string; publishedAt: string | null;
        platform: "Facebook" | "Instagram" | "Threads";
        reach: number; engagement: number; engRate: string;
        tickets: number; cvr: string;
    };

    const rows: Row[] = [
        ...fb.map(d => {
            const eng = d.metrics.likes + d.metrics.comments + d.metrics.shares;
            return {
                id: d.post.id + "_fb", title: d.post.title, publishedAt: d.post.publishedAt,
                platform: "Facebook" as const,
                reach: d.metrics.reach,
                engagement: eng,
                engRate: pct(eng, d.metrics.reach),
                tickets: d.metrics.ticketsSold,
                cvr: d.metrics.conversionRateFormatted ?? "—",
            };
        }),
        ...ig.map(d => {
            const eng = d.metrics.likes + d.metrics.comments + d.metrics.saves + d.metrics.shares;
            return {
                id: d.post.id + "_ig", title: d.post.title, publishedAt: d.post.publishedAt,
                platform: "Instagram" as const,
                reach: d.metrics.reach,
                engagement: eng,
                engRate: pct(eng, d.metrics.reach),
                tickets: d.metrics.ticketsSold,
                cvr: d.metrics.conversionRateFormatted ?? "—",
            };
        }),
        ...th.map(d => {
            const eng = d.metrics.likes + d.metrics.replies + d.metrics.reposts + d.metrics.quotes + d.metrics.shares;
            return {
                id: d.post.id + "_th", title: d.post.title, publishedAt: d.post.publishedAt,
                platform: "Threads" as const,
                reach: d.metrics.views,
                engagement: eng,
                engRate: pct(eng, d.metrics.views),
                tickets: d.metrics.ticketsSold ?? 0,   // ← fixed: no longer hardcoded 0
                cvr: d.metrics.conversionRateFormatted ?? "—",
            };
        }),
    ].sort((a, b) => b.reach - a.reach).slice(0, 10);

    const PlatformIcon = ({ p }: { p: Row["platform"] }) => {
        if (p === "Facebook") return <MdFacebook className="text-blue-400 text-base" />;
        if (p === "Instagram") return <RiInstagramLine className="text-pink-400 text-base" />;
        return <span className="text-slate-300"><ThreadsIcon className="w-4 h-4" /></span>;
    };

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Top bài đăng theo Reach / Views · Tất cả nền tảng</h3>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full font-semibold">
                    Top {rows.length} / {fb.length + ig.length + th.length} bài
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Nền tảng</th>
                            <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Bài viết</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Reach/Views</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Tương tác</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Eng. Rate</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">Vé bán</th>
                            <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3">CVR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rows.map(r => (
                            <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 pr-3"><PlatformIcon p={r.platform} /></td>
                                <td className="py-3 pr-4">
                                    <p className="text-white font-medium truncate max-w-[180px]">{r.title}</p>
                                    <p className="text-xs text-slate-600 mt-0.5">{r.publishedAt ? fmtDate(r.publishedAt) : "—"}</p>
                                </td>
                                <td className="text-right text-blue-400 font-bold py-3 tabular-nums">{fmt(r.reach)}</td>
                                <td className="text-right text-violet-400 py-3 tabular-nums">{fmt(r.engagement)}</td>
                                <td className="text-right text-emerald-400 font-semibold py-3 tabular-nums">{r.engRate}</td>
                                <td className="text-right text-amber-400 py-3 tabular-nums">
                                    {r.tickets > 0 ? fmt(r.tickets) : <span className="text-slate-700">—</span>}
                                </td>
                                <td className="text-right text-orange-400 py-3 tabular-nums">
                                    {r.cvr !== "—" ? r.cvr : <span className="text-slate-700">—</span>}
                                </td>
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
                <span className="text-slate-300 text-5xl"><ThreadsIcon className="w-12 h-12" /></span>
            </div>
            <div>
                <p className="text-slate-400 font-semibold">Chưa có dữ liệu phân tích</p>
                <p className="text-slate-600 text-xs mt-1 max-w-xs">
                    Dữ liệu sẽ hiển thị khi bài viết được đăng lên Facebook, Instagram hoặc Threads và có metrics.
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

    const { postsWithMetrics, postsWithIGMetrics, postsWithThreadsMetrics, isLoading, refresh } = useAnalyticsData(FETCH_PARAMS);
    const hasData = postsWithMetrics.length > 0 || postsWithIGMetrics.length > 0 || postsWithThreadsMetrics.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 via-pink-400 to-slate-400 rounded-full" />
                        Phân tích dữ liệu
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 ml-4">
                        Facebook · Instagram · Threads · {postsWithMetrics.length} bài FB · {postsWithIGMetrics.length} bài IG · {postsWithThreadsMetrics.length} bài TH
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
                    <SummaryKpis fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                    <PlatformComparisonChart fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                    <ConversionRateChart fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                    <ReachTrendChart fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                    <EngagementBreakdown fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                    <TopPostsTable fb={postsWithMetrics} ig={postsWithIGMetrics} th={postsWithThreadsMetrics} />
                </>
            )}
        </div>
    );
}