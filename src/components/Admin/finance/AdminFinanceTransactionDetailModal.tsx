import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchPaymentById } from "../../../store/paymentSlice";

interface Props {
  open: boolean;
  transactionId: string | null;
  onClose: () => void;
}

export default function AdminFinanceTransactionDetailModal({ open, transactionId, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { paymentDetail, loading, error } = useSelector((state: RootState) => state.PAYMENT);

  useEffect(() => {
    if (!open || !transactionId) return;
    dispatch(fetchPaymentById(transactionId));
  }, [open, transactionId, dispatch]);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  const closeWithAnimation = () => {
    setVisible(false);
    setTimeout(() => onClose(), 180);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) closeWithAnimation();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount == null) return "-";
    return `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
  };

  const translateType = (type: string) => {
    switch (type) {
      case "BatchDirectPay":
        return "Chuyển khoản ngân hàng";
      case "BatchWalletPay":
        return "Ví nội bộ";
      default:
        return type;
    }
  };

  const translateStatus = (s: string) => {
    switch (s) {
      case "Completed":
        return "Hoàn tất";
      case "Pending":
        return "Đang chờ";
      case "AwaitingGateway":
      case "AWAITINGGATEWAY":
        return "Đang chờ cổng thanh toán";
      case "Failed":
        return "Thất bại";
      case "Refunded":
        return "Đã hoàn tiền";
      default:
        return s;
    }
  };

  const translateReferenceType = (r?: string | null) => {
    if (!r) return "-";
    switch (r) {
      case "TicketOrder":
        return "Mua vé";
      case "AIPackage":
      case "AiPackage":
      case "AI_PACKAGE":
        return "Thanh toán gói AI";
      default:
        return r;
    }
  };

  const getStatusBadge = (status: string) => {
    const label = translateStatus(status);
    switch (status) {
      case "Completed":
        return (
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {label}
          </span>
        );
      case "AwaitingGateway":
      case "AWAITINGGATEWAY":
      case "Pending":
        return (
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-tighter rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {label}
          </span>
        );
      case "Failed":
        return (
          <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {label}
          </span>
        );
      case "Refunded":
        return (
          <span className="px-3 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-black uppercase rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            {label}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase rounded-full">
            {label}
          </span>
        );
    }
  };

  if (!open) return null;

  const isCompleted = paymentDetail?.internalStatus === "Completed";

  const modalContent = (
    <div
      style={{ zIndex: 2147483647 }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div
        style={{ zIndex: 2147483646 }}
        className="absolute inset-0"
        onClick={closeWithAnimation}
      />

      {/* Modal Container */}
      <div
        style={{ zIndex: 2147483647 }}
        className={`relative w-full max-w-2xl rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh]
          bg-[rgba(24,18,43,0.7)] backdrop-blur-xl border border-purple-500/30
          shadow-[0_32px_64px_-12px_rgba(0,0,0,0.9)]
          transform transition-all duration-[180ms] ease-out
          ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center border border-purple-500/40">
              <span className="material-symbols-outlined text-purple-400 text-2xl">receipt_long</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Chi tiết giao dịch</h2>
          </div>
          <button
            onClick={closeWithAnimation}
            aria-label="Đóng"
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(124,59,237,0.3) transparent" }}>
          <div className="p-8">
            {loading.paymentDetail ? (
              <div className="text-center text-slate-400 py-12">Đang tải...</div>
            ) : error ? (
              <div className="text-center text-rose-400 py-12">{error}</div>
            ) : !paymentDetail ? (
              <div className="text-center text-slate-400 py-12">Không có dữ liệu</div>
            ) : (
              <>
                {/* Primary Summary Card */}
                <div className="bg-gradient-to-br from-[#18122B] to-slate-950 rounded-3xl p-8 border border-white/5 relative overflow-hidden mb-8">
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-600/10 blur-[60px] rounded-full pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Số tiền giao dịch</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-white tracking-tighter">
                          {new Intl.NumberFormat("vi-VN").format(paymentDetail.amount ?? 0)}
                        </h3>
                        <span className="text-purple-400 font-bold text-xl">VNĐ</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-black/40 px-5 py-3 rounded-2xl border border-white/5">
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400">person</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Khách hàng</p>
                        <p className="text-base font-bold text-slate-100">{paymentDetail.username}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.1em] mb-2">Loại giao dịch</p>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-purple-400">account_balance_wallet</span>
                      <span className="text-sm font-semibold text-slate-200">{translateType(paymentDetail.type)}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.1em] mb-2">Loại tham chiếu</p>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-purple-400">confirmation_number</span>
                      <span className="text-sm font-semibold text-slate-200">{translateReferenceType(paymentDetail.referenceType)}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.1em] mb-2">Trạng thái hệ thống</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(paymentDetail.internalStatus)}
                    </div>
                  </div>

                  {(paymentDetail.gatewayBankCode || paymentDetail.gatewayTransactionNo || paymentDetail.gatewayResponseCode) && (
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.1em] mb-3">Thông tin cổng thanh toán</p>
                      <div className="space-y-2">
                        {paymentDetail.gatewayBankCode && (
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 text-base">account_balance</span>
                            <span className="text-xs font-semibold text-slate-300">{paymentDetail.gatewayBankCode}</span>
                          </div>
                        )}
                        {paymentDetail.gatewayTransactionNo && (
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 text-base">link</span>
                            <span className="text-xs font-mono text-slate-400 truncate">{paymentDetail.gatewayTransactionNo}</span>
                          </div>
                        )}
                        {paymentDetail.gatewayResponseCode && (
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 text-base">code</span>
                            <span className="text-xs font-semibold text-slate-300">{paymentDetail.gatewayResponseCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                {paymentDetail.items && paymentDetail.items.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span className="w-1 h-3 bg-purple-500 rounded-full" />
                      DANH SÁCH MỤC
                    </h4>
                    <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-white/5">
                          <tr>
                            <th className="px-6 py-4">Số tiền</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4">Ngày tạo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {paymentDetail.items.map((it, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-100">{formatCurrency(it.amount)}</td>
                              <td className="px-6 py-4">
                                {getStatusBadge(it.internalStatus)}
                              </td>
                              <td className="px-6 py-4 text-slate-400 font-mono text-xs">{formatDateTime(it.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Time Section */}
                <div className="mb-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                    <span className="w-1 h-3 bg-purple-500 rounded-full" />
                    THỜI GIAN
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                        <div className="w-px flex-1 bg-slate-800 my-1" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Ngày tạo</p>
                        <p className="text-sm text-slate-300 font-medium">{formatDateTime(paymentDetail.createdAt)}</p>
                      </div>
                    </div>

                    {isCompleted && paymentDetail.completedAt && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <div className="w-px flex-1 bg-transparent my-1" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Ngày hoàn thành</p>
                          <p className="text-sm text-slate-300 font-medium">{formatDateTime(paymentDetail.completedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex justify-end shrink-0">
          <button
            onClick={closeWithAnimation}
            className="px-10 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-all border border-white/5 active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}