import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Crown, ArrowRight, Receipt } from "lucide-react";

interface TransactionState {
    transaction?: {
        paymentTransactionId?: string;
        totalAmount?: number;
        completedAt?: string;
        message?: string;
    };
}

export default function PackageOrderSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as TransactionState | null;
    const tx = state?.transaction;

    const formattedAmount = tx?.totalAmount
        ? tx.totalAmount.toLocaleString("vi-VN") + " ₫"
        : null;

    const formattedDate = tx?.completedAt
        ? new Date(tx.completedAt).toLocaleString("vi-VN")
        : new Date().toLocaleString("vi-VN");

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
                    background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
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
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid rgba(16,185,129,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1.5rem",
                        }}
                    >
                        <CheckCircle size={32} color="#10b981" strokeWidth={1.5} />
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
                        Thanh toán thành công!
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 2rem" }}>
                        Gói của bạn đã được kích hoạt. Bắt đầu tận hưởng các quyền lợi ngay.
                    </p>

                    {/* Transaction details */}
                    {(tx?.paymentTransactionId || formattedAmount) && (
                        <div
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid #1E293B",
                                borderRadius: 14,
                                padding: "1rem 1.25rem",
                                marginBottom: "1.75rem",
                                textAlign: "left",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    marginBottom: "0.75rem",
                                }}
                            >
                                <Receipt size={12} color="#475569" />
                                <span style={{ fontSize: "0.625rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    Chi tiết giao dịch
                                </span>
                            </div>

                            {tx?.paymentTransactionId && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Mã giao dịch</span>
                                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace" }}>
                                        #{tx.paymentTransactionId.slice(0, 12)}...
                                    </span>
                                </div>
                            )}

                            {formattedAmount && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Số tiền</span>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981" }}>
                                        {formattedAmount}
                                    </span>
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Thời gian</span>
                                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{formattedDate}</span>
                            </div>
                        </div>
                    )}

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
                            <Crown size={14} />
                            Xem gói của tôi
                        </button>

                        <button
                            onClick={() => navigate("/organizer/overall")}
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
                            Về trang Organizer
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}