import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAdminPosts, approveAdminPost, rejectAdminPost } from "../../../store/postSlice";
import { FaArrowsRotate } from "react-icons/fa6";
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

// ─── Approve Confirm Modal ───────────────────────────────────────────────
function ApproveConfirmModal({
    onConfirm,
    onCancel,
}: {
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
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
        </div>
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
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
        </div>
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

    // Fetch counts for all tabs
    const fetchTabCounts = useCallback(() => {
        (["Pending", "Approved", "Published", "Rejected"] as const).forEach(
            (status) => {
                dispatch(
                    fetchAdminPosts({
                        PageNumber: 1,
                        PageSize: 1,
                        SortColumn: "CreatedAt",
                        SortOrder: "desc",
                        Status: status,
                    })
                ).then((result) => {
                    if (fetchAdminPosts.fulfilled.match(result)) {
                        setTabCounts((prev) => ({
                            ...prev,
                            [status]: result.payload.totalCount ?? 0,
                        }));
                    }
                });
            }
        );
    }, [dispatch]);

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
        console.log("View post:", id);
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
