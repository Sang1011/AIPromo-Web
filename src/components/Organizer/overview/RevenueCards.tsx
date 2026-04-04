import { FiDollarSign, FiPercent, FiShoppingBag, FiTag, FiTrendingUp, FiUserCheck } from "react-icons/fi";
import type { SummaryOverview } from "../../../types/ticketing/ticketing";

interface RevenueCardsProps {
    summary: SummaryOverview;
}

function formatCurrency(value: number): string {
    return value.toLocaleString("vi-VN") + " VND";
}

function RadialProgress({ percent }: { percent: number }) {
    const radius = 28;
    const stroke = 4;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const offset = circumference - (Math.min(100, percent) / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-16 h-16">
            <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`} className="-rotate-90">
                <circle cx={radius} cy={radius} r={normalizedRadius} fill="none" stroke="rgba(124,59,237,0.15)" strokeWidth={stroke} />
                <circle
                    cx={radius} cy={radius} r={normalizedRadius}
                    fill="none" stroke="#7c3bed" strokeWidth={stroke}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
            </svg>
            <span className="absolute text-[11px] font-semibold text-white">{Math.round(percent)}%</span>
        </div>
    );
}

export default function RevenueCards({ summary }: RevenueCardsProps) {
    const {
        totalOrders,
        totalTicketsSold,
        totalTicketsCheckedIn,
        checkInRate,
        grossRevenue,
        totalDiscount,
        netRevenue,
    } = summary;

    const discountRate = grossRevenue > 0 ? (totalDiscount / grossRevenue) * 100 : 0;

    return (
        <div className="space-y-4">
            {/* Top row: 3 revenue cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gross revenue */}
                <div className="rounded-2xl bg-card-dark border border-border-dark p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <FiTrendingUp size={16} />
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Doanh thu gộp</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(grossRevenue)}</p>
                </div>

                {/* Discount */}
                <div className="rounded-2xl bg-card-dark border border-border-dark p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <FiPercent size={16} />
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tổng giảm giá</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(totalDiscount)}</p>
                    <p className="text-xs text-slate-500 mt-1">{discountRate.toFixed(1)}% so với doanh thu gộp</p>
                </div>

                {/* Net revenue */}
                <div className="rounded-2xl  bg-card-dark border border-primary/40 p-5 ring-1 ring-primary/10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/30 flex items-center justify-center text-primary">
                            <FiDollarSign size={16} />
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Doanh thu ròng</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(netRevenue)}</p>
                    <p className="text-xs text-slate-500 mt-1">Sau khi trừ khuyến mãi</p>
                </div>
            </div>

            {/* Bottom row: 4 stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total orders */}
                <div className="rounded-2xl  bg-card-dark border border-border-dark p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <FiShoppingBag size={16} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Đơn hàng</p>
                        <p className="text-xl font-bold text-white">{totalOrders.toLocaleString()}</p>
                    </div>
                </div>

                {/* Tickets sold */}
                <div className="rounded-2xl  bg-card-dark border border-border-dark p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <FiTag size={16} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Vé đã bán</p>
                        <p className="text-xl font-bold text-white">{totalTicketsSold.toLocaleString()}</p>
                    </div>
                </div>

                {/* Checked in */}
                <div className="rounded-2xl  bg-card-dark border border-border-dark p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <FiUserCheck size={16} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Đã check-in</p>
                        <p className="text-xl font-bold text-white">{totalTicketsCheckedIn.toLocaleString()}</p>
                    </div>
                </div>

                {/* Check-in rate */}
                <div className="rounded-2xl  bg-card-dark border border-border-dark p-5 flex items-center gap-4">
                    <RadialProgress percent={checkInRate} />
                    <div>
                        <p className="text-xs text-slate-400">Tỉ lệ check-in</p>
                        <p className="text-xl font-bold text-white">{checkInRate.toFixed(1)}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}