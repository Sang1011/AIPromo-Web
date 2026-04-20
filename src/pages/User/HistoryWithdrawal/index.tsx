import React, { useEffect, useState, useCallback } from "react";
import withdrawalService from "../../../services/withdrawalService";

// ── Types ──────────────────────────────────────────────────────────
export type WithdrawalStatus = "Pending" | "Approved" | "Rejected" | "Completed" | "Cancelled" | "Failed";

export interface WithdrawalItem {
    id: string;
    amount: number;
    receiverName: string | null;
    bankAccountNumber: string;
    bankName: string;
    status: WithdrawalStatus;
    createdAt: string;
    processedAt: string | null;
}

export interface WithdrawalDetail extends WithdrawalItem {
    notes: string;
    adminNote: string | null;
}

export interface GetMeWithdrawalParams {
    PageNumber?: number;
    PageSize?: number;
    SortColumn?: string;
    SortOrder?: "asc" | "desc";
    Status?: string;
}

export interface WithdrawalListResponse {
    items: WithdrawalItem[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    currentPageSize: number;
    currentStartIndex: number;
    currentEndIndex: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────
const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatFullDate = (iso: string) =>
    new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const formatShortDate = (iso: string) =>
    new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

// ── Status config ──────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
    Pending: {
        label: "Chờ xử lý",
        color: "#fbbf24",
        bg: "rgba(251,191,36,0.10)",
        border: "rgba(251,191,36,0.2)",
        icon: "schedule",
    },
    Approved: {
        label: "Đã duyệt",
        color: "#60a5fa",
        bg: "rgba(96,165,250,0.10)",
        border: "rgba(96,165,250,0.2)",
        icon: "verified",
    },
    Completed: {
        label: "Thành công",
        color: "#4ade80",
        bg: "rgba(74,222,128,0.10)",
        border: "rgba(74,222,128,0.2)",
        icon: "check_circle",
    },
    Rejected: {
        label: "Từ chối",
        color: "#f87171",
        bg: "rgba(248,113,113,0.10)",
        border: "rgba(248,113,113,0.2)",
        icon: "cancel",
    },
    Cancelled: {
        label: "Đã huỷ",
        color: "#94a3b8",
        bg: "rgba(148,163,184,0.10)",
        border: "rgba(148,163,184,0.2)",
        icon: "do_not_disturb_on",
    },
    Failed: {
        label: "Thất bại",
        color: "#fb923c",
        bg: "rgba(251,146,60,0.10)",
        border: "rgba(251,146,60,0.2)",
        icon: "error",
    },
};

const getStatusCfg = (status: string) =>
    statusConfig[status] ?? {
        label: status,
        color: "#94a3b8",
        bg: "rgba(148,163,184,0.10)",
        border: "rgba(148,163,184,0.2)",
        icon: "info",
    };

// ── Sub-components ─────────────────────────────────────────────────

const SummaryCard: React.FC<{
    icon: string;
    label: string;
    value: string;
    sub?: string;
    accentColor?: string;
}> = ({ icon, label, value, sub, accentColor = "#793bed" }) => (
    <div
        className="rounded-2xl p-5 border border-white/5 relative overflow-hidden"
        style={{ background: "rgba(24,18,43,0.85)", backdropFilter: "blur(12px)" }}
    >
        <div
            className="absolute -top-4 -right-4 w-20 h-20 rounded-full pointer-events-none"
            style={{ background: `${accentColor}22`, filter: "blur(24px)" }}
        />
        <div className="flex items-start gap-4 relative z-10">
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${accentColor}22` }}
            >
                <span className="material-symbols-outlined text-[20px]" style={{ color: accentColor }}>
                    {icon}
                </span>
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
                <p className="text-xl font-bold text-white tracking-tight leading-none">{value}</p>
                {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
            </div>
        </div>
    </div>
);

const FilterTab: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
    count?: number;
}> = ({ label, active, onClick, count }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
        style={{
            background: active ? "rgba(121,59,237,0.25)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${active ? "rgba(121,59,237,0.5)" : "rgba(255,255,255,0.07)"}`,
            color: active ? "#a78bfa" : "#64748b",
        }}
    >
        {label}
        {count !== undefined && (
            <span
                className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                style={{
                    background: active ? "rgba(121,59,237,0.4)" : "rgba(255,255,255,0.06)",
                    color: active ? "#c4b5fd" : "#475569",
                }}
            >
                {count}
            </span>
        )}
    </button>
);

const PaginationBtn: React.FC<{
    icon: string;
    disabled: boolean;
    onClick: () => void;
}> = ({ icon, disabled, onClick }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
        style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: disabled ? "#334155" : "#64748b",
            cursor: disabled ? "not-allowed" : "pointer",
        }}
    >
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
    </button>
);

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(121,59,237,0.10)", border: "1px solid rgba(121,59,237,0.15)" }}
        >
            <span className="material-symbols-outlined text-3xl" style={{ color: "#793bed" }}>
                savings
            </span>
        </div>
        <p className="text-slate-400 font-semibold mb-1">Không có yêu cầu rút tiền</p>
        <p className="text-slate-600 text-xs">Thử thay đổi bộ lọc để xem kết quả khác</p>
    </div>
);

const SkeletonRow: React.FC = () => (
    <div className="hidden md:grid px-6 py-4 items-center gap-4 animate-pulse"
        style={{ gridTemplateColumns: "36px 1fr 140px 120px 160px 32px" }}>
        <div className="w-9 h-9 rounded-xl bg-white/5" />
        <div className="space-y-2 pl-3">
            <div className="h-3 w-48 rounded bg-white/5" />
            <div className="h-2.5 w-24 rounded bg-white/[0.03]" />
        </div>
        <div className="h-3 w-24 rounded bg-white/5" />
        <div className="h-6 w-24 rounded-lg bg-white/5" />
        <div className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-white/5" />
            <div className="h-2.5 w-16 rounded bg-white/[0.03]" />
        </div>
        <div />
    </div>
);

// ── Detail Modal ───────────────────────────────────────────────────
const DetailModal: React.FC<{
    detail: WithdrawalDetail | null;
    loading: boolean;
    onClose: () => void;
}> = ({ detail, loading, onClose }) => {
    if (!detail && !loading) return null;

    const cfg = detail ? getStatusCfg(detail.status) : null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-lg rounded-2xl border border-white/5 overflow-hidden"
                style={{
                    background: "#18122B",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(121,59,237,0.1)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(121,59,237,0.15)" }}
                        >
                            <span className="material-symbols-outlined text-[20px]" style={{ color: "#a78bfa" }}>
                                receipt_long
                            </span>
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-base leading-tight">Chi tiết yêu cầu</h2>
                            <p className="text-slate-500 text-[11px]">Thông tin chi tiết yêu cầu rút tiền</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                        style={{ color: "#64748b" }}
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-3">
                            <span
                                className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin"
                                style={{ display: "inline-block" }}
                            />
                            <p className="text-slate-500 text-xs">Đang tải...</p>
                        </div>
                    </div>
                ) : detail ? (
                    <div className="px-6 py-5 space-y-5">
                        {/* Status banner */}
                        <div
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                            style={{ background: cfg!.bg, borderColor: cfg!.border }}
                        >
                            <span className="material-symbols-outlined text-[20px]" style={{ color: cfg!.color }}>
                                {cfg!.icon}
                            </span>
                            <div>
                                <p className="text-xs font-bold" style={{ color: cfg!.color }}>{cfg!.label}</p>
                                {detail.processedAt && (
                                    <p className="text-[11px] text-slate-500">
                                        Xử lý lúc: {formatFullDate(detail.processedAt)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Admin note (if rejected) */}
                        {detail.adminNote && (
                            <div
                                className="flex items-start gap-3 px-4 py-3 rounded-xl border"
                                style={{ background: "rgba(248,113,113,0.06)", borderColor: "rgba(248,113,113,0.2)" }}
                            >
                                <span className="material-symbols-outlined text-[18px] mt-0.5" style={{ color: "#f87171" }}>
                                    info
                                </span>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Lý do từ chối</p>
                                    <p className="text-sm text-slate-300">{detail.adminNote}</p>
                                </div>
                            </div>
                        )}

                        {/* Amount */}
                        <div
                            className="flex items-center justify-between px-4 py-4 rounded-xl border border-white/5"
                            style={{ background: "rgba(255,255,255,0.02)" }}
                        >
                            <span className="text-slate-400 text-sm">Số tiền rút</span>
                            <span className="text-2xl font-bold" style={{ color: "#f87171" }}>
                                -{formatVND(detail.amount)}
                            </span>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Ngân hàng" value={detail.bankName} />
                            <DetailItem label="Số tài khoản" value={detail.bankAccountNumber} mono />
                            {detail.receiverName && (
                                <DetailItem label="Tên chủ tài khoản" value={detail.receiverName} />
                            )}
                            <DetailItem label="Ngày tạo" value={formatFullDate(detail.createdAt)} />
                            <DetailItem
                                label="Mã yêu cầu"
                                value={`#${detail.id.slice(0, 8).toUpperCase()}`}
                                mono
                            />
                        </div>

                        {detail.notes && (
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Ghi chú</p>
                                <div
                                    className="px-4 py-3 rounded-xl border border-white/5 text-sm text-slate-400"
                                    style={{ background: "rgba(255,255,255,0.02)" }}
                                >
                                    {detail.notes}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#64748b",
                        }}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{
    label: string;
    value: string;
    mono?: boolean;
    color?: string;
}> = ({ label, value, mono, color }) => (
    <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</p>
        <p
            className={`text-sm font-medium break-all ${mono ? "font-mono" : ""}`}
            style={{ color: color ?? "#e2e8f0" }}
        >
            {value}
        </p>
    </div>
);

// ── Main Component ─────────────────────────────────────────────────
type StatusFilter = "All" | WithdrawalStatus;

const PAGE_SIZE = 10;

const HistoryWithdrawal: React.FC = () => {
    const [data, setData] = useState<WithdrawalListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [page, setPage] = useState(1);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<WithdrawalDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const params: GetMeWithdrawalParams = {
                PageNumber: page,
                PageSize: PAGE_SIZE,
                SortColumn: "CreatedAt",
                SortOrder: "desc",
                ...(statusFilter !== "All" && { Status: statusFilter }),
            };
            const res = await withdrawalService.GetWithdrawalme(params);
            setData(res.data.data);
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    const fetchDetail = useCallback(async (id: string) => {
        setDetailLoading(true);
        setDetail(null);
        try {
            const res = await withdrawalService.GetWithdrawalmeDetail(id);
            setDetail(res.data.data);
        } catch {
            setDetail(null);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    const handleRowClick = (id: string) => {
        setSelectedId(id);
        fetchDetail(id);
    };

    const handleCloseDetail = () => {
        setSelectedId(null);
        setDetail(null);
    };

    // ── Summary stats from data ────────────────────────────────────
    // For accurate counts per status, you'd need separate count API calls.
    // Here we derive from current page items as approximation.
    const items = data?.items ?? [];
    const totalCount = data?.totalCount ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const completedCount = items.filter((i) => i.status === "Completed").length;
    const pendingCount = items.filter((i) => i.status === "Pending" || i.status === "Approved").length;
    const rejectedCount = items.filter((i) => i.status === "Rejected" || i.status === "Cancelled" || i.status === "Failed").length;

    const STATUS_TABS: { key: StatusFilter; label: string }[] = [
        { key: "All", label: "Tất cả" },
        { key: "Pending", label: "Chờ xử lý" },
        { key: "Approved", label: "Đã duyệt" },
        { key: "Completed", label: "Thành công" },
        { key: "Rejected", label: "Từ chối" },
        { key: "Cancelled", label: "Đã huỷ" },
        { key: "Failed", label: "Thất bại" },
    ];

    return (
        <div className="px-6 pb-16 pt-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="max-w-5xl mx-auto">

                {/* ── Page Header ──────────────────────────────────── */}
                <section
                    className="mb-8 relative overflow-hidden rounded-2xl p-8 md:p-10 border border-white/5"
                    style={{ background: "#18122B" }}
                >
                    <div
                        className="absolute top-0 right-0 w-80 h-64 rounded-full pointer-events-none"
                        style={{ background: "rgba(96,165,250,0.08)", filter: "blur(80px)" }}
                    />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: "rgba(96,165,250,0.15)" }}
                                >
                                    <span className="material-symbols-outlined text-[22px]" style={{ color: "#60a5fa" }}>
                                        savings
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-none">
                                        Lịch sử rút tiền
                                    </h1>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Toàn bộ các yêu cầu rút tiền của bạn
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats chip */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div
                                className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/5 shrink-0"
                                style={{ background: "rgba(255,255,255,0.03)" }}
                            >
                                <span className="material-symbols-outlined text-[20px]" style={{ color: "#60a5fa" }}>
                                    account_balance
                                </span>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Tổng yêu cầu</p>
                                    <p className="text-white font-bold text-lg leading-none">{totalCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Summary Cards ─────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <SummaryCard
                        icon="savings"
                        label="Tổng yêu cầu"
                        value={totalCount.toString()}
                        sub="tất cả thời gian"
                        accentColor="#793bed"
                    />
                    <SummaryCard
                        icon="schedule"
                        label="Đang chờ"
                        value={pendingCount.toString()}
                        sub="cần xử lý"
                        accentColor="#fbbf24"
                    />
                    <SummaryCard
                        icon="check_circle"
                        label="Thành công"
                        value={completedCount.toString()}
                        sub="đã hoàn thành"
                        accentColor="#4ade80"
                    />
                    <SummaryCard
                        icon="cancel"
                        label="Từ chối"
                        value={rejectedCount.toString()}
                        sub="không được duyệt"
                        accentColor="#f87171"
                    />
                </div>

                {/* ── Table ─────────────────────────────────────── */}
                <div
                    className="rounded-2xl border border-white/5 overflow-hidden"
                    style={{ background: "rgba(24,18,43,0.85)", backdropFilter: "blur(12px)" }}
                >
                    {/* Toolbar */}
                    <div className="px-6 py-5 border-b border-white/5">
                        <div className="flex flex-wrap gap-2">
                            {STATUS_TABS.map((tab) => (
                                <FilterTab
                                    key={tab.key}
                                    label={tab.label}
                                    active={statusFilter === tab.key}
                                    onClick={() => setStatusFilter(tab.key)}
                                    count={tab.key === "All" ? totalCount : undefined}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Table header */}
                    <div
                        className="hidden md:grid px-6 py-3 border-b border-white/5"
                        style={{
                            gridTemplateColumns: "36px 1fr 160px 120px 160px 32px",
                            background: "rgba(255,255,255,0.02)",
                        }}
                    >
                        {["", "Ngân hàng", "Số tiền", "Trạng thái", "Thời gian", ""].map((h, i) => (
                            <span key={i} className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/[0.04]">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : items.length === 0 ? (
                            <EmptyState />
                        ) : (
                            items.map((item) => {
                                const cfg = getStatusCfg(item.status);
                                const isSelected = selectedId === item.id;

                                return (
                                    <React.Fragment key={item.id}>
                                        {/* Desktop row */}
                                        <div
                                            className="hidden md:grid px-6 py-4 items-center hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                            style={{
                                                gridTemplateColumns: "36px 1fr 160px 120px 160px 32px",
                                                background: isSelected ? "rgba(121,59,237,0.05)" : undefined,
                                            }}
                                            onClick={() => handleRowClick(item.id)}
                                        >
                                            {/* Icon */}
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ background: "rgba(96,165,250,0.10)" }}
                                            >
                                                <span className="material-symbols-outlined text-[18px]" style={{ color: "#60a5fa" }}>
                                                    savings
                                                </span>
                                            </div>

                                            {/* Bank info */}
                                            <div className="min-w-0 pl-3">
                                                <p className="text-white text-sm font-medium">
                                                    {item.bankName}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-slate-600 text-[11px] font-mono">
                                                        {item.bankAccountNumber}
                                                    </p>
                                                    {item.receiverName && (
                                                        <>
                                                            <span className="text-slate-700 text-[10px]">•</span>
                                                            <p className="text-slate-600 text-[11px] truncate">{item.receiverName}</p>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="text-slate-700 text-[10px] font-mono mt-0.5">
                                                    #{item.id.slice(0, 8).toUpperCase()}
                                                </p>
                                            </div>

                                            {/* Amount */}
                                            <div>
                                                <span className="text-sm font-bold tabular-nums" style={{ color: "#f87171" }}>
                                                    -{formatVND(item.amount)}
                                                </span>
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                                                    style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                                                >
                                                    <span className="material-symbols-outlined text-[11px]">{cfg.icon}</span>
                                                    {cfg.label}
                                                </span>
                                            </div>

                                            {/* Date */}
                                            <div>
                                                <p className="text-slate-400 text-xs">{formatShortDate(item.createdAt)}</p>
                                                <p className="text-slate-600 text-[10px] mt-0.5">
                                                    {new Date(item.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                                {item.processedAt && (
                                                    <p className="text-slate-700 text-[10px] mt-0.5">
                                                        Xử lý: {formatShortDate(item.processedAt)}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Chevron */}
                                            <div className="flex justify-end">
                                                <span className="material-symbols-outlined text-[16px] text-slate-600 group-hover:text-slate-400 transition-colors">
                                                    chevron_right
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mobile row */}
                                        <div
                                            className="md:hidden flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                            onClick={() => handleRowClick(item.id)}
                                        >
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ background: "rgba(96,165,250,0.10)" }}
                                            >
                                                <span className="material-symbols-outlined text-[18px]" style={{ color: "#60a5fa" }}>
                                                    savings
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium">{item.bankName}</p>
                                                <p className="text-slate-500 text-[11px] font-mono">{item.bankAccountNumber}</p>
                                                <p className="text-slate-600 text-[10px]">{formatShortDate(item.createdAt)}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold tabular-nums" style={{ color: "#f87171" }}>
                                                    -{formatVND(item.amount)}
                                                </p>
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border mt-1"
                                                    style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                                                >
                                                    <span className="material-symbols-outlined text-[10px]">{cfg.icon}</span>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })
                        )}
                    </div>

                    {/* ── Pagination ─────────────────────────────── */}
                    {!loading && totalCount > 0 && (
                        <div className="px-6 py-5 border-t border-white/5 flex items-center justify-between gap-4 flex-wrap">
                            <p className="text-xs text-slate-500">
                                Hiển thị{" "}
                                <span className="text-slate-300 font-bold">
                                    {data?.currentStartIndex ?? 0}–{data?.currentEndIndex ?? 0}
                                </span>{" "}
                                trong{" "}
                                <span className="text-slate-300 font-bold">{totalCount}</span>{" "}
                                yêu cầu
                            </p>

                            <div className="flex items-center gap-2">
                                <PaginationBtn
                                    icon="first_page"
                                    disabled={page === 1}
                                    onClick={() => setPage(1)}
                                />
                                <PaginationBtn
                                    icon="chevron_left"
                                    disabled={!data?.hasPrevious}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                />

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let p: number;
                                    if (totalPages <= 5) p = i + 1;
                                    else if (page <= 3) p = i + 1;
                                    else if (page >= totalPages - 2) p = totalPages - 4 + i;
                                    else p = page - 2 + i;
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                                            style={{
                                                background: p === page ? "#793bed" : "rgba(255,255,255,0.04)",
                                                color: p === page ? "white" : "#64748b",
                                                border: `1px solid ${p === page ? "rgba(121,59,237,0.5)" : "rgba(255,255,255,0.07)"}`,
                                                boxShadow: p === page ? "0 2px 12px rgba(121,59,237,0.35)" : "none",
                                            }}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}

                                <PaginationBtn
                                    icon="chevron_right"
                                    disabled={!data?.hasNext}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                />
                                <PaginationBtn
                                    icon="last_page"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(totalPages)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail Modal ──────────────────────────────────── */}
            {(selectedId || detailLoading) && (
                <DetailModal
                    detail={detail}
                    loading={detailLoading}
                    onClose={handleCloseDetail}
                />
            )}
        </div>
    );
};

export default HistoryWithdrawal;