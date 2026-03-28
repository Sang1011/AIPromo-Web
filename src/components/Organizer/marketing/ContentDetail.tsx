import { MdAutoAwesome, MdOutlineArchive, MdOutlineCheckCircle, MdOutlineEdit, MdOutlineSend } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { archivePost, publishApprovedPost, requestToSubmitPost, updatePostContent } from "../../../store/postSlice";
import type { PostDetail, UpdatePostContentRequest } from "../../../types/post/post";
import Block from "./Block";
import { notify } from "../../../utils/notify";
import { MARKETING_STATUS_VI } from "./MarketingTable";
import { formatDateTime } from "../../../utils/formatDateTime";
import { useState } from "react";
import ConfirmModal from "../shared/ConfirmModal";

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <span className="text-slate-200 text-sm font-semibold">{children}</span>
        </div>
    );
}

function EditDraftModal({
    post,
    onClose,
}: {
    post: PostDetail;
    onClose: () => void;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((s: RootState) => s.POST);

    const [title, setTitle] = useState(post.title);
    const [body, setBody] = useState(post.body);

    const handleSave = async () => {
        const data: UpdatePostContentRequest = {
            title,
            body,
            promptUsed: post.promptUsed,
            aiModel: post.aiModel,
            aiTokensUsed: post.aiTokensUsed,
            trackingToken: post.trackingToken,
        };
        try {
            await dispatch(updatePostContent({ postId: post.postId, data })).unwrap();
            notify.success("Cập nhật bản nháp thành công!");
            onClose();
        } catch (err: any) {
            notify.error(err?.message || "Cập nhật thất bại");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-[#0B0B12] border border-slate-800 rounded-[32px] p-8 w-full max-w-2xl space-y-6 shadow-2xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <MdOutlineEdit className="text-primary" />
                        Chỉnh sửa bản nháp
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-2xl leading-none">×</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Tiêu đề
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl
                                       text-slate-100 px-4 py-3 text-sm
                                       focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Nội dung
                        </label>
                        <textarea
                            rows={10}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl
                                       text-slate-100 px-4 py-3 text-sm resize-none
                                       focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400
                                   border border-slate-700 hover:border-slate-500 transition-all"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading.updateContent}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold
                                   bg-primary text-white hover:bg-primary/90
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   shadow-lg shadow-primary/30 transition-all"
                    >
                        {loading.updateContent ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ContentDetail({
    post,
    loading,
    error,
}: {
    post: PostDetail | null;
    loading: boolean;
    error: string | null;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading: postLoading } = useSelector((s: RootState) => s.POST);
    const [showEditModal, setShowEditModal] = useState(false);
    const statusInfo = post ? (MARKETING_STATUS_VI[post.status] ?? { label: post.status, className: "" }) : null;
    const [showConfirm, setShowConfirm] = useState(false);
    const canSubmit = post?.canSubmit && post.status === "Draft";
    const canPublish = post?.canPublish && post.status === "Approved";
    const canEdit = post?.canEdit && post.status === "Draft";
    const canArchive = post?.canArchive && post.status === "Published";

    return (
        <section className="space-y-6 pb-16">
            {/* Edit modal */}
            {showEditModal && post && (
                <EditDraftModal post={post} onClose={() => setShowEditModal(false)} />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="w-1.5 h-6 bg-primary rounded-full mr-3" />
                    Nội dung Quảng cáo
                </h2>
                {post && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary
                                     text-[11px] font-bold rounded-xl border border-primary/20">
                        <MdAutoAwesome className="text-base" />
                        Được tạo bởi AI
                    </span>
                )}
            </div>

            {loading && (
                <p className="text-slate-500 text-sm animate-pulse px-2">Đang tải nội dung...</p>
            )}
            {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    {error}
                </p>
            )}

            {post && (
                <div className="space-y-6">
                    {/* Meta grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        <MetaItem label="Trạng thái">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase border ${statusInfo?.className}`}>
                                {statusInfo?.label}
                            </span>
                        </MetaItem>
                        <MetaItem label="Phiên bản">v{post.version}</MetaItem>
                        <MetaItem label="Nền tảng">{post.platform || "—"}</MetaItem>
                        <MetaItem label="Ngày tạo">{formatDateTime(post.createdAt)}</MetaItem>
                        {post.modifiedAt && (
                            <MetaItem label="Cập nhật lần cuối">{formatDateTime(post.modifiedAt)}</MetaItem>
                        )}
                        {post.publishedAt && (
                            <MetaItem label="Ngày đăng">{formatDateTime(post.publishedAt)}</MetaItem>
                        )}
                        {post.aiModel && (
                            <MetaItem label="AI Model">{post.aiModel}</MetaItem>
                        )}
                        {post.aiTokensUsed > 0 && (
                            <MetaItem label="Tokens dùng">{post.aiTokensUsed.toLocaleString()}</MetaItem>
                        )}
                    </div>

                    {/* Rejection reason */}
                    {post.rejectionReason && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
                            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Lý do từ chối</p>
                            <p className="text-red-300 text-sm">{post.rejectionReason}</p>
                        </div>
                    )}

                    {/* Content */}
                    <div className="glass rounded-[32px] p-8 border border-slate-800/50 space-y-8">
                        <Block label="Tiêu đề nội dung">{post.title}</Block>
                        <Block label="Nội dung chi tiết">
                            <p className="whitespace-pre-wrap leading-relaxed text-sm text-slate-200">{post.body}</p>
                        </Block>
                        {post.trackingToken && (
                            <Block label="Tracking Token">
                                <p className="text-slate-500 text-xs font-mono break-all">{post.trackingToken}</p>
                            </Block>
                        )}
                        {post.externalPostUrl && (
                            <Block label="Link bài đăng">
                                <a href={post.externalPostUrl} target="_blank" rel="noreferrer"
                                    className="text-primary text-sm hover:underline break-all">
                                    {post.externalPostUrl}
                                </a>
                            </Block>
                        )}
                        {post.promptUsed && (
                            <Block label="Prompt đã dùng">
                                <p className="text-slate-500 text-xs leading-relaxed whitespace-pre-wrap font-mono">{post.promptUsed}</p>
                            </Block>
                        )}
                    </div>

                    {/* Action buttons */}
                    {(canEdit || canSubmit || canPublish || canArchive) && (
                        <div className="flex justify-end gap-3 flex-wrap">
                            {/* Draft: Chỉnh sửa */}
                            {canEdit && (
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm
                                               border border-slate-700 text-slate-300
                                               hover:border-slate-500 hover:text-white transition-all"
                                >
                                    <MdOutlineEdit className="text-base" />
                                    Chỉnh sửa
                                </button>
                            )}

                            {/* Draft: Yêu cầu duyệt */}
                            {canSubmit && (
                                <button
                                    onClick={async () => {
                                        try {
                                            await dispatch(requestToSubmitPost(post.postId)).unwrap();
                                            notify.success("Đã gửi yêu cầu duyệt bài đăng!");
                                        } catch (err: any) {
                                            notify.error(err?.message || "Gửi yêu cầu thất bại");
                                        }
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm
                                               bg-yellow-500/10 text-yellow-400 border border-yellow-500/30
                                               hover:bg-yellow-500/20 transition-all"
                                >
                                    <MdOutlineSend className="text-base" />
                                    Yêu cầu duyệt
                                </button>
                            )}

                            {/* Approved: Đăng công khai */}
                            {canPublish && (
                                <button
                                    onClick={async () => {
                                        try {
                                            await dispatch(publishApprovedPost(post.postId)).unwrap();
                                            notify.success("Đăng bài thành công!");
                                        } catch (err: any) {
                                            notify.error(err?.message || "Đăng bài thất bại");
                                        }
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm
                                               bg-primary text-white border border-primary
                                               hover:bg-primary/90 active:scale-95
                                               shadow-lg shadow-primary/40 transition-all"
                                >
                                    <MdOutlineCheckCircle className="text-base" />
                                    Đăng bài lên công khai
                                </button>
                            )}

                            {/* Published: Lưu trữ */}
                            {canArchive && (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    disabled={postLoading.archive}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm
                                               bg-slate-800 text-slate-400 border border-slate-700
                                               hover:bg-slate-700 hover:text-slate-200
                                               disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <MdOutlineArchive className="text-base" />
                                    {postLoading.archive ? "Đang lưu trữ..." : "Lưu trữ bài đăng"}
                                </button>
                            )}
                        </div>
                    )}
                    <ConfirmModal
                        open={showConfirm}
                        title="Lưu trữ bài đăng"
                        description="Bạn có chắc muốn lưu trữ bài đăng này? Hành động này có thể không hoàn tác."
                        confirmText="Lưu trữ"
                        loading={postLoading.archive}
                        onCancel={() => setShowConfirm(false)}
                        onConfirm={async () => {
                            try {
                                await dispatch(archivePost(post!.postId)).unwrap();
                                notify.success("Đã lưu trữ bài đăng!");
                                setShowConfirm(false);
                            } catch (err: any) {
                                notify.error(err?.message || "Lưu trữ thất bại");
                            }
                        }}
                    />
                </div>
            )}
        </section>
    );
}