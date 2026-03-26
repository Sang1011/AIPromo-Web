import { MdFilterList, MdAdd, MdRefresh } from "react-icons/md";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAllHashtags, fetchDeleteHashtag } from "../../../store/hashtagSlice";
import type { Hashtag } from "../../../types/hashtag/hashtag";
import AdminCreateHashtagModal from "./AdminCreateHashtagModal";
import AdminEditHashtagModal from "./AdminEditHashtagModal";
import AdminConfirmStatusModal from "../categories/AdminConfirmStatusModal";
import toast from "react-hot-toast";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

export default function AdminHashtagTable() {
    const dispatch = useDispatch<AppDispatch>();
    const hashtags = useSelector((state: RootState) => state.HASHTAG.hashtags) as Hashtag[];
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const load = async () => {
        try {
            setLoading(true);
            await dispatch(fetchAllHashtags()).unwrap();
        } catch (e) {
            console.error("Failed to load hashtags", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil((hashtags || []).length / pageSize));
        if (page > totalPages) setPage(totalPages);
    }, [hashtags, page]);

    const total = (hashtags || []).length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentSlice = useMemo(() => {
        const start = (page - 1) * pageSize;
        const sorted = [...(hashtags || [])].sort((a, b) => b.id - a.id);
        return sorted.slice(start, start + pageSize);
    }, [hashtags, page]);

    return (
        <div className={`${glassCard} rounded-xl overflow-hidden`}>
            <div className="px-8 py-6 border-b border-[#302447] flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-white">Quản lý Hashtags</h2>
                    <p className="text-[#a592c8] text-sm">Tạo, sửa, xóa và theo dõi hashtag sự kiện</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => {}} className="bg-[#302447] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors">
                        <MdFilterList className="text-base" /> Lọc
                    </button>
                    <button onClick={() => setOpenCreate(true)} className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.4)]">
                        <MdAdd className="text-base" /> Thêm Hashtag
                    </button>
                    <button onClick={load} className="bg-[#1b1230] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors">
                        <MdRefresh className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] text-[#a592c8] uppercase tracking-widest font-bold">
                            <th className="px-8 py-4">Hashtag</th>
                            <th className="px-8 py-4">Slug</th>
                            <th className="px-8 py-4">Lượt sử dụng</th>
                            <th className="px-8 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#302447]">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-6 text-center text-sm text-[#a592c8]">Đang tải...</td>
                            </tr>
                        ) : (
                            (currentSlice || []).map((h) => (
                                <tr key={h.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-5">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{h.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-[#a592c8]">{h.slug}</td>
                                    <td className="px-8 py-5 text-sm text-[#a592c8]">{(h.usageCount || 0).toLocaleString()}</td>
                                    <td className="px-8 py-5 text-right relative">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="inline-flex gap-2">
                                                <button onClick={() => setEditingId(h.id)} className="px-3 py-1.5 text-xs rounded-lg bg-[#302447] text-white">Cập nhật</button>
                                                <button onClick={() => setDeleteConfirm({ id: h.id, name: h.name })} className="px-3 py-1.5 text-xs rounded-lg bg-[#1b1230] text-[#a592c8]">Xoá</button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-8 py-4 border-t border-[#302447] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white/5">
                <p className="text-xs text-[#a592c8]">Hiển thị <span className="text-white font-bold">{(currentSlice || []).length}</span> trên <span className="text-white font-bold">{total}</span> hashtag</p>

                <div className="flex items-center gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={`px-3 py-1 rounded-md text-sm ${page <= 1 ? 'text-[#6b5b86] bg-[#0f0b16]' : 'text-white bg-[#302447] hover:bg-white/10'}`}>Prev</button>
                    <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, idx) => {
                            const p = idx + 1;
                            const show = totalPages <= 10 || Math.abs(p - page) <= 3 || p === 1 || p === totalPages;
                            if (!show) {
                                // render ellipsis when skipping
                                if (p === 2 && page > 6) return (<span key={p} className="px-2">...</span>);
                                if (p === totalPages - 1 && page < totalPages - 5) return (<span key={p} className="px-2">...</span>);
                                return null;
                            }
                            return (
                                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded-md text-sm ${p === page ? 'bg-primary text-white' : 'bg-[#1b1230] text-[#a592c8] hover:bg-white/5'}`}>{p}</button>
                            );
                        })}
                    </div>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={`px-3 py-1 rounded-md text-sm ${page >= totalPages ? 'text-[#6b5b86] bg-[#0f0b16]' : 'text-white bg-[#302447] hover:bg-white/10'}`}>Next</button>
                </div>
            </div>

            {openCreate && (
                <AdminCreateHashtagModal onClose={() => setOpenCreate(false)} />
            )}

            {editingId !== null && (
                <AdminEditHashtagModal hashtagId={editingId} onClose={() => setEditingId(null)} />
            )}

            {deleteConfirm !== null && (
                <AdminConfirmStatusModal
                    title="Xác nhận xóa"
                    message={`Bạn có chắc muốn xóa hashtag "${deleteConfirm.name}"?`}
                    onCancel={() => setDeleteConfirm(null)}
                    confirming={deleting}
                    onConfirm={async () => {
                        setDeleting(true);
                        try {
                            await dispatch(fetchDeleteHashtag(deleteConfirm.id)).unwrap();
                            toast.success("Đã xóa hashtag");
                            await dispatch(fetchAllHashtags()).unwrap();
                            setDeleteConfirm(null);
                        } catch (err: any) {
                            console.error(err);
                            const detail = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? "Xóa thất bại";
                            toast.error(detail);
                        } finally {
                            setDeleting(false);
                        }
                    }}
                />
            )}
        </div>
    );
}
