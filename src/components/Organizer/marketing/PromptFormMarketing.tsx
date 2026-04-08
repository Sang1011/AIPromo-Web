import { useEffect, useState } from "react";
import { GrFormNextLink } from "react-icons/gr";
import {
    MdOutlineBolt, MdOutlineCategory,
    MdOutlineDownload, MdOutlineImage,
    MdOutlinePerson, MdOutlineSmartToy, MdOutlineTag,
    MdOutlineTextFields
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchEventById } from "../../../store/eventSlice";
import {
    clearCreatedPostId, clearGeneratedDraft, clearGeneratedImageUrl,
    createPostDraft, generateContentPostUsingAI, generateImage,
} from "../../../store/postSlice";
import type { GetEventDetailResponse } from "../../../types/event/event";
import type { ContentBlock, CreatePostDraftRequest } from "../../../types/post/post";
import { buildContextPrompt } from "../../../utils/buildContextPrompt";
import { formatDateTime } from "../../../utils/formatDateTime";
import { serializeBlocksToBody } from "../../../utils/renderPostContent";
import PostBlockRenderer from "../post/PostBlockRenderer";
import { injectImageBlock } from "../../../utils/injectImageBlock";


function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                {label}
            </label>
            <p
                className="
        w-full bg-background-dark/30 border border-slate-800 rounded-xl
        text-slate-300 px-4 py-3 text-sm leading-relaxed
        
        whitespace-pre-wrap
        break-words
    "
            >
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
                    <span key={item.id}
                        className="bg-primary/20 text-primary border border-primary/40
                                   text-xs font-semibold px-3 py-1 rounded-full">
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
                    <div key={i} className="flex items-center gap-2 bg-background-dark/40
                                            border border-slate-800 rounded-xl px-3 py-2">
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
                    <div key={s.id} className="bg-background-dark/30 border border-slate-800
                                                rounded-xl px-4 py-2 flex flex-col gap-0.5">
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

function ContentTab({
    event,
    generatedDraft,
    loading,
    error,
    selectedImageUrl,
    onGenerate,
    onSaveDraft,
    onPreview
}: {
    event: any;
    generatedDraft: any;
    loading: any;
    error: any;
    selectedImageUrl: string | null;
    onGenerate: (tone: string, userPrompt: string) => void;
    onSaveDraft: (blocks: ContentBlock[]) => void;
    onPreview: (blocks: ContentBlock[]) => void;
    onSelectImage: (url: string) => void;
    onClearImage: () => void;
}) {
    const [tone, setTone] = useState("");
    const [userPrompt, setUserPrompt] = useState("");

    const TONE_OPTIONS = [
        { value: "", label: "Mặc định" },
        { value: "professional", label: "Chuyên nghiệp" },
        { value: "genz", label: "Gen Z" },
        { value: "viral", label: "Viral / FOMO" },
        { value: "luxury", label: "Sang trọng" },
        { value: "minimal", label: "Tối giản" },
        { value: "aggressive", label: "Mạnh mẽ / Urgent" },
    ];

    const blocks: ContentBlock[] = generatedDraft
        ? (() => {
            try {
                const parsed = JSON.parse(generatedDraft.body);
                return Array.isArray(parsed) ? parsed : [];
            } catch { return []; }
        })()
        : [];

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-700/60 rounded-2xl px-4 py-3.5 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-primary font-semibold">💡 Gợi ý:</span>{" "}
                    Bạn có thể{" "}
                    <span className="text-slate-200 font-medium">tạo ảnh AI</span> ở tab bên cạnh rồi chọn dùng cho bài post.
                    Ảnh sẽ được lưu kèm theo bản nháp khi bạn bấm lưu.
                </p>
            </div>

            {selectedImageUrl && (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20
                                rounded-xl px-4 py-2.5 text-xs text-green-400">
                    <img src={selectedImageUrl} alt="selected"
                        className="w-10 h-10 rounded-lg object-cover border border-green-500/30" />
                    <div>
                        <p className="font-semibold">Đã chọn ảnh AI</p>
                        <p className="text-green-500/70">Ảnh sẽ được lưu kèm bài viết khi tạo bản nháp</p>
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
                    className="w-full bg-background-dark border border-slate-800 rounded-xl
                               text-slate-100 placeholder:text-slate-600 px-4 py-3 text-sm
                               resize-none focus:ring-primary focus:border-primary transition-colors" />
            </div>

            {error.generateAI && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    Không thể tạo nội dung AI
                </p>
            )}

            <button type="button" onClick={() => onGenerate(tone, userPrompt)}
                disabled={loading.generateAI || !event}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                           disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold
                           flex items-center justify-center gap-2 transition-all neon-button-glow">
                {loading.generateAI ? (
                    <><Spinner /><span>Đang tạo...</span></>
                ) : (
                    <><MdOutlineBolt /><span>Tạo nội dung với AI</span></>
                )}
            </button>

            {blocks.length > 0 && (
                <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <MdOutlineSmartToy className="text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Kết quả</span>
                        <span className="ml-auto text-xs text-slate-600">{blocks.length} blocks</span>
                    </div>

                    <div className="bg-background-dark border border-slate-800 rounded-xl
                                    px-4 py-3 space-y-1.5 max-h-48 overflow-y-auto">
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

                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => onPreview(blocks)}
                            className="border border-slate-700 text-slate-300 hover:border-primary/50
                                       hover:text-white py-3 rounded-2xl font-semibold text-sm
                                       flex items-center justify-center gap-2 transition-all">
                            Xem preview
                        </button>
                        <button type="button" onClick={() => onSaveDraft(blocks)}
                            disabled={loading.createDraft}
                            className="border border-primary text-primary hover:bg-primary hover:text-white
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       py-3 rounded-2xl font-bold text-sm
                                       flex items-center justify-center gap-2 transition-all">
                            {loading.createDraft ? <><Spinner /><span>Đang lưu...</span></> : "Lưu bản nháp"}
                        </button>
                    </div>

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

const ASPECT_OPTIONS = ["1:1", "16:9", "9:16", "4:3"];
const SIZE_OPTIONS = ["512x512", "768x768", "1024x1024", "1024x576"];

function ImageTab({
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
    const [aspectRatio, setAspectRatio] = useState("1:1");
    const [imageSize, setImageSize] = useState("512x512");

    const isSelected = selectedImageUrl === generatedImageUrl && !!generatedImageUrl;

    return (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Mô tả ảnh <span className="text-red-400">*</span>
                </label>
                <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ví dụ: A vibrant music festival at night with colorful stage lights and a large crowd..."
                    className="w-full bg-background-dark border border-slate-800 rounded-xl
                               text-slate-100 placeholder:text-slate-600 px-4 py-3 text-sm
                               resize-none focus:ring-primary focus:border-primary transition-colors" />
                <p className="text-slate-600 text-xs mt-1">Mô tả bằng tiếng Anh để kết quả tốt hơn.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                        Tỉ lệ khung hình
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {ASPECT_OPTIONS.map((opt) => (
                            <button key={opt} type="button" onClick={() => setAspectRatio(opt)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                                    ${aspectRatio === opt
                                        ? "bg-primary text-white border-primary"
                                        : "bg-background-dark border-slate-700 text-slate-400 hover:border-primary/50"
                                    }`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                        Kích thước
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {SIZE_OPTIONS.map((opt) => (
                            <button key={opt} type="button" onClick={() => setImageSize(opt)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                                    ${imageSize === opt
                                        ? "bg-primary text-white border-primary"
                                        : "bg-background-dark border-slate-700 text-slate-400 hover:border-primary/50"
                                    }`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error.generateImage && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    Không thể tạo ảnh AI
                </p>
            )}

            <button type="button"
                onClick={() => onGenerate(prompt, aspectRatio, imageSize)}
                disabled={loading.generateImage || !prompt.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                           disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold
                           flex items-center justify-center gap-2 transition-all neon-button-glow">
                {loading.generateImage ? (
                    <><Spinner /><span>Đang tạo ảnh...</span></>
                ) : (
                    <><MdOutlineImage /><span>Tạo ảnh với AI</span></>
                )}
            </button>

            {generatedImageUrl && (
                <div className="space-y-3 animate-fadeIn">
                    <div className="rounded-2xl overflow-hidden border border-slate-800">
                        <img src={generatedImageUrl} alt="AI generated"
                            className="w-full object-cover" />
                    </div>

                    <a
                        href={generatedImageUrl}
                        download="ai-generated-image.png"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 border border-slate-700
                       text-slate-300 hover:border-primary/50 hover:text-white
                       py-2.5 rounded-2xl font-semibold text-sm transition-all"
                    >
                        <MdOutlineDownload className="text-base" />
                        Tải ảnh xuống
                    </a>

                    <div className="grid grid-cols-2 gap-3">
                        {isSelected ? (
                            <button type="button" onClick={onClearImage}
                                className="col-span-2 border border-red-500/40 text-red-400
                               hover:bg-red-500/10 py-3 rounded-2xl font-semibold
                               text-sm transition-all">
                                Bỏ chọn ảnh này
                            </button>
                        ) : (
                            <>
                                <button type="button"
                                    onClick={() => onSelectImage(generatedImageUrl)}
                                    className="bg-green-600 hover:bg-green-500 text-white
                                   py-3 rounded-2xl font-bold text-sm transition-all">
                                    Dùng ảnh này cho bài Post
                                </button>
                                <button type="button"
                                    onClick={() => onGenerate(prompt, aspectRatio, imageSize)}
                                    disabled={loading.generateImage || !prompt.trim()}
                                    className="border border-slate-700 text-slate-300
                                   hover:border-primary/50 hover:text-white disabled:opacity-50
                                   py-3 rounded-2xl font-semibold text-sm transition-all">
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

function Spinner() {
    return (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );
}

type ActiveTab = "content" | "image";

export default function PromptFormMarketing() {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const currentEvent = useSelector((s: RootState) => s.EVENT.currentEvent);
    const { generatedDraft, generatedImageUrl, loading, error, createdPostId } =
        useSelector((s: RootState) => s.POST);

    const [activeTab, setActiveTab] = useState<ActiveTab>("content");
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (createdPostId) {
            dispatch(clearCreatedPostId());
            navigate(createdPostId);
        }
    }, [createdPostId]);

    useEffect(() => {
        if (eventId) dispatch(fetchEventById(eventId));
        return () => {
            dispatch(clearGeneratedDraft());
            dispatch(clearGeneratedImageUrl());
        };
    }, [eventId, dispatch]);

    const handleGenerate = (tone: string, userPrompt: string) => {
        if (!eventId || !currentEvent) return;
        const context = buildContextPrompt(
            currentEvent as GetEventDetailResponse,
            tone || undefined,
        );
        const finalPrompt = userPrompt.trim()
            ? `${context}\n\nAdditional requirement: ${userPrompt.trim()}`
            : context;
        dispatch(generateContentPostUsingAI({ eventId, userPromptRequirement: finalPrompt }));
    };

    const handleGenerateImage = (prompt: string, aspectRatio: string, imageSize: string) => {
        dispatch(generateImage({ prompt, aspectRatio, imageSize }));
    };

    const handleSaveDraft = async (blocks: ContentBlock[]) => {
        if (!generatedDraft || !eventId) return;
        const payload: CreatePostDraftRequest = {
            eventId,
            title: generatedDraft.title,
            body: serializeBlocksToBody(blocks),
            summary: generatedDraft.summary,
            promptUsed: generatedDraft.promptUsed,
            aiModel: generatedDraft.aiModel,
            aiTokensUsed: generatedDraft.aiTokensUsed,
            imageUrl: selectedImageUrl ?? null,
        };
        dispatch(createPostDraft(payload));
    };

    const [previewBlocks, setPreviewBlocks] = useState<ContentBlock[] | null>(null);

    const handlePreview = (blocks: ContentBlock[]) => {
        const blocksWithImage = injectImageBlock(blocks, selectedImageUrl);
        setPreviewBlocks(blocksWithImage);
        setTimeout(() => {
            document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const event = currentEvent as any;

    const TABS: { id: ActiveTab; label: string; icon: any }[] = [
        { id: "content", label: "Tạo nội dung", icon: MdOutlineTextFields },
        { id: "image", label: "Tạo ảnh", icon: MdOutlineImage },
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                <div className="bg-primary/5 rounded-3xl border border-primary/10 overflow-hidden">
                    <div className="flex border-b border-primary/10">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold
                                            transition-all border-b-2
                                            ${isActive
                                            ? "border-primary text-primary bg-primary/5"
                                            : "border-transparent text-slate-500 hover:text-slate-300"
                                        }`}>
                                    <Icon className="text-base" />
                                    {tab.label}
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
                                AI Assistant
                            </span>
                        </div>

                        {activeTab === "content" && (
                            <ContentTab
                                event={event}
                                generatedDraft={generatedDraft}
                                loading={loading}
                                error={error}
                                selectedImageUrl={selectedImageUrl}
                                onGenerate={handleGenerate}
                                onSaveDraft={handleSaveDraft}
                                onPreview={handlePreview}
                                onSelectImage={(url) => setSelectedImageUrl(url)}
                                onClearImage={() => setSelectedImageUrl(null)}
                            />
                        )}

                        {activeTab === "image" && (
                            <ImageTab
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
                                className="text-xs text-slate-500 hover:text-slate-300 transition">
                                Đóng preview
                            </button>
                        </div>
                        <div className="bg-card-dark border border-slate-800 rounded-3xl p-8">
                            <PostBlockRenderer blocks={previewBlocks} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="button" onClick={() => handleSaveDraft(previewBlocks)}
                            disabled={loading.createDraft}
                            className="mt-4 px-10 border text-white bg-primary hover:bg-primary/70 hover:text-white
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       py-3 rounded-2xl font-bold text-sm
                                       flex items-center justify-center gap-2 transition-all">
                            {loading.createDraft ? <><Spinner /><span>Đang lưu...</span></> : "Lưu bản nháp"}
                        </button>
                    </div>
                </>
            )}
        </>
    );
}