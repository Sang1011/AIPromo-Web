import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { fetchGetDetailOrder } from "../../store/orderSlice";
import { fetchPaymentOrder } from "../../store/paymentSlice";
import { fetchToUpWallet, fetchWalletUser } from "../../store/walletSlice";
import type { PaymentOrderPaymentResponse } from "../../types/payment/payment";
import type { ToUpWalletResponse } from "../../types/wallet/wallet";
// import { fetchGetVouchers } from "../../store/voucherSlice";



// ── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN") + " VND";
}

function formatEventDateTime(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `${date} - ${time}`;
}

/** Redirect to paymentUrl nếu có, ngược lại không làm gì */
function redirectIfUrl(paymentUrl: string | null | undefined) {
  if (paymentUrl) {
    window.location.href = paymentUrl;
    return true;
  }
  return false;
}

type PaymentMethod = "wallet" | "vnpay";

const PRESET_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000];

// ── WalletModal ──────────────────────────────────────────────────────────────
const WalletModal: React.FC<{
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
}> = ({ onClose, onConfirm }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  const finalAmount = custom ? parseInt(custom.replace(/\D/g, ""), 10) : selected;

  const handleConfirm = async () => {
    if (!finalAmount || finalAmount < 10_000) return;
    setLoading(true);
    try {
      await onConfirm(finalAmount);
      onClose();
    } catch {
      // lỗi đã xử lý ở tầng trên, không đóng modal
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 border border-white/10 z-10"
        style={{ background: "#18122B", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(121,59,237,0.2)" }}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ color: "#793bed" }}>
                account_balance_wallet
              </span>
            </div>
            <h3 className="text-white font-bold text-lg">Nạp tiền vào ví</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Preset amounts */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Chọn mệnh giá</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => { setSelected(amt); setCustom(""); }}
              className="py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: selected === amt && !custom ? "rgba(121,59,237,0.25)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${selected === amt && !custom ? "rgba(121,59,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                color: selected === amt && !custom ? "#a78bfa" : "#94a3b8",
              }}
            >
              {formatVND(amt)}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Hoặc nhập số tiền khác</p>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 mb-6 border transition-all"
          style={{
            background: "#1A1F2E",
            borderColor: custom ? "rgba(121,59,237,0.5)" : "rgba(255,255,255,0.08)",
            boxShadow: custom ? "0 0 0 3px rgba(121,59,237,0.08)" : "none",
          }}
        >
          <span className="text-slate-500 text-sm font-bold shrink-0">VND</span>
          <input
            type="text"
            placeholder="Nhập số tiền (tối thiểu 10.000đ)"
            value={custom}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              setCustom(raw);
              setSelected(null);
            }}
            className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder-slate-600"
          />
        </div>

        {/* Preview */}
        {finalAmount && finalAmount >= 10_000 && (
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl mb-5 border border-white/5"
            style={{ background: "rgba(121,59,237,0.08)" }}
          >
            <span className="text-slate-400 text-sm">Số tiền nạp</span>
            <span className="text-white font-bold text-sm">{formatVND(finalAmount)}</span>
          </div>
        )}

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!finalAmount || finalAmount < 10_000 || loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
          style={{
            background: !finalAmount || finalAmount < 10_000
              ? "rgba(121,59,237,0.25)"
              : loading ? "rgba(121,59,237,0.5)" : "#793bed",
            boxShadow: finalAmount && finalAmount >= 10_000 && !loading ? "0 4px 20px rgba(121,59,237,0.4)" : "none",
            cursor: !finalAmount || finalAmount < 10_000 ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Đang xử lý…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">add_card</span>
              Xác nhận nạp tiền
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default function PaymentTicket() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("wallet");
  const { orderDetail } = useSelector((state: RootState) => state.ORDER);
  const { currentWallet } = useSelector((state: RootState) => state.WALLET);
  // const { vouchers } = useSelector((state: RootState) => state.VOUCHER);

  const dispatch = useDispatch<AppDispatch>();
  // useEffect(() => {
  //   dispatch(fetchGetVouchers())
  // }, [dispatch])
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletNotFound, setWalletNotFound] = useState(false);
  const [walletLoadError, setWalletLoadError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const orderIdFromUrl = id?.replace("orderid=", "");
  const orderIdFromStorage = localStorage.getItem("currentOrderId");
  const resolvedOrderId = orderIdFromUrl || orderIdFromStorage;

  const walletBalance = currentWallet?.balance ?? 0;

  const orderTickets = orderDetail?.tickets ?? [];
  const groupedTickets = useMemo(() => {
    const map = new Map<string, { ticketTypeName: string; unitPrice: number; quantity: number }>();
    for (const t of orderTickets) {
      const key = `${t.ticketTypeName}__${t.price}`;
      const exist = map.get(key);
      if (exist) {
        exist.quantity += 1;
      } else {
        map.set(key, { ticketTypeName: t.ticketTypeName, unitPrice: t.price, quantity: 1 });
      }
    }
    return Array.from(map.values());
  }, [orderTickets]);

  const discountAmount = orderDetail?.discountAmount ?? 0;
  const orderSubTotal =
    typeof orderDetail?.subTotal === "number"
      ? orderDetail.subTotal
      : groupedTickets.reduce((sum, t) => sum + t.quantity * t.unitPrice, 0);

  const computedTotal = orderSubTotal - discountAmount;
  const total = typeof orderDetail?.totalPrice === "number" ? orderDetail.totalPrice : computedTotal;

  const isWalletInsufficient =
    selectedMethod === "wallet" && !walletLoading && !walletNotFound && walletBalance < total;

  const isOrderReadyForPayment = Boolean(resolvedOrderId) && total > 0;

  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const autoRetryRef = useRef(false);

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);

  useEffect(() => {
    if (orderIdFromStorage) {
      dispatch(fetchGetDetailOrder(orderIdFromStorage));
    }
  }, [orderIdFromStorage, dispatch]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setWalletLoading(true);
      setWalletLoadError(null);
      setWalletNotFound(false);
      const result = await dispatch(fetchWalletUser(10));
      if (!isMounted) return;
      if (fetchWalletUser.rejected.match(result)) {
        setWalletNotFound(true);
        setWalletLoadError(
          (result.payload as any)?.message ?? (result.payload as any) ?? "Không thể tải thông tin ví. Vui lòng thử lại."
        );
      }
      setWalletLoading(false);
    })();
    return () => { isMounted = false; };
  }, [dispatch]);
  useEffect(() => {
    if (autoRetryRef.current) return;
    const pending = localStorage.getItem("pendingPaymentAfterTopUp");
    const pendingOrderId = localStorage.getItem("pendingPaymentOrderId");
    const pendingMethod = localStorage.getItem("pendingPaymentMethod");

    if (pending !== "1") return;
    if (!resolvedOrderId) return;
    if (pendingOrderId !== resolvedOrderId) return;
    if (pendingMethod !== "wallet") return;
    if (!isOrderReadyForPayment) return;
    if (walletBalance < total) return;

    autoRetryRef.current = true;
    localStorage.removeItem("pendingPaymentAfterTopUp");
    localStorage.removeItem("pendingPaymentOrderId");
    localStorage.removeItem("pendingPaymentMethod");

    (async () => {
      const result = await dispatch(
        fetchPaymentOrder({
          orderId: resolvedOrderId,
          method: "BatchWalletPay",
          description: `Thanh toán đơn ${resolvedOrderId} (sau khi nạp tiền)`,
        })
      );

      if (fetchPaymentOrder.fulfilled.match(result)) {
        const payload = (result.payload as any)?.data as PaymentOrderPaymentResponse;
        redirectIfUrl(payload?.paymentUrl);
      }
    })();
  }, [dispatch, resolvedOrderId, walletBalance, total, isOrderReadyForPayment]);

  const handleTopUp = async (amount: number) => {
    setTopUpError(null);
    if (!resolvedOrderId) return;

    localStorage.setItem("pendingPaymentAfterTopUp", "1");
    localStorage.setItem("pendingPaymentOrderId", resolvedOrderId);
    localStorage.setItem("pendingPaymentMethod", "wallet");

    const result = await dispatch(
      fetchToUpWallet({
        amount,
        description: `Nạp ${amount.toLocaleString("vi-VN")}đ vào ví để thanh toán đơn ${resolvedOrderId}`,
      })
    );

    if (fetchToUpWallet.fulfilled.match(result)) {
      const payload = (result.payload as any)?.data as ToUpWalletResponse;



      if (redirectIfUrl(payload?.paymentUrl)) {
        return;
      }

      localStorage.removeItem("pendingPaymentAfterTopUp");
      localStorage.removeItem("pendingPaymentOrderId");
      localStorage.removeItem("pendingPaymentMethod");
      dispatch(fetchWalletUser(10));
      return;
    }

    // Thất bại → dọn pending flags để tránh auto-pay sai
    localStorage.removeItem("pendingPaymentAfterTopUp");
    localStorage.removeItem("pendingPaymentOrderId");
    localStorage.removeItem("pendingPaymentMethod");

    const errMsg =
      (result.payload as any)?.message ?? (result.error?.message ?? "Nạp tiền thất bại, vui lòng thử lại.");
    setTopUpError(errMsg);
    throw new Error(errMsg);
  };

  // ── handlePayment ──────────────────────────────────────────────────────────
  const handlePayment = async () => {
    setPayError(null);
    if (!resolvedOrderId) {
      setPayError("Không tìm thấy thông tin đơn hàng để thanh toán.");
      return;
    }
    if (!isOrderReadyForPayment) {
      setPayError("Đang tải thông tin đơn hàng hoặc dữ liệu thanh toán chưa sẵn sàng.");
      return;
    }

    setIsPaying(true);
    try {
      let effectiveWalletBalance = walletBalance;
      if (!currentWallet) {
        const walletResult = await dispatch(fetchWalletUser(10));
        if (fetchWalletUser.fulfilled.match(walletResult)) {
          const payload = walletResult.payload as any;
          effectiveWalletBalance = payload?.data?.balance ?? 0;
        } else if (fetchWalletUser.rejected.match(walletResult)) {
          const errMsg =
            (walletResult.payload as any)?.message ??
            (walletResult.payload as any) ??
            "Không thể tải thông tin ví.";
          setWalletLoadError(errMsg);
          setWalletNotFound(true);
          effectiveWalletBalance = 0;
        }
      }

      // Ví không đủ tiền → mở modal nạp tiền
      if (selectedMethod === "wallet" && effectiveWalletBalance < total) {
        setPayError("Số dư không đủ. Vui lòng nạp thêm tiền để tiếp tục.");
        setShowWalletModal(true);
        return;
      }

      const result = await dispatch(
        fetchPaymentOrder({
          orderId: resolvedOrderId,
          method: selectedMethod === "wallet" ? "BatchWalletPay" : "BatchDirectPay",
          description: `Thanh toán đơn ${resolvedOrderId} bằng ${selectedMethod === "wallet" ? "Ví" : "VNPay"}`,
        })
      );

      if (fetchPaymentOrder.fulfilled.match(result)) {
        // ── KEY FIX: dùng typed interface ──────────────────────────────────
        const payload = (result.payload as any)?.data as PaymentOrderPaymentResponse;

        if (redirectIfUrl(payload?.paymentUrl)) {
          // Đang chuyển sang cổng thanh toán
          return;
        }

        // paymentUrl null → thanh toán thành công ngay (ví nội bộ không cần redirect)
        // Có thể navigate tới trang thành công ở đây nếu cần
        return;
      }

      const errMsg =
        (result.payload as any)?.message ?? (result.error?.message ?? "Thanh toán thất bại, vui lòng thử lại.");
      setPayError(errMsg);
    } finally {
      setIsPaying(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#0B0B12] text-[#F1F1F1] font-['Space_Grotesk'] min-h-screen">
      {showWalletModal && (
        <WalletModal
          onClose={() => setShowWalletModal(false)}
          onConfirm={handleTopUp}
        />
      )}

      {/* Header */}
      <header className="bg-[#18122B]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl shadow-black/50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)", boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)" }}
            >
              <svg viewBox="0 0 32 32" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="16,4 18.5,12 27,12 20.5,17 23,25 16,20 9,25 11.5,17 5,12 13.5,12" fill="white" opacity="0.95" />
                <line x1="26" y1="5" x2="26" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                <line x1="24.5" y1="6.5" x2="27.5" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                <line x1="6" y1="25" x2="6" y2="28" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                <line x1="4.5" y1="26.5" x2="7.5" y2="26.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="text-xl font-bold tracking-wide text-white" style={{ fontFamily: "Georgia, serif" }}>AIPromo</h1>
              <span className="text-[9px] font-semibold tracking-[0.25em] uppercase" style={{ color: "#A855F7" }}>Event Solutions</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <section>
              <h1 className="text-4xl font-bold tracking-tight mb-8">Tóm Tắt Đơn Hàng</h1>
              <div className="bg-[#18122B] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video w-full relative overflow-hidden">
                  <img
                    src={orderDetail?.bannerUrl ?? "https://lh3.googleusercontent.com/aida-public/AB6AXuDUheINcsV58keqtjkefy2MYs5DOxgUt78rY61QShhIYb2d5Mgo_nFktfkTNsMJ1ZxJAKpdLhsXznm9Pb0bLT71l2YtMag5xhuJpDrG9z-6vUXOm07deJpyWtJhiLMNEw8fU5v8JZ1ROvpbM3d2C1y0w4SBfzE6r_4DAn_bHsIIFie30-f7NmfGkwkQlUPGWBKa4rSkT0t_Usu_Bz5WnRqkuBRKqfJ_GawnVIK-3Ft9gAJGyw4kQ5VrVTE02R0V2bTxKru7UckFm8s8"}
                    alt={orderDetail?.eventTitle ?? "Sự kiện"}
                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500 scale-105 hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18122B] via-transparent to-transparent" />
                </div>
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">{orderDetail?.eventTitle ?? "Đang tải..."}</h2>
                  <div className="flex flex-wrap gap-6 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#793bed] text-lg">calendar_today</span>
                      <span>{formatEventDateTime(orderDetail?.eventStartAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#793bed] text-lg">location_on</span>
                      <span>{orderDetail?.location ?? ""}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Selected Tickets */}
            <section className="bg-[#18122B] border border-white/5 rounded-2xl p-8 space-y-6">
              <h3 className="text-xl font-bold border-b border-white/10 pb-4">Vé Đã Chọn</h3>
              <div className="space-y-4">
                {groupedTickets.length > 0 ? (
                  groupedTickets.map((ticket) => (
                    <div key={`${ticket.ticketTypeName}_${ticket.unitPrice}`} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{ticket.ticketTypeName}</p>
                        <p className="text-sm text-slate-400">{ticket.quantity}x {formatVND(ticket.unitPrice)}</p>
                      </div>
                      <p className="font-bold">{formatVND(ticket.quantity * ticket.unitPrice)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Đang tải vé...</p>
                )}
              </div>
            </section>

            {/* Cost Breakdown */}
            <section className="bg-[#130D22] border border-white/5 rounded-2xl p-8 space-y-4">
              {[
                { label: "Tạm tính", value: orderSubTotal },
                ...(discountAmount > 0 ? [{ label: "Giảm giá", value: discountAmount }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm text-slate-400">
                  <span>{label}</span>
                  <span>{formatVND(value)}</span>
                </div>
              ))}
              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-xl font-bold">Tổng Thanh Toán</span>
                <span className="text-3xl font-extrabold text-[#793bed] drop-shadow-[0_0_8px_rgba(121,59,237,0.4)] tracking-tighter">
                  {formatVND(total)}
                </span>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-8">
            <section
              className="border border-[#793bed]/20 rounded-2xl p-8 shadow-2xl"
              style={{ background: "rgba(24,18,43,0.8)", backdropFilter: "blur(12px)" }}
            >
              <h3 className="text-xl font-bold mb-8">Phương Thức Thanh Toán</h3>
              <div className="space-y-4">

                {/* Wallet */}
                <label className="block relative cursor-pointer group">
                  <input
                    type="radio"
                    name="payment_method"
                    className="peer hidden"
                    checked={selectedMethod === "wallet"}
                    onChange={() => setSelectedMethod("wallet")}
                  />
                  <div className={`p-6 rounded-xl border transition-all ${selectedMethod === "wallet" ? "border-[#793bed] bg-[#793bed]/5" : "border-white/10 group-hover:border-[#793bed]/50"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#793bed]">account_balance_wallet</span>
                        <span className="font-bold">Ví Của Tôi</span>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: selectedMethod === "wallet" ? "#793bed" : "rgba(255,255,255,0.2)" }}>
                        {selectedMethod === "wallet" && <div className="w-2.5 h-2.5 rounded-full bg-[#793bed]" />}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Số dư khả dụng</span>
                      <span className="font-medium">
                        {walletLoading ? "Đang tải..." : walletNotFound ? "Chưa có ví" : formatVND(walletBalance)}
                      </span>
                    </div>
                    {isWalletInsufficient && (
                      <>
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                          <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">warning</span>
                          <p className="text-xs text-red-400 font-medium">Số dư không đủ. Vui lòng nạp thêm để tiếp tục.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setTopUpError(null); setShowWalletModal(true); }}
                          className="mt-4 w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                          style={{ background: "linear-gradient(135deg, #793bed, #a855f7)", boxShadow: "0 4px 20px rgba(121,59,237,0.35)" }}
                        >
                          <span className="material-symbols-outlined text-[18px]">add_card</span>
                          Nạp tiền vào ví
                        </button>
                        {topUpError && <p className="mt-3 text-xs text-red-400 font-medium text-center">{topUpError}</p>}
                      </>
                    )}
                    {walletLoadError && (
                      <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">error</span>
                        <p className="text-xs text-red-400 font-medium">{walletLoadError}</p>
                      </div>
                    )}
                  </div>
                </label>

                {/* VNPay */}
                <label className="block relative cursor-pointer group">
                  <input
                    type="radio"
                    name="payment_method"
                    className="peer hidden"
                    checked={selectedMethod === "vnpay"}
                    onChange={() => setSelectedMethod("vnpay")}
                  />
                  <div className={`p-6 rounded-xl border transition-all ${selectedMethod === "vnpay" ? "border-[#793bed] bg-[#793bed]/5" : "border-white/10 group-hover:border-[#793bed]/50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center overflow-hidden">
                          <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr_likDEVzAdpd7et2s_KzZTdryy_Muhwwsi3ukEQygBRWOnzCzaNXG_3EmH6NfaTli1UvTXs_FdG3Z4_RnQ4yZbXH76ut1lWHawDEocqoLjyjAwWNv5WuhpcttpZ6EdRFPGFm3Gf7ALJy-w9nLMHjNW8U-YnCa8ycOHYj_b2IuJzp_7BSz5gmG3dZzC55_gqHQFkINSpMwodJYqZf7uxSEMMuH1lkAnhd5vgRKYBJMtoKQH9YK3ApmUB1PCHPUAdrLejqM4pU6Y_7"
                            alt="VNPay"
                            className="h-full object-contain"
                          />
                        </div>
                        <span className="font-bold">VNPay</span>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: selectedMethod === "vnpay" ? "#793bed" : "rgba(255,255,255,0.2)" }}>
                        {selectedMethod === "vnpay" && <div className="w-2.5 h-2.5 rounded-full bg-[#793bed]" />}
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* CTA */}
              <div className="mt-12">
                <button
                  onClick={handlePayment}
                  disabled={isPaying || !isOrderReadyForPayment || (selectedMethod === "wallet" && walletLoading)}
                  className="w-full bg-[#793bed] text-white py-5 rounded-xl font-bold text-lg tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#793bed]/30"
                  style={{ boxShadow: "0 0 15px rgba(121,59,237,0.4)" }}
                >
                  {isPaying
                    ? "Đang xử lý..."
                    : !isOrderReadyForPayment
                      ? "Đang tải thông tin đơn..."
                      : "TIẾN HÀNH THANH TOÁN"}
                </button>
                <p className="text-center text-slate-400 text-xs mt-6 px-4">
                  Bằng cách nhấn "Tiến hành thanh toán", bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi.
                </p>
                {payError && (
                  <p className="text-center text-red-400 text-xs mt-3 px-4 font-medium">{payError}</p>
                )}
              </div>
            </section>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-8 text-slate-500 grayscale opacity-50">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">verified_user</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Bảo Mật SSL</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">payment_card</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Chuẩn PCI</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="h-24 md:hidden" />
    </div>
  );
}