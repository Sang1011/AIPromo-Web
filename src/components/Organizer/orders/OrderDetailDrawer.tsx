import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGetDetailOrder } from "../../../store/orderSlice";
import type { AppDispatch, RootState } from "../../../store";
import type { OrderItemOrganizer } from "../../../types/ticketing/ticketing";
import { BiSolidCoupon } from "react-icons/bi";
import {
    HiOutlineXMark,
    HiOutlineTicket,
    HiOutlineMapPin,
    HiOutlineCalendarDays,
    HiOutlineQrCode,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineXCircle,
} from "react-icons/hi2";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

// ── Status maps ───────────────────────────────────────────────────────────────
const ORDER_STATUS_MAP: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    pending: {
        label: "Chờ xử lý",
        cls: "bg-amber-400/15 text-amber-300 border-amber-400/30",
        icon: <HiOutlineClock className="w-3.5 h-3.5" />,
    },
    paid: {
        label: "Hoàn thành",
        cls: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
        icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" />,
    },
    cancelled: {
        label: "Đã huỷ",
        cls: "bg-rose-400/15 text-rose-300 border-rose-400/30",
        icon: <HiOutlineXCircle className="w-3.5 h-3.5" />,
    },
};

const TICKET_STATUS_MAP: Record<string, { label: string; cls: string }> = {
    active: { label: "Kích hoạt", cls: "bg-emerald-400/15 text-emerald-300" },
    used: { label: "Đã dùng", cls: "bg-slate-400/15 text-slate-400" },
    cancelled: { label: "Đã huỷ", cls: "bg-rose-400/15 text-rose-300" },
    pending: { label: "Chờ xử lý", cls: "bg-amber-400/15 text-amber-300" },
};

// ── Section label ─────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{title}</p>
            {children}
        </div>
    );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
            <span className="text-sm text-slate-500 shrink-0">{label}</span>
            <span className="text-sm text-white text-right">{value}</span>
        </div>
    );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
    orderId: string | null;           // null = closed
    listItem: OrderItemOrganizer | null;  // data từ list (để show ngay khi drawer mở, không cần chờ fetch)
    onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function OrderDetailDrawer({ orderId, listItem, onClose }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const { orderDetail } = useSelector((state: RootState) => state.ORDER);

    const overlayRef = useRef<HTMLDivElement>(null);

    // Fetch detail khi orderId thay đổi
    useEffect(() => {
        if (!orderId) return;
        dispatch(fetchGetDetailOrder(orderId));
    }, [orderId, dispatch]);

    // Đóng khi click ra ngoài
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    // Đóng khi nhấn Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const isOpen = !!orderId;

    // Merged data: ưu tiên detail (từ API) nếu đã load xong và đúng orderId
    const detail = orderDetail?.orderId === orderId ? orderDetail : null;

    // Status từ list (có ngay) hoặc từ detail (khi xong fetch)
    const status = listItem?.status ?? detail?.status ?? "";
    const orderSt = ORDER_STATUS_MAP[status.toLowerCase()] ?? {
        label: status,
        cls: "bg-slate-500/15 text-slate-300 border-slate-500/30",
        icon: null,
    };

    return (
        <>
            {/* Overlay */}
            <div
                ref={overlayRef}
                onClick={handleOverlayClick}
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full z-50 w-[480px] max-w-[95vw] flex flex-col bg-[#0e0a1f] border-l border-white/10 shadow-2xl shadow-black/60 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-white">Chi tiết đơn hàng</h2>
                        {listItem && (
                            <p className="text-xs text-slate-500 mt-0.5 font-mono">{listItem.orderId}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                    >
                        <HiOutlineXMark className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Body (scrollable) ── */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                    {/* ── 1. Thông tin người mua ── */}
                    <Section title="Người mua">
                        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-0">
                            <InfoRow label="Họ tên" value={listItem?.buyerName ?? "—"} />
                            <InfoRow label="Email" value={listItem?.buyerEmail ?? "—"} />
                            <InfoRow label="Ngày tạo đơn" value={listItem ? fmtDate(listItem.createdAt) : "—"} />
                        </div>
                    </Section>

                    {/* ── 2. Trạng thái + Sự kiện (từ detail) ── */}
                    <Section title="Sự kiện">
                        {detail ? (
                            <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                                {/* Banner */}
                                {detail.bannerUrl && (
                                    <img
                                        src={detail.bannerUrl}
                                        alt={detail.eventTitle}
                                        className="w-full h-28 object-cover opacity-80"
                                    />
                                )}
                                <div className="p-4 space-y-0">
                                    <InfoRow
                                        label="Tên sự kiện"
                                        value={<span className="font-semibold text-violet-300">{detail.eventTitle}</span>}
                                    />
                                    <InfoRow
                                        label="Địa điểm"
                                        value={
                                            <span className="flex items-center gap-1.5 justify-end">
                                                <HiOutlineMapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                {detail.location}
                                            </span>
                                        }
                                    />
                                    <InfoRow
                                        label="Thời gian"
                                        value={
                                            <span className="flex items-center gap-1.5 justify-end">
                                                <HiOutlineCalendarDays className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                {fmtDate(detail.eventStartAt)}
                                            </span>
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 flex items-center justify-center h-20">
                                <span className="text-xs text-slate-600 animate-pulse">Đang tải thông tin sự kiện…</span>
                            </div>
                        )}
                    </Section>

                    {/* ── 3. Thanh toán ── */}
                    <Section title="Thanh toán">
                        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-0">
                            <InfoRow label="Trạng thái" value={
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${orderSt.cls}`}>
                                    {orderSt.icon}{orderSt.label}
                                </span>
                            } />
                            <InfoRow label="Giá gốc" value={fmt(listItem?.originalPrice ?? 0)} />
                            {(listItem?.voucherCode && listItem.voucherCode.trim()) && (
                                <InfoRow label="Voucher" value={
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
                                        <BiSolidCoupon /> {listItem.voucherCode}
                                    </span>
                                } />
                            )}
                            {(listItem?.discountAmount ?? 0) > 0 && (
                                <InfoRow label="Giảm giá" value={
                                    <span className="text-emerald-400">-{fmt(listItem?.discountAmount ?? 0)}</span>
                                } />
                            )}
                            <InfoRow label="Thành tiền" value={
                                <span className="text-white font-bold text-base">{fmt(listItem?.totalPrice ?? 0)}</span>
                            } />
                        </div>
                    </Section>

                    {/* ── 4. Danh sách vé (từ detail) ── */}
                    <Section title={`Vé (${detail?.tickets?.length ?? "…"})`}>
                        {detail ? (
                            detail.tickets.length === 0 ? (
                                <p className="text-sm text-slate-600 text-center py-4">Không có vé nào</p>
                            ) : (
                                <div className="space-y-3">
                                    {detail.tickets.map((ticket) => {
                                        const tSt = TICKET_STATUS_MAP[ticket.status.toLowerCase()] ?? {
                                            label: ticket.status,
                                            cls: "bg-slate-500/15 text-slate-400",
                                        };
                                        return (
                                            <div
                                                key={ticket.ticketId}
                                                className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-3"
                                            >
                                                {/* Top row */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <HiOutlineTicket className="w-4 h-4 text-violet-400 shrink-0" />
                                                        <span className="text-sm font-semibold text-white">{ticket.ticketTypeName}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tSt.cls}`}>
                                                        {tSt.label}
                                                    </span>
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-0 pl-6">
                                                    <InfoRow label="Phiên" value={ticket.sessionTitle} />
                                                    <InfoRow label="Giờ bắt đầu" value={fmtDate(ticket.sessionStartTime)} />
                                                    {ticket.seatCode && (
                                                        <InfoRow label="Ghế" value={
                                                            <span className="font-mono text-violet-300">{ticket.seatCode}</span>
                                                        } />
                                                    )}
                                                    <InfoRow label="Giá" value={fmt(ticket.price)} />
                                                </div>

                                                {/* QR code */}
                                                {ticket.qrCode && (
                                                    <div className="pt-2 flex items-center gap-2 pl-6">
                                                        <HiOutlineQrCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                        <span
                                                            className="font-mono text-xs text-slate-500 truncate"
                                                            title={ticket.qrCode}
                                                        >
                                                            {ticket.qrCode.slice(0, 32)}…
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="rounded-xl bg-white/[0.03] border border-white/5 p-4 h-24 animate-pulse" />
                                ))}
                            </div>
                        )}
                    </Section>
                </div>
            </div>
        </>
    );
}