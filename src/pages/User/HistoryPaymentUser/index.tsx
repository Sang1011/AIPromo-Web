import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchWalletUser } from "../../../store/walletSlice";
import type { WalletTransaction } from "../../../types/wallet/wallet";
import type { CreateWithdrawal } from "../../../types/withdrawal/withdrawal";
import { fetchCreateWithdrawal } from "../../../store/withdrawalSlice";

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

// ── Types ──────────────────────────────────────────────────────────
type DirectionFilter = "All" | "In" | "Out";
type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

const PAGE_SIZE = 10;

// ── Status config ──────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
    Completed: {
        label: "Thành công",
        color: "#4ade80",
        bg: "rgba(74,222,128,0.10)",
        border: "rgba(74,222,128,0.2)",
        icon: "check_circle",
    },
    Pending: {
        label: "Đang xử lý",
        color: "#fbbf24",
        bg: "rgba(251,191,36,0.10)",
        border: "rgba(251,191,36,0.2)",
        icon: "schedule",
    },
    Failed: {
        label: "Thất bại",
        color: "#f87171",
        bg: "rgba(248,113,113,0.10)",
        border: "rgba(248,113,113,0.2)",
        icon: "cancel",
    },
    Refunded: {
        label: "Hoàn tiền",
        color: "#60a5fa",
        bg: "rgba(96,165,250,0.10)",
        border: "rgba(96,165,250,0.2)",
        icon: "currency_exchange",
    },
};

const getStatus = (tx: WalletTransaction) =>
    (tx as any).status ?? "Completed";

const getStatusCfg = (status: string) =>
    statusConfig[status] ?? {
        label: status,
        color: "#94a3b8",
        bg: "rgba(148,163,184,0.10)",
        border: "rgba(148,163,184,0.2)",
        icon: "info",
    };

// ── Transaction Type icon ──────────────────────────────────────────
const txTypeIcon = (tx: WalletTransaction): string => {
    const desc = ((tx as any).description ?? "").toLowerCase();
    if (desc.includes("nạp") || tx.direction === "In") return "add_card";
    if (desc.includes("rút")) return "savings";
    if (desc.includes("khóa") || desc.includes("course")) return "school";
    if (desc.includes("hoàn")) return "currency_exchange";
    return "receipt_long";
};

// ── Summary Card ───────────────────────────────────────────────────
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

// ── Filter Tab ─────────────────────────────────────────────────────
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

// ── Empty State ────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(121,59,237,0.10)", border: "1px solid rgba(121,59,237,0.15)" }}
        >
            <span className="material-symbols-outlined text-3xl" style={{ color: "#793bed" }}>
                receipt_long
            </span>
        </div>
        <p className="text-slate-400 font-semibold mb-1">Không có giao dịch</p>
        <p className="text-slate-600 text-xs">Thử thay đổi bộ lọc để xem kết quả khác</p>
    </div>
);

// ── Withdrawal Modal ───────────────────────────────────────────────
const BANK_LIST = [
    "Vietcombank",
    "BIDV",
    "Agribank",
    "Techcombank",
    "MB Bank",
    "VPBank",
    "ACB",
    "SHB",
    "TPBank",
    "VIB",
    "SeABank",
    "OCB",
    "HDBank",
    "LienVietPostBank",
    "Sacombank",
];

interface WithdrawalModalProps {
    walletBalance: number;
    onClose: () => void;
    onSubmit: (data: CreateWithdrawal) => Promise<void>;
    isLoading: boolean;
    isSuccess: boolean;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
    walletBalance,
    onClose,
    onSubmit,
    isLoading,
    isSuccess,
}) => {
    const [form, setForm] = useState<CreateWithdrawal>({
        bankAccountNumber: "",
        bankName: "",
        amount: 0,
        notes: "",
        receiverName: ""
    });
    const [amountStr, setAmountStr] = useState("");
    const [errors, setErrors] = useState<Partial<Record<keyof CreateWithdrawal, string>>>({});

    const validate = (): boolean => {
        const errs: Partial<Record<keyof CreateWithdrawal, string>> = {};
        if (!form.bankAccountNumber.trim()) errs.bankAccountNumber = "Vui lòng nhập số tài khoản";
        if (!form.receiverName.trim()) errs.receiverName = "Vui lòng nhập tên chủ tài khoản";
        if (!form.bankName) errs.bankName = "Vui lòng chọn ngân hàng";
        if (!form.amount || form.amount <= 0) errs.amount = "Vui lòng nhập số tiền hợp lệ";
        else if (form.amount > walletBalance) errs.amount = "Số tiền vượt quá số dư ví";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleAmountChange = (raw: string) => {
        const digits = raw.replace(/\D/g, "");
        setAmountStr(digits ? Number(digits).toLocaleString("vi-VN") : "");
        setForm((f) => ({ ...f, amount: Number(digits) || 0 }));
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        await onSubmit(form);
    };

    const inputCls = (field: keyof CreateWithdrawal) => ({
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${errors[field] ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "12px",
        color: "white",
        outline: "none",
        width: "100%",
        padding: "10px 14px",
        fontSize: "14px",
        boxSizing: "border-box" as const,
        transition: "border-color 0.2s",
    });

    // ── Success state ──
    if (isSuccess) {
        return (
            <ModalOverlay onClose={onClose}>
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                        style={{ background: "rgba(74,222,128,0.15)", border: "2px solid rgba(74,222,128,0.3)" }}
                    >
                        <span className="material-symbols-outlined text-4xl" style={{ color: "#4ade80" }}>
                            check_circle
                        </span>
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">Yêu cầu đã được gửi!</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-1">
                        Yêu cầu rút tiền của bạn đã được gửi đến hệ thống.
                    </p>
                    <p className="text-slate-500 text-xs mb-6">
                        Chúng tôi sẽ xử lý trong vòng <span className="text-slate-300 font-semibold">1–3 ngày làm việc</span>.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                        style={{ background: "rgba(121,59,237,0.6)", border: "1px solid rgba(121,59,237,0.4)" }}
                    >
                        Đóng
                    </button>
                </div>
            </ModalOverlay>
        );
    }

    return (
        <ModalOverlay onClose={onClose}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(96,165,250,0.15)" }}
                    >
                        <span className="material-symbols-outlined text-[20px]" style={{ color: "#60a5fa" }}>
                            savings
                        </span>
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-base leading-tight">Rút tiền</h2>
                        <p className="text-slate-500 text-[11px]">Gửi yêu cầu rút tiền về tài khoản ngân hàng</p>
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

            {/* Balance chip */}
            <div className="mx-6 mt-4 mb-1 flex items-center justify-between px-4 py-3 rounded-xl border border-white/5"
                style={{ background: "rgba(255,255,255,0.02)" }}
            >
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]" style={{ color: "#793bed" }}>account_balance_wallet</span>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Số dư ví</span>
                </div>
                <span className="text-white font-bold text-sm">{formatVND(walletBalance)}</span>
            </div>

            {/* Form */}
            <div className="px-6 py-4 flex flex-col gap-4">
                {/* Bank name */}
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        Ngân hàng <span className="text-red-400">*</span>
                    </label>
                    <select
                        value={form.bankName}
                        onChange={(e) => {
                            setForm((f) => ({ ...f, bankName: e.target.value }));
                            setErrors((er) => ({ ...er, bankName: undefined }));
                        }}
                        style={{ ...inputCls("bankName"), appearance: "none" as const }}
                    >
                        <option value="" style={{ background: "#18122B" }}>-- Chọn ngân hàng --</option>
                        {BANK_LIST.map((b) => (
                            <option key={b} value={b} style={{ background: "#18122B" }}>{b}</option>
                        ))}
                    </select>
                    {errors.bankName && <FieldError msg={errors.bankName} />}
                </div>

                {/* Receiver name */}
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        Tên chủ tài khoản <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập tên chủ tài khoản ngân hàng"
                        value={form.receiverName}
                        onChange={(e) => {
                            setForm((f) => ({ ...f, receiverName: e.target.value }));
                            setErrors((er) => ({ ...er, receiverName: undefined }));
                        }}
                        style={{ ...inputCls("receiverName"), textTransform: "uppercase" }}
                    />
                    {errors.receiverName && <FieldError msg={errors.receiverName} />}
                </div>

                {/* Account number */}
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        Số tài khoản <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập số tài khoản ngân hàng"
                        value={form.bankAccountNumber}
                        onChange={(e) => {
                            setForm((f) => ({ ...f, bankAccountNumber: e.target.value }));
                            setErrors((er) => ({ ...er, bankAccountNumber: undefined }));
                        }}
                        style={inputCls("bankAccountNumber")}
                    />
                    {errors.bankAccountNumber && <FieldError msg={errors.bankAccountNumber} />}
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        Số tiền rút <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={amountStr}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            style={{
                                ...inputCls("amount"),
                                paddingRight: "48px",
                            }}
                        />
                        <span
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
                            style={{ color: "#64748b" }}
                        >
                            VND
                        </span>
                    </div>
                    {/* Quick pick buttons */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                        {[50000, 100000, 200000, 500000].map((preset) => (
                            <button
                                key={preset}
                                disabled={preset > walletBalance}
                                onClick={() => {
                                    handleAmountChange(String(preset));
                                    setErrors((er) => ({ ...er, amount: undefined }));
                                }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{
                                    background: "rgba(121,59,237,0.12)",
                                    border: "1px solid rgba(121,59,237,0.2)",
                                    color: "#a78bfa",
                                }}
                            >
                                {(preset / 1000).toLocaleString()}K
                            </button>
                        ))}
                        <button
                            disabled={walletBalance <= 0}
                            onClick={() => {
                                handleAmountChange(String(walletBalance));
                                setErrors((er) => ({ ...er, amount: undefined }));
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                                background: "rgba(121,59,237,0.12)",
                                border: "1px solid rgba(121,59,237,0.2)",
                                color: "#a78bfa",
                            }}
                        >
                            Tất cả
                        </button>
                    </div>
                    {errors.amount && <FieldError msg={errors.amount} />}
                    {/* Amount validation hint */}
                    {form.amount > 0 && form.amount <= walletBalance && (
                        <p className="text-[11px] mt-1.5" style={{ color: "#4ade80" }}>
                            ✓ Số dư còn lại sau rút: {formatVND(walletBalance - form.amount)}
                        </p>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        Ghi chú <span className="text-slate-600 font-normal normal-case">(tuỳ chọn)</span>
                    </label>
                    <textarea
                        rows={2}
                        placeholder="Ghi chú thêm cho yêu cầu rút tiền..."
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        style={{
                            ...inputCls("notes"),
                            resize: "none",
                            fontFamily: "inherit",
                        }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#64748b",
                    }}
                >
                    Huỷ
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                        background: "linear-gradient(135deg, #793bed 0%, #5b21b6 100%)",
                        border: "1px solid rgba(121,59,237,0.4)",
                        boxShadow: "0 4px 20px rgba(121,59,237,0.25)",
                    }}
                >
                    {isLoading ? (
                        <>
                            <span
                                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                                style={{ display: "inline-block" }}
                            />
                            Đang gửi...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[16px]">send_money</span>
                            Gửi yêu cầu rút tiền
                        </>
                    )}
                </button>
            </div>
        </ModalOverlay>
    );
};

// ── Modal Overlay ──────────────────────────────────────────────────
const ModalOverlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
        <div
            className="w-full max-w-md rounded-2xl border border-white/5 overflow-hidden"
            style={{
                background: "#18122B",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(121,59,237,0.1)",
                maxHeight: "90vh",
                overflowY: "auto",
            }}
        >
            {children}
        </div>
    </div>
);

// ── Field Error ────────────────────────────────────────────────────
const FieldError: React.FC<{ msg: string }> = ({ msg }) => (
    <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "#f87171" }}>
        <span className="material-symbols-outlined text-[12px]">error</span>
        {msg}
    </p>
);

// ── Main Component ─────────────────────────────────────────────────
const PaymentHistoryUser: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const { currentWallet } = useSelector((state: RootState) => state.WALLET);
    const walletData = currentWallet as any;
    const allTransactions: WalletTransaction[] =
        (walletData?.transactions as WalletTransaction[] | undefined) ?? [];
    const walletBalance: number = walletData?.balance ?? 0;

    // ── Filter / Sort state ────────────────────────────────────────
    const [direction, setDirection] = useState<DirectionFilter>("All");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("date_desc");
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // ── Withdrawal modal state ─────────────────────────────────────
    const [showWithdrawal, setShowWithdrawal] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawSuccess, setWithdrawSuccess] = useState(false);

    useEffect(() => {
        dispatch(fetchWalletUser(200));
    }, [dispatch]);

    // Reset page on filter change
    useEffect(() => { setPage(1); }, [direction, search, sort]);

    // ── Derived data ───────────────────────────────────────────────
    const filtered = useMemo(() => {
        let txs = [...allTransactions];

        if (direction !== "All") txs = txs.filter((t) => t.direction === direction);

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            txs = txs.filter((t) =>
                ((t as any).description ?? "").toLowerCase().includes(q) ||
                t.id?.toLowerCase().includes(q)
            );
        }

        txs.sort((a, b) => {
            if (sort === "date_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sort === "date_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sort === "amount_desc") return b.amount - a.amount;
            if (sort === "amount_asc") return a.amount - b.amount;
            return 0;
        });

        return txs;
    }, [allTransactions, direction, search, sort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── Summary stats ──────────────────────────────────────────────
    const totalIn = allTransactions.filter((t) => t.direction === "In").reduce((s, t) => s + t.amount, 0);
    const totalOut = allTransactions.filter((t) => t.direction === "Out").reduce((s, t) => s + t.amount, 0);
    const countIn = allTransactions.filter((t) => t.direction === "In").length;
    const countOut = allTransactions.filter((t) => t.direction === "Out").length;

    // ── Withdrawal handler ─────────────────────────────────────────
    const handleWithdraw = async (data: CreateWithdrawal) => {
        setWithdrawLoading(true);
        try {
            const result = await dispatch(fetchCreateWithdrawal(data));
            if (fetchCreateWithdrawal.fulfilled.match(result)) {
                setWithdrawSuccess(true);
                // Refresh wallet data after success
                dispatch(fetchWalletUser(200));
            }
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleCloseWithdrawal = () => {
        setShowWithdrawal(false);
        setWithdrawSuccess(false);
        setWithdrawLoading(false);
    };

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
                        style={{ background: "rgba(121,59,237,0.09)", filter: "blur(80px)" }}
                    />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: "rgba(121,59,237,0.2)" }}
                                >
                                    <span className="material-symbols-outlined text-[22px]" style={{ color: "#a78bfa" }}>
                                        receipt_long
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-none">
                                        Lịch sử giao dịch
                                    </h1>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Toàn bộ các giao dịch trong ví của bạn
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right side: balance chip + withdraw button */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Wallet balance chip */}
                            <div
                                className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/5 shrink-0"
                                style={{ background: "rgba(255,255,255,0.03)" }}
                            >
                                <span className="material-symbols-outlined text-[20px]" style={{ color: "#793bed" }}>
                                    account_balance_wallet
                                </span>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Số dư ví</p>
                                    <p className="text-white font-bold text-lg leading-none">{formatVND(walletBalance)}</p>
                                </div>
                            </div>

                            {/* ── Withdraw Button ── */}
                            <button
                                onClick={() => setShowWithdrawal(true)}
                                disabled={walletBalance <= 0}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white transition-all shrink-0
                                    disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                                style={{
                                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                    border: "1px solid rgba(96,165,250,0.35)",
                                    boxShadow: walletBalance > 0
                                        ? "0 4px 20px rgba(37,99,235,0.35)"
                                        : "none",
                                }}
                            >
                                <span className="material-symbols-outlined text-[18px]">savings</span>
                                Rút tiền
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Summary Cards ─────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <SummaryCard
                        icon="receipt_long"
                        label="Tổng giao dịch"
                        value={allTransactions.length.toString()}
                        sub="tất cả thời gian"
                        accentColor="#793bed"
                    />
                    <SummaryCard
                        icon="add_card"
                        label="Tổng nạp vào"
                        value={formatVND(totalIn)}
                        sub={`${countIn} lần nạp`}
                        accentColor="#4ade80"
                    />
                    <SummaryCard
                        icon="payments"
                        label="Tổng chi tiêu"
                        value={formatVND(totalOut)}
                        sub={`${countOut} lần chi`}
                        accentColor="#f87171"
                    />
                    <SummaryCard
                        icon="account_balance"
                        label="Số dư hiện tại"
                        value={formatVND(walletBalance)}
                        sub="đang hoạt động"
                        accentColor="#60a5fa"
                    />
                </div>

                {/* ── Transactions Table ────────────────────────── */}
                <div
                    className="rounded-2xl border border-white/5 overflow-hidden"
                    style={{ background: "rgba(24,18,43,0.85)", backdropFilter: "blur(12px)" }}
                >
                    {/* Toolbar */}
                    <div className="px-6 py-5 border-b border-white/5">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            {/* Direction tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {(["All", "In", "Out"] as DirectionFilter[]).map((d) => (
                                    <FilterTab
                                        key={d}
                                        label={d === "All" ? "Tất cả" : d === "In" ? "Nạp vào" : "Chi tiêu"}
                                        active={direction === d}
                                        onClick={() => setDirection(d)}
                                        count={
                                            d === "All"
                                                ? allTransactions.length
                                                : d === "In" ? countIn : countOut
                                        }
                                    />
                                ))}
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                {/* Search */}
                                <div
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 md:w-56 transition-all"
                                    style={{
                                        background: "rgba(255,255,255,0.03)",
                                        borderColor: search ? "rgba(121,59,237,0.5)" : "rgba(255,255,255,0.07)",
                                        boxShadow: search ? "0 0 0 3px rgba(121,59,237,0.07)" : "none",
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[16px] text-slate-600 shrink-0">search</span>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm mã giao dịch..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="bg-transparent outline-none border-none text-xs text-white placeholder-slate-600 w-full"
                                    />
                                    {search && (
                                        <button onClick={() => setSearch("")} className="text-slate-600 hover:text-slate-400 transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    )}
                                </div>

                                {/* Sort */}
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as SortKey)}
                                    className="px-3 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer transition-all"
                                    style={{
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        color: "#94a3b8",
                                    }}
                                >
                                    <option value="date_desc" style={{ background: "#18122B" }}>Mới nhất</option>
                                    <option value="date_asc" style={{ background: "#18122B" }}>Cũ nhất</option>
                                    <option value="amount_desc" style={{ background: "#18122B" }}>Số tiền ↓</option>
                                    <option value="amount_asc" style={{ background: "#18122B" }}>Số tiền ↑</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table header */}
                    <div
                        className="hidden md:grid px-6 py-3 border-b border-white/5"
                        style={{
                            gridTemplateColumns: "36px 1fr 140px 120px 160px 32px",
                            background: "rgba(255,255,255,0.02)",
                        }}
                    >
                        {["", "Mô tả", "Số tiền", "Trạng thái", "Thời gian", ""].map((h, i) => (
                            <span key={i} className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/[0.04]">
                        {paginated.length === 0 ? (
                            <EmptyState />
                        ) : (
                            paginated.map((tx) => {
                                const status = getStatus(tx);
                                const cfg = getStatusCfg(status);
                                const isExpanded = expandedId === tx.id;
                                const desc = (tx as any).description ?? "";

                                return (
                                    <React.Fragment key={tx.id}>
                                        {/* Desktop row */}
                                        <div
                                            className="hidden md:grid px-6 py-4 items-center hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                            style={{ gridTemplateColumns: "36px 1fr 140px 120px 160px 32px" }}
                                            onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                                        >
                                            {/* Icon */}
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                                style={{
                                                    background: tx.direction === "In" ? "rgba(74,222,128,0.10)" : "rgba(248,113,113,0.10)",
                                                }}
                                            >
                                                <span
                                                    className="material-symbols-outlined text-[18px]"
                                                    style={{ color: tx.direction === "In" ? "#4ade80" : "#f87171" }}
                                                >
                                                    {txTypeIcon(tx)}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <div className="min-w-0 pl-3">
                                                <p className="text-white text-sm font-medium truncate">
                                                    {desc || (tx.direction === "In" ? "Nạp tiền vào ví" : "Thanh toán")}
                                                </p>
                                                <p className="text-slate-600 text-[11px] mt-0.5 font-mono truncate">
                                                    #{tx.id?.slice(0, 8).toUpperCase()}
                                                </p>
                                            </div>

                                            {/* Amount */}
                                            <div>
                                                <span
                                                    className="text-sm font-bold tabular-nums"
                                                    style={{ color: tx.direction === "In" ? "#4ade80" : "#f87171" }}
                                                >
                                                    {tx.direction === "In" ? "+" : "-"}{formatVND(tx.amount)}
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
                                                <p className="text-slate-400 text-xs">{formatShortDate(tx.createdAt)}</p>
                                                <p className="text-slate-600 text-[10px] mt-0.5">
                                                    {new Date(tx.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>

                                            {/* Expand chevron */}
                                            <div className="flex justify-end">
                                                <span
                                                    className="material-symbols-outlined text-[16px] text-slate-600 group-hover:text-slate-400 transition-all"
                                                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                                >
                                                    expand_more
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mobile row */}
                                        <div
                                            className="md:hidden flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                            onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                                        >
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ background: tx.direction === "In" ? "rgba(74,222,128,0.10)" : "rgba(248,113,113,0.10)" }}
                                            >
                                                <span className="material-symbols-outlined text-[18px]" style={{ color: tx.direction === "In" ? "#4ade80" : "#f87171" }}>
                                                    {txTypeIcon(tx)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">
                                                    {desc || (tx.direction === "In" ? "Nạp tiền vào ví" : "Thanh toán")}
                                                </p>
                                                <p className="text-slate-500 text-[11px]">{formatShortDate(tx.createdAt)}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p
                                                    className="text-sm font-bold tabular-nums"
                                                    style={{ color: tx.direction === "In" ? "#4ade80" : "#f87171" }}
                                                >
                                                    {tx.direction === "In" ? "+" : "-"}{formatVND(tx.amount)}
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

                                        {/* Expanded Detail */}
                                        {isExpanded && (
                                            <div
                                                className="px-6 py-5 border-t border-white/5"
                                                style={{ background: "rgba(121,59,237,0.04)" }}
                                            >
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <DetailItem label="Mã giao dịch" value={tx.id?.toUpperCase() ?? "—"} mono />
                                                    <DetailItem
                                                        label="Loại giao dịch"
                                                        value={tx.direction === "In" ? "Tiền vào" : "Tiền ra"}
                                                        color={tx.direction === "In" ? "#4ade80" : "#f87171"}
                                                    />
                                                    <DetailItem label="Số tiền" value={formatVND(tx.amount)} />
                                                    <DetailItem label="Thời gian đầy đủ" value={formatFullDate(tx.createdAt)} />
                                                    {desc && (
                                                        <div className="col-span-2 md:col-span-4">
                                                            <DetailItem label="Mô tả" value={desc} />
                                                        </div>
                                                    )}
                                                    {(tx as any).referenceId && (
                                                        <DetailItem label="Mã tham chiếu" value={(tx as any).referenceId} mono />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </div>

                    {/* ── Pagination ─────────────────────────────── */}
                    {filtered.length > 0 && (
                        <div className="px-6 py-5 border-t border-white/5 flex items-center justify-between gap-4 flex-wrap">
                            <p className="text-xs text-slate-500">
                                Hiển thị{" "}
                                <span className="text-slate-300 font-bold">
                                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
                                </span>{" "}
                                trong{" "}
                                <span className="text-slate-300 font-bold">{filtered.length}</span>{" "}
                                giao dịch
                            </p>

                            <div className="flex items-center gap-2">
                                <PaginationBtn
                                    icon="first_page"
                                    disabled={page === 1}
                                    onClick={() => setPage(1)}
                                />
                                <PaginationBtn
                                    icon="chevron_left"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                />

                                {/* Page numbers */}
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
                                    disabled={page === totalPages}
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

            {/* ── Withdrawal Modal ─────────────────────────────── */}
            {showWithdrawal && (
                <WithdrawalModal
                    walletBalance={walletBalance}
                    onClose={handleCloseWithdrawal}
                    onSubmit={handleWithdraw}
                    isLoading={withdrawLoading}
                    isSuccess={withdrawSuccess}
                />
            )}
        </div>
    );
};

// ── Sub-components ─────────────────────────────────────────────────
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

export default PaymentHistoryUser;