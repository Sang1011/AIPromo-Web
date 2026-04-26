import { createPortal } from "react-dom";
import type { EventRevenueDetailData } from "../../../types/adminEvent/adminEventReport";

interface EventRevenueModalProps {
    isOpen: boolean;
    eventId: string | null;
    currentEventId: string | null;
    revenueDetail: EventRevenueDetailData | null;
    loading: boolean;
    error: string | null;
    eventTitle?: string;
    onClose: () => void;
}

function formatVND(amount: number) {
    return amount.toLocaleString("vi-VN") + "₫";
}

function formatPercent(value: number) {
    return `${(value * 1).toFixed(1)}%`;
}

export default function EventRevenueModal({
    isOpen,
    eventId,
    currentEventId,
    revenueDetail,
    loading,
    error,
    eventTitle,
    onClose,
}: EventRevenueModalProps) {
    if (!isOpen) return null;

    const isDataReady = !!revenueDetail && currentEventId === eventId;

    return createPortal(
        <div
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 md:p-8"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            {/* Modal Container */}
            <div
                className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden z-10
                           bg-[rgba(26,20,38,0.97)] backdrop-blur-[16px]
                           border border-[rgba(124,59,237,0.3)]
                           shadow-[0_0_40px_rgba(124,59,237,0.15),0_25px_50px_rgba(0,0,0,0.6)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(124,59,237,0.2)] flex items-center justify-center border border-[rgba(124,59,237,0.3)]">
                            <span className="material-symbols-outlined text-[#7c3bed]">analytics</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Báo cáo doanh thu chi tiết</h2>
                            <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">
                                {eventTitle ?? "Dữ liệu thời gian thực từ hệ thống"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors group"
                    >
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-white">close</span>
                    </button>
                </div>

                {/* ── Scrollable Content ──────────────────────────────── */}
                <div
                    className="flex-1 overflow-y-auto p-6 space-y-8"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#7c3bed transparent" }}
                >
                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-10 h-10 border-2 border-[#7c3bed] border-t-transparent rounded-full animate-spin" />
                            <span className="text-[#a592c8] text-sm">Đang tải dữ liệu doanh thu...</span>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-400 text-3xl">error</span>
                            </div>
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && !isDataReady && (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-500 text-3xl">bar_chart</span>
                            </div>
                            <p className="text-slate-400 text-sm">Không có dữ liệu doanh thu</p>
                        </div>
                    )}

                    {/* ── DATA ─────────────────────────────────────────── */}
                    {isDataReady && !loading && (() => {
                        const { overview, byTicketType, profit, refunds, discountCodes } = revenueDetail!;
                        return (
                            <>
                                {/* Overview: 5 stat cards */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <StatCard
                                        label="Tổng doanh thu (trước hoàn)"
                                        value={formatVND(overview.totalRevenueBeforeRefund)}
                                        valueClass="text-white"
                                    />
                                    <StatCard
                                        label="Vé đã bán"
                                        value={overview.totalTicketsSold.toLocaleString("vi-VN")}
                                        valueClass="text-white"
                                    />
                                    <StatCard
                                        label="Doanh thu thuần"
                                        value={formatVND(overview.netRevenue)}
                                        valueClass="text-[#d2bbff]"
                                    />
                                    <StatCard
                                        label="Đơn hoàn tiền"
                                        value={overview.refundOrderCount.toLocaleString("vi-VN")}
                                        valueClass="text-red-400"
                                    />
                                    <StatCard
                                        label="Tỷ lệ lấp đầy"
                                        value={formatPercent(overview.occupancyRate)}
                                        valueClass="text-emerald-400"
                                    />
                                </div>

                                {/* ── LEFT col-8: Ticket table + Discount | RIGHT col-4: Finance ── */}
                                <div className="grid lg:grid-cols-12 gap-6">

                                    {/* LEFT: Ticket Types + Discount Codes */}
                                    <div className="lg:col-span-8 space-y-6">

                                        {/* Ticket Types Table — always shown */}
                                        <div className="space-y-4">
                                            <SectionHeading icon="confirmation_number" title="Doanh thu theo loại vé" />
                                            <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-white/5 text-[10px] text-slate-500 uppercase font-bold">
                                                        <tr>
                                                            <th className="px-5 py-4">Loại vé</th>
                                                            <th className="px-4 py-4 text-right">Giá niêm yết</th>
                                                            <th className="px-4 py-4 text-right">Đã bán / Phát hành</th>
                                                            <th className="px-4 py-4 text-right">Doanh thu</th>
                                                            <th className="px-5 py-4 text-right">Đóng góp</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                                        {byTicketType.length > 0 ? byTicketType.map((t, i) => (
                                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                                <td className="px-5 py-4 font-semibold text-white">
                                                                    {t.ticketTypeName}
                                                                </td>
                                                                <td className="px-4 py-4 text-right">
                                                                    {formatVND(t.listedPrice)}
                                                                </td>
                                                                <td className="px-4 py-4 text-right font-medium text-white">
                                                                    {t.soldQuantity.toLocaleString("vi-VN")}
                                                                    <span className="text-[10px] text-slate-500 ml-1">
                                                                        / {t.issuedQuantity.toLocaleString("vi-VN")}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-4 text-right font-medium text-white">
                                                                    {formatVND(t.revenue)}
                                                                </td>
                                                                <td className="px-5 py-4 text-right">
                                                                    <span className={`text-[#d2bbff] font-bold text-xs px-2 py-1 rounded ${i === 0 ? "bg-[rgba(124,59,237,0.15)]" : "bg-white/5"}`}>
                                                                        {formatPercent(t.contributionRate)}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm italic">
                                                                    Chưa có dữ liệu loại vé
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Discount Codes Table — always shown */}
                                        <div className="space-y-4">
                                            <SectionHeading icon="sell" title="Hiệu quả mã giảm giá" />
                                            <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-white/5 text-[10px] text-slate-500 uppercase font-bold">
                                                        <tr>
                                                            <th className="px-5 py-4">Mã khuyến mãi</th>
                                                            <th className="px-4 py-4 text-center">Số lượt dùng</th>
                                                            <th className="px-5 py-4 text-right">Tổng tiền đã giảm</th>
                                                            <th className="px-5 py-4 text-right">Doanh thu sau giảm</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                                        {discountCodes.length > 0 ? discountCodes.map((d, i) => (
                                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                                <td className="px-5 py-4 font-mono text-[#d2bbff] font-bold tracking-wider">
                                                                    {d.code}
                                                                </td>
                                                                <td className="px-4 py-4 text-center font-bold text-white">
                                                                    {d.usageCount.toLocaleString("vi-VN")}
                                                                </td>
                                                                <td className="px-5 py-4 text-right text-red-400 font-medium">
                                                                    -{formatVND(d.totalDiscountAmount)}
                                                                </td>
                                                                <td className="px-5 py-4 text-right text-white font-bold">
                                                                    {formatVND(d.netRevenueAfterDiscount)}
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-sm italic">
                                                                    Chưa có dữ liệu mã giảm giá
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT: Financial cards */}
                                    <div className="lg:col-span-4 space-y-4">
                                        <SectionHeading icon="account_balance" title="Tài chính" />
                                        <div className="grid grid-cols-1 gap-4">
                                            <FinanceCard
                                                label="Lợi nhuận gộp"
                                                value={formatVND(profit.grossProfit)}
                                                borderColor="border-l-[#7c3bed]"
                                                valueClass="text-white"
                                            />
                                            <FinanceCard
                                                label="Biên lợi nhuận"
                                                value={formatPercent(profit.profitMargin)}
                                                borderColor="border-l-[#d2bbff]"
                                                valueClass="text-[#d2bbff]"
                                            />
                                            <FinanceCard
                                                label="Tổng hoàn tiền"
                                                value={formatVND(refunds.totalRefundAmount)}
                                                borderColor="border-l-red-400"
                                                valueClass="text-red-400"
                                            />
                                            <FinanceCard
                                                label="Tỷ lệ hoàn tiền"
                                                value={formatPercent(refunds.refundRate)}
                                                borderColor="border-l-orange-400"
                                                valueClass="text-orange-400"
                                            />
                                            <FinanceCard
                                                label="Doanh thu TB/Vé"
                                                value={formatVND(overview.averageRevenuePerTicket)}
                                                borderColor="border-l-emerald-400"
                                                valueClass="text-emerald-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>

                {/* ── Footer ─────────────────────────────────────────── */}
                <div className="p-5 border-t border-white/10 bg-white/5 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-white/10 hover:bg-white/5 transition-all text-slate-300"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function StatCard({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
    return (
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-[rgba(124,59,237,0.2)] transition-colors">
            <p className="text-[10px] font-bold text-slate-500 uppercase leading-tight mb-1">{label}</p>
            <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
        </div>
    );
}

function SectionHeading({ icon, title }: { icon: string; title: string }) {
    return (
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-[#7c3bed]">{icon}</span>
            {title}
        </h3>
    );
}

function FinanceCard({
    label,
    value,
    borderColor,
    valueClass,
}: {
    label: string;
    value: string;
    borderColor: string;
    valueClass: string;
}) {
    return (
        <div className={`bg-white/5 p-5 rounded-xl border border-white/5 border-l-4 ${borderColor}`}>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{label}</p>
            <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
        </div>
    );
}