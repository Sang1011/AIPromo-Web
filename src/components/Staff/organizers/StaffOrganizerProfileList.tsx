import { MdCalendarToday, MdPendingActions, MdHourglassEmpty } from "react-icons/md";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.1)]";

export interface PendingOrganizerItem {
    name: string;
    date: string;
    image: string;
}

const defaultOrganizers: PendingOrganizerItem[] = [
    {
        name: "Future Tech Media",
        date: "26/10/2023",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBco0PSJTR-Y5hUipOJ8oovqzN7Xs88EunB3xMtTVgVV_tRMNIctq7XsDpwznVLiJ70QYvB_Pw0LIHmWmlrekEohuAKvGXjBETRV-cr8nN8hrwwTViOXD7KC4D9vRJs6Zgi5l3mENEvrV1Tr7rBgsopOtVkK5IVisU0sDkIkvgZ8jN9NDqAaXUv5GHlz4lHjeNf6XoEBOg6qbCz_1mWiOqXpnLW_0UgctonU8bcRgmfSFb7EHoEncIVq5sqW-DQISZ1zqtln_CypOAy",
    },
    {
        name: "Saigon Art Collective",
        date: "25/10/2023",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDN3MtWCh8e7XxiJGeenCFBU45bR-0HZWb_2zDEj_4hxT3_SAJRLpvSjekLz7CbsABgikEIOhdQQSl67PgeWnkg1afypnUu9Yqjcd3C860ynkEwF4A89PYMEURlYKsRqtoOg6Wk5INUuplbRQM__SbGUtbi4kWZh-VWrXPiTGIGNgGtYQe6BXOaa6OjXzX0SYOUWqVSBhsS4uleFjcRfdTSTybUGg2a7xt1LwIBvW1l1xfvM-4d2Kq6LKSM-GTUJghmeVjhE5HWdaLA",
    },
    {
        name: "Global Education Hub",
        date: "24/10/2023",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD_wPDTbmgMlqsMJ9QYH-wVNwdTxL2Kr4YUlknEgJKCVtzWrKgJNS9_RfzUYhRe0eOmLejHdudLV9kunOh2nd8ilHlzz3tlTY6CC7zmURvKYgypMaSJykVYaBmNtEITbrGpeonDM9aJJ2W9HPKmMlZJE3FVF9mOKbbHy3aerqZ4L9OFZzZVBrJFIl_mNRKBNnC4a1c419PlVk452RihOmhiztP_yhd9KAzmHnSNbiLLJwRgpMePpmy0ZCLF4Ixfed0TfsgW8tRpTf88",
    },
    {
        name: "Green Planet Events",
        date: "24/10/2023",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAxgg5QvxNKCLbbRpgn5ayP4tjcpbj54itKvS45WpQgN9yNumYsfJbsGVJwO66hy4u_PSQkXvDZfyxSvz2fbfSFi7LLdQ4MBGJ19XYmNARW87ST6Fhw5xIIcBxO-i9mqeV3Bse3n1ZYxEHUHaG5emj0sexSHb69b8I_N1BnO9wgGmn4kmweV3v-hKLo-Vs6jPM2q83xNchrDo5WH-Q2IXALw2Dy8QxmpOUH_0eT59OJwkhyYqR9zvOByflFaVkGRIttZP4UYgYiSNqo",
    },
];

interface StaffOrganizerProfileListProps {
    organizers?: PendingOrganizerItem[];
}

export default function StaffOrganizerProfileList({
    organizers = defaultOrganizers,
}: StaffOrganizerProfileListProps) {
    return (
        <div className="space-y-4">
            <h5 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <MdPendingActions className="text-sm" /> Danh sách chờ phê duyệt
            </h5>

            {organizers.map((org) => (
                <div
                    key={org.name}
                    className={`${glassCard} p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/30 transition-all group`}
                >
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="relative">
                            <img
                                alt="Organizer avatar"
                                className="size-16 rounded-2xl object-cover border-2 border-primary/20"
                                src={org.image}
                            />
                            <div className="absolute -bottom-1 -right-1 size-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-[#18122B]">
                                <MdHourglassEmpty className="text-[10px] text-white font-bold" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-lg font-bold group-hover:text-primary transition-colors">
                                {org.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <MdCalendarToday className="text-sm" />{" "}
                                    {org.date}
                                </span>
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold uppercase tracking-wide border border-amber-500/20">
                                    Chờ xác minh ID
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-primary/20 hover:bg-primary/5 text-sm font-bold transition-all">
                            Xem hồ sơ
                        </button>
                        <button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all">
                            Phê duyệt nhanh
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
