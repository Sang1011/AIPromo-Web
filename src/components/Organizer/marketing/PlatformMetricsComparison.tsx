import { MdFacebook } from "react-icons/md";
import { RiInstagramLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import type { PostDetail } from "../../../types/post/post";
import React from "react";

function fmt(n: number | null | undefined): string {
    if (n == null) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

const ThreadsIcon = () => (
    <svg viewBox="0 0 192 192" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.372-39.134 15.265-38.105 34.569.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z" />
    </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

type CellValue = string;

interface TableRow {
    label: string;
    fb: CellValue;
    ig: CellValue;
    th: CellValue;
    section?: string;
}

function f(n: number | null | undefined): string {
    return fmt(n);
}

function pct(n: number | null | undefined): string {
    return n != null ? `${(n * 100).toFixed(2)}%` : "—";
}

function winner(fb: number | null | undefined, ig: number | null | undefined, th: number | null | undefined) {
    const vals = [
        { key: "fb", v: fb ?? -Infinity },
        { key: "ig", v: ig ?? -Infinity },
        { key: "th", v: th ?? -Infinity },
    ];
    const max = Math.max(...vals.map(x => x.v));
    if (max <= 0) return null;
    return vals.find(x => x.v === max)?.key ?? null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
    return (
        <tr>
            <td colSpan={4} className="pt-4 pb-1 px-4">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-800" />
                    <span className="text-[9px] font-black tracking-widest text-slate-700 uppercase">{label}</span>
                    <div className="h-px flex-1 bg-slate-800" />
                </div>
            </td>
        </tr>
    );
}

function DataRow({ row, win }: { row: TableRow; win: string | null }) {
    return (
        <tr className="hover:bg-white/[0.02] transition group">
            <td className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {row.label}
            </td>
            <td className={`py-2.5 px-4 text-center text-sm tabular-nums font-bold transition
                ${row.fb === "—" ? "text-slate-700" : win === "fb" ? "text-blue-300" : "text-slate-400"}`}>
                {row.fb}
                {win === "fb" && row.fb !== "—" && <span className="ml-1 text-[9px] text-blue-400">▲</span>}
            </td>
            <td className={`py-2.5 px-4 text-center text-sm tabular-nums font-bold transition
                ${row.ig === "—" ? "text-slate-700" : win === "ig" ? "text-pink-300" : "text-slate-400"}`}>
                {row.ig}
                {win === "ig" && row.ig !== "—" && <span className="ml-1 text-[9px] text-pink-400">▲</span>}
            </td>
            <td className={`py-2.5 px-4 text-center text-sm tabular-nums font-bold transition
                ${row.th === "—" ? "text-slate-700" : win === "th" ? "text-slate-200" : "text-slate-400"}`}>
                {row.th}
                {win === "th" && row.th !== "—" && <span className="ml-1 text-[9px] text-slate-400">▲</span>}
            </td>
        </tr>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PlatformMetricsComparison({ post }: { post: PostDetail }) {
    const {
        distributionMetrics: fb,
        distributionMetricsInstagram: ig,
        distributionMetricsThreads: th,
    } = useSelector((s: RootState) => s.POST);

    const hasFb = post.distributions?.some(d => d.platform === "Facebook");
    const hasIg = post.distributions?.some(d => d.platform === "Instagram");
    const hasTh = post.distributions?.some(d => d.platform === "Threads");

    if (!hasFb && !hasIg && !hasTh) return null;
    if (!fb && !ig && !th) return null;

    // Repost Rate value for Threads
    const thRepostRate = (th?.views ?? 0) > 0
        ? (th!.reposts ?? 0) / th!.views
        : null;

    // ── Rows ──────────────────────────────────────────────────────────────
    const rows: TableRow[] = [
        // Phân phối
        {
            section: "Phân phối",
            label: "Reach / Views",
            fb: f(fb?.reach),
            ig: f(ig?.reach),
            th: f(th?.views),
        },
        { label: "Clicks", fb: f(fb?.clicks), ig: "—", th: "—" },

        // Tương tác
        {
            section: "Tương tác",
            label: "Thích",
            fb: f(fb?.likes),
            ig: f(ig?.likes),
            th: f(th?.likes),
        },
        {
            label: "Bình luận / Replies",
            fb: f(fb?.comments),
            ig: f(ig?.comments),
            th: f(th?.replies),
        },
        { label: "Chia sẻ", fb: f(fb?.shares), ig: f(ig?.shares), th: f(th?.shares) },
        { label: "Lưu bài (saves)", fb: "—", ig: f(ig?.saves), th: "—" },
        { label: "Reposts", fb: "—", ig: "—", th: f(th?.reposts) },
        { label: "Quotes", fb: "—", ig: "—", th: f(th?.quotes) },

        // Chuyển đổi
        {
            section: "Chuyển đổi",
            label: "Eng. Rate",
            fb: pct(fb?.engagementRate),
            ig: pct(ig?.engagementRate),
            th: th?.engagementRateFormatted ?? "—",
        },
        {
            label: "CVR",
            fb: pct(fb?.conversionRate),
            ig: pct(ig?.conversionRate),
            th: th?.conversionRateFormatted ?? "—",
        },
        {
            label: "Repost Rate",
            fb: "—",
            ig: "—",
            th: thRepostRate != null ? `${(thRepostRate * 100).toFixed(2)}%` : "—",
        },
        {
            label: "Vé bán",
            fb: f(fb?.ticketsSold),
            ig: f(ig?.ticketsSold),
            th: f(th?.ticketsSold),
        },
    ];

    // ── Raw values for winner calc ─────────────────────────────────────────
    const rawByLabel: Record<string, { fb: number | null; ig: number | null; th: number | null }> = {
        "Reach / Views": { fb: fb?.reach ?? null, ig: ig?.reach ?? null, th: th?.views ?? null },
        "Clicks": { fb: fb?.clicks ?? null, ig: null, th: null },
        "Thích": { fb: fb?.likes ?? null, ig: ig?.likes ?? null, th: th?.likes ?? null },
        "Bình luận / Replies": { fb: fb?.comments ?? null, ig: ig?.comments ?? null, th: th?.replies ?? null },
        "Chia sẻ": { fb: fb?.shares ?? null, ig: ig?.shares ?? null, th: th?.shares ?? null },
        "Lưu bài (saves)": { fb: null, ig: ig?.saves ?? null, th: null },
        "Reposts": { fb: null, ig: null, th: th?.reposts ?? null },
        "Quotes": { fb: null, ig: null, th: th?.quotes ?? null },
        "Eng. Rate": { fb: fb?.engagementRate ?? null, ig: ig?.engagementRate ?? null, th: th?.engagementRate ?? null },
        "CVR": { fb: fb?.conversionRate ?? null, ig: ig?.conversionRate ?? null, th: th?.conversionRate ?? null },
        "Repost Rate": { fb: null, ig: null, th: thRepostRate },
        "Vé bán": { fb: fb?.ticketsSold ?? null, ig: ig?.ticketsSold ?? null, th: th?.ticketsSold ?? null },
    };

    // ── Footer totals ─────────────────────────────────────────────────────
    const totalReach = (fb?.reach ?? 0) + (ig?.reach ?? 0) + (th?.views ?? 0);
    const totalEngagement =
        (fb ? (fb.likes ?? 0) + (fb.comments ?? 0) + (fb.shares ?? 0) : 0)
        + (ig ? (ig.likes ?? 0) + (ig.comments ?? 0) + (ig.saves ?? 0) + (ig.shares ?? 0) : 0)
        + (th ? (th.likes ?? 0) + (th.replies ?? 0) + (th.reposts ?? 0) + (th.quotes ?? 0) + (th.shares ?? 0) : 0);
    const totalTickets = (fb?.ticketsSold ?? 0) + (ig?.ticketsSold ?? 0) + (th?.ticketsSold ?? 0);

    return (
        <section className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 via-pink-500 to-slate-400 rounded-full" />
                <h2 className="text-lg font-bold text-white">So sánh nền tảng</h2>
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                    Facebook · Instagram · Threads
                </span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Platform header row */}
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-slate-800 bg-slate-900/40">
                    <div className="px-4 py-3" />
                    <div className="px-4 py-3 flex items-center justify-center gap-1.5">
                        <MdFacebook className="text-blue-400 text-lg" />
                        <span className="text-xs font-black text-blue-400">Facebook</span>
                        {fb
                            ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 ml-1">✓</span>
                            : <span className="text-[9px] text-slate-700 ml-1">—</span>
                        }
                    </div>
                    <div className="px-4 py-3 flex items-center justify-center gap-1.5">
                        <RiInstagramLine className="text-pink-400 text-lg" />
                        <span className="text-xs font-black text-pink-400">Instagram</span>
                        {ig
                            ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-pink-500/15 text-pink-400 ml-1">✓</span>
                            : <span className="text-[9px] text-slate-700 ml-1">—</span>
                        }
                    </div>
                    <div className="px-4 py-3 flex items-center justify-center gap-1.5 text-slate-300">
                        <ThreadsIcon />
                        <span className="text-xs font-black text-slate-300">Threads</span>
                        {th
                            ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-500/15 text-slate-400 ml-1">✓</span>
                            : <span className="text-[9px] text-slate-700 ml-1">—</span>
                        }
                    </div>
                </div>

                {/* Table — key trên Fragment để fix warning */}
                <table className="w-full">
                    <tbody>
                        {rows.map((row, i) => {
                            const raw = rawByLabel[row.label];
                            const win = raw ? winner(raw.fb, raw.ig, raw.th) : null;
                            return (
                                <React.Fragment key={`fragment-${row.label}-${i}`}>
                                    {row.section && <SectionDivider label={row.section} />}
                                    <DataRow row={row} win={win} />
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="border-t border-slate-800 bg-slate-900/40 px-5 py-3 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tổng reach / views</p>
                        <p className="text-base font-black text-slate-300 tabular-nums mt-0.5">{fmt(totalReach)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tổng tương tác</p>
                        <p className="text-base font-black text-slate-300 tabular-nums mt-0.5">{fmt(totalEngagement)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tổng vé bán</p>
                        <p className="text-base font-black text-amber-400 tabular-nums mt-0.5">{fmt(totalTickets)}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}