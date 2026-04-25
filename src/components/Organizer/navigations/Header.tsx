import { useEffect, useState } from "react";
import { FiArrowLeft, FiPlus, FiUser, FiAlertTriangle } from "react-icons/fi";
import { Crown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchEventById } from "../../../store/eventSlice";
import type { OrganizerProfileDetail } from "../../../types/organizerProfile/organizerProfile";
import { fetchMe } from "../../../store/authSlice";
import { fetchGetOrganizerProfileDetailById } from "../../../store/organizerProfileSlice";
import { fetchRequestCancelEvent } from "../../../store/eventSlice";
import type { MeInfo } from "../../../types/auth/auth";
import type { ApiResponse } from "../../../types/api";
import { notify } from "../../../utils/notify";

interface HeaderProps {
    title?: string;
    canGoBack?: boolean;
    haveTitle?: boolean;
    urlBack?: string;
    onBack?: () => void;
}

export default function Header({
    title,
    canGoBack = false,
    haveTitle = false,
    urlBack,
    onBack,
}: HeaderProps) {
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentEvent } = useSelector((state: RootState) => state.EVENT);
    const { currentInfor } = useSelector((state: RootState) => state.AUTH);

    const isEventHeader = !!eventId;

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MAX_REASON = 500;

    // Resolve role từ currentInfor
    const roles: string[] = (currentInfor as any)?.roles ?? [];
    const isOrganizer = roles.includes("Organizer");

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (urlBack) {
            navigate(urlBack);
        } else {
            navigate(-1);
        }
    };

    function getMissingFields(profile: OrganizerProfileDetail | null): {
        fields: string[];
        tab: "profileDetail" | "bank";
    } {
        if (!profile) return { fields: ["displayName"], tab: "profileDetail" };

        const missing: string[] = [];
        const isCompany = profile.businessType?.toLowerCase() === "company";

        if (!profile.displayName?.trim()) missing.push("displayName");
        if (!profile.identityNumber?.trim()) missing.push("identityNumber");
        if (isCompany && !profile.companyName?.trim()) missing.push("companyName");
        if (!profile.taxCode?.trim()) missing.push("taxCode");
        if (!profile.accountName?.trim()) missing.push("accountName");
        if (!profile.accountNumber?.trim()) missing.push("accountNumber");
        if (!profile.bankCode?.trim()) missing.push("bankCode");
        if (!profile.branch?.trim()) missing.push("branch");

        const profileFields = ["displayName", "identityNumber", "companyName", "taxCode"];
        const hasProfileError = missing.some((f) => profileFields.includes(f));
        const tab = hasProfileError ? "profileDetail" : "bank";

        return { fields: missing, tab };
    }

    const handleLogout = () => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        localStorage.removeItem("DEVICE_ID");
        navigate("/login");
    };

    const handleCreateEvent = async () => {
        const current = window.location.pathname === "/organizer/create-event";
        if (current) return;

        let userId: string | undefined;

        const infor = currentInfor as ApiResponse<MeInfo>["data"] | Record<string, never>;

        if (infor && "userId" in infor && infor.userId) {
            userId = infor.userId;
        } else {
            const meResult = await dispatch(fetchMe());
            if (!fetchMe.fulfilled.match(meResult)) return;
            userId = (meResult.payload as ApiResponse<MeInfo>)?.data?.userId;
        }

        if (!userId) return;

        const detailResult = await dispatch(fetchGetOrganizerProfileDetailById(userId));
        if (!fetchGetOrganizerProfileDetailById.fulfilled.match(detailResult)) return;

        const profile = (detailResult.payload as ApiResponse<OrganizerProfileDetail>)?.data;
        const { fields, tab } = getMissingFields(profile);

        if (fields.length > 0) {
            navigate("/organizer/accounts", {
                state: { missingFields: fields, tab },
            });
            return;
        }

        navigate("/organizer/create-event");
    };
    const handleCancelEvent = async () => {
        if (!eventId || !cancelReason.trim()) return;

        setIsSubmitting(true);
        const result = await dispatch(
            fetchRequestCancelEvent({ eventId, reason: cancelReason.trim() })
        );
        setIsSubmitting(false);

        if (fetchRequestCancelEvent.fulfilled.match(result)) {
            notify.success("Yêu cầu huỷ sự kiện thành công");
            setShowCancelModal(false);
            setCancelReason("");
        } else {
            notify.error("Huỷ thất bại");
        }
    };

    const handleCloseModal = () => {
        setShowCancelModal(false);
        setCancelReason("");
    };

    useEffect(() => {
        if (!eventId) return;
        dispatch(fetchEventById(eventId));
    }, [eventId, dispatch]);

    useEffect(() => {
        if (!(currentInfor as MeInfo)?.userId) {
            dispatch(fetchMe());
        }
    }, []);

    return (
        <>
            <header className="sticky top-0 z-40 h-20 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-xl border-b border-white/10">
                <div className="h-full flex items-center justify-between px-10">
                    {/* Left */}
                    <div className="flex items-center gap-4">
                        {canGoBack && (
                            <button
                                onClick={handleBack}
                                className="p-2 rounded-full hover:bg-white/10 transition flex items-center font-semibold gap-1 text-sm text-white"
                            >
                                <FiArrowLeft className="text-white text-lg" />
                                <span>Trở về</span>
                            </button>
                        )}
                        <div className="group relative flex flex-col justify-center">
                            <h1 className="text-2xl font-bold text-white max-w-[600px] truncate">
                                {haveTitle && isEventHeader
                                    ? (currentEvent?.title ?? "Đang tải...")
                                    : title}
                            </h1>

                            <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-black text-white text-sm px-2 py-1 rounded whitespace-nowrap z-50">
                                {haveTitle && isEventHeader
                                    ? (currentEvent?.title ?? "")
                                    : title}
                            </div>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        {/* Huỷ sự kiện — chỉ Organizer */}
                        {isOrganizer &&
                            isEventHeader &&
                            currentEvent &&
                            (currentEvent.status === "Published" || currentEvent.status === "Suspended") && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="px-5 py-2.5 rounded-full font-semibold border border-red-400/30 text-red-400 hover:bg-red-500/10 transition text-sm"
                                >
                                    Huỷ sự kiện
                                </button>
                            )}

                        {/* Tạo sự kiện — chỉ Organizer */}
                        {isOrganizer && (
                            <button
                                onClick={handleCreateEvent}
                                className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-primary/30 text-sm transition"
                            >
                                <FiPlus />
                                Tạo sự kiện mới
                            </button>
                        )}

                        {/* Subscription — chỉ Organizer */}
                        {isOrganizer && (
                            <button
                                onClick={() => navigate("/organizer/subscription")}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border border-amber-400/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition"
                            >
                                <Crown size={15} strokeWidth={2} />
                                AI Packages
                            </button>
                        )}

                        {/* Logout — luôn show */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border font-semibold border-white/10 text-amethyst-smoke hover:text-red-400 hover:border-red-400/40 hover:bg-white/5 transition text-sm"
                        >
                            <FiUser className="text-lg" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Cancel Modal — chỉ render khi là Organizer */}
            {isOrganizer && showCancelModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
                >
                    <div className="bg-[#18122B] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                                <FiAlertTriangle className="text-red-400 text-lg" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white mb-1">Huỷ sự kiện</h2>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Hành động này sẽ gửi yêu cầu huỷ đến staff. Vui lòng cung cấp lý do rõ ràng.
                                </p>
                            </div>
                        </div>

                        {/* Textarea */}
                        <div className="mb-4">
                            <label className="block text-sm text-slate-400 mb-2">
                                Lý do huỷ <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value.slice(0, MAX_REASON))}
                                placeholder="Ví dụ: Ban tổ chức không thể chuẩn bị kịp do điều kiện khách quan..."
                                rows={4}
                                className="w-full resize-none text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-red-500/50 transition"
                            />
                            <div className="flex justify-between mt-1.5">
                                <span className={`text-xs transition ${cancelReason.trim().length === 0 ? "text-red-400" : "text-transparent"}`}>
                                    Vui lòng nhập lý do huỷ
                                </span>
                                <span className="text-xs text-slate-500">{cancelReason.length} / {MAX_REASON}</span>
                            </div>
                        </div>

                        {/* Warning note */}
                        <div className="flex items-start gap-2 bg-red-500/[0.06] border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                            <svg className="mt-0.5 shrink-0 text-red-400" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                                <path d="M7 4.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                <circle cx="7" cy="9.5" r="0.6" fill="currentColor" />
                            </svg>
                            <p className="text-xs text-red-300/75 leading-relaxed">
                                Sau khi gửi, sự kiện sẽ chuyển sang trạng thái{" "}
                                <span className="font-semibold text-red-400">Chờ huỷ</span> và không thể chỉnh sửa cho đến khi staff xử lý.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-slate-400 hover:bg-white/5 transition"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleCancelEvent}
                                disabled={!cancelReason.trim() || isSubmitting}
                                className="flex-[2] px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-400/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu huỷ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}