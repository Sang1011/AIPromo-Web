function SkeletonBox({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div
            className={`rounded-xl bg-white/5 animate-pulse ${className ?? ""}`}
            style={style}
        />
    );
}

function CheckinOverviewSkeleton() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1fr] gap-6">
            {/* LEFT */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#1a1230] to-[#0d0a1c] border border-white/5 p-8 overflow-hidden">
                <SkeletonBox className="h-3 w-24 mb-4" />
                <div className="flex items-end gap-2 mb-2">
                    <SkeletonBox className="h-12 w-20" />
                    <SkeletonBox className="h-7 w-8 mb-1" />
                </div>
                <SkeletonBox className="h-3 w-32" />

                <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                    <div className="w-[96px] h-[96px] rounded-full border-[7px] border-white/5 border-t-primary/20 animate-pulse" />
                    <SkeletonBox className="h-2.5 w-16" />
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-6">
                {[0, 1].map((i) => (
                    <div
                        key={i}
                        className="rounded-2xl bg-gradient-to-br from-[#1a1230] to-[#0d0a1c] border border-white/5 p-6 flex items-center justify-between"
                    >
                        <SkeletonBox className="h-3 w-28" />
                        <SkeletonBox className="h-8 w-10" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function TicketBarChartSkeleton() {
    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
            {/* Title */}
            <SkeletonBox className="h-5 w-32 mb-2" />
            <SkeletonBox className="h-3 w-64 mb-6" />

            {/* Bars */}
            <div className="flex items-end justify-around gap-3 h-52 px-4">
                {[65, 85, 45, 70, 55, 90, 40].map((h, i) => (
                    <div key={i} className="flex-1 flex items-end gap-0.5">
                        <div
                            className="flex-1 rounded-t-md bg-white/5 animate-pulse"
                            style={{ height: `${h}%` }}
                        />
                        <div
                            className="flex-1 rounded-t-md bg-primary/10 animate-pulse"
                            style={{ height: `${h * 0.6}%` }}
                        />
                        <div
                            className="flex-1 rounded-t-md bg-cyan-500/10 animate-pulse"
                            style={{ height: `${h * 0.35}%` }}
                        />
                    </div>
                ))}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-around px-4 mt-3 gap-3">
                {[48, 56, 40, 52, 44, 60, 36].map((w, i) => (
                    <SkeletonBox key={i} className="h-2.5 flex-1" style={{ maxWidth: `${w}px` }} />
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-5">
                {[72, 60, 80].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <SkeletonBox className="w-3 h-3 rounded-sm" />
                        <SkeletonBox className="h-2.5" style={{ width: w }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function TicketSummaryTableSkeleton() {
    return (
        <div className="space-y-4">
            <SkeletonBox className="h-5 w-20" />

            <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#0f0b1f] to-[#0b0816] overflow-hidden">
                <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr] px-6 py-4 gap-4">
                    {[100, 72, 72, 88, 96].map((w, i) => (
                        <SkeletonBox key={i} className="h-2.5" style={{ width: `${w}%` }} />
                    ))}
                </div>

                <div className="divide-y divide-white/5">
                    {[0, 1, 2].map((row) => (
                        <div
                            key={row}
                            className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr] px-6 py-5 items-center gap-4"
                        >
                            <SkeletonBox className="h-3 w-3/4" />
                            <SkeletonBox className="h-3 w-1/2" />
                            <SkeletonBox className="h-3 w-1/2" />
                            <SkeletonBox className="h-3 w-2/3" />
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden animate-pulse" />
                                <SkeletonBox className="h-2.5 w-8 shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function CheckInPageSkeleton() {
    return (
        <div className="space-y-6">
            {/* Session selector skeleton */}
            <div className="flex items-center gap-4">
                <SkeletonBox className="h-3 w-20" />
                <SkeletonBox className="h-10 w-64 rounded-xl" />
            </div>

            <CheckinOverviewSkeleton />
            <TicketBarChartSkeleton />
            <TicketSummaryTableSkeleton />
        </div>
    );
}