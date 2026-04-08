import { useEffect, useMemo, useState } from "react";
import { MdCloudUpload, MdRefresh, MdDescription, MdOpenInNew, MdAdd, MdCheckCircle } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { AppDispatch, RootState } from "../../../store";
import {
    fetchAllPolicies,
    fetchDeletedPolicy,
    fetchPolicyUploadFile,
    fetchUploadPolicy,
} from "../../../store/policySlice";
import type { Policy } from "../../../types/policy/policy";

function extractUploadedFileUrl(payload: any): string {
    if (!payload) return "";
    if (typeof payload === "string") return payload;
    if (typeof payload?.fileUrl === "string") return payload.fileUrl;
    if (typeof payload?.url === "string") return payload.url;
    if (typeof payload?.secure_url === "string") return payload.secure_url;
    if (typeof payload?.data?.fileUrl === "string") return payload.data.fileUrl;
    return "";
}

function formatPolicyType(type: string) {
    if (!type) return "Không xác định";
    return type.replaceAll("_", " ");
}

const POLICY_TYPE_META: Record<string, { color: string; bg: string; dot: string }> = {
    ORGANIZER_POLICY: { color: "text-violet-300", bg: "bg-violet-500/10 border-violet-500/20", dot: "bg-violet-400" },
    USER_POLICY:      { color: "text-sky-300",    bg: "bg-sky-500/10 border-sky-500/20",       dot: "bg-sky-400" },
    PAYMENT_POLICY:   { color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
    REFUND_POLICY:    { color: "text-amber-300",   bg: "bg-amber-500/10 border-amber-500/20",   dot: "bg-amber-400" },
    GENERAL_POLICY:   { color: "text-rose-300",    bg: "bg-rose-500/10 border-rose-500/20",     dot: "bg-rose-400" },
};

function PolicyTypeBadge({ type }: { type: string }) {
    const meta = POLICY_TYPE_META[type] || { color: "text-slate-300", bg: "bg-slate-500/10 border-slate-500/20", dot: "bg-slate-400" };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.bg} ${meta.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {formatPolicyType(type)}
        </span>
    );
}

function PolicyManagement() {
    const dispatch = useDispatch<AppDispatch>();
    const { list, loading, error } = useSelector((state: RootState) => state.POLICY);

    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState("");
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const sortedPolicies = useMemo(
        () => [...(list || [])].sort((a: Policy, b: Policy) => b.id.localeCompare(a.id)),
        [list]
    );
    const total = sortedPolicies.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const currentSlice = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedPolicies.slice(start, start + pageSize);
    }, [sortedPolicies, page]);

    const loadPolicies = async () => {
        try {
            await dispatch(fetchAllPolicies()).unwrap();
        } catch (err: any) {
            toast.error(err?.message || "Không thể tải danh sách policy");
        }
    };

    useEffect(() => { loadPolicies(); }, []);
    useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

    const handleUploadFileOnly = async () => {
        if (!selectedFile) { toast.error("Vui lòng chọn file trước khi upload"); return ""; }
        try {
            setIsUploadingFile(true);
            const uploadResult = await dispatch(fetchPolicyUploadFile({ file: selectedFile })).unwrap();
            const fileUrl = extractUploadedFileUrl(uploadResult);
            if (!fileUrl) { toast.error("Upload file thành công nhưng không nhận được URL"); return ""; }
            setUploadedFileUrl(fileUrl);
            toast.success("Upload file policy thành công");
            return fileUrl;
        } catch (err: any) {
            toast.error(err?.message || "Upload file thất bại");
            return "";
        } finally {
            setIsUploadingFile(false);
        }
    };

    const handleCreatePolicy = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) { toast.error("Vui lòng nhập mô tả policy"); return; }
        if (!selectedFile && !uploadedFileUrl) { toast.error("Vui lòng chọn file policy"); return; }
        try {
            setIsSubmitting(true);
            let finalFileUrl = uploadedFileUrl;
            // Always upload first when a new file is selected, then pass URL to create policy.
            if (selectedFile) {
                finalFileUrl = await handleUploadFileOnly();
                if (!finalFileUrl) return;
            }
            if (!finalFileUrl) {
                toast.error("Không tìm thấy URL file policy");
                return;
            }
            await dispatch(fetchUploadPolicy({ type: "file", description: description.trim(), fileUrl: finalFileUrl })).unwrap();
            toast.success("Tạo policy thành công");
            setDescription("");
            setSelectedFile(null);
            setUploadedFileUrl("");
            await loadPolicies();
        } catch (err: any) {
            toast.error(err?.message || "Tạo policy thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePolicy = async (id: string) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa policy này?");
        if (!confirmed) return;
        try {
            setDeletingId(id);
            await dispatch(fetchDeletedPolicy(id)).unwrap();
            toast.success("Xóa policy thành công");
            await loadPolicies();
        } catch (err: any) {
            toast.error(err?.message || "Xóa policy thất bại");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-5">
            {/* Header card */}
            <div className="rounded-2xl bg-[rgba(20,14,38,0.9)] border border-[rgba(124,59,237,0.18)] backdrop-blur-xl overflow-hidden shadow-[0_0_40px_rgba(124,59,237,0.08)]">
                {/* Title bar */}
                <div className="px-7 py-5 flex items-center justify-between border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-[0_0_16px_rgba(124,59,237,0.5)]">
                            <MdDescription className="text-white text-lg" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-white tracking-tight">Quản lý Policy</h2>
                            <p className="text-[11px] text-[#7c6a99] mt-0.5">Upload điều khoản & phát hành policy mới</p>
                        </div>
                    </div>
                    <button
                        onClick={loadPolicies}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#a592c8] hover:text-white transition-all group"
                        title="Làm mới"
                    >
                        <MdRefresh className={`text-base transition-transform ${loading.list ? "animate-spin" : "group-hover:rotate-180 duration-300"}`} />
                    </button>
                </div>

                {/* Create form */}
                <form onSubmit={handleCreatePolicy} className="px-7 py-6 border-b border-white/[0.06]">
                    <p className="text-[11px] font-semibold text-[#7c6a99] uppercase tracking-widest mb-4">Tạo policy mới</p>
                    <div className="flex flex-col lg:flex-row gap-3">
                        {/* Description */}
                        <div className="flex-1">
                            <label className="block text-[11px] text-[#7c6a99] mb-1.5 font-medium">Mô tả</label>
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Nhập mô tả policy..."
                                className="w-full rounded-xl bg-[#0f0b1a] border border-white/10 text-white px-4 py-2.5 text-sm placeholder:text-[#4a3f60] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                            />
                        </div>

                        {/* File upload */}
                        <div className="lg:w-72">
                            <label className="block text-[11px] text-[#7c6a99] mb-1.5 font-medium">File đính kèm</label>
                            <div className={`relative rounded-xl border ${selectedFile ? "border-violet-500/40 bg-violet-500/5" : "border-dashed border-white/15 bg-[#0f0b1a]"} transition-all overflow-hidden`}>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setSelectedFile(file);
                                        setUploadedFileUrl("");
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                />
                                <div className="flex items-center gap-2.5 px-3 py-2.5">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedFile ? "bg-violet-500/20" : "bg-white/5"}`}>
                                        {uploadedFileUrl
                                            ? <MdCheckCircle className="text-emerald-400 text-base" />
                                            : <MdCloudUpload className={`text-base ${selectedFile ? "text-violet-400" : "text-[#4a3f60]"}`} />
                                        }
                                    </div>
                                    <span className={`text-xs truncate flex-1 ${selectedFile ? "text-white" : "text-[#4a3f60]"}`}>
                                        {selectedFile ? selectedFile.name : "Chọn hoặc kéo thả file..."}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={handleUploadFileOnly}
                                disabled={!selectedFile || isUploadingFile || isSubmitting || !!uploadedFileUrl}
                                className="h-[42px] px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                            >
                                <MdCloudUpload className={`text-base ${isUploadingFile ? "animate-bounce" : ""}`} />
                                {isUploadingFile ? "Đang upload..." : uploadedFileUrl ? "Đã upload" : "Upload"}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploadingFile}
                                className="h-[42px] px-5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(124,59,237,0.3)] hover:shadow-[0_0_24px_rgba(124,59,237,0.5)] whitespace-nowrap"
                            >
                                <MdAdd className="text-base" />
                                {isSubmitting ? "Đang tạo..." : "Tạo policy"}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-[#5c4f72] uppercase tracking-[0.12em] font-bold border-b border-white/[0.04]">
                                <th className="px-7 py-3.5">Mô tả</th>
                                <th className="px-7 py-3.5">Loại</th>
                                <th className="px-7 py-3.5">Tệp điều khoản</th>
                                <th className="px-7 py-3.5 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading.list ? (
                                <tr>
                                    <td colSpan={4} className="px-7 py-10 text-center">
                                        <div className="flex items-center justify-center gap-2 text-sm text-[#5c4f72]">
                                            <MdRefresh className="animate-spin text-violet-500" />
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={4} className="px-7 py-8 text-center text-sm text-red-400/80">{error}</td>
                                </tr>
                            ) : currentSlice.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-7 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-[#5c4f72]">
                                            <MdDescription className="text-3xl opacity-30" />
                                            <p className="text-sm">Chưa có policy nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentSlice.map((policy) => (
                                    <tr
                                        key={policy.id}
                                        className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors group"
                                    >
                                        <td className="px-7 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/15 flex items-center justify-center flex-shrink-0">
                                                    <MdDescription className="text-violet-400 text-sm" />
                                                </div>
                                                <p className="text-sm text-white/90 font-medium">{policy.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-7 py-4">
                                            <PolicyTypeBadge type={policy.type} />
                                        </td>
                                        <td className="px-7 py-4">
                                            {policy.fileUrl ? (
                                                <a
                                                    href={policy.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    Mở file
                                                    <MdOpenInNew className="text-sm" />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-[#4a3f60] italic">Không có file</span>
                                            )}
                                        </td>
                                        <td className="px-7 py-4 text-right">
                                            <button
                                                onClick={() => handleDeletePolicy(policy.id)}
                                                disabled={deletingId === policy.id}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                {deletingId === policy.id ? "Đang xóa..." : "Xóa"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-7 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/[0.02] border-t border-white/[0.04]">
                    <p className="text-xs text-[#5c4f72]">
                        Hiển thị <span className="text-white font-semibold">{currentSlice.length}</span> / <span className="text-white font-semibold">{total}</span> policy
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        >
                            ← Trước
                        </button>
                        <div className="flex items-center gap-1 px-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                            p === page
                                                ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(124,59,237,0.4)]"
                                                : "text-[#7c6a99] hover:text-white hover:bg-white/10"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        >
                            Sau →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PolicyManagement;