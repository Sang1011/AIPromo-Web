import { useEffect, useRef, useState } from "react";
import {
    MdAutoAwesome,
    MdFacebook,
    MdOutlineArchive,
    MdOutlineBolt,
    MdOutlineCheckCircle,
    MdOutlineClose,
    MdOutlineCloudUpload,
    MdOutlineEdit,
    MdOutlineError,
    MdOutlineImage,
    MdOutlineLink,
    MdOutlineOpenInNew,
    MdOutlineRefresh,
    MdOutlineSchedule,
    MdOutlineSend,
    MdOutlineSmartToy,
    MdOutlineWarningAmber
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import {
    archivePost,
    clearGeneratedDraft,
    clearGeneratedImageUrl,
    generateContentPostUsingAI,
    generateImage,
    publishApprovedPost,
    pushPostToOtherPlatform,
    requestToSubmitPost,
    updatePostContent,
    uploadImagePost,
} from "../../../store/postSlice";
import type {
    ContentBlock,
    PostDetail,
    PostDistribution,
    UpdatePostContentRequest,
} from "../../../types/post/post";
import { buildContextPrompt } from "../../../utils/buildContextPrompt";
import { formatDateTime } from "../../../utils/formatDateTime";
import { injectImageBlock } from "../../../utils/injectImageBlock";
import { notify } from "../../../utils/notify";
import { parseBodyToBlocks, serializeBlocksToBody } from "../../../utils/renderPostContent";
import PostBlockRenderer from "../post/PostBlockRenderer";
import ConfirmModal from "../shared/ConfirmModal";
import AIContentTab from "./AIContentTab";
import AIImageTab from "./AIImageTab";
import Block from "./Block";
import BlockEditor from "./BlockEditor";
import { MARKETING_STATUS_VI } from "./MarketingTable";
import UploadImageSection from "./UploadImageSection";

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
        : <MdOutlineCloudUpload className="text-slate-400 text-xl" />;

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

// ─── GeneratePreviewModal ─────────────────────────────────────────────────────

function GeneratePreviewModal({ blocks, title, onConfirm, onCancel, loading }: {
    blocks: ContentBlock[];
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="bg-[#0B0B12] border border-slate-800 rounded-[32px] p-8 w-full max-w-2xl shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between shrink-0">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <MdOutlineSmartToy className="text-primary" /> Xác nhận nội dung mới
                    </h3>
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 text-2xl leading-none">
                        <MdOutlineClose />
                    </button>
                </div>
                <p className="text-xs text-slate-500 shrink-0">
                    Xem lại nội dung vừa tạo. Nhấn{" "}
                    <span className="text-primary font-semibold">Áp dụng</span> để cập nhật bài đăng hiện tại.
                </p>
                <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề</p>
                        <p className="text-slate-100 font-semibold text-sm bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                            {title}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nội dung</p>
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-4">
                            {blocks.length > 0
                                ? <PostBlockRenderer blocks={blocks} />
                                : <p className="text-slate-400 text-sm">Không có nội dung để hiển thị.</p>}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2 shrink-0">
                    <button onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 border border-slate-700 hover:border-slate-500 transition-all">
                        Huỷ
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
                        {loading ? <><Spinner /> Đang áp dụng...</> : "✓ Áp dụng nội dung này"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── InlineGenerateSection ────────────────────────────────────────────────────

type ActiveTab = "content" | "image" | "manual";

function InlineGenerateSection({
    post,
    onApplied,
    initialTab = "content",
}: {
    post: PostDetail;
    onApplied: () => void;
    initialTab?: ActiveTab;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const { generatedDraft, generatedImageUrl, loading } = useSelector((s: RootState) => s.POST);
    const error = useSelector((s: RootState) => s.POST.error);

    const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<{ blocks: ContentBlock[]; title: string } | null>(null);

    // Manual editor ref
    const manualEditorRef = useRef<{ getBlocks: () => ContentBlock[] } | null>(null);
    const [manualTitle, setManualTitle] = useState(post.title);

    useEffect(() => {
        return () => {
            dispatch(clearGeneratedDraft());
            dispatch(clearGeneratedImageUrl());
        };
    }, []);

    // Sync tab nếu initialTab thay đổi từ ngoài (ví dụ nút "Chỉnh sửa" trigger)
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const handleGenerate = (tone: string, userPrompt: string) => {
        const context = buildContextPrompt({ title: post.title } as any, tone || undefined);
        const finalPrompt = userPrompt.trim()
            ? `${context}\n\nAdditional requirement: ${userPrompt.trim()}`
            : context;
        dispatch(generateContentPostUsingAI({ eventId: post.eventId, userPromptRequirement: finalPrompt }));
    };

    const handleClearImage = () => {
        setSelectedImageUrl(null);
        setPendingImageFile(null);
    };

    const handleConfirmApply = async () => {
        if (!previewData) return;

        let resolvedImageUrl: string | undefined;
        if (pendingImageFile) {
            try {
                const res = await dispatch(uploadImagePost({
                    postId: post.postId,
                    imageFile: pendingImageFile,
                    folder: "post-images",
                })).unwrap();
                resolvedImageUrl = res.imageUrl;
            } catch {
                notify.error("Upload ảnh thất bại");
                return;
            }
        } else if (selectedImageUrl?.startsWith("http")) {
            resolvedImageUrl = selectedImageUrl;
        }

        const data: UpdatePostContentRequest = {
            title: previewData.title || post.title,
            body: serializeBlocksToBody(previewData.blocks),
            imageUrl: resolvedImageUrl,
            promptUsed: generatedDraft?.promptUsed ?? post.promptUsed,
            aiModel: generatedDraft?.aiModel ?? post.aiModel,
            aiTokensUsed: generatedDraft?.aiTokensUsed ?? post.aiTokensUsed,
            trackingToken: post.trackingToken,
        };

        try {
            await dispatch(updatePostContent({ postId: post.postId, data })).unwrap();
            notify.success("Đã cập nhật nội dung bài đăng!");
            setPreviewData(null);
            setPendingImageFile(null);
            dispatch(clearGeneratedDraft());
            dispatch(clearGeneratedImageUrl());
            onApplied();
        } catch (err: any) {
            notify.error(err?.message || "Cập nhật thất bại");
        }
    };

    const handleManualPreview = () => {
        const blocks = manualEditorRef.current?.getBlocks() ?? [];
        if (!blocks.length) return;
        setPreviewData({
            blocks: injectImageBlock(blocks, selectedImageUrl),
            title: manualTitle,
        });
    };

    const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
        { id: "content", label: "Tạo nội dung AI", icon: <MdOutlineBolt className="text-base" /> },
        { id: "image", label: "Tạo ảnh AI", icon: <MdOutlineImage className="text-base" /> },
        { id: "manual", label: "Tự soạn", icon: <MdOutlineEdit className="text-base" /> },
    ];

    return (
        <>
            <div className="bg-[#0B0B12] border border-primary/20 rounded-[32px] overflow-hidden shadow-xl shadow-primary/5">
                {/* Header */}
                <div className="px-8 pt-7 pb-4 border-b border-slate-800/60">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                            <MdOutlineSmartToy className="text-primary text-lg" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Chỉnh sửa / Generate lại bằng AI</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Nội dung mới sẽ thay thế nội dung hiện tại sau khi bạn xác nhận.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex border-b border-slate-800 px-8">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2
                                    ${isActive ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                            >
                                {tab.icon}
                                {tab.label}
                                {tab.id === "image" && selectedImageUrl && (
                                    <span className="w-2 h-2 rounded-full bg-green-400 ml-0.5" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="px-8 py-6">
                    {activeTab === "content" && (
                        <AIContentTab
                            generatedDraft={generatedDraft}
                            loading={loading}
                            error={error}
                            selectedImageUrl={selectedImageUrl}
                            showUploadSection={true}
                            onGenerate={handleGenerate}
                            onPreview={(blocks, title) =>
                                setPreviewData({
                                    blocks: injectImageBlock(blocks, selectedImageUrl),
                                    title,
                                })
                            }
                            onSelectImage={setSelectedImageUrl}
                            onClearImage={handleClearImage}
                            onFileSelected={(f) => setPendingImageFile(f)}
                        />
                    )}

                    {activeTab === "image" && (
                        <AIImageTab
                            generatedImageUrl={generatedImageUrl}
                            selectedImageUrl={selectedImageUrl}
                            loading={loading}
                            error={error}
                            onGenerate={(p, a, s) =>
                                dispatch(generateImage({ prompt: p, aspectRatio: a, imageSize: s }))
                            }
                            onSelectImage={(url) => {
                                setSelectedImageUrl(url);
                                setPendingImageFile(null);
                            }}
                            onClearImage={handleClearImage}
                        />
                    )}

                    {activeTab === "manual" && (
                        <div className="space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-400 mb-2">
                                    Tiêu đề bài đăng <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={manualTitle}
                                    onChange={(e) => setManualTitle(e.target.value)}
                                    className="w-full bg-background-dark border border-slate-800 rounded-xl
                                               text-slate-100 placeholder:text-slate-600 px-4 py-3 text-sm
                                               focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Upload image for manual */}
                            <div className="bg-slate-900/50 border border-slate-700/60 rounded-2xl px-4 py-3.5 space-y-3">
                                <p className="text-xs text-slate-400">
                                    <span className="text-primary font-semibold">💡 Ảnh:</span>{" "}
                                    Upload từ máy hoặc chọn ảnh AI từ tab "Tạo ảnh AI".
                                </p>
                                <UploadImageSection
                                    selectedImageUrl={selectedImageUrl}
                                    onSelectImage={setSelectedImageUrl}
                                    onClearImage={handleClearImage}
                                    onFileSelected={(f) => setPendingImageFile(f)}
                                />
                            </div>

                            {/* Block editor — load từ post hiện tại, truyền postId để drag save Firebase */}
                            <BlockEditor
                                editorRef={manualEditorRef}
                                initialBlocks={parseBodyToBlocks(post.body)}
                                postId={post.postId}
                            />

                            {/* Actions */}
                            <button
                                type="button"
                                onClick={handleManualPreview}
                                className="w-full border border-primary text-primary hover:bg-primary hover:text-white
                                           py-3 rounded-2xl font-bold text-sm
                                           flex items-center justify-center gap-2 transition-all"
                            >
                                Xem preview & Áp dụng
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview modal */}
            {previewData && (
                <GeneratePreviewModal
                    blocks={previewData.blocks}
                    title={previewData.title}
                    onConfirm={handleConfirmApply}
                    onCancel={() => setPreviewData(null)}
                    loading={!!loading.updateContent || !!loading.uploadImage}
                />
            )}
        </>
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

function getLatestDistribution(distributions: PostDistribution[]): PostDistribution | null {
    if (!distributions?.length) return null;
    return [...distributions].sort((a, b) => {
        const ta = a.sentAt ? new Date(a.sentAt).getTime() : 0;
        const tb = b.sentAt ? new Date(b.sentAt).getTime() : 0;
        return tb - ta;
    })[0];
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

    const [showGenerateSection, setShowGenerateSection] = useState(false);
    const [generateSectionTab, setGenerateSectionTab] = useState<ActiveTab>("content");
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPushConfirm, setShowPushConfirm] = useState(false);

    const generateSectionRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { eventId, marketingId } = useParams<{ eventId: string, marketingId: string }>();

    const statusInfo = post ? (MARKETING_STATUS_VI[post.status] ?? { label: post.status, className: "" }) : null;

    const canSubmitBase = post?.canSubmit && post.status === "Draft";
    const hasImage = !!(post?.imageUrl);
    const canSubmit = canSubmitBase && hasImage;
    const showSubmitImageWarning = canSubmitBase && !hasImage;

    const canPublish = post?.canPublish && post.status === "Approved";
    const canEdit = post?.canEdit && post.status === "Draft";
    const canArchive = post?.canArchive && post.status === "Published";
    const canPushFacebook = post?.status === "Published";

    const rawBlocks = parseBodyToBlocks(post?.body ?? "");
    const blocks = injectImageBlock(rawBlocks, post?.imageUrl ?? null);
    const isBlockContent = blocks.length > 0;

    const latestDistribution = post ? getLatestDistribution(post.distributions ?? []) : null;
    const facebookDistribution = post?.distributions?.find((d) => d.platform === "Facebook") ?? null;
    const hasFacebookDistribution = !!facebookDistribution;

    /** Mở InlineGenerateSection và set tab, sau đó scroll */
    const openGenerateSection = (tab: ActiveTab = "content") => {
        setGenerateSectionTab(tab);
        setShowGenerateSection(true);
        setTimeout(() =>
            generateSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
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
            setShowPushConfirm(false);
        } catch (err: any) {
            notify.error(err?.message || "Đẩy bài lên Facebook thất bại");
            setShowPushConfirm(false);
        }
    };

    return (
        <section className="space-y-6 pb-16">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="w-1.5 h-6 bg-primary rounded-full mr-3" />
                    Nội dung Quảng cáo
                </h2>
                {post && (
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
                                            onClick={() =>
                                                navigate(`/organizer/my-events/${eventId}/marketing/${marketingId}/post-preview/${post.postId}`)
                                            }
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

                    {/* Facebook push */}
                    {canPushFacebook && (
                        <div className="bg-[#0B0B12] border border-blue-500/20 rounded-[32px] px-8 py-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                                    <MdFacebook className="text-blue-400 text-xl" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-white">Đăng lên Facebook</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {hasFacebookDistribution
                                            ? "Bài đã được phân phối lên Facebook. Bấm để đăng lại."
                                            : "Phân phối bài viết này lên trang Facebook của sự kiện."}
                                    </p>
                                </div>
                                {facebookDistribution && <DistributionStatusBadge status={facebookDistribution.status} />}
                            </div>

                            {facebookDistribution?.externalUrl && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2.5">
                                    <MdOutlineLink className="text-slate-600 shrink-0" />
                                    <a href={facebookDistribution.externalUrl} target="_blank" rel="noreferrer"
                                        className="text-blue-400 hover:underline truncate">
                                        {facebookDistribution.externalUrl}
                                    </a>
                                    <MdOutlineOpenInNew className="text-slate-600 shrink-0 ml-auto" />
                                </div>
                            )}

                            {facebookDistribution?.errorMessage && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                    <p className="text-red-400 text-xs">{facebookDistribution.errorMessage}</p>
                                </div>
                            )}

                            {postError.pushPost && (
                                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                    {postError.pushPost}
                                </p>
                            )}

                            <button onClick={() => setShowPushConfirm(true)} disabled={postLoading.pushPost}
                                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] shadow-lg shadow-blue-500/20 transition-all">
                                {postLoading.pushPost ? (
                                    <><Spinner /> Đang đăng bài...</>
                                ) : (
                                    <><MdFacebook className="text-lg" />
                                        {hasFacebookDistribution ? "Đăng lại lên Facebook" : "Đăng bài lên Facebook"}
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Generate / Edit section toggle */}
                    {canEdit && !showGenerateSection && (
                        <button
                            onClick={() => openGenerateSection("content")}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-base bg-primary text-white hover:bg-primary/90 active:scale-[0.99] shadow-lg shadow-primary/30 transition-all neon-button-glow"
                        >
                            <MdOutlineRefresh className="text-xl" />
                            Chỉnh sửa / Generate lại bài post
                        </button>
                    )}

                    {canEdit && showGenerateSection && (
                        <div ref={generateSectionRef} className="space-y-4 scroll-mt-8">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <MdOutlineSmartToy className="text-primary" />
                                    Chỉnh sửa nội dung
                                </span>
                                <button
                                    onClick={() => setShowGenerateSection(false)}
                                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <MdOutlineClose className="text-sm" /> Thu gọn
                                </button>
                            </div>
                            <InlineGenerateSection
                                post={post}
                                onApplied={() => setShowGenerateSection(false)}
                                initialTab={generateSectionTab}
                            />
                        </div>
                    )}

                    {/* Action buttons */}
                    {(canEdit || canSubmitBase || canPublish || canArchive) && (
                        <div className="space-y-3">
                            {/* Image required warning */}
                            {showSubmitImageWarning && (
                                <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20
                                                rounded-2xl px-5 py-4">
                                    <MdOutlineWarningAmber className="text-amber-400 text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-amber-400 text-sm font-semibold">Bài đăng chưa có ảnh</p>
                                        <p className="text-amber-400/70 text-xs mt-0.5">
                                            Vui lòng thêm ảnh trước khi gửi yêu cầu duyệt. Sử dụng{" "}
                                            <button
                                                onClick={() => openGenerateSection("content")}
                                                className="underline font-semibold hover:text-amber-300 transition"
                                            >
                                                Chỉnh sửa / Generate lại
                                            </button>{" "}
                                            để upload hoặc tạo ảnh.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 flex-wrap">
                                {/* Nút Chỉnh sửa → mở InlineGenerateSection tab manual */}
                                {canEdit && (
                                    <button
                                        onClick={() => openGenerateSection("manual")}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-all"
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
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm
                                                   bg-yellow-500/10 text-yellow-400 border border-yellow-500/30
                                                   hover:bg-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed
                                                   transition-all"
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
                        open={showPushConfirm}
                        title="Đăng bài lên Facebook"
                        description={hasFacebookDistribution
                            ? "Bài đã được đăng lên Facebook trước đó. Bạn có chắc muốn đăng lại không?"
                            : "Xác nhận đăng bài viết này lên trang Facebook của sự kiện?"}
                        confirmText={hasFacebookDistribution ? "Đăng lại" : "Đăng bài"}
                        loading={postLoading.pushPost}
                        onCancel={() => setShowPushConfirm(false)}
                        onConfirm={handlePushFacebook}
                    />
                </div>
            )}
        </section>
    );
}