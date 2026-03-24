import { useState } from "react";

const TICKETS = [
  { type: "VIP Ticket", quantity: 2, unitPrice: 1500000 },
  { type: "Standard Ticket", quantity: 1, unitPrice: 500000 },
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
          <div className="text-2xl font-bold text-[#793bed] drop-shadow-[0_0_10px_rgba(121,59,237,0.5)] tracking-tight">
            Neon Pulse
          </div>
          <nav className="hidden md:flex items-center gap-8 font-bold tracking-tight">
            {["Explore", "Events"].map((item) => (
              <a key={item} href="#" className="text-slate-400 hover:text-slate-100 transition-colors">
                {item}
              </a>
            ))}
            <a href="#" className="text-[#793bed] border-b-2 border-[#793bed] pb-1">
              My Tickets
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-slate-400 hover:bg-white/5 p-2 rounded-full transition-all duration-300">
              notifications
            </button>
            <button className="material-symbols-outlined text-slate-400 hover:bg-white/5 p-2 rounded-full transition-all duration-300">
              account_circle
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <section>
              <h1 className="text-4xl font-bold tracking-tight mb-8">Order Summary</h1>

              {/* Event Card */}
              <div className="bg-[#18122B] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video w-full relative overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUheINcsV58keqtjkefy2MYs5DOxgUt78rY61QShhIYb2d5Mgo_nFktfkTNsMJ1ZxJAKpdLhsXznm9Pb0bLT71l2YtMag5xhuJpDrG9z-6vUXOm07deJpyWtJhiLMNEw8fU5v8JZ1ROvpbM3d2C1y0w4SBfzE6r_4DAn_bHsIIFie30-f7NmfGkwkQlUPGWBKa4rSkT0t_Usu_Bz5WnRqkuBRKqfJ_GawnVIK-3Ft9gAJGyw4kQ5VrVTE02R0V2bTxKru7UckFm8s8"
                    alt="Neon Night Music Festival"
                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500 scale-105 hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18122B] via-transparent to-transparent" />
                </div>
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">
                    Neon Night Music Festival 2024
                  </h2>
                  <div className="flex flex-wrap gap-6 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#793bed] text-lg">calendar_today</span>
                      <span>22/10/2024 - 19:00</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#793bed] text-lg">location_on</span>
                      <span>Hanoi Opera House</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Selected Tickets */}
            <section className="bg-[#18122B] border border-white/5 rounded-2xl p-8 space-y-6">
              <h3 className="text-xl font-bold border-b border-white/10 pb-4">Selected Tickets</h3>
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
                { label: "Subtotal", value: subtotal },
                { label: "Service Fee (2%)", value: serviceFee },
                { label: "VAT (10%)", value: vat },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm text-slate-400">
                  <span>{label}</span>
                  <span>{formatVND(value)}</span>
                </div>
              ))}
              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-xl font-bold">Total Payment</span>
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
              <h3 className="text-xl font-bold mb-8">Payment Methods</h3>
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
                        <span className="font-bold">User Wallet</span>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center"
                        style={{ borderColor: selectedMethod === "wallet" ? "#793bed" : undefined }}>
                        {selectedMethod === "wallet" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#793bed]" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Available Balance</span>
                      <span className="font-medium">{formatVND(WALLET_BALANCE)}</span>
                    </div>
                    {isWalletInsufficient && (
                      <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">warning</span>
                        <p className="text-xs text-red-400 font-medium">
                          Insufficient balance. Please top up or choose another method.
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
                      <div className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center"
                        style={{ borderColor: selectedMethod === "vnpay" ? "#793bed" : undefined }}>
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
                  PROCEED TO PAYMENT
                </button>
                <p className="text-center text-slate-400 text-xs mt-6 px-4">
                  By clicking "Proceed to Payment", you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </section>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-8 text-slate-500 grayscale opacity-50">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">verified_user</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Secure SSL</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">payment_card</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">PCI Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden bg-[#0B0B12]/90 backdrop-blur-lg border-t border-white/5 fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 z-50">
        {[
          { icon: "home", label: "Home", active: false },
          { icon: "search", label: "Search", active: false },
          { icon: "confirmation_number", label: "Tickets", active: true },
          { icon: "person", label: "Profile", active: false },
        ].map(({ icon, label, active }) => (
          <a
            key={label}
            href="#"
            className={`flex flex-col items-center justify-center text-[10px] font-medium uppercase tracking-widest active:scale-90 transition-all ${
              active
                ? "text-[#793bed] bg-[#793bed]/10 rounded-xl px-4 py-1"
                : "text-slate-500"
            }`}
          >
            <span className="material-symbols-outlined mb-1">{icon}</span>
            <span>{label}</span>
          </a>
        ))}
      </nav>
      <div className="h-24 md:hidden" />
    </div>
  );
}