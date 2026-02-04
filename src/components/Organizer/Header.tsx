import {
    FiPlus,
    FiChevronDown,
    FiUser,
    FiCalendar,
} from "react-icons/fi";

interface HeaderProps {
    title?: string;
    eventName?: string;
    eventTime?: string;
}

export default function Header({
    title,
    eventName,
    eventTime,
}: HeaderProps) {
    const isEventHeader = !!eventName;

    return (
        <header
            className="
        sticky top-0 z-40
        h-20
        bg-gradient-to-b from-black/40 to-black/20
        backdrop-blur-xl
        border-b border-white/10
      "
        >
            <div className="h-full max-w-[1400px] flex items-center justify-between mx-auto px-8">
                {/* LEFT */}
                <div className="flex flex-col justify-center">
                    {isEventHeader ? (
                        <>
                            <h1 className="text-2xl font-bold text-white">
                                {eventName}
                            </h1>

                            {eventTime && (
                                <div className="flex items-center gap-2 text-sm text-amethyst-smoke mt-1">
                                    <FiCalendar size={14} />
                                    <span>{eventTime}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <h1 className="text-2xl font-bold text-white">
                            {title}
                        </h1>
                    )}
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-6">
                    <button
                        className="
              bg-primary hover:bg-primary/90
              text-white px-6 py-2.5 rounded-full
              font-semibold flex items-center gap-2
              shadow-lg shadow-primary/30
            "
                    >
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
