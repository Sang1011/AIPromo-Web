import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { X, CreditCard, Wallet, Loader2, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import type { AIPackage } from "../../../types/aiPackage/aiPackage";
import type { AppDispatch, RootState } from "../../../store";
import { createPaymentPackageThunk } from "../../../store/aiPackageSlice";

interface PaymentMethodModalProps {
    plan: AIPackage;
    onClose: () => void;
}

type Method = "VNPAY" | "WALLET";

function formatVND(amount: number) {
    return amount.toLocaleString("vi-VN") + " ₫";
}

export default function PaymentMethodModal({ plan, onClose }: PaymentMethodModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [selected, setSelected] = useState<Method>("VNPAY");
    const [loading, setLoading] = useState(false);

    const wallet = useSelector((state: RootState) => state.WALLET.currentWallet);
    const walletBalance = wallet?.balance ?? 0;
    const hasEnoughBalance = walletBalance >= plan.price;

    const handleConfirm = async () => {
        setLoading(true);
        const isVNPay = selected === "VNPAY";
        const returnUrl = `${window.location.origin}/organizer/payment/packages/vnpay-return`;

        const toastId = toast.loading(
            isVNPay ? "Đang tạo link thanh toán VNPay..." : "Đang xử lý thanh toán từ ví..."
        );

        try {
            const result = await dispatch(
                createPaymentPackageThunk({
                    packageId: plan.id,
                    method: isVNPay ? "BatchDirectPay" : "BatchWalletPay",
                    description: `Thanh toán gói ${plan.name}`,
                    returnUrl: isVNPay ? returnUrl : "",
                })
            ).unwrap();

            toast.dismiss(toastId);

            if (isVNPay) {
                const paymentUrl = result?.paymentUrl;
                if (!paymentUrl) {
                    toast.error("Không nhận được link thanh toán. Vui lòng thử lại.");
                    setLoading(false);
                    return;
                }
                window.location.href = paymentUrl;
            } else {
                navigate("/organizer/payment/packages/success", {
                    replace: true,
                    state: { transaction: result },
                });
            }
        } catch (err: any) {
            toast.dismiss(toastId);
            const message = typeof err === "string" ? err : "Thanh toán thất bại. Vui lòng thử lại.";
            if (!isVNPay) {
                navigate("/organizer/payment/packages/failed", {
                    replace: true,
                    state: { message },
                });
            } else {
                toast.error(message);
                setLoading(false);
            }
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
        >
            <div className="relative w-full max-w-sm mx-4 bg-[#18122B] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden">

                {/* Top accent line */}
                <div className="h-0.5 w-full bg-gradient-to-r from-purple-600 via-purple-400 to-transparent" />

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4">
                    <div>
                        <p className="text-sm font-bold text-white">Chọn phương thức thanh toán</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Gói <span className="text-purple-400 font-semibold">{plan.name}</span>
                            {" · "}
                            <span className="text-slate-300 font-semibold">{formatVND(plan.price)}</span>
                            <span className="text-slate-600"> / tháng</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-slate-600 hover:text-slate-300 transition mt-0.5 disabled:opacity-40"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="h-px bg-[#1E293B] mx-6" />

                {/* Method options */}
                <div className="px-6 py-4 space-y-3">

                    {/* VNPay */}
                    <button
                        onClick={() => setSelected("VNPAY")}
                        disabled={loading}
                        className={`w-full flex items-center gap-3.5 p-4 rounded-xl border transition-all text-left
                            ${selected === "VNPAY"
                                ? "border-purple-500/50 bg-purple-500/8"
                                : "border-[#1E293B] bg-white/[0.02] hover:border-[#334155]"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                            ${selected === "VNPAY" ? "border-purple-500" : "border-slate-600"}`}>
                            {selected === "VNPAY" && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <CreditCard size={15} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">VNPay</p>
                            <p className="text-[11px] text-slate-500">ATM, Visa, Mastercard, QR Code</p>
                        </div>
                        {selected === "VNPAY" && <CheckCircle2 size={15} className="text-purple-400 shrink-0" />}
                    </button>

                    {/* Wallet */}
                    <button
                        onClick={() => { if (hasEnoughBalance && !loading) setSelected("WALLET"); }}
                        disabled={loading || !hasEnoughBalance}
                        className={`w-full flex items-center gap-3.5 p-4 rounded-xl border transition-all text-left
                            ${selected === "WALLET"
                                ? "border-emerald-500/40 bg-emerald-500/6"
                                : hasEnoughBalance
                                    ? "border-[#1E293B] bg-white/[0.02] hover:border-[#334155]"
                                    : "border-[#1E293B] bg-white/[0.01] opacity-50"
                            } disabled:cursor-not-allowed`}
                    >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                            ${selected === "WALLET" ? "border-emerald-500" : "border-slate-600"}`}>
                            {selected === "WALLET" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <Wallet size={15} className="text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-white">Ví của tôi</p>
                                {!hasEnoughBalance && (
                                    <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                                        Không đủ số dư
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Số dư:{" "}
                                <span className={`font-semibold ${hasEnoughBalance ? "text-emerald-400" : "text-red-400"}`}>
                                    {formatVND(walletBalance)}
                                </span>
                            </p>
                        </div>
                        {selected === "WALLET" && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                    </button>

                    {/* Insufficient balance warning */}
                    {!hasEnoughBalance && (
                        <div className="flex items-start gap-2 px-1">
                            <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-amber-400/80 leading-relaxed">
                                Cần thêm{" "}
                                <span className="font-semibold text-amber-400">{formatVND(plan.price - walletBalance)}</span>
                                {" "}để thanh toán bằng ví. Nạp tiền trong mục Ví của tôi phía trên.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-5">
                    <div className="h-px bg-[#1E293B] mb-4" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-slate-500">Tổng thanh toán</span>
                        <span className="text-base font-bold text-white">{formatVND(plan.price)}</span>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || (selected === "WALLET" && !hasEnoughBalance)}
                        className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                            bg-purple-600 hover:bg-purple-500 text-white
                            disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Đang xử lý...
                            </>
                        ) : selected === "VNPAY" ? (
                            <>
                                <CreditCard size={14} />
                                Thanh toán qua VNPay
                                <ChevronRight size={14} />
                            </>
                        ) : (
                            <>
                                <Wallet size={14} />
                                Thanh toán từ ví
                                <ChevronRight size={14} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}