interface Props {
    quantities: Record<string, number>;
    onChange: (key: string, delta: number) => void;
}

const ticketTypes = [
    { key: "FREE", label: "FREE", price: 0 },
    { key: "100k", label: "100k", price: 100_000 },
    { key: "200k", label: "200k", price: 200_000 },
];

export default function TicketTypeList({ quantities, onChange }: Props) {
    return (
        <div className="space-y-4">
            {ticketTypes.map((t) => (
                <div
                    key={t.key}
                    className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-5 flex items-center justify-between"
                >
                    <div>
                        <h4 className="text-white font-semibold">{t.label}</h4>
                        <p className="text-xs text-slate-400">
                            Đang trống: 10 vé
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onChange(t.key, -1)}
                            className="w-8 h-8 rounded-lg bg-white/5 text-white"
                        >
                            –
                        </button>

                        <span className="w-6 text-center text-white">
                            {quantities[t.key]}
                        </span>

                        <button
                            onClick={() => onChange(t.key, 1)}
                            className="w-8 h-8 rounded-lg bg-primary text-white"
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
