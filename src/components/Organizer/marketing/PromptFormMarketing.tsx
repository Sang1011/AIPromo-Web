import { useEffect, useRef, useState } from "react";
import { GrFormNextLink } from "react-icons/gr";
import {
    MdOutlineBolt,
    MdOutlineCategory,
    MdOutlineEdit,
    MdOutlineImage,
    MdOutlinePerson,
    MdOutlineSmartToy,
    MdOutlineTag
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchEventById } from "../../../store/eventSlice";
import {
    clearGeneratedDraft,
    clearGeneratedImageUrl,
    createPostDraft,
    generateContentPostUsingAI,
    generateImage,
    updatePostContent,
    uploadImagePost
} from "../../../store/postSlice";
import type { GetEventDetailResponse } from "../../../types/event/event";
import type { ContentBlock, CreatePostDraftRequest, UpdatePostContentRequest } from "../../../types/post/post";
import { buildContextPrompt } from "../../../utils/buildContextPrompt";
import { formatDateTime } from "../../../utils/formatDateTime";
import { injectImageBlock } from "../../../utils/injectImageBlock";
import { notify } from "../../../utils/notify";
import { saveImagePosition } from "../../../utils/postImagePosition";
import { serializeBlocksToBody } from "../../../utils/renderPostContent";
import PostBlockRenderer from "../post/PostBlockRenderer";
import AIContentTab from "./AIContentTab";
import AIImageTab from "./AIImageTab";
import BlockEditor from "./BlockEditor";

// ─── Reusable display helpers ─────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                {label}
            </label>
            <p className="w-full bg-background-dark/30 border border-slate-800 rounded-xl
                          text-slate-300 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {value}
            </p>
        </div>
    );
}

function ReadOnlyTags({ label, icon: Icon, items }: { label: string; icon: any; items: { id: any; name: string }[] }) {
    if (!items?.length) return null;
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Icon className="text-slate-500" /> {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <span key={item.id} className="bg-primary/20 text-primary border border-primary/40 text-xs font-semibold px-3 py-1 rounded-full">
                        {item.name}
                    </span>
                ))}
            </div>
        </div>
    );
}

function ActorList({ actors }: { actors: any[] }) {
    if (!actors?.length) return null;
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                <MdOutlinePerson className="text-slate-500" /> Diễn giả / Nghệ sĩ
            </label>
            <div className="flex flex-wrap gap-3">
                {actors.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 bg-background-dark/40 border border-slate-800 rounded-xl px-3 py-2">
                        {a.image && <img src={a.image} alt={a.name} className="w-7 h-7 rounded-full object-cover" />}
                        <div>
                            <p className="text-slate-200 text-xs font-medium">{a.name}</p>
                            {a.major && <p className="text-slate-500 text-xs">{a.major}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SessionList({ sessions }: { sessions: any[] }) {
    if (!sessions?.length) return null;
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Các buổi diễn / Phiên
            </label>
            <div className="space-y-2">
                {sessions.map((s) => (
                    <div key={s.id} className="bg-background-dark/30 border border-slate-800 rounded-xl px-4 py-2 flex flex-col gap-0.5">
                        <p className="text-slate-200 text-sm font-medium">{s.title}</p>
                        {s.description && <p className="text-slate-500 text-xs">{s.description}</p>}
                        <p className="text-slate-500 text-xs flex items-center gap-1">
                            <span>{formatDateTime(s.startTime)}</span>
                            <GrFormNextLink className="text-base shrink-0" />
                            <span>{formatDateTime(s.endTime)}</span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Spinner() {
    return (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );
}

// ─── Manual tab ───────────────────────────────────────────────────────────────

function ManualTab({
    loading,
    selectedImageUrl,
    onPreview,
    onSaveDraft,
}: {
    loading: any;
    selectedImageUrl: string | null;
    onPreview: (blocks: ContentBlock[], title: string) => void;
    onSaveDraft: (blocks: ContentBlock[], title: string) => void;
    onSelectImage: (url: string) => void;
    onClearImage: () => void;
    onFileSelected: (f: File) => void;
}) {
    const editorRef = useRef<{ getBlocks: () => ContentBlock[] } | null>(null);
    const [title, setTitle] = useState("");

    const handlePreview = () => {
        const blocks = editorRef.current?.getBlocks() ?? [];
        if (!blocks.length) return;
        onPreview(injectImageBlock(blocks, selectedImageUrl), title);
    };

    const handleSave = () => {
        const blocks = editorRef.current?.getBlocks() ?? [];
        onSaveDraft(blocks, title);
    };

    return (
        <div className="space-y-5">
            {/* Title input */}
            <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Tiêu đề bài đăng <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề..."
                    className="w-full bg-background-dark border border-slate-800 rounded-xl
                               text-slate-100 placeholder:text-slate-600 px-4 py-3 text-sm
                               focus:outline-none focus:border-primary transition-colors"
                />
            </div>

            {/* Block editor */}
            <BlockEditor editorRef={editorRef} />

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                    type="button"
                    onClick={handlePreview}
                    className="border border-slate-700 text-slate-300 hover:border-primary/50
                               hover:text-white py-3 rounded-2xl font-semibold text-sm
                               flex items-center justify-center gap-2 transition-all"
                >
                    Xem preview
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading.createDraft || !title.trim()}
                    className="border border-primary text-primary hover:bg-primary hover:text-white
                               disabled:opacity-50 disabled:cursor-not-allowed
                               py-3 rounded-2xl font-bold text-sm
                               flex items-center justify-center gap-2 transition-all"
                >
                    {loading.createDraft ? <><Spinner /><span>Đang lưu...</span></> : "Lưu bản nháp"}
                </button>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type ActiveTab = "content" | "image" | "manual";

export default function PromptFormMarketing() {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const currentEvent = useSelector((s: RootState) => s.EVENT.currentEvent);
    const { generatedDraft, generatedImageUrl, loading, error } =
        useSelector((s: RootState) => s.POST);

    const [activeTab, setActiveTab] = useState<ActiveTab>("content");
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
    const [previewBlocks, setPreviewBlocks] = useState<ContentBlock[] | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>("");
    const [isSavingWithImage, setIsSavingWithImage] = useState(false);

    useEffect(() => {
        if (eventId) dispatch(fetchEventById(eventId));
        return () => {
            dispatch(clearGeneratedDraft());
            dispatch(clearGeneratedImageUrl());
        };
    }, [eventId, dispatch]);

    const handleGenerate = (tone: string, userPrompt: string) => {
        if (!eventId || !currentEvent) return;
        const context = buildContextPrompt(currentEvent as GetEventDetailResponse, tone || undefined);
        const finalPrompt = userPrompt.trim()
            ? `${context}\n\nAdditional requirement: ${userPrompt.trim()}`
            : context;
        dispatch(generateContentPostUsingAI({ eventId, userPromptRequirement: finalPrompt }));
    };

    const saveDraftWithImage = async (
        draftPayload: CreatePostDraftRequest,
        blocks: ContentBlock[],
        overrideImageUrl?: string | null,
        overridePendingFile?: File | null,
    ) => {
        setIsSavingWithImage(true);
        try {
            const result = await dispatch(createPostDraft({ ...draftPayload, imageUrl: null })).unwrap();
            const postId: string = result as string;
            if (!postId) { notify.error("Không lấy được postId"); return; }

            // Dùng override nếu có, fallback về state
            const pendingFile = overridePendingFile ?? pendingImageFile;
            let resolvedImageUrl: string | null =
                (overrideImageUrl !== undefined ? overrideImageUrl : selectedImageUrl)
                    && !(overrideImageUrl ?? selectedImageUrl)?.startsWith("blob:")
                    ? (overrideImageUrl ?? selectedImageUrl)
                    : null;

            if (pendingFile) {
                try {
                    const uploadRes = await dispatch(uploadImagePost({
                        postId,
                        imageFile: pendingFile,
                        folder: "post-images",
                    })).unwrap();
                    resolvedImageUrl = uploadRes.imageUrl;
                } catch (err: any) {
                    notify.error(err?.message || "Upload ảnh thất bại");
                }
            }

            if (resolvedImageUrl) {
                const updateData: UpdatePostContentRequest = {
                    title: draftPayload.title,
                    body: draftPayload.body,
                    imageUrl: resolvedImageUrl,
                    promptUsed: draftPayload.promptUsed ?? "",
                    aiModel: draftPayload.aiModel ?? "",
                    aiTokensUsed: draftPayload.aiTokensUsed ?? 0,
                    trackingToken: undefined,
                };
                await dispatch(updatePostContent({ postId, data: updateData })).unwrap();

                const headingIdx = blocks.findIndex(b => b.type === "heading");
                const insertAt = headingIdx !== -1 ? headingIdx + 1 : 0;
                saveImagePosition(postId, insertAt).catch(console.error);
            }

            notify.success("Đã lưu bản nháp!");
            navigate(postId)
        } catch (err: any) {
            notify.error(err?.message || "Lưu bản nháp thất bại");
        } finally {
            setIsSavingWithImage(false);
        }
    };

    const handleSaveDraftFromManual = async (blocks: ContentBlock[], title: string) => {
        if (!eventId) return;

        const imageBlock = (blocks as any[]).find(b => b.type === "image" && b._pendingFile);
        const fileFromBlock: File | null = imageBlock?._pendingFile ?? null;
        const effectivePendingFile = pendingImageFile ?? fileFromBlock;
        const imageBlockUrl = blocks.find(b => b.type === "image" && (b as any).src?.startsWith("http")) as any;
        const effectiveImageUrl = selectedImageUrl ?? imageBlockUrl?.src ?? null;

        const textBlocks = blocks.filter(b => b.type !== "image");
        const payload: CreatePostDraftRequest = {
            eventId,
            title,
            body: serializeBlocksToBody(textBlocks),
            summary: "",
            promptUsed: "",
            aiModel: "",
            aiTokensUsed: 0,
            imageUrl: null,
        };

        await saveDraftWithImage(payload, blocks, effectiveImageUrl, effectivePendingFile);
    };

    const handleSaveDraftFromAI = async (blocks: ContentBlock[]) => {
        if (!generatedDraft || !eventId) return;
        const textBlocks = blocks.filter(b => b.type !== "image");
        const payload: CreatePostDraftRequest = {
            eventId,
            title: generatedDraft.title,
            body: serializeBlocksToBody(textBlocks),
            summary: generatedDraft.summary,
            promptUsed: generatedDraft.promptUsed,
            aiModel: generatedDraft.aiModel,
            aiTokensUsed: generatedDraft.aiTokensUsed,
            imageUrl: null,
        };

        await saveDraftWithImage(payload, blocks);
    };

    const handlePreview = (blocks: ContentBlock[], title: string) => {
        setPreviewBlocks(blocks);
        setPreviewTitle(title);
        setTimeout(() => {
            document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const event = currentEvent as any;
    const isSaving = isSavingWithImage || loading.createDraft || loading.uploadImage || loading.updateContent;

    const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
        { id: "content", label: "Tạo nội dung AI", icon: <MdOutlineBolt className="text-base" /> },
        { id: "image", label: "Tạo ảnh AI", icon: <MdOutlineImage className="text-base" /> },
        { id: "manual", label: "Tự soạn", icon: <MdOutlineEdit className="text-base" /> },
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left — Event info */}
                <div className="space-y-5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Thông tin sự kiện
                    </span>
                    {loading.fetchDetail ? (
                        <p className="text-slate-500 text-sm animate-pulse">Đang tải...</p>
                    ) : event ? (
                        <>
                            <ReadOnlyField label="Tên sự kiện" value={event.title} />
                            <ReadOnlyField label="Mô tả" value={event.description} />
                            <ReadOnlyField label="Địa điểm" value={event.location} />
                            <div className="grid grid-cols-2 gap-4">
                                <ReadOnlyTags label="Danh mục" icon={MdOutlineCategory} items={event.categories ?? []} />
                                <ReadOnlyTags label="Hashtags" icon={MdOutlineTag} items={event.hashtags ?? []} />
                            </div>
                            <ActorList actors={event.actorImages ?? []} />
                            <SessionList sessions={event.sessions ?? []} />
                        </>
                    ) : (
                        <p className="text-slate-600 text-sm">Không tìm thấy thông tin sự kiện.</p>
                    )}
                </div>

                {/* Right — Tabs */}
                <div className="bg-primary/5 rounded-3xl border border-primary/10 overflow-hidden">
                    {/* Tab bar */}
                    <div className="flex border-b border-primary/10">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold
                                                transition-all border-b-2
                                                ${isActive
                                            ? "border-primary text-primary bg-primary/5"
                                            : "border-transparent text-slate-500 hover:text-slate-300"}`}
                                >
                                    {tab.icon}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    {tab.id === "image" && selectedImageUrl && (
                                        <span className="w-2 h-2 rounded-full bg-green-400 ml-0.5" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <MdOutlineSmartToy className="text-primary text-sm" />
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">
                                {activeTab === "manual" ? "Soạn thủ công" : "AI Assistant"}
                            </span>
                        </div>

                        {activeTab === "content" && (
                            <AIContentTab
                                generatedDraft={generatedDraft}
                                loading={loading}
                                error={error}
                                selectedImageUrl={selectedImageUrl}
                                showUploadSection={false}
                                onGenerate={handleGenerate}
                                onPreview={(blocks, title) =>
                                    handlePreview(injectImageBlock(blocks, selectedImageUrl), title)
                                }
                                onSaveDraft={handleSaveDraftFromAI}
                                onSelectImage={setSelectedImageUrl}
                                onClearImage={() => { setSelectedImageUrl(null); setPendingImageFile(null); }}
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
                                onClearImage={() => { setSelectedImageUrl(null); setPendingImageFile(null); }}
                            />
                        )}

                        {activeTab === "manual" && (
                            <ManualTab
                                loading={{ ...loading, createDraft: isSaving }}
                                selectedImageUrl={selectedImageUrl}
                                onPreview={handlePreview}
                                onSaveDraft={handleSaveDraftFromManual}
                                onSelectImage={setSelectedImageUrl}
                                onClearImage={() => { setSelectedImageUrl(null); setPendingImageFile(null); }}
                                onFileSelected={(f) => setPendingImageFile(f)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Preview */}
            {previewBlocks && previewBlocks.length > 0 && (
                <>
                    <div id="preview" className="mt-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <MdOutlineSmartToy className="text-primary" />
                                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                                    Preview bài đăng
                                </span>
                            </div>
                            <button
                                onClick={() => setPreviewBlocks(null)}
                                className="text-xs text-slate-500 hover:text-slate-300 transition"
                            >
                                Đóng preview
                            </button>
                        </div>
                        <div className="bg-card-dark border border-slate-800 rounded-3xl p-8">
                            {previewTitle && (
                                <p className="text-xs text-slate-500 mb-4 font-semibold uppercase tracking-widest">
                                    {previewTitle}
                                </p>
                            )}
                            <PostBlockRenderer blocks={previewBlocks} />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}