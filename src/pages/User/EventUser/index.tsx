import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchGetAllOrder } from "../../../store/orderSlice";
import type { OrderItem } from "../../../types/order/order";

type Tab = "Pending" | "Paid" | "Cancelled" | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "Pending", label: "Chờ thanh toán" },
  { key: "Paid", label: "Đã thanh toán" },
  { key: "Cancelled", label: "Đã hủy" },
  { key: "all", label: "Tất cả" },
];

// Hàm xử lý khoảng trắng thừa từ API (ví dụ: "Cancelled ")
const normalize = (s: string) => s?.trim() || "";

// --- CÁC COMPONENT CARD (GIỮ NGUYÊN UI CŨ) ---

function PaidCard({ event }: { event: OrderItem }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col sm:flex-row group neon-glow-hover transition-all duration-300">
      <div className="sm:w-48 h-48 sm:h-auto overflow-hidden flex-shrink-0">
        <img
          src={event.bannerUrl ?? "https://placehold.co/192x192?text=No+Image"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex-grow p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-1">
              {event.eventTitle}
            </h3>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-emerald-500/20 whitespace-nowrap">
              Đã thanh toán
            </span>
          </div>
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="material-symbols-outlined text-sm">fingerprint</span>
              <span>Mã đơn hàng: <span className="text-slate-200 font-mono">{event.orderId.slice(0, 8)}...</span></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="material-symbols-outlined text-sm">confirmation_number</span>
              <span>{event.totalTickets} Vé</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tổng cộng</p>
            <p className="text-lg font-bold text-white">
              {event.totalPrice.toLocaleString("vi-VN")} <span className="text-xs font-medium text-slate-400">VNĐ</span>
            </p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-violet-500/20 hover:text-violet-400 transition-all">
            <span className="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelledCard({ event }: { event: OrderItem }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col sm:flex-row group hover:opacity-100 transition-all duration-300 opacity-75">
      <div className="sm:w-48 h-40 sm:h-auto overflow-hidden flex-shrink-0 grayscale contrast-125">
        <img src={event.bannerUrl ?? ""} className="w-full h-full object-cover" />
      </div>
      <div className="flex-grow p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-md font-bold text-slate-300">{event.eventTitle}</h3>
            <span className="bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-rose-500/20 whitespace-nowrap">
              Đã hủy
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-mono">Mã: {event.orderId.slice(0, 8)}...</p>
            <p className="text-[10px] text-slate-500">{event.totalTickets} Vé</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <p className="text-md font-bold text-slate-400">{event.totalPrice.toLocaleString("vi-VN")} <span className="text-xs">VNĐ</span></p>
          <button className="text-slate-500 hover:text-violet-400 transition-colors">
            <span className="material-symbols-outlined text-xl">visibility</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PendingCard({ event }: { event: OrderItem }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col sm:flex-row group neon-glow-hover transition-all duration-300 border-amber-500/20">
      <div className="sm:w-48 h-48 sm:h-auto overflow-hidden flex-shrink-0">
        <img src={event.bannerUrl ?? ""} className="w-full h-full object-cover" />
      </div>
      <div className="flex-grow p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{event.eventTitle}</h3>
            <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-amber-500/20">
              Chờ thanh toán
            </span>
          </div>
          <p className="text-xs text-slate-400">Mã đơn: {event.orderId.slice(0, 8)}...</p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <p className="text-lg font-bold text-white">{event.totalPrice.toLocaleString("vi-VN")} VNĐ</p>
          <button className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500 hover:text-white transition-all">
            Thanh toán ngay
          </button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENT CHÍNH ---

export default function EventUser() {
  const [activeTab, setActiveTab] = useState<Tab>("Pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const dispatch = useDispatch<AppDispatch>();
  const { allOrder } = useSelector((state: RootState) => state.ORDER);
  const items: OrderItem[] = allOrder?.items ?? [];
  const totalPages = allOrder?.totalPages ?? 1;

  useEffect(() => {
    dispatch(fetchGetAllOrder({ PageNumber: page, PageSize: PAGE_SIZE }));
  }, [page, dispatch]);

  // Lọc theo search trước
  const searchFiltered = items.filter((e) =>
    e.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
    e.orderId.toLowerCase().includes(search.toLowerCase())
  );

  // Chia mảng theo trạng thái thực tế từ API
  const pendingItems = searchFiltered.filter((e) => normalize(e.status) === "Pending");
  const paidItems = searchFiltered.filter((e) => normalize(e.status) === "Paid");
  const cancelledItems = searchFiltered.filter((e) => normalize(e.status) === "Cancelled");

  return (
    <>
      <style>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
        .glass-card { background: rgba(24, 18, 43, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .neon-glow-hover:hover { box-shadow: 0 10px 30px -10px rgba(121, 59, 237, 0.4); border-color: rgba(121, 59, 237, 0.5); transform: translateY(-2px); }
      `}</style>

      <div className="min-h-screen p-8 lg:p-12" style={{ background: "#0B0B12", fontFamily: "'Space Grotesk', sans-serif", color: "#F1F1F1" }}>
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Sự kiện của tôi</h1>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">Quản lý đặt chỗ và theo dõi các trải nghiệm của bạn.</p>
          </div>
          <div className="relative">
            <input
              className="bg-[#231c38] border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 w-64 outline-none"
              placeholder="Tìm kiếm đơn hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-white/5 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`pb-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.key ? "text-violet-400 border-violet-500" : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="space-y-12">
          {/* Pending Section */}
          {(activeTab === "Pending" || activeTab === "all") && pendingItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-lg font-bold">Đang chờ thanh toán</h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {pendingItems.map((e) => <PendingCard key={e.orderId} event={e} />)}
              </div>
            </section>
          )}

          {/* Paid Section */}
          {(activeTab === "Paid" || activeTab === "all") && paidItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg font-bold">Đặt chỗ hiện có</h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {paidItems.map((e) => <PaidCard key={e.orderId} event={e} />)}
              </div>
            </section>
          )}

          {/* Cancelled Section */}
          {(activeTab === "Cancelled" || activeTab === "all") && cancelledItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                <h2 className="text-lg font-bold">Lịch sử hủy vé</h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {cancelledItems.map((e) => <CancelledCard key={e.orderId} event={e} />)}
              </div>
            </section>
          )}

          {/* Empty States */}
          {searchFiltered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <span className="material-symbols-outlined text-5xl mb-3">inventory_2</span>
              <p className="text-sm">Không có đơn hàng nào.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <footer className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-500 disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <p className="text-sm font-bold text-slate-300 px-4">Trang {page} / {totalPages}</p>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-violet-400"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}