import {
    MdAutoAwesome, MdOutlineArchive, MdOutlineCheckCircle,
    MdOutlineEdit, MdOutlineOpenInNew, MdOutlineSend,
    MdOutlineBolt, MdOutlineImage, MdOutlineSmartToy,
    MdOutlineTextFields, MdOutlineClose,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import {
    archivePost, publishApprovedPost, requestToSubmitPost,
    updatePostContent, generateContentPostUsingAI, generateImage,
    clearGeneratedDraft, clearGeneratedImageUrl,
} from "../../../store/postSlice";
import type { ContentBlock, PostDetail, UpdatePostContentRequest } from "../../../types/post/post";
import Block from "./Block";
import { notify } from "../../../utils/notify";
import { MARKETING_STATUS_VI } from "./MarketingTable";
import { formatDateTime } from "../../../utils/formatDateTime";
import { useState } from "react";
import ConfirmModal from "../shared/ConfirmModal";
import { parseBodyToBlocks, serializeBlocksToBody } from "../../../utils/renderPostContent";
import PostBlockRenderer from "../post/PostBlockRenderer";
import { useNavigate } from "react-router-dom";
import { buildContextPrompt } from "../../../utils/buildContextPrompt";

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

// ─── EditDraftModal ───────────────────────────────────────────────────────────

function EditDraftModal({ post, onClose }: { post: PostDetail; onClose: () => void }) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((s: RootState) => s.POST);
    const [title, setTitle] = useState(post.title);
    const [body, setBody] = useState(post.body);
    const blocks = parseBodyToBlocks(post?.body);
    const isBlockContent = blocks.length > 0;

    const handleSave = async () => {
        const data: UpdatePostContentRequest = {
            title, body,
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
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Tiêu đề</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl text-slate-100 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Nội dung</label>
                        {isBlockContent && (
                            <p className="text-xs text-yellow-500/70 mb-2">
                                ⚠ Nội dung dạng JSON blocks — chỉnh sửa trực tiếp có thể làm hỏng format.
                            </p>
                        )}
                        <textarea
                            rows={10}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl text-slate-100 px-4 py-3 text-sm resize-none font-mono focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 border border-slate-700 hover:border-slate-500 transition-all"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading.updateContent}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 transition-all"
                    >
                        {loading.updateContent ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── GeneratePreviewModal — xác nhận trước khi update ────────────────────────

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
                        <MdOutlineSmartToy className="text-primary" />
                        Xác nhận nội dung mới
                    </h3>
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 text-2xl leading-none">
                        <MdOutlineClose />
                    </button>
                </div>

                <p className="text-xs text-slate-500 shrink-0">
                    Xem lại nội dung AI vừa tạo. Nhấn <span className="text-primary font-semibold">Áp dụng</span> để cập nhật bài đăng hiện tại.
                </p>

                {/* Preview content */}
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
                            {blocks.length > 0 ? (
                                <PostBlockRenderer blocks={blocks} />
                            ) : (
                                <p className="text-slate-400 text-sm">Không có nội dung để hiển thị.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 shrink-0">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 border border-slate-700 hover:border-slate-500 transition-all"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                    >
                        {loading ? <><Spinner /> Đang áp dụng...</> : "✓ Áp dụng nội dung này"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Tab: Tạo nội dung ────────────────────────────────────────────────────────

const TONE_OPTIONS = [
    { value: "", label: "Mặc định" },
    { value: "professional", label: "Chuyên nghiệp" },
    { value: "genz", label: "Gen Z" },
    { value: "viral", label: "Viral / FOMO" },
    { value: "luxury", label: "Sang trọng" },
    { value: "minimal", label: "Tối giản" },
    { value: "aggressive", label: "Mạnh mẽ / Urgent" },
];

function ContentGenerateTab({
    event,
    generatedDraft,
    loading,
    error,
    selectedImageUrl,
    onGenerate,
    onPreview,
}: {
    event: any;
    generatedDraft: any;
    loading: any;
    error: any;
    selectedImageUrl: string | null;
    onGenerate: (tone: string, userPrompt: string) => void;
    onPreview: (blocks: ContentBlock[], title: string) => void;
}) {
    const [tone, setTone] = useState("");
    const [userPrompt, setUserPrompt] = useState("");

    const blocks: ContentBlock[] = generatedDraft
        ? (() => {
            try {
                const parsed = JSON.parse(generatedDraft.body);
                return Array.isArray(parsed) ? parsed : [];
            } catch { return []; }
        })()
        : [];

    return (
        <div className="space-y-5">
            {selectedImageUrl && (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 text-xs text-green-400">
                    <img src={selectedImageUrl} alt="selected" className="w-10 h-10 rounded-lg object-cover border border-green-500/30" />
                    <div>
                        <p className="font-semibold">Đã chọn ảnh AI</p>
                        <p className="text-green-500/70">Ảnh sẽ được đưa vào bài viết khi tạo</p>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Phong cách <span className="text-slate-500 font-normal text-xs">(tùy chọn)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => setTone(opt.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                                ${tone === opt.value
                                    ? "bg-primary text-white border-primary"
                                    : "bg-background-dark border-slate-700 text-slate-400 hover:border-primary/50 hover:text-slate-200"
                                }`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Yêu cầu thêm <span className="text-slate-500 font-normal text-xs">(tùy chọn)</span>
                </label>
                <textarea rows={3} value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Ví dụ: Nhấn mạnh vào giá vé ưu đãi, thêm emoji..."
                    className="w-full bg-background-dark border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 px-4 py-3 text-sm resize-none focus:ring-primary focus:border-primary transition-colors" />
            </div>

            {error?.generateAI && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    {error.generateAI}
                </p>
            )}

            <button type="button" onClick={() => onGenerate(tone, userPrompt)}
                disabled={loading?.generateAI || !event}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all neon-button-glow">
                {loading?.generateAI
                    ? <><Spinner /><span>Đang tạo...</span></>
                    : <><MdOutlineBolt /><span>Tạo nội dung với AI</span></>
                }
            </button>

            {blocks.length > 0 && (
                <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <MdOutlineSmartToy className="text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Kết quả</span>
                        <span className="ml-auto text-xs text-slate-600">{blocks.length} blocks</span>
                    </div>

                    <div className="bg-background-dark border border-slate-800 rounded-xl px-4 py-3 space-y-1.5 max-h-40 overflow-y-auto">
                        {blocks.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="text-slate-600 w-4 text-right">{i + 1}.</span>
                                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                                    {b.type}{b.level ? ` h${b.level}` : ""}
                                </span>
                                <span className="truncate text-slate-500">
                                    {b.text ?? b.content ?? b.label ?? b.alt ?? ""}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => onPreview(blocks, generatedDraft?.title ?? "")}
                        className="w-full border border-primary text-primary hover:bg-primary hover:text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                        Xem preview & Áp dụng
                    </button>

                    {generatedDraft && (
                        <div className="flex gap-4 text-xs text-slate-600">
                            {generatedDraft.aiModel && <span>Model: <span className="text-slate-400">{generatedDraft.aiModel}</span></span>}
                            {generatedDraft.aiTokensUsed && <span>Tokens: <span className="text-slate-400">{generatedDraft.aiTokensUsed}</span></span>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Tab: Tạo ảnh ─────────────────────────────────────────────────────────────

const ASPECT_OPTIONS = ["1:1", "16:9", "9:16", "4:3"];
const SIZE_OPTIONS = ["512x512", "768x768", "1024x1024", "1024x576"];

function ImageGenerateTab({
    generatedImageUrl,
    selectedImageUrl,
    loading,
    error,
    onGenerate,
    onSelectImage,
    onClearImage,
}: {
    generatedImageUrl: string | null;
    selectedImageUrl: string | null;
    loading: any;
    error: any;
    onGenerate: (prompt: string, aspectRatio: string, imageSize: string) => void;
    onSelectImage: (url: string) => void;
    onClearImage: () => void;
}) {
    const [prompt, setPrompt] = useState("");
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [imageSize, setImageSize] = useState("1024x576");
    const isSelected = selectedImageUrl === generatedImageUrl && !!generatedImageUrl;

    return (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Mô tả ảnh <span className="text-red-400">*</span>
                </label>
                <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ví dụ: A vibrant music festival at night with colorful stage lights..."
                    className="w-full bg-background-dark border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 px-4 py-3 text-sm resize-none focus:ring-primary focus:border-primary transition-colors" />
                <p className="text-slate-600 text-xs mt-1">Mô tả bằng tiếng Anh để kết quả tốt hơn.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Tỉ lệ khung hình</label>
                    <div className="flex flex-wrap gap-2">
                        {ASPECT_OPTIONS.map((opt) => (
                            <button key={opt} type="button" onClick={() => setAspectRatio(opt)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                                    ${aspectRatio === opt ? "bg-primary text-white border-primary" : "bg-background-dark border-slate-700 text-slate-400 hover:border-primary/50"}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Kích thước</label>
                    <div className="flex flex-wrap gap-2">
                        {SIZE_OPTIONS.map((opt) => (
                            <button key={opt} type="button" onClick={() => setImageSize(opt)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                                    ${imageSize === opt ? "bg-primary text-white border-primary" : "bg-background-dark border-slate-700 text-slate-400 hover:border-primary/50"}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error?.generateImage && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    {error.generateImage}
                </p>
            )}

            <button type="button" onClick={() => onGenerate(prompt, aspectRatio, imageSize)}
                disabled={loading?.generateImage || !prompt.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all neon-button-glow">
                {loading?.generateImage
                    ? <><Spinner /><span>Đang tạo ảnh...</span></>
                    : <><MdOutlineImage /><span>Tạo ảnh với AI</span></>
                }
            </button>

            {generatedImageUrl && (
                <div className="space-y-3 animate-fadeIn">
                    <div className="rounded-2xl overflow-hidden border border-slate-800">
                        <img src={generatedImageUrl} alt="AI generated" className="w-full object-cover" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {isSelected ? (
                            <button type="button" onClick={onClearImage}
                                className="col-span-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 py-3 rounded-2xl font-semibold text-sm transition-all">
                                Bỏ chọn ảnh này
                            </button>
                        ) : (
                            <>
                                <button type="button" onClick={() => onSelectImage(generatedImageUrl)}
                                    className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-2xl font-bold text-sm transition-all">
                                    Dùng ảnh này
                                </button>
                                <button type="button" onClick={() => onGenerate(prompt, aspectRatio, imageSize)}
                                    disabled={loading?.generateImage || !prompt.trim()}
                                    className="border border-slate-700 text-slate-300 hover:border-primary/50 hover:text-white disabled:opacity-50 py-3 rounded-2xl font-semibold text-sm transition-all">
                                    Tạo lại
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── RegenerateModal ──────────────────────────────────────────────────────────

type ActiveTab = "content" | "image";

function RegenerateModal({
    post,
    onClose,
}: {
    post: PostDetail;
    onClose: () => void;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const { generatedDraft, generatedImageUrl, loading, error } = useSelector((s: RootState) => s.POST);
    const { loading: postLoading } = useSelector((s: RootState) => s.POST);

    const [activeTab, setActiveTab] = useState<ActiveTab>("content");
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    // Preview state — blocks + title chờ user xác nhận
    const [previewData, setPreviewData] = useState<{ blocks: ContentBlock[]; title: string } | null>(null);

    // Cleanup khi đóng modal
    const handleClose = () => {
        dispatch(clearGeneratedDraft());
        dispatch(clearGeneratedImageUrl());
        onClose();
    };

    const handleGenerate = (tone: string, userPrompt: string) => {
        // Dùng post.eventId để lấy context từ event hiện tại
        const context = buildContextPrompt(
            { title: post.title } as any, // fallback — bạn có thể truyền event đầy đủ nếu có
            tone || undefined,
            selectedImageUrl ?? undefined,
        );
        const finalPrompt = userPrompt.trim()
            ? `${context}\n\nAdditional requirement: ${userPrompt.trim()}`
            : context;
        dispatch(generateContentPostUsingAI({ eventId: post.eventId, userPromptRequirement: finalPrompt }));
    };

    const handleGenerateImage = (prompt: string, aspectRatio: string, imageSize: string) => {
        dispatch(generateImage({ prompt, aspectRatio, imageSize }));
    };

    // Khi user bấm "Xem preview & Áp dụng" trong ContentGenerateTab
    const handleOpenPreview = (blocks: ContentBlock[], title: string) => {
        setPreviewData({ blocks, title });
    };

    // Khi user xác nhận trong GeneratePreviewModal → updatePostContent
    const handleConfirmApply = async () => {
        if (!previewData) return;
        const newBody = serializeBlocksToBody(previewData.blocks);
        const data: UpdatePostContentRequest = {
            title: previewData.title || post.title,
            body: newBody,
            promptUsed: generatedDraft?.promptUsed ?? post.promptUsed,
            aiModel: generatedDraft?.aiModel ?? post.aiModel,
            aiTokensUsed: generatedDraft?.aiTokensUsed ?? post.aiTokensUsed,
            trackingToken: post.trackingToken,
        };
        try {
            await dispatch(updatePostContent({ postId: post.postId, data })).unwrap();
            notify.success("Đã cập nhật nội dung bài đăng!");
            setPreviewData(null);
            handleClose();
        } catch (err: any) {
            notify.error(err?.message || "Cập nhật thất bại");
        }
    };

    const TABS: { id: ActiveTab; label: string; icon: any }[] = [
        { id: "content", label: "Tạo nội dung", icon: MdOutlineTextFields },
        { id: "image", label: "Tạo ảnh", icon: MdOutlineImage },
    ];

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                <div className="bg-[#0B0B12] border border-slate-800 rounded-[32px] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 pt-7 pb-4 shrink-0">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MdOutlineSmartToy className="text-primary" />
                            Generate lại bằng AI
                        </h3>
                        <button onClick={handleClose} className="text-slate-500 hover:text-slate-300 transition-colors">
                            <MdOutlineClose className="text-2xl" />
                        </button>
                    </div>

                    {/* Info banner */}
                    <div className="mx-8 mb-4 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 shrink-0">
                        <p className="text-xs text-slate-400">
                            Đang chỉnh sửa bài đăng: <span className="text-slate-200 font-semibold">{post.title}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Nội dung mới sẽ thay thế nội dung hiện tại sau khi bạn xác nhận.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-800 mx-8 shrink-0">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2
                                        ${isActive ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                                    <Icon className="text-base" />
                                    {tab.label}
                                    {tab.id === "image" && selectedImageUrl && (
                                        <span className="w-2 h-2 rounded-full bg-green-400 ml-0.5" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab content */}
                    <div className="overflow-y-auto flex-1 px-8 py-6">
                        {activeTab === "content" && (
                            <ContentGenerateTab
                                event={{ eventId: post.eventId, title: post.title }}
                                generatedDraft={generatedDraft}
                                loading={loading}
                                error={error}
                                selectedImageUrl={selectedImageUrl}
                                onGenerate={handleGenerate}
                                onPreview={handleOpenPreview}
                            />
                        )}
                        {activeTab === "image" && (
                            <ImageGenerateTab
                                generatedImageUrl={generatedImageUrl}
                                selectedImageUrl={selectedImageUrl}
                                loading={loading}
                                error={error}
                                onGenerate={handleGenerateImage}
                                onSelectImage={(url) => setSelectedImageUrl(url)}
                                onClearImage={() => setSelectedImageUrl(null)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {previewData && (
                <GeneratePreviewModal
                    blocks={previewData.blocks}
                    title={previewData.title}
                    onConfirm={handleConfirmApply}
                    onCancel={() => setPreviewData(null)}
                    loading={!!postLoading.updateContent}
                />
            )}
        </>
    );
}

// ─── ContentDetail (main) ─────────────────────────────────────────────────────

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
    const [showRegenerateModal, setShowRegenerateModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    const statusInfo = post ? (MARKETING_STATUS_VI[post.status] ?? { label: post.status, className: "" }) : null;
    const canSubmit = post?.canSubmit && post.status === "Draft";
    const canPublish = post?.canPublish && post.status === "Approved";
    const canEdit = post?.canEdit && post.status === "Draft";
    const canArchive = post?.canArchive && post.status === "Published";

    const blocks = parseBodyToBlocks(post?.body ?? "");
    const isBlockContent = blocks.length > 0;

    return (
        <section className="space-y-6 pb-16">
            {/* Modals */}
            {showEditModal && post && (
                <EditDraftModal post={post} onClose={() => setShowEditModal(false)} />
            )}
            {showRegenerateModal && post && (
                <RegenerateModal post={post} onClose={() => setShowRegenerateModal(false)} />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="w-1.5 h-6 bg-primary rounded-full mr-3" />
                    Nội dung Quảng cáo
                </h2>
                <div className="flex items-center gap-2">
                    {/* Nút Generate lại — hiện ở mọi trạng thái cho phép edit */}
                    {post && canEdit && (
                        <button
                            onClick={() => setShowRegenerateModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold
                                       bg-primary/10 text-primary border border-primary/20
                                       hover:bg-primary/20 transition-all"
                        >
                            <MdOutlineSmartToy className="text-base" />
                            Generate lại
                        </button>
                    )}
                    {post && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary
                                         text-[11px] font-bold rounded-xl border border-primary/20">
                            <MdAutoAwesome className="text-base" />
                            Được tạo bởi AI
                        </span>
                    )}
                </div>
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

                    {/* Content */}
                    <div className="glass rounded-[32px] p-8 border border-slate-800/50 space-y-8">
                        <Block label="Tiêu đề nội dung">{post.title}</Block>
                        <Block label="Nội dung chi tiết">
                            {isBlockContent ? (
                                <div className="space-y-3">
                                    <PostBlockRenderer blocks={blocks} />
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => navigate(
                                                `/organizer/my-events/${post.eventId}/marketing/${post.postId}/post-review`,
                                                { state: { blocks, title: post.title } }
                                            )}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-primary/40 text-primary hover:bg-primary/10 transition-all"
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
                                <p className="text-slate-500 text-xs leading-relaxed whitespace-pre-wrap font-mono">{post.promptUsed}</p>
                            </Block>
                        )}
                    </div>

                    {/* Action buttons */}
                    {(canEdit || canSubmit || canPublish || canArchive) && (
                        <div className="flex justify-end gap-3 flex-wrap">
                            {canEdit && (
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-all"
                                >
                                    <MdOutlineEdit className="text-base" />
                                    Chỉnh sửa
                                </button>
                            )}
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
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-all"
                                >
                                    <MdOutlineSend className="text-base" />
                                    Yêu cầu duyệt
                                </button>
                            )}
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
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-primary text-white border border-primary hover:bg-primary/90 active:scale-95 shadow-lg shadow-primary/40 transition-all"
                                >
                                    <MdOutlineCheckCircle className="text-base" />
                                    Đăng bài lên công khai
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