import { MdVerifiedUser } from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const glassCard =
    "bg-[rgba(24,18,43,0.6)] backdrop-blur-[16px] border border-[rgba(124,64,237,0.15)]";
const neonGlow =
    "shadow-[0_0_15px_rgba(124,64,237,0.4),0_0_5px_rgba(124,64,237,0.2)]";

export interface PendingEventItem {
    name: string;
    organizer: string;
    date: string;
    category: string;
    image: string;
}

const categoryColors: Record<string, string> = {
    Music: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    Tech: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Art: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    Finance: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

const defaultEvents: PendingEventItem[] = [
    {
        name: "Neon Beats 2024",
        organizer: "Cyber Agency",
        date: "25 Th10, 2023",
        category: "Music",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBco0PSJTR-Y5hUipOJ8oovqzN7Xs88EunB3xMtTVgVV_tRMNIctq7XsDpwznVLiJ70QYvB_Pw0LIHmWmlrekEohuAKvGXjBETRV-cr8nN8hrwwTViOXD7KC4D9vRJs6Zgi5l3mENEvrV1Tr7rBgsopOtVkK5IVisU0sDkIkvgZ8jN9NDqAaXUv5GHlz4lHjeNf6XoEBOg6qbCz_1mWiOqXpnLW_0UgctonU8bcRgmfSFb7EHoEncIVq5sqW-DQISZ1zqtln_CypOAy",
    },
    {
        name: "AI in Marketing",
        organizer: "Future Systems",
        date: "24 Th10, 2023",
        category: "Tech",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDN3MtWCh8e7XxiJGeenCFBU45bR-0HZWb_2zDEj_4hxT3_SAJRLpvSjekLz7CbsABgikEIOhdQQSl67PgeWnkg1afypnUu9Yqjcd3C860ynkEwF4A89PYMEURlYKsRqtoOg6Wk5INUuplbRQM__SbGUtbi4kWZh-VWrXPiTGIGNgGtYQe6BXOaa6OjXzX0SYOUWqVSBhsS4uleFjcRfdTSTybUGg2a7xt1LwIBvW1l1xfvM-4d2Kq6LKSM-GTUJghmeVjhE5HWdaLA",
    },
    {
        name: "Digital Visions",
        organizer: "Creative Hub",
        date: "24 Th10, 2023",
        category: "Art",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD_wPDTbmgMlqsMJ9QYH-wVNwdTxL2Kr4YUlknEgJKCVtzWrKgJNS9_RfzUYhRe0eOmLejHdudLV9kunOh2nd8ilHlzz3tlTY6CC7zmURvKYgypMaSJykVYaBmNtEITbrGpeonDM9aJJ2W9HPKmMlZJE3FVF9mOKbbHy3aerqZ4L9OFZzZVBrJFIl_mNRKBNnC4a1c419PlVk452RihOmhiztP_yhd9KAzmHnSNbiLLJwRgpMePpmy0ZCLF4Ixfed0TfsgW8tRpTf88",
    },
    {
        name: "Blockchain Summit 2024",
        organizer: "Web3 Collective",
        date: "23 Th10, 2023",
        category: "Finance",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAxgg5QvxNKCLbbRpgn5ayP4tjcpbj54itKvS45WpQgN9yNumYsfJbsGVJwO66hy4u_PSQkXvDZfyxSvz2fbfSFi7LLdQ4MBGJ19XYmNARW87ST6Fhw5xIIcBxO-i9mqeV3Bse3n1ZYxEHUHaG5emj0sexSHb69b8I_N1BnO9wgGmn4kmweV3v-hKLo-Vs6jPM2q83xNchrDo5WH-Q2IXALw2Dy8QxmpOUH_0eT59OJwkhyYqR9zvOByflFaVkGRIttZP4UYgYiSNqo",
    },
];

interface StaffEventApprovalQueueProps {
    events?: PendingEventItem[];
}

export default function StaffEventApprovalQueue({
    events = defaultEvents,
}: StaffEventApprovalQueueProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-6">
                    <h5 className="text-xl font-bold text-white tracking-tight">
                        Hàng chờ hoạt động
                    </h5>
                    <div className="flex gap-2">
                        <button className="px-4 py-1.5 bg-primary text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-lg shadow-primary/30">
                            TẤT CẢ
                        </button>
                        <button className="px-4 py-1.5 bg-white/5 text-slate-400 text-[11px] font-bold rounded-full uppercase tracking-wider hover:bg-white/10">
                            ƯU TIÊN
                        </button>
                    </div>
                </div>
                <div className="text-slate-500 text-sm font-medium">
                    Đang hiển thị <span className="text-white">12</span> trên 24
                    sự kiện chờ duyệt
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                <div className="col-span-5">CHI TIẾT SỰ KIỆN</div>
                <div className="col-span-2">NGÀY ĐĂNG KÝ</div>
                <div className="col-span-2">DANH MỤC</div>
                <div className="col-span-1">TRẠNG THÁI</div>
                <div className="col-span-2 text-right">THAO TÁC</div>
            </div>

            {events.map((evt) => (
                <div
                    key={evt.name}
                    className={`grid grid-cols-12 items-center gap-4 p-5 ${glassCard} rounded-2xl border border-white/5 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_10px_30px_-10px_rgba(124,64,237,0.3)] transition-all`}
                >
                    <div className="col-span-5 flex items-center gap-5">
                        <div className="size-16 rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-2xl">
                            <img
                                src={evt.image}
                                alt={evt.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-lg font-bold text-white truncate mb-1">
                                {evt.name}
                            </span>
                            <div className="flex items-center gap-2">
                                <MdVerifiedUser className="text-xs text-primary" />
                                <span className="text-xs font-semibold text-slate-400 truncate uppercase tracking-wider">
                                    {evt.organizer}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <span className="text-sm font-semibold text-slate-300">
                            {evt.date}
                        </span>
                    </div>
                    <div className="col-span-2">
                        <span
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                categoryColors[evt.category] ||
                                "bg-primary/10 text-primary border-primary/30"
                            }`}
                        >
                            {evt.category}
                        </span>
                    </div>
                    <div className="col-span-1">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(255,170,0,0.6)]" />
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                                CHỜ DUYỆT
                            </span>
                        </div>
                    </div>
                    <div className="col-span-2 flex justify-end gap-3">
                        <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                            Chi tiết
                        </button>
                        <button
                            className={`px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl ${neonGlow} hover:brightness-110 transition-all`}
                        >
                            Phê duyệt nhanh
                        </button>
                    </div>
                </div>
            ))}

            <div className="mt-10 flex items-center justify-center gap-4 pb-10">
                <button className="size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-all">
                    <FiChevronLeft />
                </button>
                <div className="flex gap-2">
                    <button className="size-10 flex items-center justify-center rounded-xl bg-primary text-white font-bold">
                        1
                    </button>
                    <button className="size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-all font-bold">
                        2
                    </button>
                    <button className="size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-all font-bold">
                        3
                    </button>
                </div>
                <button className="size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-all">
                    <FiChevronRight />
                </button>
            </div>
        </div>
    );
}
