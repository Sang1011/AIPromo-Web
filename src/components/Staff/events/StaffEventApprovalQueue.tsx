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

export default function StaffEventApprovalQueue() {

  const dispatch = useDispatch<AppDispatch>()

  const events = useSelector((state: RootState) => state.EVENT.events)

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

  if (currentEvent?.id === eventId) {
    setShowDetailModal(true)
    return
  }

  try {
    setLoadingId(eventId)

    await dispatch(fetchEventById(eventId)).unwrap()

    setShowDetailModal(true)
  } catch (err) {
    toast.error("Không thể tải chi tiết sự kiện")
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

      {showDetailModal && currentEvent && (

        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDetailModal(false)}
        >

          <div
            className="bg-slate-900 border border-white/10 rounded-2xl w-[1000px] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ===== BANNER (FIXED) ===== */}
            <div className="relative w-full h-[320px] overflow-hidden rounded-t-2xl">

              {/* background blur */}
              <img
                src={currentEvent.bannerUrl}
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40"
              />

              {/* overlay */}
              <div className="absolute inset-0 bg-black/60" />

              {/* main image */}
              <div className="relative z-10 flex items-center justify-center h-full px-4">

                <img
                  src={currentEvent.bannerUrl}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
                />

              </div>

              {/* close button */}
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-lg backdrop-blur"
              >
                ✕
              </button>

              {/* title */}
              <div className="absolute bottom-4 left-6 z-20">
                <h1 className="text-2xl font-black text-white drop-shadow-lg">
                  {currentEvent.title}
                </h1>
                <p className="text-sm text-slate-300">
                  {currentEvent.location}
                </p>
              </div>

            </div>

            {/* ===== CONTENT ===== */}
            <div className="p-6 flex flex-col gap-6">

              {/* INFO GRID */}
              <div className="grid grid-cols-2 gap-4 text-sm">

                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-slate-400 text-xs">Thời gian bắt đầu</p>
                  <p className="text-white font-semibold">
                    {formatDate(currentEvent.eventStartAt)}
                  </p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-slate-400 text-xs">Thời gian kết thúc</p>
                  <p className="text-white font-semibold">
                    {formatDate(currentEvent.eventEndAt)}
                  </p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-slate-400 text-xs">Mở bán vé</p>
                  <p className="text-white font-semibold">
                    {formatDate(currentEvent.ticketSaleStartAt)}
                  </p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <p className="text-slate-400 text-xs">Đóng bán vé</p>
                  <p className="text-white font-semibold">
                    {formatDate(currentEvent.ticketSaleEndAt)}
                  </p>
                </div>

              </div>

              {/* DESCRIPTION */}
              <div>
                <h3 className="text-white font-bold mb-2 text-lg">
                  Mô tả sự kiện
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {currentEvent.description}
                </p>
              </div>

              {/* SESSIONS */}
              <div>
                <h3 className="text-white font-bold mb-3 text-lg">
                  Lịch trình
                </h3>

                <div className="flex flex-col gap-3">
                  {currentEvent.sessions.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-xl bg-slate-800 border border-white/5"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-semibold">
                          {s.title}
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatDate(s.startTime)} - {formatDate(s.endTime)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-300">
                        {s.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTORS */}
              <div>
                <h3 className="text-white font-bold mb-3 text-lg">
                  Nghệ sĩ tham gia
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {currentEvent.actorImages.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl border border-white/5"
                    >
                      <img
                        src={a.image}
                        className="w-12 h-12 rounded-full object-cover"
                      />

                      <div>
                        <p className="text-white text-sm font-semibold">
                          {a.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {a.major}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TICKET */}
              <div>
                <h3 className="text-white font-bold mb-3 text-lg">
                  Loại vé
                </h3>

                <div className="flex flex-col gap-2">
                  {currentEvent.ticketTypes.map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-white/5"
                    >
                      <span className="text-white font-medium">
                        {t.name}
                      </span>

                      <span className="text-green-400 font-bold">
                        {t.price.toLocaleString()} VND
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* POLICY */}
              <div>
                <h3 className="text-white font-bold mb-3 text-lg">
                  Chính sách
                </h3>

                <div
                  className="text-slate-300 text-sm leading-relaxed bg-slate-800/50 p-4 rounded-xl"
                  dangerouslySetInnerHTML={{ __html: currentEvent.policy }}
                />
              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  )
}