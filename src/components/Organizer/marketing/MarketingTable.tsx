import { useEffect, useState } from "react";
import { MdOutlineArrowForward } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchOrganizerPosts, setPostFilters } from "../../../store/postSlice";
import type { PostStatus } from "../../../types/post/post";
import Pagination from "../shared/Pagination";

export const MARKETING_STATUS_VI: Record<string, { label: string; className: string }> = {
    Draft: { label: "Bản nháp", className: "bg-slate-800/50 text-slate-400 border-slate-700" },
    Pending: { label: "Chờ duyệt", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
    Approved: { label: "Đã duyệt", className: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    Rejected: { label: "Từ chối", className: "bg-red-500/10 text-red-400 border-red-500/30" },
    Published: { label: "Đã đăng", className: "bg-primary/20 text-primary border-primary/30" },
    Archived: { label: "Đã lưu trữ", className: "bg-slate-700/50 text-slate-500 border-slate-600" },
};

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const TAB_FILTERS: { label: string; status?: PostStatus }[] = [
    { label: "Tất cả", status: undefined },
    { label: "Bản nháp", status: "Draft" },
    { label: "Chờ duyệt", status: "Pending" },
    { label: "Đã duyệt", status: "Approved" },
    { label: "Đã đăng", status: "Published" },
    { label: "Đã lưu trữ", status: "Archived" },
];

export default function MarketingTable() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { posts, pagination, loading, filters } = useSelector((s: RootState) => s.POST);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (!eventId) return;
        dispatch(fetchOrganizerPosts({
            pageNumber: filters.pageNumber ?? 1,
            pageSize: filters.pageSize ?? 5,
            sortColumn: filters.sortColumn ?? "CreatedAt",
            sortOrder: filters.sortOrder ?? "desc",
            eventId,
            ...(filters.status ? { status: filters.status } : {}),
        }));
    }, [eventId, filters, dispatch]);

    const handleTabChange = (idx: number) => {
        setActiveTab(idx);
        dispatch(setPostFilters({ pageNumber: 1, status: TAB_FILTERS[idx].status }));
    };

    return (
        <section className="space-y-6 pb-16">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="w-1.5 h-6 bg-primary rounded-full mr-3" />
                    Danh sách Nội dung
                </h2>

                <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 gap-1 flex-wrap">
                    {TAB_FILTERS.map((tab, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleTabChange(idx)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all
                                ${activeTab === idx
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass overflow-hidden rounded-[32px] border border-slate-800/50 shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/80 text-slate-500 uppercase text-[12px] font-black tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Tiêu đề nội dung</th>
                            <th className="px-8 py-5">Trạng thái</th>
                            <th className="px-8 py-5">Phiên bản</th>
                            <th className="px-8 py-5">Ngày tạo</th>
                            <th className="px-8 py-5 text-right">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800/40">
                        {loading.fetchList ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-12 text-center text-slate-500 text-sm animate-pulse">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-12 text-center text-slate-600 text-sm">
                                    Chưa có nội dung nào.
                                </td>
                            </tr>
                        ) : posts.map((post) => {
                            const statusInfo = MARKETING_STATUS_VI[post.status] ?? { label: post.status, className: "" };
                            return (
                                <tr key={post.id} className="hover:bg-primary/[0.04] transition-all">
                                    <td className="px-8 py-6 font-bold text-white max-w-xs">
                                        <p className="truncate">{post.title}</p>
                                        <p className="text-xs text-slate-500 mt-1 font-normal truncate">
                                            {post.body.slice(0, 60)}...
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${statusInfo.className}`}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-slate-400 text-sm">
                                        v{post.version}
                                    </td>
                                    <td className="px-8 py-6 text-slate-400 text-sm">
                                        {formatDate(post.createdAt)}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => navigate(`${post.id}`)}
                                            className="text-primary hover:text-primary/80 font-bold text-sm
                                                       flex items-center justify-end gap-1 ml-auto"
                                        >
                                            <span>Xem chi tiết</span>
                                            <MdOutlineArrowForward />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination */}
                <Pagination
                    currentPage={filters.pageNumber ?? 1}
                    totalPages={pagination?.totalPages ?? 1}
                    onPageChange={(page) => dispatch(setPostFilters({ pageNumber: page }))}
                />
            </div>
        </section>
    );
}