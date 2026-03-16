import { MdFilterList, MdPersonAdd, MdMoreVert } from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

export interface UserItem {
    id: string;
    name: string;
    role: string;
    email: string;
    joinDate: string;
    status: "active" | "suspended";
    avatar: string | null;
}

const defaultUsers: UserItem[] = [
    {
        id: "#USR-94021",
        name: "Johnathan Smith",
        role: "Organizer",
        email: "j.smith@eventify.com",
        joinDate: "Oct 12, 2023",
        status: "active",
        avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBPpgJwx9-_D61wkKl3dsOf4eMniUmgnBLVY99tXLkB-WcVAu7fGHNh6yHSQcO3sV4tuSqNy43Sr2LpdM2fsP5EO8QMpNfVZhFmQfOPPXdQtMg6IKEGbCFQ6uXZ7r-ixv3xX6XGhOy1EAHwxQtcffVuyp8bE9WJxpeuHcpBJD0Fk1V3iCRX-gNU7yCeFpFr-UVYH9ElbaH44U67eQjXnZFJowRgzUlk6OcnsKjvUPAT5vJrp8CK6XQUgyxiUSSeJi36Cmfx-8YBhTM2",
    },
    {
        id: "#USR-94019",
        name: "Sarah Wilson",
        role: "Attendee",
        email: "sarah.w@gmail.com",
        joinDate: "Oct 11, 2023",
        status: "active",
        avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDLd3Lrptc5vsqrxnxIszULo1pCpyIuJvmB5_sElcHxmPKpxhwCdWZNJ0SWAqpXooXaIVGBJ_t-AuMn4ClE7mOtkTpS_8K45zkRtIVFe1YWowMqvfFy2Vd9LW8t3oP7NgCuJ117FLoJ21WRrJ9ZW4PQmLokOi3CoR-t4u9E-bZrPZfTv3wKbqkGX74QdQApamCJ36JNVgWeCP-Cz22J0jBtyzuj3gT9t0TLYGfX8qBUczpy8ceuqLCPqfvObwJMtLRlGHzn06opT2TB",
    },
    {
        id: "#USR-94018",
        name: "Michael Chen",
        role: "Attendee",
        email: "m.chen@outlook.com",
        joinDate: "Oct 11, 2023",
        status: "suspended",
        avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBwULc5HdQIH2uuQr7i9dr1Oy5ZnO-py4nGHJYnI14gelm8hRIvlOQO44Oj6MYyXMh_WuRoajJfp0ztlRX-sDfIGc2PV5XnUoMz51FdEzgz-MnCvyLLNJkGM4M_RSGj-LWzeXOxfPcstn6CE3FLgewdbYhpV58jWiKMzTQHLfyc6Cath-TyvKe9g3c5XZK85N3us5jJTo9V-WHV8zoLBqt92afrSojGqh8yIcR2ufmv5G4aCRyvD5veS_Ejrj1dytd5SwdzwasaIlxD",
    },
    {
        id: "#USR-94015",
        name: "Emma Miller",
        role: "Organizer",
        email: "emma.m@studio.io",
        joinDate: "Oct 10, 2023",
        status: "active",
        avatar: null,
    },
];

interface AdminUserManagementTableProps {
    users?: UserItem[];
}

export default function AdminUserManagementTable({
    users = defaultUsers,
}: AdminUserManagementTableProps) {
    return (
        <div className={`${glassCard} rounded-xl overflow-hidden`}>
            <div className="px-8 py-6 border-b border-[#302447] flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        Quản lý Người dùng
                    </h2>
                    <p className="text-[#a592c8] text-sm">
                        Quản lý và giám sát người dùng hệ thống theo mọi vai trò
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-[#302447] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors">
                        <MdFilterList className="text-base" /> Lọc
                    </button>
                    <button className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.4)]">
                        <MdPersonAdd className="text-base" /> Thêm người dùng
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] text-[#a592c8] uppercase tracking-widest font-bold">
                            <th className="px-8 py-4">Người dùng</th>
                            <th className="px-8 py-4">Vai trò</th>
                            <th className="px-8 py-4">Email</th>
                            <th className="px-8 py-4">Ngày tham gia</th>
                            <th className="px-8 py-4 text-center">Trạng thái</th>
                            <th className="px-8 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#302447]">
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-white/5 transition-colors"
                            >
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        {user.avatar ? (
                                            <div
                                                className="w-9 h-9 rounded-full bg-cover bg-center border border-[#302447]"
                                                style={{
                                                    backgroundImage: `url('${user.avatar}')`,
                                                }}
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-[#302447] flex items-center justify-center border border-[#302447]">
                                                <span className="text-xs font-bold text-white">
                                                    {user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {user.name}
                                            </p>
                                            <p className="text-[10px] text-[#a592c8]">
                                                ID: {user.id}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                            user.role === "Organizer"
                                                ? "bg-primary/10 text-primary"
                                                : "bg-indigo-500/10 text-indigo-400"
                                        }`}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-sm text-[#a592c8]">
                                    {user.email}
                                </td>
                                <td className="px-8 py-5 text-sm text-white">
                                    {user.joinDate}
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                                            user.status === "active"
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "bg-amber-500/10 text-amber-400"
                                        }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                                user.status === "active"
                                                    ? "bg-emerald-400"
                                                    : "bg-amber-400"
                                            }`}
                                        />
                                        {user.status === "active"
                                            ? "Hoạt động"
                                            : "Bị đình chỉ"}
                                    </span>
                                </td>
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
                <p className="text-xs text-[#a592c8]">
                    Hiển thị <span className="text-white font-bold">1-4</span>{" "}
                    trên <span className="text-white font-bold">24.512</span> người
                    dùng
                </p>
                <div className="flex gap-2">
                    <button className="w-8 h-8 rounded bg-[#302447] text-white flex items-center justify-center hover:bg-primary transition-colors disabled:opacity-50">
                        <FiChevronLeft className="text-sm" />
                    </button>
                    <button className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold text-xs">
                        1
                    </button>
                    <button className="w-8 h-8 rounded bg-[#302447] text-white flex items-center justify-center hover:bg-primary transition-colors text-xs">
                        2
                    </button>
                    <button className="w-8 h-8 rounded bg-[#302447] text-white flex items-center justify-center hover:bg-primary transition-colors text-xs">
                        3
                    </button>
                    <button className="w-8 h-8 rounded bg-[#302447] text-white flex items-center justify-center hover:bg-primary transition-colors">
                        <FiChevronRight className="text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
}
