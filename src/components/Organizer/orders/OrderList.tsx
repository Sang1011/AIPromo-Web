import { useEffect, useMemo, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { HiOutlineAdjustmentsHorizontal, HiOutlineXMark } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { useEventTitle } from "../../../hooks/useEventTitle";
import type { AppDispatch, RootState } from "../../../store";
import { fetchExportExcelOrder } from "../../../store/orderSlice";
import { fetchOrdersByOrganizer } from "../../../store/ticketingSlice";
import type { MeInfo } from "../../../types/auth/auth";
import type { OrderItemOrganizer } from "../../../types/ticketing/ticketing";
import { downloadFileExcel } from "../../../utils/downloadFileExcel";
import { fmtMoneyVND } from "../../../utils/fmtMoneyVND";
import { getCurrentDateTime } from "../../../utils/getCurrentDateTime";
import { notify } from "../../../utils/notify";
import { saveReportToFirebase } from "../../../utils/saveReportToFirebase";
import Pagination from "../shared/Pagination";
import OrderDetailDrawer from "./OrderDetailDrawer";
import OrdersTable from "./OrdersTable";

// ── Icons (inline svg) ────────────────────────────────────────────────────────
const IconBox = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 0L12 11M4 7l8 4" /></svg>;
const IconMoney = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconTag = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const IconBan = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M5.636 5.636l12.728 12.728" /></svg>;
const IconSearch = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>;

// ── Summary card ──────────────────────────────────────────────────────────────
function SummaryCard({
    icon, label, value, accent, sub, badge,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    accent: string;
    sub?: string;
    badge?: { text: string; cls: string };
}) {
    return (
        <div className={`relative rounded-2xl border bg-gradient-to-br from-[#140f2a] to-[#0c0918] p-5 overflow-hidden ${accent}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">{label}</p>
                    <p className="text-xl font-bold text-white leading-tight truncate">{value}</p>
                    {sub && <p className="text-xs text-slate-500 mt-1.5">{sub}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                    <span className="opacity-40">{icon}</span>
                    {badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                            {badge.text}
                        </span>
                    )}
                </div>
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

    const { orders, pagination, loading, orderSummary } = useSelector((state: RootState) => state.TICKETING);
    const eventName = useEventTitle();
    const { currentInfor } = useSelector((s: RootState) => s.AUTH);
    // ── Search & filter state ─────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<TabKey>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Filter panel visibility
    const [showFilters, setShowFilters] = useState(false);

    // Date range filter (lọc createdAt)
    const [dateFrom, setDateFrom] = useState("");   // "YYYY-MM-DD"
    const [dateTo, setDateTo] = useState("");       // "YYYY-MM-DD"

    // Price range filter (lọc totalPrice)
    const [priceMin, setPriceMin] = useState("");   // raw numeric string, dùng để filter
    const [priceMax, setPriceMax] = useState("");
    const [priceMinDisplay, setPriceMinDisplay] = useState("");  // formatted display (dấu chấm)
    const [priceMaxDisplay, setPriceMaxDisplay] = useState("");

    // Format số có dấu chấm phân cách hàng nghìn
    const formatRaw = (num: string) => num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Drawer state
    const [drawerOrderId, setDrawerOrderId] = useState<string | null>(null);
    const [drawerListItem, setDrawerListItem] = useState<OrderItemOrganizer | null>(null);

    // ── Active filter count (badge) ───────────────────────────────────────
    const activeFilterCount = [
        dateFrom, dateTo, priceMin, priceMax,
    ].filter(Boolean).length;

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

    // ── Reset page khi đổi tab / search / filter ──────────────────────────
    useEffect(() => {
        setCurrentPage(1);
    }, [tab, search, dateFrom, dateTo, priceMin, priceMax]);

    // ── Client-side filter (search + date range + price range) ────────────
    const filtered = useMemo(() => {
        let result = orders;

        // Text search
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(o =>
                o.buyerName.toLowerCase().includes(q) ||
                o.buyerEmail.toLowerCase().includes(q)
            );
        }

        // Date from
        if (dateFrom) {
            const from = new Date(dateFrom).setHours(0, 0, 0, 0);
            result = result.filter(o => new Date(o.createdAt).getTime() >= from);
        }

        // Date to
        if (dateTo) {
            const to = new Date(dateTo).setHours(23, 59, 59, 999);
            result = result.filter(o => new Date(o.createdAt).getTime() <= to);
        }

        // Price min
        const minVal = priceMin ? Number(priceMin) : null;
        if (minVal !== null && !isNaN(minVal)) {
            result = result.filter(o => o.totalPrice >= minVal);
        }

        // Price max
        const maxVal = priceMax ? Number(priceMax) : null;
        if (maxVal !== null && !isNaN(maxVal)) {
            result = result.filter(o => o.totalPrice <= maxVal);
        }

        return result;
    }, [orders, search, dateFrom, dateTo, priceMin, priceMax]);

    const summary = useMemo(() => {
        const total = orderSummary?.totalOrders ?? 0;
        const cancelled = orderSummary?.cancelledOrders ?? 0;
        const netRevenue = orderSummary?.netRevenue ?? 0;
        const paidCount = total - cancelled;

        return {
            totalOrders: total,
            totalRevenue: netRevenue,
            grossRevenue: orderSummary?.grossRevenue ?? 0,
            totalDiscount: orderSummary?.totalDiscount ?? 0,
            cancelledOrders: cancelled,
            avgOrderValue: paidCount > 0 ? Math.round(netRevenue / paidCount) : 0,
            completionRate: total > 0 ? Math.round(paidCount / total * 100) : 0,
            cancelRate: total > 0 ? Math.round(cancelled / total * 100) : 0,
        };
    }, [orderSummary]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleViewDetail = (orderId: string) => {
        const item = orders.find(o => o.orderId === orderId) ?? null;
        setDrawerListItem(item);
        setDrawerOrderId(orderId);
    };

    const handleCloseDrawer = () => {
        setDrawerOrderId(null);
        setDrawerListItem(null);
    };

    const handleResetFilters = () => {
        setDateFrom("");
        setDateTo("");
        setPriceMin("");
        setPriceMax("");
        setPriceMinDisplay("");
        setPriceMaxDisplay("");
    };


    const handleExportExcel = async () => {
        if (!eventId) return notify.error("Không tìm thấy eventId");
        try {
            const blob = await dispatch(fetchExportExcelOrder(eventId)).unwrap();
            const { iso, formatted } = getCurrentDateTime();
            const fileName = `orders_${eventName}_${formatted}.xlsx`;
            downloadFileExcel(blob, fileName);
            const userId = (currentInfor as MeInfo)?.userId;
            const userName = (currentInfor as MeInfo)?.name;
            await saveReportToFirebase({
                eventId,
                eventName: eventName ?? eventId,
                fileName,
                createdBy: userName ?? "",
                createdAt: iso,
                userId: userId ?? "",
            });
            notify.success("Xuất Excel thành công");
        } catch {
            notify.error("Xuất Excel thất bại");
        }
    };

    return (
        <>
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
                        sub={`Hoàn thành: ${summary.totalOrders - summary.cancelledOrders} đơn`}
                    />
                    <SummaryCard
                        icon={<IconMoney />}
                        label="Doanh thu ròng"
                        value={fmtMoneyVND(summary.totalRevenue)}
                        accent="border-emerald-500/10"
                        sub={`Doanh thu gốc: ${fmtMoneyVND(summary.grossRevenue)}`}
                        badge={
                            summary.completionRate > 0
                                ? { text: `${summary.completionRate}% hoàn thành`, cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
                                : undefined
                        }
                    />
                    <SummaryCard
                        icon={<IconTag />}
                        label="Tổng giảm giá"
                        value={fmtMoneyVND(summary.totalDiscount)}
                        accent="border-violet-500/10"
                        sub={`TB: ${fmtMoneyVND(summary.avgOrderValue)}/đơn hoàn thành`}
                    />
                    <SummaryCard
                        icon={<IconBan />}
                        label="Đơn đã huỷ"
                        value={summary.cancelledOrders.toString()}
                        accent="border-rose-500/10"
                        sub={`Trên tổng ${summary.totalOrders} đơn`}
                        badge={
                            summary.cancelRate > 0
                                ? { text: `${summary.cancelRate}% tỉ lệ huỷ`, cls: "bg-rose-500/10 text-rose-400 border-rose-500/20" }
                                : undefined
                        }
                    />
                </div>

                {/* ── Search + Filter row ── */}
                <div className="flex items-center gap-4">
                    {/* Search */}
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

                    {/* Advanced filter toggle */}
                    <button
                        onClick={() => setShowFilters(v => !v)}
                        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${showFilters
                            ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                            }`}
                    >
                        <HiOutlineAdjustmentsHorizontal className="w-4 h-4" />
                        Lọc nâng cao
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

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

                {/* ── Advanced filter panel ── */}
                {showFilters && (
                    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                <HiOutlineAdjustmentsHorizontal className="w-4 h-4 text-violet-400" />
                                Lọc nâng cao
                            </p>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={handleResetFilters}
                                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
                                >
                                    <HiOutlineXMark className="w-3.5 h-3.5" />
                                    Xoá bộ lọc ({activeFilterCount})
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Date range */}
                            <div className="space-y-3">
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                    Khoảng thời gian tạo đơn
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 mb-1 block">Từ ngày</label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={e => setDateFrom(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-violet-500/50 transition [color-scheme:dark]"
                                        />
                                    </div>
                                    <span className="text-slate-600 mt-5">→</span>
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 mb-1 block">Đến ngày</label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            min={dateFrom || undefined}
                                            onChange={e => setDateTo(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-violet-500/50 transition [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Price range */}
                            <div className="space-y-3">
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                    Khoảng giá trị đơn hàng (VNĐ)
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 mb-1 block">Tối thiểu</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={priceMinDisplay}
                                            onChange={e => {
                                                const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                                                setPriceMin(raw);
                                                setPriceMinDisplay(raw ? formatRaw(raw) : "");
                                            }}
                                            placeholder="0"
                                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/50 transition"
                                        />
                                    </div>
                                    <span className="text-slate-600 mt-5">→</span>
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 mb-1 block">Tối đa</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={priceMaxDisplay}
                                            onChange={e => {
                                                const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                                                setPriceMax(raw);
                                                setPriceMaxDisplay(raw ? formatRaw(raw) : "");
                                            }}
                                            placeholder="∞"
                                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/50 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Table ── */}
                {loading ? (
                    <div className="text-center text-slate-500 py-10 text-sm">Đang tải...</div>
                ) : (
                    <OrdersTable orders={filtered} onViewDetail={handleViewDetail} />
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* ── Detail drawer (outside flow, full-screen overlay) ── */}
            <OrderDetailDrawer
                orderId={drawerOrderId}
                listItem={drawerListItem}
                onClose={handleCloseDrawer}
            />
        </>
    );
}