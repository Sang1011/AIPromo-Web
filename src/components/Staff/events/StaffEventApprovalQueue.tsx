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
import toast from "react-hot-toast"

import {
  Check,
  X,
  Trash2,
  Loader2
} from "lucide-react"
import { fetchGetSeatMap } from "../../../store/seatMapSlice"
import SeatMapReadOnly from "../../Organizer/seatmap/SeatMapReadOnly"

export default function StaffEventApprovalQueue() {

  const dispatch = useDispatch<AppDispatch>()

  const events = useSelector((state: RootState) => state.EVENT.events)
  const seatMapData = useSelector((state: RootState) => state.SEATMAP.spec)

  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelEventId, setCancelEventId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectEventId, setRejectEventId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approveEventId, setApproveEventId] = useState<string | null>(null)

  const currentEvent = useSelector((state: RootState) => state.EVENT.currentEvent)
  const [showDetailModal, setShowDetailModal] = useState(false)
  

  useEffect(() => {

    dispatch(
      fetchPendingEvents({
        PageNumber: 1,
        PageSize: 5,
        Statuses: "PendingReview,PendingCancellation"
      })
    )

  }, [dispatch])

  const refresh = () => {

    dispatch(
      fetchPendingEvents({
        PageNumber: 1,
        PageSize: 5,
        Statuses: "PendingReview,PendingCancellation"
      })
    )

  }

  const glassCard =
    "bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 hover:shadow-primary/20 hover:border-primary/20 transition-all duration-300"

  const statusMap: any = {
    PendingReview: {
      label: "Chờ duyệt",
      color: "text-amber-400",
      dot: "bg-amber-400"
    },
    PendingCancellation: {
      label: "Chờ huỷ",
      color: "text-red-400",
      dot: "bg-red-400"
    },
    Published: {
      label: "Đã đăng",
      color: "text-green-400",
      dot: "bg-green-400"
    },
    Cancelled: {
      label: "Đã huỷ",
      color: "text-gray-400",
      dot: "bg-gray-400"
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

  const openApproveModal = (eventId: string) => {
    setApproveEventId(eventId)
    setShowApproveModal(true)
  }

  const handleApprove = async () => {
    if (!approveEventId) return

    if (loadingId) return

    setLoadingId(approveEventId)

    try {
      await dispatch(fetchPublishEvent(approveEventId)).unwrap()

      toast.success("Đã phê duyệt sự kiện")
      setShowApproveModal(false)
      refresh()
    } catch (err: any) {
      console.error("publish failed", err)
      const msg = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? (err?.message ?? "Phê duyệt thất bại")
      toast.error(msg)
    }

    setLoadingId(null)
  }

  const openCancelModal = (eventId: string) => {

    setCancelEventId(eventId)
    setCancelReason("")
    setShowCancelModal(true)

  }

  const handleCancel = async () => {

    console.log("handleCancel called", cancelEventId)

    if (!cancelEventId) return

    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do huỷ")
      return
    }

    setLoadingId(cancelEventId)

    try {

      await dispatch(
        fetchCancelEvent({
          eventId: cancelEventId,
          reason: cancelReason
        })
      ).unwrap()

      toast.success("Đã huỷ sự kiện")

      setShowCancelModal(false)

      refresh()

    } catch {

      toast.error("Huỷ sự kiện thất bại")

    }

    setLoadingId(null)

  }

  const openRejectModal = (eventId: string) => {

    setRejectEventId(eventId)
    setRejectReason("")
    setShowRejectModal(true)

  }

  const handleReject = async () => {

    if (!rejectEventId) return

    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối")
      return
    }

    if (loadingId) return

    setLoadingId(rejectEventId)

    try {
      console.log("dispatching reject-publish", { eventId: rejectEventId, reason: rejectReason })
      await dispatch(fetchRejectPublishEvent({ eventId: rejectEventId, reason: rejectReason })).unwrap()

      toast.success("Đã từ chối yêu cầu phê duyệt")
      setShowRejectModal(false)
      refresh()
    } catch (err) {
      console.error("reject publish failed", err)
      const msg = (err as any)?.response?.data?.detail ?? (err as any)?.message ?? "Từ chối thất bại"
      toast.error(msg)
    }

    setLoadingId(null)

  }

  const openDetailModal = async (eventId: string) => {

  const sessionId = currentEvent?.sessions?.[0]?.id

if (currentEvent?.id === eventId && sessionId) {
  setShowDetailModal(true)
  return
}

try {
  setLoadingId(eventId)

  await dispatch(fetchEventById(eventId)).unwrap()

  const newSessionId = currentEvent?.sessions?.[0]?.id

  if (!newSessionId) {
    toast.error("Không tìm thấy session")
    return
  }

  await dispatch(fetchGetSeatMap({
    eventId,
    sessionId: newSessionId
  })).unwrap()

  setShowDetailModal(true)
} catch (err) {
  toast.error("Không thể tải chi tiết sự kiện")
}

  setLoadingId(null)
}
  const InfoCard = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6">
      <p className="text-slate-400 text-sm font-medium">{label}</p>
      <p className="text-white text-2xl font-semibold mt-2 tracking-tight">{value}</p>
    </div>
  );

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

        <div className="col-span-5">
          Chi tiết sự kiện
        </div>

        <div className="col-span-2">
          Ngày đăng ký
        </div>

        <div className="col-span-2">
          Danh mục
        </div>

        <div className="col-span-1">
          Trạng thái
        </div>

        <div className="col-span-2 text-right">
          Thao tác
        </div>

      </div>

        {events.map((evt: any) => {

          const category =
            evt.categories?.[0]?.name?.toUpperCase() ?? "OTHER"

          const status =
            statusMap[evt.status] ??
            { label: evt.status, color: "text-slate-400", dot: "bg-slate-400" }

          return (

            <div
              key={evt.id}
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

              <div className="col-span-1 flex items-center gap-2">

                <span
                  className={`size-2 rounded-full ${status.dot}`}
                />

                <span
                  className={`text-xs font-semibold ${status.color}`}
                >
                  {status.label}
                </span>

              </div>

              <div className="col-span-2 flex justify-end gap-2">

                <button
                  onClick={() => openDetailModal(evt.id ?? evt.eventId)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Chi tiết
                </button>

                {evt.status === "PendingReview" && (

                  <div className="flex gap-2">

                    <button
                      disabled={loadingId === evt.id}
                      onClick={() => openApproveModal(evt.id ?? evt.eventId)}
                      title="Phê duyệt"
                      className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400"
                    >
                      {loadingId === evt.id
                        ? <Loader2 className="w-4 h-4 animate-spin"/>
                        : <Check className="w-4 h-4"/>
                      }
                    </button>

                    <button
                      disabled={loadingId === evt.id}
                      onClick={() => openRejectModal(evt.id ?? evt.eventId)}
                      title="Từ chối"
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    >
                      <X className="w-4 h-4"/>
                    </button>

                  </div>

                )}

                {evt.status === "PendingCancellation" && (

                  <button
                    disabled={loadingId === evt.id}
                    onClick={() => openCancelModal(evt.id ?? evt.eventId)}
                    title="Xác nhận huỷ"
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  >
                    {loadingId === evt.id
                      ? <Loader2 className="w-4 h-4 animate-spin"/>
                      : <Trash2 className="w-4 h-4"/>
                    }
                  </button>

                )}

              </div>

            </div>

          )
        })}

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
                onClick={handleCancel}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg"
              >
                Xác nhận
              </button>

            </div>

          </div>

        </div>

      )}

      {showApproveModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-slate-900 border border-white/10 p-6 rounded-xl w-[400px]">

            <h2 className="text-white font-bold mb-3">
              Xác nhận phê duyệt
            </h2>

            <p className="text-sm text-slate-300">Bạn có chắc muốn phê duyệt sự kiện này?</p>

            <div className="flex justify-end gap-3 mt-4">

              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-sm text-slate-300"
              >
                Huỷ
              </button>

              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg"
              >
                Xác nhận
              </button>

            </div>

          </div>

        </div>

      )}

      {showRejectModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-slate-900 border border-white/10 p-6 rounded-xl w-[400px]">

            <h2 className="text-white font-bold mb-3">
              Lý do từ chối sự kiện
            </h2>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm"
              rows={4}
              placeholder="Nhập lý do từ chối..."
            />

            <div className="flex justify-end gap-3 mt-4">

              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm text-slate-300"
              >
                Huỷ
              </button>

              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg"
              >
                Xác nhận từ chối
              </button>

            </div>

          </div>

        </div>

      )}

             {/* ==================== DETAIL MODAL - PHIÊN BẢN CÂN BẰNG ==================== */}
      {showDetailModal && currentEvent && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-slate-950 border border-white/10 rounded-3xl w-full max-w-5xl max-h-[94vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* BANNER SECTION - Giảm chiều cao đáng kể */}
            <div className="relative h-[280px] flex-shrink-0 overflow-hidden rounded-t-3xl">
              {/* Background blur layer */}
              <img
                src={currentEvent.bannerUrl || "/event-placeholder.jpg"}
                alt={currentEvent.title}
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-slate-950" />

              {/* Main Banner Image */}
              <div className="relative z-10 flex items-center justify-center h-full p-6">
                <img
                  src={currentEvent.bannerUrl || "/event-placeholder.jpg"}
                  alt={currentEvent.title}
                  className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
                />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-6 right-6 z-30 bg-black/80 hover:bg-black text-white w-11 h-11 flex items-center justify-center rounded-2xl backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all hover:scale-105"
              >
                ✕
              </button>

              {/* Title & Location Overlay - Đặt thấp hơn một chút */}
              <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-16 pb-6 px-10">
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter leading-none">
                  {currentEvent.title}
                </h1>
                <p className="text-lg text-slate-300 mt-2 flex items-center gap-2">
                  📍 {currentEvent.location}
                </p>
              </div>
            </div>

            {/* CONTENT AREA - Scroll chỉ phần này */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-10 space-y-10">
              
              {/* Thông tin cơ bản - Grid 4 cột trên desktop, 2 cột trên mobile */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <InfoCard label="Bắt đầu" value={formatDate(currentEvent.eventStartAt)} />
                <InfoCard label="Kết thúc" value={formatDate(currentEvent.eventEndAt)} />
                <InfoCard label="Mở bán vé" value={formatDate(currentEvent.ticketSaleStartAt)} />
                <InfoCard label="Đóng bán vé" value={formatDate(currentEvent.ticketSaleEndAt)} />
              </div>

              {/* Mô tả */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Mô tả sự kiện</h3>
                <div className="text-slate-300 leading-relaxed text-[15.5px] prose prose-invert max-w-none">
                  {currentEvent.description}
                </div>
              </div>

              {/* Lịch trình */}
              {currentEvent.sessions?.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-5">Lịch trình</h3>
                  <div className="space-y-4">
                    {currentEvent.sessions.map((s: any) => (
                      <div
                        key={s.id}
                        className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-white font-semibold text-lg">{s.title}</p>
                            {s.description && (
                              <p className="text-slate-400 text-sm mt-1.5">{s.description}</p>
                            )}
                          </div>
                          <div className="text-sm font-medium text-slate-300 whitespace-nowrap bg-slate-800 px-5 py-2.5 rounded-xl border border-white/5">
                            {formatDate(s.startTime)} — {formatDate(s.endTime)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nghệ sĩ */}
              {currentEvent.actorImages?.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-5">Nghệ sĩ tham gia</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentEvent.actorImages.map((a: any) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-4 bg-slate-900/70 border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all group"
                      >
                        <img
                          src={a.image}
                          alt={a.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div>
                          <p className="font-semibold text-white text-lg">{a.name}</p>
                          <p className="text-slate-400 text-sm">{a.major}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loại vé */}
              {currentEvent.ticketTypes?.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-5">Loại vé</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentEvent.ticketTypes.map((t: any) => (
                      <div
                        key={t.id}
                        className="flex justify-between items-center bg-slate-900/70 border border-white/5 rounded-2xl px-7 py-6 hover:border-emerald-500/30 transition-all group"
                      >
                        <p className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {t.name}
                        </p>
                        <p className="text-3xl font-bold text-emerald-400 tracking-tighter">
                          {t.price.toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chính sách */}
              {currentEvent.policy && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-5">Chính sách sự kiện</h3>
                  <div
                    className="prose prose-invert prose-slate max-w-none bg-slate-900/60 border border-white/5 rounded-2xl p-8 text-slate-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: currentEvent.policy }}
                  />
                </div>
              )}
            </div>

            {/* {seatMapData && currentEvent.ticketTypes?.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-5">
                Sơ đồ chỗ ngồi
              </h3>

              <div className="w-full h-[500px] bg-black rounded-2xl border border-white/10 overflow-hidden">
                <SeatMapReadOnly
                  seatMapData={seatMapData as any }
                  ticketTypes={currentEvent.ticketTypes}
                />
              </div>
            </div>
          )} */}

            {/* Footer cố định */}
            <div className="border-t border-white/10 p-6 flex justify-end bg-slate-950">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-8 py-3 text-sm font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/30 rounded-2xl transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  )
}