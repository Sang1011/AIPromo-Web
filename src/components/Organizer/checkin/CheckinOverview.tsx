import type { SummaryCheckIn } from "../../../types/ticketing/ticketing";

interface CheckinOverviewProps {
    summary: SummaryCheckIn;
}

function RadialProgress({ percent }: { percent: number }) {
    const radius = 48;
    const stroke = 7;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative w-28 h-28 flex items-center justify-center">
            <svg
                width={radius * 2}
                height={radius * 2}
                viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                className="-rotate-90"
            >
                {/* Track */}
                <circle
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    fill="none"
                    stroke="rgba(124,59,237,0.15)"
                    strokeWidth={stroke}
                />
                {/* Progress */}
                <circle
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    fill="none"
                    stroke="#7c3bed"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
            </svg>
            <span className="absolute text-white font-semibold text-base">
                {percent}%
            </span>
        </div>
    );
}

export default function CheckinOverview({ summary }: CheckinOverviewProps) {
    const {
        totalCheckedIn,
        totalSold,
        totalTicketQuantity,
        totalTicketTypes,
        checkInRate,
    } = summary;

    const percent = Math.round(checkInRate * 100) / 100;

    const statCards = [
        { label: "Tổng loại vé", value: totalTicketTypes },
        { label: "Tổng số lượng vé của sự kiện", value: totalTicketQuantity },
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1fr] gap-6">
            {/* LEFT – Main card */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#1a1230] to-[#0d0a1c] border border-white/5 p-8 overflow-hidden">
                <p className="text-sm text-slate-400 mb-2">Đã check-in</p>

                <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-white">
                        {totalCheckedIn}
                    </span>
                    <span className="text-2xl font-semibold text-white">vé</span>
                </div>

                <p className="text-sm text-slate-500 mt-2">
                    Đã bán{" "}
                    <span className="text-slate-400 font-medium">{totalSold}</span> vé
                </p>

                {/* Real radial progress */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <RadialProgress percent={percent} />
                    <p className="text-xs text-slate-500 text-center mt-1">
                        Tỉ lệ check-in
                    </p>
                </div>
            </div>

            {/* RIGHT – Stat cards */}
            <div className="flex flex-col gap-6">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-2xl bg-gradient-to-br from-[#1a1230] to-[#0d0a1c] border border-white/5 p-6 flex items-center justify-between"
                    >
                        <p className="text-sm text-slate-300">{card.label}</p>
                        <span className="text-3xl font-bold text-white">
                            {card.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}