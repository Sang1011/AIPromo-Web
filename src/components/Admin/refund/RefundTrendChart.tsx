
const barData = [
    { day: "T2", percent: 40, label: "15 yêu cầu", isToday: false },
    { day: "T3", percent: 65, label: "22 yêu cầu", isToday: false },
    { day: "T4", percent: 45, label: "18 yêu cầu", isToday: false },
    { day: "Hôm nay", percent: 90, label: "35 yêu cầu", isToday: true },
    { day: "T6", percent: 10, label: "", isToday: false },
    { day: "T7", percent: 10, label: "", isToday: false },
    { day: "CN", percent: 10, label: "", isToday: false },
];

const refundReasons = [
    { reason: "Thay đổi lịch trình", percent: 42, color: "bg-purple-500" },
    { reason: "Sự kiện bị hủy/dời", percent: 35, color: "bg-blue-500" },
    { reason: "Lỗi thanh toán trùng", percent: 15, color: "bg-yellow-500" },
    { reason: "Lý do khác", percent: 8, color: "bg-slate-600" },
];

export default function RefundTrendChart() {
    return (
        <div className="lg:col-span-2 bg-[#18122B]/70 backdrop-blur-md border border-purple-500/15 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-white mb-6">Biểu đồ xu hướng hoàn tiền (7 ngày qua)</h4>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
                {barData.map((bar) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
                        <div
                            className={`w-full rounded-t-md relative group-hover:opacity-80 transition-all ${
                                bar.isToday
                                    ? "bg-primary/20 border-x border-t border-primary/50"
                                    : "bg-purple-500/20"
                            }`}
                            style={{ height: `${bar.percent}%` }}
                        >
                            {bar.label && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {bar.label}
                                </div>
                            )}
                        </div>
                        <span className={`text-[10px] ${bar.isToday ? "font-bold text-purple-400" : "text-slate-500"}`}>
                            {bar.day}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function RefundReasons() {
    return (
        <div className="bg-[#18122B]/70 backdrop-blur-md border border-purple-500/15 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-white mb-6">Lý do hoàn tiền phổ biến</h4>
            <div className="space-y-4">
                {refundReasons.map((item) => (
                    <div key={item.reason} className="space-y-1">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">{item.reason}</span>
                            <span className="text-white font-bold">{item.percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#302447] rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                <p className="text-[11px] text-purple-400 font-bold uppercase tracking-tight mb-2">Ghi chú từ hệ thống</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                    Tỷ lệ yêu cầu hoàn tiền đang tăng nhẹ (2.1%) do ảnh hưởng của thời tiết cực đoan tại sự kiện Art Workshop #3.
                </p>
            </div>
        </div>
    );
}
