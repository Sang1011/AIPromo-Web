import { useEffect, useRef, useState } from "react";
import { GrFormNextLink } from "react-icons/gr";
import {
    MdOutlineBolt,
    MdOutlineCategory,
    MdOutlineCheckCircle,
    MdOutlineEdit,
    MdOutlineImage,
    MdOutlinePerson,
    MdOutlineSmartToy,
    MdOutlineTag,
    MdOutlineClose,
    MdOutlineRefresh,
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
    uploadImagePost,
} from "../../../store/postSlice";
import type { GetEventDetailResponse } from "../../../types/event/event";
import type { ContentBlock, CreatePostDraftRequest, UpdatePostContentRequest } from "../../../types/post/post";
import { buildContextPrompt } from "../../../utils/buildContextPrompt";
import { formatDateTime } from "../../../utils/formatDateTime";
import { notify } from "../../../utils/notify";
import { saveImagePosition } from "../../../utils/postImagePosition";
import { serializeBlocksToBody } from "../../../utils/renderPostContent";
import { TONE_OPTIONS } from "./AIContentTab";
import AIImageTab from "./AIImageTab";
import BlockEditor from "./BlockEditor";
import UploadImageSection from "./UploadImageSection";

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

// ─── Image Hint Banner ────────────────────────────────────────────────────────
// Dùng chung cho AIContentTab và ManualTab để gợi ý user về ảnh

function ImageHintBanner({
    selectedImageUrl,
    onClearImage,
    onFileSelected,
    onSelectImage,
}: {
    selectedImageUrl: string | null;
    onClearImage: () => void;
    onFileSelected: (f: File) => void;
    onSelectImage: (url: string) => void;
}) {
    return (
        <div className="bg-slate-900/50 border border-slate-700/60 rounded-2xl px-4 py-3.5 space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-primary font-semibold">💡 Ảnh bài đăng:</span>{" "}
                Upload từ máy hoặc chọn ảnh AI từ tab{" "}
                <span className="text-slate-200 font-medium">Tạo ảnh AI</span> bên cạnh.
            </p>
            <UploadImageSection
                selectedImageUrl={selectedImageUrl}
                onSelectImage={onSelectImage}
                onClearImage={onClearImage}
                onFileSelected={onFileSelected}
            />

            {/* Selected image preview chip */}
            {selectedImageUrl && (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20
                                rounded-xl px-3 py-2 text-xs text-green-400">
                    <img
                        src={selectedImageUrl}
                        alt="selected"
                        className="w-9 h-9 rounded-lg object-cover border border-green-500/30 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold">Đã chọn ảnh</p>
                        <p className="text-green-500/70 truncate text-[10px]">
                            {selectedImageUrl.startsWith("blob:")
                                ? "Ảnh từ máy — sẽ upload khi lưu"
                                : "Ảnh AI — sẽ đưa vào bài viết"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClearImage}
                        className="shrink-0 p-1 rounded-lg text-green-500/60 hover:text-red-400
                                   hover:bg-red-500/10 transition-all"
                        title="Bỏ ảnh"
                    >
                        <MdOutlineClose className="text-sm" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── AI Content Tab (gộp generate + edit, không có steps) ────────────────────
// Layout: ImageHint → Tone → Prompt → Generate button
//         Khi có kết quả → Title + BlockEditor (text-only) animate vào bên dưới

function AIContentSection({
    generatedDraft,
    loading,
    error,
    selectedImageUrl,
    isSaving,
    onGenerate,
    onSaveDraft,
    onSelectImage,
    onClearImage,
    onFileSelected,
}: {
    generatedDraft: any;
    loading: any;
    error: any;
    selectedImageUrl: string | null;
    isSaving: boolean;
    onGenerate: (tone: string, userPrompt: string) => void;
    onSaveDraft: (blocks: ContentBlock[], title: string) => void;
    onClearGeneratedDraft: () => void;
    onSelectImage: (url: string) => void;
    onClearImage: () => void;
    onFileSelected: (f: File) => void;
}) {
    const editorRef = useRef<{ getBlocks: () => ContentBlock[] } | null>(null);
    const [tone, setTone] = useState("");
    const [userPrompt, setUserPrompt] = useState("");
    const [title, setTitle] = useState("");

    // Khi draft mới được generate → seed title
    useEffect(() => {
        if (generatedDraft?.title) {
            setTitle(generatedDraft.title);
        }
    }, [generatedDraft?.title]);

    // Parse blocks từ generatedDraft (text only, không có image block)
    const initialBlocks: ContentBlock[] = (() => {
        if (!generatedDraft?.body) return [];
        try {
            const parsed = JSON.parse(generatedDraft.body);
            return Array.isArray(parsed)
                ? parsed.filter((b: ContentBlock) => b.type !== "image")
                : [];
        } catch { return []; }
    })();

    const handleSave = () => {
        const blocks = editorRef.current?.getBlocks() ?? [];
        onSaveDraft(blocks, title);
    };

    const hasResult = !!generatedDraft;
    const isGenerating = !!loading.generateAI;

    return (
        <div className="space-y-5">
            {/* ── Ảnh: ImageHintBanner owns image cho tab này ── */}
            <ImageHintBanner
                selectedImageUrl={selectedImageUrl}
                onSelectImage={onSelectImage}
                onClearImage={onClearImage}
                onFileSelected={onFileSelected}
            />

            {/* ── Tone ── */}
            <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Phong cách{" "}
                    <span className="text-slate-500 font-normal text-xs">(tùy chọn)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setTone(tone === opt.value ? "" : opt.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                                ${tone === opt.value
                                    ? "bg-primary text-white border-primary"
                                    : "bg-background-dark border-slate-700 text-slate-400 hover:border-primary/50 hover:text-slate-200"}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Yêu cầu thêm ── */}
            <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Yêu cầu thêm{" "}
                    <span className="text-slate-500 font-normal text-xs">(tùy chọn)</span>
                </label>
                <textarea
                    rows={3}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Ví dụ: Nhấn mạnh vào giá vé ưu đãi, thêm emoji..."
                    className="w-full bg-background-dark border border-slate-800 rounded-xl
                               text-slate-100 placeholder:text-slate-600 px-4 py-3 text-sm
                               resize-none focus:outline-none focus:border-primary transition-colors"
                />
            </div>

            {/* ── Error ── */}
            {error?.generateAI && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    {error.generateAI}
                </p>
            )}

            {/* ── Generate button ── */}
            <button
                type="button"
                onClick={() => onGenerate(tone, userPrompt)}
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                           disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold
                           flex items-center justify-center gap-2 transition-all neon-button-glow"
            >
                {isGenerating
                    ? <><Spinner /><span>Đang tạo...</span></>
                    : hasResult
                        ? <><MdOutlineRefresh /><span>Tạo lại nội dung</span></>
                        : <><MdOutlineBolt /><span>Tạo nội dung với AI</span></>}
            </button>

            {/* ── Kết quả: animate vào khi có draft ── */}
            {hasResult && (
                <div className="space-y-5 animate-fadeIn">
                    {/* Success banner */}
                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3">
                        <MdOutlineCheckCircle className="text-green-400 text-xl shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-green-400 text-sm font-semibold">AI đã tạo xong!</p>
                            <p className="text-green-500/70 text-xs mt-0.5">
                                Chỉnh sửa bên dưới rồi lưu bản nháp.
                            </p>
                        </div>
                        {/* AI meta */}
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                            {generatedDraft.aiModel && (
                                <span className="text-[10px] text-slate-600">
                                    {generatedDraft.aiModel}
                                </span>
                            )}
                            {generatedDraft.aiTokensUsed && (
                                <span className="text-[10px] text-slate-600">
                                    {generatedDraft.aiTokensUsed} tokens
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-800" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            Chỉnh sửa trước khi lưu
                        </span>
                        <div className="flex-1 h-px bg-slate-800" />
                    </div>

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
                                       text-slate-100 placeholder:text-slate-600 px-4 py-3 text-sm font-semibold
                                       focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* BlockEditor — text only, image được quản lý bởi ImageHintBanner bên trên */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MdOutlineEdit className="text-slate-500 text-sm" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Nội dung (text blocks only)
                            </span>
                            <span className="ml-auto text-[10px] text-slate-600">
                                Ảnh được gắn qua phần upload bên trên
                            </span>
                        </div>
                        {/*
                            key = generatedDraft để re-mount khi generate lại
                            disableImageBlock = true → ẩn nút thêm image block trong toolbar
                            vì ảnh được quản lý bởi UploadImageSection (Single Source of Truth)
                        */}
                        <BlockEditor
                            key={generatedDraft?.promptUsed ?? "ai-draft"}
                            editorRef={editorRef}
                            initialBlocks={initialBlocks}
                            disableImageBlock
                        />
                    </div>

                    {/* Save button */}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !title.trim()}
                        className="w-full border border-primary text-primary hover:bg-primary hover:text-white
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   py-3.5 rounded-2xl font-bold text-sm
                                   flex items-center justify-center gap-2 transition-all"
                    >
                        {isSaving
                            ? <><Spinner /><span>Đang lưu...</span></>
                            : "Lưu bản nháp"}
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Manual Tab ───────────────────────────────────────────────────────────────
// BlockEditor owns image (via onImageChange callback)
// KHÔNG có UploadImageSection riêng — image block trong editor là primary

function ManualSection({
    isSaving,
    onSaveDraft,
}: {
    loading: any;
    isSaving: boolean;
    onSaveDraft: (blocks: ContentBlock[], title: string, imageFile: File | null, imageUrl: string | null) => void;
}) {
    const editorRef = useRef<{ getBlocks: () => ContentBlock[] } | null>(null);
    const [title, setTitle] = useState("");

    // Image state — owned by BlockEditor via callback
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleImageChange = (file: File | null, url: string | null) => {
        setPendingFile(file);
        setImageUrl(url);
    };

    const handleSave = () => {
        const blocks = editorRef.current?.getBlocks() ?? [];
        // Strip image blocks trước khi serialize body
        // Image được lưu riêng qua imageUrl/pendingFile
        const textBlocks = blocks.filter(b => b.type !== "image");
        onSaveDraft(textBlocks, title, pendingFile, imageUrl);
    };

    return (
        <div className="space-y-5">
            {/* Hint: image do BlockEditor quản lý */}
            <div className="flex items-center gap-2.5 bg-slate-900/40 border border-slate-700/40
                            rounded-xl px-4 py-3 text-xs text-slate-500">
                <MdOutlineImage className="text-slate-600 text-base shrink-0" />
                <span>
                    Thêm ảnh bằng cách chọn block{" "}
                    <span className="text-slate-300 font-semibold">Ảnh</span>{" "}
                    trong toolbar editor bên dưới. Kéo thả để đổi vị trí.
                </span>
            </div>

            {/* Title */}
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

            {/*
                BlockEditor với onImageChange callback
                Image block is the source of truth trong tab này
                disableImageBlock = false (default) → toolbar có nút Ảnh
            */}
            <BlockEditor
                editorRef={editorRef}
                onImageChange={handleImageChange}
            />

            <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                className="w-full border border-primary text-primary hover:bg-primary hover:text-white
                           disabled:opacity-50 disabled:cursor-not-allowed
                           py-3.5 rounded-2xl font-bold text-sm
                           flex items-center justify-center gap-2 transition-all"
            >
                {isSaving ? <><Spinner /><span>Đang lưu...</span></> : "Lưu bản nháp"}
            </button>
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
    const { generatedDraft, generatedImageUrl, loading, error } = useSelector((s: RootState) => s.POST);

    const [activeTab, setActiveTab] = useState<ActiveTab>("content");

    // ── Image state cho AI Content tab (owned by UploadImageSection) ──────────
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

    const [isSavingWithImage, setIsSavingWithImage] = useState(false);

    useEffect(() => {
        if (eventId) dispatch(fetchEventById(eventId));
        return () => {
            dispatch(clearGeneratedDraft());
            dispatch(clearGeneratedImageUrl());
        };
    }, [eventId, dispatch]);


    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleGenerate = (tone: string, userPrompt: string) => {
        if (!eventId || !currentEvent) return;
        const context = buildContextPrompt(currentEvent as GetEventDetailResponse, tone || undefined);
        const finalPrompt = userPrompt.trim()
            ? `${context}\n\nAdditional requirement: ${userPrompt.trim()}`
            : context;
        dispatch(generateContentPostUsingAI({ eventId, userPromptRequirement: finalPrompt }));
    };

    const handleSelectImage = (url: string) => {
        setSelectedImageUrl(url);
        // Nếu chọn ảnh AI (không phải blob) → clear pending file
        if (!url.startsWith("blob:")) setPendingImageFile(null);
    };

    const handleClearImage = () => {
        setSelectedImageUrl(null);
        setPendingImageFile(null);
    };

    const handleFileSelected = (file: File) => {
        setPendingImageFile(file);
        setSelectedImageUrl(URL.createObjectURL(file));
    };

    // ── Core save logic ────────────────────────────────────────────────────────

    const saveDraftCore = async (
        draftPayload: CreatePostDraftRequest,
        blocks: ContentBlock[],
        imageUrl: string | null,
        pendingFile: File | null,
    ) => {
        setIsSavingWithImage(true);
        try {
            const result = await dispatch(createPostDraft({ ...draftPayload, imageUrl: null })).unwrap();
            const postId: string = result as string;
            if (!postId) { notify.error("Không lấy được postId"); return; }

            let resolvedImageUrl: string | null =
                imageUrl && !imageUrl.startsWith("blob:") ? imageUrl : null;

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

                // Lưu image position: sau heading đầu tiên
                const headingIdx = blocks.findIndex(b => b.type === "heading");
                const insertAt = headingIdx !== -1 ? headingIdx + 1 : 0;
                saveImagePosition(postId, insertAt).catch(console.error);
            }

            notify.success("Đã lưu bản nháp!");
            navigate(postId);
        } catch (err: any) {
            notify.error(err?.message || "Lưu bản nháp thất bại");
        } finally {
            setIsSavingWithImage(false);
        }
    };

    // ── Save từ AI Content tab ─────────────────────────────────────────────────
    const handleSaveDraftFromAI = async (blocks: ContentBlock[], title: string) => {
        if (!generatedDraft || !eventId) return;
        const textBlocks = blocks.filter(b => b.type !== "image");
        const payload: CreatePostDraftRequest = {
            eventId,
            title,
            body: serializeBlocksToBody(textBlocks),
            summary: generatedDraft.summary,
            promptUsed: generatedDraft.promptUsed,
            aiModel: generatedDraft.aiModel,
            aiTokensUsed: generatedDraft.aiTokensUsed,
            imageUrl: null,
        };
        await saveDraftCore(payload, textBlocks, selectedImageUrl, pendingImageFile);
    };

    // ── Save từ Manual tab ────────────────────────────────────────────────────
    // imageFile và imageUrl được truyền từ ManualSection (owned by BlockEditor)
    const handleSaveDraftFromManual = async (
        blocks: ContentBlock[],
        title: string,
        imageFile: File | null,
        imageUrl: string | null,
    ) => {
        if (!eventId) return;
        const payload: CreatePostDraftRequest = {
            eventId,
            title,
            body: serializeBlocksToBody(blocks),
            summary: "",
            promptUsed: "",
            aiModel: "",
            aiTokensUsed: 0,
            imageUrl: null,
        };
        await saveDraftCore(payload, blocks, imageUrl, imageFile);
    };

    const event = currentEvent as any;
    const isSaving = isSavingWithImage || loading.createDraft || loading.uploadImage || loading.updateContent;

    // Dot indicator: ảnh đã chọn từ AI Image tab
    const isAIImageSelected = !!generatedImageUrl && selectedImageUrl === generatedImageUrl;

    const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
        { id: "content", label: "Tạo nội dung AI", icon: <MdOutlineBolt className="text-base" /> },
        { id: "image", label: "Tạo ảnh AI", icon: <MdOutlineImage className="text-base" /> },
        { id: "manual", label: "Tự soạn", icon: <MdOutlineEdit className="text-base" /> },
    ];

    return (
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

                                {/* Dot: AI image đang được dùng */}
                                {tab.id === "image" && isAIImageSelected && (
                                    <span className="w-2 h-2 rounded-full bg-green-400 ml-0.5" />
                                )}
                                {/* Dot: ảnh đã upload/chọn cho content tab */}
                                {tab.id === "content" && selectedImageUrl && (
                                    <span className="w-2 h-2 rounded-full bg-green-400 ml-0.5" />
                                )}
                                {/* Dot: AI đã generate */}
                                {tab.id === "content" && generatedDraft && (
                                    <span className="w-2 h-2 rounded-full bg-primary ml-0.5" />
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

                    {/* ── Tab: AI Content (1 flow liền mạch) ── */}
                    {activeTab === "content" && (
                        <AIContentSection
                            generatedDraft={generatedDraft}
                            loading={loading}
                            error={error}
                            selectedImageUrl={selectedImageUrl}
                            isSaving={isSaving}
                            onGenerate={handleGenerate}
                            onSaveDraft={handleSaveDraftFromAI}
                            onClearGeneratedDraft={() => dispatch(clearGeneratedDraft())}
                            onSelectImage={handleSelectImage}
                            onClearImage={handleClearImage}
                            onFileSelected={handleFileSelected}
                        />
                    )}

                    {/* ── Tab: AI Image ── */}
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
                                handleSelectImage(url);
                                // Sau khi chọn ảnh AI → gợi ý user quay về tab content
                            }}
                            onClearImage={handleClearImage}
                        />
                    )}

                    {/* ── Tab: Tự soạn ── */}
                    {activeTab === "manual" && (
                        <ManualSection
                            loading={loading}
                            isSaving={isSaving}
                            onSaveDraft={handleSaveDraftFromManual}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}