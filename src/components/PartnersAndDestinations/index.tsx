import React from 'react';

interface Partner {
  name: string;
  icon: string;
  gradient: string;
  glow: string;
  border: string;
  label: string;
}

interface Destination {
  name: string;
  eventsCount: string;
  image: string;
}

const PartnersAndDestinations: React.FC = () => {
  const partners: Partner[] = [
    {
      name: "VNPay",
      icon: "account_balance_wallet",
      gradient: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.08))",
      glow: "rgba(59,130,246,0.5)",
      border: "rgba(59,130,246,0.3)",
      label: "#60a5fa",
    },
    {
      name: "MoMo",
      icon: "phone_iphone",
      gradient: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(219,39,119,0.08))",
      glow: "rgba(236,72,153,0.5)",
      border: "rgba(236,72,153,0.3)",
      label: "#f472b6",
    },
    {
      name: "Stripe",
      icon: "payments",
      gradient: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.08))",
      glow: "rgba(99,102,241,0.5)",
      border: "rgba(99,102,241,0.3)",
      label: "#818cf8",
    },
    {
      name: "Visa",
      icon: "credit_card",
      gradient: "linear-gradient(135deg, rgba(226,232,240,0.1), rgba(148,163,184,0.05))",
      glow: "rgba(226,232,240,0.4)",
      border: "rgba(226,232,240,0.2)",
      label: "#e2e8f0",
    },
  ];

  const destinations: Destination[] = [
    { name: "Hồ Chí Minh", eventsCount: "120+ Sự kiện", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_G3zg2RsmfwGvEkprlCgWv9I5izEeeaKwRxIo2bSbq0aE_tkiKK1v_tO5z9n2dimQLPduSyYKOlzpIUDmOOc4PUFbcruHZ0rSWgBelATW-rLNN3Tg7JvVyGXxauFMy71GOIDUfKPtjyn02BlvDJVDs7Cxk1h3awB-Z53LRYqPKg_-DX4vt_Xd_v7gHGzB69_DWjL_o0wv3JpjmA9CbdoM6fLmaZyB-QgmnnUwQg375vaA8Lk5PphiqvsIbYECkT5hZ1BDDzVli3QD" },
    { name: "Hà Nội", eventsCount: "85+ Sự kiện", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAi5kEtoIiD_tbsaut4T3MKQ8Ald8yq41lsVMwLHOgfw6vuMehB7fTuHNO_DNEqSM5-HXnnGh9e1RYzU_bj5ZW7qRNvd5pPkQTpxtUZmNwandt_2Oxo9mtk0q5ffd0lXKnoB4IDeKTMU6J3exBzk8TVjriszuFKU_Fx5otVrs1P4dWxkgGTcpRkbSN9cwZNI8yMzyIn2quEG_VP98r8Q67g8HjVb_rboUeavHmMUYHf6CW-VUgg0j6CNQUL-Rh5ryt1VUFPjo9DJYUU" },
    { name: "Đà Lạt", eventsCount: "42+ Sự kiện", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjkDrwbstCzLT3pcTbqSm4MOJRelFfVolSn5OnqGAIn4bGIK-hZAQqDD74EFNBkHKf5SlzFCIfddCpbTnh7Qu6NFHGaOA73HFJ5XGTb9UCgnw9H3QbwG-zQnZXt-RhptFRLslg_RAoZr7dviKmai1Gueaqo9jsJ-NhE_89perwMalQde16eCBj4M1JKq8VdLyQH2bGQbSSpXiUWBGILD6DxaE0Vx6gPZSLuYjDEkD9GlXH1UbwSdVp0uAZ_ZuQGBgNAC1oUyLAedbC" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800;900&display=swap');

        .partner-card {
          position: relative;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .partner-card:hover {
          transform: translateY(-8px) scale(1.04);
        }
        .partner-card .card-inner {
          border-radius: 24px;
          padding: 28px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          border: 1px solid;
          transition: box-shadow 0.35s ease, border-color 0.35s ease, background 0.35s ease;
          backdrop-filter: blur(16px);
          background: rgba(255,255,255,0.04);
        }
        .partner-card:hover .card-inner {
          box-shadow: var(--hover-glow);
          background: var(--hover-bg);
          border-color: var(--hover-border) !important;
        }
        .partner-card .icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
        }
        .partner-card:hover .icon-wrap {
          transform: scale(1.15) rotate(-5deg);
          box-shadow: var(--icon-glow);
        }
        .partner-card .partner-label {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.3px;
          transition: color 0.3s ease;
          color: rgba(148,163,184,1);
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .partner-card:hover .partner-label {
          color: var(--label-color);
        }
        .partner-card .verified-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: rgba(100,116,139,1);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.3s ease;
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .partner-card:hover .verified-badge {
          color: var(--label-color);
        }
        @keyframes shimmer-border {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 18px;
          border-radius: 999px;
          background: rgba(168,85,247,0.08);
          border: 1px solid rgba(168,85,247,0.2);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #c084fc;
          text-transform: uppercase;
          font-family: 'Be Vietnam Pro', sans-serif;
          margin-bottom: 20px;
        }
        .partners-title {
          font-size: 42px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -1px;
          line-height: 1.1;
          font-family: 'Be Vietnam Pro', sans-serif;
          margin: 0 0 12px;
        }
        .partners-subtitle {
          font-size: 16px;
          color: rgba(148,163,184,1);
          font-family: 'Be Vietnam Pro', sans-serif;
          margin: 0;
          line-height: 1.6;
        }
        .divider {
          width: 60px;
          height: 3px;
          border-radius: 99px;
          background: linear-gradient(90deg, #7c3aed, #a855f7);
          margin: 16px auto 0;
        }
      `}</style>

      <section style={{ background: 'rgba(14,14,24,0.3)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>

          {/* ── Partners ── */}
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div className="section-label">
              <span style={{ fontSize: 14 }}>🤝</span>
              Đối tác thanh toán
            </div>
            <h2 className="partners-title">Tin cậy & Bảo mật</h2>
            <p className="partners-subtitle">
              Tích hợp với các cổng thanh toán hàng đầu,<br />
              đảm bảo mọi giao dịch an toàn tuyệt đối.
            </p>
            <div className="divider" />
          </div>

          <div style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'center', alignItems: 'stretch',
            gap: 20, marginBottom: 100
          }}>
            {partners.map((p) => (
              <div
                key={p.name}
                className="partner-card"
                style={{
                  ['--hover-glow' as string]: `0 20px 60px ${p.glow}, 0 0 0 1px ${p.border}`,
                  ['--hover-bg' as string]: p.gradient,
                  ['--hover-border' as string]: p.border,
                  ['--label-color' as string]: p.label,
                  ['--icon-glow' as string]: `0 8px 24px ${p.glow}`,
                  flex: '1 1 200px', maxWidth: 240,
                }}
              >
                <div
                  className="card-inner"
                  style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <div className="icon-wrap">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 36, color: p.label }}
                    >
                      {p.icon}
                    </span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div className="partner-label">{p.name}</div>
                    <div className="verified-badge" style={{ justifyContent: 'center', marginTop: 4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>verified</span>
                      Đối tác chính thức
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Destinations ── */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
              <div>
                <h2 style={{
                  fontSize: 40, fontWeight: 900, color: '#fff',
                  fontFamily: "'Be Vietnam Pro', sans-serif", margin: '0 0 8px',
                  letterSpacing: '-0.5px'
                }}>
                  Điểm đến thú vị
                </h2>
                <p style={{ color: 'rgba(148,163,184,1)', fontFamily: "'Be Vietnam Pro', sans-serif", margin: 0 }}>
                  Những thành phố náo nhiệt nhất dành cho sự kiện.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.map((dest) => (
                <div
                  key={dest.name}
                  className="relative group rounded-3xl overflow-hidden aspect-[4/5] border border-primary/20 cursor-pointer"
                >
                  <img
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={dest.image}
                    alt={`${dest.name} view`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 p-8">
                    <h4 className="text-2xl font-black text-white">{dest.name}</h4>
                    <p className="text-primary text-sm font-bold">{dest.eventsCount}</p>
                  </div>
                </div>
              ))}

              <div className="relative group rounded-3xl overflow-hidden aspect-[4/5] border border-primary/20 cursor-pointer glass-card flex flex-col items-center justify-center text-center p-8 hover:bg-primary/5 transition-colors">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 border border-primary/30 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl text-primary">explore</span>
                </div>
                <h4 className="text-2xl font-black text-white mb-2">Vị trí khác</h4>
                <p className="text-slate-400 text-sm">Tìm kiếm sự kiện tại thành phố của bạn</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default PartnersAndDestinations;