import {
    MdCheckCircle,
    MdCancel,
    MdVisibility,
    MdEdit,
    MdAnalytics,
} from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

export interface EventItem {
    id: string;
    name: string;
    date: string;
    organizer: string;
    category: string;
    status: "pending" | "live" | "ended";
    image: string;
}

function getStatusBadge(status: string) {
    const config: Record<
        string,
        { bg: string; text: string; dot: string }
    > = {
        pending: {
            bg: "bg-amber-500/10",
            text: "text-amber-400",
            dot: "bg-amber-400",
        },
        live: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-400",
            dot: "bg-emerald-400",
        },
        ended: {
            bg: "bg-slate-500/10",
            text: "text-slate-400",
            dot: "bg-slate-400",
        },
    };
    const c = config[status] || config.pending;
    const labels: Record<string, string> = {
        pending: "Chờ duyệt",
        live: "Đang diễn ra",
        ended: "Ended",
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {labels[status]}
        </span>
    );
}

const defaultEvents: EventItem[] = [
    {
        id: "#EVT-8821",
        name: "Neon Summer Festival",
        date: "15 Tháng 7, 2024",
        organizer: "Quantum Events Ltd.",
        category: "Music",
        status: "pending",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBPpgJwx9-_D61wkKl3dsOf4eMniUmgnBLVY99tXLkB-WcVAu7fGHNh6yHSQcO3sV4tuSqNy43Sr2LpdM2fsP5EO8QMpNfVZhFmQfOPPXdQtMg6IKEGbCFQ6uXZ7r-ixv3xX6XGhOy1EAHwxQtcffVuyp8bE9WJxpeuHcpBJD0Fk1V3iCRX-gNU7yCeFpFr-UVYH9ElbaH44U67eQjXnZFJowRgzUlk6OcnsKjvUPAT5vJrp8CK6XQUgyxiUSSeJi36Cmfx-8YBhTM2",
    },
    {
        id: "#EVT-8819",
        name: "Tech Summit 2024",
        date: "Ngày mai, 09:00",
        organizer: "Innovation Hub",
        category: "Conference",
        status: "live",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDLd3Lrptc5vsqrxnxIszULo1pCpyIuJvmB5_sElcHxmPKpxhwCdWZNJ0SWAqpXooXaIVGBJ_t-AuMn4ClE7mOtkTpS_8K45zkRtIVFe1YWowMqvfFy2Vd9LW8t3oP7NgCuJ117FLoJ21WRrJ9ZW4PQmLokOi3CoR-t4u9E-bZrPZfTv3wKbqkGX74QdQApamCJ36JNVgWeCP-Cz22J0jBtyzuj3gT9t0TLYGfX8qBUczpy8ceuqLCPqfvObwJMtLRlGHzn06opT2TB",
    },
    {
        id: "#EVT-8790",
        name: "Digital Art Expo",
        date: "Kết thúc 2 ngày trước",
        organizer: "Urban Creatives",
        category: "Workshop",
        status: "ended",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBwULc5HdQIH2uuQr7i9dr1Oy5ZnO-py4nGHJYnI14gelm8hRIvlOQO44Oj6MYyXMh_WuRoajJfp0ztlRX-sDfIGc2PV5XnUoMz51FdEzgz-MnCvyLLNJkGM4M_RSGj-LWzeXOxfPcstn6CE3FLgewdbYhpV58jWiKMzTQHLfyc6Cath-TyvKe9g3c5XZK85N3us5jJTo9V-WHV8zoLBqt92afrSojGqh8yIcR2ufmv5G4aCRyvD5veS_Ejrj1dytd5SwdzwasaIlxD",
    },
    {
        id: "#EVT-8785",
        name: "Gourmet Food Tour",
        date: "Đang tiến hành",
        organizer: "City Flavors Co.",
        category: "Food & Drink",
        status: "live",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD9irLgmMhxd6f3j25fVXJck-IOqBCeQ3iy2GWgfqENZsArdhDSBErV1la_mITMsuVfHLbB44zkjSSoFgHqcC8UjsML4ddQemZjbJeIy0qMRtlfB2uM1yHfc97Ii094sYRCZfS1OaELqauTN5vvPwVKPQDpde-p69IVYC2niqJ07st1R9BGT1-CliJS35aHxNmR0ziqtwIXKiqUu8FbwZEes5Gfxtov6knd1j2PUdr-mhpzYD5vx7gIyDbrO42J30rRi9hCM7PG1dJo",
    },
];

interface AdminEventModerationTableProps {
    events?: EventItem[];
}

export default function AdminEventModerationTable({
    events = defaultEvents,
}: AdminEventModerationTableProps) {
    return (
        <div className={`${glassCard} rounded-xl overflow-hidden`}>
            <div className="px-8 py-6 border-b border-[#302447] flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        Duyệt Sự kiện
                    </h2>
                    <p className="text-[#a592c8] text-sm">
                        Xem xét, phê duyệt và quản lý danh sách sự kiện trên nền
                        tảng
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-[#302447] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#3d2f5a] transition-colors border border-[#302447]">
                        Lọc
                    </button>
                    <button className="bg-primary text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.4)]">
                        Tạo mới
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] text-[#a592c8] uppercase tracking-widest font-bold">
                            <th className="px-8 py-4">Mã sự kiện</th>
                            <th className="px-8 py-4">Tên sự kiện</th>
                            <th className="px-8 py-4">Người tổ chức</th>
                            <th className="px-8 py-4">Thể loại</th>
                            <th className="px-8 py-4">Trạng thái</th>
                            <th className="px-8 py-4 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#302447]">
                        {events.map((evt) => (
                            <tr
                                key={evt.id}
                                className="hover:bg-white/5 transition-colors"
                            >
                                <td className="px-8 py-5 text-sm font-medium text-[#a592c8]">
                                    {evt.id}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 border border-[#302447]"
                                            style={{
                                                backgroundImage: `url('${evt.image}')`,
                                            }}
                                        />
                                        <div>
                                            <span className="text-sm font-semibold text-white block">
                                                {evt.name}
                                            </span>
                                            <span className="text-[10px] text-[#a592c8]">
                                                {evt.date}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-sm text-white">
                                    {evt.organizer}
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#302447] text-[#a592c8] uppercase">
                                        {evt.category}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    {getStatusBadge(evt.status)}
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <div className="flex justify-center gap-2">
                                        {evt.status === "pending" && (
                                            <>
                                                <button
                                                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                                    title="Phê duyệt"
                                                >
                                                    <MdCheckCircle className="text-lg" />
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                    title="Từ chối"
                                                >
                                                    <MdCancel className="text-lg" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            className="p-2 rounded-lg bg-[#302447] text-[#a592c8] hover:text-white transition-colors"
                                            title="Chi tiết"
                                        >
                                            <MdVisibility className="text-lg" />
                                        </button>
                                        {(evt.status === "live" ||
                                            evt.status === "ended") && (
                                            <>
                                                {evt.status === "live" && (
                                                    <button
                                                        className="p-2 rounded-lg bg-[#302447] text-[#a592c8] hover:text-white transition-colors"
                                                        title="Quản lý"
                                                    >
                                                        <MdEdit className="text-lg" />
                                                    </button>
                                                )}
                                                {evt.status === "ended" && (
                                                    <button
                                                        className="p-2 rounded-lg bg-[#302447] text-[#a592c8] hover:text-white transition-colors"
                                                        title="Reports"
                                                    >
                                                        <MdAnalytics className="text-lg" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-8 py-4 border-t border-[#302447] flex items-center justify-between">
                <p className="text-[10px] text-[#a592c8] font-bold uppercase tracking-widest">
                    Hiển thị 4 trên 1.482 sự kiện
                </p>
                <div className="flex gap-2">
                    <button className="p-1.5 rounded-md bg-[#302447] text-[#a592c8] hover:text-white transition-colors">
                        <FiChevronLeft className="text-sm" />
                    </button>
                    <button className="p-1.5 rounded-md bg-primary text-white shadow-[0_0_15px_rgba(124,59,237,0.4)]">
                        <span className="text-xs font-bold px-1">1</span>
                    </button>
                    <button className="p-1.5 rounded-md bg-[#302447] text-[#a592c8] hover:text-white transition-colors">
                        <span className="text-xs font-bold px-1">2</span>
                    </button>
                    <button className="p-1.5 rounded-md bg-[#302447] text-[#a592c8] hover:text-white transition-colors">
                        <FiChevronRight className="text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
}
