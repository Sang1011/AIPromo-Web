import type { TicketTypeItem } from "../../../types/ticketType/ticketType";

interface Props {
    quantities: Record<string, number>;
    onChange: (key: string, delta: number) => void;
    ticketTypes: TicketTypeItem[];
}

export default function TicketTypeList({ quantities, onChange, ticketTypes }: Props) {
    return (
        <div className="space-y-4">
            {ticketTypes.map((t) => {
                const value = quantities[t.id] ?? 0;
                const remain = t.quantity - t.soldQuantity;

                return (
                    <div
                        key={t.id}
                        className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-5 flex items-center justify-between"
                    >
                        <div>
                            <h4 className="text-white font-semibold">{t.name}</h4>

                            <p className="text-xs text-slate-400">
                                {t.soldQuantity} / {t.quantity}
                            </p>

                            <div className="mt-2 h-2 w-40 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{
                                        width: `${(value / t.quantity) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                disabled={value <= 0}
                                onClick={() => onChange(t.id, -1)}
                                className="w-8 h-8 rounded-lg bg-white/5 text-white disabled:opacity-30"
                            >
                                –
                            </button>

                            <input
                                type="number"
                                value={value}
                                min={0}
                                max={remain}
                                onChange={(e) => {
                                    const num = Number(e.target.value);
                                    if (Number.isNaN(num)) return;

                                    const safe = Math.min(remain, Math.max(0, num));
                                    onChange(t.id, safe - value);
                                }}
                                className="w-16 px-0 text-center bg-white/5 rounded-lg text-white py-1"
                            />

                            <button
                                disabled={value >= remain}
                                onClick={() => onChange(t.id, 1)}
                                className="w-8 h-8 rounded-lg bg-primary text-white disabled:opacity-30"
                            >
                                +
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}