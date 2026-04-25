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

const DIST_STATUS: Record<string, { label: string; className: string }> = {
    Sent: { label: "Đã gửi", className: "bg-green-500/10 text-green-400 border-green-500/30" },
    Pending: { label: "Đang xử lý", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
    Failed: { label: "Lỗi", className: "bg-red-500/10 text-red-400 border-red-500/30" },
};

function extractPlainText(body: string): string {
    try {
        const blocks = JSON.parse(body);
        if (!Array.isArray(blocks)) return body;
        return blocks
            .map((b: any) => {
                if (b.type === "paragraph" || b.type === "heading") return b.text ?? "";
                if (b.type === "highlight") return b.content ?? "";
                if (b.type === "list") return (b.items ?? []).join(" ");
                return "";
            })
            .filter(Boolean)
            .join(" ");
    } catch {
        return body;
    }
}

export default function MarketingTable() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { posts, pagination, loading, tableFilters: filters } = useSelector((s: RootState) => s.POST);
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
        const selectedStatus = TAB_FILTERS[idx].status;
        dispatch(setPostFilters({
            pageNumber: 1,
            ...(selectedStatus ? { status: selectedStatus } : { status: undefined })
        }));
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
                            <th className="px-8 py-5">Phân phối</th>
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
                                            {extractPlainText(post.body).slice(0, 80)}
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
                                    <td className="px-8 py-6">
                                        {post.distributions.length === 0 ? (
                                            <span className="text-slate-600 text-xs">Chưa phân phối</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5">
                                                {Object.values(
                                                    // Group theo platform, giữ lại record mới nhất (sentAt lớn nhất)
                                                    post.distributions.reduce<Record<string, typeof post.distributions[0]>>(
                                                        (acc, d) => {
                                                            const existing = acc[d.platform];
                                                            if (
                                                                !existing ||
                                                                new Date(d.sentAt ?? 0) > new Date(existing.sentAt ?? 0)
                                                            ) {
                                                                acc[d.platform] = d;
                                                            }
                                                            return acc;
                                                        },
                                                        {}
                                                    )
                                                ).map((d) => {
                                                    const s = DIST_STATUS[d.status] ?? {
                                                        label: d.status,
                                                        className: "bg-slate-800 text-slate-400 border-slate-700",
                                                    };
                                                    return (
                                                        <span
                                                            key={d.platform}
                                                            title={d.errorMessage ?? d.platform}
                                                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border flex items-center gap-1 ${s.className}`}
                                                        >
                                                            {d.platform === "Facebook" && (
                                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                                </svg>
                                                            )}
                                                            {d.platform === "Instagram" && (
                                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                                                </svg>
                                                            )}
                                                            {s.label}
                                                            {d.errorMessage && " ⚠"}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
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