interface Props {
    quantities: Record<string, number>;
}

export default function TicketSummary({ quantities }: Props) {
    const prices: Record<string, number> = {
        FREE: 0,
        "100k": 100_000,
        "200k": 200_000,
    };

    const total = Object.entries(quantities).reduce(
        (sum, [key, qty]) => sum + qty * prices[key],
        0
    );

    return (
        <aside className="w-[320px] rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-4">
            <h3 className="text-white font-semibold">Tổng quan</h3>

            <div className="space-y-2 text-sm">
                {Object.entries(quantities).map(([key, qty]) => (
                    <div key={key} className="flex justify-between text-slate-300">
                        <span>{key}</span>
                        <span>{qty}</span>
                    </div>
                ))}
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between text-white font-semibold">
                <span>Tổng</span>
                <span>{total.toLocaleString()}đ</span>
            </div>
        </aside>
    );
}
