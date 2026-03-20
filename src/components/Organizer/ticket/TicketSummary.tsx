import type { TicketTypeItem } from "../../../types/ticketType/ticketType";

interface Props {
    quantities: Record<string, number>;
    ticketTypes: TicketTypeItem[];
}

export default function TicketSummary({ ticketTypes, quantities }: Props) {

    const total = ticketTypes.reduce((sum, ticket) => {
        const qty = quantities[ticket.id] ?? 0;
        return sum + qty * ticket.price;
    }, 0);

    return (
        <aside className="w-[320px] rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-4">
            <h3 className="text-white font-semibold">Tổng quan</h3>

            <div className="space-y-2 text-sm">
                {ticketTypes.map((ticket) => {
                    const qty = quantities[ticket.id] ?? 0;

                    if (qty === 0) return null;

                    return (
                        <div
                            key={ticket.id}
                            className="flex justify-between text-slate-300"
                        >
                            <span>{ticket.name}</span>
                            <span>{qty}</span>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between text-white font-semibold">
                <span>Tổng</span>
                <span>{total.toLocaleString()} VND</span>
            </div>
        </aside>
    );
}