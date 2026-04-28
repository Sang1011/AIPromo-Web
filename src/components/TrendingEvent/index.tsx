import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { EventItem } from "../../types/event/event";
import type { AppDispatch, RootState } from "../../store";
import { fetchTrendingEvent } from "../../store/eventSlice";

// ─── helpers ─────────────────────────────────────────────

const formatPrice = (price: number) =>
  price === 0
    ? "Miễn phí"
    : new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ─── Event Card ─────────────────────────────────────────

function EventCard({ event, rank }: { event: EventItem; rank: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={`event-detail/${event.urlPath}`}
      className="relative flex-shrink-0 group"
      style={{
        width: "clamp(260px, 28vw, 360px)",
        scrollSnapAlign: "start",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          aspectRatio: "16/9",
          transform: hovered ? "scale(1.05)" : "scale(1)",
          boxShadow: hovered
            ? "0 20px 50px rgba(0,0,0,0.7)"
            : "0 8px 20px rgba(0,0,0,0.4)",
        }}
      >
        {/* Glow border */}
        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/40 to-green-400/40 opacity-0 group-hover:opacity-100 transition" />

        {/* Image */}
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://placehold.co/300x170/18122B/7c3bed?text=Event";
          }}
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-sm">
          <p className="text-white font-bold text-sm line-clamp-2">
            {event.title}
          </p>
          <p className="text-green-400 text-xs mt-1 font-semibold">
            {formatPrice(event.minPrice)}
            {event.minPrice !== event.maxPrice &&
              ` – ${formatPrice(event.maxPrice)}`}
          </p>
          {event.eventStartAt && (
            <p className="text-gray-300 text-xs mt-1">
              {formatDate(event.eventStartAt)}
            </p>
          )}
        </div>
      </div>

      {/* Rank */}
      <div
        className="absolute -left-3 -bottom-3 z-20 font-black"
        style={{
          fontSize: "clamp(3rem, 6vw, 4.5rem)",
          color: "transparent",
          WebkitTextStroke: "3px #22c55e",
          textShadow: "0 0 30px rgba(34,197,94,0.7)",
          fontFamily: "'Arial Black', 'Impact'",
        }}
      >
        {rank}
      </div>
    </a>
  );
}

// ─── Skeleton ───────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 rounded-2xl animate-pulse"
      style={{
        width: "clamp(220px, 24vw, 300px)",
        aspectRatio: "16/9",
        background: "#18122B",
      }}
    />
  );
}

// ─── Main ───────────────────────────────────────────────

export default function TrendingEvents() {
  const dispatch = useDispatch<AppDispatch>();
  const { trendingEvents, loading } = useSelector(
    (state: RootState) => state.EVENT
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    dispatch(
      fetchTrendingEvent({
        Days: 30,
        SortOrder: "Ascending",
        PageSize: 10,
      })
    );
  }, [dispatch]);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState);
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [trendingEvents]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const items: EventItem[] = trendingEvents?.data?.items ?? [];
  const isLoading = loading === "pending";

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="w-full py-10">
      {/* ✅ FIX CĂN LỀ CHUẨN */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-3 text-2xl font-extrabold">
            <span>🔥</span>
            <span className="bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
              Sự kiện xu hướng
            </span>
          </h2>

          <div className="flex gap-2">
            {/* Left */}
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full flex items-center justify-center 
               bg-white/5 hover:bg-white/10 
               border border-white/10 
               transition-all duration-200 
               disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80 group-hover:opacity-100"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Right */}
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full flex items-center justify-center 
               bg-white/5 hover:bg-white/10 
               border border-white/10 
               transition-all duration-200 
               disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80 group-hover:opacity-100"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scroll */}
        <div className="relative">
          {/* Fade */}
          <div className="absolute -left-4 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-[#0B0B12] to-transparent" />
          <div className="absolute -right-4 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-[#0B0B12] to-transparent" />

          {/* List */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4"
            style={{
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              scrollSnapType: "x mandatory",
            }}
          >
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
              : items.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  rank={index + 1}
                />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}