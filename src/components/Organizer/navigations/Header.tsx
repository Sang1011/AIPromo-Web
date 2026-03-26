import { useEffect } from "react";
import {
    FiPlus,
    FiChevronDown,
    FiUser,
    FiArrowLeft,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchEventById } from "../../../store/eventSlice";
import type { OrganizerProfile } from "../../../types/organizerProfile/organizerProfile";
import { fetchOrganizerProfile } from "../../../store/organizerProfileSlice";

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
    const isEventHeader = !!eventId;
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (urlBack) {
            navigate(urlBack);
        } else {
            navigate(-1);
        }
    };

    function getMissingFields(profile: OrganizerProfile | null): { fields: string[]; tab: "profile" | "bank" } {
        if (!profile) return { fields: ["displayName"], tab: "profile" };

        const missing: string[] = [];
        const isCompany = profile.businessType?.toLowerCase() === "company";

        if (!profile.displayName?.trim()) missing.push("displayName");
        if (!profile.identityNumber?.trim()) missing.push("identityNumber");
        if (isCompany) {
            if (!profile.companyName?.trim()) missing.push("companyName");
        }
        if (!profile.taxCode?.trim()) missing.push("taxCode");

        if (!profile.accountName?.trim()) missing.push("accountName");
        if (!profile.accountNumber?.trim()) missing.push("accountNumber");
        if (!profile.bankCode?.trim()) missing.push("bankCode");
        if (!profile.branch?.trim()) missing.push("branch");

        const profileFields = ["displayName", "identityNumber", "companyName", "taxCode"];
        const hasProfileError = missing.some((f) => profileFields.includes(f));
        const tab = hasProfileError ? "profile" : "bank";

        return { fields: missing, tab };
    }

    const handleLogout = () => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        localStorage.removeItem("DEVICE_ID");
        navigate("/login");
    }

    const handleCreateEvent = async () => {
        const current = window.location.pathname === "/organizer/create-event";
        if (current) return;

        const result = await dispatch(fetchOrganizerProfile());
        if (fetchOrganizerProfile.fulfilled.match(result)) {
            const profile = result.payload.data as OrganizerProfile;
            const { fields, tab } = getMissingFields(profile);

            if (fields.length > 0) {
                navigate("/organizer/accounts", {
                    state: { missingFields: fields, tab },
                });
                return;
            }
        }
        navigate("/organizer/create-event");
    };

    useEffect(() => {
        if (!eventId) return;
        dispatch(fetchEventById(eventId));
    }, [eventId, dispatch]);

    return (
        <header className="sticky top-0 z-40 h-20 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-xl border-b border-white/10">
            <div className="h-full flex items-center justify-between px-10">
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

                    <div className="flex flex-col justify-center">
                        <h1 className="text-2xl font-bold text-white max-w-[870px] truncate">
                            {haveTitle && isEventHeader
                                ? "Sự kiện " + currentEvent?.title || "Đang tải..."
                                : title}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={handleCreateEvent}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-primary/30"
                    >
                        <FiPlus />
                        Tạo sự kiện mới
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full border font-semibold border-white/10 text-amethyst-smoke hover:text-red-400 hover:border-red-400/40 hover:bg-white/5 transition"
                    >
                        <FiUser className="text-lg" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>
        </header>
    );
}