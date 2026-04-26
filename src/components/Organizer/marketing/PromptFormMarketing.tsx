import { useEffect, useRef, useState } from "react";
import { GrFormNextLink } from "react-icons/gr";
import {
    MdOutlineBolt,
    MdOutlineCategory,
    MdOutlineCheckCircle,
    MdOutlineClose,
    MdOutlineEdit,
    MdOutlineImage,
    MdOutlinePerson,
    MdOutlineRefresh,
    MdOutlineSmartToy,
    MdOutlineTag,
    MdOutlineWarningAmber,
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
import { injectImageBlock } from "../../../utils/injectImageBlock";
import { notify } from "../../../utils/notify";
import { saveImagePosition } from "../../../utils/postImagePosition";
import { serializeBlocksToBody } from "../../../utils/renderPostContent";
import { TONE_OPTIONS } from "./AIContentTab";
import AIImageTab from "./AIImageTab";
import BlockEditor from "./BlockEditor";
import UploadImageSection from "./UploadImageSection";
import PostBlockRenderer from "../post/PostBlockRenderer";

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

// ─── ImageHintBanner ──────────────────────────────────────────────────────────

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

// ─── GeneratePreviewModal (giống PostPreviewPage) ─────────────────────────────

function GeneratePreviewModal({
    blocks,
    title,
    onConfirm,
    onCancel,
    loading,
}: {
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
                        <MdOutlineSmartToy className="text-primary" /> Xem trước nội dung AI
                    </h3>
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 text-2xl leading-none">
                        <MdOutlineClose />
                    </button>
                </div>

                {/* Token warning */}
                <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 shrink-0">
                    <MdOutlineWarningAmber className="text-amber-400 text-lg mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-amber-400">Lưu ý quan trọng</p>
                        <p className="text-xs text-amber-400/70 leading-relaxed">
                            Mỗi lần tạo nội dung đều <span className="text-amber-300 font-semibold">tiêu tốn token AI</span>.
                            Nếu không lưu bản nháp, nội dung và lịch sử sẽ <span className="text-amber-300 font-semibold">mất khi thoát trang</span>.
                            Hãy lưu ngay để chỉnh sửa sau!
                        </p>
                    </div>
                </div>

                <p className="text-xs text-slate-500 shrink-0">
                    Xem lại nội dung vừa tạo. Nhấn{" "}
                    <span className="text-primary font-semibold">Lưu bản nháp</span> để tạo bài đăng và có thể chỉnh sửa sau.
                </p>

                <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề</p>
                        <p className="text-slate-100 font-semibold text-sm bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                            {title || <span className="text-slate-600 italic">Chưa có tiêu đề</span>}
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
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 border border-slate-700 hover:border-slate-500 transition-all"
                    >
                        Chỉnh sửa thêm
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                    >
                        {loading ? <><Spinner /> Đang lưu...</> : "✓ Lưu bản nháp"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── AIContentSection (redesigned — giống PostPreviewPage flow) ───────────────

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
    const [tone, setTone] = useState("");
    const [userPrompt, setUserPrompt] = useState("");

    // Preview modal state
    const [previewData, setPreviewData] = useState<{ blocks: ContentBlock[]; title: string } | null>(null);

    // Parse blocks từ generatedDraft (text only)
    const generatedBlocks: ContentBlock[] = (() => {
        if (!generatedDraft?.body) return [];
        try {
            const parsed = JSON.parse(generatedDraft.body);
            return Array.isArray(parsed)
                ? parsed.filter((b: ContentBlock) => b.type !== "image")
                : [];
        } catch { return []; }
    })();

    const hasResult = generatedBlocks.length > 0;
    const isGenerating = !!loading.generateAI;

    const handleOpenPreview = () => {
        setPreviewData({
            blocks: generatedBlocks,
            title: generatedDraft?.title ?? "",
        });
    };

    const handleConfirmSave = () => {
        if (!previewData) return;
        onSaveDraft(previewData.blocks, previewData.title);
        // Modal sẽ tự đóng sau khi save xong (parent navigate đi)
    };

    return (
        <div className="space-y-5">
            {/* ── Image ── */}
            <ImageHintBanner
                selectedImageUrl={selectedImageUrl}
                onSelectImage={onSelectImage}
                onClearImage={onClearImage}
                onFileSelected={onFileSelected}
            />

            {/* ── Token warning banner (always visible) ── */}
            <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/15 rounded-2xl px-4 py-3">
                <MdOutlineWarningAmber className="text-amber-500/70 text-base mt-0.5 shrink-0" />
                <p className="text-xs text-amber-500/70 leading-relaxed">
                    Mỗi lần tạo nội dung tiêu tốn <span className="text-amber-400 font-semibold">token AI</span>.
                    Sau khi tạo, hãy{" "}
                    <span className="text-amber-400 font-semibold">lưu bản nháp ngay</span> — bạn có thể chỉnh sửa
                    thoải mái sau đó mà không tốn thêm token.
                </p>
            </div>

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

            {/* ── Prompt ── */}
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

            {/* ── Kết quả — giống PostPreviewPage: block list nhỏ + nút Xem preview ── */}
            {hasResult && (
                <div className="space-y-4 animate-fadeIn">
                    {/* Success + meta */}
                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3">
                        <MdOutlineCheckCircle className="text-green-400 text-xl shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-green-400 text-sm font-semibold">AI đã tạo xong!</p>
                            <p className="text-green-500/70 text-xs mt-0.5">
                                Xem preview rồi lưu bản nháp — chỉnh sửa thoải mái sau.
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                            {generatedDraft?.aiModel && (
                                <span className="text-[10px] text-slate-600">{generatedDraft.aiModel}</span>
                            )}
                            {generatedDraft?.aiTokensUsed && (
                                <span className="text-[10px] text-slate-600">{generatedDraft.aiTokensUsed} tokens</span>
                            )}
                        </div>
                    </div>

                    {/* Title preview */}
                    {generatedDraft?.title && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề</p>
                            <p className="text-slate-100 font-semibold text-sm bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 truncate">
                                {generatedDraft.title}
                            </p>
                        </div>
                    )}

                    {/* Block list (compact — giống PostPreviewPage) */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <MdOutlineSmartToy className="text-primary text-sm" />
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">Nội dung</span>
                            <span className="ml-auto text-xs text-slate-600">{generatedBlocks.length} blocks</span>
                        </div>
                        <div className="bg-background-dark border border-slate-800 rounded-xl px-4 py-3 space-y-1.5 max-h-40 overflow-y-auto">
                            {generatedBlocks.map((b, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="text-slate-600 w-4 text-right shrink-0">{i + 1}.</span>
                                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono shrink-0">
                                        {b.type}{(b as any).level ? ` h${(b as any).level}` : ""}
                                    </span>
                                    <span className="truncate text-slate-500">
                                        {(b as any).text ?? (b as any).content ?? (b as any).label ?? ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA: Xem preview → modal */}
                    <button
                        type="button"
                        onClick={handleOpenPreview}
                        className="w-full border border-slate-700 text-slate-300 hover:border-primary/50
                                   hover:text-white py-3.5 rounded-2xl font-semibold text-sm
                                   flex items-center justify-center gap-2 transition-all"
                    >
                        Xem preview & Lưu bản nháp →
                    </button>
                </div>
            )}

            {/* ── Preview Modal ── */}
            {previewData && (
                <GeneratePreviewModal
                    blocks={previewData.blocks}
                    title={previewData.title}
                    onConfirm={handleConfirmSave}
                    onCancel={() => setPreviewData(null)}
                    loading={isSaving}
                />
            )}
        </div>
    );
}

function ManualSection({
    isSaving,
    onSaveDraft,
    sharedImageUrl,
    sharedImageFile,
}: {
    loading: any;
    isSaving: boolean;
    sharedImageUrl: string | null;
    sharedImageFile: File | null;
    onSaveDraft: (blocks: ContentBlock[], title: string, imageFile: File | null, imageUrl: string | null) => void;
}) {
    const editorRef = useRef<{ getBlocks: () => ContentBlock[] } | null>(null);
    const [title, setTitle] = useState("");

    // Track image state locally — nhưng KHÔNG dùng làm key của BlockEditor
    const [pendingFile, setPendingFile] = useState<File | null>(sharedImageFile);
    const [imageUrl, setImageUrl] = useState<string | null>(sharedImageUrl);

    // Sync từ parent khi shared image thay đổi (tab AI Image → chọn ảnh)
    // Dùng ref để tránh reset state không cần thiết
    const prevSharedUrl = useRef(sharedImageUrl);
    useEffect(() => {
        if (sharedImageUrl !== prevSharedUrl.current) {
            prevSharedUrl.current = sharedImageUrl;
            setImageUrl(sharedImageUrl);
            setPendingFile(sharedImageFile);
        }
    }, [sharedImageUrl, sharedImageFile]);

    const handleImageChange = (file: File | null, url: string | null) => {
        setPendingFile(file);
        setImageUrl(url);
    };

    const handleSave = () => {
        // Lấy toàn bộ blocks từ editor (bao gồm image block nếu có)
        const allBlocks = editorRef.current?.getBlocks() ?? [];
        // Strip image blocks khi serialize — ảnh được lưu qua imageUrl riêng
        const textBlocks = allBlocks.filter(b => b.type !== "image");
        onSaveDraft(textBlocks, title, pendingFile, imageUrl);
    };

    // Initial blocks: inject image nếu có sharedImageUrl lúc mount
    // Chỉ tính 1 lần khi mount — KHÔNG thay đổi sau đó (không dùng làm key)
    const initialBlocksRef = useRef<ContentBlock[]>(
        injectImageBlock([], sharedImageUrl)
    );

    return (
        <div className="space-y-5">
            {imageUrl && (
                <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20
                                rounded-xl px-4 py-3 text-xs text-blue-400">
                    <MdOutlineImage className="text-blue-400 shrink-0" />
                    <div className="flex-1">
                        <p className="font-semibold">Ảnh đang được gắn vào bài</p>
                        <p className="text-blue-400/60 mt-0.5">
                            Kéo thả block Ảnh để đổi vị trí, xóa block Ảnh để bỏ ảnh.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2.5 bg-slate-900/40 border border-slate-700/40
                            rounded-xl px-4 py-3 text-xs text-slate-500">
                <MdOutlineImage className="text-slate-600 text-base shrink-0" />
                <span>
                    Thêm ảnh bằng block <span className="text-slate-300 font-semibold">Ảnh</span> trong toolbar,
                    hoặc ảnh AI từ tab bên cạnh sẽ tự động được gắn vào đây.
                </span>
            </div>

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
             * KEY FIX: Không dùng imageUrl làm key → BlockEditor không bao giờ unmount.
             * initialBlocks chỉ dùng lúc mount (tính 1 lần qua ref).
             * Khi user thêm image block trong editor → onImageChange cập nhật state local.
             * Khi shared image thay đổi từ tab khác → không remount, user tự thêm block ảnh.
             */}
            <BlockEditor
                editorRef={editorRef}
                initialBlocks={initialBlocksRef.current}
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

                                {tab.id === "image" && isAIImageSelected && (
                                    <span className="w-2 h-2 rounded-full bg-green-400 ml-0.5" />
                                )}
                                {tab.id === "content" && selectedImageUrl && (
                                    <span className="w-2 h-2 rounded-full bg-green-400 ml-0.5" />
                                )}
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

                    {activeTab === "image" && (
                        <AIImageTab
                            generatedImageUrl={generatedImageUrl}
                            selectedImageUrl={selectedImageUrl}
                            loading={loading}
                            error={error}
                            onGenerate={(p, a, s) =>
                                dispatch(generateImage({ prompt: p, aspectRatio: a, imageSize: s }))
                            }
                            onSelectImage={handleSelectImage}
                            onClearImage={handleClearImage}
                        />
                    )}

                    {activeTab === "manual" && (
                        <ManualSection
                            loading={loading}
                            isSaving={isSaving}
                            sharedImageUrl={selectedImageUrl}
                            sharedImageFile={pendingImageFile}
                            onSaveDraft={handleSaveDraftFromManual}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}