interface Member {
    id: string;
    name: string;
    email: string;
    role: "owner" | "manager" | "staff";
    active: boolean;
    joinedAt: string;
}

const members: Member[] = [
    {
        id: "1",
        name: "Nguyen Van A",
        email: "vana@example.com",
        role: "owner",
        active: true,
        joinedAt: "20/01/2026",
    },
    {
        id: "2",
        name: "Tran Thi B",
        email: "thib@example.com",
        role: "manager",
        active: true,
        joinedAt: "22/01/2026",
    },
];

const roleLabel: Record<Member["role"], string> = {
    owner: "Chủ sở hữu",
    manager: "Quản lý nội dung",
    staff: "Nhân viên",
};

const roleStyle: Record<Member["role"], string> = {
    owner: "bg-primary/20 text-primary",
    manager: "bg-blue-500/20 text-blue-400",
    staff: "bg-slate-500/20 text-slate-300",
};

export default function MembersTable() {
    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 overflow-hidden">
            {/* Info */}
            <div className="px-6 py-4 text-sm text-slate-400">
                Có{" "}
                <span className="text-primary">
                    {members.length}
                </span>{" "}
                thành viên trong đội ngũ
            </div>

            {/* Header */}
            <div className="grid grid-cols-[2fr_1.2fr_1.4fr_1fr_80px] px-6 py-3 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                <div>Thành viên</div>
                <div>Vai trò</div>
                <div>Trạng thái</div>
                <div>Ngày tham gia</div>
                <div className="text-center">Hành động</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
                {members.map((m) => (
                    <div
                        key={m.id}
                        className="grid grid-cols-[2fr_1.2fr_1.4fr_1fr_80px] px-6 py-4 items-center hover:bg-white/5 transition"
                    >
                        {/* Member */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                {m.name.charAt(0)}
                            </div>

                            <div>
                                <p className="text-white text-sm font-medium">
                                    {m.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {m.email}
                                </p>
                            </div>
                        </div>

                        {/* Role */}
                        <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium w-fit ${roleStyle[m.role]}`}
                        >
                            {roleLabel[m.role]}
                        </span>

                        {/* Status */}
                        <span className="flex items-center gap-2 text-sm text-slate-300">
                            <span
                                className={`w-2 h-2 rounded-full ${m.active
                                        ? "bg-emerald-400"
                                        : "bg-slate-500"
                                    }`}
                            />
                            {m.active
                                ? "Đang hoạt động"
                                : "Tạm khóa"}
                        </span>

                        {/* Joined */}
                        <span className="text-sm text-slate-300">
                            {m.joinedAt}
                        </span>

                        {/* Action */}
                        <div className="flex justify-center">
                            <button className="text-slate-400 hover:text-white transition">
                                •••
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
