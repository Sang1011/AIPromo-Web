import { useEffect } from "react";
import {
    MdOutlineRefresh, MdOutlineOpenInNew, MdOutlineVisibility,
    MdOutlineThumbUp, MdOutlineChatBubbleOutline, MdOutlineRepeat,
    MdOutlineFormatQuote, MdOutlineShare, MdOutlineTrendingUp,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { clearDistributionMetricsThreads, fetchDistributionMetricsThreads } from "../../../store/postSlice";
import type { PostDetail } from "../../../types/post/post";
import { formatDateTime } from "../../../utils/formatDateTime";
import { EmptyStateThreads } from "../shared/EmtyState";

function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

// Threads logo SVG (không có trong react-icons)
const ThreadsIcon = () => (
    <svg viewBox="0 0 192 192" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.372-39.134 15.265-38.105 34.569.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z" />
    </svg>
);

function StatCard({ icon, label, value, sub, color = "text-slate-300", borderColor = "border-slate-700" }: {
    icon: React.ReactNode; label: string; value: string | number;
    sub?: string; color?: string; borderColor?: string;
}) {
    return (
        <div className={`bg-slate-900/60 border ${borderColor} rounded-2xl px-5 py-4 flex flex-col gap-2`}>
            <div className={`${color} text-xl`}>{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                <p className={`text-2xl font-black ${color} mt-0.5 tabular-nums`}>{value}</p>
                {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] font-black tracking-widest text-slate-600 uppercase">{label}</span>
            <div className="h-px flex-1 bg-slate-800" />
        </div>
    );
}

function MetricsSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl h-24" />
                ))}
            </div>
        </div>
    );
}

export default function ThreadsMetricsSection({ post }: { post: PostDetail }) {
    const dispatch = useDispatch<AppDispatch>();
    const { distributionMetricsThreads: m, loading } = useSelector((s: RootState) => s.POST);

    const threadsDistribution = post.distributions?.find(d => d.platform === "Threads") ?? null;

    useEffect(() => { dispatch(clearDistributionMetricsThreads()); }, []);

    useEffect(() => {
        if (threadsDistribution?.id) {
            dispatch(fetchDistributionMetricsThreads({ postId: post.postId, distributionId: threadsDistribution.id }));
        }
    }, [threadsDistribution?.id, post.postId]);

    if (!threadsDistribution) return null;

    const totalEngagement = m ? m.likes + m.replies + m.reposts + m.quotes + m.shares : 0;

    return (
        <section className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                    <span className="w-1.5 h-6 bg-slate-300 rounded-full" />
                    <ThreadsIcon />
                    Hiệu suất Threads
                </h2>
                <div className="flex items-center gap-2.5 flex-wrap">
                    {m?.fetchedAt && (
                        <span className="text-xs text-slate-600">Cập nhật: {formatDateTime(m.fetchedAt)}</span>
                    )}
                    {(threadsDistribution.externalUrl || m?.externalUrl) && (
                        <a
                            href={threadsDistribution.externalUrl ?? m?.externalUrl ?? "#"}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-600 text-slate-300 hover:bg-slate-700/30 transition-all"
                        >
                            Xem bài gốc <MdOutlineOpenInNew className="text-xs" />
                        </a>
                    )}
                    <button
                        onClick={() => threadsDistribution.id && dispatch(fetchDistributionMetricsThreads({ postId: post.postId, distributionId: threadsDistribution.id }))}
                        disabled={loading.fetchDistributionMetricsThreads}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all disabled:opacity-50"
                    >
                        <MdOutlineRefresh className={loading.fetchDistributionMetricsThreads ? "animate-spin" : ""} />
                        Làm mới
                    </button>
                </div>
            </div>

            {loading.fetchDistributionMetricsThreads && !m && <MetricsSkeleton />}

            {
                m && (
                    <div className="space-y-5">
                        <SectionDivider label="Phân phối" />
                        <div className="grid grid-cols-1 gap-3">
                            <StatCard icon={<MdOutlineVisibility />} label="Lượt xem" value={fmt(m.views)} sub="Tổng views bài viết" color="text-slate-200" borderColor="border-slate-700" />
                        </div>

                        <SectionDivider label="Tương tác" />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <StatCard icon={<MdOutlineThumbUp />} label="Lượt thích" value={fmt(m.likes)} color="text-rose-400" borderColor="border-rose-500/20" />
                            <StatCard icon={<MdOutlineChatBubbleOutline />} label="Replies" value={fmt(m.replies)} color="text-sky-400" borderColor="border-sky-500/20" />
                            <StatCard icon={<MdOutlineRepeat />} label="Reposts" value={fmt(m.reposts)} color="text-emerald-400" borderColor="border-emerald-500/20" />
                            <StatCard icon={<MdOutlineFormatQuote />} label="Quotes" value={fmt(m.quotes)} color="text-violet-400" borderColor="border-violet-500/20" />
                            <StatCard icon={<MdOutlineShare />} label="Chia sẻ" value={fmt(m.shares)} color="text-amber-400" borderColor="border-amber-500/20" />
                            <StatCard icon={<MdOutlineTrendingUp />} label="Tổng tương tác" value={fmt(totalEngagement)} color="text-slate-200" borderColor="border-slate-600" />
                        </div>

                        <SectionDivider label="Tỷ lệ hiệu suất" />
                        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl px-5 py-4 space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engagement Rate</p>
                            <p className="text-3xl font-black text-white tabular-nums">{m.engagementRateFormatted}</p>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${Math.min(m.engagementRate, 100)}%`,
                                        background: "linear-gradient(90deg, #94a3b8, #e2e8f0)"
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>Tổng tương tác: <span className="text-slate-400 font-semibold">{fmt(totalEngagement)}</span></span>
                                <span>Views: <span className="text-slate-400 font-semibold">{fmt(m.views)}</span></span>
                            </div>
                        </div>

                        {m.externalUrl && (
                            <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 rounded-2xl px-5 py-3">
                                <ThreadsIcon />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500 mb-0.5">Link bài Threads</p>
                                    <a href={m.externalUrl} target="_blank" rel="noreferrer"
                                        className="text-slate-300 text-sm hover:underline truncate block">{m.externalUrl}</a>
                                </div>
                                <a href={m.externalUrl} target="_blank" rel="noreferrer"
                                    className="shrink-0 p-2 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all">
                                    <MdOutlineOpenInNew />
                                </a>
                            </div>
                        )}
                    </div>
                )
            }

            {!m && !loading.fetchDistributionMetricsThreads && <EmptyStateThreads />}
        </section >
    );
}