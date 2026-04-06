import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchAdminPosts } from "../../store/postSlice";
import type { AdminPostItem } from "../../types/post/post";

/* ================= TYPES ================= */

export interface BlogItem {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  createdAt: string;
  tag?: string;
}

/* ================= HELPERS ================= */

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/* ================= ICONS ================= */

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ImagePlaceholderIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(167,139,250,0.3)"
    strokeWidth="1.2"
  >
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const DocIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

/* ================= BLOG CARD ================= */

const BlogCard: React.FC<{ item: BlogItem; onClick: () => void }> = ({ item, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "linear-gradient(145deg, #1a1035, #120d28)",
        border: `1px solid ${hovered ? "rgba(124,59,237,0.5)" : "rgba(124,59,237,0.14)"}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 36px rgba(124,59,237,0.18)"
          : "0 4px 20px rgba(0,0,0,0.25)",
        transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s",
      }}
    >
      {/* Banner */}
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
        {item.imageUrl ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${item.imageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.6s",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImagePlaceholderIcon />
          </div>
        )}
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(18,13,40,0.96) 0%, rgba(18,13,40,0.35) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Body */}
      <div
        style={{
          padding: "18px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
        }}
      >
        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {item.tag && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 99,
                background: "rgba(124,59,237,0.18)",
                color: "#c084fc",
                border: "1px solid rgba(124,59,237,0.35)",
              }}
            >
              {item.tag}
            </span>
          )}
          <span
            style={{
              fontSize: 11,
              color: "rgba(148,163,184,0.55)",
              marginLeft: "auto",
            }}
          >
            {formatDate(item.createdAt)}
          </span>
        </div>

        {/* Title — clamp 2 lines */}
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#f1f0ff",
            lineHeight: 1.45,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </h3>

        {/* Body — clamp 3 lines */}
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.65,
            color: "rgba(148,163,184,0.75)",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.body}
        </p>

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "rgba(148,163,184,0.45)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <DocIcon />
            Bài viết sự kiện
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#a78bfa",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Xem thêm <ArrowRightIcon />
          </span>
        </div>
      </div>
    </div>
  );
};

/* ================= MODAL ================= */

const BlogModal: React.FC<{ item: BlogItem | null; onClose: () => void }> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,5,20,0.82)",
        backdropFilter: "blur(4px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #1e1240, #150f30)",
          border: "1px solid rgba(124,59,237,0.35)",
          borderRadius: 20,
          maxWidth: 600,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal banner */}
        {item.imageUrl && (
          <div
            style={{
              position: "relative",
              aspectRatio: "16/6",
              overflow: "hidden",
              borderRadius: "20px 20px 0 0",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url('${item.imageUrl}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(21,15,48,0.98) 0%, transparent 60%)",
              }}
            />
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute" as const,
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.15)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <CloseIcon />
        </button>

        {/* Modal content */}
        <div
          style={{
            padding: "22px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {item.tag && (
            <p
              style={{
                fontSize: 11,
                color: "rgba(167,139,250,0.7)",
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                margin: 0,
              }}
            >
              {item.tag} · {formatDate(item.createdAt)}
            </p>
          )}
          <h3
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#f1f0ff",
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {item.title}
          </h3>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: "rgba(148,163,184,0.8)",
              margin: 0,
            }}
          >
            {item.body}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN ================= */

const BlogListSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const adminPosts = useSelector((s: RootState) => s.POST?.adminPosts) ?? [];
  const isLoadingPosts = useSelector(
    (s: RootState) => s.POST?.loading?.fetchAdminList
  ) ?? false;

  const [searchInput, setSearchInput] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);

  useEffect(() => {
    dispatch(
      fetchAdminPosts({
        PageNumber: 1,
        PageSize: 20,
        SortColumn: "CreatedAt",
        SortOrder: "desc",
        Status: "Published",
      })
    );
  }, [dispatch]);

  const mappedBlogsFromApi = useMemo<BlogItem[]>(
    () =>
      adminPosts.map((item: AdminPostItem) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
        tag: "Bài viết",
      })),
    [adminPosts]
  );

  const blogData = mappedBlogsFromApi;

  const filtered = useMemo(() => {
    const kw = searchInput.trim().toLowerCase();
    return blogData.filter((b) =>
      kw
        ? b.title.toLowerCase().includes(kw) ||
          b.body.toLowerCase().includes(kw)
        : true
    );
  }, [blogData, searchInput]);

  return (
    <section
      className="relative py-20 px-6"
      style={{ minHeight: "100vh" }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 400,
          background:
            "radial-gradient(ellipse at center, rgba(124,59,237,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
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
              Bài viết
            </p>
          </div>

          <div className="relative inline-block mb-4">
            <h2
              className="text-5xl font-extrabold tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #f1f0ff 0%, #a78bfa 50%, #7c3bed 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.15,
              }}
            >
              Blog sự kiện
            </h2>
            <span
              className="absolute -bottom-1 left-0 h-0.5 rounded-full"
              style={{
                width: "60%",
                background:
                  "linear-gradient(90deg, #7c3bed, #a855f7, transparent)",
              }}
            />
          </div>

          <p
            className="max-w-lg text-base leading-relaxed"
            style={{ color: "rgba(148,163,184,0.75)" }}
          >
            Cập nhật những bài viết mới nhất về các sự kiện âm nhạc, nghệ
            thuật, công nghệ và hơn thế nữa.
          </p>

          <div
            className="mt-6 w-16 h-px rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(124,59,237,0.5), transparent)",
            }}
          />
        </div>

        {/* Search */}
        <div className="flex mb-8">
          <div className="relative max-w-sm w-full">
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(167,139,250,0.5)",
                pointerEvents: "none",
              }}
            >
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
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
          {isLoadingPosts ? (
            <div
              className="col-span-3 flex flex-col items-center justify-center py-20 gap-4"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              <p className="text-lg font-medium">Đang tải bài viết...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((item) => (
              <BlogCard
                key={item.id}
                item={item}
                onClick={() => setSelectedBlog(item)}
              />
            ))
          ) : (
            <div
              className="col-span-3 flex flex-col items-center justify-center py-20 gap-4"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              <SearchIcon />
              <p className="text-lg font-medium">Không tìm thấy bài viết nào</p>
              <p className="text-sm">Thử thay đổi từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedBlog && (
        <BlogModal
          item={selectedBlog}
          onClose={() => setSelectedBlog(null)}
        />
      )}
    </section>
  );
};

export default BlogListSection;