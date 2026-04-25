import { useState } from "react";
import {
    MdAutoAwesome,
    MdFacebook,
    MdOutlineArchive,
    MdOutlineCheckCircle,
    MdOutlineEdit,
    MdOutlineError,
    MdOutlineLink,
    MdOutlineOpenInNew,
    MdOutlineSchedule,
    MdOutlineSend,
    MdOutlineWarningAmber
} from "react-icons/md";
import { RiInstagramLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import {
    archivePost,
    publishApprovedPost,
    pushPostToOtherPlatform,
    requestToSubmitPost,
} from "../../../store/postSlice";
import type { PostDetail, PostDistribution } from "../../../types/post/post";
import { formatDateTime } from "../../../utils/formatDateTime";
import { injectImageBlock } from "../../../utils/injectImageBlock";
import { notify } from "../../../utils/notify";
import { parseBodyToBlocks } from "../../../utils/renderPostContent";
import PostBlockRenderer from "../post/PostBlockRenderer";
import ConfirmModal from "../shared/ConfirmModal";
import Block from "./Block";
import { MARKETING_STATUS_VI } from "./MarketingTable";

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
    return (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );
}

// ─── MetaItem ─────────────────────────────────────────────────────────────────

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <span className="text-slate-200 text-sm font-semibold">{children}</span>
        </div>
    );
}

// ─── DistributionStatusBadge ──────────────────────────────────────────────────

function DistributionStatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
        Sent: { label: "Đã đăng", className: "bg-green-500/10 text-green-400 border-green-500/30", icon: <MdOutlineCheckCircle /> },
        Pending: { label: "Đang chờ", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: <MdOutlineSchedule /> },
        Failed: { label: "Thất bại", className: "bg-red-500/10 text-red-400 border-red-500/30", icon: <MdOutlineError /> },
        Processing: { label: "Đang xử lý", className: "bg-blue-500/10 text-blue-400 border-blue-500/30", icon: <Spinner /> },
    };
    const info = map[status] ?? { label: status, className: "bg-slate-500/10 text-slate-400 border-slate-500/30", icon: null };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${info.className}`}>
            {info.icon}{info.label}
        </span>
    );
}

// ─── LatestDistributionCard ───────────────────────────────────────────────────

function LatestDistributionCard({ distribution }: { distribution: PostDistribution }) {
    const icon = distribution.platform === "Facebook"
        ? <MdFacebook className="text-blue-400 text-xl" />
        : distribution.platform === "Instagram"
            ? <RiInstagramLine className="text-pink-400 text-xl" />
            : <MdAutoAwesome className="text-slate-400 text-xl" />;

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    {icon}
                    <span className="text-sm font-bold text-white">{distribution.platform}</span>
                </div>
                <DistributionStatusBadge status={distribution.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                {distribution.sentAt && (
                    <div className="col-span-2 flex items-center gap-1.5 text-slate-500">
                        <MdOutlineSchedule className="text-slate-600" />
                        <span>Đăng lúc: <span className="text-slate-400">{formatDateTime(distribution.sentAt)}</span></span>
                    </div>
                )}
                {distribution.externalUrl && (
                    <div className="col-span-2 flex items-center gap-1.5">
                        <MdOutlineLink className="text-slate-600 shrink-0" />
                        <a href={distribution.externalUrl} target="_blank" rel="noreferrer"
                            className="text-primary hover:underline truncate">
                            {distribution.externalUrl}
                        </a>
                    </div>
                )}
                {distribution.errorMessage && (
                    <div className="col-span-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                        <p className="text-red-400 text-xs">{distribution.errorMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── PromptUsedDisplay ────────────────────────────────────────────────────────

function PromptUsedDisplay({ promptUsed }: { promptUsed: string }) {
    const additionalMatch = promptUsed.match(/Additional requirement:\s*([\s\S]+)$/i);
    const additionalRequirement = additionalMatch ? additionalMatch[1].trim() : null;

    const toneLabels: Record<string, string> = {
        "formal, clear, and informative": "Chuyên nghiệp",
        "casual, trendy Gen Z": "Gen Z",
        "highly engaging, attention-grabbing": "Viral / FOMO",
        "elegant, premium wording": "Sang trọng",
        "concise, clean, and straight": "Tối giản",
        "bold, provocative wording": "Mạnh mẽ / Urgent",
    };

    const detectedTone = Object.entries(toneLabels)
        .find(([key]) => promptUsed.toLowerCase().includes(key.toLowerCase()))?.[1] ?? null;

    if (!additionalRequirement && !detectedTone) {
        return <p className="text-slate-500 text-xs italic">Không có yêu cầu đặc biệt.</p>;
    }

    return (
        <div className="space-y-2">
            {detectedTone && (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Giọng điệu:</span>
                    <span className="bg-primary/15 text-primary border border-primary/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {detectedTone}
                    </span>
                </div>
            )}
            {additionalRequirement && (
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Yêu cầu thêm:</span>
                    <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2.5 font-mono whitespace-pre-wrap">
                        {additionalRequirement}
                    </p>
                </div>
            )}
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Lấy distribution mới nhất theo sentAt cho từng platform */
function getLatestByPlatform(
    distributions: PostDistribution[],
    platform: string
): PostDistribution | null {
    if (!distributions?.length) return null;
    return (
        distributions
            .filter((d) => d.platform === platform)
            .sort((a, b) => {
                const ta = a.sentAt ? new Date(a.sentAt).getTime() : 0;
                const tb = b.sentAt ? new Date(b.sentAt).getTime() : 0;
                return tb - ta;
            })[0] ?? null
    );
}

/** Lấy distribution mới nhất trong tất cả platform */
function getLatestDistribution(distributions: PostDistribution[]): PostDistribution | null {
    if (!distributions?.length) return null;
    return [...distributions].sort((a, b) => {
        const ta = a.sentAt ? new Date(a.sentAt).getTime() : 0;
        const tb = b.sentAt ? new Date(b.sentAt).getTime() : 0;
        return tb - ta;
    })[0];
}

// ─── PlatformPushCard ─────────────────────────────────────────────────────────

function PlatformPushCard({
    platform,
    distribution,
    isPushing,
    pushError,
    onPush,
}: {
    platform: "Facebook" | "Instagram";
    distribution: PostDistribution | null;
    isPushing: boolean;
    pushError: string | null;
    onPush: () => void;
}) {
    const isFacebook = platform === "Facebook";
    const icon = isFacebook
        ? <MdFacebook className="text-blue-400 text-xl" />
        : <RiInstagramLine className="text-pink-400 text-xl" />;

    const brandColor = isFacebook
        ? { border: "border-blue-500/20", bg: "bg-blue-500/15", btn: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20", link: "text-blue-400", hoverBorder: "hover:border-blue-500/40 hover:text-blue-400" }
        : { border: "border-pink-500/20", bg: "bg-pink-500/15", btn: "bg-gradient-to-r from-[#e1306c] to-[#833ab4] hover:opacity-90 shadow-pink-500/20", link: "text-pink-400", hoverBorder: "hover:border-pink-500/40 hover:text-pink-400" };

    const label = isFacebook ? "Facebook" : "Instagram";
    const hasDistribution = !!distribution;

    return (
        <div className={`bg-[#0B0B12] border ${brandColor.border} rounded-[32px] px-8 py-6 space-y-4`}>
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${brandColor.bg} flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-bold text-white">Đăng lên {label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {hasDistribution
                            ? `Bài đã được phân phối lên ${label}. Bấm để đăng lại.`
                            : `Phân phối bài viết này lên ${label} của sự kiện.`}
                    </p>
                </div>
                {distribution && <DistributionStatusBadge status={distribution.status} />}
            </div>

            {distribution?.externalUrl && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2.5">
                    <MdOutlineLink className="text-slate-600 shrink-0" />
                    <a
                        href={distribution.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${brandColor.link} hover:underline truncate`}
                    >
                        {distribution.externalUrl}
                    </a>
                    <MdOutlineOpenInNew className="text-slate-600 shrink-0 ml-auto" />
                </div>
            )}

            {distribution?.errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <p className="text-red-400 text-xs">{distribution.errorMessage}</p>
                </div>
            )}

            {pushError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    {pushError}
                </p>
            )}

            <button
                onClick={onPush}
                disabled={isPushing}
                className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm text-white ${brandColor.btn} disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] shadow-lg transition-all`}
            >
                {isPushing ? (
                    <><Spinner /> Đang đăng bài...</>
                ) : (
                    <>
                        {icon}
                        {hasDistribution ? `Đăng lại lên ${label}` : `Đăng bài lên ${label}`}
                    </>
                )}
            </button>
        </div>
    );
}

// ─── Main ContentDetail ───────────────────────────────────────────────────────

export default function ContentDetail({
    post, loading, error, onReload,
}: {
    post: PostDetail | null;
    loading: boolean;
    error: string | null;
    onReload?: () => void;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading: postLoading, error: postError } = useSelector((s: RootState) => s.POST);

    const [showConfirm, setShowConfirm] = useState(false);
    const [showPushFBConfirm, setShowPushFBConfirm] = useState(false);
    const [showPushIGConfirm, setShowPushIGConfirm] = useState(false);

    const navigate = useNavigate();
    const { eventId, marketingId } = useParams<{ eventId: string; marketingId: string }>();

    const statusInfo = post ? (MARKETING_STATUS_VI[post.status] ?? { label: post.status, className: "" }) : null;

    const canSubmitBase = post?.canSubmit && post.status === "Draft";
    const hasImage = !!(post?.imageUrl);
    const canSubmit = canSubmitBase && hasImage;
    const showSubmitImageWarning = canSubmitBase && !hasImage;

    const canPublish = post?.canPublish && post.status === "Approved";
    const canEdit = post?.canEdit && post.status === "Draft";
    const canArchive = post?.canArchive && post.status === "Published";
    const canPush = post?.status === "Published";

    const rawBlocks = parseBodyToBlocks(post?.body ?? "");
    const blocks = injectImageBlock(rawBlocks, post?.imageUrl ?? null);
    const isBlockContent = blocks.length > 0;

    const latestDistribution = post ? getLatestDistribution(post.distributions ?? []) : null;
    const facebookDistribution = post ? getLatestByPlatform(post.distributions ?? [], "Facebook") : null;
    const instagramDistribution = post ? getLatestByPlatform(post.distributions ?? [], "Instagram") : null;

    const navigateToEditor = () => {
        if (!post) return;
        navigate(`/organizer/my-events/${eventId}/marketing/${marketingId}/post-preview/${post.postId}?mode=editor`);
    };

    const navigateToPreview = () => {
        if (!post) return;
        navigate(`/organizer/my-events/${eventId}/marketing/${marketingId}/post-preview/${post.postId}`);
    };

    const handlePushFacebook = async () => {
        if (!post) return;
        try {
            await dispatch(pushPostToOtherPlatform({
                postId: post.postId,
                platform: "Facebook",
                isRetry: true,
            })).unwrap();
            notify.success("Đã đẩy bài lên Facebook thành công!");
            setTimeout(() => onReload?.(), 1000);
            setShowPushFBConfirm(false);
        } catch (err: any) {
            notify.error(err?.message || "Đẩy bài lên Facebook thất bại");
            setShowPushFBConfirm(false);
        }
    };

    const handlePushInstagram = async () => {
        if (!post) return;
        try {
            await dispatch(pushPostToOtherPlatform({
                postId: post.postId,
                platform: "Instagram",
                isRetry: true,
            })).unwrap();
            notify.success("Đã đẩy bài lên Instagram thành công!");
            setTimeout(() => onReload?.(), 1000);
            setShowPushIGConfirm(false);
        } catch (err: any) {
            notify.error(err?.message || "Đẩy bài lên Instagram thất bại");
            setShowPushIGConfirm(false);
        }
    };

    return (
        <section className="space-y-6 pb-16">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="w-1.5 h-6 bg-primary rounded-full mr-3" />
                    Nội dung Quảng cáo
                </h2>
                {post && post.aiModel && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-[11px] font-bold rounded-xl border border-primary/20">
                        <MdAutoAwesome className="text-base" />
                        Được tạo bởi AI
                    </span>
                )}
            </div>

            {loading && <p className="text-slate-500 text-sm animate-pulse px-2">Đang tải nội dung...</p>}
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
                        <MetaItem label="Nền tảng">AIPromo</MetaItem>
                        <MetaItem label="Ngày tạo">{formatDateTime(post.createdAt)}</MetaItem>
                        {post.modifiedAt && <MetaItem label="Cập nhật lần cuối">{formatDateTime(post.modifiedAt)}</MetaItem>}
                        {post.publishedAt && <MetaItem label="Ngày đăng">{formatDateTime(post.publishedAt)}</MetaItem>}
                        {post.aiModel && <MetaItem label="AI Model">{post.aiModel}</MetaItem>}
                        {post.aiTokensUsed > 0 && <MetaItem label="Tokens dùng">{post.aiTokensUsed.toLocaleString()}</MetaItem>}
                    </div>

                    {/* Rejection reason */}
                    {post.rejectionReason && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
                            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Lý do từ chối</p>
                            <p className="text-red-300 text-sm">{post.rejectionReason}</p>
                        </div>
                    )}

                    {/* Distribution */}
                    {latestDistribution && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-400 rounded-full" />
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Phân phối gần nhất</h3>
                                <span className="text-xs text-slate-600 ml-1">({post.distributions?.length ?? 0} nền tảng)</span>
                            </div>
                            <LatestDistributionCard distribution={latestDistribution} />
                        </div>
                    )}

                    {/* Content block */}
                    <div className="glass rounded-[32px] p-8 border border-slate-800/50 space-y-8">
                        <Block label="Tiêu đề nội dung">{post.title}</Block>
                        <Block label="Nội dung chi tiết">
                            {isBlockContent ? (
                                <div className="space-y-3">
                                    <PostBlockRenderer blocks={blocks} />
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={navigateToPreview}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-primary/40 bg-primary text-white hover:bg-primary/80 transition-all"
                                        >
                                            <MdOutlineOpenInNew className="text-sm" />
                                            Xem preview đầy đủ
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap leading-relaxed text-sm text-slate-200">{post.body}</p>
                            )}
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
                                <PromptUsedDisplay promptUsed={post.promptUsed} />
                            </Block>
                        )}
                    </div>

                    {/* Platform push cards */}
                    {canPush && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PlatformPushCard
                                platform="Facebook"
                                distribution={facebookDistribution}
                                isPushing={postLoading.pushPost}
                                pushError={postError.pushPost}
                                onPush={() => setShowPushFBConfirm(true)}
                            />
                            <PlatformPushCard
                                platform="Instagram"
                                distribution={instagramDistribution}
                                isPushing={postLoading.pushPost}
                                pushError={postError.pushPost}
                                onPush={() => setShowPushIGConfirm(true)}
                            />
                        </div>
                    )}

                    {/* Action buttons */}
                    {(canEdit || canSubmitBase || canPublish || canArchive) && (
                        <div className="space-y-3">
                            {showSubmitImageWarning && (
                                <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4">
                                    <MdOutlineWarningAmber className="text-amber-400 text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-amber-400 text-sm font-semibold">Bài đăng chưa có ảnh</p>
                                        <p className="text-amber-400/70 text-xs mt-0.5">
                                            Vui lòng thêm ảnh trước khi gửi yêu cầu duyệt.{" "}
                                            <button onClick={navigateToEditor} className="underline font-semibold hover:text-amber-300 transition">
                                                Mở editor
                                            </button>{" "}
                                            để upload hoặc tạo ảnh.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 flex-wrap">
                                {canEdit && (
                                    <button
                                        onClick={navigateToEditor}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm border border-slate-700 text-slate-300 hover:border-primary/50 hover:text-white transition-all"
                                    >
                                        <MdOutlineEdit className="text-base" /> Chỉnh sửa
                                    </button>
                                )}

                                {canSubmitBase && (
                                    <button
                                        onClick={async () => {
                                            if (!canSubmit) return;
                                            try {
                                                await dispatch(requestToSubmitPost(post.postId)).unwrap();
                                                notify.success("Đã gửi yêu cầu duyệt!");
                                                onReload?.();
                                            } catch (err: any) {
                                                notify.error(err?.message || "Gửi yêu cầu thất bại");
                                            }
                                        }}
                                        disabled={!canSubmit}
                                        title={!hasImage ? "Cần có ảnh trước khi gửi yêu cầu duyệt" : undefined}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <MdOutlineSend className="text-base" /> Yêu cầu duyệt
                                    </button>
                                )}

                                {canPublish && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await dispatch(publishApprovedPost(post.postId)).unwrap();
                                                notify.success("Đăng bài thành công!");
                                                onReload?.();
                                            } catch (err: any) {
                                                notify.error(err?.message || "Đăng bài thất bại");
                                            }
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-primary text-white border border-primary hover:bg-primary/90 active:scale-95 shadow-lg shadow-primary/40 transition-all"
                                    >
                                        <MdOutlineCheckCircle className="text-base" /> Đăng bài lên công khai
                                    </button>
                                )}

                                {canArchive && (
                                    <button
                                        onClick={() => setShowConfirm(true)}
                                        disabled={postLoading.archive}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <MdOutlineArchive className="text-base" />
                                        {postLoading.archive ? "Đang lưu trữ..." : "Lưu trữ bài đăng"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Confirm modals */}
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
                                notify.success("Đã lưu trữ!");
                                setShowConfirm(false);
                                navigate(`/organizer/my-events/${eventId}/marketing`, { replace: true });
                            } catch (err: any) {
                                notify.error(err?.message || "Lưu trữ thất bại");
                            }
                        }}
                    />

                    <ConfirmModal
                        open={showPushFBConfirm}
                        title="Đăng bài lên Facebook"
                        description={facebookDistribution
                            ? "Bài đã được đăng lên Facebook trước đó. Bạn có chắc muốn đăng lại không?"
                            : "Xác nhận đăng bài viết này lên trang Facebook của sự kiện?"}
                        confirmText={facebookDistribution ? "Đăng lại" : "Đăng bài"}
                        loading={postLoading.pushPost}
                        onCancel={() => setShowPushFBConfirm(false)}
                        onConfirm={handlePushFacebook}
                    />

                    <ConfirmModal
                        open={showPushIGConfirm}
                        title="Đăng bài lên Instagram"
                        description={instagramDistribution
                            ? "Bài đã được đăng lên Instagram trước đó. Bạn có chắc muốn đăng lại không?"
                            : "Xác nhận đăng bài viết này lên Instagram của sự kiện?"}
                        confirmText={instagramDistribution ? "Đăng lại" : "Đăng bài"}
                        loading={postLoading.pushPost}
                        onCancel={() => setShowPushIGConfirm(false)}
                        onConfirm={handlePushInstagram}
                    />
                </div>
            )}
        </section>
    );
}