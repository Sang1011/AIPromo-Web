import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function VnpayReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const BE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7000/api";
    const callbackUrl = `${BE_URL}/payments/vnpay/return?${searchParams.toString()}`;

    fetch(callbackUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuccess && data.data?.isSuccess) {
          navigate("/order/success", {
            replace: true,
            state: { transaction: data.data },
          });
        } else {
          navigate("/order/failed", {
            replace: true,
            state: { message: data.data?.message ?? "Giao dịch thất bại." },
          });
        }
      })
      .catch(() => {
        navigate("/order/failed", { replace: true });
      });
  }, []);

  // Loading trong lúc chờ verify
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0B12",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "2px solid #793bed",
            borderTopColor: "transparent",
            borderRadius: "9999px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
          Đang xác nhận giao dịch...
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}