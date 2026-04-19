import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { fetchAdminPosts } from "../../store/postSlice";
import type { AdminPostItem } from "../../types/post/post";
import { parseBodyToBlocks } from "../../utils/renderPostContent";
import type { ContentBlock } from "../../types/post/post";

/* ─── Types ──────────────────────────────────────────────── */
export interface BlogItem {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  createdAt: string;
}

/* ─── Helpers ────────────────────────────────────────────── */
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

function extractTextFromBody(raw: string, max = 110): string {
  const blocks = parseBodyToBlocks(raw);

  if (blocks.length > 0) {
    const text = blocks
      .map((b: ContentBlock) => {
        if (b.type === "paragraph" || b.type === "heading") return b.text ?? "";
        if (b.type === "list") return (b.items ?? []).join(" ");
        if (b.type === "highlight") return b.content ?? "";
        return "";
      })
      .filter(Boolean)
      .join(" ");
    const plain = text.replace(/\s+/g, " ").trim();
    return plain.length <= max ? plain : `${plain.slice(0, max)}…`;
  }
  const plain = raw.replace(/\s+/g, " ").trim();
  return plain.length <= max ? plain : `${plain.slice(0, max)}…`;
}

/* ─── Skeleton card ──────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bls-card bls-skeleton" aria-hidden>
    <div className="bls-thumb bls-skel-block" />
    <div className="bls-body" style={{ gap: 10 }}>
      <div className="bls-skel-block" style={{ height: 10, width: "40%" }} />
      <div className="bls-skel-block" style={{ height: 14, width: "90%" }} />
      <div className="bls-skel-block" style={{ height: 14, width: "75%" }} />
      <div className="bls-skel-block" style={{ height: 11, width: "95%", marginTop: 4 }} />
      <div className="bls-skel-block" style={{ height: 11, width: "85%" }} />
    </div>
  </div>
);

/* ─── Blog Card ──────────────────────────────────────────── */
const BlogCard: React.FC<{ item: BlogItem; onClick: () => void }> = ({ item, onClick }) => (
  <article className="bls-card" onClick={onClick} role="button" tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onClick()}>
    {/* Thumbnail */}
    <div className="bls-thumb">
      {item.imageUrl ? (
        <div className="bls-thumb-img" style={{ backgroundImage: `url('${item.imageUrl}')` }} />
      ) : (
        <div className="bls-thumb-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="rgba(139,92,246,0.25)" strokeWidth="1.2">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
      )}
      <div className="bls-thumb-overlay" />
    </div>

    {/* Body */}
    <div className="bls-body">
      <div className="bls-meta">
        <span className="bls-tag">Bài viết</span>
        <time className="bls-date">{formatDate(item.createdAt)}</time>
      </div>

      <h3 className="bls-title">{item.title}</h3>
      <p className="bls-excerpt">{extractTextFromBody(item.body)}</p>

      <div className="bls-footer">
        <span className="bls-read">
          Đọc bài viết
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2.5L9.5 6 6 9.5" stroke="currentColor"
              strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  </article>
);

/* ─── Main ───────────────────────────────────────────────── */
const BlogListSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const adminPosts = useSelector((s: RootState) => s.POST?.adminPosts) ?? [];
  const isLoading = useSelector((s: RootState) => s.POST?.loading?.fetchAdminList) ?? false;
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAdminPosts({
      PageNumber: 1, PageSize: 20,
      SortColumn: "CreatedAt", SortOrder: "desc", Status: "Published",
    }));
  }, [dispatch]);

  const posts = useMemo<BlogItem[]>(
    () => adminPosts.map((p: AdminPostItem) => ({
      id: p.id, title: p.title, body: p.body,
      imageUrl: p.imageUrl, createdAt: p.createdAt,
    })),
    [adminPosts]
  );

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return posts;
    return posts.filter(p =>
      p.title.toLowerCase().includes(kw) || p.body.toLowerCase().includes(kw)
    );
  }, [posts, search]);

  return (
    <section id="blog" className="bls-section">
      <style>{css}</style>

      {/* Ambient glow */}
      <div className="bls-glow" aria-hidden />

      <div className="bls-container">
        {/* ── Section header ── */}
        <header className="bls-header">
          <div className="bls-badge">
            <span className="bls-badge-dot" />
            Bài viết
          </div>
          <h2 className="bls-heading">Blog sự kiện</h2>
          <p className="bls-subheading">
            Cập nhật những bài viết mới nhất về các sự kiện âm nhạc, nghệ thuật, công nghệ và hơn thế nữa.
          </p>
        </header>

        {/* ── Search ── */}
        <div className="bls-search-wrap">
          <div className="bls-search-box">
            <svg className="bls-search-icon" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bls-search-input"
            />
            {search && (
              <button className="bls-search-clear" onClick={() => setSearch("")} aria-label="Xóa">
                ×
              </button>
            )}
          </div>
          {!isLoading && search && (
            <p className="bls-result-count">
              {filtered.length} kết quả
            </p>
          )}
        </div>

        {/* ── Grid ── */}
        <div className="bls-grid">
          {isLoading ? (
            [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length > 0 ? (
            filtered.map(item => (
              <BlogCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/post-detail/${item.id}`)}
              />
            ))
          ) : (
            <div className="bls-empty">
              <div className="bls-empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(139,92,246,0.4)" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p className="bls-empty-title">Không tìm thấy bài viết</p>
              <p className="bls-empty-sub">Thử thay đổi từ khóa tìm kiếm</p>
              <button className="bls-empty-reset" onClick={() => setSearch("")}>Xóa bộ lọc</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogListSection;

/* ─── Styles ─────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  /* ── Layout ── */
  .bls-section {
    position: relative;
    padding: 96px 24px;
    min-height: 100vh;
    background: #06040f;
    overflow: hidden;
  }

  .bls-container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }

  .bls-glow {
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    width: 900px;
    height: 500px;
    background: radial-gradient(ellipse at center, rgba(124,59,237,0.1) 0%, transparent 65%);
    filter: blur(48px);
    pointer-events: none;
  }

  /* ── Header ── */
  .bls-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 48px;
    gap: 12px;
    font-family: 'DM Sans', sans-serif;
  }

  .bls-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 5px 14px;
    border-radius: 99px;
    background: rgba(124,59,237,0.1);
    border: 1px solid rgba(124,59,237,0.28);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #c084fc;
  }

  .bls-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #a78bfa;
    animation: pulse 2s ease-in-out infinite;
  }

  .bls-heading {
    font-family: 'Fraunces', Georgia, serif;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 900;
    background: linear-gradient(135deg, #f5f3ff 0%, #c084fc 55%, #7c3bed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.15;
    margin: 0;
  }

  .bls-subheading {
    max-width: 480px;
    font-size: 14px;
    line-height: 1.7;
    color: rgba(148,163,184,0.65);
    margin: 0;
  }

  /* ── Search ── */
  .bls-search-wrap {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 36px;
  }

  .bls-search-box {
    position: relative;
    width: 300px;
  }

  .bls-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(167,139,250,0.5);
    pointer-events: none;
  }

  .bls-search-input {
    font-family: 'DM Sans', sans-serif;
    width: 100%;
    padding: 10px 36px 10px 36px;
    border-radius: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(124,59,237,0.18);
    color: #f1f0ff;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .bls-search-input::placeholder { color: rgba(148,163,184,0.4); }
  .bls-search-input:focus {
    border-color: rgba(124,59,237,0.55);
    background: rgba(124,59,237,0.05);
  }

  .bls-search-clear {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(148,163,184,0.4);
    font-size: 16px;
    cursor: pointer;
    line-height: 1;
    padding: 2px 4px;
    transition: color 0.15s;
  }
  .bls-search-clear:hover { color: rgba(255,255,255,0.7); }

  .bls-result-count {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: rgba(148,163,184,0.4);
    margin: 0;
  }

  /* ── Grid ── */
  .bls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  /* ── Card ── */
  .bls-card {
    display: flex;
    flex-direction: column;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    background: linear-gradient(160deg, rgba(22,14,45,0.95), rgba(12,8,28,0.98));
    border: 1px solid rgba(124,59,237,0.1);
    box-shadow: 0 4px 24px rgba(0,0,0,0.3);
    transition: transform 0.25s cubic-bezier(0.16,1,0.3,1),
                border-color 0.25s,
                box-shadow 0.25s;
    animation: card-in 0.45s cubic-bezier(0.16,1,0.3,1) both;
  }
  .bls-card:hover {
    transform: translateY(-4px);
    border-color: rgba(124,59,237,0.38);
    box-shadow: 0 16px 48px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,59,237,0.12);
  }
  .bls-card:focus-visible {
    outline: 2px solid rgba(124,59,237,0.6);
    outline-offset: 2px;
  }

  /* Stagger cards */
  .bls-card:nth-child(1) { animation-delay: 0ms; }
  .bls-card:nth-child(2) { animation-delay: 60ms; }
  .bls-card:nth-child(3) { animation-delay: 120ms; }
  .bls-card:nth-child(4) { animation-delay: 180ms; }
  .bls-card:nth-child(5) { animation-delay: 240ms; }
  .bls-card:nth-child(6) { animation-delay: 300ms; }

  /* Thumbnail */
  .bls-thumb {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
    background: #0e0920;
  }

  .bls-thumb-img {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    transition: transform 0.6s ease;
  }
  .bls-card:hover .bls-thumb-img { transform: scale(1.06); }

  .bls-thumb-empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bls-thumb-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top,
      rgba(12,8,28,0.95) 0%,
      rgba(12,8,28,0.3) 50%,
      transparent 100%);
  }

  /* Body */
  .bls-body {
    padding: 16px 18px 18px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    font-family: 'DM Sans', sans-serif;
  }

  .bls-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bls-tag {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 99px;
    background: rgba(124,59,237,0.14);
    border: 1px solid rgba(124,59,237,0.28);
    color: #c084fc;
  }

  .bls-date {
    font-size: 10px;
    color: rgba(148,163,184,0.45);
    margin-left: auto;
    font-weight: 500;
  }

  .bls-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 15px;
    font-weight: 700;
    color: #f1f0ff;
    line-height: 1.4;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.2s;
  }
  .bls-card:hover .bls-title { color: #ede9fe; }

  .bls-excerpt {
    font-size: 12px;
    line-height: 1.65;
    color: rgba(148,163,184,0.6);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  .bls-footer {
    margin-top: 4px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .bls-read {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(167,139,250,0.6);
    transition: color 0.2s, gap 0.2s;
  }
  .bls-card:hover .bls-read {
    color: #a78bfa;
    gap: 7px;
  }

  /* ── Skeleton ── */
  .bls-skeleton { cursor: default; pointer-events: none; }

  .bls-skel-block {
    border-radius: 6px;
    background: linear-gradient(90deg,
      rgba(26,16,53,0.8) 0%,
      rgba(45,28,80,0.6) 50%,
      rgba(26,16,53,0.8) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    display: block;
  }

  .bls-thumb.bls-skel-block { border-radius: 0; aspect-ratio: 16/9; }

  /* ── Empty state ── */
  .bls-empty {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    gap: 10px;
    font-family: 'DM Sans', sans-serif;
  }

  .bls-empty-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    border: 1px solid rgba(124,59,237,0.15);
    background: rgba(124,59,237,0.06);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 4px;
  }

  .bls-empty-title {
    font-size: 15px;
    font-weight: 600;
    color: rgba(241,240,255,0.7);
    margin: 0;
  }

  .bls-empty-sub {
    font-size: 12px;
    color: rgba(148,163,184,0.45);
    margin: 0;
  }

  .bls-empty-reset {
    margin-top: 8px;
    padding: 7px 18px;
    border-radius: 8px;
    background: rgba(124,59,237,0.1);
    border: 1px solid rgba(124,59,237,0.25);
    color: #c084fc;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s, border-color 0.2s;
  }
  .bls-empty-reset:hover {
    background: rgba(124,59,237,0.2);
    border-color: rgba(124,59,237,0.45);
  }

  /* ── Keyframes ── */
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  @keyframes card-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;