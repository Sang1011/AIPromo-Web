import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { confirmEventMember, resetConfirmStatus } from "../../store/eventMemberSlice";

export default function VerifyMemberPage() {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const called = useRef(false);

    const eventId = searchParams.get("eventId") ?? "";
    const memberId = searchParams.get("memberId") ?? "";

    const { confirmStatus, confirmError } = useSelector((s: RootState) => s.EVENT_MEMBER);
    useEffect(() => {
        if (!eventId || !memberId) return;
        if (called.current) return;
        called.current = true;

        dispatch(confirmEventMember({ eventId, memberId }));

        return () => {
            dispatch(resetConfirmStatus());
        };
    }, [eventId, memberId, dispatch]);

    const isInvalidLink = !eventId || !memberId;

    return (
        <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center px-4">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-[#13102a] border border-[#2a2250] rounded-2xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] px-8 py-6 text-center">
                        <div className="text-2xl font-extrabold text-white tracking-tight">AIPromo</div>
                        <div className="text-sm text-purple-200 mt-1">Xác nhận tham gia sự kiện</div>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-8 text-center space-y-6">
                        {/* Invalid link */}
                        {isInvalidLink && (
                            <StatusBlock
                                icon={<IconError />}
                                iconBg="bg-red-500/10"
                                iconColor="text-red-400"
                                title="Liên kết không hợp lệ"
                                desc="Link xác nhận thiếu thông tin. Vui lòng kiểm tra lại email lời mời."
                                action={
                                    <button
                                        onClick={() => navigate("/")}
                                        className="btn-primary"
                                    >
                                        Về trang chủ
                                    </button>
                                }
                            />
                        )}

                        {/* Loading */}
                        {!isInvalidLink && confirmStatus === "loading" && (
                            <StatusBlock
                                icon={<IconSpinner />}
                                iconBg="bg-primary/10"
                                iconColor="text-primary"
                                title="Đang xác nhận..."
                                desc="Vui lòng chờ trong giây lát."
                            />
                        )}

                        {/* Idle (chưa gọi — trường hợp hiếm) */}
                        {!isInvalidLink && confirmStatus === "idle" && (
                            <StatusBlock
                                icon={<IconSpinner />}
                                iconBg="bg-primary/10"
                                iconColor="text-primary"
                                title="Đang khởi tạo..."
                                desc=""
                            />
                        )}

                        {/* Success */}
                        {confirmStatus === "success" && (
                            <StatusBlock
                                icon={<IconSuccess />}
                                iconBg="bg-green-500/10"
                                iconColor="text-green-400"
                                title="Xác nhận thành công!"
                                desc="Bạn đã gia nhập đội ngũ quản lý sự kiện. Đăng nhập để bắt đầu làm việc."
                                action={
                                    <button
                                        onClick={() => navigate("/")}
                                        className="btn-primary"
                                    >
                                        Đến trang quản lý
                                    </button>
                                }
                            />
                        )}

                        {/* Error */}
                        {confirmStatus === "error" && (
                            <StatusBlock
                                icon={<IconError />}
                                iconBg="bg-red-500/10"
                                iconColor="text-red-400"
                                title="Xác nhận thất bại"
                                desc={confirmError ?? "Đã xảy ra lỗi. Lời mời có thể đã hết hạn hoặc đã được xác nhận trước đó."}
                                action={
                                    <button
                                        onClick={() => navigate("/")}
                                        className="btn-outline"
                                    >
                                        Về trang chủ
                                    </button>
                                }
                            />
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-slate-600 mt-6">
                    © {new Date().getFullYear()} AIPromo. Email tự động — vui lòng không trả lời.
                </p>
            </div>

            <style>{`
                .btn-primary {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px 28px;
                    background: linear-gradient(135deg, #7c3aed, #4f46e5);
                    color: white;
                    font-size: 14px;
                    font-weight: 700;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .btn-primary:hover { opacity: 0.85; }
                .btn-outline {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px 28px;
                    background: transparent;
                    color: #94a3b8;
                    font-size: 14px;
                    font-weight: 700;
                    border-radius: 12px;
                    border: 1px solid #334155;
                    cursor: pointer;
                    transition: border-color 0.2s, color 0.2s;
                }
                .btn-outline:hover { border-color: #7c3aed; color: #a78bfa; }
            `}</style>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBlock({
    icon,
    iconBg,
    iconColor,
    title,
    desc,
    action,
}: {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    title: string;
    desc: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="space-y-4">
            <div className={`w-16 h-16 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center mx-auto text-3xl`}>
                {icon}
            </div>
            <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                {desc && <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>}
            </div>
            {action && <div className="pt-2">{action}</div>}
        </div>
    );
}

function IconSuccess() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function IconError() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

function IconSpinner() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ animation: "spin 1s linear infinite" }}>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
    );
}