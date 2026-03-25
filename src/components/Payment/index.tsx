import { useState } from "react";
import { Link } from "react-router-dom";

const TICKETS = [
  { type: "Vé VIP", quantity: 2, unitPrice: 1500000 },
  { type: "Vé Thường", quantity: 1, unitPrice: 500000 },
];

const SERVICE_FEE_RATE = 0.02;
const VAT_RATE = 0.1;
const WALLET_BALANCE = 1200000;

function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN") + " VND";
}

type PaymentMethod = "wallet" | "vnpay";

export default function PaymentTicket() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("wallet");

  const subtotal = TICKETS.reduce((sum, t) => sum + t.quantity * t.unitPrice, 0);
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + serviceFee + vat;
  const isWalletInsufficient = selectedMethod === "wallet" && WALLET_BALANCE < total;

  return (
    <div className="bg-[#0B0B12] text-[#F1F1F1] font-['Space_Grotesk'] min-h-screen">
      {/* Header */}
      <header className="bg-[#18122B]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl shadow-black/50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)",
              }}
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
              <h1 className="text-xl font-bold tracking-wide text-white" style={{ fontFamily: "Georgia, serif" }}>
                AIPromo
              </h1>
              <span className="text-[9px] font-semibold tracking-[0.25em] uppercase" style={{ color: "#A855F7" }}>
                Event Solutions
              </span>
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

              {/* Event Card */}
              <div className="bg-[#18122B] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video w-full relative overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUheINcsV58keqtjkefy2MYs5DOxgUt78rY61QShhIYb2d5Mgo_nFktfkTNsMJ1ZxJAKpdLhsXznm9Pb0bLT71l2YtMag5xhuJpDrG9z-6vUXOm07deJpyWtJhiLMNEw8fU5v8JZ1ROvpbM3d2C1y0w4SBfzE6r_4DAn_bHsIIFie30-f7NmfGkwkQlUPGWBKa4rSkT0t_Usu_Bz5WnRqkuBRKqfJ_GawnVIK-3Ft9gAJGyw4kQ5VrVTE02R0V2bTxKru7UckFm8s8"
                    alt="Lễ Hội Âm Nhạc Neon Night"
                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500 scale-105 hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18122B] via-transparent to-transparent" />
                </div>
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">
                    Lễ Hội Âm Nhạc Neon Night 2024
                  </h2>
                  <div className="flex flex-wrap gap-6 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#793bed] text-lg">calendar_today</span>
                      <span>22/10/2024 - 19:00</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#793bed] text-lg">location_on</span>
                      <span>Nhà Hát Lớn Hà Nội</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Selected Tickets */}
            <section className="bg-[#18122B] border border-white/5 rounded-2xl p-8 space-y-6">
              <h3 className="text-xl font-bold border-b border-white/10 pb-4">Vé Đã Chọn</h3>
              <div className="space-y-4">
                {TICKETS.map((ticket) => (
                  <div key={ticket.type} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{ticket.type}</p>
                      <p className="text-sm text-slate-400">
                        {ticket.quantity}x {formatVND(ticket.unitPrice)}
                      </p>
                    </div>
                    <p className="font-bold">{formatVND(ticket.quantity * ticket.unitPrice)}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Cost Breakdown */}
            <section className="bg-[#130D22] border border-white/5 rounded-2xl p-8 space-y-4">
              {[
                { label: "Tạm tính", value: subtotal },
                { label: "Phí dịch vụ (2%)", value: serviceFee },
                { label: "Thuế VAT (10%)", value: vat },
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
                  <div
                    className={`p-6 rounded-xl border transition-all ${
                      selectedMethod === "wallet"
                        ? "border-[#793bed] bg-[#793bed]/5"
                        : "border-white/10 group-hover:border-[#793bed]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#793bed]">account_balance_wallet</span>
                        <span className="font-bold">Ví Của Tôi</span>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: selectedMethod === "wallet" ? "#793bed" : "rgba(255,255,255,0.2)" }}
                      >
                        {selectedMethod === "wallet" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#793bed]" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Số dư khả dụng</span>
                      <span className="font-medium">{formatVND(WALLET_BALANCE)}</span>
                    </div>
                    {isWalletInsufficient && (
                      <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">warning</span>
                        <p className="text-xs text-red-400 font-medium">
                          Số dư không đủ. Vui lòng nạp thêm hoặc chọn phương thức khác.
                        </p>
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
                  <div
                    className={`p-6 rounded-xl border transition-all ${
                      selectedMethod === "vnpay"
                        ? "border-[#793bed] bg-[#793bed]/5"
                        : "border-white/10 group-hover:border-[#793bed]/50"
                    }`}
                  >
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
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: selectedMethod === "vnpay" ? "#793bed" : "rgba(255,255,255,0.2)" }}
                      >
                        {selectedMethod === "vnpay" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#793bed]" />
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* CTA */}
              <div className="mt-12">
                <button
                  className="w-full bg-[#793bed] text-white py-5 rounded-xl font-bold text-lg tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#793bed]/30"
                  style={{ boxShadow: "0 0 15px rgba(121,59,237,0.4)" }}
                >
                  TIẾN HÀNH THANH TOÁN
                </button>
                <p className="text-center text-slate-400 text-xs mt-6 px-4">
                  Bằng cách nhấn "Tiến hành thanh toán", bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi.
                </p>
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