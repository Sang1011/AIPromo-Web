import { FiAlertCircle, FiDollarSign, FiPercent, FiShoppingBag, FiTag, FiTrendingUp, FiUserCheck } from "react-icons/fi";
import type { SummaryOverview } from "../../../types/ticketing/ticketing";
import { fmtMoneyVND } from "../../../utils/fmtMoneyVND";

const PLATFORM_FEE_RATE = 0.15;

interface RevenueCardsProps {
    summary: SummaryOverview;
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
        netRevenue, // BE đã trừ khuyến mãi + hoàn tiền rồi
    } = summary;

    // Phí nền tảng 15% tính trên netRevenue BE trả về
    const platformFee = netRevenue * PLATFORM_FEE_RATE;
    const actualNetRevenue = netRevenue - platformFee;

    const discountRate = grossRevenue > 0 ? (totalDiscount / grossRevenue) * 100 : 0;

    return (
        <div className="space-y-4">
            {/* ── Platform fee notice ───────────────────────────────────── */}
            <div className="flex items-start gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3">
                <FiAlertCircle className="mt-0.5 shrink-0 text-orange-400" size={16} />
                <p className="text-sm text-orange-300/90 leading-relaxed">
                    <span className="font-semibold text-orange-300">Phí nền tảng 15%&nbsp;—&nbsp;</span>
                    Nền tảng sẽ khấu trừ 15% phí dịch vụ dựa trên tổng doanh thu sự kiện của bạn.
                    Doanh thu ròng hiển thị đã được tính sau khi trừ khuyến mãi, hoàn tiền và phí nền tảng.
                </p>
            </div>

            {/* ── Top row: 3 revenue cards ──────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gross revenue */}
                <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/30 flex items-center justify-center text-primary">
                            <FiTrendingUp size={16} />
                        </div>
                        <span className="text-xs text-primary/70 font-bold uppercase tracking-wider">Doanh thu gộp</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{fmtMoneyVND(grossRevenue)}</p>
                </div>

                {/* Discount */}
                <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/25 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                            <FiPercent size={16} />
                        </div>
                        <span className="text-xs text-amber-400/70 font-bold uppercase tracking-wider">Tổng giảm giá</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-300">{fmtMoneyVND(totalDiscount)}</p>
                    <p className="text-xs text-amber-400/50 mt-1">{discountRate.toFixed(1)}% so với doanh thu gộp</p>
                </div>

                {/* Actual net revenue (after discount + refund + platform fee) */}
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/30 p-5 ring-1 ring-emerald-500/10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <FiDollarSign size={16} />
                        </div>
                        <span className="text-xs text-emerald-400/70 font-bold uppercase tracking-wider">Doanh thu ròng</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-300">{fmtMoneyVND(actualNetRevenue)}</p>
                    <p className="text-xs text-emerald-400/50 mt-1">Sau khi trừ khuyến mãi, phí nền tảng, hoàn tiền</p>

                    {/* Platform fee breakdown line */}
                    <div className="mt-3 pt-3 border-t border-emerald-500/15 flex items-center justify-between">
                        <span className="text-xs text-orange-400/70">Phí nền tảng (15%)</span>
                        <span className="text-xs font-semibold text-orange-400">− {fmtMoneyVND(platformFee)} đồng</span>
                    </div>
                </div>
            </div>

            {/* ── Bottom row: 4 stat cards ──────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-card-dark border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <FiShoppingBag size={16} />
                    </div>
                    <div>
                        <p className="text-xs text-blue-400/70 font-bold">Đơn hàng</p>
                        <p className="text-xl font-bold text-white">{totalOrders.toLocaleString()}</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-card-dark border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                        <FiTag size={16} />
                    </div>
                    <div>
                        <p className="text-xs text-violet-400/70 font-bold">Vé đã bán</p>
                        <p className="text-xl font-bold text-white">{totalTicketsSold.toLocaleString()}</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-card-dark border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <FiUserCheck size={16} />
                    </div>
                    <div>
                        <p className="text-xs text-cyan-400/70 font-bold">Đã check-in</p>
                        <p className="text-xl font-bold text-white">{totalTicketsCheckedIn.toLocaleString()}</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-card-dark border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-5 flex items-center gap-4">
                    <RadialProgress percent={checkInRate} />
                    <div>
                        <p className="text-xs text-primary/90 font-bold">Tỉ lệ check-in</p>
                        <p className="text-xl font-bold text-white">{checkInRate.toFixed(1)}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}