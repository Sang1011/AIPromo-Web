import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { AppDispatch, RootState } from "../../store";
import {
  clearPostDetail,
  fetchAdminPosts,
  fetchPostDetail,
} from "../../store/postSlice";
import type { AdminPostItem } from "../../types/post/post";

/* ─── Helpers ────────────────────────────────────────────── */
const formatDateVi = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

function excerpt(raw: string, max = 100) {
  const plain = raw.replace(/\s+/g, " ").trim();
  return plain.length <= max ? plain : `${plain.slice(0, max)}…`;
}

/* ─── Plain-text → paragraph renderer ───────────────────── */
function BodyRenderer({ text }: { text: string }) {
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  // If no double newlines, split by sentence groups of ~2
  const chunks = paras.length > 1 ? paras : [text.trim()];

  return (
    <div className="pd-prose">
      {chunks.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { postDetail, loading, error } = useSelector((s: RootState) => s.POST);
  const adminPosts = useSelector((s: RootState) => s.POST?.adminPosts) ?? [];

  useEffect(() => {
    if (!id) return;
    dispatch(fetchPostDetail(id));
    return () => { dispatch(clearPostDetail()); };
  }, [id, dispatch]);

  useEffect(() => {
    if (adminPosts.length > 0) return;
    dispatch(fetchAdminPosts({
      PageNumber: 1, PageSize: 20,
      SortColumn: "CreatedAt", SortOrder: "desc", Status: "Published",
    }));
  }, [dispatch, adminPosts.length]);

  const relatedPosts = useMemo(() =>
    adminPosts.filter((p: AdminPostItem) => p.id !== id).slice(0, 3),
    [adminPosts, id]
  );

  if (!id)
    return <Shell><StateView icon="?" msg="Thiếu mã bài viết." onBack={() => navigate(-1)} /></Shell>;
  if (loading.fetchDetail)
    return <Shell><LoadingSkeleton /></Shell>;
  if (error.fetchDetail || !postDetail)
    return <Shell><StateView icon="!" msg={error.fetchDetail ?? "Không tải được bài viết."} onBack={() => navigate(-1)} /></Shell>;

  return (
    <div className="pd-root">
      <style>{css}</style>
      <Header />

      <main className="pd-main">

        {/* ── Sticky topbar ── */}
        <div className="pd-topbar">
          <div className="pd-topbar-inner">
            <button type="button" onClick={() => navigate(-1)} className="pd-back-btn">
              <span className="pd-back-icon">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M8 1.5L3 6.5L8 11.5" stroke="currentColor" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Quay lại
            </button>
            <Link to="/#blog" className="pd-blog-link">Blog sự kiện</Link>
          </div>
        </div>

        {/* ── Hero ── */}
        <section className="pd-hero">
          {postDetail.imageUrl ? (
            <div className="pd-hero-img-wrap">
              <div className="pd-hero-img" style={{ backgroundImage: `url('${postDetail.imageUrl}')` }} />
              <div className="pd-hero-overlay-t" />
              <div className="pd-hero-overlay-b" />
            </div>
          ) : (
            <div className="pd-hero-blank">
              <div className="pd-hero-grid" />
              <div className="pd-hero-glow" />
            </div>
          )}

          {/* Floating title card */}
          <div className="pd-title-wrap" style={{ marginTop: postDetail.imageUrl ? "-190px" : "-28px" }}>
            <div className="pd-title-card">
              <div className="pd-card-shimmer" />

              <div className="pd-meta-row">
                <span className="pd-badge">
                  <span className="pd-badge-dot" />
                  Bài viết
                </span>
                <span className="pd-sep" />
                <time className="pd-date">{formatDateVi(String(postDetail.createdAt))}</time>
                {postDetail.status === "Published" && (
                  <>
                    <span className="pd-sep" />
                    <span className="pd-published">● Đã xuất bản</span>
                  </>
                )}
              </div>

              <h1 className="pd-title">{postDetail.title}</h1>

              <div className="pd-title-rule">
                <div className="pd-rule-line" />
                <div className="pd-rule-dot" />
                <div className="pd-rule-dot pd-rule-dot--sm" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Article ── */}
        <article className="pd-article-wrap">
          <div className="pd-body-card">
            <div className="pd-body-inner">
              <BodyRenderer text={postDetail.body} />
            </div>
            <div className="pd-body-footer">
              <div className="pd-stamp-dots">
                {[0,1,2].map(i => <span key={i} className="pd-stamp-dot" />)}
              </div>
              <time className="pd-stamp-date">Đăng ngày {formatDateVi(String(postDetail.createdAt))}</time>
              <div className="pd-stamp-line" />
            </div>
          </div>

          {/* Related */}
          {relatedPosts.length > 0 && (
            <section className="pd-related">
              <div className="pd-related-header">
                <div>
                  <p className="pd-related-eyebrow">Khám phá thêm</p>
                  <h2 className="pd-related-heading">Bài viết liên quan</h2>
                </div>
                <div className="pd-related-rule" />
              </div>
              <div className="pd-related-grid">
                {relatedPosts.map((p: AdminPostItem, i) => (
                  <RelatedCard key={p.id} post={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}

/* ─── Related Card ──────────────────────────────────────── */
function RelatedCard({ post, index }: { post: AdminPostItem; index: number }) {
  return (
    <Link
      to={`/post-detail/${post.id}`}
      className="pd-rcard"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="pd-rcard-thumb">
        {post.imageUrl
          ? <div className="pd-rcard-img" style={{ backgroundImage: `url('${post.imageUrl}')` }} />
          : <div className="pd-rcard-blank"><div className="pd-rcard-blank-dot" /></div>
        }
        <div className="pd-rcard-thumb-fade" />
      </div>
      <div className="pd-rcard-body">
        <time className="pd-rcard-date">{formatDateVi(post.createdAt)}</time>
        <h3 className="pd-rcard-title">{post.title}</h3>
        <p className="pd-rcard-excerpt">{excerpt(post.body)}</p>
        <span className="pd-rcard-read">
          Đọc tiếp
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor"
              strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

/* ─── Shell / State / Skeleton ──────────────────────────── */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pd-root">
      <style>{css}</style>
      <Header />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "96px 24px" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

function StateView({ icon, msg, onBack }: { icon: string; msg: string; onBack: () => void }) {
  return (
    <div className="pd-state">
      <div className="pd-state-icon">{icon}</div>
      <p className="pd-state-msg">{msg}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={onBack} className="pd-state-btn pd-state-btn--primary">Quay lại</button>
        <Link to="/" className="pd-state-btn pd-state-btn--ghost">Trang chủ</Link>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="pd-skeleton-wrap">
      <div className="pd-skel pd-skel--hero" />
      <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="pd-skel" style={{ height: 10, width: "30%" }} />
        <div className="pd-skel" style={{ height: 28, width: "80%" }} />
        <div className="pd-skel" style={{ height: 20, width: "55%" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px" }}>
        {[100, 92, 97, 88, 95].map((w, i) => (
          <div key={i} className="pd-skel" style={{ height: 13, width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

/* ─── CSS ────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;600;700&display=swap');

.pd-root {
  min-height: 100vh;
  background: #070510;
  color: #e2deff;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}
.pd-main { flex: 1; padding-top: 72px; }

/* Topbar */
.pd-topbar {
  position: sticky; top: 0; z-index: 40;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  background: rgba(7,5,16,0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.pd-topbar-inner {
  max-width: 900px; margin: 0 auto; padding: 0 24px;
  height: 52px; display: flex; align-items: center; justify-content: space-between;
}
.pd-back-btn {
  display: flex; align-items: center; gap: 8px;
  background: none; border: none; color: rgba(200,190,255,0.5);
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
  cursor: pointer; padding: 0; transition: color 0.18s;
}
.pd-back-btn:hover { color: #e2deff; }
.pd-back-icon {
  width: 26px; height: 26px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.07);
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.18s, background 0.18s;
}
.pd-back-btn:hover .pd-back-icon {
  border-color: rgba(139,92,246,0.45);
  background: rgba(139,92,246,0.07);
}
.pd-blog-link {
  font-family: 'Inter', sans-serif; font-size: 10px;
  font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase;
  color: rgba(167,139,250,0.45); text-decoration: none; transition: color 0.18s;
}
.pd-blog-link:hover { color: #a78bfa; }

/* Hero */
.pd-hero { position: relative; }
.pd-hero-img-wrap {
  position: relative; height: clamp(260px, 50vh, 480px); overflow: hidden;
}
.pd-hero-img {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  animation: heroZoom 10s ease-out forwards;
}
.pd-hero-overlay-t {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom,
    rgba(7,5,16,0.2) 0%, transparent 35%, transparent 45%,
    rgba(7,5,16,0.75) 78%, rgba(7,5,16,1) 100%);
}
.pd-hero-overlay-b {
  position: absolute; inset: 0;
  background: linear-gradient(to right, rgba(7,5,16,0.45) 0%, transparent 55%);
}
.pd-hero-blank {
  position: relative; height: 180px; overflow: hidden;
}
.pd-hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: radial-gradient(ellipse 70% 100% at 50% 100%, black, transparent);
}
.pd-hero-glow {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 80% at 50% 120%, rgba(124,59,237,0.15), transparent);
}

/* Title card */
.pd-title-wrap {
  position: relative; z-index: 10;
  max-width: 900px; margin: 0 auto; padding: 0 24px 8px;
}
.pd-title-card {
  border-radius: 18px; padding: 28px 32px 24px;
  border: 1px solid rgba(255,255,255,0.055);
  background: linear-gradient(155deg, rgba(20,13,42,0.98) 0%, rgba(10,7,24,0.99) 100%);
  box-shadow:
    0 32px 72px -16px rgba(0,0,0,0.75),
    0 0 0 1px rgba(139,92,246,0.06),
    inset 0 1px 0 rgba(255,255,255,0.03);
  animation: slideUp 0.65s cubic-bezier(0.16,1,0.3,1) forwards;
  position: relative; overflow: hidden;
}
.pd-card-shimmer {
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139,92,246,0.45) 40%, rgba(192,132,252,0.55) 60%, transparent);
}
.pd-meta-row {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;
}
.pd-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 11px; border-radius: 99px;
  background: rgba(124,59,237,0.11); border: 1px solid rgba(124,59,237,0.24);
  font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 700;
  letter-spacing: 0.2em; text-transform: uppercase; color: #c084fc;
}
.pd-badge-dot {
  width: 5px; height: 5px; border-radius: 50%; background: #a78bfa;
  animation: pulse 2s ease-in-out infinite;
}
.pd-sep { width: 1px; height: 12px; background: rgba(255,255,255,0.07); }
.pd-date {
  font-family: 'Inter', sans-serif; font-size: 11px;
  color: rgba(148,163,184,0.5); font-weight: 500;
}
.pd-published {
  font-family: 'Inter', sans-serif; font-size: 10px;
  color: rgba(74,222,128,0.55); font-weight: 600;
}
.pd-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.45rem, 3.5vw, 2.35rem);
  font-weight: 900; line-height: 1.2; color: #f5f3ff;
  margin: 0 0 20px; letter-spacing: -0.01em;
}
.pd-title-rule { display: flex; align-items: center; gap: 6px; }
.pd-rule-line {
  height: 1px; flex: 1;
  background: linear-gradient(to right, rgba(124,59,237,0.4), transparent);
}
.pd-rule-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(124,59,237,0.4); }
.pd-rule-dot--sm { width: 3px; height: 3px; background: rgba(124,59,237,0.22); }

/* Article */
.pd-article-wrap {
  max-width: 900px; margin: 0 auto; padding: 20px 24px 80px;
}
.pd-body-card {
  border-radius: 16px; border: 1px solid rgba(255,255,255,0.04); overflow: hidden;
  background: linear-gradient(180deg, rgba(16,10,34,0.65) 0%, rgba(9,6,20,0.88) 100%);
  box-shadow: 0 20px 60px -16px rgba(0,0,0,0.5);
}
.pd-body-inner { padding: 36px 40px; }

/* Prose */
.pd-prose {
  font-family: 'Inter', sans-serif;
  font-size: 15.5px; line-height: 1.92;
  color: rgba(210,200,240,0.8); font-weight: 300;
}
.pd-prose p { margin: 0 0 1.5em; }
.pd-prose p:last-child { margin-bottom: 0; }
.pd-prose p:first-child::first-letter {
  font-family: 'Playfair Display', serif;
  font-size: 3.6em; font-weight: 900;
  line-height: 0.75; float: left;
  margin: 6px 12px 0 0; color: #9f7aea;
}

/* Body footer */
.pd-body-footer {
  padding: 14px 40px 18px;
  border-top: 1px solid rgba(255,255,255,0.04);
  display: flex; align-items: center; gap: 10px;
}
.pd-stamp-dots { display: flex; gap: 3px; }
.pd-stamp-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(124,59,237,0.28); }
.pd-stamp-date {
  font-family: 'Inter', sans-serif; font-size: 10.5px;
  color: rgba(148,163,184,0.32); font-weight: 500;
}
.pd-stamp-line {
  flex: 1; height: 1px;
  background: linear-gradient(to right, rgba(124,59,237,0.08), transparent);
}

/* Related */
.pd-related { margin-top: 52px; }
.pd-related-header {
  display: flex; align-items: flex-end; gap: 16px; margin-bottom: 22px;
}
.pd-related-eyebrow {
  font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 800;
  letter-spacing: 0.3em; text-transform: uppercase;
  color: rgba(167,139,250,0.45); margin: 0 0 5px;
}
.pd-related-heading {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem; font-weight: 900; color: #f5f3ff; margin: 0;
}
.pd-related-rule {
  flex: 1; height: 1px; margin-bottom: 4px;
  background: linear-gradient(to right, rgba(124,59,237,0.15), transparent);
}
.pd-related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

/* Related card */
.pd-rcard {
  display: flex; flex-direction: column; border-radius: 12px;
  overflow: hidden; border: 1px solid rgba(255,255,255,0.045);
  background: linear-gradient(155deg, rgba(18,11,38,0.95), rgba(10,7,22,0.98));
  text-decoration: none; opacity: 0;
  animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  box-shadow: 0 6px 24px -6px rgba(0,0,0,0.42);
}
.pd-rcard:hover {
  transform: translateY(-3px);
  border-color: rgba(124,59,237,0.28);
  box-shadow: 0 14px 40px -8px rgba(0,0,0,0.52), 0 0 0 1px rgba(124,59,237,0.08);
}
.pd-rcard-thumb {
  position: relative; aspect-ratio: 16/9; overflow: hidden; background: #0c0820;
}
.pd-rcard-img {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  transition: transform 0.6s ease;
}
.pd-rcard:hover .pd-rcard-img { transform: scale(1.06); }
.pd-rcard-blank {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
}
.pd-rcard-blank-dot {
  width: 28px; height: 28px; border-radius: 50%;
  border: 1px solid rgba(124,59,237,0.18); background: rgba(124,59,237,0.05);
}
.pd-rcard-thumb-fade {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(10,7,22,0.95), transparent 50%);
}
.pd-rcard-body {
  padding: 14px 16px 16px;
  display: flex; flex-direction: column; gap: 6px; flex: 1;
}
.pd-rcard-date {
  font-family: 'Inter', sans-serif; font-size: 9px;
  text-transform: uppercase; letter-spacing: 0.18em;
  color: rgba(148,163,184,0.32); font-weight: 600;
}
.pd-rcard-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 13.5px; font-weight: 700; color: #e8e4ff;
  line-height: 1.4; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
  transition: color 0.18s;
}
.pd-rcard:hover .pd-rcard-title { color: #fff; }
.pd-rcard-excerpt {
  font-family: 'Inter', sans-serif; font-size: 11.5px;
  color: rgba(148,163,184,0.42); line-height: 1.6; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden; flex: 1;
}
.pd-rcard-read {
  font-family: 'Inter', sans-serif;
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(167,139,250,0.45);
  margin-top: 6px; transition: color 0.18s, gap 0.18s;
}
.pd-rcard:hover .pd-rcard-read { color: #a78bfa; gap: 7px; }

/* State */
.pd-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; text-align: center; max-width: 280px;
}
.pd-state-icon {
  width: 46px; height: 46px; border-radius: 14px;
  background: rgba(124,59,237,0.07); border: 1px solid rgba(124,59,237,0.14);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: rgba(167,139,250,0.55);
  font-family: 'Playfair Display', serif; font-weight: 900;
}
.pd-state-msg {
  font-family: 'Inter', sans-serif; font-size: 13.5px;
  color: rgba(200,190,255,0.5); line-height: 1.6; margin: 0;
}
.pd-state-btn {
  font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
  padding: 8px 18px; border-radius: 8px; cursor: pointer; text-decoration: none;
  transition: background 0.18s, border-color 0.18s, color 0.18s;
}
.pd-state-btn--primary {
  background: rgba(124,59,237,0.11); border: 1px solid rgba(124,59,237,0.26); color: #c084fc;
}
.pd-state-btn--primary:hover { background: rgba(124,59,237,0.2); }
.pd-state-btn--ghost {
  background: transparent; border: 1px solid rgba(255,255,255,0.06); color: rgba(148,163,184,0.48);
}
.pd-state-btn--ghost:hover { color: #e2deff; border-color: rgba(255,255,255,0.14); }

/* Skeleton */
.pd-skeleton-wrap {
  width: 100%; max-width: 860px;
  display: flex; flex-direction: column; gap: 18px;
}
.pd-skel {
  border-radius: 8px;
  background: linear-gradient(90deg,
    rgba(20,13,40,0.9) 0%, rgba(38,24,68,0.65) 50%, rgba(20,13,40,0.9) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.7s ease-in-out infinite;
}
.pd-skel--hero { height: 220px; border-radius: 14px; }

/* Responsive */
@media (max-width: 640px) {
  .pd-body-inner { padding: 22px 18px; }
  .pd-body-footer { padding: 12px 18px 16px; }
  .pd-title-card { padding: 22px 20px; }
  .pd-prose { font-size: 14.5px; }
  .pd-prose p:first-child::first-letter { font-size: 2.8em; }
}

/* Keyframes */
@keyframes heroZoom {
  from { transform: scale(1.06); } to { transform: scale(1); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; } 50% { opacity: 0.35; }
}

/* Scrollbar */
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(124,59,237,0.15); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(124,59,237,0.35); }
`;