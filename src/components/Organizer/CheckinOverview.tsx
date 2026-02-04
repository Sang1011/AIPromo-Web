import { FiUsers, FiLogOut } from "react-icons/fi";

interface CheckinOverviewProps {
    checkedIn: number;
    totalSold: number;
    inEvent: number;
    leftEvent: number;
}

export default function CheckinOverview({
    checkedIn,
    totalSold,
    inEvent,
    leftEvent,
}: CheckinOverviewProps) {
    const percent =
        totalSold === 0 ? 0 : Math.round((checkedIn / totalSold) * 100);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1fr] gap-6">
            {/* LEFT – Main card */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#1a1230] to-[#0d0a1c] border border-white/5 p-8 overflow-hidden">
                <p className="text-sm text-slate-400 mb-2">
                    Đã check-in
                </p>

                <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-white">
                        {checkedIn}
                    </span>
                    <span className="text-2xl font-semibold text-white">
                        vé
                    </span>
                </div>

                <p className="text-sm text-slate-500 mt-2">
                    Đã bán {totalSold} vé
                </p>

                {/* Circle progress */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <div className="relative w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-xl font-semibold">
                            {percent}%
                        </span>
                    </div>
                </div>
            </div>

            {/* RIGHT – Small cards */}
            <div className="flex flex-col gap-6">
                <div className="rounded-2xl bg-gradient-to-br from-[#1a1230] to-[#0d0a1c] border border-white/5 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <FiUsers />
                        </div>
                        <p className="text-sm text-slate-300">
                            Trong sự kiện
                        </p>
                    </div>

                    <span className="text-3xl font-bold text-white">
                        {inEvent}
                    </span>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-[#1a1230] to-[#0d0a1c] border border-white/5 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <FiLogOut />
                        </div>
                        <p className="text-sm text-slate-300">
                            Đã ra ngoài
                        </p>
                    </div>

                    <span className="text-3xl font-bold text-white">
                        {leftEvent}
                    </span>
                </div>
            </div>
        </div>
    );
}
