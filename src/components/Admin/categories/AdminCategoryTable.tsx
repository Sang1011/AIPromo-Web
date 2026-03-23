import { MdFilterList, MdAdd, MdMoreVert, MdRefresh } from "react-icons/md";
import { useEffect, useMemo, useState } from "react";
import AdminEditCategoryModal from "./AdminEditCategoryModal";
import AdminFloatingMenu from "./AdminFloatingMenu";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAllCategories, fetchToggleCategoryStatus, fetchDeleteCategory } from "../../../store/categorySlice";
import type { Category } from "../../../types/category/category";
import AdminConfirmStatusModal from "./AdminConfirmStatusModal";
import toast from "react-hot-toast";
import AdminCreateCategoryModal from "./AdminCreateCategoryModal";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

const CATEGORY_OPTIONS = [
    { code: "TECH", label: "Công nghệ", gradient: "linear-gradient(90deg,#8b5cf6,#6366f1)" },
    { code: "MUSIC", label: "Âm nhạc", gradient: "linear-gradient(90deg,#ec4899,#f43f5e)" },
    { code: "WORKSHOP", label: "Workshop", gradient: "linear-gradient(90deg,#f59e0b,#f97316)" },
    { code: "ART", label: "Nghệ thuật", gradient: "linear-gradient(90deg,#a855f7,#8b5cf6)" },
    { code: "FINANCE", label: "Tài chính", gradient: "linear-gradient(90deg,#10b981,#14b8a6)" },
    { code: "OTHER", label: "Khác", gradient: "linear-gradient(90deg,#64748b,#94a3b8)" },
];

export default function AdminCategoryTable() {
    const dispatch = useDispatch<AppDispatch>();
    const categories = useSelector((state: RootState) => state.CATEGORY.categories) as Category[];
    const [loading, setLoading] = useState(false);
    const [openMenu, setOpenMenu] = useState<{ id: number; rect: DOMRect } | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [openStatusMenu, setOpenStatusMenu] = useState<{ id: number; rect: DOMRect } | null>(null);
    const [statusConfirm, setStatusConfirm] = useState<{ id: number; activate: boolean } | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const load = async () => {
        try {
            setLoading(true);
            await dispatch(fetchAllCategories({})).unwrap();
        } catch (e) {
            console.error("Failed to load categories", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // keep page in range when data changes
    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(((categories || []).length) / pageSize));
        if (page > totalPages) setPage(totalPages);
    }, [categories, page]);

    const sorted = useMemo(() => (categories ? [...categories].sort((a, b) => a.id - b.id) : []), [categories]);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentSlice = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, page]);

    return (
        <div className={`${glassCard} rounded-xl overflow-hidden`}>
            <div className="px-8 py-6 border-b border-[#302447] flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-white">Quản lý Category</h2>
                    <p className="text-[#a592c8] text-sm">Tạo, sửa, xóa và gán category cho sự kiện</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => {}} className="bg-[#302447] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors">
                        <MdFilterList className="text-base" /> Lọc
                    </button>
                    <button onClick={() => setOpenCreate(true)} className="bg-primary text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.4)] text-white">
                        <MdAdd className="text-base" /> Thêm Category
                    </button>
                    <button onClick={load} className="bg-[#1b1230] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors">
                        <MdRefresh />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] text-[#a592c8] uppercase tracking-widest font-bold">
                            <th className="px-8 py-4">Tên</th>
                            <th className="px-8 py-4">Mã</th>
                            <th className="px-8 py-4">Mô tả</th>
                            <th className="px-8 py-4 text-center">Trạng thái</th>
                            <th className="px-8 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#302447]">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-6 text-center text-sm text-[#a592c8]">Đang tải...</td>
                            </tr>
                        ) : (
                            // paged slice of sorted categories
                            (currentSlice || []).map((c) => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-5">
                                        <div>
                                                    <p className="text-sm font-semibold text-white">{c.name}</p>
                                                </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {(() => {
                                            const opt = CATEGORY_OPTIONS.find(o => o.code === c.code);
                                            const grad = opt?.gradient ?? 'transparent';
                                            return (
                                                <div className="flex items-center">
                                                    <div className="rounded-lg w-16 h-8 flex items-center justify-center text-sm font-bold text-white" style={{ background: grad, boxShadow: 'inset 0 -6px 18px rgba(0,0,0,0.12)' }}>
                                                        {c.code}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-8 py-5 text-sm text-[#a592c8]">{c.description}</td>
                                    <td className="px-8 py-5 text-center">
                                            <button onClick={(e) => { const btn = e.currentTarget as HTMLElement; const rect = btn.getBoundingClientRect(); setOpenStatusMenu(openStatusMenu && openStatusMenu.id === c.id ? null : { id: c.id, rect }); }} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${c.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? "bg-emerald-400" : "bg-amber-400"}`} />
                                                {c.isActive ? "Hoạt động" : "Tạm dừng"}
                                            </button>
                                    </td>
                                    <td className="px-8 py-5 text-right relative">
                                        <button onClick={(e) => { const btn = e.currentTarget as HTMLElement; const rect = btn.getBoundingClientRect(); setOpenMenu(openMenu && openMenu.id === c.id ? null : { id: c.id, rect }); }} className="p-1.5 rounded-lg text-[#a592c8] hover:text-white hover:bg-white/5 transition-colors">
                                            <MdMoreVert className="text-lg" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-8 py-4 border-t border-[#302447] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white/5">
                <p className="text-xs text-[#a592c8]">Hiển thị <span className="text-white font-bold">{(currentSlice || []).length}</span> trên <span className="text-white font-bold">{total}</span> category</p>

                <div className="flex items-center gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={`px-3 py-1 rounded-md text-sm ${page <= 1 ? 'text-[#6b5b86] bg-[#0f0b16]' : 'text-white bg-[#302447] hover:bg-white/10'}`}>Prev</button>
                    <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, idx) => {
                            const p = idx + 1;
                            const show = totalPages <= 10 || Math.abs(p - page) <= 3 || p === 1 || p === totalPages;
                            if (!show) {
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
            {editingId !== null && (
                // modal lazy load
                <AdminEditCategoryModal categoryId={editingId} onClose={() => setEditingId(null)} />
            )}
            {openCreate && (
                <AdminCreateCategoryModal onClose={() => setOpenCreate(false)} />
            )}
            {openStatusMenu && (() => {
                const cat = (categories || []).find((x) => x.id === openStatusMenu.id);
                return (
                    <AdminFloatingMenu
                        rect={openStatusMenu.rect}
                        items={[
                            { key: 'active', label: 'Hoạt động', onClick: () => { setStatusConfirm({ id: openStatusMenu.id, activate: true }); }, active: !!cat?.isActive },
                            { key: 'paused', label: 'Tạm dừng', onClick: () => { setStatusConfirm({ id: openStatusMenu.id, activate: false }); }, active: !cat?.isActive }
                        ]}
                        onClose={() => setOpenStatusMenu(null)}
                    />
                );
            })()}

            {statusConfirm && (() => {
                const statusCat = (categories || []).find(x => x.id === statusConfirm.id);
                const name = statusCat?.name ?? `#${statusConfirm.id}`;
                return (
                    <AdminConfirmStatusModal
                        title="Xác nhận thay đổi trạng thái"
                        message={`Bạn có chắc muốn chuyển category "${name}" sang trạng thái "${statusConfirm.activate ? 'Hoạt động' : 'Tạm dừng'}"?`}
                        onCancel={() => setStatusConfirm(null)}
                        confirming={confirming}
                        onConfirm={async () => {
                            setConfirming(true);
                            try {
                                await dispatch(fetchToggleCategoryStatus({ id: statusConfirm.id, activate: statusConfirm.activate })).unwrap();
                                toast.success("Đã cập nhật trạng thái");
                                await dispatch(fetchAllCategories({})).unwrap();
                                setStatusConfirm(null);
                            } catch (e) {
                                console.error(e);
                                const msg = (e as any)?.response?.data?.detail ?? (e as any)?.message ?? "Thay đổi trạng thái thất bại";
                                toast.error(msg);
                            } finally {
                                setConfirming(false);
                            }
                        }}
                    />
                );
            })()}

            {deleteConfirm !== null && (
                <AdminConfirmStatusModal
                    title="Xác nhận xóa"
                    message={`Bạn có chắc muốn xóa category "${deleteConfirm.name}"? Hành động này không thể hoàn tác.`}
                    onCancel={() => setDeleteConfirm(null)}
                    confirming={deleting}
                    onConfirm={async () => {
                        setDeleting(true);
                        try {
                            await dispatch(fetchDeleteCategory(deleteConfirm.id)).unwrap();
                            toast.success("Đã xóa category");
                            await dispatch(fetchAllCategories({})).unwrap();
                            setDeleteConfirm(null);
                        } catch (err: any) {
                            console.error(err);
                            const detail = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? "Xóa thất bại";
                            if (typeof detail === 'string' && detail.toLowerCase().includes('cannot delete category')) {
                                toast.error('Không thể xóa category vì đang được sử dụng bởi một hoặc nhiều sự kiện.');
                            } else {
                                toast.error(detail);
                            }
                        } finally {
                            setDeleting(false);
                        }
                    }}
                />
            )}
            {openMenu && (
                <AdminFloatingMenu
                    rect={openMenu.rect}
                    items={[
                        { key: 'edit', label: 'Cập nhật', onClick: () => setEditingId(openMenu.id) },
                        { key: 'delete', label: 'Xoá', onClick: () => {
                            const catName = (categories || []).find(x => x.id === openMenu.id)?.name ?? `#${openMenu.id}`;
                            setDeleteConfirm({ id: openMenu.id, name: catName });
                        } }
                    ]}
                    onClose={() => setOpenMenu(null)}
                />
            )}
        </div>
    );
}

 
