import { MdFilterList } from "react-icons/md";

export default function AdminLogsHeader() {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-white">
                    Nhật ký Bảo mật Hệ thống
                </h2>
                <p className="text-[#a592c8] text-sm">
                    Lộ trình kiểm toán đầy đủ cho mọi hoạt động quản trị và hệ
                    thống.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex bg-[#18122B] rounded-lg p-1 border border-[#302447]">
                    <button className="px-3 py-1.5 text-xs font-bold rounded-md bg-primary text-white">
                        Tất cả nhật ký
                    </button>
                    <button className="px-3 py-1.5 text-xs font-bold rounded-md text-[#a592c8] hover:text-white transition-colors">
                        Quan trọng
                    </button>
                    <button className="px-3 py-1.5 text-xs font-bold rounded-md text-[#a592c8] hover:text-white transition-colors">
                        Bảo mật
                    </button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#18122B] border border-[#302447] rounded-lg text-white text-sm hover:bg-[#302447] transition-colors">
                    <MdFilterList className="text-sm" />
                    Lọc
                </button>
            </div>
        </div>
    );
}
