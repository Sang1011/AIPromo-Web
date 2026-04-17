import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Wallet, Plus, X, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { AppDispatch, RootState } from "../../../store";
import { fetchToUpWallet } from "../../../store/walletSlice";
import type { WalletTransaction } from "../../../types/wallet/wallet";

const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000];

function formatVND(amount: number) {
    return amount.toLocaleString("vi-VN") + " ₫";
}

function formatCompactVND(amount: number): string {
    if (amount < 1_000_000) {
        return Math.floor(amount / 1000) + "k";
    }

    const million = amount / 1_000_000;
    if (Number.isInteger(million)) {
        return million + " triệu";
    }

    return million.toFixed(1).replace(/\.0$/, "") + " triệu";
}

function txIcon(direction: string) {
    if (direction === "IN")
        return <ArrowDownLeft size={13} className="text-emerald-400" />;
    return <ArrowUpRight size={13} className="text-red-400" />;
}

function txStatusIcon(status: string) {
    if (status === "SUCCESS" || status === "COMPLETED")
        return <CheckCircle size={11} className="text-emerald-400" />;
    if (status === "FAILED")
        return <XCircle size={11} className="text-red-400" />;
    return <Clock size={11} className="text-amber-400" />;
}

function txStatusLabel(status: string) {
    const map: Record<string, string> = {
        SUCCESS: "Thành công",
        COMPLETED: "Hoàn thành",
        FAILED: "Thất bại",
        PENDING: "Đang xử lý",
    };
    return map[status] ?? status;
}

// ─── Top-up Modal ─────────────────────────────────────────────────────────────
interface TopUpModalProps {
    onClose: () => void;
}

function TopUpModal({ onClose }: TopUpModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [amount, setAmount] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parsed = parseInt(amount.replace(/\D/g, ""), 10);
    const isValid = !isNaN(parsed) && parsed >= 10_000;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        setAmount(raw ? parseInt(raw, 10).toLocaleString("vi-VN") : "");
        setError(null);
    };

    const handleQuick = (val: number) => {
        setAmount(val.toLocaleString("vi-VN"));
        setError(null);
    };

    const handleSubmit = async () => {
        if (!isValid) return;
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(
                fetchToUpWallet({ amount: parsed, description: `Nạp tiền vào ví – ${formatVND(parsed)}` })
            ).unwrap();
            if (result?.data?.paymentUrl) {
                localStorage.setItem("vnpay_return_target", "organizer_wallet");
                window.location.href = result.data.paymentUrl;
            } else {
                setError("Không nhận được link thanh toán. Vui lòng thử lại.");
            }
        } catch {
            setError("Nạp tiền thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        >
            <div className="relative w-full max-w-sm mx-4 bg-[#18122B] border border-[#1E293B] rounded-2xl p-6 shadow-2xl">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition"
                >
                    <X size={16} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Wallet size={15} className="text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Nạp tiền vào ví</p>
                        <p className="text-[11px] text-slate-500">Thanh toán qua VNPay</p>
                    </div>
                </div>

                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {QUICK_AMOUNTS.map((val) => (
                        <button
                            key={val}
                            onClick={() => handleQuick(val)}
                            className={`py-1.5 rounded-lg text-[11px] font-semibold border transition
                                ${parsed === val
                                    ? "bg-purple-500/20 border-purple-400/40 text-purple-300"
                                    : "bg-white/5 border-white/10 text-slate-400 hover:border-purple-400/30 hover:text-purple-300"
                                }`}
                        >
                            {formatCompactVND(val)}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="mb-1">
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="Nhập số tiền..."
                            className="w-full bg-[#0B0B12] border border-[#1E293B] rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold">₫</span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1.5 ml-1">Tối thiểu 10.000 ₫</p>
                </div>

                {error && (
                    <p className="text-[11px] text-red-400 mb-3">{error}</p>
                )}

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!isValid || loading}
                    className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2
                        bg-purple-600 hover:bg-purple-500 text-white
                        disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <Plus size={14} />
                            Nạp {isValid ? formatVND(parsed) : "tiền"}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Transaction row ──────────────────────────────────────────────────────────
function TxRow({ tx }: { tx: WalletTransaction }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-[#1E293B] last:border-0">
            <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0
                    ${tx.direction === "IN" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                    {txIcon(tx.direction)}
                </div>
                <div>
                    <p className="text-xs text-slate-300 font-medium leading-tight">{tx.note || "Giao dịch"}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                        {txStatusIcon(tx.status)}
                        <span className="text-[10px] text-slate-600">{txStatusLabel(tx.status)}</span>
                        <span className="text-[10px] text-slate-700">·</span>
                        <span className="text-[10px] text-slate-600">
                            {new Date(tx.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                    </div>
                </div>
            </div>
            <span className={`text-xs font-bold tabular-nums ${tx.direction === "IN" ? "text-emerald-400" : "text-red-400"}`}>
                {tx.direction === "IN" ? "+" : "-"}{formatVND(tx.amount)}
            </span>
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function WalletSection() {
    const [showModal, setShowModal] = useState(false);
    const wallet = useSelector((state: RootState) => state.WALLET.currentWallet);

    if (!wallet) return null;

    return (
        <>
            <div className="bg-[#18122B] border border-[#1E293B] rounded-2xl p-5">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Wallet size={14} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Ví của bạn</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-purple-400/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition"
                    >
                        <Plus size={11} />
                        Nạp tiền
                    </button>
                </div>

                {/* Balance */}
                <div className="mb-4">
                    <p className="text-2xl font-bold text-white">{formatVND(wallet.balance)}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${wallet.status === "ACTIVE" ? "bg-emerald-400" : "bg-slate-500"}`} />
                        <span className="text-[11px] text-slate-500 capitalize">{wallet.status === "ACTIVE" ? "Đang hoạt động" : wallet.status}</span>
                    </div>
                </div>

                {/* Transactions */}
                {wallet.transactions && wallet.transactions.length > 0 ? (
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">Giao dịch gần đây</p>
                        <div>
                            {wallet.transactions.map((tx) => (
                                <TxRow key={tx.id} tx={tx} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-slate-600 text-center py-3">Chưa có giao dịch nào</p>
                )}
            </div>

            {showModal && <TopUpModal onClose={() => setShowModal(false)} />}
        </>
    );
}