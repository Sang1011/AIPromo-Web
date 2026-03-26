import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchGetAllOrder } from "../../../store/orderSlice";
import type { OrderItem } from "../../../types/order/order";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

function PaidCard({ event }: { event: OrderItem }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/profile/order-detail-user/orderid=${event.orderId}`)}
      className="glass-card rounded-2xl overflow-hidden flex flex-col sm:flex-row group neon-glow-hover transition-all duration-300 cursor-pointer"
    >
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
              <span>
                Mã đơn hàng:{" "}
                <span className="text-slate-200 font-mono">{event.orderId.slice(0, 8)}...</span>
              </span>
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
              {event.totalPrice.toLocaleString("vi-VN")}{" "}
              <span className="text-xs font-medium text-slate-400">VNĐ</span>
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/order-detail-user/orderid=${event.orderId}`);
            }}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-violet-500/20 hover:text-violet-400 transition-all"
          >
            <span className="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TicketingUser() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const dispatch = useDispatch<AppDispatch>();
  const { allOrder } = useSelector((state: RootState) => state.ORDER);

  const items: OrderItem[] = allOrder?.items ?? [];
  const totalPages = allOrder?.totalPages ?? 1;

  useEffect(() => {
    dispatch(fetchGetAllOrder({ PageNumber: page, PageSize: PAGE_SIZE }));
  }, [page, dispatch]);

  const paidItems = items.filter(
    (e) =>
      (e.status?.trim() === "Paid") &&
      (e.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
        e.orderId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <style>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
        .glass-card { background: rgba(24, 18, 43, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .neon-glow-hover:hover { box-shadow: 0 10px 30px -10px rgba(121, 59, 237, 0.4); border-color: rgba(121, 59, 237, 0.5); transform: translateY(-2px); }
      `}</style>

      <div
        className="min-h-screen p-8 lg:p-12"
        style={{ background: "#0B0B12", fontFamily: "'Space Grotesk', sans-serif", color: "#F1F1F1" }}
      >
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Vé của tôi</h1>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Danh sách các vé đã thanh toán của bạn.
            </p>
          </div>
          <div className="relative">
            <input
              className="bg-[#231c38] border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 w-64 outline-none"
              placeholder="Tìm kiếm đơn hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
              search
            </span>
          </div>
        </header>

        {/* Tab tĩnh Paid */}
        <div className="flex items-center gap-8 border-b border-white/5 mb-8">
          <button className="pb-4 text-sm font-bold border-b-2 text-violet-400 border-violet-500">
            Đã thanh toán
          </button>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {paidItems.length > 0 ? (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg font-bold">Đặt chỗ hiện có</h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {paidItems.map((e) => (
                  <PaidCard key={e.orderId} event={e} />
                ))}
              </div>
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <span className="material-symbols-outlined text-5xl mb-3">confirmation_number</span>
              <p className="text-sm">Không có vé đã thanh toán nào.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <footer className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-500 disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <p className="text-sm font-bold text-slate-300 px-4">
              Trang {page} / {totalPages}
            </p>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
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