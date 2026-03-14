import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchAllEvents } from "../../store/eventSlice";
import type { EventItem } from "../../types/event/event";
import { useNavigate } from "react-router-dom";

/* ================= CONFIG ================= */

const PAGE_SIZE = 6;

/* ================= HELPERS ================= */

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

/* ================= CATEGORY BADGE ================= */

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {};
const PALETTE = [
  { bg: "rgba(124,59,237,0.2)", text: "#c084fc", border: "rgba(124,59,237,0.5)" },
  { bg: "rgba(236,72,153,0.2)", text: "#f472b6", border: "rgba(236,72,153,0.5)" },
  { bg: "rgba(20,184,166,0.2)", text: "#2dd4bf", border: "rgba(20,184,166,0.5)" },
  { bg: "rgba(245,158,11,0.2)", text: "#fbbf24", border: "rgba(245,158,11,0.5)" },
  { bg: "rgba(59,130,246,0.2)", text: "#60a5fa", border: "rgba(59,130,246,0.5)" },
];

const getCategoryColor = (id: number) => {
  if (!CATEGORY_COLORS[id]) {
    CATEGORY_COLORS[id] = PALETTE[id % PALETTE.length];
  }
  return CATEGORY_COLORS[id];
};

/* ================= EVENT CARD ================= */

const EventCard: React.FC<{ item: EventItem }> = ({ item }) => {
   const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/event-detail/${item.id}`);
  };
  return (
    <div
      className="rounded-2xl overflow-hidden group cursor-pointer flex flex-col h-full transition-all duration-300"
        onClick={handleClick}
      style={{
        background: "linear-gradient(145deg, #1a1035, #120d28)",
        border: "1px solid rgba(124,59,237,0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(124,59,237,0.45)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 12px 40px rgba(124,59,237,0.18), 0 4px 24px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(124,59,237,0.12)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
      }}
    >
      {/* Banner */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${item.bannerUrl}')` }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(18,13,40,0.95) 0%, rgba(18,13,40,0.4) 50%, transparent 100%)",
          }}
        />

        {/* Category tags */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap z-10">
          {item.categories?.length > 0 ? (
            item.categories.map((cat) => {
              const color = getCategoryColor(cat.id);
              return (
                <span
                  key={cat.id}
                  className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase backdrop-blur-sm"
                  style={{
                    background: color.bg,
                    color: color.text,
                    border: `1px solid ${color.border}`,
                  }}
                >
                  {cat.name}
                </span>
              );
            })
          ) : (
            <span
              className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase backdrop-blur-sm"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Sự kiện
            </span>
          )}
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide"
            style={{
              background:
                item.status === "Published"
                  ? "rgba(20,184,166,0.2)"
                  : "rgba(245,158,11,0.2)",
              color: item.status === "Published" ? "#2dd4bf" : "#fbbf24",
              border: `1px solid ${item.status === "Published"
                  ? "rgba(20,184,166,0.4)"
                  : "rgba(245,158,11,0.4)"
                }`,
            }}
          >
            {item.status === "Published" ? "● Đang mở" : item.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Date + Time row */}
        <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(167,139,250,0.8)" }}>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(item.eventStartAt)}
          </span>
          <span
            className="w-px h-3"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formatTime(item.eventStartAt)} – {formatTime(item.eventEndAt)}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-bold leading-snug transition-colors duration-200 line-clamp-2"
          style={{
            fontSize: "1rem",
            color: "#f1f0ff",
          }}
        >
          {item.title}
        </h3>

        {/* Footer */}
        <div
          className="mt-auto pt-3 flex items-center gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "rgba(148,163,184,0.6)", flexShrink: 0 }}
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span
            className="text-sm truncate"
            style={{ color: "rgba(148,163,184,0.7)" }}
          >
            {item.location}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ================= SKELETON ================= */

const SkeletonCard = () => (
  <div
    className="rounded-2xl overflow-hidden flex flex-col animate-pulse"
    style={{
      background: "linear-gradient(145deg, #1a1035, #120d28)",
      border: "1px solid rgba(124,59,237,0.08)",
    }}
  >
    <div style={{ aspectRatio: "16/9", background: "rgba(255,255,255,0.04)" }} />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-3 rounded-full w-1/3" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="h-4 rounded-full w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="h-4 rounded-full w-2/3" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="h-3 rounded-full w-1/2 mt-2" style={{ background: "rgba(255,255,255,0.04)" }} />
    </div>
  </div>
);

/* ================= PAGINATION ================= */

const Pagination = ({
  current,
  total,
  hasPrev,
  hasNext,
  onChange,
}: {
  current: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onChange: (p: number) => void;
}) => {
  const getPages = () => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  };

  const btnBase: React.CSSProperties = {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid rgba(124,59,237,0.2)",
    background: "rgba(124,59,237,0.06)",
    color: "rgba(167,139,250,0.8)",
    padding: "0 10px",
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
      <button
        disabled={!hasPrev}
        onClick={() => onChange(current - 1)}
        style={{
          ...btnBase,
          opacity: hasPrev ? 1 : 0.3,
          cursor: hasPrev ? "pointer" : "not-allowed",
        }}
      >
        ← Trước
      </button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} style={{ color: "rgba(255,255,255,0.3)", padding: "0 4px" }}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            style={{
              ...btnBase,
              ...(p === current
                ? {
                  background: "linear-gradient(135deg,#7c3bed,#a855f7)",
                  border: "1px solid transparent",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(124,59,237,0.4)",
                }
                : {}),
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        disabled={!hasNext}
        onClick={() => onChange(current + 1)}
        style={{
          ...btnBase,
          opacity: hasNext ? 1 : 0.3,
          cursor: hasNext ? "pointer" : "not-allowed",
        }}
      >
        Sau →
      </button>
    </div>
  );
};

/* ================= MAIN ================= */

const EventListSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector((s: RootState) => s.EVENT?.events) ?? [];
  const pagination = useSelector((s: RootState) => s.EVENT?.pagination) ?? null;

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);

  /* ===== SEARCH DEBOUNCE ===== */
  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    dispatch(
      fetchAllEvents({
        PageNumber: pageNumber,
        PageSize: PAGE_SIZE,
      })
    )
      .unwrap()
      .catch(() => {
        // UI already handles "no events" state; keep it silent here.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch, pageNumber]);

  /* ===== FRONTEND FILTER (search + category) ===== */
  const filteredEvents = useMemo(() => {
    const keyword = searchQuery.toLowerCase().trim();
    return events.filter((event) => {
      const matchSearch = keyword
        ? event.title.toLowerCase().includes(keyword)
        : true;
      return matchSearch;
    });
  }, [events, searchQuery]);

  /* ================= UI ================= */

  return (
    <section className="relative py-20 px-6" style={{ minHeight: "100vh" }}>
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 800,
          height: 400,
          background:
            "radial-gradient(ellipse at center, rgba(124,59,237,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          {/* Top badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{
              background: "rgba(124,59,237,0.12)",
              border: "1px solid rgba(124,59,237,0.3)",
              boxShadow: "0 0 20px rgba(124,59,237,0.15)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#a78bfa" }}
            />
            <p
              className="text-xs font-bold tracking-[0.25em] uppercase"
              style={{ color: "#a78bfa" }}
            >
              Khám phá
            </p>
          </div>

          {/* Title with gradient */}
          <div className="relative inline-block mb-4">
            <h2
              className="text-5xl font-extrabold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #f1f0ff 0%, #a78bfa 50%, #7c3bed 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.15,
              }}
            >
              Sự kiện nổi bật
            </h2>
            {/* Animated underline accent */}
            <span
              className="absolute -bottom-1 left-0 h-0.5 rounded-full"
              style={{
                width: "60%",
                background: "linear-gradient(90deg, #7c3bed, #a855f7, transparent)",
                animation: "expandWidth 1s ease-out forwards",
              }}
            />
            <style>{`
      @keyframes expandWidth {
        from { width: 0%; opacity: 0; }
        to { width: 60%; opacity: 1; }
      }
    `}</style>
          </div>

          {/* Subtitle */}
          <p
            className="max-w-lg text-base leading-relaxed"
            style={{ color: "rgba(148,163,184,0.75)" }}
          >
            Tham gia những sự kiện đặc sắc nhất — âm nhạc, nghệ thuật, công nghệ và hơn thế nữa,
            được tuyển chọn dành riêng cho bạn.
          </p>

          {/* Divider */}
          <div
            className="mt-6 w-16 h-px rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(124,59,237,0.5), transparent)",
            }}
          />

         
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center">
          {/* Search input */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: "rgba(167,139,250,0.5)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm tên sự kiện..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: 40,
                paddingRight: 16,
                paddingTop: 10,
                paddingBottom: 10,
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(124,59,237,0.2)",
                color: "#f1f0ff",
                fontSize: 14,
                outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.border = "1px solid rgba(124,59,237,0.6)")
              }
              onBlur={(e) =>
                (e.target.style.border = "1px solid rgba(124,59,237,0.2)")
              }
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
            : filteredEvents.length > 0
              ? filteredEvents.map((item) => <EventCard key={item.id} item={item} />)
              : !loading && (
                <div
                  className="col-span-3 flex flex-col items-center justify-center py-20 gap-4"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p className="text-lg font-medium">Không tìm thấy sự kiện nào</p>
                  <p className="text-sm">Thử thay đổi từ khóa hoặc bộ lọc danh mục</p>
                </div>
              )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            current={pageNumber}
            total={pagination.totalPages}
            hasPrev={pagination.hasPrevious}
            hasNext={pagination.hasNext}
            onChange={(p) => {
              setPageNumber(p);
              // window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </div>
    </section>
  );
};

export default EventListSection;