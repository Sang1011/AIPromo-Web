import { MdFilterList, MdAdd, MdMoreVert } from "react-icons/md";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

interface CategoryItem {
    id: string;
    name: string;
    eventsCount: number;
}

const defaultCategories: CategoryItem[] = [
    { id: "CAT-001", name: "Âm nhạc", eventsCount: 342 },
    { id: "CAT-002", name: "Thể thao", eventsCount: 128 },
    { id: "CAT-003", name: "Hội thảo", eventsCount: 76 },
];

export default function AdminCategoryTable({ categories = defaultCategories }: { categories?: CategoryItem[] }) {
    return (
        <div className={`${glassCard} rounded-xl overflow-hidden`}>
            <div className="px-8 py-6 border-b border-[#302447] flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-white">Quản lý Category</h2>
                    <p className="text-[#a592c8] text-sm">Tạo, sửa, xóa và gán category cho sự kiện</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-[#302447] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors">
                        <MdFilterList className="text-base" /> Lọc
                    </button>
                    <button className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.4)]">
                        <MdAdd className="text-base" /> Thêm Category
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] text-[#a592c8] uppercase tracking-widest font-bold">
                            <th className="px-8 py-4">Category</th>
                            <th className="px-8 py-4">Số sự kiện</th>
                            <th className="px-8 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#302447]">
                        {categories.map((c) => (
                            <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{c.name}</p>
                                            <p className="text-[10px] text-[#a592c8]">ID: {c.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-sm text-[#a592c8]">{c.eventsCount}</td>
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
                <p className="text-xs text-[#a592c8]">Hiển thị <span className="text-white font-bold">1-3</span> trên <span className="text-white font-bold">128</span> category</p>
            </div>
        </div>
    );
}
