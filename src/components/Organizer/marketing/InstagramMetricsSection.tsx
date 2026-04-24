import { useEffect } from "react";
import {
    MdOutlineChatBubbleOutline,
    MdOutlineBookmark,
    MdOutlineOpenInNew,
    MdOutlinePeopleAlt,
    MdOutlineRefresh,
    MdOutlineThumbUp,
    MdOutlineShare,
} from "react-icons/md";
import { RiInstagramLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { AppDispatch, RootState } from "../../../store";
import {
    clearDistributionMetricsInstagram,
    fetchDistributionMetricsInstagram,
} from "../../../store/postSlice";
import type { PostDetail } from "../../../types/post/post";
import { formatDateTime } from "../../../utils/formatDateTime";
import { EmptyStateInstagram } from "../shared/EmtyState";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

function pct(numerator: number, denominator: number): string {
    if (!denominator) return "0%";
    return `${((numerator / denominator) * 100).toFixed(2)}%`;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
    icon,
    label,
    value,
    sub,
    color = "text-primary",
    borderColor = "border-primary/20",
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
    borderColor?: string;
}) {
    return (
        <div className={`bg-slate-900/50 border ${borderColor} rounded-2xl px-5 py-4 flex flex-col gap-2`}>
            <div className={`${color} text-xl`}>{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                <p className={`text-2xl font-black ${color} mt-0.5`}>{value}</p>
                {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Engagement breakdown bar chart ──────────────────────────────────────────

function EngagementBar({
    likes,
    comments,
    saves,
    shares,
}: {
    likes: number;
    comments: number;
    saves: number;
    shares: number;
}) {
    const data = [
        { name: "Thích", value: likes, color: "#e1306c" },
        { name: "Bình luận", value: comments, color: "#8b5cf6" },
        { name: "Lưu", value: saves, color: "#f59e0b" },
        { name: "Chia sẻ", value: shares, color: "#10b981" },
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
        <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={fmt}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {data.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── RateCard ─────────────────────────────────────────────────────────────────

function RateCard({
    label,
    rate,
    numerator,
    denominator,
    numeratorLabel,
    denominatorLabel,
    color,
}: {
    label: string;
    rate: string;
    numerator: number;
    denominator: number;
    numeratorLabel: string;
    denominatorLabel: string;
    color: string;
}) {
    const pctNum = denominator > 0 ? (numerator / denominator) * 100 : 0;
    const cappedPct = Math.min(pctNum, 100);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 space-y-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{rate}</p>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                        width: `${cappedPct}%`,
                        background: "linear-gradient(90deg, #e1306c, #833ab4)",
                    }}
                />
            </div>
            <div className="flex justify-between text-xs text-slate-600">
                <span>
                    {numeratorLabel}:{" "}
                    <span className="text-slate-400 font-semibold">{fmt(numerator)}</span>
                </span>
                <span>
                    {denominatorLabel}:{" "}
                    <span className="text-slate-400 font-semibold">{fmt(denominator)}</span>
                </span>
            </div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MetricsSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl h-24" />
                ))}
            </div>
        </div>
    );
}

// ─── InstagramMetricsSection ──────────────────────────────────────────────────

export default function InstagramMetricsSection({ post }: { post: PostDetail }) {
    const dispatch = useDispatch<AppDispatch>();
    const { distributionMetricsInstagram, loading } = useSelector(
        (s: RootState) => s.POST
    );

    // Find the latest Instagram distribution by sentAt
    const igDistribution =
        post.distributions
            ?.filter((d) => d.platform === "Instagram")
            .sort((a, b) => {
                const ta = a.sentAt ? new Date(a.sentAt).getTime() : 0;
                const tb = b.sentAt ? new Date(b.sentAt).getTime() : 0;
                return tb - ta;
            })[0] ?? null;

    useEffect(() => {
        dispatch(clearDistributionMetricsInstagram());
    }, []);

    useEffect(() => {
        if (igDistribution?.id) {
            dispatch(
                fetchDistributionMetricsInstagram({
                    postId: post.postId,
                    distributionId: igDistribution.id,
                })
            );
        }
    }, [igDistribution?.id, post.postId]);

    if (!igDistribution) return null;

    const m = distributionMetricsInstagram;
    const totalEngagement = m ? m.likes + m.comments + m.saves + m.shares : 0;
    const engagementRate = m ? pct(totalEngagement, m.reach) : "—";

    return (
        <section className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="w-1.5 h-6 bg-pink-500 rounded-full mr-3" />
                    Hiệu suất Instagram
                </h2>
                <div className="flex items-center gap-3">
                    {m?.fetchedAt && (
                        <span className="text-xs text-slate-600">
                            Cập nhật: {formatDateTime(m.fetchedAt)}
                        </span>
                    )}
                    {igDistribution.externalUrl && (
                        <a
                            href={igDistribution.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-pink-500/30 text-pink-400 hover:bg-pink-500/10 transition-all"
                        >
                            <RiInstagramLine />
                            Xem bài gốc
                            <MdOutlineOpenInNew className="text-xs" />
                        </a>
                    )}
                    <button
                        onClick={() =>
                            igDistribution.id &&
                            dispatch(
                                fetchDistributionMetricsInstagram({
                                    postId: post.postId,
                                    distributionId: igDistribution.id,
                                })
                            )
                        }
                        disabled={loading.fetchDistributionMetricsInstagram}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all disabled:opacity-50"
                    >
                        <MdOutlineRefresh
                            className={
                                loading.fetchDistributionMetricsInstagram ? "animate-spin" : ""
                            }
                        />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading.fetchDistributionMetricsInstagram && !m && <MetricsSkeleton />}

            {/* Metrics */}
            {m && (
                <div className="space-y-6">
                    {/* ── Row 1: KPI cards ── */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                        <StatCard
                            icon={<MdOutlinePeopleAlt />}
                            label="Reach"
                            value={fmt(m.reach)}
                            sub="Người tiếp cận"
                            color="text-violet-400"
                            borderColor="border-violet-500/20"
                        />
                        <StatCard
                            icon={<MdOutlineThumbUp />}
                            label="Lượt thích"
                            value={fmt(m.likes)}
                            color="text-pink-400"
                            borderColor="border-pink-500/20"
                        />
                        <StatCard
                            icon={<MdOutlineChatBubbleOutline />}
                            label="Bình luận"
                            value={fmt(m.comments)}
                            color="text-purple-400"
                            borderColor="border-purple-500/20"
                        />
                        <StatCard
                            icon={<MdOutlineBookmark />}
                            label="Lưu"
                            value={fmt(m.saves)}
                            sub="Bài đã lưu"
                            color="text-amber-400"
                            borderColor="border-amber-500/20"
                        />
                        <StatCard
                            icon={<MdOutlineShare />}
                            label="Chia sẻ"
                            value={fmt(m.shares)}
                            color="text-emerald-400"
                            borderColor="border-emerald-500/20"
                        />
                    </div>

                    {/* ── Row 2: Engagement breakdown chart ── */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Phân tích Engagement
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 pb-1 flex-wrap">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#e1306c] inline-block" />
                                Thích
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-violet-500 inline-block" />
                                Bình luận
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                                Lưu
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                                Chia sẻ
                            </span>
                        </div>
                        <EngagementBar
                            likes={m.likes}
                            comments={m.comments}
                            saves={m.saves}
                            shares={m.shares}
                        />
                    </div>

                    {/* ── Row 3: Engagement Rate ── */}
                    <RateCard
                        label="Engagement Rate"
                        rate={engagementRate}
                        numerator={totalEngagement}
                        denominator={m.reach}
                        numeratorLabel="Tổng tương tác"
                        denominatorLabel="Reach"
                        color="text-pink-400"
                    />

                    {/* ── Row 4: External link ── */}
                    {m.externalUrl && (
                        <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 rounded-2xl px-5 py-3">
                            <RiInstagramLine className="text-pink-400 text-lg shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 mb-0.5">Link bài Instagram</p>
                                <a
                                    href={m.externalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-pink-400 text-sm hover:underline truncate block"
                                >
                                    {m.externalUrl}
                                </a>
                            </div>
                            <a
                                href={m.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="shrink-0 p-2 rounded-xl border border-slate-700 text-slate-400 hover:border-pink-500/40 hover:text-pink-400 transition-all"
                            >
                                <MdOutlineOpenInNew />
                            </a>
                        </div>
                    )}
                </div>
            )}

            {!m && !loading.fetchDistributionMetricsInstagram && <EmptyStateInstagram />}
        </section>
    );
}