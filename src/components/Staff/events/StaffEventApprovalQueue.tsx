import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../../../store"
import {
  fetchPendingEvents,
  fetchPublishEvent,
  fetchCancelEvent
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

    // TODO: CALL API REJECT EVENT
    console.log("Reject event:", rejectEventId, rejectReason)

    toast.success("Đã ghi nhận từ chối (chưa gọi API)")

    setShowRejectModal(false)

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

                <button className="text-xs text-slate-400 hover:text-white">
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

    </div>

  )
}