import { MdFilterList, MdAdd, MdMoreVert, MdRefresh } from "react-icons/md";
import { useEffect, useState } from "react";
import AdminEditCategoryModal from "./AdminEditCategoryModal";
import AdminFloatingMenu from "./AdminFloatingMenu";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAllCategories, fetchToggleCategoryStatus } from "../../../store/categorySlice";
import type { Category } from "../../../types/category/category";
import AdminConfirmStatusModal from "./AdminConfirmStatusModal";
import AdminCreateCategoryModal from "./AdminCreateCategoryModal";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

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
                            // sort by id ascending (1 at top)
                            (categories ? [...categories].sort((a, b) => a.id - b.id) : []).map((c) => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-5">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{c.name}</p>
                                            <p className="text-[10px] text-[#a592c8]">ID: {c.id}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-[#a592c8]">{c.code}</td>
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
            <div className="px-8 py-4 border-t border-[#302447] flex justify-between items-center bg-white/5">
                <p className="text-xs text-[#a592c8]">Tổng cộng <span className="text-white font-bold">{(categories || []).length}</span> category</p>
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

            {statusConfirm && (
                <AdminConfirmStatusModal
                    title="Xác nhận thay đổi trạng thái"
                    message={`Bạn có chắc muốn chuyển category #${statusConfirm.id} sang trạng thái "${statusConfirm.activate ? 'Hoạt động' : 'Tạm dừng'}"?`}
                    onCancel={() => setStatusConfirm(null)}
                    confirming={confirming}
                    onConfirm={async () => {
                        setConfirming(true);
                        try {
                            await dispatch(fetchToggleCategoryStatus({ id: statusConfirm.id, activate: statusConfirm.activate })).unwrap();
                            await dispatch(fetchAllCategories({})).unwrap();
                            setStatusConfirm(null);
                        } catch (e) {
                            console.error(e);
                        } finally {
                            setConfirming(false);
                        }
                    }}
                />
            )}
            {openMenu && (
                <AdminFloatingMenu rect={openMenu.rect} items={[{ key: 'edit', label: 'Cập nhật', onClick: () => setEditingId(openMenu.id) }, { key: 'delete', label: 'Xoá', onClick: () => { /* TODO: implement delete */ } }]} onClose={() => setOpenMenu(null)} />
            )}
        </div>
    );
}

 
