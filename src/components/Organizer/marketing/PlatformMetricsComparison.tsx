import { MdFacebook } from "react-icons/md";
import { RiInstagramLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import type { PostDetail } from "../../../types/post/post";

function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

interface MetricRow {
    label: string;
    fbValue: number | null;
    igValue: number | null;
    formatFn?: (n: number) => string;
    fbOnly?: boolean;
    igOnly?: boolean;
}

function ButterflyRow({ label, fbValue, igValue, maxValue, formatFn = fmt, fbOnly, igOnly }: MetricRow & { maxValue: number }) {
    const fbPct = fbValue != null && maxValue > 0 ? (fbValue / maxValue) * 100 : 0;
    const igPct = igValue != null && maxValue > 0 ? (igValue / maxValue) * 100 : 0;
    const fbWins = fbValue != null && igValue != null && fbValue > igValue;
    const igWins = fbValue != null && igValue != null && igValue > fbValue;

    return (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 py-2.5">
            {/* FB side */}
            <div className="flex items-center justify-end gap-2.5">
                <span className={`text-xs tabular-nums font-bold shrink-0 w-14 text-right ${igOnly ? "text-slate-700" : fbWins ? "text-blue-300" : "text-slate-400"}`}>
                    {fbValue != null ? formatFn(fbValue) : "—"}
                    {fbWins && <span className="ml-0.5 text-[9px] text-blue-400">▲</span>}
                </span>
                <div className="flex-1 h-5 flex items-center justify-end">
                    <div
                        className={`h-2 rounded-l-full transition-all duration-700 ${igOnly ? "opacity-10" : ""}`}
                        style={{
                            width: `${fbPct}%`,
                            background: igOnly ? "#475569" : fbWins
                                ? "linear-gradient(to left, #60a5fa, #1d4ed8)"
                                : "linear-gradient(to left, #3b82f680, #1d4ed850)",
                        }}
                    />
                </div>
            </div>

            {/* Center label */}
            <div className="w-24 text-center">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
            </div>

            {/* IG side */}
            <div className="flex items-center gap-2.5">
                <div className="flex-1 h-5 flex items-center">
                    <div
                        className={`h-2 rounded-r-full transition-all duration-700 ${fbOnly ? "opacity-10" : ""}`}
                        style={{
                            width: `${igPct}%`,
                            background: fbOnly ? "#475569" : igWins
                                ? "linear-gradient(to right, #f472b6, #be185d)"
                                : "linear-gradient(to right, #ec489980, #be185d50)",
                        }}
                    />
                </div>
                <span className={`text-xs tabular-nums font-bold shrink-0 w-14 ${fbOnly ? "text-slate-700" : igWins ? "text-pink-300" : "text-slate-400"}`}>
                    {igValue != null ? formatFn(igValue) : "—"}
                    {igWins && <span className="ml-0.5 text-[9px] text-pink-400">▲</span>}
                </span>
            </div>
        </div>
    );
}

function SectionLabel({ label }: { label: string }) {
    return (
        <div className="py-2 col-span-3">
            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[9px] font-black tracking-widest text-slate-700 uppercase">{label}</span>
                <div className="h-px flex-1 bg-slate-800" />
            </div>
        </div>
    );
}

function groupMax(rows: MetricRow[]): number {
    return Math.max(
        ...rows.flatMap(r => [r.fbValue, r.igValue]).filter((v): v is number => v != null),
        1
    );
}

export default function PlatformMetricsComparison({ post }: { post: PostDetail }) {
    const { distributionMetrics: fb, distributionMetricsInstagram: ig } = useSelector((s: RootState) => s.POST);

    const hasFbDist = post.distributions?.some(d => d.platform === "Facebook");
    const hasIgDist = post.distributions?.some(d => d.platform === "Instagram");
    if (!hasFbDist && !hasIgDist) return null;
    if (!fb && !ig) return null;

    const pctFmt = (n: number) => `${(n * 100).toFixed(2)}%`;

    const distributionRows: MetricRow[] = [
        { label: "Reach", fbValue: fb?.reach ?? null, igValue: ig?.reach ?? null },
        { label: "Clicks", fbValue: fb?.clicks ?? null, igValue: null, fbOnly: true },
    ];
    const engagementRows: MetricRow[] = [
        { label: "Thích", fbValue: fb?.likes ?? null, igValue: ig?.likes ?? null },
        { label: "Bình luận", fbValue: fb?.comments ?? null, igValue: ig?.comments ?? null },
        { label: "Chia sẻ", fbValue: fb?.shares ?? null, igValue: ig?.shares ?? null },
        { label: "Lưu bài", fbValue: null, igValue: ig?.saves ?? null, igOnly: true },
    ];
    const conversionRows: MetricRow[] = [
        { label: "Eng. Rate", fbValue: fb?.engagementRate ?? null, igValue: ig?.engagementRate ?? null, formatFn: pctFmt },
        { label: "CVR", fbValue: fb?.conversionRate ?? null, igValue: ig?.conversionRate ?? null, formatFn: pctFmt },
        { label: "Vé bán", fbValue: fb?.ticketsSold ?? null, igValue: ig?.ticketsSold ?? null },
    ];

    const fbEngagement = fb ? fb.likes + fb.comments + fb.shares : 0;
    const igEngagement = ig ? ig.likes + ig.comments + ig.saves + ig.shares : 0;
    const totalReach = (fb?.reach ?? 0) + (ig?.reach ?? 0);
    const totalTickets = (fb?.ticketsSold ?? 0) + (ig?.ticketsSold ?? 0);

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-pink-500 rounded-full" />
                <h2 className="text-lg font-bold text-white">So sánh nền tảng</h2>
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Facebook vs Instagram</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Platform headers */}
                <div className="grid grid-cols-[1fr_6rem_1fr] border-b border-slate-800 bg-slate-900/40">
                    <div className="px-5 py-3 flex items-center justify-end gap-2">
                        {fb
                            ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">Đã có data</span>
                            : <span className="text-[10px] text-slate-600">Chưa có data</span>
                        }
                        <MdFacebook className="text-blue-400 text-xl" />
                        <span className="text-sm font-black text-blue-400">Facebook</span>
                    </div>
                    <div />
                    <div className="px-5 py-3 flex items-center gap-2">
                        <RiInstagramLine className="text-pink-400 text-xl" />
                        <span className="text-sm font-black text-pink-400">Instagram</span>
                        {ig
                            ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400">Đã có data</span>
                            : <span className="text-[10px] text-slate-600">Chưa có data</span>
                        }
                    </div>
                </div>

                {/* Rows */}
                <div className="px-5">
                    <div className="grid grid-cols-[1fr_6rem_1fr]"><SectionLabel label="Phân phối" /></div>
                    {distributionRows.map(r => <ButterflyRow key={r.label} {...r} maxValue={groupMax(distributionRows)} />)}

                    <div className="grid grid-cols-[1fr_6rem_1fr]"><SectionLabel label="Tương tác" /></div>
                    {engagementRows.map(r => <ButterflyRow key={r.label} {...r} maxValue={groupMax(engagementRows)} />)}

                    <div className="grid grid-cols-[1fr_6rem_1fr]"><SectionLabel label="Chuyển đổi" /></div>
                    {conversionRows.map(r => <ButterflyRow key={r.label} {...r} maxValue={groupMax(conversionRows)} />)}
                </div>

                {/* Footer tổng */}
                {fb && ig && (
                    <div className="border-t border-slate-800 bg-slate-900/40 px-5 py-3 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tổng reach</p>
                            <p className="text-base font-black text-slate-300 tabular-nums mt-0.5">{fmt(totalReach)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tổng tương tác</p>
                            <p className="text-base font-black text-slate-300 tabular-nums mt-0.5">{fmt(fbEngagement + igEngagement)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tổng vé bán</p>
                            <p className="text-base font-black text-amber-400 tabular-nums mt-0.5">{fmt(totalTickets)}</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}