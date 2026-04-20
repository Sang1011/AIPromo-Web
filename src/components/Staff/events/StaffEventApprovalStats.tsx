import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../../../store"
import { fetchPendingEvents } from "../../../store/eventSlice"

import { MdPendingActions, MdTaskAlt, MdSchedule, MdHistory } from "react-icons/md"

const glassCard =
  "bg-[rgba(24,18,43,0.6)] backdrop-blur-[16px] border border-[rgba(124,64,237,0.15)] hover:border-primary/30 transition-all duration-300"

export default function StaffEventApprovalStats() {

  const dispatch = useDispatch<AppDispatch>()

  const events = useSelector((state: RootState) => state.EVENT.events)
  const pagination = useSelector((state: RootState) => state.EVENT.pagination)

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {

    dispatch(
      fetchPendingEvents({
        PageNumber: 1,
        PageSize: 50,
        Statuses: "PendingReview,PendingCancellation"
      })
    )

  }, [dispatch])

  /* ---------------- STATS CALCULATION ---------------- */

  const pendingEvents = events.filter(
    (e) => e.status === "PendingReview"
  )

  const cancelRequests = events.filter(
    (e) => e.status === "PendingCancellation"
  )

  const today = new Date().toDateString()

  const processedToday = events.filter(
    (e) => new Date(e.createdAt).toDateString() === today
  )

  const stats = [
    {
      label: "Sự kiện chờ duyệt",
      value: pendingEvents.length,
      badge: "+",
      badgeValue: pendingEvents.length,
      badgeColor: "bg-amber-500/10 text-amber-400",
      icon: MdPendingActions,
    },
    {
      label: "Yêu cầu huỷ",
      value: cancelRequests.length,
      badge: "+",
      badgeValue: cancelRequests.length,
      badgeColor: "bg-red-500/10 text-red-400",
      icon: MdTaskAlt,
    },
    {
      label: "Xử lý hôm nay",
      value: processedToday.length,
      badge: "Hôm nay",
      badgeColor: "bg-primary/20 text-primary",
      icon: MdSchedule,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">

      {stats.map((stat) => {

        const Icon = stat.icon

        return (
          <div
            key={stat.label}
            className={`relative group overflow-hidden ${glassCard} p-8 rounded-3xl hover:scale-[1.02]`}
          >

            {/* ICON BACKGROUND */}
            <div className="absolute top-0 right-0 p-8 opacity-70 group-hover:opacity-100 transition">
              <Icon className="text-primary/20 text-5xl" />
            </div>

            {/* GLOW EFFECT */}
            <div className="absolute -right-10 -bottom-10 size-40 bg-primary/10 rounded-full blur-[80px]" />

            {/* LABEL */}
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              {stat.label}
            </p>

            {/* VALUE */}
            <div className="flex items-baseline gap-4">

              <h4 className="text-6xl font-black text-white tracking-tighter">
                {stat.value}
              </h4>

              {/* BADGE */}
              {stat.badge && (
                <div
                  className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold ${stat.badgeColor}`}
                >

                  {stat.badge === "Hôm nay" && (
                    <MdHistory className="text-sm mr-1" />
                  )}

                  {stat.badgeValue && (
                    <>
                      <span className="mr-1">↑</span>
                      {stat.badgeValue}
                    </>
                  )}

                  {stat.badge === "Hôm nay" && "Hôm nay"}

                </div>
              )}

            </div>

            {/* TOTAL INFO */}
            {pagination?.totalCount && (
              <p className="text-xs text-slate-500 mt-4">
                Tổng {pagination.totalCount} yêu cầu
              </p>
            )}

          </div>
        )
      })}

    </div>
  )
}