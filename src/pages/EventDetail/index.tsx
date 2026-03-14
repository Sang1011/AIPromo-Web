import "./EventDetail.css"
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store"
import { fetchEventById } from "../../store/eventSlice"
import { useEffect } from "react"
import type { GetEventDetailResponse } from "../../types/event/event"

// ─── Skeleton Components ───────────────────────────────────────────────────────

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-white/10 rounded-lg ${className}`}
      style={{ animation: "skeleton-shimmer 1.5s ease-in-out infinite" }}
    />
  )
}

function EventDetailSkeleton() {
  return (
    <>
      <Header />
      <main className="pt-24 purple-gradient-bg">
        {/* Hero Skeleton */}
        <section className="relative w-full h-[60vh] min-h-[450px] overflow-hidden bg-[#0B0B12]">
          <div className="relative h-full max-w-[1280px] mx-auto px-6 md:px-20 flex flex-col justify-end pb-12">
            <div className="max-w-3xl space-y-4">
              <div className="flex gap-2">
                <SkeletonBox className="h-6 w-32" />
                <SkeletonBox className="h-6 w-28" />
              </div>
              <SkeletonBox className="h-16 w-3/4" />
              <SkeletonBox className="h-10 w-1/2" />
              <div className="flex gap-6 mt-4">
                <SkeletonBox className="h-6 w-40" />
                <SkeletonBox className="h-6 w-32" />
                <SkeletonBox className="h-6 w-56" />
              </div>
            </div>
          </div>
        </section>

        {/* Content Skeleton */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Column Skeleton */}
            <div className="flex-1 space-y-16">
              {/* Description */}
              <section className="space-y-4">
                <SkeletonBox className="h-8 w-48" />
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-3/4" />
              </section>
              {/* Artists */}
              <section>
                <SkeletonBox className="h-8 w-48 mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <SkeletonBox className="size-32 rounded-full" />
                      <SkeletonBox className="h-4 w-24" />
                      <SkeletonBox className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              </section>
              {/* Sessions */}
              <section>
                <SkeletonBox className="h-8 w-56 mb-8" />
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass p-5 rounded-xl space-y-2">
                      <SkeletonBox className="h-4 w-36" />
                      <SkeletonBox className="h-5 w-48" />
                      <SkeletonBox className="h-4 w-full" />
                    </div>
                  ))}
                </div>
             </section>
            </div>
            {/* Right Column Skeleton */}
            <div className="w-full lg:w-[400px]">
              <div className="glass rounded-2xl p-8 border-2 border-primary/20 space-y-6">
                <SkeletonBox className="h-10 w-48" />
                <SkeletonBox className="h-6 w-32" />
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-14 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(isoString: string) {
  if (!isoString) return ""
  const date = new Date(isoString)
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatTime(isoString: string) {
  if (!isoString) return ""
  const date = new Date(isoString)
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN")
}

// ─── Main Component ────────────────────────────────────────────────────────────

function EventDetail() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchEventById("39628d02-5797-4df8-af3c-7f16c1d536c6"))
  }, [dispatch])

  const eventDetail = useSelector(
    (s: RootState) => s.EVENT?.currentEvent
  ) as GetEventDetailResponse

   
  // const loading = useSelector((s: RootState) => s.EVENT?.loading)

  // ── Loading state ──
  if ( !eventDetail) {
    return <EventDetailSkeleton />
  }

  // ── Derived data ──
  const firstTicket = eventDetail.ticketTypes?.[0];
  console.log("firstTicket",eventDetail.ticketTypes);
  
  const startDate = formatDate(eventDetail.eventStartAt)
  const startTime = formatTime(eventDetail.eventStartAt)
  const endTime = formatTime(eventDetail.eventEndAt)
  const saleStart = formatDate(eventDetail.ticketSaleStartAt)
  const saleEnd = formatDate(eventDetail.ticketSaleEndAt)

  const serviceFee = firstTicket ? Math.round(firstTicket.price * 0.02) : 0
  const vat = firstTicket ? Math.round(firstTicket.price * 0.1) : 0
  const total = firstTicket ? firstTicket.price + serviceFee + vat : 0

  return (
    <>
      <Header />
      <main className="pt-24 purple-gradient-bg">

        {/* ── Hero Section ── */}
        <section className="relative w-full h-[60vh] min-h-[450px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to top, #0B0B12 0%, rgba(11, 11, 18, 0.4) 50%, transparent 100%), url("${eventDetail.bannerUrl}")`,
            }}
          />
          <div className="relative h-full max-w-[1280px] mx-auto px-6 md:px-20 flex flex-col justify-end pb-12">
            <div className="max-w-3xl">

              {/* Categories & Hashtags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {eventDetail.categories?.map((cat) => (
                  <span
                    key={cat.id}
                    className="bg-primary/20 text-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border border-primary/30"
                  >
                    {cat.name}
                  </span>
                ))}
                {eventDetail.hashtags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-white/10 backdrop-blur text-white px-3 py-1 rounded text-xs font-medium uppercase border border-white/10"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight text-white drop-shadow-2xl">
                {eventDetail.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-[#a692c8]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">calendar_today</span>
                  <span className="text-lg font-medium">{startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <span className="text-lg font-medium">{startTime} - {endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <span className="text-lg font-medium">{eventDetail.location}</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Main Content ── */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-12">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* ── Left Column ── */}
            <div className="flex-1 space-y-16">

              {/* Description */}
              <section>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-primary rounded-full" />
                  Mô tả chi tiết
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
                  <p className="text-lg whitespace-pre-line">{eventDetail.description}</p>
                </div>
              </section>

              {/* Policy (if present) */}
              {eventDetail.policy && (
                <section>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    Chính sách sự kiện
                  </h2>
                  <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                    <p className="whitespace-pre-line">{eventDetail.policy}</p>
                  </div>
                </section>
              )}

              {/* Images Gallery (if present) */}
              {eventDetail.images?.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    Hình ảnh sự kiện
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {eventDetail.images.map((img) => (
                      <div
                        key={img.id}
                        className="aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-colors"
                      >
                        <img
                          src={img.imageUrl}
                          alt="Event image"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Artists / Lineup */}
              {eventDetail.actorImages?.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    Nghệ sĩ tham gia
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {eventDetail.actorImages.map((actor) => (
                      <div
                        key={actor.id}
                        className="flex flex-col items-center text-center group cursor-pointer"
                      >
                        <div
                          className="size-32 rounded-full mb-4 border-2 border-primary/20 group-hover:border-primary group-hover:neon-glow transition-all duration-300 bg-cover bg-center overflow-hidden"
                          style={{ backgroundImage: `url("${actor.image}")` }}
                        />
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {actor.name}
                        </h3>
                        <p className="text-sm text-gray-400">{actor.major}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Sessions / Agenda */}
              {eventDetail.sessions?.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    Chương trình sự kiện
                  </h2>
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 timeline-line" />
                    {eventDetail.sessions.map((session, index) => (
                      <div key={index} className="relative mb-10 last:mb-0">
                        <div
                          className={`absolute -left-10 mt-1.5 size-4 rounded-full transition-colors ${
                            index === 0
                              ? "bg-primary neon-glow"
                              : "bg-primary/40 border-2 border-primary"
                          }`}
                        />
                        <div className="glass p-5 rounded-xl">
                          <span className="text-primary font-bold">
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                          </span>
                          <h4 className="text-xl font-bold mt-1">{session.title}</h4>
                          <p className="text-gray-400 mt-2">{session.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Location / Map */}
              <section>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-primary rounded-full" />
                  Địa điểm tổ chức
                </h2>
                <div className="glass overflow-hidden rounded-2xl">
                  <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold">{eventDetail.location}</h3>
                    </div>
                    {eventDetail.mapUrl && (
                      <a
                        href={eventDetail.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <span className="material-symbols-outlined">directions</span>
                        Chỉ đường
                      </a>
                    )}
                  </div>
                  <div className="h-80 w-full grayscale opacity-70 contrast-125 border-t border-white/10 bg-[#121218] flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent pointer-events-none" />
                    <div className="text-primary flex flex-col items-center">
                      <span className="material-symbols-outlined text-5xl animate-bounce">location_on</span>
                      <span className="font-bold text-lg mt-2 tracking-widest uppercase">Xem bản đồ</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* ── Right Column (Sticky) ── */}
            <div className="w-full lg:w-[400px]">
              <div className="sticky top-28">

                {/* Ticket Card */}
                <div className="glass rounded-2xl p-8 border-2 border-primary/20 shadow-2xl space-y-8">

                  {firstTicket ? (
                    <>
                      {/* Ticket Type Badge */}
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border border-primary/30">
                          {firstTicket.areaName}
                        </span>
                        <span className="bg-white/10 text-white px-3 py-1 rounded text-xs border border-white/10">
                          {firstTicket.areaType}
                        </span>
                      </div>

                      {/* Ticket Name & Price */}
                      <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-1">
                          {firstTicket.name}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-white tracking-tight">
                            {formatPrice(firstTicket.price)}
                          </span>
                          <span className="text-xl text-primary font-bold">VNĐ</span>
                        </div>

                        {/* Sale period */}
                        <p className="text-xs text-gray-500 mt-2">
                          Mở bán: {saleStart} — {saleEnd}
                        </p>
                      </div>

                      {/* Multiple ticket types selector (if more than 1) */}
                      {eventDetail.ticketTypes?.length > 1 && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Loại vé khác</p>
                          <div className="space-y-2">
                            {eventDetail.ticketTypes.slice(1).map((ticket) => (
                              <div
                                key={ticket.id}
                                className="flex justify-between items-center px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary/40 transition-colors cursor-pointer"
                              >
                                <div>
                                  <p className="text-sm font-bold">{ticket.name}</p>
                                  <p className="text-xs text-gray-400">{ticket.areaName}</p>
                                </div>
                                <span className="text-primary font-bold text-sm">
                                  {formatPrice(ticket.price)} VNĐ
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price breakdown */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Phí dịch vụ (2%)</span>
                          <span className="text-white">{formatPrice(serviceFee)} VNĐ</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">VAT (10%)</span>
                          <span className="text-white">{formatPrice(vat)} VNĐ</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                          <span className="text-lg font-bold">Tổng cộng</span>
                          <span className="text-2xl font-bold text-primary">{formatPrice(total)} VNĐ</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <span className="material-symbols-outlined text-4xl mb-2 block">confirmation_number</span>
                      <p>Chưa có thông tin vé</p>
                    </div>
                  )}

                  <button className="w-full py-5 bg-primary rounded-xl font-bold text-lg neon-glow hover:translate-y-[-2px] hover:shadow-[0_0_25px_rgba(124,63,237,0.7)] transition-all flex items-center justify-center gap-3">
                    <span>Mua vé ngay</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="size-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-primary">
                        <span className="material-symbols-outlined">verified</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold">Người bán đã xác minh</p>
                        <p className="text-xs text-gray-400">Đối tác chính thức AIPromo</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="size-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-primary">
                        <span className="material-symbols-outlined">security</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold">Thanh toán an toàn</p>
                        <p className="text-xs text-gray-400">Giao dịch mã hóa SSL</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Card */}
                <div className="mt-6 glass rounded-2xl p-6 border border-white/10">
                  <h4 className="font-bold mb-4">Cần hỗ trợ?</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7 cho mọi thắc mắc về vé.
                  </p>
                  <a className="text-primary text-sm font-bold hover:underline flex items-center gap-1" href="#">
                    Liên hệ ban tổ chức
                    <span className="material-symbols-outlined text-sm">launch</span>
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ── Related Events (static) ── */}
        <section className="bg-[#121218] py-20">
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-primary rounded-full" />
                  Có thể bạn cũng thích
                </h2>
                <p className="text-gray-400 mt-2">Thêm nhiều sự kiện tương lai được tuyển chọn dành cho bạn.</p>
              </div>
              <div className="flex gap-3">
                <button className="size-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="size-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  date: "12 THÁNG 11", price: "TỪ 500K VNĐ", title: "Phục Hưng Kỹ Thuật Số",
                  desc: "Lễ kỷ niệm nghệ thuật NFT và trải nghiệm thực tế ảo ngay giữa lòng thành phố.",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0CJjrCvLX6ZIziGY6xL0wdsBegndPWXYntfqU1OUPanpxOb70UV1Q14x5P9VAXAY2pcF1sP4GtWfCM3qMGjUa5v39bJFedXqtYYqCAhJ4KfHT9Tb_lXeQWXkURWk2xb6Noxhv6mdqDhINRh_38e_brfCUMd5Wq_tSXzPo4KJUyR7RutclhKPZNR8YpNu_OL_PpCHxO7dv4_v8fzmW0kjZRqSRawFARRlJpIvER4L09MpIdA65UeKvYIst4CS4Jz02cSxMPzpIyQ4t"
                },
                {
                  date: "05 THÁNG 12", price: "TỪ 850K VNĐ", title: "Synth City Trực Tiếp",
                  desc: "Lễ hội synthwave lớn nhất Đông Nam Á trở lại với phiên bản thứ ba.",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD37jc4_P8OcN5XXYS_pqMjhYH_WAwkE2fkZoyvInyRJD76_mjpe--4lupRzwKpqkGhfY01vUeEyQK2PP3v7m0EPaMxrRGIA8h6eBwOLvCCHo5xeA172gMiAESUn2hAR7umAfi6XAfEXJW48cwCEPEj2zvZl2ne9k94c3VX-7Has_u4Bh4vwXhgNzKS2gsX7OBttEMxfPxKzzMM7-_U_m0R1c46c_pbKQEYLUkDDbI1ThjelcdxyDbxycQiNr-NlYA7sY5b6v44YAWt"
                },
                {
                  date: "20 THÁNG 1", price: "MIỄN PHÍ", title: "Gặp Gỡ Nhà Sáng Tạo AI",
                  desc: "Sự kiện kết nối dành cho những người đam mê công nghệ, lập trình viên và nghệ sĩ kỹ thuật số.",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk5hDwgHLr0XV5TL6SJSGd2ocNFrpMrLvj4w2yNv6jGP6jWCWQfqYESdPEtEOAgsUyUKDO8eT5R6ciMpmCS7CgUvs9PlfTGW1mFqNay97Oc6sCSs_7vyEttn1BrK68josa7BT5gR7L8wuD3h_MCNTxuDSkvHeULuTLBK61duGhcGShbMAL60WjIwnDInoiNwdhTBgKaDqAJDJCf-VUQY7pKKAooQhjJA6460WfB9jx-X21Ogj5r5xOzlpK3g8gCEgehJzxTmUnJxz6"
                },
              ].map((event, i) => (
                <div key={i} className="group glass rounded-2xl overflow-hidden hover:neon-border transition-all duration-300">
                  <div
                    className="h-48 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url("${event.img}")` }}
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-primary px-2 py-1 rounded bg-primary/10">{event.date}</span>
                      <span className="text-xs font-bold text-gray-400">{event.price}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{event.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

export default EventDetail