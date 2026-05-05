import { createPortal } from "react-dom";
import SeatMapReadOnly from "../../Organizer/seatmap/SeatMapReadOnly";
import type { SeatMapData } from "../../../types/config/seatmap";

interface EventDetailModalProps {
  currentEvent: any;
  eventSpec: any;
  eventSpecEventId: string | null;
  eventSpecLoading: boolean;
  selectedEventId: string | null;
  loadingId: string | null;
  showRejectInput: boolean;
  rejectReason: string;
  onClose: () => void;
  onRejectReasonChange: (val: string) => void;
  onShowRejectInput: (val: boolean) => void;
  onShowConfirmApprove: (val: boolean) => void;
  onShowConfirmReject: (val: boolean) => void;
  onShowCancelModal: (val: boolean) => void;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function EventDetailModal({
  currentEvent,
  eventSpec,
  eventSpecEventId,
  eventSpecLoading,
  selectedEventId,
  loadingId,
  showRejectInput,
  rejectReason,
  onClose,
  onRejectReasonChange,
  onShowRejectInput,
  onShowConfirmApprove,
  onShowConfirmReject,
  onShowCancelModal,
}: EventDetailModalProps) {
  if (!currentEvent) return null;

  const isSelectedEventSpec = eventSpecEventId === selectedEventId;
  const specImageUrl =
    isSelectedEventSpec && typeof eventSpec?.specImage === "string"
      ? eventSpec.specImage.trim()
      : "";
  const hasSpecImage = Boolean(specImageUrl);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col rounded-2xl bg-[#18122B] border border-purple-500/30 shadow-[0_0_20px_rgba(124,59,237,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center gap-4 px-8 py-5 border-b border-purple-500/30">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-black tracking-tight text-white">
              {currentEvent.title}
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-1">
              📍 {currentEvent.location}
            </p>
          </div>
          <div className="flex-1" />
          {currentEvent.id === selectedEventId && currentEvent.status === "PendingCancellation" && currentEvent.cancellationReason && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/[0.07] shadow-[0_0_18px_rgba(239,68,68,0.12)] max-w-[280px]">
              <span className="flex-shrink-0 text-base">⚠️</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-0.5">
                  Lý do yêu cầu huỷ
                </p>
                <p className="text-xs text-red-200 leading-snug line-clamp-2">
                  {currentEvent.cancellationReason}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Banner */}
          <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border border-purple-500/20">
            <img
              src={currentEvent.bannerUrl || "/event-placeholder.jpg"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Bắt đầu</p>
              <p className="font-bold">{formatDate(currentEvent.eventStartAt)}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Kết thúc</p>
              <p className="font-bold">{formatDate(currentEvent.eventEndAt)}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Mở bán vé</p>
              <p className="font-bold">{formatDate(currentEvent.ticketSaleStartAt)}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Đóng bán vé</p>
              <p className="font-bold">{formatDate(currentEvent.ticketSaleEndAt)}</p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-white">Mô tả sự kiện</h3>
            <div className="text-slate-300 text-sm leading-relaxed bg-white/5 p-5 rounded-xl border border-white/5">
              {currentEvent.description}
            </div>
          </div>

          {/* ARTISTS */}
          {currentEvent.actorImages?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Nghệ sĩ</h3>
              <div className="flex gap-6 overflow-x-auto pb-2">
                {currentEvent.actorImages.map((a: any) => (
                  <div key={a.id} className="text-center">
                    <img
                      src={a.image}
                      className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
                    />
                    <p className="text-xs mt-2 font-bold text-white">{a.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEAT MAP */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Sơ đồ chỗ ngồi</h3>
            {eventSpecLoading && isSelectedEventSpec ? (
              <div className="h-[500px] w-full bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-slate-400">Đang tải sơ đồ...</span>
                </div>
              </div>
            ) : hasSpecImage ? (
              <div className="h-[500px] w-full bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <img
                  src={specImageUrl}
                  alt="Sơ đồ chỗ ngồi"
                  className="w-full h-full object-contain bg-black/20"
                />
              </div>
            ) : eventSpec?.spec && eventSpecEventId === selectedEventId ? (
              <div className="h-[500px] w-full bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <SeatMapReadOnly
                  seatMapData={JSON.parse(eventSpec.spec) as SeatMapData}
                  ticketTypes={currentEvent.ticketTypes}
                />
              </div>
            ) : (
              <div className="relative aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-purple-500/30 border border-purple-500/50 rounded flex items-center justify-center text-[10px] font-bold text-purple-300">
                  STAGE
                </div>
                <div className="flex flex-col gap-2 mt-10">
                  <div className="flex gap-1 justify-center">
                    <div className="h-3 w-8 bg-amber-500/50 rounded-sm"></div>
                    <div className="h-3 w-8 bg-amber-500/50 rounded-sm"></div>
                    <div className="h-3 w-8 bg-amber-500/50 rounded-sm"></div>
                  </div>
                  <div className="flex gap-1 justify-center">
                    <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                    <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                    <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                    <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                  </div>
                  <div className="flex gap-1 justify-center">
                    <div className="h-3 w-5 bg-slate-700/40 rounded-sm"></div>
                    <div className="h-3 w-5 bg-slate-700/40 rounded-sm"></div>
                    <div className="h-3 w-5 bg-slate-700/40 rounded-sm"></div>
                    <div className="h-3 w-5 bg-slate-700/40 rounded-sm"></div>
                    <div className="h-3 w-5 bg-slate-700/40 rounded-sm"></div>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 italic">
                  Sơ đồ minh hoạ
                </div>
              </div>
            )}
          </div>

          {/* TICKETS */}
          {currentEvent.ticketTypes?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Loại vé</h3>
              <div className="space-y-3">
                {currentEvent.ticketTypes.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex justify-between p-3 rounded-lg bg-white/5 border-l-2 border-purple-500"
                  >
                    <div className="flex flex-col">
                      <span>{t.name}</span>
                      <span className="text-xs text-slate-400 mt-1">
                        Số lượng vé: {(t.quantity ?? 0).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <span className="text-purple-400 font-bold">
                      {t.price.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* POLICY */}
          {currentEvent.policy && (
            <div>
              <h3 className="text-lg font-bold mb-3 text-white">Chính sách</h3>
              <div
                className="text-sm text-slate-300 bg-white/5 p-5 rounded-xl"
                dangerouslySetInnerHTML={{ __html: currentEvent.policy }}
              />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-purple-500/30 flex justify-end gap-4 bg-[#18122B]">
          {currentEvent.status === "PendingReview" && (
            <>
              {!showRejectInput ? (
                <>
                  <button
                    onClick={() => onShowRejectInput(true)}
                    className="px-6 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => onShowConfirmApprove(true)}
                    disabled={loadingId === selectedEventId}
                    className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingId === selectedEventId ? "Đang xử lý..." : "Phê duyệt"}
                  </button>
                </>
              ) : (
                <div className="w-full">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    Lí do từ chối <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectReason === "NEED_MORE_INFO" ? "" : rejectReason}
                    onChange={(e) => onRejectReasonChange(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm mb-4"
                    rows={4}
                    placeholder="Nhập lý do từ chối..."
                  />
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        onShowRejectInput(false);
                        onRejectReasonChange("");
                      }}
                      className="px-6 py-3 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      Huỷ
                    </button>
                    <button
                      onClick={() => onShowConfirmReject(true)}
                      disabled={loadingId === selectedEventId || !rejectReason.trim()}
                      className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Xác nhận từ chối
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {currentEvent.status === "PendingCancellation" && (
            <button
              onClick={() => onShowCancelModal(true)}
              className="px-8 py-3 bg-red-600 text-white rounded-xl"
            >
              Xác nhận huỷ
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}