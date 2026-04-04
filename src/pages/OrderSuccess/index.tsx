import { useEffect, useState } from "react";
import "./orderSuccess.css";
import { useLocation, useNavigate } from "react-router-dom";

const floatingParticles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  delay: Math.random() * 3,
  duration: Math.random() * 4 + 4,
}));

export default function OrderSuccess() {
  const [visible, setVisible] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();

  // transaction có thể null (thanh toán bằng ví ảo)
  const transaction = state?.transaction ?? null;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#0B0B12",
        fontFamily: "'Space Grotesk', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Atmospheric blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "25%",
            width: 384,
            height: 384,
            background: "rgba(121, 59, 237, 0.05)",
            borderRadius: "9999px",
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            right: "25%",
            width: 256,
            height: 256,
            background: "rgba(121, 59, 237, 0.10)",
            borderRadius: "9999px",
            filter: "blur(100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(121,59,237,0.15) 0%, transparent 70%)",
            borderRadius: "9999px",
          }}
        />
      </div>

      {/* Floating particles */}
      {floatingParticles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "fixed",
            left: `${p.x}%`,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            background: "rgba(121,59,237,0.5)",
            borderRadius: "9999px",
            animation: `floatUp ${p.duration}s ${p.delay}s infinite linear`,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Main */}
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2.5rem",
          }}
        >
          {/* Icon */}
          <div style={{ position: "relative", display: "inline-flex" }}>
            {[1, 2].map((r) => (
              <div
                key={r}
                style={{
                  position: "absolute",
                  inset: `-${r * 18}px`,
                  borderRadius: "9999px",
                  border: "1px solid rgba(121,59,237,0.3)",
                  animation: `pulseRing ${1.8 + r * 0.5}s ${r * 0.4}s ease-in-out infinite`,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(121,59,237,0.20)",
                borderRadius: "9999px",
                filter: "blur(40px)",
                transform: "scale(1.5)",
              }}
            />
            <div
              style={{
                position: "relative",
                background: "#18122B",
                padding: "2rem",
                borderRadius: "9999px",
                border: "1px solid rgba(121,59,237,0.30)",
                boxShadow: "0 0 20px rgba(121,59,237,0.40)",
                animation: visible
                  ? "iconPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards"
                  : "none",
                opacity: 0,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#793bed", fontSize: 72 }}
              >
                check_circle
              </span>
            </div>
          </div>

          {/* Heading */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              animation: visible
                ? "fadeSlideUp 0.6s 0.3s ease forwards"
                : "none",
              opacity: 0,
            }}
          >
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#F1F1F1",
                margin: 0,
              }}
            >
              Thanh toán thành công!
            </h1>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "1.1rem",
                maxWidth: 400,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Cảm ơn quý khách đã tin dùng{" "}
              <span style={{ color: "#793bed", fontWeight: 600 }}>
                AIPromo
              </span>
              . Vé của bạn đã sẵn sàng trong tài khoản.
            </p>
          </div>

          {/* Card */}
          <div
            style={{
              width: "100%",
              background: "rgba(24,18,43,0.5)",
              backdropFilter: "blur(20px)",
              borderRadius: "1rem",
              border: "1px solid rgba(255,255,255,0.05)",
              padding: 4,
              animation: visible
                ? "fadeSlideUp 0.6s 0.45s ease forwards"
                : "none",
              opacity: 0,
            }}
          >
            <div
              style={{
                background: "#18122B",
                padding: "2rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Transaction info — chỉ hiện khi có data (VNPay) */}
              {transaction && (
                <div
                  style={{
                    marginBottom: "1.5rem",
                    paddingBottom: "1.5rem",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {[
                    {
                      label: "Mã giao dịch",
                      value: `#${transaction.transactionNo}`,
                    },
                    {
                      label: "Trạng thái",
                      value: transaction.message,
                    },
                    {
                      label: "Thời gian",
                      value: new Date(transaction.completedAt).toLocaleString(
                        "vi-VN"
                      ),
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#475569", fontSize: "0.875rem" }}>
                        {label}
                      </span>
                      <span
                        style={{
                          color: "#F1F1F1",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Thanh toán ví ảo — hiện badge thay thế */}
              {!transaction && (
                <div
                  style={{
                    marginBottom: "1.5rem",
                    paddingBottom: "1.5rem",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#793bed", fontSize: 20 }}
                  >
                    account_balance_wallet
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                    Thanh toán bằng{" "}
                    <span style={{ color: "#F1F1F1", fontWeight: 600 }}>
                      ví AIPromo
                    </span>{" "}
                    thành công
                  </span>
                </div>
              )}

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <button
                  className="btn-primary"
                  onClick={() => navigate("/profile/ticking-user")}
                >
                  Xem vé của tôi
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => navigate("/")}
                >
                  Quay lại trang chủ
                </button>
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  color: "#475569",
                  fontSize: "0.875rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  verified_user
                </span>
                <span>Giao dịch an toàn &amp; bảo mật</span>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
              opacity: 0,
              animation: visible
                ? "fadeSlideUp 0.6s 0.6s ease forwards"
                : "none",
            }}
          >
            {[
              { icon: "mail", label: "Xác nhận đã gửi qua email" },
              { icon: "smartphone", label: "Sẵn sàng trên ứng dụng" },
              { icon: "support_agent", label: "Hỗ trợ 24/7 khi cần" },
            ].map(({ icon, label }) => (
              <div
                key={icon}
                style={{
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(24,18,43,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  opacity: 0.65,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#793bed", fontSize: 24 }}
                >
                  {icon}
                </span>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}