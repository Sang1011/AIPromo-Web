import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import OrdersTable from "./OrdersTable";
import Pagination from "../shared/Pagination";
import type { AppDispatch, RootState } from "../../../store";
import { fetchExportExcelOrder } from "../../../store/orderSlice";
import { notify } from "../../../utils/notify";
import { downloadFileExcel } from "../../../utils/downloadFileExcel";
import { fetchOrdersByOrganizer } from "../../../store/ticketingSlice";
import { FiDownload } from "react-icons/fi";
import { saveReportToFirebase } from "../../../utils/saveReportToFirebase";
import { fetchMe } from "../../../store/authSlice";
import type { ApiResponse } from "../../../types/api";
import type { MeInfo } from "../../../types/auth/auth";
import { useEventTitle } from "../../../hooks/useEventTitle";
import { getCurrentDateTime } from "../../../utils/getCurrentDateTime";

// ── Icons (inline svg) ────────────────────────────────────────────────────────
const IconBox = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 0L12 11M4 7l8 4" /></svg>;
const IconMoney = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconTag = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const IconBan = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M5.636 5.636l12.728 12.728" /></svg>;
const IconSearch = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>;

// ── Format helpers ────────────────────────────────────────────────────────────
const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

// ── Summary card ──────────────────────────────────────────────────────────────
function SummaryCard({
    icon, label, value, accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    accent: string;
}) {
    return (
        <div className={`relative rounded-2xl border bg-gradient-to-br from-[#140f2a] to-[#0c0918] p-5 overflow-hidden ${accent}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">{label}</p>
                    <p className="text-xl font-bold text-white leading-tight">{value}</p>
                </div>
                <span className="opacity-40">{icon}</span>
            </div>
        </div>
    );
}

// ── Status filter tabs ────────────────────────────────────────────────────────
const TABS = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xử lý" },
    { key: "paid", label: "Hoàn thành" },
    { key: "cancelled", label: "Đã huỷ" },
] as const;

type TabKey = typeof TABS[number]["key"];

// ── Props ─────────────────────────────────────────────────────────────────────
interface OrderListProps {
    eventId: string;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OrderList({ eventId }: OrderListProps) {
    const dispatch = useDispatch<AppDispatch>();

    const { orders, pagination, loading } = useSelector((state: RootState) => state.TICKETING);
    const eventName = useEventTitle();
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<TabKey>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // ── Fetch khi tab / page thay đổi ─────────────────────────────────────
    useEffect(() => {
        if (!eventId) return;
        dispatch(
            fetchOrdersByOrganizer({
                eventId,
                status: tab === "all" ? undefined : tab,
                pageNumber: currentPage,
                pageSize,
            })
        );
    }, [eventId, tab, currentPage]);

    // ── Reset page khi đổi tab hoặc search ───────────────────────────────
    useEffect(() => {
        setCurrentPage(1);
    }, [tab, search]);

    // ── Client-side search filter (trên trang hiện tại) ───────────────────
    const filtered = useMemo(() => {
        if (!search.trim()) return orders;
        const q = search.toLowerCase();
        return orders.filter(o =>
            o.buyerName.toLowerCase().includes(q) ||
            o.buyerEmail.toLowerCase().includes(q)
        );
    }, [orders, search]);

    // ── Summary (tính từ toàn bộ danh sách trang hiện tại) ────────────────
    const summary = useMemo(() => ({
        totalOrders: pagination.totalCount,
        totalRevenue: orders
            .filter(o => o.status.toLowerCase() === "paid")
            .reduce((s, o) => s + o.totalPrice, 0),
        totalDiscount: orders.reduce((s, o) => s + o.discountAmount, 0),
        cancelledOrders: orders.filter(o => o.status.toLowerCase() === "cancelled").length,
    }), [orders, pagination.totalCount]);

    const handleExportExcel = async () => {
        if (!eventId) return notify.error("Không tìm thấy eventId");
        try {
            const blob = await dispatch(fetchExportExcelOrder(eventId)).unwrap();
            const { iso, formatted } = getCurrentDateTime();
            const fileName = `orders_${eventName}_${formatted}.xlsx`;
            downloadFileExcel(blob, fileName);
            const meResult = await dispatch(fetchMe()).unwrap();
            const email = (meResult as ApiResponse<MeInfo>)?.data?.email;
            await saveReportToFirebase({
                eventId,
                eventName: eventName ?? eventId,
                fileName,
                createdBy: email ?? "",
                createdAt: iso
            });
            notify.success("Xuất Excel thành công");
        } catch (err) {
            notify.error("Xuất Excel thất bại");
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Page header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        Danh sách đơn hàng
                        <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/20">
                            Đơn hàng
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý và theo dõi đơn hàng của sự kiện</p>
                </div>

                <div className="flex gap-3">
                    <button
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-primary/30 transition"
                        onClick={handleExportExcel}
                    >
                        <FiDownload /> Xuất Excel
                    </button>
                </div>
            </div>

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-4 gap-4">
                <SummaryCard
                    icon={<IconBox />}
                    label="Tổng đơn hàng"
                    value={summary.totalOrders.toString()}
                    accent="border-white/5"
                />
                <SummaryCard
                    icon={<IconMoney />}
                    label="Doanh thu (hoàn thành)"
                    value={fmt(summary.totalRevenue)}
                    accent="border-emerald-500/10"
                />
                <SummaryCard
                    icon={<IconTag />}
                    label="Tổng giảm giá"
                    value={fmt(summary.totalDiscount)}
                    accent="border-violet-500/10"
                />
                <SummaryCard
                    icon={<IconBan />}
                    label="Đơn đã huỷ"
                    value={summary.cancelledOrders.toString()}
                    accent="border-rose-500/10"
                />
            </div>

            {/* ── Search + Filter ── */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <IconSearch />
                    </span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm theo tên, email..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500/50 transition"
                    />
                </div>

                {/* Status tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${tab === t.key
                                ? "bg-violet-600 text-white"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ── */}
            {loading ? (
                <div className="text-center text-slate-500 py-10 text-sm">Đang tải...</div>
            ) : (
                <OrdersTable orders={filtered} />
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}