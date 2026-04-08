import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PackageVnpayReturn() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const BE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7000/api";
        const callbackUrl = `${BE_URL}/payments/vnpay/return?${searchParams.toString()}`;

        fetch(callbackUrl)
            .then((res) => res.json())
            .then((data) => {
                if (data.isSuccess && data.data?.isSuccess) {
                    navigate("/organizer/payment/packages/success", {
                        replace: true,
                        state: { transaction: data.data },
                    });
                } else {
                    navigate("/organizer/payment/packages/failed", {
                        replace: true,
                        state: { message: data.data?.message ?? "Giao dịch thất bại." },
                    });
                }
            })
            .catch(() => {
                navigate("/organizer/payment/packages/failed", { replace: true });
            });
    }, []);

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
            <div
                style={{
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                }}
            >
                <div
                    style={{
                        width: 40,
                        height: 40,
                        border: "2px solid #7c3bed",
                        borderTopColor: "transparent",
                        borderRadius: "9999px",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
                    Đang xác nhận thanh toán gói...
                </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}