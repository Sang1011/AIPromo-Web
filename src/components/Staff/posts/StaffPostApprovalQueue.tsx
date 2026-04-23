import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAdminPosts, approveAdminPost, rejectAdminPost, fetchPostDetail, clearPostDetail } from "../../../store/postSlice";
import { FaArrowsRotate } from "react-icons/fa6";
import { interceptorAPI } from "../../../utils/attachInterceptors";
import toast from "react-hot-toast";
import StaffPostApprovalCard from "./StaffPostApprovalCard";
import StaffPostApprovalPagination from "./StaffPostApprovalPagination";
import type { AdminPostItem } from "../../../types/post/post";

const pageSize = 10;

const tabs = [
    { key: "Pending", label: "Chờ duyệt" },
    { key: "Approved", label: "Đã duyệt" },
    { key: "Published", label: "Đã đăng" },
    { key: "Rejected", label: "Bị từ chối" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

// ─── Detail Modal ─────────────────────────────────────────────────────────
function PostDetailModal({
    postId,
    onClose,
}: {
    postId: string;
    onClose: () => void;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const data = useSelector((state: RootState) => state.POST.postDetail);
    const loading = useSelector((state: RootState) => state.POST.loading.fetchDetail);
    const error = useSelector((state: RootState) => state.POST.error.fetchDetail);

    useEffect(() => {
        if (!postId) return;
        dispatch(fetchPostDetail(postId));
        return () => {
            dispatch(clearPostDetail());
        };
    }, [dispatch, postId]);

    const statusColors: Record<string, string> = {
        Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        Approved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        Published: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
        Rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
    };

    const statusLabels: Record<string, string> = {
        Pending: "Chờ duyệt",
        Approved: "Đã duyệt",
        Published: "Đã đăng",
        Rejected: "Bị từ chối",
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
                className="absolute inset-0"
                onClick={onClose}
            />
            <div className="relative w-full max-w-2xl rounded-2xl border border-primary/10 bg-[#1a1530] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between shrink-0">
                    <h3 className="text-lg font-bold text-white">Chi tiết bài đăng</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 px-6 py-5">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-fuchsia-500 border-r-transparent" />
                            <p className="text-slate-400 text-sm mt-3">Đang tải...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Title + Status */}
                            <div>
                                <h4 className="text-xl font-bold text-white mb-3">{data.title}</h4>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[data.status] ?? "bg-slate-700 text-slate-300"}`}>
                                        {statusLabels[data.status] ?? data.status}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {formatDateDisplay(data.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Image */}
                            {data.imageUrl && (
                                <div className="rounded-xl overflow-hidden border border-slate-700/50">
                                    <img src={data.imageUrl} alt={data.title} className="w-full h-auto object-cover max-h-64" />
                                </div>
                            )}

                            {/* Content */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Nội dung</label>
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{data.body}</p>
                                </div>
                            </div>

                            {/* AI Info */}
                            {(data.promptUsed || data.aiModel) && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Thông tin AI</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {data.aiModel && (
                                            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                                                <p className="text-[10px] text-slate-500 uppercase mb-1">AI Model</p>
                                                <p className="text-sm text-white font-medium">{data.aiModel}</p>
                                            </div>
                                        )}
                                        {data.aiTokensUsed != null && (
                                            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                                                <p className="text-[10px] text-slate-500 uppercase mb-1">Tokens dùng</p>
                                                <p className="text-sm text-white font-medium">{data.aiTokensUsed.toLocaleString()}</p>
                                            </div>
                                        )}
                                        {data.promptUsed && (
                                            <div className="col-span-2 bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                                                <p className="text-[10px] text-slate-500 uppercase mb-1">Prompt đã dùng</p>
                                                <p className="text-sm text-slate-300">{data.promptUsed}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {data.rejectionReason && (
                                <div>
                                    <label className="block text-xs font-semibold text-red-400 mb-2 uppercase tracking-wider">Lý do từ chối</label>
                                    <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                                        <p className="text-sm text-red-300">{data.rejectionReason}</p>
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="pt-2 border-t border-slate-700/50">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase mb-1">Phiên bản</p>
                                        <p className="text-sm text-slate-300">v{data.version ?? 1}</p>
                                    </div>
                                    {data.modifiedAt && (
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase mb-1">Cập nhật lần cuối</p>
                                            <p className="text-sm text-slate-300">{formatDateDisplay(data.modifiedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── Approve Confirm Modal ───────────────────────────────────────────────
function ApproveConfirmModal({
    onConfirm,
    onCancel,
}: {
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-primary/10 bg-[#1a1530] p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Xác nhận duyệt</h3>
                <p className="text-sm text-slate-400 mb-6">
                    Bạn có chắc chắn muốn duyệt bài đăng này?
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 rounded-xl bg-fuchsia-600 text-white text-xs font-bold hover:bg-fuchsia-500 transition-colors"
                    >
                        Xác nhận duyệt
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── Reject Confirm Modal ────────────────────────────────────────────────
function RejectConfirmModal({
    onConfirm,
    onCancel,
}: {
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}) {
    const [reason, setReason] = useState("");

    return createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-primary/10 bg-[#1a1530] p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Xác nhận từ chối</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Bạn có chắc chắn muốn từ chối bài đăng này?
                </p>
                <div className="mb-6">
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                        Lý do từ chối
                    </label>
                    <textarea
                        className="w-full rounded-lg bg-slate-900 border border-slate-700 text-white text-sm p-3 resize-none focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-colors"
                        rows={3}
                        placeholder="Nhập lý do từ chối..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => onConfirm(reason || "Không phù hợp tiêu chuẩn")}
                        className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-colors"
                    >
                        Xác nhận từ chối
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── Main Queue Component ────────────────────────────────────────────────
interface StaffPostApprovalQueueProps {
    onReload: () => void;
}

export default function StaffPostApprovalQueue({
    onReload,
}: StaffPostApprovalQueueProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { adminPosts, adminPagination, loading } = useSelector(
        (state: RootState) => state.POST
    );
    const staffId = useSelector(
        (state: RootState) => (state.AUTH.currentInfor as any)?.userId
    );

    const [activeTab, setActiveTab] = useState<TabKey>("Pending");
    const [currentPage, setCurrentPage] = useState(1);

    // Store count per tab status
    const [tabCounts, setTabCounts] = useState<Record<string, number>>({
        Pending: 0,
        Approved: 0,
        Published: 0,
        Rejected: 0,
    });

    // Confirm modal state
    const [approveTarget, setApproveTarget] = useState<string | null>(null);
    const [rejectTarget, setRejectTarget] = useState<string | null>(null);
    const [detailPostId, setDetailPostId] = useState<string | null>(null);

    // Fetch counts for all tabs using direct service calls (not Redux)
    // to avoid polluting the main adminPosts list
    const fetchTabCounts = useCallback(async () => {
        const statuses = ["Pending", "Approved", "Published", "Rejected"] as const;
        const results = await Promise.all(
            statuses.map(async (status) => {
                try {
                    const res = await interceptorAPI().get("/admin/posts", {
                        params: {
                            PageNumber: 1,
                            PageSize: 1,
                            SortColumn: "CreatedAt",
                            SortOrder: "desc",
                            Status: status,
                        },
                    });
                    return { status, count: res.data.data?.totalCount ?? 0 };
                } catch {
                    return { status, count: 0 };
                }
            })
        );
        setTabCounts((prev) => {
            const next = { ...prev };
            results.forEach((r) => {
                next[r.status] = r.count;
            });
            return next;
        });
    }, []);

    useEffect(() => {
        fetchTabCounts();
    }, []);

    useEffect(() => {
        dispatch(
            fetchAdminPosts({
                PageNumber: currentPage,
                PageSize: pageSize,
                SortColumn: "CreatedAt",
                SortOrder: "desc",
                Status: activeTab,
            })
        );
    }, [dispatch, activeTab, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    // Handlers open modals — actual dispatch happens in modal confirm
    const handleApprove = (id: string) => {
        setApproveTarget(id);
    };

    const handleReject = (id: string) => {
        setRejectTarget(id);
    };

    // Modal confirm callbacks
    const handleApproveConfirm = () => {
        if (!approveTarget || !staffId) return;
        dispatch(approveAdminPost({ postId: approveTarget, adminId: staffId }))
            .then((result) => {
                if (approveAdminPost.fulfilled.match(result)) {
                    toast.success("Đã duyệt bài đăng thành công");
                    dispatch(
                        fetchAdminPosts({
                            PageNumber: currentPage,
                            PageSize: pageSize,
                            SortColumn: "CreatedAt",
                            SortOrder: "desc",
                            Status: activeTab,
                        })
                    );
                    fetchTabCounts();
                    onReload();
                } else {
                    toast.error("Không thể duyệt bài đăng");
                }
            })
            .finally(() => setApproveTarget(null));
    };

    const handleRejectConfirm = (reason: string) => {
        if (!rejectTarget || !staffId) return;
        dispatch(
            rejectAdminPost({ postId: rejectTarget, adminId: staffId, reason })
        )
            .then((result) => {
                if (rejectAdminPost.fulfilled.match(result)) {
                    toast.success("Đã từ chối bài đăng");
                    dispatch(
                        fetchAdminPosts({
                            PageNumber: currentPage,
                            PageSize: pageSize,
                            SortColumn: "CreatedAt",
                            SortOrder: "desc",
                            Status: activeTab,
                        })
                    );
                    fetchTabCounts();
                    onReload();
                } else {
                    toast.error("Không thể từ chối bài đăng");
                }
            })
            .finally(() => setRejectTarget(null));
    };

    const handleView = (id: string) => {
        setDetailPostId(id);
    };

    const handleReReview = (id: string) => {
        if (!staffId) return;
        dispatch(approveAdminPost({ postId: id, adminId: staffId }))
            .then((result) => {
                if (approveAdminPost.fulfilled.match(result)) {
                    toast.success("Đã duyệt lại bài đăng thành công");
                    dispatch(
                        fetchAdminPosts({
                            PageNumber: currentPage,
                            PageSize: pageSize,
                            SortColumn: "CreatedAt",
                            SortOrder: "desc",
                            Status: activeTab,
                        })
                    );
                    fetchTabCounts();
                    onReload();
                } else {
                    toast.error("Không thể duyệt lại bài đăng");
                }
            });
    };

    return (
        <div className="space-y-8">
            {/* Header + Tabs */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white">
                        Duyệt bài đăng Marketing
                    </h2>
                    <p className="text-slate-400">
                        Kiểm duyệt nội dung và theo dõi phân phối đa nền tảng
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg border border-primary/10">
                        {tabs.map((tab) => {
                            const count = tabCounts[tab.key] ?? 0;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
                                        activeTab === tab.key
                                            ? "bg-fuchsia-500 text-white"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    {tab.label}
                                    {count > 0 ? ` (${count})` : ""}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => {
                            dispatch(
                                fetchAdminPosts({
                                    PageNumber: currentPage,
                                    PageSize: pageSize,
                                    SortColumn: "CreatedAt",
                                    SortOrder: "desc",
                                    Status: activeTab,
                                })
                            );
                            fetchTabCounts();
                        }}
                        disabled={loading.fetchAdminList}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaArrowsRotate className={`text-xs ${loading.fetchAdminList ? "animate-spin" : ""}`} />
                        Reload
                    </button>
                </div>
            </div>

            {/* Loading state */}
            {loading.fetchAdminList && (
                <div className="text-center py-16">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-fuchsia-500 border-r-transparent" />
                </div>
            )}

            {/* Card Grid */}
            {!loading.fetchAdminList && adminPosts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {adminPosts.map((post: AdminPostItem) => (
                        <StaffPostApprovalCard
                            key={post.id}
                            id={post.id}
                            title={post.title}
                            description={post.body}
                            imageUrl={post.imageUrl ?? ""}
                            date={formatDate(post.createdAt)}
                            status={mapStatus(post.status)}
                            rejectionReason={post.rejectionReason ?? undefined}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onView={handleView}
                            onReReview={handleReReview}
                        />
                    ))}
                </div>
            ) : (
                !loading.fetchAdminList && (
                    <div className="text-center py-16">
                        <p className="text-slate-500 text-lg">
                            Không có bài đăng nào trong trạng thái này.
                        </p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading.fetchAdminList &&
                adminPagination &&
                adminPagination.totalCount > 0 && (
                    <StaffPostApprovalPagination
                        currentPage={adminPagination.pageNumber}
                        totalPages={adminPagination.totalPages}
                        startItem={adminPagination.currentStartIndex}
                        endItem={adminPagination.currentEndIndex}
                        onPageChange={handlePageChange}
                    />
                )}

            {/* Confirm Modals */}
            {approveTarget && (
                <ApproveConfirmModal
                    onConfirm={handleApproveConfirm}
                    onCancel={() => setApproveTarget(null)}
                />
            )}
            {rejectTarget && (
                <RejectConfirmModal
                    onConfirm={handleRejectConfirm}
                    onCancel={() => setRejectTarget(null)}
                />
            )}
            {detailPostId && (
                <PostDetailModal
                    postId={detailPostId}
                    onClose={() => setDetailPostId(null)}
                />
            )}
        </div>
    );
}

function mapStatus(
    status: string
): "pending" | "approved" | "published" | "rejected" {
    switch (status) {
        case "Pending":
            return "pending";
        case "Approved":
            return "approved";
        case "Published":
            return "published";
        case "Rejected":
            return "rejected";
        default:
            return "pending";
    }
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${hh}:${mm}, ${dd}/${mo}/${yyyy}`;
}

function formatDateDisplay(iso?: string | Date | null): string {
    if (!iso) return "";
    const d = iso instanceof Date ? iso : new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${hh}:${mm}, ${dd}/${mo}/${yyyy}`;
}
