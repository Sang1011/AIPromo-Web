import type { TicketTypeItem } from "../../../types/ticketType/ticketType";

interface Props {
    ticketTypes: TicketTypeItem[];
}

export default function TicketTypeList({ ticketTypes }: Props) {
    const formatPrice = (price: number) =>
        price === 0 ? "FREE" : price.toLocaleString("vi-VN") + "đ";
    return (
        <div className="space-y-4">
            {ticketTypes.map((t) => (
                <div
                    key={t.id}
                    className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-5 flex items-center justify-between"
                >
                    <div>
                        <h4 className="text-white font-semibold">{t.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                            Đã bán: {t.soldQuantity} / {t.quantity}
                        </p>
                        <div className="mt-2 h-2 w-40 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{
                                    width: `${t.quantity > 0 ? (t.soldQuantity / t.quantity) * 100 : 0}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">{formatPrice(t.price)}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {t.remainingQuantity.toLocaleString("vi-VN")} còn lại
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}