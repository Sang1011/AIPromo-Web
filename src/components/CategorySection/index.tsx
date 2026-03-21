import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { fetchAllCategories } from "../../store/categorySlice";
import type { Category } from "../../types/category/category";



interface Feature {
  icon: string;
  title: string;
  desc: string;
}

// Map code/name → Material Symbol icon + gradient
const CATEGORY_CONFIG: Record<string, { icon: string; gradient: string }> = {
  TECH:       { icon: "smart_toy",       gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)" },
  WORKSHOP:   { icon: "build_circle",    gradient: "linear-gradient(135deg, #f59e0b, #f97316)" },
  SPORT:      { icon: "sports_soccer",   gradient: "linear-gradient(135deg, #10b981, #14b8a6)" },
  MUSIC:      { icon: "music_note",      gradient: "linear-gradient(135deg, #ec4899, #f43f5e)" },
  MMF2026:    { icon: "festival",        gradient: "linear-gradient(135deg, #ec4899, #f43f5e)" },
  FOOD:       { icon: "restaurant",      gradient: "linear-gradient(135deg, #f97316, #ef4444)" },
  ART:        { icon: "palette",         gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
  EDUCATION:  { icon: "school",          gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
  BUSINESS:   { icon: "business_center", gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
  GAME:       { icon: "sports_esports",  gradient: "linear-gradient(135deg, #10b981, #14b8a6)" },
  DEFAULT:    { icon: "apps",            gradient: "linear-gradient(135deg, #a855f7, #8b5cf6)" },
};

// Fallback: match by name keywords
function getConfigByName(name: string): { icon: string; gradient: string } {
  const n = name.toLowerCase();
  if (n.includes("công nghệ") || n.includes("tech"))     return CATEGORY_CONFIG.TECH;
  if (n.includes("âm nhạc") || n.includes("music") || n.includes("festival")) return CATEGORY_CONFIG.MUSIC;
  if (n.includes("workshop") || n.includes("thực hành")) return CATEGORY_CONFIG.WORKSHOP;
  if (n.includes("thể thao") || n.includes("sport"))     return CATEGORY_CONFIG.SPORT;
  if (n.includes("ẩm thực") || n.includes("food"))       return CATEGORY_CONFIG.FOOD;
  if (n.includes("nghệ thuật") || n.includes("art"))     return CATEGORY_CONFIG.ART;
  if (n.includes("giáo dục") || n.includes("học"))       return CATEGORY_CONFIG.EDUCATION;
  if (n.includes("kinh doanh") || n.includes("business")) return CATEGORY_CONFIG.BUSINESS;
  if (n.includes("game") || n.includes("esport"))        return CATEGORY_CONFIG.GAME;
  return CATEGORY_CONFIG.DEFAULT;
}

function getCategoryConfig(cat: Category): { icon: string; gradient: string } {
  return CATEGORY_CONFIG[cat.code] ?? getConfigByName(cat.name);
}

const MAX_VISIBLE = 4; // số card hiển thị trước "Khác"

const CategorySection: React.FC = () => {
  const categoriesData: Category[] =
    useSelector((s: RootState) => s.CATEGORY?.categories) ?? [];
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllCategories({}));
  }, [dispatch]);

  const activeCategories = categoriesData.filter((c) => c.isActive);
  const visibleCategories = activeCategories.slice(0, MAX_VISIBLE);
  const extraCategories = activeCategories.slice(MAX_VISIBLE);

  // Build display cards
  const displayCards = visibleCategories.map((cat) => ({
    ...getCategoryConfig(cat),
    title: cat.name,
    desc: cat.description,
    slug: cat.name, // dùng cho navigate
  }));

  // Card "Khác" nếu còn dư
  if (extraCategories.length > 0) {
    displayCards.push({
      icon: "apps",
      gradient: "linear-gradient(135deg, #a855f7, #8b5cf6)",
      title: "Khác",
      desc: "Cộng đồng, Meetup & nhiều hơn",
      slug: "other",
    });
  }

  const features: Feature[] = [
    { icon: "verified",   title: "Chất lượng đảm bảo",   desc: "Mọi sự kiện được kiểm duyệt kỹ lưỡng bởi đội ngũ chuyên nghiệp của chúng tôi." },
    { icon: "update",     title: "Cập nhật liên tục",     desc: "Hàng trăm sự kiện mới được thêm vào mỗi tuần trên khắp cả nước." },
    { icon: "filter_alt", title: "Tìm kiếm thông minh",   desc: "Bộ lọc AI giúp bạn tìm sự kiện phù hợp nhất trong vài giây." },
  ];

  const featGrads = [
    "linear-gradient(135deg, #6366f1, #8b5cf6)",
    "linear-gradient(135deg, #06b6d4, #6366f1)",
    "linear-gradient(135deg, #8b5cf6, #ec4899)",
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

      <style>{`
        .cat-section { font-family: 'Be Vietnam Pro', sans-serif; }

        .cat-card {
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), background 0.3s, border-color 0.3s, box-shadow 0.3s;
          overflow: hidden;
          text-decoration: none;
        }
        .cat-card:hover {
          transform: translateY(-6px);
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.18);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .cat-card:active { transform: translateY(-2px); }

        .icon-wrap {
          width: 64px; height: 64px;
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
          flex-shrink: 0;
          transition: transform 0.3s;
        }
        .cat-card:hover .icon-wrap { transform: scale(1.1); }

        .feat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 32px 28px;
          display: flex; flex-direction: column;
          transition: background 0.3s, border-color 0.3s, transform 0.3s;
        }
        .feat-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-4px);
        }

        .badge {
          display: inline-block;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          color: #818cf8;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 6px 14px; border-radius: 100px;
          margin-bottom: 16px;
        }

        .divider-line {
          width: 48px; height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 2px;
          margin: 0 auto 24px;
        }

        .arrow-icon {
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.25s, transform 0.25s;
          font-size: 16px !important;
          color: #818cf8;
        }
        .cat-card:hover .arrow-icon {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>

      <section className="cat-section relative py-24 px-6 overflow-hidden" style={{ background: "rgb(14,14,24)" }}>
        {/* Ambient glows */}
        <div style={{ position:"absolute", top:"-120px", left:"-120px", width:"500px", height:"500px", background:"radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-120px", right:"-120px", width:"500px", height:"500px", background:"radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div style={{ maxWidth:"1200px", margin:"0 auto", position:"relative" }}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:"56px" }}>
            <div className="badge">Danh mục</div>
            <h2 style={{ fontSize:"clamp(2rem,4vw,3rem)", fontWeight:900, color:"#fff", lineHeight:1.15, marginBottom:"12px", letterSpacing:"-0.02em" }}>
              Khám phá sự kiện<br />
              <span style={{ background:"linear-gradient(135deg, #818cf8, #c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                theo sở thích
              </span>
            </h2>
            <div className="divider-line" />
            <p style={{ color:"#94a3b8", fontSize:"16px", maxWidth:"520px", margin:"0 auto", lineHeight:1.7 }}>
              Tìm kiếm và tham gia các sự kiện phù hợp nhất với đam mê của bạn
            </p>
          </div>

          {/* Categories Grid — dynamic từ API */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))",
            gap:"16px",
            marginBottom:"24px",
            alignItems:"stretch"
          }}>
            {displayCards.map((card, index) => (
              <div
                key={index}
                className="cat-card"
                style={{ minHeight:"200px", justifyContent:"center" }}
                onClick={() => navigate(`/category/${encodeURIComponent(card.slug)}`)}
              >
                {/* Icon */}
                <div className="icon-wrap" style={{
                  background: card.gradient.replace(")", ", 0.12)").replace("linear-gradient(", "linear-gradient("),
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <span className="material-symbols-outlined" style={{
                    fontSize:"28px",
                    background: card.gradient,
                    WebkitBackgroundClip:"text",
                    WebkitTextFillColor:"transparent"
                  }}>
                    {card.icon}
                  </span>
                </div>

                {/* Title */}
                <h4 style={{ fontWeight:700, color:"#f1f5f9", fontSize:"15px", marginBottom:"6px" }}>
                  {card.title}
                </h4>

                {/* Desc */}
                <p style={{ fontSize:"12px", color:"#64748b", marginBottom:"14px", lineHeight:1.5 }}>
                  {card.desc}
                </p>

                {/* CTA arrow — xuất hiện khi hover */}
                <span className="material-symbols-outlined arrow-icon">
                  arrow_forward
                </span>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",
            gap:"16px",
            marginTop:"40px",
            alignItems:"stretch"
          }}>
            {features.map((feat, index) => (
              <div key={index} className="feat-card">
                <div style={{
                  width:"48px", height:"48px", borderRadius:"14px",
                  background:"rgba(99,102,241,0.12)",
                  border:"1px solid rgba(99,102,241,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  marginBottom:"20px", flexShrink:0
                }}>
                  <span className="material-symbols-outlined" style={{
                    fontSize:"22px",
                    background: featGrads[index],
                    WebkitBackgroundClip:"text",
                    WebkitTextFillColor:"transparent"
                  }}>
                    {feat.icon}
                  </span>
                </div>
                <h4 style={{ fontWeight:700, color:"#f1f5f9", fontSize:"17px", marginBottom:"10px" }}>
                  {feat.title}
                </h4>
                <p style={{ color:"#64748b", fontSize:"14px", lineHeight:1.75, margin:0 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};

export default CategorySection;