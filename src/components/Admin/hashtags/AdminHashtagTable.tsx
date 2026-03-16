import { MdFilterList, MdAdd, MdMoreVert } from "react-icons/md";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

interface HashtagItem {
    id: string;
    tag: string;
    usageCount: number;
}

const defaultHashtags: HashtagItem[] = [
    { id: "HT-001", tag: "#MusicFest", usageCount: 12450 },
    { id: "HT-002", tag: "#StartupTalks", usageCount: 8421 },
    { id: "HT-003", tag: "#RunForFun", usageCount: 3920 },
];

export default function AdminHashtagTable({ hashtags = defaultHashtags }: { hashtags?: HashtagItem[] }) {
    return (
        <div className={`${glassCard} rounded-xl overflow-hidden`}>
            <div className="px-8 py-6 border-b border-[#302447] flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-white">Quản lý Hashtags</h2>
                    <p className="text-[#a592c8] text-sm">Tạo, sửa, xóa và theo dõi hashtag sự kiện</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-[#302447] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors">
                        <MdFilterList className="text-base" /> Lọc
                    </button>
                    <button className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.4)]">
                        <MdAdd className="text-base" /> Thêm Hashtag
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] text-[#a592c8] uppercase tracking-widest font-bold">
                            <th className="px-8 py-4">Hashtag</th>
                            <th className="px-8 py-4">Lượt sử dụng</th>
                            <th className="px-8 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#302447]">
                        {hashtags.map((h) => (
                            <tr key={h.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{h.tag}</p>
                                            <p className="text-[10px] text-[#a592c8]">ID: {h.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-sm text-[#a592c8]">{h.usageCount.toLocaleString()}</td>
                                <td className="px-8 py-5 text-right">
                                    <button className="p-1.5 rounded-lg text-[#a592c8] hover:text-white hover:bg-white/5 transition-colors">
                                        <MdMoreVert className="text-lg" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-8 py-4 border-t border-[#302447] flex justify-between items-center bg-white/5">
                <p className="text-xs text-[#a592c8]">Hiển thị <span className="text-white font-bold">1-3</span> trên <span className="text-white font-bold">412</span> hashtag</p>
            </div>
        </div>
    );
}
