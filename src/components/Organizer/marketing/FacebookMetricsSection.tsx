import { useEffect } from "react";
import {
    MdFacebook,
    MdOutlineChatBubbleOutline,
    MdOutlineOpenInNew,
    MdOutlinePeopleAlt,
    MdOutlineRefresh,
    MdOutlineThumbUp,
    MdOutlineTouchApp,
    MdOutlineShare,
    MdOutlineConfirmationNumber,
    MdOutlineTrendingUp,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
    Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { AppDispatch, RootState } from "../../../store";
import { clearDistributionMetrics, fetchDistributionMetricsFacebook } from "../../../store/postSlice";
import type { PostDetail } from "../../../types/post/post";
import { formatDateTime } from "../../../utils/formatDateTime";
import { EmptyStateFacebook } from "../shared/EmtyState";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
    borderColor?: string;
    badge?: string;
}

function StatCard({ icon, label, value, sub, color = "text-blue-400", borderColor = "border-blue-500/20", badge }: StatCardProps) {
    return (
        <div className={`relative bg-slate-900/60 border ${borderColor} rounded-2xl px-5 py-4 flex flex-col gap-2 overflow-hidden group transition-all duration-200 hover:border-opacity-60`}>
            {/* Subtle glow bg */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}
                style={{ background: `radial-gradient(ellipse at top left, currentColor, transparent 70%)` }} />
            <div className="flex items-center justify-between">
                <div className={`${color} text-xl`}>{icon}</div>
                {badge && (
                    <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">{badge}</span>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                <p className={`text-2xl font-black ${color} mt-0.5 tabular-nums`}>{value}</p>
                {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── RateCard ─────────────────────────────────────────────────────────────────

function RateCard({
    label, rate, numerator, denominator, numeratorLabel, denominatorLabel, gradient,
}: {
    label: string; rate: string; numerator: number; denominator: number;
    numeratorLabel: string; denominatorLabel: string; gradient: string;
}) {
    const pctNum = denominator > 0 ? Math.min((numerator / denominator) * 100, 100) : 0;

    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 space-y-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-black text-white tabular-nums">{rate}</p>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pctNum}%`, background: gradient }} />
            </div>
            <div className="flex justify-between text-xs text-slate-600">
                <span>{numeratorLabel}: <span className="text-slate-400 font-semibold">{fmt(numerator)}</span></span>
                <span>{denominatorLabel}: <span className="text-slate-400 font-semibold">{fmt(denominator)}</span></span>
            </div>
        </div>
    );
}

// ─── Engagement Bar Chart ─────────────────────────────────────────────────────

function EngagementBar({ likes, comments, shares }: { likes: number; comments: number; shares: number }) {
    const data = [
        { name: "Thích", value: likes, color: "#3b82f6" },
        { name: "Bình luận", value: comments, color: "#8b5cf6" },
        { name: "Chia sẻ", value: shares, color: "#06b6d4" },
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-3 py-2 text-xs">
                <p className="text-white font-bold">{payload[0].payload.name}</p>
                <p className="text-slate-300">{payload[0].value.toLocaleString()}</p>
            </div>
        );
    };

    return (
        <div className="w-full h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MetricsSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl h-24" />
                ))}
            </div>
        </div>
    );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] font-black tracking-widest text-slate-600 uppercase">{label}</span>
            <div className="h-px flex-1 bg-slate-800" />
        </div>
    );
}

// ─── FacebookMetricsSection ───────────────────────────────────────────────────

export default function FacebookMetricsSection({ post }: { post: PostDetail }) {
    const dispatch = useDispatch<AppDispatch>();
    const { distributionMetrics: m, loading } = useSelector((s: RootState) => s.POST);

    const fbDistribution = post.distributions?.find(d => d.platform === "Facebook") ?? null;

    useEffect(() => { dispatch(clearDistributionMetrics()); }, []);

    useEffect(() => {
        if (fbDistribution?.id) {
            dispatch(fetchDistributionMetricsFacebook({ postId: post.postId, distributionId: fbDistribution.id }));
        }
    }, [fbDistribution?.id, post.postId]);

    if (!fbDistribution) return null;

    return (
        <section className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <MdFacebook className="text-blue-400 text-2xl" />
                    Hiệu suất Facebook
                </h2>
                <div className="flex items-center gap-2.5 flex-wrap">
                    {m?.fetchedAt && (
                        <span className="text-xs text-slate-600">
                            Cập nhật: {formatDateTime(m.fetchedAt)}
                        </span>
                    )}
                    {(fbDistribution.externalUrl || m?.externalUrl) && (
                        <a
                            href={fbDistribution.externalUrl ?? m?.externalUrl ?? "#"}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all"
                        >
                            <MdFacebook />Xem bài gốc<MdOutlineOpenInNew className="text-xs" />
                        </a>
                    )}
                    <button
                        onClick={() => fbDistribution.id && dispatch(fetchDistributionMetricsFacebook({ postId: post.postId, distributionId: fbDistribution.id }))}
                        disabled={loading.fetchDistributionMetrics}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all disabled:opacity-50"
                    >
                        <MdOutlineRefresh className={loading.fetchDistributionMetrics ? "animate-spin" : ""} />
                        Làm mới
                    </button>
                </div>
            </div>

            {loading.fetchDistributionMetrics && !m && <MetricsSkeleton />}

            {m && (
                <div className="space-y-5">
                    {/* ── Reach & Clicks ── */}
                    <SectionDivider label="Phân phối" />
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard icon={<MdOutlinePeopleAlt />} label="Reach" value={fmt(m.reach)} sub="Người tiếp cận" color="text-violet-400" borderColor="border-violet-500/20" />
                        <StatCard icon={<MdOutlineTouchApp />} label="Clicks" value={fmt(m.clicks)} sub="Lượt nhấp" color="text-emerald-400" borderColor="border-emerald-500/20" />
                    </div>

                    {/* ── Engagement ── */}
                    <SectionDivider label="Tương tác" />
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard icon={<MdOutlineThumbUp />} label="Lượt thích" value={fmt(m.likes)} color="text-blue-400" borderColor="border-blue-500/20" />
                        <StatCard icon={<MdOutlineChatBubbleOutline />} label="Bình luận" value={fmt(m.comments)} color="text-purple-400" borderColor="border-purple-500/20" />
                        <StatCard icon={<MdOutlineShare />} label="Chia sẻ" value={fmt(m.shares)} color="text-cyan-400" borderColor="border-cyan-500/20" />
                    </div>

                    {/* ── Engagement breakdown chart ── */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phân tích Engagement</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />Thích</span>
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-violet-500 inline-block" />Bình luận</span>
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-cyan-500 inline-block" />Chia sẻ</span>
                            </div>
                        </div>
                        <EngagementBar likes={m.likes} comments={m.comments} shares={m.shares} />
                    </div>

                    {/* ── Conversion & Business ── */}
                    <SectionDivider label="Chuyển đổi & Kinh doanh" />
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard
                            icon={<MdOutlineConfirmationNumber />}
                            label="Vé đã bán"
                            value={fmt(m.ticketsSold)}
                            sub="Từ bài đăng này"
                            color="text-amber-400"
                            borderColor="border-amber-500/20"
                            badge="Business"
                        />
                        <StatCard
                            icon={<MdOutlineTrendingUp />}
                            label="Tỷ lệ chuyển đổi"
                            value={m.conversionRateFormatted}
                            sub="Clicks → Vé"
                            color="text-orange-400"
                            borderColor="border-orange-500/20"
                            badge="CVR"
                        />
                    </div>

                    {/* ── Rates ── */}
                    <SectionDivider label="Tỷ lệ hiệu suất" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <RateCard
                            label="Engagement Rate"
                            rate={m.engagementRateFormatted}
                            numerator={m.likes + m.comments + m.shares}
                            denominator={m.reach}
                            numeratorLabel="Tổng tương tác"
                            denominatorLabel="Reach"
                            gradient="linear-gradient(90deg, #3b82f6, #8b5cf6)"
                        />
                        <RateCard
                            label="Click-Through Rate"
                            rate={m.clicks > 0 && m.reach > 0 ? `${((m.clicks / m.reach) * 100).toFixed(2)}%` : "—"}
                            numerator={m.clicks}
                            denominator={m.reach}
                            numeratorLabel="Clicks"
                            denominatorLabel="Reach"
                            gradient="linear-gradient(90deg, #10b981, #06b6d4)"
                        />
                    </div>

                    {/* ── External link ── */}
                    {m.externalUrl && (
                        <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 rounded-2xl px-5 py-3">
                            <MdFacebook className="text-blue-400 text-lg shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 mb-0.5">Link bài Facebook</p>
                                <a href={m.externalUrl} target="_blank" rel="noreferrer"
                                    className="text-blue-400 text-sm hover:underline truncate block">{m.externalUrl}</a>
                            </div>
                            <a href={m.externalUrl} target="_blank" rel="noreferrer"
                                className="shrink-0 p-2 rounded-xl border border-slate-700 text-slate-400 hover:border-blue-500/40 hover:text-blue-400 transition-all">
                                <MdOutlineOpenInNew />
                            </a>
                        </div>
                    )}
                </div>
            )}

            {!m && !loading.fetchDistributionMetrics && <EmptyStateFacebook />}
        </section>
    );
}