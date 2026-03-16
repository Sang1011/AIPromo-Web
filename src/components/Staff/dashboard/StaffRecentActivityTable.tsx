import { MdHistory, MdOpenInNew } from "react-icons/md";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.1)]";

export interface ActivityItem {
    name: string;
    action: string;
    staff: string;
    time: string;
    image: string;
}

const defaultActivities: ActivityItem[] = [
    {
        name: "Neon Beats 2024",
        action: "ĐÃ DUYỆT",
        staff: "Hoàng Nguyễn (Tôi)",
        time: "25/10/2023 - 14:30",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBco0PSJTR-Y5hUipOJ8oovqzN7Xs88EunB3xMtTVgVV_tRMNIctq7XsDpwznVLiJ70QYvB_Pw0LIHmWmlrekEohuAKvGXjBETRV-cr8nN8hrwwTViOXD7KC4D9vRJs6Zgi5l3mENEvrV1Tr7rBgsopOtVkK5IVisU0sDkIkvgZ8jN9NDqAaXUv5GHlz4lHjeNf6XoEBOg6qbCz_1mWiOqXpnLW_0UgctonU8bcRgmfSFb7EHoEncIVq5sqW-DQISZ1zqtln_CypOAy",
    },
    {
        name: "AI in Marketing",
        action: "ĐÃ DUYỆT",
        staff: "Hoàng Nguyễn (Tôi)",
        time: "25/10/2023 - 11:15",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDN3MtWCh8e7XxiJGeenCFBU45bR-0HZWb_2zDEj_4hxT3_SAJRLpvSjekLz7CbsABgikEIOhdQQSl67PgeWnkg1afypnUu9Yqjcd3C860ynkEwF4A89PYMEURlYKsRqtoOg6Wk5INUuplbRQM__SbGUtbi4kWZh-VWrXPiTGIGNgGtYQe6BXOaa6OjXzX0SYOUWqVSBhsS4uleFjcRfdTSTybUGg2a7xt1LwIBvW1l1xfvM-4d2Kq6LKSM-GTUJghmeVjhE5HWdaLA",
    },
    {
        name: "Digital Visions",
        action: "TỪ CHỐI",
        staff: "Hoàng Nguyễn (Tôi)",
        time: "24/10/2023 - 16:45",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD_wPDTbmgMlqsMJ9QYH-wVNwdTxL2Kr4YUlknEgJKCVtzWrKgJNS9_RfzUYhRe0eOmLejHdudLV9kunOh2nd8ilHlzz3tlTY6CC7zmURvKYgypMaSJykVYaBmNtEITbrGpeonDM9aJJ2W9HPKmMlZJE3FVF9mOKbbHy3aerqZ4L9OFZzZVBrJFIl_mNRKBNnC4a1c419PlVk452RihOmhiztP_yhd9KAzmHnSNbiLLJwRgpMePpmy0ZCLF4Ixfed0TfsgW8tRpTf88",
    },
    {
        name: "Blockchain Summit 2024",
        action: "ĐÃ DUYỆT",
        staff: "Hoàng Nguyễn (Tôi)",
        time: "24/10/2023 - 09:20",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAxgg5QvxNKCLbbRpgn5ayP4tjcpbj54itKvS45WpQgN9yNumYsfJbsGVJwO66hy4u_PSQkXvDZfyxSvz2fbfSFi7LLdQ4MBGJ19XYmNARW87ST6Fhw5xIIcBxO-i9mqeV3Bse3n1ZYxEHUHaG5emj0sexSHb69b8I_N1BnO9wgGmn4kmweV3v-hKLo-Vs6jPM2q83xNchrDo5WH-Q2IXALw2Dy8QxmpOUH_0eT59OJwkhyYqR9zvOByflFaVkGRIttZP4UYgYiSNqo",
    },
];

interface StaffRecentActivityTableProps {
    activities?: ActivityItem[];
}

export default function StaffRecentActivityTable({
    activities = defaultActivities,
}: StaffRecentActivityTableProps) {
    return (
        <div className={`${glassCard} rounded-xl overflow-hidden`}>
            <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-primary/5">
                <div className="flex items-center gap-3">
                    <MdHistory className="text-primary" size={24} />
                    <h5 className="font-bold text-sm uppercase tracking-wider">
                        Hoạt động gần đây
                    </h5>
                </div>
                <button className="text-xs text-primary hover:underline font-bold">
                    Xem tất cả
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-primary/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <th className="px-6 py-4">TÊN SỰ KIỆN</th>
                            <th className="px-6 py-4">HÀNH ĐỘNG</th>
                            <th className="px-6 py-4">NHÂN VIÊN</th>
                            <th className="px-6 py-4">THỜI GIAN</th>
                            <th className="px-6 py-4 text-right">CHI TIẾT</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                        {activities.map((activity) => (
                            <tr
                                key={activity.name}
                                className="hover:bg-primary/5 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="size-8 rounded bg-cover bg-center"
                                            style={{
                                                backgroundImage: `url('${activity.image}')`,
                                            }}
                                        />
                                        <span className="font-semibold text-sm">
                                            {activity.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                            activity.action === "ĐÃ DUYỆT"
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                        }`}
                                    >
                                        {activity.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                                            HN
                                        </div>
                                        <span className="text-sm text-slate-400">
                                            {activity.staff}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {activity.time}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-primary/20 rounded-lg text-slate-400 transition-colors">
                                        <MdOpenInNew className="text-sm" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
