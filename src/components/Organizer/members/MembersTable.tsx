import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import type { EventMember } from "../../../types/eventMember/eventMember";
import { fetchRemoveEventMember, fetchUpdateEventMemberPermissions } from "../../../store/eventMemberSlice";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { notify } from "../../../utils/notify";

const PERMISSIONS = ["CheckIn", "ViewReports"];

const permissionLabel: Record<string, string> = {
    CheckIn: "Check-in",
    ViewReports: "Xem báo cáo",
};

interface MembersTableProps {
    eventId: string;
    members: EventMember[];
    filteredMembers: EventMember[];
}

function SkeletonRow() {
    return (
        <div className="grid grid-cols-[2fr_2fr_80px] px-6 py-4 items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                <div className="h-4 w-40 rounded-lg bg-white/5 animate-pulse" />
            </div>
            <div className="flex gap-2">
                <div className="h-5 w-20 rounded-full bg-white/5 animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-white/5 animate-pulse" />
            </div>
            <div className="flex justify-center">
                <div className="h-4 w-6 rounded bg-white/5 animate-pulse" />
            </div>
        </div>
    );
}

export default function MembersTable({ eventId, members, filteredMembers }: MembersTableProps) {
    const dispatch = useDispatch<AppDispatch>();
    const fetchingMembers = useSelector((state: RootState) => state.EVENT_MEMBER.fetchingMembers);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editMember, setEditMember] = useState<EventMember | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleRemove = async (staffId: string) => {
        setLoadingId(staffId);
        await dispatch(fetchRemoveEventMember({ eventId, staffId }));
        setLoadingId(null);
        setOpenMenuId(null);
        notify.success("Đã xóa thành viên");
    };

    const handleOpenEdit = (member: EventMember) => {
        setEditMember(member);
        setSelectedPermissions([...member.permissions]);
        setOpenMenuId(null);
    };

    const handleUpdatePermissions = async () => {
        if (!editMember) return;
        setLoadingId(editMember.id);
        const result = await dispatch(
            fetchUpdateEventMemberPermissions({
                eventId,
                staffId: editMember.id,
                data: { permissions: selectedPermissions },
            })
        );
        setLoadingId(null);
        if (fetchUpdateEventMemberPermissions.fulfilled.match(result)) {
            setEditMember(null);
            notify.success("Cập nhật quyền thành công");
        }
    };

    const togglePermission = (perm: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
        );
    };

    return (
        <>
            <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 overflow-visible">
                <div className="px-6 py-4 text-sm text-slate-400">
                    Có{" "}
                    <span className="text-primary">{filteredMembers.length}</span>{" "}
                    thành viên trong đội ngũ
                </div>

                <div className="grid grid-cols-[2fr_2fr_80px] px-6 py-3 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                    <div>Thành viên</div>
                    <div>Quyền hạn</div>
                    <div className="text-center">Hành động</div>
                </div>

                <div className="divide-y divide-white/5" ref={menuRef}>
                    {fetchingMembers ? (
                        Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : (
                        <>
                            {members.map((m) => (
                                <div
                                    key={m.id}
                                    className="grid grid-cols-[2fr_2fr_80px] px-6 py-4 items-center hover:bg-white/5 transition relative"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                            {m.email && m.email.charAt(0).toUpperCase()}
                                        </div>
                                        <p className="text-white text-sm font-medium">{m.email}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {!m.permissions || m.permissions.length === 0 ? (
                                            <span className="text-xs text-slate-500 italic">Không có quyền</span>
                                        ) : (
                                            m.permissions.map((perm) => (
                                                <span
                                                    key={perm}
                                                    className="inline-flex px-2.5 py-0.5 rounded-full border border-[#334155] text-xs font-medium text-slate-200 bg-[#1e293b]/40"
                                                >
                                                    {permissionLabel[perm] ?? perm}
                                                </span>
                                            ))
                                        )}
                                    </div>

                                    <div className="flex justify-center relative">
                                        <button
                                            onClick={() =>
                                                setOpenMenuId(openMenuId === m.id ? null : m.id)
                                            }
                                            className="text-slate-400 hover:text-white transition px-2 py-1"
                                        >
                                            •••
                                        </button>

                                        {openMenuId === m.id && (
                                            <div className="absolute right-0 top-full mt-2 z-50 w-44 rounded-xl bg-[#1a1030] border border-white/10 shadow-xl">
                                                <button
                                                    onClick={() => handleOpenEdit(m)}
                                                    className="w-full px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 text-left transition flex items-center gap-2"
                                                >
                                                    <FiEdit2 className="text-blue-400 w-4 h-4" />
                                                    Chỉnh sửa quyền
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(m.id)}
                                                    disabled={loadingId === m.id}
                                                    className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 text-left transition flex items-center gap-2"
                                                >
                                                    <FiTrash2 className="w-4 h-4 opacity-80" />
                                                    {loadingId === m.id ? "Đang xóa..." : "Xóa thành viên"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {members.length === 0 && (
                                <div className="px-6 py-10 text-center text-slate-500 text-sm">
                                    Chưa có thành viên nào trong đội ngũ
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {editMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-sm mx-4 rounded-2xl bg-[#140f2a] border border-white/10 p-6 shadow-2xl">
                        <h3 className="text-white font-semibold text-base mb-1">
                            Chỉnh sửa quyền hạn
                        </h3>
                        <p className="text-slate-400 text-sm mb-5">{editMember.email}</p>

                        <div className="space-y-3 mb-6">
                            {PERMISSIONS.map((perm) => (
                                <label
                                    key={perm}
                                    className="flex items-center gap-3 cursor-pointer group"
                                >
                                    <div
                                        onClick={() => togglePermission(perm)}
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${selectedPermissions.includes(perm)
                                            ? "bg-primary border-primary"
                                            : "border-white/20 bg-white/5"
                                            }`}
                                    >
                                        {selectedPermissions.includes(perm) && (
                                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm text-slate-200 group-hover:text-white transition">
                                        {permissionLabel[perm] ?? perm}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditMember(null)}
                                disabled={loadingId === editMember.id}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition text-sm font-medium disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdatePermissions}
                                disabled={loadingId === editMember.id}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white transition text-sm font-medium shadow-lg shadow-primary/30 disabled:opacity-50"
                            >
                                {loadingId === editMember.id ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </div>

                </div>

            )}
        </>
    );
}