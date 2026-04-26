import React, { useRef, useEffect, useState } from 'react';

interface Partner {
  name: string;
  icon: string;
  accent: string;
  glow: string;
  isOfficial: boolean;
  desc: string;
}

interface Destination {
  name: string;
  eventsCount: string;
  image: string;
  tag: string;
}

const PartnersAndDestinations: React.FC = () => {
  const [hoveredPartner, setHoveredPartner] = useState<string | null>(null);
  const [hoveredDest, setHoveredDest] = useState<string | null>(null);

  const partners: Partner[] = [
    {
      name: "VNPay",
      icon: "account_balance_wallet",
      accent: "#38bdf8",
      glow: "rgba(56,189,248,0.35)",
      isOfficial: true,
      desc: "Cổng thanh toán quốc gia",
    },
    {
      name: "MoMo",
      icon: "phone_iphone",
      accent: "#e879f9",
      glow: "rgba(232,121,249,0.3)",
      isOfficial: false,
      desc: "Ví điện tử phổ biến nhất",
    },
    {
      name: "Stripe",
      icon: "payments",
      accent: "#818cf8",
      glow: "rgba(129,140,248,0.3)",
      isOfficial: false,
      desc: "Thanh toán quốc tế toàn cầu",
    },
    {
      name: "Visa",
      icon: "credit_card",
      accent: "#facc15",
      glow: "rgba(250,204,21,0.3)",
      isOfficial: false,
      desc: "Thẻ tín dụng & ghi nợ quốc tế",
    },
  ];

  const destinations: Destination[] = [
    {
      name: "Hồ Chí Minh",
      eventsCount: "120+ Sự kiện",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_G3zg2RsmfwGvEkprlCgWv9I5izEeeaKwRxIo2bSbq0aE_tkiKK1v_tO5z9n2dimQLPduSyYKOlzpIUDmOOc4PUFbcruHZ0rSWgBelATW-rLNN3Tg7JvVyGXxauFMy71GOIDUfKPtjyn02BlvDJVDs7Cxk1h3awB-Z53LRYqPKg_-DX4vt_Xd_v7gHGzB69_DWjL_o0wv3JpjmA9CbdoM6fLmaZyB-QgmnnUwQg375vaA8Lk5PphiqvsIbYECkT5hZ1BDDzVli3QD",
      tag: "🔥 Nổi bật",
    },
    {
      name: "Hà Nội",
      eventsCount: "85+ Sự kiện",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAi5kEtoIiD_tbsaut4T3MKQ8Ald8yq41lsVMwLHOgfw6vuMehB7fTuHNO_DNEqSM5-HXnnGh9e1RYzU_bj5ZW7qRNvd5pPkQTpxtUZmNwandt_2Oxo9mtk0q5ffd0lXKnoB4IDeKTMU6J3exBzk8TVjriszuFKU_Fx5otVrs1P4dWxkgGTcpRkbSN9cwZNI8yMzyIn2quEG_VP98r8Q67g8HjVb_rboUeavHmMUYHf6CW-VUgg0j6CNQUL-Rh5ryt1VUFPjo9DJYUU",
      tag: "🏛️ Lịch sử",
    },
    {
      name: "Đà Lạt",
      eventsCount: "42+ Sự kiện",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjkDrwbstCzLT3pcTbqSm4MOJRelFfVolSn5OnqGAIn4bGIK-hZAQqDD74EFNBkHKf5SlzFCIfddCpbTnh7Qu6NFHGaOA73HFJ5XGTb9UCgnw9H3QbwG-zQnZXt-RhptFRLslg_RAoZr7dviKmai1Gueaqo9jsJ-NhE_89perwMalQde16eCBj4M1JKq8VdLyQH2bGQbSSpXiUWBGILD6DxaE0Vx6gPZSLuYjDEkD9GlXH1UbwSdVp0uAZ_ZuQGBgNAC1oUyLAedbC",
      tag: "🌿 Thiên nhiên",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pad-section {
          font-family: 'Be Vietnam Pro', sans-serif;
          background: #08080f;
          min-height: 100vh;
          overflow: hidden;
          position: relative;
          padding: 100px 0;
        }

        /* ── noise texture overlay ── */
        .pad-section::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.028;
          pointer-events: none;
          z-index: 0;
        }

        .pad-inner { max-width: 1160px; margin: 0 auto; padding: 0 40px; position: relative; z-index: 1; }

        /* ── ambient orbs ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          animation: drift 18s ease-in-out infinite alternate;
        }
        .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%); top: -80px; left: -120px; }
        .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%); top: 200px; right: -80px; animation-delay: -6s; }
        .orb-3 { width: 350px; height: 350px; background: radial-gradient(circle, rgba(232,121,249,0.08) 0%, transparent 70%); bottom: 0; left: 30%; animation-delay: -12s; }
        @keyframes drift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(20px, 30px) scale(1.06); }
        }

        /* ── section eyebrow ── */
        .eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 16px; border-radius: 999px;
          background: rgba(168,85,247,0.07);
          border: 1px solid rgba(168,85,247,0.22);
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2.5px; color: #c084fc;
          text-transform: uppercase; margin-bottom: 22px;
        }

        /* ── partner grid ── */
        .partner-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 110px;
        }
        @media (max-width: 900px) { .partner-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 540px) { .partner-grid { grid-template-columns: 1fr; } }

        .pcard {
          position: relative;
          border-radius: 28px;
          padding: 36px 28px 32px;
          display: flex; flex-direction: column; align-items: center; gap: 18px;
          cursor: pointer;
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), border-color 0.35s ease, background 0.35s ease;
          overflow: hidden;
        }
        .pcard::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.4s ease;
          background: var(--card-glow-bg, transparent);
        }
        .pcard:hover { transform: translateY(-10px) scale(1.03); }
        .pcard:hover::after { opacity: 1; }
        .pcard:hover { border-color: var(--card-border, rgba(255,255,255,0.12)); }

        .pcard-shimmer {
          position: absolute;
          top: -60%; left: -60%;
          width: 220%; height: 220%;
          background: conic-gradient(from 180deg at 50% 50%, transparent 0deg, var(--card-accent, #fff) 40deg, transparent 80deg);
          opacity: 0;
          transition: opacity 0.4s ease;
          animation: spin 6s linear infinite;
          pointer-events: none;
          mix-blend-mode: overlay;
        }
        .pcard:hover .pcard-shimmer { opacity: 0.05; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .pcard-icon {
          width: 76px; height: 76px;
          border-radius: 22px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          position: relative; z-index: 1;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, background 0.35s ease;
        }
        .pcard:hover .pcard-icon {
          transform: scale(1.15) rotate(-6deg);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 10px 30px var(--icon-glow, rgba(255,255,255,0.2));
        }

        .pcard-name {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 20px; font-weight: 800;
          color: rgba(200,210,230,0.9);
          letter-spacing: -0.3px;
          position: relative; z-index: 1;
          transition: color 0.3s ease;
        }
        .pcard:hover .pcard-name { color: var(--card-accent, #fff); }

        .pcard-desc {
          font-size: 12px; color: rgba(100,116,139,0.9);
          text-align: center; line-height: 1.5;
          position: relative; z-index: 1;
          transition: color 0.3s ease;
        }
        .pcard:hover .pcard-desc { color: rgba(148,163,184,1); }

        .badge-official {
          display: inline-flex; align-items: center; gap: 4px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: #38bdf8;
          background: rgba(56,189,248,0.08);
          border: 1px solid rgba(56,189,248,0.2);
          border-radius: 999px; padding: 3px 10px;
          position: relative; z-index: 1;
        }
        .badge-soon {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: rgba(100,116,139,0.8);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px; padding: 3px 10px;
          position: relative; z-index: 1;
        }
        .pulse-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(251,191,36,0.9);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { opacity: 0.3; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        /* ── destinations ── */
        .dest-header {
          text-align: center;
          margin-bottom: 36px;
        }
        .dest-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 44px; font-weight: 900; color: #fff;
          letter-spacing: -1.5px; line-height: 1;
        }
        .dest-subtitle {
          color: rgba(100,116,139,0.9); font-size: 15px;
          margin-top: 10px; font-weight: 300;
        }


        .dest-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-rows: 260px 260px;
          gap: 16px;
        }
        @media (max-width: 900px) {
          .dest-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
          .dcard-featured { grid-column: 1 / -1; }
        }
        @media (max-width: 560px) {
          .dest-grid { grid-template-columns: 1fr; }
          .dcard-featured { grid-column: unset; }
        }

        .dcard {
          position: relative; border-radius: 24px; overflow: hidden;
          cursor: pointer; border: 1px solid rgba(255,255,255,0.06);
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), border-color 0.35s;
        }
        .dcard:hover { transform: scale(1.025); border-color: rgba(255,255,255,0.14); }
        .dcard-featured { grid-row: 1 / 3; }

        .dcard img {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.5s ease;
          filter: saturate(0.85) brightness(0.75);
        }
        .dcard:hover img { transform: scale(1.1); filter: saturate(1.1) brightness(0.8); }

        .dcard-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(5,5,15,0.92) 0%, rgba(5,5,15,0.3) 50%, transparent 100%);
          transition: opacity 0.4s;
        }
        .dcard:hover .dcard-overlay { opacity: 0.85; }

        .dcard-content {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 28px 28px 26px;
        }
        .dcard-tag {
          display: inline-flex; align-items: center; gap: 4px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 999px; padding: 3px 11px;
          color: rgba(255,255,255,0.85);
          margin-bottom: 10px;
        }
        .dcard-name {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 26px; font-weight: 900; color: #fff;
          letter-spacing: -0.5px; line-height: 1.1;
          transition: color 0.3s;
        }
        .dcard-featured .dcard-name { font-size: 36px; }
        .dcard-count {
          font-size: 13px; font-weight: 500;
          color: rgba(167,139,250,0.9); margin-top: 5px;
          transition: color 0.3s;
        }
        .dcard:hover .dcard-count { color: #c4b5fd; }

        /* explore card */
        .dcard-explore {
          background: rgba(255,255,255,0.025);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          gap: 14px; padding: 32px;
          transition: background 0.35s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
          border: 1px dashed rgba(168,85,247,0.25);
        }
        .dcard-explore:hover { background: rgba(168,85,247,0.06); transform: scale(1.025); }
        .explore-icon-ring {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(168,85,247,0.1);
          border: 1px solid rgba(168,85,247,0.25);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s;
        }
        .dcard-explore:hover .explore-icon-ring {
          transform: scale(1.15);
          box-shadow: 0 0 30px rgba(168,85,247,0.3);
        }

        /* section divider line */
        .section-divider {
          display: flex; align-items: center; gap: 18px; margin-bottom: 28px;
        }
        .section-divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,0.25), transparent);
        }

        .partners-heading {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 46px; font-weight: 900; color: #fff;
          letter-spacing: -1.5px; line-height: 1.05;
          margin-bottom: 14px;
        }
        .partners-sub {
          font-size: 15px; color: rgba(100,116,139,0.9);
          line-height: 1.7; font-weight: 300;
        }
        .gradient-text {
          background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <section className="pad-section">
        {/* ambient orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="pad-inner">

          {/* ══ PARTNERS ══ */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="eyebrow">
              <span>🤝</span> Đối tác thanh toán
            </div>
            <h2 className="partners-heading">
              Tin cậy &amp; <span className="gradient-text">Bảo mật</span>
            </h2>
            <p className="partners-sub">
              Tích hợp với các cổng thanh toán hàng đầu Việt Nam &amp; quốc tế,<br />
              mọi giao dịch được mã hóa &amp; bảo vệ tuyệt đối.
            </p>
          </div>

          <div className="partner-grid">
            {partners.map((p) => (
              <div
                key={p.name}
                className="pcard"
                onMouseEnter={() => setHoveredPartner(p.name)}
                onMouseLeave={() => setHoveredPartner(null)}
                style={{
                  '--card-accent': p.accent,
                  '--card-border': `${p.accent}44`,
                  '--icon-glow': p.glow,
                  '--card-glow-bg': `radial-gradient(ellipse at 50% 110%, ${p.glow} 0%, transparent 70%)`,
                  opacity: p.isOfficial ? 1 : 0.6,
                } as React.CSSProperties}
              >
                <div className="pcard-shimmer" />

                <div className="pcard-icon">
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 38,
                      color: p.isOfficial ? p.accent : 'rgba(100,116,139,0.5)',
                      transition: 'color 0.3s',
                    }}
                  >
                    {p.icon}
                  </span>
                </div>

                <div>
                  <div className="pcard-name">{p.name}</div>
                  <div className="pcard-desc" style={{ marginTop: 4 }}>{p.desc}</div>
                </div>

                {p.isOfficial ? (
                  <div className="badge-official">
                    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>verified</span>
                    Chính thức
                  </div>
                ) : (
                  <div className="badge-soon">
                    <span className="pulse-dot" />
                    Sắp ra mắt
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ══ DESTINATIONS ══ */}
          <div className="dest-header">
            <div className="eyebrow" style={{ marginBottom: 16, justifyContent: 'center' }}>
              <span>📍</span> Điểm đến
            </div>
            <h2 className="dest-title">Điểm đến <span className="gradient-text">thú vị</span></h2>
            <p className="dest-subtitle">Những thành phố náo nhiệt nhất dành cho sự kiện của bạn.</p>
          </div>

          <div className="dest-grid">
            {/* featured */}
            <div className="dcard dcard-featured">
              <img src={destinations[0].image} alt={destinations[0].name} />
              <div className="dcard-overlay" />
              <div className="dcard-content">
                <div className="dcard-tag">{destinations[0].tag}</div>
                <div className="dcard-name">{destinations[0].name}</div>
                <div className="dcard-count">{destinations[0].eventsCount}</div>
              </div>
            </div>

            {/* second */}
            <div className="dcard">
              <img src={destinations[1].image} alt={destinations[1].name} />
              <div className="dcard-overlay" />
              <div className="dcard-content">
                <div className="dcard-tag">{destinations[1].tag}</div>
                <div className="dcard-name">{destinations[1].name}</div>
                <div className="dcard-count">{destinations[1].eventsCount}</div>
              </div>
            </div>

            {/* explore card */}
            <div className="dcard dcard-explore">
              <div className="explore-icon-ring">
                <span className="material-symbols-outlined" style={{ fontSize: 34, color: '#a855f7' }}>explore</span>
              </div>
              <div>
                <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>Vị trí khác</div>
                <div style={{ fontSize: 13, color: 'rgba(100,116,139,0.8)', marginTop: 6, lineHeight: 1.5 }}>Tìm sự kiện<br />tại thành phố của bạn</div>
              </div>
            </div>

            {/* third */}
            <div className="dcard">
              <img src={destinations[2].image} alt={destinations[2].name} />
              <div className="dcard-overlay" />
              <div className="dcard-content">
                <div className="dcard-tag">{destinations[2].tag}</div>
                <div className="dcard-name">{destinations[2].name}</div>
                <div className="dcard-count">{destinations[2].eventsCount}</div>
              </div>
            </div>

            {/* stats card */}
            <div className="dcard dcard-explore" style={{ gap: 20 }}>
              {[
                { val: '247+', label: 'Sự kiện / tháng' },
                { val: '18', label: 'Tỉnh thành' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: 'rgba(100,116,139,0.8)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default PartnersAndDestinations;