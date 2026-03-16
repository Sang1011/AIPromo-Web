import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../../../store"
import { fetchPendingEvents } from "../../../store/eventSlice"

export default function StaffEventApprovalQueue() {

  const dispatch = useDispatch<AppDispatch>()

  const events = useSelector((state: RootState) => state.EVENT.events)
  const pagination = useSelector((state: RootState) => state.EVENT.pagination)

  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    dispatch(
      fetchPendingEvents({
        PageNumber: 1,
        PageSize: 5,
        Statuses: "PendingReview,PendingCancellation"
      })
    )
  }, [dispatch])

  const glassCard =
    "bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 hover:shadow-primary/20 hover:border-primary/20 transition-all duration-300"

  /* ---------------- STATUS MAP ---------------- */

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

  /* ---------------- CATEGORY COLOR ---------------- */

  const categoryColor: any = {
    MUSIC: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    TECH: "bg-green-500/20 text-green-300 border-green-500/30",
    ART: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    FINANCE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    OTHER: "bg-gray-500/20 text-gray-300 border-gray-500/30"
  }

  /* ---------------- DATE FORMAT ---------------- */

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  return (
    <div className="flex flex-col gap-10 w-full">

      {/* HEADER */}
      <div className="flex flex-col gap-3">

        <h1 className="text-3xl font-black text-white">
          Danh sách chờ duyệt sự kiện
        </h1>

        <p className="text-sm text-slate-400">
          Bảng điều khiển kiểm duyệt toàn hệ thống cho các đăng ký sự kiện và đề xuất hợp tác mới.
        </p>

      </div>

      {/* FILTER */}
      <div className="flex items-center justify-between">

        <div className="flex gap-3">

          <button
            onClick={() => {
              setActiveTab("all")
              dispatch(
                fetchPendingEvents({
                  PageNumber: 1,
                  PageSize: 5,
                  Statuses: "PendingReview,PendingCancellation"
                })
              )
            }}
            className={`px-4 py-2 text-xs rounded-full font-bold ${
              activeTab === "all"
                ? "bg-primary text-white"
                : "bg-white/5 text-slate-400"
            }`}
          >
            Tất cả
          </button>

          <button
            onClick={() => {
              setActiveTab("priority")
              dispatch(
                fetchPendingEvents({
                  PageNumber: 1,
                  PageSize: 5,
                  Statuses: "PendingReview"
                })
              )
            }}
            className={`px-4 py-2 text-xs rounded-full font-bold ${
              activeTab === "priority"
                ? "bg-primary text-white"
                : "bg-white/5 text-slate-400"
            }`}
          >
            Ưu tiên
          </button>

        </div>

        <div className="text-xs text-slate-400">
          Đang hiển thị{" "}
          <span className="text-white font-bold">
            {events.length}
          </span>{" "}
          trên{" "}
          <span className="text-white font-bold">
            {pagination?.totalCount ?? 0}
          </span>{" "}
          sự kiện
        </div>

      </div>

      {/* TABLE HEADER */}
      <div className="grid grid-cols-12 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-400">

        <div className="col-span-5">Chi tiết sự kiện</div>
        <div className="col-span-2">Ngày đăng ký</div>
        <div className="col-span-2">Danh mục</div>
        <div className="col-span-1">Trạng thái</div>
        <div className="col-span-2 text-right">Thao tác</div>

      </div>

      {/* EVENT LIST */}
      <div className="flex flex-col gap-4">

        {events.map((evt) => {

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

              {/* EVENT INFO */}
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

              {/* DATE */}
              <div className="col-span-2">

                <span className="text-sm font-semibold text-slate-300">
                  {formatDate(evt.createdAt)}
                </span>

              </div>

              {/* CATEGORY */}
              <div className="col-span-2">

                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                    categoryColor[category] ?? categoryColor.OTHER
                  }`}
                >
                  {category}
                </span>

              </div>

              {/* STATUS */}
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

              {/* ACTION */}
              <div className="col-span-2 flex justify-end gap-3">

                <button className="text-xs text-slate-400 hover:text-white">
                  Chi tiết
                </button>

                {evt.status === "PendingReview" && (
                  <button className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90">
                    Phê duyệt nhanh
                  </button>
                )}

                {evt.status === "PendingCancellation" && (
                  <button className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl">
                    Xác nhận huỷ
                  </button>
                )}

              </div>

            </div>

          )
        })}

      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 pt-4">

        {Array.from({ length: pagination?.totalPages ?? 1 }).map((_, i) => (

          <button
            key={i}
            className={`size-9 rounded-lg text-xs font-bold ${
              pagination?.pageNumber === i + 1
                ? "bg-primary text-white"
                : "bg-white/5 text-slate-400"
            }`}
            onClick={() =>
              dispatch(
                fetchPendingEvents({
                  PageNumber: i + 1,
                  PageSize: 5,
                  Statuses: "PendingReview,PendingCancellation"
                })
              )
            }
          >
            {i + 1}
          </button>

        ))}

      </div>

    </div>
  )
}

