import { useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import {
    MdOutlineBolt,
    MdOutlineCheckCircle,
    MdOutlineClose,
    MdOutlineEdit,
    MdOutlineImage,
    MdOutlineSave,
    MdOutlineSmartToy,
    MdOutlineVisibility
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import AIContentTab from "../../components/Organizer/marketing/AIContentTab";
import AIImageTab from "../../components/Organizer/marketing/AIImageTab";
import BlockEditor from "../../components/Organizer/marketing/BlockEditor";
import PostBlockRenderer from "../../components/Organizer/post/PostBlockRenderer";
import type { AppDispatch, RootState } from "../../store";
import {
    clearGeneratedDraft,
    clearGeneratedImageUrl,
    clearPostDetail,
    fetchPostDetail,
    generateContentPostUsingAI,
    generateImage,
    updatePostContent,
    uploadImagePost,
} from "../../store/postSlice";
import type { ContentBlock, UpdatePostContentRequest } from "../../types/post/post";
import { buildContextPrompt } from "../../utils/buildContextPrompt";
import { injectImageBlock } from "../../utils/injectImageBlock";
import { notify } from "../../utils/notify";
import { getImagePosition, saveImagePosition } from "../../utils/postImagePosition";
import { parseBodyToBlocks, serializeBlocksToBody } from "../../utils/renderPostContent";

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );
}

// ─── Mode toggle ──────────────────────────────────────────────────────────────

type ViewMode = "preview" | "editor";
type ActiveTab = "content" | "image" | "manual";

function ModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
    return (
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            {(["preview", "editor"] as ViewMode[]).map((m) => {
                const isActive = mode === m;
                return (
                    <button
                        key={m}
                        type="button"
                        onClick={() => onChange(m)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all
                            ${isActive
                                ? "bg-primary text-white shadow-lg shadow-primary/30"
                                : "text-slate-500 hover:text-slate-300"}`}
                    >
                        {m === "preview"
                            ? <><MdOutlineVisibility className="text-sm" /> Preview</>
                            : <><MdOutlineEdit className="text-sm" /> Chỉnh sửa</>}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Save status indicator ────────────────────────────────────────────────────

function SaveStatus({ saving, saved }: { saving: boolean; saved: boolean }) {
    if (saving) return (
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Spinner className="h-3 w-3" /> Đang lưu...
        </span>
    );
    if (saved) return (
        <span className="flex items-center gap-1.5 text-xs text-green-400">
            <MdOutlineCheckCircle className="text-sm" /> Đã lưu
        </span>
    );
    return null;
}

// ─── Empty preview placeholder ────────────────────────────────────────────────

function EmptyPreview() {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-slate-700">
            <MdOutlineVisibility className="text-5xl opacity-30" />
            <p className="text-sm">Thêm nội dung bên trái để xem preview</p>
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PostPreviewPage() {
    const { postId } = useParams<{
        postId: string;
        eventId: string;
        marketingId: string;
    }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { postDetail, loading: postLoading, generatedDraft, generatedImageUrl } = useSelector((s: RootState) => s.POST);
    const error = useSelector((s: RootState) => s.POST.error);

    // ── Mode ──────────────────────────────────────────────────────────────────
    const [mode, setMode] = useState<ViewMode>("preview");

    // ── Tab state ─────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<ActiveTab>("content");

    // ── Editor state ──────────────────────────────────────────────────────────
    const manualEditorRef = useRef<{ getBlocks: () => ContentBlock[] } | null>(null);
    const [liveBlocks, setLiveBlocks] = useState<ContentBlock[]>([]);
    const [manualTitle, setManualTitle] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [savedRecently, setSavedRecently] = useState(false);
    const [initialBlocksLoaded, setInitialBlocksLoaded] = useState(false);
    const [previewData, setPreviewData] = useState<{ blocks: ContentBlock[]; title: string } | null>(null);

    // ── Image state ────────────────────────────────────────────────────────────
    // AI Content tab: owned by UploadImageSection
    const [aiSelectedImageUrl, setAiSelectedImageUrl] = useState<string | null>(null);
    const [aiPendingImageFile, setAiPendingImageFile] = useState<File | null>(null);

    // Manual tab: owned by BlockEditor (via onImageChange callback)
    const [manualImageFile, setManualImageFile] = useState<File | null>(null);
    const [manualImageUrl, setManualImageUrl] = useState<string | null>(null);

    // ── Image position từ Firebase ────────────────────────────────────────────
    const [imageInsertAt, setImageInsertAt] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (!postId) return;
        getImagePosition(postId)
            .then((pos) => setImageInsertAt(pos ?? undefined))
            .catch(() => setImageInsertAt(undefined));
    }, [postId]);

    // ── Load post ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (postId) dispatch(fetchPostDetail(postId));
        return () => {
            dispatch(clearPostDetail());
            dispatch(clearGeneratedDraft());
            dispatch(clearGeneratedImageUrl());
        };
    }, [postId, dispatch]);

    // ── Seed editor khi postDetail load xong ──────────────────────────────────
    useEffect(() => {
        if (postDetail && !initialBlocksLoaded) {
            const parsed = parseBodyToBlocks(postDetail.body);
            setManualTitle(postDetail.title);
            setLiveBlocks(parsed);

            // Seed image state cho AI Content tab
            setAiSelectedImageUrl(postDetail.imageUrl ?? null);

            // Seed image state cho Manual tab
            setManualImageUrl(postDetail.imageUrl ?? null);

            setInitialBlocksLoaded(true);
        }
    }, [postDetail, initialBlocksLoaded]);

    // ── Preview blocks cho AI Content tab + Manual tab preview ───────────────
    // AI Content: inject image của aiSelectedImageUrl
    const aiPreviewBlocks = injectImageBlock(liveBlocks, aiSelectedImageUrl, imageInsertAt);

    // Manual tab: inject image từ manualImageUrl (owned by BlockEditor)
    const manualPreviewBlocks = injectImageBlock(liveBlocks, manualImageUrl, imageInsertAt);

    // Preview mode: dùng đúng ảnh theo tab đang active
    const previewBlocks = activeTab === "manual" ? manualPreviewBlocks : aiPreviewBlocks;

    // ── AI Generate handlers ──────────────────────────────────────────────────
    const handleGenerate = (tone: string, userPrompt: string) => {
        if (!postDetail) return;
        const context = buildContextPrompt({ title: postDetail.title } as any, tone || undefined);
        const finalPrompt = userPrompt.trim()
            ? `${context}\n\nAdditional requirement: ${userPrompt.trim()}`
            : context;
        dispatch(generateContentPostUsingAI({ eventId: postDetail.eventId, userPromptRequirement: finalPrompt }));
    };

    const handleAiSelectImage = (url: string) => {
        setAiSelectedImageUrl(url);
        setManualImageUrl(url);                          // ← sync ngay, không qua effect
        if (!url.startsWith("blob:")) {
            setAiPendingImageFile(null);
            setManualImageFile(null);                    // ← clear file nếu chọn AI URL
        }
        if (imageInsertAt === undefined) {
            const headingIdx = liveBlocks.findIndex(b => b.type === "heading");
            setImageInsertAt(headingIdx !== -1 ? headingIdx + 1 : 0);
        }
    };

    // ── handleAiClearImage — clear cả manual ─────────────────────────────────────
    const handleAiClearImage = () => {
        setAiSelectedImageUrl(null);
        setAiPendingImageFile(null);
        setManualImageUrl(null);                         // ← sync clear
        setManualImageFile(null);
    };

    // ── handleAiFileSelected — sync manualImageUrl ────────────────────────────────
    const handleAiFileSelected = (file: File) => {
        setAiPendingImageFile(file);
        const blobUrl = URL.createObjectURL(file);
        setAiSelectedImageUrl(blobUrl);
        setManualImageUrl(blobUrl);                      // ← sync ngay
        setManualImageFile(file);                        // ← manual tab cũng biết file này
        if (imageInsertAt === undefined) {
            const headingIdx = liveBlocks.findIndex(b => b.type === "heading");
            setImageInsertAt(headingIdx !== -1 ? headingIdx + 1 : 0);
        }
    };

    // ── handleConfirmApply — set manualImageUrl cùng transaction ─────────────────
    const handleConfirmApply = async () => {
        if (!previewData || !postDetail || !postId) return;
        setIsSaving(true);
        try {
            let resolvedImageUrl: string | undefined;
            if (aiPendingImageFile) {
                const res = await dispatch(uploadImagePost({
                    postId,
                    imageFile: aiPendingImageFile,
                    folder: "post-images",
                })).unwrap();
                resolvedImageUrl = res.imageUrl;
                setAiSelectedImageUrl(res.imageUrl);
                setManualImageUrl(res.imageUrl);         // ← sync cùng lúc
                setAiPendingImageFile(null);
                setManualImageFile(null);
            } else if (aiSelectedImageUrl?.startsWith("http")) {
                resolvedImageUrl = aiSelectedImageUrl;
                setManualImageUrl(aiSelectedImageUrl);   // ← đảm bảo manual tab nhận đúng URL
            }

            const blocksToSave = previewData.blocks.filter(b => b.type !== "image");

            const data: UpdatePostContentRequest = {
                title: previewData.title || postDetail.title,
                body: serializeBlocksToBody(blocksToSave),
                imageUrl: resolvedImageUrl,
                promptUsed: generatedDraft?.promptUsed ?? postDetail.promptUsed,
                aiModel: generatedDraft?.aiModel ?? postDetail.aiModel,
                aiTokensUsed: generatedDraft?.aiTokensUsed ?? postDetail.aiTokensUsed,
                trackingToken: postDetail.trackingToken,
            };

            await dispatch(updatePostContent({ postId, data })).unwrap();

            setManualTitle(previewData.title || postDetail.title);
            setLiveBlocks(blocksToSave);                 // ← liveBlocks update cùng render với manualImageUrl

            notify.success("Đã cập nhật nội dung bài đăng!");
            setPreviewData(null);
            dispatch(clearGeneratedDraft());
            dispatch(clearGeneratedImageUrl());
            setSavedRecently(true);
            setTimeout(() => setSavedRecently(false), 3000);
        } catch (err: any) {
            notify.error(err?.message || "Cập nhật thất bại");
        } finally {
            setIsSaving(false);
        }
    };

    // ── Manual tab image handler (BlockEditor owns via onImageChange) ─────────
    const handleManualImageChange = (file: File | null, url: string | null) => {
        setManualImageFile(file);
        setManualImageUrl(url);
        // Tính vị trí insert dựa trên vị trí image block trong liveBlocks + manualEditorRef
        if (url && imageInsertAt === undefined) {
            const headingIdx = liveBlocks.findIndex(b => b.type === "heading");
            setImageInsertAt(headingIdx !== -1 ? headingIdx + 1 : 0);
        }
    };

    // ── Khi BlockEditor drag/drop block (bao gồm image block) ────────────────
    const handleManualBlocksChange = (blocks: ContentBlock[]) => {
        const imageIdx = blocks.findIndex(b => b.type === "image");
        if (imageIdx !== -1) {
            setImageInsertAt(imageIdx);
            if (postId) {
                saveImagePosition(postId, imageIdx).catch(console.error);
            }
        }
        // Strip image blocks khỏi liveBlocks — ảnh lưu riêng qua manualImageUrl
        setLiveBlocks(blocks.filter(b => b.type !== "image"));
    };

    // ── Save từ Manual tab (BlockEditor owns image) ───────────────────────────
    const handleSaveFromManual = async () => {
        if (!postDetail || !postId) return;
        setIsSaving(true);
        try {
            const blocksToSave = liveBlocks.filter(b => b.type !== "image");

            let resolvedImageUrl: string | undefined =
                manualImageUrl?.startsWith("http") ? manualImageUrl : undefined;

            if (manualImageFile) {
                const res = await dispatch(uploadImagePost({
                    postId,
                    imageFile: manualImageFile,
                    folder: "post-images",
                })).unwrap();
                resolvedImageUrl = res.imageUrl;
                setManualImageUrl(res.imageUrl);
                setManualImageFile(null);

                // Sau khi upload, lưu vị trí image
                if (imageInsertAt !== undefined) {
                    saveImagePosition(postId, imageInsertAt).catch(console.error);
                }
            }

            const data: UpdatePostContentRequest = {
                title: manualTitle,
                body: serializeBlocksToBody(blocksToSave),
                imageUrl: resolvedImageUrl,
                promptUsed: postDetail.promptUsed,
                aiModel: postDetail.aiModel,
                aiTokensUsed: postDetail.aiTokensUsed,
                trackingToken: postDetail.trackingToken,
            };

            await dispatch(updatePostContent({ postId, data })).unwrap();
            notify.success("Đã lưu thay đổi!");
            setSavedRecently(true);
            setTimeout(() => setSavedRecently(false), 3000);
        } catch (err: any) {
            notify.error(err?.message || "Lưu thất bại");
        } finally {
            setIsSaving(false);
        }
    };

    // ── Loading / error states ────────────────────────────────────────────────
    if (postLoading.fetchDetail) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Spinner className="h-6 w-6 text-primary" />
                    <p className="text-slate-500 text-sm animate-pulse">Đang tải nội dung...</p>
                </div>
            </div>
        );
    }

    if (!postDetail) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="text-center space-y-3">
                    <p className="text-slate-500 text-sm">Không có nội dung để hiển thị.</p>
                    <button onClick={() => navigate(-1)} className="text-primary text-sm underline">
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const canEdit = postDetail.canEdit;
    const isAIImageSelected = !!generatedImageUrl && aiSelectedImageUrl === generatedImageUrl;

    const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
        { id: "content", label: "Tạo nội dung AI", icon: <MdOutlineBolt className="text-base" /> },
        { id: "image", label: "Tạo ảnh AI", icon: <MdOutlineImage className="text-base" /> },
        { id: "manual", label: "Tự soạn", icon: <MdOutlineEdit className="text-base" /> },
    ];

    return (
        <div className="min-h-screen bg-background-dark text-white flex flex-col">
            {/* ── Sticky header ─────────────────────────────────────────────── */}
            <header className="sticky top-0 z-20 bg-[#0B0B12]/95 backdrop-blur-md
                               border-b border-slate-800/80 px-6 py-3
                               flex items-center justify-between gap-4 shrink-0">
                {/* Left */}
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white
                                   transition text-sm font-medium shrink-0"
                    >
                        <FiArrowLeft size={16} />
                        <span className="hidden sm:inline">Quay lại</span>
                    </button>

                    <div className="hidden sm:block w-px h-4 bg-slate-800" />

                    <div className="flex items-center gap-2 min-w-0">
                        <MdOutlineSmartToy className="text-primary shrink-0" />
                        <span className="text-xs text-slate-500 truncate max-w-[200px] lg:max-w-xs">
                            {postDetail.title}
                        </span>
                    </div>
                </div>

                {/* Center — mode toggle */}
                <div className="flex items-center gap-3">
                    {canEdit && <ModeToggle mode={mode} onChange={setMode} />}
                    {!canEdit && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest">
                            <MdOutlineVisibility /> Preview bài đăng
                        </span>
                    )}
                </div>

                {/* Right — save */}
                <div className="flex items-center gap-3">
                    <SaveStatus saving={isSaving} saved={savedRecently} />
                    {mode === "editor" && canEdit && activeTab === "manual" && (
                        <button
                            onClick={handleSaveFromManual}
                            disabled={isSaving || !manualTitle.trim()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                                       bg-primary text-white hover:bg-primary/90
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       shadow-lg shadow-primary/30 transition-all"
                        >
                            {isSaving ? <Spinner /> : <MdOutlineSave />}
                            <span className="hidden sm:inline">Lưu thay đổi</span>
                        </button>
                    )}
                </div>
            </header>

            {/* ── Body ──────────────────────────────────────────────────────── */}
            <main className="flex-1 overflow-hidden">
                {/* PREVIEW MODE */}
                {mode === "preview" && (
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        <div className="max-w-4xl mx-auto px-6 py-10">
                            <div className="mb-6 flex items-center gap-2 text-xs text-slate-600">
                                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                                Được tạo bởi AI · v{postDetail.version}
                            </div>
                            <div className="bg-card-dark border border-slate-800 rounded-3xl p-8 space-y-6">
                                {previewBlocks.length > 0
                                    ? <PostBlockRenderer blocks={previewBlocks} />
                                    : (
                                        <p className="whitespace-pre-wrap leading-relaxed text-sm text-slate-200">
                                            {postDetail.body}
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>
                )}

                {/* EDITOR MODE — split view */}
                {mode === "editor" && canEdit && (
                    <div className="flex h-full overflow-hidden">
                        {/* Left — Editor panel */}
                        <div className="w-full lg:w-1/2 xl:w-[45%] border-r border-slate-800/60
                                        overflow-y-auto custom-scrollbar flex flex-col">

                            {/* Panel header + Tab bar */}
                            <div className="px-6 pt-5 pb-0 shrink-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                                        <MdOutlineSmartToy className="text-primary text-base" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Chỉnh sửa / Generate lại</h3>
                                        <p className="text-[10px] text-slate-500">
                                            Nội dung mới sẽ thay thế bài đăng sau khi xác nhận.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex border-b border-slate-800">
                                    {TABS.map((tab) => {
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all border-b-2
                                                    ${isActive
                                                        ? "border-primary text-primary"
                                                        : "border-transparent text-slate-500 hover:text-slate-300"}`}
                                            >
                                                {tab.icon}
                                                {tab.label}
                                                {tab.id === "image" && isAIImageSelected && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-0.5" />
                                                )}
                                                {tab.id === "content" && aiSelectedImageUrl && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-0.5" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tab content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="px-6 py-5">
                                    {/* ── Tab: AI Content ── */}
                                    {activeTab === "content" && (
                                        <AIContentTab
                                            generatedDraft={generatedDraft}
                                            loading={postLoading}
                                            error={error}
                                            selectedImageUrl={aiSelectedImageUrl}
                                            onGenerate={handleGenerate}
                                            onPreview={(blocks, title) =>
                                                setPreviewData({
                                                    blocks: injectImageBlock(blocks, aiSelectedImageUrl, imageInsertAt),
                                                    title,
                                                })
                                            }
                                            onSelectImage={handleAiSelectImage}
                                            onClearImage={handleAiClearImage}
                                            onFileSelected={handleAiFileSelected}
                                        />
                                    )}

                                    {/* ── Tab: AI Image ── */}
                                    {activeTab === "image" && (
                                        <AIImageTab
                                            generatedImageUrl={generatedImageUrl}
                                            selectedImageUrl={aiSelectedImageUrl}
                                            loading={postLoading}
                                            error={error}
                                            onGenerate={(p, a, s) =>
                                                dispatch(generateImage({ prompt: p, aspectRatio: a, imageSize: s }))
                                            }
                                            onSelectImage={(url) => {
                                                handleAiSelectImage(url);
                                                setAiPendingImageFile(null);
                                            }}
                                            onClearImage={handleAiClearImage}
                                        />
                                    )}

                                    {/* ── Tab: Tự soạn ── */}
                                    {activeTab === "manual" && (
                                        <div className="space-y-5">
                                            {manualImageUrl && aiSelectedImageUrl === manualImageUrl && (
                                                <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20
                            rounded-xl px-4 py-3 text-xs text-blue-400">
                                                    <MdOutlineImage className="shrink-0" />
                                                    <div>
                                                        <p className="font-semibold">Ảnh AI đang được áp dụng</p>
                                                        <p className="text-blue-400/60 mt-0.5">
                                                            Xem trong block Ảnh bên dưới. Kéo để đổi vị trí, xóa block để bỏ ảnh.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Title input */}
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500
                                                                   uppercase tracking-widest mb-2">
                                                    Tiêu đề bài đăng <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={manualTitle}
                                                    onChange={(e) => setManualTitle(e.target.value)}
                                                    placeholder="Nhập tiêu đề..."
                                                    className="w-full bg-slate-900/60 border border-slate-800
                                                               rounded-xl text-slate-100 placeholder:text-slate-600
                                                               px-4 py-3 text-sm font-semibold
                                                               focus:outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                            <BlockEditor
                                                key={`${manualImageUrl ?? "no-img"}-${imageInsertAt ?? "auto"}-${liveBlocks.length}`}
                                                editorRef={manualEditorRef}
                                                initialBlocks={injectImageBlock(liveBlocks, manualImageUrl, imageInsertAt)}
                                                postId={postId}
                                                onChange={handleManualBlocksChange}
                                                onImageChange={handleManualImageChange}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sticky save footer — manual tab */}
                            {activeTab === "manual" && (
                                <div className="sticky bottom-0 bg-[#0B0B12]/95 backdrop-blur
                                                border-t border-slate-800 px-6 py-4 shrink-0">
                                    <button
                                        onClick={handleSaveFromManual}
                                        disabled={isSaving || !manualTitle.trim()}
                                        className="w-full flex items-center justify-center gap-2.5
                                                   py-3.5 rounded-2xl font-bold text-sm
                                                   bg-primary text-white hover:bg-primary/90
                                                   disabled:opacity-50 disabled:cursor-not-allowed
                                                   shadow-lg shadow-primary/30 transition-all
                                                   neon-button-glow"
                                    >
                                        {isSaving
                                            ? <><Spinner /> Đang lưu...</>
                                            : <><MdOutlineSave /> Lưu thay đổi</>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right — Live preview */}
                        <div className="hidden lg:flex flex-col flex-1 overflow-hidden bg-[#0a0a10]">
                            <div className="flex items-center gap-2 px-6 py-3.5
                                            border-b border-slate-800/60 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-500
                                                 uppercase tracking-widest">Live preview</span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="max-w-2xl mx-auto px-8 py-8">
                                    {manualTitle && (
                                        <p className="text-[10px] font-black text-slate-600
                                                      uppercase tracking-widest mb-6 border-b
                                                      border-slate-800 pb-3">
                                            {manualTitle}
                                        </p>
                                    )}
                                    <div className="bg-card-dark border border-slate-800/50 rounded-3xl p-8">
                                        {previewBlocks.length > 0
                                            ? <PostBlockRenderer blocks={previewBlocks} />
                                            : <EmptyPreview />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Editor mode but canEdit = false */}
                {mode === "editor" && !canEdit && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                            <MdOutlineClose className="text-4xl text-slate-700 mx-auto" />
                            <p className="text-slate-500 text-sm">
                                Bài đăng này không thể chỉnh sửa ở trạng thái hiện tại.
                            </p>
                            <button onClick={() => setMode("preview")} className="text-primary text-sm underline">
                                Xem preview
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* ── Preview/confirm modal ──────────────────────────────────────── */}
            {previewData && (
                <GeneratePreviewModal
                    blocks={previewData.blocks}
                    title={previewData.title}
                    onConfirm={handleConfirmApply}
                    onCancel={() => setPreviewData(null)}
                    loading={isSaving}
                />
            )}
        </div>
    );
}