import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import { fetchGetDetailOrder } from '../../../store/orderSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { generateQR } from '../../../utils/generateQR'; // chỉnh lại path nếu khác

// ── Helpers ────────────────────────────────────────────────────────
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const formatVND = (amount: number) =>
  amount.toLocaleString('vi-VN') + ' VNĐ';

const statusColor = (status: string) => {
  switch (status?.trim()) {
    case 'Paid': return { bg: '#793bed', label: 'Đã thanh toán' };
    case 'Pending': return { bg: '#f59e0b', label: 'Chờ thanh toán' };
    case 'Cancelled': return { bg: '#ef4444', label: 'Đã hủy' };
    default: return { bg: '#64748b', label: status };
  }
};

// ── QR Modal ───────────────────────────────────────────────────────
interface QRModalProps {
  ticket: {
    qrCode: string;
    ticketTypeName: string;
    sessionTitle: string;
    sessionStartTime: string;
    price: number;
  };
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ ticket, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQR(ticket.qrCode)
      .then((url) => {
        setQrDataUrl(url);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tạo mã QR, vui lòng thử lại.');
        setLoading(false);
      });
  }, [ticket.qrCode]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 z-10 overflow-hidden"
        style={{ background: '#18122B', boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(121,59,237,0.15)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between border-b border-white/5"
          style={{ background: 'rgba(121,59,237,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]" style={{ color: '#793bed' }}>
              qr_code_2
            </span>
            <h3 className="text-white font-bold text-base">Mã QR vé</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* QR Image */}
        <div className="flex flex-col items-center px-8 py-8">
          {loading && (
            <div className="w-52 h-52 flex items-center justify-center">
              <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#793bed" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {error && (
            <div className="w-52 h-52 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-red-400 text-4xl">error</span>
              <p className="text-red-400 text-xs text-center">{error}</p>
            </div>
          )}

          {qrDataUrl && !loading && (
            <div
              className="p-3 rounded-2xl"
              style={{ background: 'white', boxShadow: '0 0 40px rgba(121,59,237,0.25)' }}
            >
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 block" />
            </div>
          )}

          {/* Ticket Info */}
          <div className="mt-6 w-full space-y-3">
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Loại vé</span>
              <span className="text-white text-sm font-bold" style={{ color: '#a78bfa' }}>
                {ticket.ticketTypeName}
              </span>
            </div>

            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Phiên</span>
              <span className="text-white text-sm font-semibold">{ticket.sessionTitle}</span>
            </div>

            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Giờ bắt đầu</span>
              <span className="text-white text-sm font-semibold">{formatTime(ticket.sessionStartTime)}</span>
            </div>

            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Giá vé</span>
              <span className="text-sm font-bold" style={{ color: '#793bed' }}>
                {formatVND(ticket.price)}
              </span>
            </div>
          </div>

          <p className="mt-4 text-[10px] font-mono text-slate-600 tracking-wider text-center break-all">
            {ticket.qrCode}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────
const OrderDetailUser: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const orderId = id?.replace('orderid=', '');

  const orderDetail = useSelector((state: RootState) => state.ORDER.orderDetail) as any;

  const [selectedTicket, setSelectedTicket] = useState<null | {
    qrCode: string;
    ticketTypeName: string;
    sessionTitle: string;
    sessionStartTime: string;
    price: number;
  }>(null);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchGetDetailOrder(orderId));
    }
  }, [orderId, dispatch]);

  // ── Loading ──────────────────────────────────────────────────────
  if (!orderDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0B12' }}>
        <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#793bed" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  const {
    status,
    subTotal,
    totalPrice,
    discountAmount,
    eventTitle,
    bannerUrl,
    location,
    eventStartAt,
    tickets,
  } = orderDetail;

  const { bg: statusBg, label: statusLabel } = statusColor(status);

  return (
    <>
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      `}</style>

      {/* QR Modal */}
      {selectedTicket && (
        <QRModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      <div
        className="min-h-screen"
        style={{ background: '#0B0B12', fontFamily: "'Space Grotesk', sans-serif", color: '#F1F1F1' }}
      >
        <main className="pt-10 px-4 max-w-2xl mx-auto pb-20">

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-[#793bed] transition-colors mb-6 group"
          >
            <span className="material-symbols-outlined group-active:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span className="font-medium">Sự kiện của tôi</span>
          </button>

          {/* Event Banner Card */}
          <div
            className="relative rounded-2xl overflow-hidden border border-white/5 mb-6"
            style={{ background: '#18122B', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
          >
            {/* Banner */}
            <div className="h-52 w-full relative">
              <img
                src={bannerUrl ?? 'https://placehold.co/800x400?text=No+Image'}
                alt={eventTitle}
                className="w-full h-full object-cover brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18122B] via-transparent to-transparent" />

              {/* Status Badge */}
              <span
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-white"
                style={{ background: statusBg, boxShadow: `0 0 20px ${statusBg}66` }}
              >
                {statusLabel}
              </span>
            </div>

            {/* Event Info */}
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-5 leading-tight">{eventTitle}</h1>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(121,59,237,0.12)', color: '#793bed' }}
                  >
                    <span className="material-symbols-outlined text-xl">calendar_today</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Ngày</p>
                    <p className="text-sm font-semibold">{formatDate(eventStartAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(121,59,237,0.12)', color: '#793bed' }}
                  >
                    <span className="material-symbols-outlined text-xl">location_on</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Địa điểm</p>
                    <p className="text-sm font-semibold">{location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <h2 className="text-lg font-bold mb-4 px-1">
            Vé của bạn ({tickets?.length ?? 0})
          </h2>

          <div className="space-y-4 mb-10">
            {(tickets ?? []).map((ticket: any) => (
              <div
                key={ticket.ticketId}
                className="rounded-2xl overflow-hidden border border-white/5"
                style={{ background: '#18122B' }}
              >
                <div className="p-6">
                  {/* Ticket header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex-1">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
                        Loại vé
                      </span>
                      <h3 className="text-xl font-bold" style={{ color: '#793bed' }}>
                        {ticket.ticketTypeName}
                      </h3>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
                        Phiên
                      </span>
                      <p className="text-sm font-semibold">{ticket.sessionTitle}</p>
                      <p className="text-xs text-slate-400">{formatTime(ticket.sessionStartTime)}</p>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
                        Giá
                      </span>
                      <p className="text-sm font-semibold">{formatVND(ticket.price)}</p>
                    </div>
                  </div>

                  {/* Seat code nếu có */}
                  {ticket.seatCode && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
                      <span className="material-symbols-outlined text-sm">event_seat</span>
                      <span>Ghế: <span className="text-white font-mono">{ticket.seatCode}</span></span>
                    </div>
                  )}

                  {/* QR Button */}
                  <div className="pt-5 border-t border-dashed border-white/10 flex flex-col items-center">
                    <button
                      onClick={() =>
                        setSelectedTicket({
                          qrCode: ticket.qrCode,
                          ticketTypeName: ticket.ticketTypeName,
                          sessionTitle: ticket.sessionTitle,
                          sessionStartTime: ticket.sessionStartTime,
                          price: ticket.price,
                        })
                      }
                      className="w-full py-3 rounded-xl font-bold tracking-widest uppercase text-xs text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98]"
                      style={{
                        background: '#793bed',
                        boxShadow: '0 0 20px rgba(121,59,237,0.3)',
                      }}
                    >
                      <span className="material-symbols-outlined text-base">qr_code_2</span>
                      Xem mã QR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4 px-1">Tổng đơn hàng</h2>
            <div
              className="rounded-2xl p-6 border border-white/5 space-y-4"
              style={{ background: '#18122B' }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tạm tính</span>
                <span className="text-slate-200">{formatVND(subTotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Giảm giá</span>
                <span style={{ color: discountAmount > 0 ? '#00e5ff' : '#64748b' }}>
                  {discountAmount > 0 ? `- ${formatVND(discountAmount)}` : formatVND(0)}
                </span>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-lg font-bold">Tổng cộng</span>
                <span className="text-xl font-bold" style={{ color: '#793bed' }}>
                  {formatVND(totalPrice)}
                </span>
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  );
};

export default OrderDetailUser;