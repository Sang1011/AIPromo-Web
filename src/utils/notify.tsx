import { toast } from "react-hot-toast";
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiXCircle } from "react-icons/fi";

const getStyleByType = (type: "success" | "error" | "warning" | "info") => {
    switch (type) {
        case "error":
            return {
                background: "#2a0f14",
                border: "1px solid rgba(255, 0, 0, 0.3)",
            };
        case "success":
            return {
                background: "#0f2a1a",
                border: "1px solid rgba(0, 255, 150, 0.2)",
            };
        case "warning":
            return {
                background: "#2a220f",
                border: "1px solid rgba(255, 200, 0, 0.3)",
            };
        default:
            return {
                background: "#140f2a",
                border: "1px solid rgba(255,255,255,0.1)",
            };
    }
};
const renderToast = (
    message: string,
    icon: React.ReactNode,
    type: "success" | "error" | "warning" | "info"
) => {
    const style = getStyleByType(type);

    return toast.custom((t) => (
        <div
            className={`
                    group
                    flex items-center justify-between gap-4 px-4 py-3 rounded-lg
                    shadow-lg backdrop-blur-md
                    transition-all duration-300 ease-out
                    ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
                    
                    hover:scale-[1.04]
                    hover:shadow-2xl
                    hover:-translate-y-1
                    hover:ring-1 hover:ring-white/20
                `}
            style={{
                ...style,
                color: "#fff",
                minWidth: "340px",
                maxWidth: "520px",
            }}
        >
            <div className="flex items-start gap-3 w-full">
                <div className="shrink-0 mt-1">
                    {icon}
                </div>

                <span className="flex-1 leading-relaxed">
                    {message}
                </span>
            </div>

            <button
                onClick={() => toast.dismiss(t.id)}
                className="text-white/60 hover:text-white text-lg"
            >
                ✕
            </button>
        </div>
    ), {
        duration: 4000,
    });
};

export const notify = {
    success: (message: string) => {
        renderToast(message, <FiCheckCircle className="text-green-400 w-15 h-15" />, "success");
    },

    error: (message: string) => {
        renderToast(message, <FiXCircle className="text-red-400 w-15 h-15" />, "error");
    },

    warning: (message: string) => {
        renderToast(message, <FiAlertTriangle className="text-yellow-400 w-15 h-15" />, "warning");
    },

    info: (message: string) => {
        renderToast(message, <FiInfo className="text-blue-400 w-15 h-15" />, "info");
    },
};