import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import {
  fetchPendingEvents,
  fetchPublishEvent,
  fetchCancelEvent,
  fetchRejectPublishEvent,
  fetchEventById,
} from "../../../store/eventSlice";
import { fetchEventSpec, clearEventSpec } from "../../../store/staffEventSlice";
import toast from "react-hot-toast";
import { CheckCircle, Ban } from "lucide-react";
import { MdRefresh } from "react-icons/md";
import SeatMapReadOnly from "../../Organizer/seatmap/SeatMapReadOnly";
import type { SeatMapData } from "../../../types/config/seatmap";

export default function StaffEventApprovalQueue() {
  const dispatch = useDispatch<AppDispatch>();

  const events = useSelector((state: RootState) => state.EVENT.events);
  const [localEvents, setLocalEvents] = useState<any[]>([]);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Sync Redux state to local state for stable rendering
  useEffect(() => {
    setLocalEvents(events || []);
  }, [events]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const [showConfirmApprove, setShowConfirmApprove] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);

  const currentEvent = useSelector(
    (state: RootState) => state.EVENT.currentEvent,
  );
  const eventSpec = useSelector(
    (state: RootState) => state.STAFF_EVENT.eventSpec,
  );
  const eventSpecEventId = useSelector(
    (state: RootState) => state.STAFF_EVENT.eventId,
  );
  const eventSpecLoading = useSelector(
    (state: RootState) => state.STAFF_EVENT.loading,
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 10;

  // Tính toán pagination dựa trên số sự kiện thực tế đang hiển thị (client-side)
  const currentCount = localEvents.length;
  const displayTotalPages = Math.max(1, Math.ceil(currentCount / pageSize));
  const endCount = Math.min(page * pageSize, currentCount);

  // Lấy dữ liệu cho trang hiện tại
  const currentItems = localEvents.slice((page - 1) * pageSize, page * pageSize);

  const fetchPendingList = useCallback(async () => {
    setIsLoading(true);
    try {
      await dispatch(
        fetchPendingEvents({
          PageNumber: 1,
          PageSize: 1000,
          Statuses: "PendingReview,PendingCancellation",
        }),
      ).unwrap();
    } catch (err) {
      toast.error("Không thể tải danh sách sự kiện");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchPendingList();
  }, [fetchPendingList]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      await fetchPendingList();
      setPage(1);
    } catch {
      toast.error("Không thể làm mới danh sách");
    } finally {
      setIsLoading(false);
    }
  };

  const glassCard =
    "bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 hover:shadow-primary/20 hover:border-primary/20 transition-all duration-300";

  const statusMap: any = {
    PendingReview: {
      label: "Chờ duyệt",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    },
    PendingCancellation: {
      label: "Chờ huỷ",
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
    },
    Published: {
      label: "Đã đăng",
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
    },
    Cancelled: {
      label: "Đã huỷ",
      color: "text-gray-400",
      bg: "bg-gray-500/10",
      border: "border-gray-500/30",
    },
  };

  const categoryColor: any = {
    MUSIC: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    TECH: "bg-green-500/20 text-green-300 border-green-500/30",
    ART: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    FINANCE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    OTHER: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const openDetailModal = async (eventId: string) => {
    setSelectedEventId(eventId);
    setShowDetailModal(true);

    // Check if we already have data for this event
    const isSameEvent = currentEvent?.id === eventId;
    const hasSpecForThisEvent = eventSpec !== null && eventSpecEventId === eventId;

    if (isSameEvent && hasSpecForThisEvent) {
      return;
    }

    try {
      setLoadingId(eventId);
      // Only fetch event details if it's a different event
      if (!isSameEvent) {
        await dispatch(fetchEventById(eventId)).unwrap();
      }
      // Always fetch spec for the selected event to ensure fresh data
      await dispatch(fetchEventSpec(eventId)).unwrap();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Không thể tải chi tiết sự kiện");
    } finally {
      setLoadingId(null);
    }
  };

  const handleApproveFromModal = async () => {
    if (!selectedEventId) return;
    if (loadingId) return;

    setLoadingId(selectedEventId);
    try {
      await dispatch(fetchPublishEvent(selectedEventId)).unwrap();
      toast.success("Đã phê duyệt sự kiện");
      setShowDetailModal(false);
      setShowConfirmApprove(false);
      dispatch(clearEventSpec());
      refresh();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.message ??
        "Phê duyệt thất bại";
      toast.error(msg);
    }
    setLoadingId(null);
  };

  const handleRejectFromModal = async () => {
    if (!selectedEventId) return;
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    if (loadingId) return;

    setLoadingId(selectedEventId);
    try {
      await dispatch(
        fetchRejectPublishEvent({
          eventId: selectedEventId,
          reason: rejectReason,
        }),
      ).unwrap();
      toast.success("Đã từ chối yêu cầu phê duyệt");
      setShowDetailModal(false);
      setShowConfirmReject(false);
      setShowRejectInput(false);
      setRejectReason("");
      dispatch(clearEventSpec());
      refresh();
    } catch (err) {
      const msg =
        (err as any)?.response?.data?.detail ??
        (err as any)?.message ??
        "Từ chối thất bại";
      toast.error(msg);
    }
    setLoadingId(null);
  };

  const handleCancelFromModal = async () => {
    if (!selectedEventId) return;
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do huỷ");
      return;
    }
    if (loadingId) return;

    setLoadingId(selectedEventId);
    try {
      await dispatch(
        fetchCancelEvent({ eventId: selectedEventId, reason: cancelReason }),
      ).unwrap();
      toast.success("Đã huỷ sự kiện");
      setShowDetailModal(false);
      setShowCancelModal(false);
      setCancelReason("");
      dispatch(clearEventSpec());
      refresh();
    } catch {
      toast.error("Huỷ sự kiện thất bại");
    }
    setLoadingId(null);
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black text-white">
              Danh sách chờ duyệt sự kiện
            </h1>
            <p className="text-sm text-slate-400">
              Bảng điều khiển kiểm duyệt toàn hệ thống cho các đăng ký sự kiện.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="bg-[#1b1230] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <MdRefresh className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Column Headers */}
          <div className="grid grid-cols-12 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-5">Chi tiết sự kiện</div>
            <div className="col-span-2">Ngày đăng ký</div>
            <div className="col-span-2">Danh mục</div>
            <div className="col-span-1">Trạng thái</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>

        {isLoading && currentItems.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-8">
            Đang tải...
          </div>
        ) : currentItems.length > 0 ? (
          currentItems.map((evt: any, index: number) => {
            const category =
              evt.categories?.[0]?.name?.toUpperCase() ?? "OTHER";
            const status = statusMap[evt.status] ?? {
              label: evt.status,
              color: "text-slate-400",
              bg: "bg-slate-500/10",
              border: "border-slate-500/30",
            };

            return (
              <div
                key={`${evt.id}-${index}`}
                className={`grid grid-cols-12 items-center gap-4 p-5 ${glassCard} rounded-2xl`}
              >
                <div className="col-span-5 flex items-center gap-5">
                  <div className="size-16 rounded-2xl overflow-hidden border border-white/10">
                    <img
                      src={evt.bannerUrl || "/event-placeholder.jpg"}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-lg font-bold text-white truncate mb-1">
                      {evt.title}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {evt.location}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-slate-300">
                    {formatDate(evt.createdAt)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${categoryColor[category] ?? categoryColor.OTHER}`}
                  >
                    {category}
                  </span>
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase border whitespace-nowrap ${status.bg} ${status.color} ${status.border}`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => openDetailModal(evt.id ?? evt.eventId)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all border border-primary/30"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })
        ) : null}

        {currentItems.length === 0 && !isLoading && (
          <div className="text-center text-sm text-slate-400 py-8">
            Không có sự kiện nào đang chờ phê duyệt
          </div>
        )}

        {/* Pagination */}
        {currentCount > 0 && (
          <div className="px-8 py-4 border-t border-[#302447] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white/5">
            <p className="text-xs text-[#a592c8]">
              Hiển thị <span className="text-white font-bold">{endCount}</span>{" "}
              trên <span className="text-white font-bold">{currentCount}</span>{" "}
              sự kiện
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1 rounded-md text-sm ${page <= 1 ? "text-[#6b5b86] bg-[#0f0b16]" : "text-white bg-[#302447] hover:bg-white/10"}`}
              >
                Prev
              </button>
              <div className="hidden sm:flex items-center gap-1">
                {Array.from(
                  { length: displayTotalPages },
                  (_, idx) => idx + 1,
                ).map((p) => {
                  const show =
                    displayTotalPages <= 10 ||
                    Math.abs(p - page) <= 3 ||
                    p === 1 ||
                    p === displayTotalPages;
                  if (!show) {
                    if (p === 2 && page > 6)
                      return (
                        <span key={p} className="px-2">
                          ...
                        </span>
                      );
                    if (
                      p === displayTotalPages - 1 &&
                      page < displayTotalPages - 5
                    )
                      return (
                        <span key={p} className="px-2">
                          ...
                        </span>
                      );
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded-md text-sm ${p === page ? "bg-primary text-white" : "bg-[#1b1230] text-[#a592c8] hover:bg-white/5"}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={page >= displayTotalPages}
                onClick={() =>
                  setPage((p) => Math.min(displayTotalPages, p + 1))
                }
                className={`px-3 py-1 rounded-md text-sm ${page >= displayTotalPages ? "text-[#6b5b86] bg-[#0f0b16]" : "text-white bg-[#302447] hover:bg-white/10"}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000]">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-xl w-[400px]">
            <h2 className="text-white font-bold mb-3">Lý do huỷ sự kiện</h2>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm"
              rows={4}
              placeholder="Nhập lý do huỷ..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm text-slate-300"
              >
                Huỷ
              </button>
              <button
                onClick={handleCancelFromModal}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Detail Modal */}
      {showDetailModal && currentEvent && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
          onClick={() => {
            setShowDetailModal(false);
            // Don't clear spec here - keep it cached for faster reopening
          }}
        >
          <div
            className="relative w-full max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col rounded-2xl bg-[#18122B] border border-purple-500/30 shadow-[0_0_20px_rgba(124,59,237,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-purple-500/30">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  {currentEvent.title}
                </h1>
                <p className="text-slate-400 text-sm flex items-center gap-1">
                  📍 {currentEvent.location}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  // Don't clear spec here - keep it cached for faster reopening
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
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
                  <p className="font-bold">
                    {formatDate(currentEvent.eventStartAt)}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-xs text-slate-400">Kết thúc</p>
                  <p className="font-bold">
                    {formatDate(currentEvent.eventEndAt)}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-xs text-slate-400">Mở bán vé</p>
                  <p className="font-bold">
                    {formatDate(currentEvent.ticketSaleStartAt)}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-xs text-slate-400">Đóng bán vé</p>
                  <p className="font-bold">
                    {formatDate(currentEvent.ticketSaleEndAt)}
                  </p>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <h3 className="text-lg font-bold mb-3 text-white">
                  Mô tả sự kiện
                </h3>
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
                        <p className="text-xs mt-2 font-bold text-white">
                          {a.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEAT MAP */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white">
                  Sơ đồ chỗ ngồi
                </h3>

                {eventSpecLoading && eventSpecEventId === selectedEventId ? (
                  <div className="h-[500px] w-full bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-slate-400">Đang tải sơ đồ...</span>
                    </div>
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
                    {/* Stage */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-purple-500/30 border border-purple-500/50 rounded flex items-center justify-center text-[10px] font-bold text-purple-300">
                      STAGE
                    </div>

                    {/* Seats */}
                    <div className="flex flex-col gap-2 mt-10">
                      {/* VIP row */}
                      <div className="flex gap-1 justify-center">
                        <div className="h-3 w-8 bg-amber-500/50 rounded-sm"></div>
                        <div className="h-3 w-8 bg-amber-500/50 rounded-sm"></div>
                        <div className="h-3 w-8 bg-amber-500/50 rounded-sm"></div>
                      </div>

                      {/* normal row */}
                      <div className="flex gap-1 justify-center">
                        <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                        <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                        <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                        <div className="h-3 w-6 bg-slate-500/40 rounded-sm"></div>
                      </div>

                      {/* cheap row */}
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
                        <span>{t.name}</span>
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
                  <h3 className="text-lg font-bold mb-3 text-white">
                    Chính sách
                  </h3>
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
                        onClick={() => setShowRejectInput(true)}
                        className="px-6 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                      >
                        Từ chối
                      </button>

                      <button
                        onClick={() => setShowConfirmApprove(true)}
                        disabled={loadingId === selectedEventId}
                        className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingId === selectedEventId
                          ? "Đang xử lý..."
                          : "Phê duyệt"}
                      </button>
                    </>
                  ) : (
                    <div className="w-full">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                        Lí do từ chối <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectReason === "NEED_MORE_INFO" ? "" : rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm mb-4"
                        rows={4}
                        placeholder="Nhập lý do từ chối..."
                      />
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => {
                            setShowRejectInput(false);
                            setRejectReason("");
                          }}
                          className="px-6 py-3 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 transition-colors"
                        >
                          Huỷ
                        </button>
                        <button
                          onClick={() => setShowConfirmReject(true)}
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
                  onClick={() => setShowCancelModal(true)}
                  className="px-8 py-3 bg-red-600 text-white rounded-xl"
                >
                  Xác nhận huỷ
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal - Approve */}
      {showConfirmApprove && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.1)] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-purple-500/20 flex items-center gap-3">
              <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="text-emerald-500 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-white">Xác nhận phê duyệt</h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-slate-300 text-sm">
                Bạn có chắc chắn muốn <span className="text-emerald-500 font-bold">phê duyệt</span> sự kiện{" "}
                <span className="text-purple-400 font-bold">{currentEvent?.title}</span>?
              </p>
              <p className="text-slate-400 text-xs mt-2">
                Hành động này sẽ không thể hoàn tác.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-purple-500/20 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmApprove(false)}
                disabled={loadingId === selectedEventId}
                className="px-5 py-2.5 rounded-xl border border-slate-500/50 text-slate-400 text-sm font-bold hover:bg-slate-500/10 transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleApproveFromModal}
                disabled={loadingId === selectedEventId}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {loadingId === selectedEventId ? "Đang xử lý..." : "Phê duyệt"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal - Reject */}
      {showConfirmReject && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.1)] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-purple-500/20 flex items-center gap-3">
              <div className="size-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Ban className="text-red-500 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-white">Xác nhận từ chối</h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-slate-300 text-sm">
                Bạn có chắc chắn muốn <span className="text-red-500 font-bold">từ chối</span> sự kiện{" "}
                <span className="text-purple-400 font-bold">{currentEvent?.title}</span>?
              </p>
              <p className="text-slate-400 text-xs mt-2">
                Hành động này sẽ không thể hoàn tác.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-purple-500/20 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmReject(false);
                  setShowRejectInput(false);
                  setRejectReason("");
                }}
                disabled={loadingId === selectedEventId}
                className="px-5 py-2.5 rounded-xl border border-slate-500/50 text-slate-400 text-sm font-bold hover:bg-slate-500/10 transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectFromModal}
                disabled={loadingId === selectedEventId}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {loadingId === selectedEventId ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
