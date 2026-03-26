// types/order.ts (inline)
interface OrderUser {
    id: string;
    name: string;
    email: string;
}

interface OrderVoucher {
    id: string;
    couponCode: string;
    type: "percentage" | "fixed";
    discountAmount: number;
}

export interface Order {
    id: string;
    status: "pending" | "completed" | "cancelled";
    totalPrice: number;
    discountAmount: number;
    finalPrice: number;
    createdAt: string;
    isActive: boolean;
    user: OrderUser;
    voucher: OrderVoucher | null;
}

// ── Mock data (replace with real API call later) ──────────────────────────────
export const mockOrders: Order[] = [
    {
        id: "07e9c3ff-63e8-458b-ad52-f6099cfcfe54",
        status: "cancelled",
        totalPrice: 3500000,
        discountAmount: 350000,
        finalPrice: 3150000,
        createdAt: "2026-03-22T05:05:00.482Z",
        isActive: true,
        user: { id: "429b82e1", name: "Nguyễn Văn A", email: "vana@example.com" },
        voucher: { id: "v1", couponCode: "SALE10", type: "percentage", discountAmount: 350000 },
    },
    {
        id: "08378818-9acf-411e-9a76-5a7e4af668bb",
        status: "completed",
        totalPrice: 14000000,
        discountAmount: 0,
        finalPrice: 14000000,
        createdAt: "2026-03-22T17:20:45.950Z",
        isActive: true,
        user: { id: "897b5288", name: "Trần Thị B", email: "thib@example.com" },
        voucher: null,
    },
    {
        id: "0ffc1c00-14bc-48a2-8cf7-3606dc4bfbfb",
        status: "pending",
        totalPrice: 2500000,
        discountAmount: 500000,
        finalPrice: 2000000,
        createdAt: "2026-03-22T04:27:53.067Z",
        isActive: true,
        user: { id: "429b82e1", name: "Lê Văn C", email: "levanc@example.com" },
        voucher: { id: "v2", couponCode: "FIXED500K", type: "fixed", discountAmount: 500000 },
    },
    {
        id: "1a387a90-5539-4769-b0f6-65e15deaa123",
        status: "completed",
        totalPrice: 7500000,
        discountAmount: 0,
        finalPrice: 7500000,
        createdAt: "2026-03-22T05:11:30.023Z",
        isActive: true,
        user: { id: "abc123", name: "Phạm Thị D", email: "phamd@example.com" },
        voucher: null,
    },
    {
        id: "3753e7d8-0acb-4ee1-b485-ae904a0ea456",
        status: "cancelled",
        totalPrice: 10000000,
        discountAmount: 1000000,
        finalPrice: 9000000,
        createdAt: "2026-03-22T04:38:43.412Z",
        isActive: false,
        user: { id: "def456", name: "Hoàng Văn E", email: "hoange@example.com" },
        voucher: { id: "v3", couponCode: "VIP10", type: "percentage", discountAmount: 1000000 },
    },
];

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

const STATUS_MAP = {
    pending: { label: "Chờ xử lý", cls: "bg-amber-400/15 text-amber-300 border-amber-400/30" },
    completed: { label: "Hoàn thành", cls: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30" },
    cancelled: { label: "Đã huỷ", cls: "bg-rose-400/15 text-rose-300 border-rose-400/30" },
} as const;

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
    orders: Order[];
}

export default function OrdersTable({ orders }: Props) {
    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 overflow-hidden">
            {/* Count */}
            <div className="px-6 py-4 text-sm text-slate-400">
                Có <span className="text-violet-400 font-semibold">{orders.length}</span> đơn hàng
            </div>

            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_1.1fr_1.5fr_1fr_1fr_1fr_72px] px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase border-t border-white/5">
                <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="peer sr-only" />
                    <span className="w-4 h-4 rounded-full border border-slate-600 bg-transparent peer-checked:bg-slate-600 transition" />
                </label>
                <div>Order ID</div>
                <div>Ngày tạo</div>
                <div>Người mua</div>
                <div>Tổng tiền</div>
                <div>Giảm giá</div>
                <div>Trạng thái</div>
                <div className="text-center">•••</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
                {orders.map((o) => {
                    const st = STATUS_MAP[o.status];
                    return (
                        <div
                            key={o.id}
                            className="grid grid-cols-[40px_1fr_1.1fr_1.5fr_1fr_1fr_1fr_72px] px-6 py-4 items-center hover:bg-white/[0.03] transition group"
                        >
                            {/* Checkbox */}
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" className="peer sr-only" />
                                <span className="w-4 h-4 rounded-full border border-slate-600 bg-transparent peer-checked:bg-violet-500 peer-checked:border-violet-500 transition" />
                            </label>

                            {/* Order ID — truncated */}
                            <span
                                className="text-violet-400 font-mono text-xs cursor-pointer hover:text-violet-300 transition truncate pr-2"
                                title={o.id}
                            >
                                {o.id.slice(0, 8)}…
                            </span>

                            {/* Date */}
                            <span className="text-sm text-slate-400">{fmtDate(o.createdAt)}</span>

                            {/* User */}
                            <div>
                                <p className="text-white text-sm font-medium">{o.user.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{o.user.email}</p>
                            </div>

                            {/* Total price / final price */}
                            <div>
                                <p className="text-white font-semibold text-sm">{fmt(o.finalPrice)}</p>
                                {o.discountAmount > 0 && (
                                    <p className="text-xs text-slate-500 line-through mt-0.5">{fmt(o.totalPrice)}</p>
                                )}
                            </div>

                            {/* Voucher / discount */}
                            {o.voucher ? (
                                <div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
                                        🎟 {o.voucher.couponCode}
                                    </span>
                                    <p className="text-xs text-slate-500 mt-1">-{fmt(o.discountAmount)}</p>
                                </div>
                            ) : (
                                <span className="text-slate-600 text-sm">—</span>
                            )}

                            {/* Status badge */}
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium w-fit ${st.cls}`}>
                                {st.label}
                            </span>

                            {/* Action */}
                            <div className="flex justify-center">
                                <button className="text-slate-600 hover:text-slate-300 transition text-lg leading-none">
                                    ···
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}