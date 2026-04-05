import { useEffect, useMemo, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import MembersTable from "../../components/Organizer/members/MembersTable";
import Pagination from "../../components/Organizer/shared/Pagination";
import { useEventTitle } from "../../hooks/useEventTitle";
import type { AppDispatch, RootState } from "../../store";
import { fetchMe } from "../../store/authSlice";
import { fetchAddEventMember, fetchEventMembers, fetchExportExcelMember } from "../../store/eventMemberSlice";
import type { ApiResponse } from "../../types/api";
import type { MeInfo } from "../../types/auth/auth";
import { downloadFileExcel } from "../../utils/downloadFileExcel";
import { getCurrentDateTime } from "../../utils/getCurrentDateTime";
import { notify } from "../../utils/notify";
import { saveReportToFirebase } from "../../utils/saveReportToFirebase";

const PERMISSIONS = ["CheckIn", "ViewReports"];

const permissionLabel: Record<string, string> = {
    CheckIn: "Check-in",
    ViewReports: "Xem báo cáo",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MemberManagementPage() {
    const dispatch = useDispatch<AppDispatch>();
    const members = useSelector((state: RootState) => state.EVENT_MEMBER.members);
    const addingMember = useSelector((state: RootState) => state.EVENT_MEMBER.addingMember);
    const { eventId } = useParams<{ eventId: string }>();

    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newPermissions, setNewPermissions] = useState<string[]>([]);
    const [addError, setAddError] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const eventName = useEventTitle();
    if (!eventId) return null;

    const loadMembers = () => {
        dispatch(fetchEventMembers(eventId));
    };

    const filteredMembers = useMemo(() => {
        const keyword = search.toLowerCase();
        return members.filter((m) => {
            const email = m.email?.toLowerCase() || "";
            return email.includes(keyword);
        });
    }, [members, search]);

    const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE);

    const paginatedMembers = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredMembers.slice(start, start + PAGE_SIZE);
    }, [filteredMembers, page]);

    const validateEmail = (email: string): string => {
        if (!email.trim()) return "Vui lòng nhập email.";
        if (!EMAIL_REGEX.test(email.trim())) return "Email không hợp lệ.";
        const alreadyExists = members.some(
            (m) => m.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (alreadyExists) return "Thành viên này đã tồn tại trong đội ngũ.";
        return "";
    };

    const toggleNewPermission = (perm: string) => {
        setNewPermissions((prev) =>
            prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
        );
    };

    const handleEmailChange = (value: string) => {
        setNewEmail(value);
        if (addError) setAddError("");
    };

    const handleAdd = async () => {
        const error = validateEmail(newEmail);
        if (error) {
            setAddError(error);
            return;
        }
        setAddError("");
        const result = await dispatch(
            fetchAddEventMember({
                eventId,
                data: { email: newEmail.trim(), permissions: newPermissions },
            })
        );
        if (fetchAddEventMember.fulfilled.match(result)) {
            notify.success("Thêm thành viên thành công");
            setShowAddModal(false);
            setNewEmail("");
            setNewPermissions([]);
            setPage(1);
            loadMembers();
        } else if (fetchAddEventMember.rejected.match(result)) {
            const status = result.payload?.status;
            if (status === 404) {
                notify.warning("Thành viên này không tồn tại");
            } else {
                notify.error("Không thể thêm thành viên");
            }
        }
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setNewEmail("");
        setNewPermissions([]);
        setAddError("");
    };

    const handleExportExcel = async () => {
        if (!eventId) return notify.error("Không tìm thấy eventId");
        try {
            const blob = await dispatch(fetchExportExcelMember(eventId)).unwrap();
            const { iso, formatted } = getCurrentDateTime();
            const fileName = `members_${eventName}_${formatted}.xlsx`;
            downloadFileExcel(blob, fileName);
            const meResult = await dispatch(fetchMe()).unwrap();
            const email = (meResult as ApiResponse<MeInfo>)?.data?.email;
            await saveReportToFirebase({
                eventId,
                eventName: eventName ?? eventId,
                fileName,
                createdBy: email ?? "",
                createdAt: iso
            });
            notify.success("Xuất Excel thành công");
        } catch (err) {
            notify.error("Xuất Excel thất bại");
        }
    };

    useEffect(() => {
        loadMembers();
    }, [eventId]);

    useEffect(() => {
        if (page > totalPages && page > 1) {
            setPage(totalPages);
        }
    }, [filteredMembers]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Quản lý thành viên
                            <span className="ml-3 text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
                                Thành viên
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportExcel}
                            className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 transition"
                        >
                            <FiDownload /> Xuất Excel
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-primary/30 transition"
                        >
                            + Thêm thành viên
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm thành viên theo email..."
                        className="flex-1 px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none"
                    />
                </div>

                <MembersTable
                    eventId={eventId}
                    members={paginatedMembers}
                    filteredMembers={filteredMembers}
                />
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-sm mx-4 rounded-2xl bg-[#140f2a] border border-white/10 p-6 shadow-2xl">
                        <h3 className="text-white font-semibold text-base mb-5">
                            Thêm thành viên mới
                        </h3>

                        <div className="mb-4">
                            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-widest">
                                Email
                            </label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                placeholder="example@email.com"
                                className={`w-full px-4 py-2.5 rounded-xl bg-black/30 border text-sm text-white placeholder:text-slate-500 outline-none transition ${addError && addError !== "Không thể thêm thành viên. Vui lòng thử lại."
                                    ? "border-red-500/50 focus:border-red-500"
                                    : "border-white/10 focus:border-primary/50"
                                    }`}
                            />
                            {addError && addError !== "Không thể thêm thành viên. Vui lòng thử lại." && (
                                <p className="text-red-400 text-xs mt-1.5">{addError}</p>
                            )}
                        </div>

                        <div className="mb-5">
                            <label className="block text-xs text-slate-400 mb-3 uppercase tracking-widest">
                                Quyền hạn
                            </label>
                            <div className="space-y-3">
                                {PERMISSIONS.map((perm) => (
                                    <label key={perm} className="flex items-center gap-3 cursor-pointer group">
                                        <div
                                            onClick={() => toggleNewPermission(perm)}
                                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${newPermissions.includes(perm)
                                                ? "bg-primary border-primary"
                                                : "border-white/20 bg-white/5"
                                                }`}
                                        >
                                            {newPermissions.includes(perm) && (
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
                        </div>

                        {addError === "Không thể thêm thành viên. Vui lòng thử lại." && (
                            <p className="text-red-400 text-xs mb-4">{addError}</p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={addingMember}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition text-sm font-medium disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={addingMember}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white transition text-sm font-medium shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {addingMember && (
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                    </svg>
                                )}
                                {addingMember ? "Đang thêm..." : "Thêm thành viên"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}