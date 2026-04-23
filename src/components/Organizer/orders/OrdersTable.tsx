import type { OrderItemOrganizer } from "../../../types/ticketing/ticketing";
import { BiSolidCoupon } from "react-icons/bi";
import { HiOutlineEye } from "react-icons/hi2";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    pending: { label: "Chờ xử lý", cls: "bg-amber-400/15 text-amber-300 border-amber-400/30" },
    paid: { label: "Hoàn thành", cls: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30" },
    cancelled: { label: "Đã huỷ", cls: "bg-rose-400/15 text-rose-300 border-rose-400/30" },
};

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
    orders: OrderItemOrganizer[];
    onViewDetail: (orderId: string) => void;
}

export default function OrdersTable({ orders, onViewDetail }: Props) {
    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 overflow-hidden">
            {/* Count */}
            <div className="px-6 py-4 text-sm text-slate-400">
                Có <span className="text-violet-400 font-semibold">{orders.length}</span> đơn hàng
            </div>

            {/* Header — 8 cols (thêm cột Actions) */}
            <div className="grid grid-cols-[1fr_1.1fr_1.5fr_1fr_1fr_1fr_1fr_auto] px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase border-t border-white/5">
                <div>Order ID</div>
                <div>Ngày tạo</div>
                <div>Người mua</div>
                <div>Giá gốc</div>
                <div>Giảm giá</div>
                <div>Thành tiền</div>
                <div>Trạng thái</div>
                <div className="w-16 text-center">Chi tiết</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
                {orders.length === 0 && (
                    <div className="px-6 py-10 text-center text-slate-500 text-sm">
                        Không có đơn hàng nào
                    </div>
                )}

                {orders.map((o) => {
                    const st = STATUS_MAP[o.status.toLowerCase()] ?? {
                        label: o.status,
                        cls: "bg-slate-500/15 text-slate-300 border-slate-500/30",
                    };

                    return (
                        <div
                            key={o.orderId}
                            className="grid grid-cols-[1fr_1.1fr_1.5fr_1fr_1fr_1fr_1fr_auto] px-6 py-4 items-center hover:bg-white/[0.03] transition"
                        >
                            {/* Order ID */}
                            <span
                                className="text-violet-400 font-mono text-xs truncate pr-2"
                                title={o.orderId}
                            >
                                {o.orderId.slice(0, 8)}…
                            </span>

                            {/* Date */}
                            <span className="text-sm text-slate-400">{fmtDate(o.createdAt)}</span>

                            {/* Buyer */}
                            <div>
                                <p className="text-white text-sm font-medium">{o.buyerName}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{o.buyerEmail}</p>
                            </div>

                            {/* Original price */}
                            <span className="text-sm text-slate-400">{fmt(o.originalPrice)}</span>

                            {/* Voucher / discount */}
                            {o.voucherCode && o.voucherCode.trim() ? (
                                <div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
                                        <BiSolidCoupon /> {o.voucherCode}
                                    </span>
                                    <p className="text-xs text-slate-500 mt-1">-{fmt(o.discountAmount)}</p>
                                </div>
                            ) : (
                                <span className="text-slate-600 text-sm">—</span>
                            )}

                            {/* Final price */}
                            <div>
                                <p className="text-white font-semibold text-sm">{fmt(o.totalPrice)}</p>
                                {o.discountAmount > 0 && (
                                    <p className="text-xs text-emerald-500 mt-0.5">
                                        Tiết kiệm {fmt(o.discountAmount)}
                                    </p>
                                )}
                            </div>

                            {/* Status badge */}
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium w-fit ${st.cls}`}>
                                {st.label}
                            </span>

                            {/* Detail button */}
                            <div className="w-16 flex justify-center">
                                <button
                                    onClick={() => onViewDetail(o.orderId)}
                                    title="Xem chi tiết"
                                    className="group flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-violet-500/20 hover:border-violet-500/40 text-slate-500 hover:text-violet-300 transition-all duration-200"
                                >
                                    <HiOutlineEye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}