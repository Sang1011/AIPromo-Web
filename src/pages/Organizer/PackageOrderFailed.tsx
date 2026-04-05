import { useLocation, useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, ArrowRight } from "lucide-react";

interface FailedState {
    message?: string;
}

export default function PackageOrderFailed() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as FailedState | null;
    const message = state?.message ?? "Giao dịch thất bại hoặc đã bị huỷ.";

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: "#0B0B12" }}
        >
            {/* Ambient glow */}
            <div
                style={{
                    position: "fixed",
                    top: "30%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 500,
                    height: 500,
                    borderRadius: "9999px",
                    background: "radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div
                    style={{
                        background: "#18122B",
                        border: "1px solid #1E293B",
                        borderRadius: 24,
                        padding: "2.5rem 2rem",
                        textAlign: "center",
                    }}
                >
                    {/* Icon */}
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1.5rem",
                        }}
                    >
                        <XCircle size={32} color="#ef4444" strokeWidth={1.5} />
                    </div>

                    {/* Title */}
                    <h1
                        style={{
                            fontSize: "1.375rem",
                            fontWeight: 700,
                            color: "#fff",
                            margin: "0 0 0.5rem",
                        }}
                    >
                        Thanh toán thất bại
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>
                        Có lỗi xảy ra trong quá trình thanh toán.
                    </p>

                    {/* Error message */}
                    <div
                        style={{
                            background: "rgba(239,68,68,0.05)",
                            border: "1px solid rgba(239,68,68,0.15)",
                            borderRadius: 12,
                            padding: "0.875rem 1rem",
                            marginBottom: "1.75rem",
                        }}
                    >
                        <p style={{ color: "#f87171", fontSize: "0.8125rem", margin: 0, lineHeight: 1.5 }}>
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <button
                            onClick={() => navigate("/organizer/subscription")}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 12,
                                background: "#7c3bed",
                                border: "none",
                                color: "#fff",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#6d28d9")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#7c3bed")}
                        >
                            <RefreshCw size={14} />
                            Thử lại
                        </button>

                        <button
                            onClick={() => navigate("/organizer/dashboard")}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: 12,
                                background: "transparent",
                                border: "1px solid #1E293B",
                                color: "#64748b",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                transition: "all 0.15s",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "#334155";
                                e.currentTarget.style.color = "#94a3b8";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#1E293B";
                                e.currentTarget.style.color = "#64748b";
                            }}
                        >
                            Về trang chủ
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}