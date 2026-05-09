import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  fetchEventSpec,
  clearEventSpec,
} from "../../../store/staffEventSlice";
import toast from "react-hot-toast";
import { MdRefresh } from "react-icons/md";
import EventDetailModal from "./EventDetailModal";
import ApproveConfirmModal from "./ApproveConfirmModal";
import RejectConfirmModal from "./RejectConfirmModal";

export default function StaffEventApprovalQueue() {
  const dispatch = useDispatch<AppDispatch>();

  const events = useSelector((state: RootState) => state.EVENT.events);
  const currentEvent = useSelector(
    (state: RootState) => state.EVENT.currentEvent
  );

  const eventSpec = useSelector(
    (state: RootState) => state.STAFF_EVENT.eventSpec
  );

  const eventSpecEventId = useSelector(
    (state: RootState) => state.STAFF_EVENT.eventId
  );

  const eventSpecLoading = useSelector(
    (state: RootState) => state.STAFF_EVENT.loading
  );

  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const [showConfirmApprove, setShowConfirmApprove] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    setLocalEvents(events || []);
  }, [events]);

  const currentCount = localEvents.length;

  const displayTotalPages = useMemo(
    () => Math.max(1, Math.ceil(currentCount / pageSize)),
    [currentCount]
  );

  const endCount = Math.min(page * pageSize, currentCount);

  const currentItems = useMemo(() => {
    return localEvents.slice((page - 1) * pageSize, page * pageSize);
  }, [localEvents, page]);

  const fetchPendingList = useCallback(async () => {
    setIsLoading(true);

    try {
      await dispatch(
        fetchPendingEvents({
          PageNumber: 1,
          PageSize: 1000,
          Statuses: "PendingReview,PendingCancellation",
        })
      ).unwrap();
    } catch {
      toast.error("Không thể tải danh sách sự kiện");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchPendingList();
  }, [fetchPendingList]);

  useEffect(() => {
    if (showDetailModal) return;

    setShowRejectInput(false);
    setShowConfirmApprove(false);
    setShowConfirmReject(false);
    setShowCancelModal(false);

    setRejectReason("");
    setCancelReason("");

    setSelectedEventId(null);
    setLoadingId(null);

    dispatch(clearEventSpec());
  }, [showDetailModal, dispatch]);

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

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const openDetailModal = async (eventId: string) => {
    setSelectedEventId(eventId);
    setShowDetailModal(true);

    const isSameEvent = currentEvent?.id === eventId;

    const hasSpecForThisEvent =
      eventSpec !== null && eventSpecEventId === eventId;

    try {
      if (!isSameEvent) {
        await dispatch(fetchEventById(eventId)).unwrap();
      }

      if (!hasSpecForThisEvent) {
        await dispatch(fetchEventSpec(eventId)).unwrap();
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          err?.message ??
          "Không thể tải chi tiết sự kiện"
      );
    }
  };

  const handleApproveFromModal = async () => {
    if (!selectedEventId || loadingId) return;

    setLoadingId(selectedEventId);

    try {
      await dispatch(fetchPublishEvent(selectedEventId)).unwrap();

      toast.success("Đã phê duyệt sự kiện");

      setShowConfirmApprove(false);
      setShowDetailModal(false);

      refresh();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.message ??
        "Phê duyệt thất bại";

      toast.error(msg);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectFromModal = async () => {
    if (!selectedEventId || loadingId) return;

    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setLoadingId(selectedEventId);

    try {
      await dispatch(
        fetchRejectPublishEvent({
          eventId: selectedEventId,
          reason: rejectReason,
        })
      ).unwrap();

      toast.success("Đã từ chối yêu cầu phê duyệt");

      setShowConfirmReject(false);
      setShowDetailModal(false);

      refresh();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.message ??
        "Từ chối thất bại";

      toast.error(msg);
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancelFromModal = async () => {
    if (!selectedEventId || loadingId) return;

    setLoadingId(selectedEventId);

    try {
      await dispatch(
        fetchCancelEvent({
          eventId: selectedEventId,
          reason: cancelReason,
        })
      ).unwrap();

      toast.success("Đã huỷ sự kiện");

      setShowCancelModal(false);
      setShowDetailModal(false);

      refresh();
    } catch {
      toast.error("Huỷ sự kiện thất bại");
    } finally {
      setLoadingId(null);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full">
        {/* Header */}
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
            <MdRefresh className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Header Table */}
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
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                        categoryColor[category] ?? categoryColor.OTHER
                      }`}
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
                      onClick={() =>
                        openDetailModal(evt.id ?? evt.eventId)
                      }
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
                Hiển thị{" "}
                <span className="text-white font-bold">{endCount}</span> trên{" "}
                <span className="text-white font-bold">
                  {currentCount}
                </span>{" "}
                sự kiện
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`px-3 py-1 rounded-md text-sm ${
                    page <= 1
                      ? "text-[#6b5b86] bg-[#0f0b16]"
                      : "text-white bg-[#302447] hover:bg-white/10"
                  }`}
                >
                  Prev
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from(
                    { length: displayTotalPages },
                    (_, idx) => idx + 1
                  ).map((p) => {
                    const show =
                      displayTotalPages <= 10 ||
                      Math.abs(p - page) <= 3 ||
                      p === 1 ||
                      p === displayTotalPages;

                    if (!show) {
                      if (p === 2 && page > 6) {
                        return (
                          <span key={p} className="px-2">
                            ...
                          </span>
                        );
                      }

                      if (
                        p === displayTotalPages - 1 &&
                        page < displayTotalPages - 5
                      ) {
                        return (
                          <span key={p} className="px-2">
                            ...
                          </span>
                        );
                      }

                      return null;
                    }

                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          p === page
                            ? "bg-primary text-white"
                            : "bg-[#1b1230] text-[#a592c8] hover:bg-white/5"
                        }`}
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
                  className={`px-3 py-1 rounded-md text-sm ${
                    page >= displayTotalPages
                      ? "text-[#6b5b86] bg-[#0f0b16]"
                      : "text-white bg-[#302447] hover:bg-white/10"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000]">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-xl w-[400px]">
              <h2 className="text-white font-bold mb-3">
                Lý do huỷ sự kiện
              </h2>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm"
                rows={4}
                placeholder="Nhập lý do huỷ (không bắt buộc)..."
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
      {showDetailModal && currentEvent && (
        <EventDetailModal
          currentEvent={currentEvent}
          eventSpec={eventSpec}
          eventSpecEventId={eventSpecEventId}
          eventSpecLoading={eventSpecLoading}
          selectedEventId={selectedEventId}
          loadingId={loadingId}
          showRejectInput={showRejectInput}
          rejectReason={rejectReason}
          onClose={closeDetailModal}
          onRejectReasonChange={setRejectReason}
          onShowRejectInput={setShowRejectInput}
          onShowConfirmApprove={setShowConfirmApprove}
          onShowConfirmReject={setShowConfirmReject}
          onShowCancelModal={setShowCancelModal}
        />
      )}

      {showConfirmApprove && (
        <ApproveConfirmModal
          eventTitle={currentEvent?.title}
          loadingId={loadingId}
          selectedEventId={selectedEventId}
          onCancel={() => setShowConfirmApprove(false)}
          onConfirm={handleApproveFromModal}
        />
      )}

      {showConfirmReject && (
        <RejectConfirmModal
          eventTitle={currentEvent?.title}
          loadingId={loadingId}
          selectedEventId={selectedEventId}
          onCancel={() => {
            setShowConfirmReject(false);
          }}
          onConfirm={handleRejectFromModal}
        />
      )}
    </>
  );
}