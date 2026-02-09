export default function RevenueCards() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Revenue */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1a1230] to-[#0d0a1c] border border-white/5 p-6 flex items-center justify-between">
                <div className="space-y-2">
                    <p className="text-sm text-slate-400">Doanh thu</p>
                    <p className="text-3xl font-bold text-white">
                        125.500.000đ
                    </p>
                    <p className="text-xs text-slate-500">
                        Mục tiêu: 167.000.000đ
                    </p>
                </div>

                {/* Progress */}
                <div className="relative w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center">
                    <span className="text-primary font-semibold">75%</span>
                </div>
            </div>

            {/* Tickets */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1a1230] to-[#0d0a1c] border border-white/5 p-6 flex items-center justify-between">
                <div className="space-y-2">
                    <p className="text-sm text-slate-400">Số vé đã bán</p>
                    <p className="text-3xl font-bold text-white">
                        450 <span className="text-slate-500 text-lg">/ 600 vé</span>
                    </p>
                    <p className="text-xs text-slate-500">
                        Còn lại: 150 vé
                    </p>
                </div>

                <div className="relative w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center">
                    <span className="text-primary font-semibold">75%</span>
                </div>
            </div>
        </div>
    );
}
