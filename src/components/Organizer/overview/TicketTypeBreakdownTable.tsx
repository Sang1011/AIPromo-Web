import type { TicketTypeBreakdown } from "../../../types/ticketing/ticketing";

interface TicketTypeBreakdownTableProps {
    breakdown: TicketTypeBreakdown[];
}

function formatCurrency(value: number): string {
    return value.toLocaleString("vi-VN") + " VND";
}

export default function TicketTypeBreakdownTable({ breakdown }: TicketTypeBreakdownTableProps) {
    if (!Array.isArray(breakdown) || breakdown.length === 0) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Theo loại vé</h3>
                <p className="text-sm text-slate-500">Không có dữ liệu.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Theo loại vé</h3>

            <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#0f0b1f] to-[#0b0816] overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1.4fr_1fr_1fr_1.2fr_1.6fr] px-6 py-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                    <div>Loại vé</div>
                    <div>Số lượng</div>
                    <div>Đã bán</div>
                    <div>Doanh thu</div>
                    <div>Tỉ lệ bán</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/5">
                    {breakdown.map((t) => {
                        const soldPercent =
                            t.totalQuantity === 0
                                ? 0
                                : Math.min(100, Math.round((t.quantitySold / t.totalQuantity) * 100));

                        return (
                            <div
                                key={t.ticketTypeId}
                                className="grid grid-cols-[1.4fr_1fr_1fr_1.2fr_1.6fr] px-6 py-4 items-center"
                            >
                                <div className="font-medium text-white">{t.ticketTypeName}</div>
                                <div className="text-slate-300">{t.totalQuantity.toLocaleString()}</div>

                                {/* sold + mini check-in badge */}
                                <div>
                                    <span className="text-slate-300">{t.quantitySold.toLocaleString()}</span>
                                </div>

                                <div className="text-slate-300 font-medium">{formatCurrency(t.revenue)}</div>

                                {/* Sold progress bar */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                            style={{ width: `${soldPercent}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400 w-9 text-right shrink-0">
                                        {soldPercent}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}