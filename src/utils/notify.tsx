import { toast } from "react-hot-toast";
import { FiAlertTriangle, FiInfo } from "react-icons/fi";

export const notify = {
    success: (message: string) => {
        toast.success(message);
    },

    error: (message: string) => {
        toast.error(message);
    },

    warning: (message: string) => {
        toast(message, {
            icon: <FiAlertTriangle className="text-yellow-400 w-5 h-5" />,
        });
    },

    info: (message: string) => {
        toast(message, {
            icon: <FiInfo className="text-blue-400 w-5 h-5" />,
        });
    },
};