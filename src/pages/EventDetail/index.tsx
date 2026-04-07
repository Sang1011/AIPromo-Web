import DOMPurify from 'dompurify'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import type { AppDispatch, RootState } from "../../store"
import { fetchAllEvents, fetchEventByUrlPath } from "../../store/eventSlice"
import type { GetEventDetailResponse } from "../../types/event/event"
import "./EventDetail.css"

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
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-16">
              <section className="space-y-4">
                <SkeletonBox className="h-8 w-48" />
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-3/4" />
              </section>
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

// ─── Lightbox Component ────────────────────────────────────────────────────────

function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: { id: string; imageUrl: string }[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "ArrowRight") onNext()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 size-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
        onClick={onClose}
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      {images.length > 1 && (
        <button
          className="absolute left-4 md:left-8 size-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      )}

      <div
        className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex].imageUrl}
          alt={`Event image ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          style={{ border: "1.5px solid rgba(255,255,255,0.1)" }}
        />
      </div>

      {images.length > 1 && (
        <button
          className="absolute right-4 md:right-8 size-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-white/30"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Related Event Card Skeleton ───────────────────────────────────────────────

function RelatedEventCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <SkeletonBox className="h-48 w-full rounded-none" />
      <div className="p-6 space-y-3">
        <div className="flex justify-between">
          <SkeletonBox className="h-5 w-24" />
          <SkeletonBox className="h-5 w-20" />
        </div>
        <SkeletonBox className="h-6 w-3/4" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-2/3" />
      </div>
    </div>
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

function formatDateShort(isoString: string) {
  if (!isoString) return ""
  const date = new Date(isoString)
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "short" }).toUpperCase()
}

// ─── Main Component ────────────────────────────────────────────────────────────

const RELATED_PAGE_SIZE = 3

function EventDetail() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { urlPath } = useParams<{ urlPath: string }>()

  // ── Lightbox state ──
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // ── Session selection state ──
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState(false)

  // ── Related Events pagination state ──
  const [relatedPage, setRelatedPage] = useState(1)
  const [relatedLoading, setRelatedLoading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!urlPath) return
    dispatch(fetchEventByUrlPath(urlPath))
  }, [dispatch, urlPath])

  // ── Fetch related events whenever page changes ──
  useEffect(() => {
    setRelatedLoading(true)
    dispatch(
      fetchAllEvents({
        PageNumber: relatedPage,
        PageSize: RELATED_PAGE_SIZE,
        SortColumn: "eventStartAt",
        SortOrder: "Descending",
      })
    ).finally(() => setRelatedLoading(false))
  }, [dispatch, relatedPage])

  const eventDetail = useSelector(
    (s: RootState) => s.EVENT?.currentEvent
  ) as GetEventDetailResponse

  // Read related events + pagination from the same store slice
  const relatedEvents = useSelector((s: RootState) => s.EVENT.events)
  const relatedPagination = useSelector((s: RootState) => s.EVENT.pagination)

  if (!eventDetail) {
    return <EventDetailSkeleton />
  }

  // ── Derived data ──
  const firstTicket = eventDetail.ticketTypes?.[0]
  const startDate = formatDate(eventDetail.eventStartAt)
  const startTime = formatTime(eventDetail.eventStartAt)
  const endTime = formatTime(eventDetail.eventEndAt)
  const saleStart = formatDate(eventDetail.ticketSaleStartAt)
  const saleEnd = formatDate(eventDetail.ticketSaleEndAt)

  // ── Lightbox helpers ──
  const images = eventDetail.images ?? []
  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true) }
  const closeLightbox = () => setLightboxOpen(false)
  const prevImage = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length)
  const nextImage = () => setLightboxIndex((i) => (i + 1) % images.length)

  // ── Buy ticket handler ──
  const handleBuyTicket = () => {
    if (!selectedSessionId) {
      setSessionError(true)
      document.getElementById("sessions-section")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    navigate(`/event-detail/${urlPath}/seat-map/show`, {
      state: { eventSessionId: selectedSessionId },
    })
  }

  // ── Related pagination handlers ──
  const handleRelatedPrev = () => {
    if (relatedPage > 1) setRelatedPage((p) => p - 1)
  }
  const handleRelatedNext = () => {
    if (relatedPagination && relatedPage < relatedPagination.totalPages) {
      setRelatedPage((p) => p + 1)
    }
  }

  // Filter out the current event from related list
  const filteredRelated = relatedEvents.filter((e) => String(e.id) !== String(eventDetail.id))

  return (
    <>
      <Header />

      {lightboxOpen && images.length > 0 && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}

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

              {/* Policy */}
              {eventDetail.policy && (
                <section>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    Chính sách sự kiện
                  </h2>
                  <div
                    className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(eventDetail.policy) }}
                  />
                </section>
              )}

              {/* Images Gallery */}
              {images.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    Hình ảnh sự kiện
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                      <div
                        key={img.id}
                        className="aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-colors cursor-pointer relative group"
                        onClick={() => openLightbox(index)}
                      >
                        <img
                          src={img.imageUrl}
                          alt="Event image"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
                            zoom_in
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Artists */}
              {eventDetail.actorImages?.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    Nghệ sĩ tham gia
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {eventDetail.actorImages.map((actor) => (
                      <div key={actor.id} className="flex flex-col items-center text-center group cursor-pointer">
                        <div
                          className="size-32 rounded-full mb-4 border-2 border-primary/20 group-hover:border-primary group-hover:neon-glow transition-all duration-300 bg-cover bg-center overflow-hidden"
                          style={{ backgroundImage: `url("${actor.image}")` }}
                        />
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{actor.name}</h3>
                        <p className="text-sm text-gray-400">{actor.major}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Sessions */}
              {eventDetail.sessions?.length > 0 && (
                <section id="sessions-section">
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    Chương trình sự kiện
                  </h2>
                  <p className="text-gray-400 text-sm mb-8">
                    Chọn buổi bạn muốn tham dự <span className="text-primary font-semibold">*</span>
                  </p>

                  {sessionError && (
                    <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                      <span className="material-symbols-outlined text-xl">error</span>
                      <span className="text-sm font-medium">Vui lòng chọn một buổi trước khi mua vé</span>
                    </div>
                  )}

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 timeline-line" />
                    {eventDetail.sessions.map((session) => {
                      const isSelected = selectedSessionId === session.id
                      return (
                        <div key={session.id} className="relative mb-6 last:mb-0">
                          <div
                            className={`absolute -left-10 mt-1.5 size-4 rounded-full transition-all duration-300 ${isSelected
                              ? "bg-primary neon-glow scale-125"
                              : "bg-primary/40 border-2 border-primary"
                              }`}
                          />
                          <div
                            onClick={() => { setSelectedSessionId(session.id); setSessionError(false) }}
                            className={`glass p-5 rounded-xl cursor-pointer transition-all duration-300 border-2 ${isSelected
                              ? "border-primary/70 bg-primary/10 shadow-[0_0_20px_rgba(124,63,237,0.2)]"
                              : "border-transparent hover:border-primary/30 hover:bg-white/5"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <span className="text-primary font-bold text-sm">
                                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </span>
                                <h4 className="text-xl font-bold mt-1">{session.title}</h4>
                                <p className="text-gray-400 mt-2 text-sm">{session.description}</p>
                              </div>
                              <div
                                className={`shrink-0 size-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-1 ${isSelected ? "border-primary bg-primary" : "border-white/30 bg-transparent"
                                  }`}
                              >
                                {isSelected && (
                                  <span className="material-symbols-outlined text-white text-sm" style={{ fontSize: "14px" }}>
                                    check
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

             

            </div>

            {/* ── Right Column (Sticky) ── */}
            <div className="w-full lg:w-[400px]">
              <div className="sticky top-28">

                <div className="glass rounded-2xl p-8 border-2 border-primary/20 shadow-2xl space-y-8">
                  {firstTicket ? (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        {firstTicket.areaName && (
                          <span className="bg-primary/20 text-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border border-primary/30">
                            {firstTicket.areaName}
                          </span>
                        )}
                        {firstTicket.areaType && (
                          <span className="bg-white/10 text-white px-3 py-1 rounded text-xs border border-white/10">
                            {firstTicket.areaType}
                          </span>
                        )}
                      </div>

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
                        <p className="text-xs text-gray-500 mt-2">
                          Mở bán: {saleStart} — {saleEnd}
                        </p>
                      </div>

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
                                </div>
                                <span className="text-primary font-bold text-sm">
                                  {formatPrice(ticket.price)} VNĐ
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {eventDetail.sessions?.length > 0 && (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${selectedSessionId
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : sessionError
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-white/5 border-white/10 text-gray-400"
                          }`}>
                          <span className="material-symbols-outlined text-xl shrink-0">
                            {selectedSessionId ? "event_available" : "event_note"}
                          </span>
                          <span className="text-sm font-medium">
                            {selectedSessionId
                              ? `Buổi: ${eventDetail.sessions.find(s => s.id === selectedSessionId)?.title}`
                              : "Chưa chọn buổi tham dự"}
                          </span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                          <span className="text-lg font-bold">Tổng cộng</span>
                          <span className="text-2xl font-bold text-primary">{formatPrice(firstTicket.price)} VNĐ</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <span className="material-symbols-outlined text-4xl mb-2 block">confirmation_number</span>
                      <p>Chưa có thông tin vé</p>
                    </div>
                  )}

                  <button
                    onClick={handleBuyTicket}
                    className="w-full py-5 bg-primary rounded-xl font-bold text-lg neon-glow hover:translate-y-[-2px] hover:shadow-[0_0_25px_rgba(124,63,237,0.7)] transition-all flex items-center justify-center gap-3"
                  >
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

        {/* ── Related Events ── */}
        <section className="bg-[#121218] py-20">
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">

            {/* Header row */}
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-primary rounded-full" />
                  Có thể bạn cũng thích
                </h2>
                <p className="text-gray-400 mt-2">
                  Thêm nhiều sự kiện tương lai được tuyển chọn dành cho bạn.
                </p>
              </div>

              {/* Pagination controls — top right */}
              {relatedPagination && relatedPagination.totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRelatedPrev}
                    disabled={relatedPage === 1 || relatedLoading}
                    className="size-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>

                  {/* Page indicator */}
                  <span className="text-slate-400 text-sm font-semibold min-w-[60px] text-center">
                    {relatedPage} / {relatedPagination.totalPages}
                  </span>

                  <button
                    onClick={handleRelatedNext}
                    disabled={!relatedPagination.hasNext || relatedLoading}
                    className="size-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedLoading
                ? [1, 2, 3].map((i) => <RelatedEventCardSkeleton key={i} />)
                : filteredRelated.slice(0, RELATED_PAGE_SIZE).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      navigate(`/event-detail/${event.id}`)
                      window.scrollTo(0, 0)
                    }}
                    className="group glass rounded-2xl overflow-hidden hover:neon-border transition-all duration-300 cursor-pointer"
                  >
                    {/* Banner */}
                    <div className="h-48 w-full overflow-hidden bg-slate-800 relative">
                      {event.bannerUrl ? (
                        <img
                          src={event.bannerUrl}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                          <span className="material-symbols-outlined text-slate-600 text-5xl">image</span>
                        </div>
                      )}
                      {/* Categories overlay */}
                      {event.categories && event.categories.length > 0 && (
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                          {event.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat.id}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-black/40 text-white border border-white/20"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        {event.eventStartAt && (
                          <span className="text-xs font-bold text-primary px-2 py-1 rounded bg-primary/10 border border-primary/20">
                            {formatDateShort(event.eventStartAt)}
                          </span>
                        )}

                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-3">
                          <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Bottom page dots — optional visual indicator */}
            {relatedPagination && relatedPagination.totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: relatedPagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setRelatedPage(page)}
                    disabled={relatedLoading}
                    className={`h-1.5 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${page === relatedPage
                      ? "w-8 bg-primary"
                      : "w-2 bg-white/20 hover:bg-white/40"
                      }`}
                  />
                ))}
              </div>
            )}

          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

export default EventDetail