import {
    MdDns,
    MdPublic,
    MdPerson,
    MdVerifiedUser,
    MdSchedule,
} from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

export interface LogItem {
    time: string;
    level: "error" | "warn" | "info";
    module: string;
    message: string;
    source: string;
    icon: React.ComponentType<{ className?: string }>;
}

function getLevelBadge(level: string) {
    const config: Record<
        string,
        { bg: string; text: string; border: string }
    > = {
        error: {
            bg: "bg-red-500/10",
            text: "text-red-500",
            border: "border-red-500/20",
        },
        warn: {
            bg: "bg-amber-500/10",
            text: "text-amber-500",
            border: "border-amber-500/20",
        },
        info: {
            bg: "bg-primary/10",
            text: "text-primary",
            border: "border-primary/20",
        },
    };
    const c = config[level] || config.info;
    const labels: Record<string, string> = {
        error: "LỖI",
        warn: "CẢNH BÁO",
        info: "THÔNG TIN",
    };
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${c.bg} ${c.text} border ${c.border} uppercase`}
        >
            {labels[level]}
        </span>
    );
}

const defaultLogs: LogItem[] = [
    {
        time: "2024-05-24 14:22:05",
        level: "error",
        module: "Payment_Gateway",
        message:
            "GIAO DỊCH THẤT BẠI: Kết nối tới API VNPay bị vượt thời gian chờ (Endpoint: /v2/checkout)",
        source: "System_Worker_02",
        icon: MdDns,
    },
    {
        time: "2024-05-24 14:21:58",
        level: "warn",
        module: "Auth_Service",
        message:
            "NHIỀU_LẦN_ĐĂNG_NHẬP: IP 103.24.xx.xxx bị đánh dấu để giới hạn tần suất.",
        source: "External_IP",
        icon: MdPublic,
    },
    {
        time: "2024-05-24 14:20:12",
        level: "info",
        module: "Event_Engine",
        message:
            "DUYỆT_ĐƯỢC_CHẤP_NHẬN: 'Summer AI Fest 2024' đã vượt qua kiểm duyệt.",
        source: "Alex Rivera",
        icon: MdPerson,
    },
    {
        time: "2024-05-24 14:18:44",
        level: "info",
        module: "Config_Manager",
        message: "Cập nhật cấu trúc phí nền tảng toàn cục thành 5.0%",
        source: "Alex Rivera",
        icon: MdPerson,
    },
    {
        time: "2024-05-24 14:15:30",
        level: "error",
        module: "DB_Cluster_A",
        message:
            "GIỚI_HẠN_TÀI_NGUYÊN: Sử dụng bộ nhớ cơ sở dữ liệu vượt quá ngưỡng 90%.",
        source: "Infrastructure",
        icon: MdDns,
    },
    {
        time: "2024-05-24 14:12:01",
        level: "info",
        module: "User_Mgt",
        message: "Tài khoản Người tổ chức mới được tạo: tech_events_asia",
        source: "Registration_Flow",
        icon: MdPerson,
    },
    {
        time: "2024-05-24 14:10:45",
        level: "warn",
        module: "Security_Proxy",
        message:
            "CHỨNG_CHỈ_HẾT_HẠN: Chứng chỉ miền phụ hết hạn trong 7 ngày.",
        source: "Cert_Manager",
        icon: MdVerifiedUser,
    },
    {
        time: "2024-05-24 14:05:22",
        level: "info",
        module: "Finance_Api",
        message: "Báo cáo thanh toán hàng ngày đã được tạo thành công.",
        source: "Cron_Jobs",
        icon: MdSchedule,
    },
];

interface AdminLogsTableProps {
    logs?: LogItem[];
}

export default function AdminLogsTable({
    logs = defaultLogs,
}: AdminLogsTableProps) {
    return (
        <div className={`${glassCard} rounded-xl overflow-hidden shadow-2xl`}>
            <div className="bg-black/20 px-8 py-3 border-b border-[#302447] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    <span className="ml-4 text-[10px] font-mono font-bold text-[#a592c8] uppercase tracking-[0.2em]">
                        Terminal Interface v4.0.2
                    </span>
                </div>
                <div className="text-[10px] font-mono text-primary/60">
                    Session: 2024-05-24-AUDIT
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left font-mono border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-[10px] text-[#a592c8] uppercase tracking-widest font-bold">
                            <th className="px-8 py-4 border-b border-[#302447]">
                                Thời gian
                            </th>
                            <th className="px-8 py-4 border-b border-[#302447]">
                                Mức
                            </th>
                            <th className="px-8 py-4 border-b border-[#302447]">
                                Mô-đun
                            </th>
                            <th className="px-8 py-4 border-b border-[#302447]">
                                Mô tả hành động
                            </th>
                            <th className="px-8 py-4 border-b border-[#302447]">
                                Người dùng / Nguồn
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#302447]/50">
                        {logs.map((log, idx) => {
                            const LogIcon = log.icon;
                            return (
                            <tr
                                key={idx}
                                className="hover:bg-[rgba(124,59,237,0.05)] transition-colors"
                            >
                                <td className="px-8 py-4 text-xs text-[#a592c8]">
                                    {log.time}
                                </td>
                                <td className="px-8 py-4">
                                    {getLevelBadge(log.level)}
                                </td>
                                <td className="px-8 py-4 text-xs font-bold text-white">
                                    {log.module}
                                </td>
                                <td className="px-8 py-4 text-xs text-slate-300">
                                    {log.message}
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                                            <LogIcon className="text-[12px] text-slate-400" />
                                        </div>
                                        <span className="text-xs text-[#a592c8]">
                                            {log.source}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="px-8 py-4 bg-white/5 border-t border-[#302447] flex items-center justify-between">
                <div className="text-xs text-[#a592c8]">
                    Hiển thị{" "}
                    <span className="text-white font-bold">1-8</span> trên{" "}
                    <span className="text-white font-bold">1.284</span> sự kiện
                    hệ thống
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded bg-[#302447]/50 text-[#a592c8] hover:bg-[#302447] hover:text-white transition-colors disabled:opacity-30">
                        <FiChevronLeft className="text-sm" />
                    </button>
                    <div className="flex gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white text-[10px] font-bold">
                            1
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-[#a592c8] text-[10px] font-bold transition-colors">
                            2
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-[#a592c8] text-[10px] font-bold transition-colors">
                            3
                        </button>
                        <span className="text-[#a592c8] px-1">...</span>
                        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-[#a592c8] text-[10px] font-bold transition-colors">
                            161
                        </button>
                    </div>
                    <button className="p-1.5 rounded bg-[#302447]/50 text-[#a592c8] hover:bg-[#302447] hover:text-white transition-colors">
                        <FiChevronRight className="text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
}
