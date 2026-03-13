import {
    FiPlus,
    FiChevronDown,
    FiUser,
    FiArrowLeft,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
    title?: string;
    eventName?: string;
    canGoBack?: boolean;
    urlBack?: string;
    onBack?: () => void;
}

export default function Header({
    title,
    eventName,
    canGoBack = false,
    urlBack,
    onBack,
}: HeaderProps) {
    const navigate = useNavigate();
    const isEventHeader = !!eventName;

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (urlBack) {
            navigate(urlBack);
        } else {
            navigate(-1);
        }
    }

    return (
        <header className="sticky top-0 z-40 h-20 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-xl border-b border-white/10">
            <div className="h-full max-w-[1400px] flex items-center justify-between mx-auto px-8">
                {/* LEFT */}
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
                        {isEventHeader ? (
                            <h1 className="text-2xl font-bold text-white">
                                {eventName}
                            </h1>
                        ) : (
                            <h1 className="text-2xl font-bold text-white">
                                {title}
                            </h1>
                        )}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-6">
                    <button onClick={() => {
                        const current = window.location.pathname === "/organizer/create-event";
                        if (!current) {
                            navigate("/organizer/create-event");
                        }
                    }}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-primary/30">
                        <FiPlus />
                        Tạo sự kiện mới
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="text-right leading-tight">
                            <p className="text-sm font-semibold text-white">
                                Organizer
                            </p>
                            <p className="text-xs text-amethyst-smoke">
                                Tài khoản
                            </p>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-ebony flex items-center justify-center">
                            <FiUser className="text-amethyst-smoke" />
                        </div>

                        <FiChevronDown className="text-amethyst-smoke" />
                    </div>
                </div>
            </div>
        </header>
    );
}
