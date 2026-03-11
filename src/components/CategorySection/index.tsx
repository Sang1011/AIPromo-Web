import React from "react";

interface Category {
  icon: string;
  title: string;
  desc: string;
  count: string;
  gradient: string;
}

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

const CategorySection: React.FC = () => {
  const categories: Category[] = [
    { icon: "smart_toy", title: "Công nghệ", desc: "AI, Web3, Blockchain", count: "120+ sự kiện", gradient: "from-violet-500 to-indigo-500" },
    { icon: "music_note", title: "Âm nhạc", desc: "Festival, Live show", count: "85+ sự kiện", gradient: "from-pink-500 to-rose-500" },
    { icon: "school", title: "Hội thảo", desc: "Chuyên môn, Học thuật", count: "95+ sự kiện", gradient: "from-cyan-500 to-blue-500" },
    { icon: "palette", title: "Workshop", desc: "Kỹ năng, Sáng tạo", count: "72+ sự kiện", gradient: "from-amber-500 to-orange-500" },
    { icon: "sports_esports", title: "Giải trí", desc: "Game, Esports", count: "64+ sự kiện", gradient: "from-emerald-500 to-teal-500" },
    { icon: "apps", title: "Khác", desc: "Cộng đồng, Meetup", count: "150+ sự kiện", gradient: "from-purple-500 to-violet-500" },
  ];

  const features: Feature[] = [
    { icon: "verified", title: "Chất lượng đảm bảo", desc: "Mọi sự kiện được kiểm duyệt kỹ lưỡng bởi đội ngũ chuyên nghiệp của chúng tôi." },
    { icon: "update", title: "Cập nhật liên tục", desc: "Hàng trăm sự kiện mới được thêm vào mỗi tuần trên khắp cả nước." },
    { icon: "filter_alt", title: "Tìm kiếm thông minh", desc: "Bộ lọc AI giúp bạn tìm sự kiện phù hợp nhất trong vài giây." },
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
          gap: 0;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), background 0.3s, border-color 0.3s, box-shadow 0.3s;
          overflow: hidden;
        }
        .cat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: 20px;
        }
        .cat-card:hover::before { opacity: 1; }
        .cat-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,255,255,0.18);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        .icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          flex-shrink: 0;
        }

        .feat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
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
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        .divider-line {
          width: 48px;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 2px;
          margin: 0 auto 24px;
        }
      `}</style>

      <section className="cat-section relative py-24 px-6 overflow-hidden" style={{ background: 'rgb(14, 14, 24)' }}>

        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: '-120px', left: '-120px',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-120px', right: '-120px',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div className="badge">Danh mục</div>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: '12px',
              letterSpacing: '-0.02em'
            }}>
              Khám phá sự kiện<br />
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                theo sở thích
              </span>
            </h2>
            <div className="divider-line" />
            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Tìm kiếm và tham gia các sự kiện phù hợp nhất với đam mê của bạn
            </p>
          </div>

          {/* Categories Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'stretch'
          }}>
            {categories.map((cat, index) => {
              const gradients: Record<string, string> = {
                'from-violet-500 to-indigo-500': 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                'from-pink-500 to-rose-500': 'linear-gradient(135deg, #ec4899, #f43f5e)',
                'from-cyan-500 to-blue-500': 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                'from-amber-500 to-orange-500': 'linear-gradient(135deg, #f59e0b, #f97316)',
                'from-emerald-500 to-teal-500': 'linear-gradient(135deg, #10b981, #14b8a6)',
                'from-purple-500 to-violet-500': 'linear-gradient(135deg, #a855f7, #8b5cf6)',
              };
              const grad = gradients[cat.gradient];
              return (
                <div key={index} className="cat-card" style={{ height: '100%', minHeight: '200px', justifyContent: 'center' }}>
                  <div className="icon-wrap" style={{ background: `${grad.replace('linear-gradient', 'linear-gradient').replace(')', ', 0.15)')}`, border: `1px solid ${grad.includes('violet') ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                    <span className="material-symbols-outlined" style={{
                      fontSize: '28px',
                      background: grad,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {cat.icon}
                    </span>
                  </div>

                  <h4 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '15px', marginBottom: '6px' }}>
                    {cat.title}
                  </h4>

                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', lineHeight: 1.5 }}>
                    {cat.desc}
                  </p>

                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '100px',
                    background: 'rgba(99,102,241,0.1)',
                    color: '#818cf8',
                    border: '1px solid rgba(99,102,241,0.2)',
                    whiteSpace: 'nowrap'
                  }}>
                    {cat.count}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginTop: '40px',
            alignItems: 'stretch'
          }}>
            {features.map((feat, index) => {
              const featGrads = [
                'linear-gradient(135deg, #6366f1, #8b5cf6)',
                'linear-gradient(135deg, #06b6d4, #6366f1)',
                'linear-gradient(135deg, #8b5cf6, #ec4899)',
              ];
              return (
                <div key={index} className="feat-card">
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px', flexShrink: 0
                  }}>
                    <span className="material-symbols-outlined" style={{
                      fontSize: '22px',
                      background: featGrads[index],
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {feat.icon}
                    </span>
                  </div>

                  <h4 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '17px', marginBottom: '10px' }}>
                    {feat.title}
                  </h4>

                  <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.75, margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
};

export default CategorySection;