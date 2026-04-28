import React, { useEffect } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface FeatureBlockProps {
  badgeIcon: string;
  badgeText: string;
  title: string;
  description: string;
  points: string[];
  AnimatedScene: React.FC;
  isReversed?: boolean;
  accentColorClass?: string;
  blurColorClass?: string;
}

// ─── CSS Keyframes injected once ───────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800;900&display=swap');

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-12px) rotate(1.5deg); }
    66%       { transform: translateY(-6px) rotate(-1deg); }
  }
  @keyframes floatDelayed {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-16px) rotate(-2deg); }
    66%       { transform: translateY(-4px) rotate(1.5deg); }
  }
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%       { transform: translateY(-20px) scale(1.04); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(110px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(110px) rotate(-360deg); }
  }
  @keyframes orbitReverse {
    from { transform: rotate(0deg) translateX(90px) rotate(0deg); }
    to   { transform: rotate(-360deg) translateX(90px) rotate(360deg); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: .5; transform: scale(1); }
    50%       { opacity: .9; transform: scale(1.08); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes sparkle {
    0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
    25%       { opacity: .6; transform: scale(1.3) rotate(15deg); }
    75%       { opacity: .8; transform: scale(.85) rotate(-10deg); }
  }
  @keyframes badge-pop {
    0%, 100% { transform: translateY(0) scale(1); }
    50%       { transform: translateY(-8px) scale(1.05); }
  }
  @keyframes scan-line {
    0%   { top: 0%; }
    100% { top: 100%; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .float         { animation: float 5s ease-in-out infinite; }
  .float-delayed { animation: floatDelayed 6s ease-in-out infinite 1s; }
  .float-slow    { animation: floatSlow 7s ease-in-out infinite; }
  .sparkle-icon  { animation: sparkle 3s ease-in-out infinite; }
  .pulse-glow    { animation: pulse-glow 3s ease-in-out infinite; }
  .badge-pop     { animation: badge-pop 4s ease-in-out infinite; }

  .glass-card {
    background: rgba(255,255,255,.06);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,.12);
    box-shadow: 0 25px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1);
  }
  .glass-mini {
    background: rgba(255,255,255,.08);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,.15);
    box-shadow: 0 8px 32px rgba(0,0,0,.3);
  }
  .shimmer-text {
    background: linear-gradient(90deg,#fff 0%,#c084fc 30%,#fff 60%,#818cf8 90%,#fff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 4s linear infinite;
  }
  .section-appear { animation: fadeInUp .8s ease both; }
  .slide-left     { animation: slideInLeft .7s ease both; }
  .slide-right    { animation: slideInRight .7s ease both; }
`;

// ─── AI Mockup Scene ────────────────────────────────────────────────────────
const AIMarketingScene = () => (
  <div style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,.35) 0%, transparent 70%)',
        top: '5%', left: '5%', filter: 'blur(40px)'
      }} className="pulse-glow" />
      <div style={{
        position: 'absolute', width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,.3) 0%, transparent 70%)',
        bottom: '10%', right: '5%', filter: 'blur(35px)', animationDelay: '1.5s'
      }} className="pulse-glow" />

      {/* Main phone card */}
      <div className="glass-card float" style={{
        width: 200, borderRadius: 28, padding: '14px 14px 20px',
        position: 'relative', zIndex: 10
      }}>
        {/* Phone notch */}
        <div style={{ width: 50, height: 5, background: 'rgba(255,255,255,.2)', borderRadius: 10, margin: '0 auto 12px' }} />

        {/* Event banner */}
        <div style={{
          borderRadius: 16, overflow: 'hidden', marginBottom: 12,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #2e1065 100%)',
          padding: '14px 12px', position: 'relative'
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 70% 30%, rgba(192,132,252,.4) 0%, transparent 60%)'
          }} />
          {/* Sparkle decorations */}
          <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 14, opacity: .8 }} className="sparkle-icon">✦</div>
          <div style={{ position: 'absolute', bottom: 12, left: 10, fontSize: 10, opacity: .5, animationDelay: '1s' }} className="sparkle-icon">✦</div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 900,
              fontSize: 18, lineHeight: 1.1, color: '#e9d5ff', letterSpacing: '-0.5px'
            }}>
              twinkle<br /><span style={{ color: '#c084fc' }}>twinkle</span><br />twinkle
            </div>
            <div style={{ fontSize: 7, color: 'rgba(233,213,255,.5)', marginTop: 4, letterSpacing: 2, textTransform: 'uppercase' }}>
              FIRST SOLO CONCERT
            </div>
          </div>
        </div>

        {/* Event details */}
        {[
          { icon: '📅', text: 'Thu 7, 12/10/2024' },
          { icon: '🕐', text: '19:00 – 21:30' },
          { icon: '📍', text: 'Nhạc viện Tp. HCM' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 9 }}>{item.icon}</span>
            <span style={{ fontSize: 8.5, color: 'rgba(255,255,255,.65)', fontFamily: "'Be Vietnam Pro', sans-serif" }}>{item.text}</span>
          </div>
        ))}

        {/* CTA button */}
        <div style={{
          marginTop: 10, background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
          borderRadius: 20, padding: '6px 0', textAlign: 'center',
          fontSize: 9, color: '#fff', fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
          letterSpacing: .5, boxShadow: '0 4px 15px rgba(168,85,247,.4)'
        }}>
          Đăng ký ngay →
        </div>
      </div>

      {/* Floating badge: AI */}
      <div className="glass-mini badge-pop" style={{
        position: 'absolute', top: '8%', right: '8%', zIndex: 20,
        borderRadius: 16, padding: '8px 12px',
        background: 'linear-gradient(135deg,rgba(168,85,247,.25),rgba(99,102,241,.2))',
        border: '1px solid rgba(168,85,247,.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: 8,
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10
          }}>✨</div>
          <div>
            <div style={{ fontSize: 8, color: '#c084fc', fontWeight: 700, letterSpacing: .5 }}>AI CONTENT</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,.5)' }}>Generated</div>
          </div>
        </div>
      </div>

      {/* Floating badge: copy counter */}
      <div className="glass-mini float-delayed" style={{
        position: 'absolute', bottom: '10%', left: '4%', zIndex: 20,
        borderRadius: 14, padding: '8px 10px',
        background: 'linear-gradient(135deg,rgba(16,185,129,.2),rgba(5,150,105,.15))',
        border: '1px solid rgba(16,185,129,.3)'
      }}>
        <div style={{ fontSize: 7, color: '#34d399', fontWeight: 700, letterSpacing: .5 }}>COPYWRITING</div>
        <div style={{ fontSize: 16, color: '#fff', fontWeight: 900 }}>3.2×</div>
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,.4)' }}>engagement boost</div>
      </div>

      {/* Star decorations */}
      {([
        { top: '18%', left: '10%', size: 20, delay: '0s', color: '#f0abfc' },
        { top: '72%', right: '12%', size: 16, delay: '1.2s', color: '#818cf8' },
        { bottom: '22%', left: '38%', size: 12, delay: '0.6s', color: '#c084fc' },
      ] as Array<{ top?: string; bottom?: string; left?: string; right?: string; size: number; delay: string; color: string }>).map((s, i) => (
        <div key={i} className="sparkle-icon" style={{
          position: 'absolute', top: s.top, bottom: s.bottom, left: s.left, right: s.right,
          fontSize: s.size, color: s.color,
          animationDelay: s.delay, filter: `drop-shadow(0 0 6px ${s.color})`
        }}>★</div>
      ))}

      {/* Crown */}
      <div style={{
        position: 'absolute', top: '5%', left: '30%', fontSize: 22,
        filter: 'drop-shadow(0 0 8px rgba(251,191,36,.6))',
        animation: 'floatSlow 5s ease-in-out infinite 0.3s'
      }}>👑</div>

      {/* Heart badge */}
      <div className="glass-mini" style={{
        position: 'absolute', top: '28%', right: '2%', zIndex: 15,
        width: 40, height: 40, borderRadius: 14,
        background: 'linear-gradient(135deg,rgba(168,85,247,.4),rgba(236,72,153,.3))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, animation: 'floatDelayed 5.5s ease-in-out infinite 2s'
      }}>💜</div>

      {/* Calendar */}
      <div className="glass-mini float-delayed" style={{
        position: 'absolute', bottom: '18%', left: '2%', zIndex: 15,
        borderRadius: 14, overflow: 'hidden', width: 42
      }}>
        <div style={{
          background: '#3b82f6', fontSize: 7, textAlign: 'center',
          color: '#fff', fontWeight: 700, padding: '2px 0', letterSpacing: .5
        }}>CAL</div>
        <div style={{
          background: 'rgba(255,255,255,.9)', textAlign: 'center',
          fontSize: 16, fontWeight: 900, color: '#1e3a8a', padding: '2px 0'
        }}>14</div>
      </div>

    </div>
  </div>
);

// ─── QR Check-in Scene ──────────────────────────────────────────────────────
const QRCheckinScene = () => (
  <div style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Ambient */}
      <div style={{
        position: 'absolute', width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,.3) 0%, transparent 70%)',
        top: '0%', right: '0%', filter: 'blur(45px)'
      }} className="pulse-glow" />
      <div style={{
        position: 'absolute', width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,.25) 0%, transparent 70%)',
        bottom: '5%', left: '5%', filter: 'blur(35px)', animationDelay: '2s'
      }} className="pulse-glow" />

      {/* Main phone */}
      <div className="glass-card float" style={{
        width: 190, borderRadius: 28, padding: '14px 14px 18px',
        position: 'relative', zIndex: 10
      }}>
        <div style={{ width: 45, height: 4, background: 'rgba(255,255,255,.2)', borderRadius: 10, margin: '0 auto 12px' }} />

        {/* App header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 8, fontWeight: 800, color: '#60a5fa', fontFamily: "'Be Vietnam Pro', sans-serif", letterSpacing: .5 }}>
            AIPromo
          </div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,.4)' }}>Check-in</div>
        </div>

        {/* QR Scanner viewfinder */}
        <div style={{
          borderRadius: 16, overflow: 'hidden', marginBottom: 10,
          background: 'rgba(0,0,0,.6)', padding: '12px',
          border: '1px solid rgba(59,130,246,.3)', position: 'relative'
        }}>
          {/* Corner markers */}
          {([
            { top: 6, left: 6, borderTop: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6' },
            { top: 6, right: 6, borderTop: '2px solid #3b82f6', borderRight: '2px solid #3b82f6' },
            { bottom: 6, left: 6, borderBottom: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6' },
            { bottom: 6, right: 6, borderBottom: '2px solid #3b82f6', borderRight: '2px solid #3b82f6' },
          ] as Array<React.CSSProperties>).map((c, i) => (
            <div key={i} style={{ position: 'absolute', width: 14, height: 14, borderRadius: 2, ...c }} />
          ))}

          {/* QR code grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1.5, padding: '6px' }}>
            {Array.from({ length: 49 }, (_, i) => {
              const pattern = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
              return (
                <div key={i} style={{
                  width: '100%', paddingBottom: '100%',
                  background: pattern[i] ? 'rgba(255,255,255,.85)' : 'transparent',
                  borderRadius: 1
                }} />
              );
            })}
          </div>

          {/* Scan line */}
          <div style={{
            position: 'absolute', left: 12, right: 12, height: 1.5,
            background: 'linear-gradient(90deg,transparent,#3b82f6,#60a5fa,#3b82f6,transparent)',
            boxShadow: '0 0 8px #3b82f6', borderRadius: 2,
            animation: 'scan-line 2s linear infinite', top: 0
          }} />
        </div>

        {/* Attendee info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 10,
            background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11
          }}>👤</div>
          <div>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: '#fff', fontFamily: "'Be Vietnam Pro', sans-serif" }}>Nguyễn Minh Anh</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,.4)' }}>VIP Ticket #0042</div>
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          background: 'linear-gradient(90deg,rgba(16,185,129,.2),rgba(5,150,105,.15))',
          border: '1px solid rgba(16,185,129,.4)',
          borderRadius: 20, padding: '5px 0', textAlign: 'center',
          fontSize: 8.5, color: '#34d399', fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
        }}>
          <span style={{ fontSize: 10 }}>✓</span> CHECK-IN THÀNH CÔNG
        </div>
      </div>

      {/* Live badge */}
      <div className="glass-mini badge-pop" style={{
        position: 'absolute', top: '8%', left: '5%', zIndex: 20,
        borderRadius: 14, padding: '7px 10px',
        background: 'linear-gradient(135deg,rgba(239,68,68,.2),rgba(220,38,38,.15))',
        border: '1px solid rgba(239,68,68,.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: '#ef4444',
            animation: 'blink 1s ease-in-out infinite', boxShadow: '0 0 6px #ef4444'
          }} />
          <span style={{ fontSize: 8, fontWeight: 800, color: '#fca5a5', letterSpacing: .5 }}>LIVE SYNC</span>
        </div>
      </div>

      {/* Counter badge */}
      <div className="glass-mini float-delayed" style={{
        position: 'absolute', top: '20%', right: '3%', zIndex: 20,
        borderRadius: 14, padding: '8px 10px', textAlign: 'center',
        background: 'linear-gradient(135deg,rgba(59,130,246,.25),rgba(6,182,212,.15))',
        border: '1px solid rgba(59,130,246,.35)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#60a5fa' }}>847</div>
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,.4)', letterSpacing: .3 }}>checked in</div>
      </div>

      {/* Speed badge */}
      <div className="glass-mini float" style={{
        position: 'absolute', bottom: '12%', right: '4%', zIndex: 20,
        borderRadius: 14, padding: '8px 10px',
        background: 'linear-gradient(135deg,rgba(16,185,129,.2),rgba(5,150,105,.15))',
        border: '1px solid rgba(16,185,129,.3)'
      }}>
        <div style={{ fontSize: 8, color: '#34d399', fontWeight: 700, letterSpacing: .3 }}>SCAN SPEED</div>
        <div style={{ fontSize: 14, color: '#fff', fontWeight: 900 }}>0.3s <span style={{ fontSize: 8, color: 'rgba(255,255,255,.4)' }}>avg</span></div>
      </div>

      {/* Floating device circles */}
      <div style={{
        position: 'absolute', bottom: '20%', left: '5%', zIndex: 15,
        animation: 'floatDelayed 6s ease-in-out infinite 1s'
      }}>
        <div className="glass-mini" style={{
          borderRadius: 14, padding: '7px',
          background: 'linear-gradient(135deg,rgba(59,130,246,.3),rgba(6,182,212,.2))'
        }}>
          <div style={{ fontSize: 18 }}>📱</div>
        </div>
      </div>

      {/* Decorative stars */}
      {([
        { top: '14%', right: '18%', size: 14, delay: '0.4s', color: '#60a5fa' },
        { bottom: '28%', left: '35%', size: 10, delay: '1.8s', color: '#06b6d4' },
      ] as Array<{ top?: string; bottom?: string; left?: string; right?: string; size: number; delay: string; color: string }>).map((s, i) => (
        <div key={i} className="sparkle-icon" style={{
          position: 'absolute', top: s.top, bottom: s.bottom, left: s.left, right: s.right,
          fontSize: s.size, color: s.color,
          animationDelay: s.delay, filter: `drop-shadow(0 0 5px ${s.color})`
        }}>★</div>
      ))}

    </div>
  </div>
);

// ─── FeatureBlock ───────────────────────────────────────────────────────────
const FeatureBlock: React.FC<FeatureBlockProps> = ({
  badgeIcon, badgeText, title, description, points,
  AnimatedScene, isReversed = false,
  accentColorClass = 'text-purple-400' }) => {
  const col1Style = { order: isReversed ? 2 : 1 };
  const col2Style = { order: isReversed ? 1 : 2 };

  const accentHex = accentColorClass.includes('blue') ? '#60a5fa' : '#c084fc';
  const blurHex = accentColorClass.includes('blue')
    ? 'rgba(59,130,246,0.12)' : 'rgba(168,85,247,0.12)';
  const borderHex = accentColorClass.includes('blue')
    ? 'rgba(59,130,246,0.25)' : 'rgba(168,85,247,0.25)';
  const bgHex = accentColorClass.includes('blue')
    ? 'rgba(59,130,246,0.08)' : 'rgba(168,85,247,0.08)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
      {/* Text side */}
      <div style={{ ...col1Style, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 999,
          background: bgHex, border: `1px solid ${borderHex}`,
          color: accentHex, fontSize: 12, fontWeight: 700, letterSpacing: .5,
          alignSelf: 'flex-start', fontFamily: "'Be Vietnam Pro', sans-serif"
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{badgeIcon}</span>
          {badgeText}
        </div>

        <h3 style={{
          fontSize: 36, fontWeight: 900, color: '#fff',
          lineHeight: 1.2, fontFamily: "'Be Vietnam Pro', sans-serif", margin: 0
        }}>
          {title}
        </h3>

        <p style={{
          color: 'rgba(148,163,184,1)', fontSize: 16, lineHeight: 1.75, margin: 0,
          fontFamily: "'Be Vietnam Pro', sans-serif"
        }}>
          {description}
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {points.map((point, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              color: 'rgba(226,232,240,1)', fontSize: 15,
              fontFamily: "'Be Vietnam Pro', sans-serif"
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: 6,
                background: `linear-gradient(135deg,${accentHex}33,${accentHex}1a)`,
                border: `1px solid ${accentHex}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: accentHex, flexShrink: 0
              }}>✓</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Scene side */}
      <div style={{ ...col2Style, position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0, background: blurHex,
          filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative' }}>
          <AnimatedScene />
        </div>
      </div>
    </div>
  );
};

// ─── FeaturesSection ────────────────────────────────────────────────────────
const FeaturesSection = () => {
  useEffect(() => {
    const el = document.getElementById('__feat-styles');
    if (!el) {
      const tag = document.createElement('style');
      tag.id = '__feat-styles';
      tag.textContent = STYLES;
      document.head.appendChild(tag);
    }
  }, []);

  return (
    <section style={{ background: '#0e0e18', padding: '120px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 96 }} className="section-appear">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px', borderRadius: 999, marginBottom: 20,
            background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.25)',
            fontSize: 12, color: '#c084fc', fontWeight: 700, letterSpacing: 1,
            fontFamily: "'Be Vietnam Pro', sans-serif", textTransform: 'uppercase'
          }}>
            <span style={{ fontSize: 14 }}>⚡</span> Powered by AI
          </div>
          <h2 style={{
            fontSize: 52, fontWeight: 900, color: '#fff', margin: '0 0 20px',
            fontFamily: "'Be Vietnam Pro', sans-serif", lineHeight: 1.1
          }}>
            <span className="shimmer-text">Hệ thống tối ưu</span>{' '}
            <span style={{ color: '#fff' }}>toàn diện</span>
          </h2>
          <p style={{
            color: 'rgba(148,163,184,1)', fontSize: 17, maxWidth: 520,
            margin: '0 auto', lineHeight: 1.7, fontFamily: "'Be Vietnam Pro', sans-serif"
          }}>
            Sức mạnh công nghệ giúp bạn dẫn đầu trong việc tổ chức và tham gia sự kiện.
          </p>
        </div>

        {/* Feature blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 140 }}>
          <FeatureBlock
            badgeIcon="auto_awesome"
            badgeText="AI Marketing Content"
            title="Generate Content chuyên nghiệp chỉ trong vài giây"
            description="Hệ thống AI của chúng tôi tự động tạo ra nội dung quảng bá, tiêu đề sự kiện hấp dẫn cá nhân hóa cho từng đối tượng khách hàng."
            points={[
              'Tự động viết nội dung mô tả sự kiện (Copywriting)',
              'Thiết kế chiến dịch marketing dựa trên hành vi người dùng',
            ]}
            AnimatedScene={AIMarketingScene}
            isReversed={true}
          />

          <FeatureBlock
            badgeIcon="qr_code_scanner"
            badgeText="Mobile Check-in for Moderator"
            title="Check-in tốc độ cao bằng điện thoại"
            description="Dành riêng cho điều phối viên, ứng dụng hỗ trợ quét mã QR cực nhạy ngay cả trong điều kiện thiếu sáng, giúp loại bỏ hoàn toàn tình trạng ùn tắc tại cửa ra vào."
            points={[
              'Đồng bộ dữ liệu thời gian thực giữa các thiết bị',
              'Hỗ trợ quản lý danh sách người tham dự linh hoạt',
            ]}
            AnimatedScene={QRCheckinScene}
            accentColorClass="text-blue-400"
            blurColorClass="bg-blue-500/10"
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;