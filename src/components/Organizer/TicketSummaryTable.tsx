const tickets = [
    { type: "FREE", price: "0đ", sold: "200 / 200", locked: 0, percent: 100 },
    { type: "Standard", price: "100.000đ", sold: "150 / 200", locked: 5, percent: 75 },
    { type: "VIP", price: "500.000đ", sold: "100 / 200", locked: 2, percent: 50 },
];

export default function TicketSummaryTable() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Chi tiết</h3>

            <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#0f0b1f] to-[#0b0816] overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1.4fr] px-6 py-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                    <div>Loại vé</div>
                    <div>Giá bán</div>
                    <div>Đã bán</div>
                    <div>Bị khoá</div>
                    <div>Tỉ lệ bán</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/5">
                    {tickets.map((t) => (
                        <div
                            key={t.type}
                            className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1.4fr] px-6 py-4 items-center"
                        >
                            <div className="font-medium text-white">
                                {t.type}
                            </div>
                            <div className="text-slate-300">{t.price}</div>
                            <div className="text-slate-300">{t.sold}</div>
                            <div className="text-slate-400">{t.locked}</div>

                            {/* Progress */}
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${t.percent}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
