import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../../../store"
import {
  fetchPendingEvents,
  fetchPublishEvent,
  fetchCancelEvent,
  fetchRejectPublishEvent,
  fetchEventById
} from "../../../store/eventSlice"
import { fetchEventSpec, clearEventSpec } from "../../../store/staffEventSlice"
import toast from "react-hot-toast"
import SeatMapReadOnly from "../../Organizer/seatmap/SeatMapReadOnly"
import type { SeatMapData } from "../../../types/config/seatmap"

export default function StaffEventApprovalQueue() {

  const dispatch = useDispatch<AppDispatch>()

  const events = useSelector((state: RootState) => state.EVENT.events)

  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  const [rejectReason, setRejectReason] = useState("")

  const currentEvent = useSelector((state: RootState) => state.EVENT.currentEvent)
  const eventSpec = useSelector((state: RootState) => state.STAFF_EVENT.eventSpec)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const pageSize = 10

  // Tính toán pagination dựa trên số sự kiện thực tế đang hiển thị (client-side)
  const currentCount = events.length
  const displayTotalPages = Math.max(1, Math.ceil(currentCount / pageSize))
  const endCount = Math.min(page * pageSize, currentCount)

  // Lấy dữ liệu cho trang hiện tại
  const currentItems = events.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    fetchPendingList()
  }, [])

  const fetchPendingList = async () => {
    setIsLoading(true)
    try {
      await dispatch(
        fetchPendingEvents({
          PageNumber: 1,
          PageSize: 1000,
          Statuses: "PendingReview,PendingCancellation"
        })
      ).unwrap()
    } catch (err) {
      toast.error("Không thể tải danh sách sự kiện")
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = async () => {
    setIsLoading(true)
    try {
      await fetchPendingList()
      setPage(1)
      toast.success("Đã làm mới danh sách")
    } catch {
      toast.error("Không thể làm mới danh sách")
    } finally {
      setIsLoading(false)
    }
  }

  const glassCard =
    "bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 hover:shadow-primary/20 hover:border-primary/20 transition-all duration-300"

  const statusMap: any = {
    PendingReview: {
      label: "Chờ duyệt",
      color: "text-amber-400",
      bg: "bg-amber-500/20",
      border: "border-amber-500/30"
    },
    PendingCancellation: {
      label: "Chờ huỷ",
      color: "text-red-400",
      bg: "bg-red-500/20",
      border: "border-red-500/30"
    },
    Published: {
      label: "Đã đăng",
      color: "text-green-400",
      bg: "bg-green-500/20",
      border: "border-green-500/30"
    },
    Cancelled: {
      label: "Đã huỷ",
      color: "text-gray-400",
      bg: "bg-gray-500/20",
      border: "border-gray-500/30"
    }
  }

  const categoryColor: any = {
    MUSIC: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    TECH: "bg-green-500/20 text-green-300 border-green-500/30",
    ART: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    FINANCE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    OTHER: "bg-gray-500/20 text-gray-300 border-gray-500/30"
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  const openDetailModal = async (eventId: string) => {
    setSelectedEventId(eventId)
    setShowDetailModal(true)

    if (currentEvent?.id === eventId) {
      return
    }

    try {
      setLoadingId(eventId)
      await dispatch(fetchEventById(eventId)).unwrap()
      await dispatch(fetchEventSpec(eventId)).unwrap()
    } catch (err) {
      toast.error("Không thể tải chi tiết sự kiện")
    }

    setLoadingId(null)
  }

  const handleApproveFromModal = async () => {
    if (!selectedEventId) return
    if (loadingId) return

    setLoadingId(selectedEventId)
    try {
      await dispatch(fetchPublishEvent(selectedEventId)).unwrap()
      toast.success("Đã phê duyệt sự kiện")
      setShowDetailModal(false)
      dispatch(clearEventSpec())
      refresh()
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? "Phê duyệt thất bại"
      toast.error(msg)
    }
    setLoadingId(null)
  }

  const handleRejectFromModal = async () => {
    if (!selectedEventId) return
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối")
      return
    }
    if (loadingId) return

    setLoadingId(selectedEventId)
    try {
      await dispatch(fetchRejectPublishEvent({ eventId: selectedEventId, reason: rejectReason })).unwrap()
      toast.success("Đã từ chối yêu cầu phê duyệt")
      setShowDetailModal(false)
      setRejectReason("")
      dispatch(clearEventSpec())
      refresh()
    } catch (err) {
      const msg = (err as any)?.response?.data?.detail ?? (err as any)?.message ?? "Từ chối thất bại"
      toast.error(msg)
    }
    setLoadingId(null)
  }

  const handleCancelFromModal = async () => {
    if (!selectedEventId) return
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do huỷ")
      return
    }
    if (loadingId) return

    setLoadingId(selectedEventId)
    try {
      await dispatch(fetchCancelEvent({ eventId: selectedEventId, reason: cancelReason })).unwrap()
      toast.success("Đã huỷ sự kiện")
      setShowDetailModal(false)
      setShowCancelModal(false)
      setCancelReason("")
      dispatch(clearEventSpec())
      refresh()
    } catch {
      toast.error("Huỷ sự kiện thất bại")
    }
    setLoadingId(null)
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black text-white">
          Danh sách chờ duyệt sự kiện
        </h1>
        <p className="text-sm text-slate-400">
          Bảng điều khiển kiểm duyệt toàn hệ thống cho các đăng ký sự kiện.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-12 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-5">Chi tiết sự kiện</div>
          <div className="col-span-2">Ngày đăng ký</div>
          <div className="col-span-2">Danh mục</div>
          <div className="col-span-1">Trạng thái</div>
          <div className="col-span-2 text-right">Thao tác</div>
        </div>

        {isLoading && currentItems.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-8">Đang tải...</div>
        ) : currentItems.length > 0 ? (
          currentItems.map((evt: any) => {
            const category = evt.categories?.[0]?.name?.toUpperCase() ?? "OTHER"
            const status = statusMap[evt.status] ?? { label: evt.status, color: "text-slate-400", dot: "bg-slate-400" }

            return (
              <div key={evt.id} className={`grid grid-cols-12 items-center gap-4 p-5 ${glassCard} rounded-2xl`}>
                <div className="col-span-5 flex items-center gap-5">
                  <div className="size-16 rounded-2xl overflow-hidden border border-white/10">
                    <img src={evt.bannerUrl || "/event-placeholder.jpg"} alt={evt.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-lg font-bold text-white truncate mb-1">{evt.title}</span>
                    <span className="text-xs font-semibold text-slate-400">{evt.location}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-slate-300">{formatDate(evt.createdAt)}</span>
                </div>
                <div className="col-span-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${categoryColor[category] ?? categoryColor.OTHER}`}>{category}</span>
                </div>
                <div className="col-span-1 flex items-center gap-2">
                  <span className={`size-2 rounded-full ${status.dot}`} />
                  <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button onClick={() => openDetailModal(evt.id ?? evt.eventId)} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all border border-primary/30">Xem chi tiết</button>
                </div>
              </div>
            )
          })
        ) : null}

        {currentItems.length === 0 && !isLoading && (
          <div className="text-center text-sm text-slate-400 py-8">Không có sự kiện nào đang chờ phê duyệt</div>
        )}

        {/* Pagination */}
        {currentCount > 0 && (
          <div className="px-8 py-4 border-t border-[#302447] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white/5">
            <p className="text-xs text-[#a592c8]">
              Hiển thị <span className="text-white font-bold">{endCount}</span> trên{" "}
              <span className="text-white font-bold">{currentCount}</span> sự kiện
            </p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={`px-3 py-1 rounded-md text-sm ${page <= 1 ? 'text-[#6b5b86] bg-[#0f0b16]' : 'text-white bg-[#302447] hover:bg-white/10'}`}>Prev</button>
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: displayTotalPages }, (_, idx) => idx + 1).map((p) => {
                  const show = displayTotalPages <= 10 || Math.abs(p - page) <= 3 || p === 1 || p === displayTotalPages;
                  if (!show) {
                    if (p === 2 && page > 6) return <span key={p} className="px-2">...</span>;
                    if (p === displayTotalPages - 1 && page < displayTotalPages - 5) return <span key={p} className="px-2">...</span>;
                    return null;
                  }
                  return (<button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded-md text-sm ${p === page ? 'bg-primary text-white' : 'bg-[#1b1230] text-[#a592c8] hover:bg-white/5'}`}>{p}</button>);
                })}
              </div>
              <button disabled={page >= displayTotalPages} onClick={() => setPage(p => Math.min(displayTotalPages, p + 1))} className={`px-3 py-1 rounded-md text-sm ${page >= displayTotalPages ? 'text-[#6b5b86] bg-[#0f0b16]' : 'text-white bg-[#302447] hover:bg-white/10'}`}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-xl w-[400px]">
            <h2 className="text-white font-bold mb-3">
              Lý do huỷ sự kiện
            </h2>
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
        </div>
      )}

      {/* ==================== DETAIL MODAL ==================== */}
      {showDetailModal && currentEvent && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDetailModal(false)
            dispatch(clearEventSpec())
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
              setShowDetailModal(false)
              dispatch(clearEventSpec())
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
            <h3 className="text-lg font-bold mb-4 text-white">
              Sơ đồ chỗ ngồi
            </h3>

            {eventSpec?.spec && currentEvent.ticketTypes ? (
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
            {rejectReason === "" ? (
              <>
                <button
                  onClick={() => setRejectReason("NEED_MORE_INFO")}
                  className="px-6 py-3 border border-red-500 text-red-400 rounded-xl"
                >
                  Từ chối
                </button>

                <button
                  onClick={handleApproveFromModal}
                  disabled={loadingId === selectedEventId}
                  className="px-8 py-3 bg-purple-600 text-white rounded-xl"
                >
                  {loadingId === selectedEventId ? "Đang xử lý..." : "Phê duyệt"}
                </button>
              </>
            ) : (
              <div className="w-full">
                <textarea
                  value={rejectReason === "NEED_MORE_INFO" ? "" : rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm mb-4"
                  rows={4}
                  placeholder="Nhập lý do từ chối..."
                />
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setRejectReason("")}
                    className="px-6 py-3 border border-white/10 text-slate-400 rounded-xl"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleRejectFromModal}
                    className="px-8 py-3 bg-red-600 text-white rounded-xl"
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
  </div>
)}
    </div>
  )
}