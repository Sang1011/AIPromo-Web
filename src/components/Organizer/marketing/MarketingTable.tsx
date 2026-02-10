import { MdOutlineArrowForward } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function MarketingTable() {
    const navigate = useNavigate();
    return (
        <section className="space-y-6 pb-16">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="w-1.5 h-6 bg-primary rounded-full mr-3" />
                    Danh sách Nội dung
                </h2>

                <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
                    <button className="px-5 py-2.5 text-xs font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                        Tất cả
                    </button>
                    <button className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-300">
                        Đang nháp
                    </button>
                </div>
            </div>

            <div className="glass overflow-hidden rounded-[32px] border border-slate-800/50 shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/80 text-slate-500 uppercase text-[12px] font-black tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Tiêu đề nội dung</th>
                            <th className="px-8 py-5">Ngôn ngữ</th>
                            <th className="px-8 py-5">Trạng thái</th>
                            <th className="px-8 py-5">Ngày tạo</th>
                            <th className="px-8 py-5 text-right">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800/40">
                        {[
                            {
                                title: "Chiến dịch vé sớm Facebook",
                                tags: "#FB #EarlyBird",
                                lang: "VN",
                                status: "Đã đăng",
                                date: "24/01/2026",
                            },
                            {
                                title: "Email mời tham dự VIP",
                                tags: "#Email #VIP",
                                lang: "EN",
                                status: "Bản nháp",
                                date: "22/01/2026",
                            },
                            {
                                title: "Bài viết blog PR sự kiện",
                                tags: "#Blog #SEO",
                                lang: "VN",
                                status: "Đã đăng",
                                date: "20/01/2026",
                            },
                        ].map((item, idx) => (
                            <tr
                                key={idx}
                                className="hover:bg-primary/[0.04] transition-all group"
                            >
                                <td className="px-8 py-6 font-bold text-white">
                                    <div className="flex flex-col">
                                        <span>{item.title}</span>
                                        <span className="text-xs text-slate-500 mt-1">
                                            {item.tags}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-8 py-6">
                                    <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                        {item.lang}
                                    </span>
                                </td>

                                <td className="px-8 py-6">
                                    <span
                                        className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase
                                                    ${item.status === "Đã đăng"
                                                ? "bg-primary/20 text-primary border border-primary/30"
                                                : "bg-slate-800/50 text-slate-500 border border-slate-700"
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </td>

                                <td className="px-8 py-6 text-slate-400 text-sm">
                                    {item.date}
                                </td>

                                <td className="px-8 py-6 text-right">
                                    <button onClick={() => {
                                        navigate(String(idx))
                                    }} className="text-primary hover:text-primary/80 font-bold text-sm flex items-center justify-end space-x-1 ml-auto">
                                        <span>Xem chi tiết</span>
                                        <MdOutlineArrowForward className="text-sm" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}