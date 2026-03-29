import { useEffect, useState } from "react";
import { MdOutlineBolt, MdOutlineCategory, MdOutlinePerson, MdOutlineSmartToy, MdOutlineTag } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchEventById } from "../../../store/eventSlice";
import { clearCreatedPostId, clearGeneratedDraft, createPostDraft, generateContentPostUsingAI } from "../../../store/postSlice";
import { buildContextPrompt } from "../../../utils/buildContextPrompt";
import { formatDateTime } from "../../../utils/formatDateTime";
import type { CreatePostDraftRequest } from "../../../types/post/post";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                {label}
            </label>
            <p className="w-full bg-background-dark/30 border border-slate-800 rounded-xl
                          text-slate-300 px-4 py-3 text-sm leading-relaxed">
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
               text-xs font-semibold px-3 py-1 rounded-full
               shadow-sm shadow-primary/20">
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
                        {a.image && (
                            <img src={a.image} alt={a.name}
                                className="w-7 h-7 rounded-full object-cover" />
                        )}
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
                    <div key={s.id}
                        className="bg-background-dark/30 border border-slate-800
                                    rounded-xl px-4 py-2 flex flex-col gap-0.5">
                        <p className="text-slate-200 text-sm font-medium">{s.title}</p>
                        {s.description && (
                            <p className="text-slate-500 text-xs">{s.description}</p>
                        )}
                        <p className="text-slate-500 text-xs">
                            {formatDateTime(s.startTime)} — {formatDateTime(s.endTime)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GeneratedResult({
    draft,
    onSave,
    isSaving,
}: {
    draft: any;
    onSave: () => void;
    isSaving: boolean;
}) {
    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 mb-1">
                <MdOutlineSmartToy className="text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                    Kết quả AI
                </span>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    Tiêu đề
                </label>
                <p className="w-full bg-background-dark border border-slate-700 rounded-xl
                              text-slate-100 px-4 py-3 text-sm font-medium">
                    {draft.title}
                </p>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    Nội dung
                </label>
                <p className="w-full bg-background-dark border border-slate-700 rounded-xl
                              text-slate-200 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                    {draft.body}
                </p>
            </div>

            {draft.summary && (
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                        Tóm tắt
                    </label>
                    <p className="w-full bg-background-dark border border-slate-700 rounded-xl
                                  text-slate-300 px-4 py-3 text-sm leading-relaxed">
                        {draft.summary}
                    </p>
                </div>
            )}

            <div className="flex gap-4 text-xs text-slate-600">
                {draft.aiModel && <span>Model: <span className="text-slate-400">{draft.aiModel}</span></span>}
                {draft.aiTokensUsed && <span>Tokens: <span className="text-slate-400">{draft.aiTokensUsed}</span></span>}
            </div>
            <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="w-full border border-primary text-primary hover:bg-primary hover:text-white
                           disabled:opacity-50 disabled:cursor-not-allowed
                           py-3 rounded-2xl font-bold text-sm
                           flex items-center justify-center gap-2
                           transition-all"
            >
                {isSaving ? (
                    <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span>Đang lưu...</span>
                    </>
                ) : (
                    <span>Lưu bản nháp</span>
                )}
            </button>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PromptFormMarketing() {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();

    const currentEvent = useSelector((s: RootState) => s.EVENT.currentEvent);
    const navigate = useNavigate();
    const { generatedDraft, loading, error, createdPostId } = useSelector((s: RootState) => s.POST)
    const [tone, setTone] = useState<string>("");
    const [userPrompt, setUserPrompt] = useState("");

    const TONE_OPTIONS = [
        { value: "", label: "Mặc định (AI tự chọn)" },
        { value: "professional", label: "Chuyên nghiệp" },
        { value: "genz", label: "Gen Z" },
        { value: "viral", label: "Viral / FOMO" },
        { value: "luxury", label: "Sang trọng" },
        { value: "minimal", label: "Tối giản" },
        { value: "aggressive", label: "Mạnh mẽ / Urgent" },
    ];

    useEffect(() => {
        if (createdPostId) {
            dispatch(clearCreatedPostId());
            navigate(createdPostId);
        }
    }, [createdPostId]);

    // Fetch event info on mount
    useEffect(() => {
        if (eventId) dispatch(fetchEventById(eventId));
        return () => { dispatch(clearGeneratedDraft()); };
    }, [eventId, dispatch]);

    const handleSaveDraft = async () => {
        if (!generatedDraft || !eventId) return;

        const payload: CreatePostDraftRequest = {
            eventId,
            title: generatedDraft.title,
            body: generatedDraft.body,
            summary: generatedDraft.summary,
            promptUsed: generatedDraft.promptUsed,
            aiModel: generatedDraft.aiModel,
            aiTokensUsed: generatedDraft.aiTokensUsed,
        };
        try {
            const result = await dispatch(createPostDraft(payload));
            console.log(result)
        } catch (error) {
            console.log(error);
        }
    };

    const handleGenerate = () => {
        if (!eventId) return;

        let finalPrompt: string | undefined = undefined;

        if (userPrompt.trim()) {
            if (!currentEvent) return;
            const context = buildContextPrompt(currentEvent, tone || undefined)
            finalPrompt = `${userPrompt.trim()}. ${context}`;
        } else if (tone) {
            // Không có user prompt nhưng có tone → vẫn cần build context để inject tone
            finalPrompt = currentEvent
                ? buildContextPrompt(currentEvent, tone)
                : undefined;
        }
        // Cả hai đều trống → không truyền → BE tự build

        dispatch(generateContentPostUsingAI({ eventId, userPromptRequirement: finalPrompt }));
    };

    const event = currentEvent as any;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* ── Cột trái: Thông tin Event (readonly) ── */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Thông tin sự kiện
                    </span>
                </div>

                {loading.fetchDetail ? (
                    <p className="text-slate-500 text-sm animate-pulse">Đang tải thông tin sự kiện...</p>
                ) : event ? (
                    <>
                        <ReadOnlyField label="Tên sự kiện" value={event.title} />

                        <ReadOnlyField label="Mô tả" value={event.description} />

                        <ReadOnlyField
                            label="Địa điểm"
                            value={event.location}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <ReadOnlyTags
                                label="Danh mục"
                                icon={MdOutlineCategory}
                                items={event.categories ?? []}
                            />
                            <ReadOnlyTags
                                label="Hashtags"
                                icon={MdOutlineTag}
                                items={event.hashtags ?? []}
                            />
                        </div>

                        <ActorList actors={event.actorImages ?? []} />

                        <SessionList sessions={event.sessions ?? []} />
                    </>
                ) : (
                    <p className="text-slate-600 text-sm">Không tìm thấy thông tin sự kiện.</p>
                )}
            </div>

            {/* ── Cột phải: AI Prompt + Result ── */}
            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 space-y-6">
                <div className="flex items-center space-x-2">
                    <MdOutlineSmartToy className="text-primary text-sm" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">
                        AI Assistant
                    </span>
                </div>

                {/* Prompt input */}
                <div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">
                            Phong cách viết{" "}
                            <span className="text-slate-500 font-normal text-xs">(tùy chọn)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TONE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setTone(opt.value)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                    ${tone === opt.value
                                            ? "bg-primary text-white border-primary"
                                            : "bg-background-dark border-slate-700 text-slate-400 hover:border-primary/50 hover:text-slate-200"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className="block text-sm font-semibold text-slate-400 my-2">
                        Yêu cầu thêm{" "}
                        <span className="text-slate-500 font-normal text-xs">(tùy chọn)</span>
                    </label>
                    <textarea
                        rows={4}
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="Ví dụ: Viết theo phong cách trẻ trung, dùng emoji, nhấn mạnh vào giá vé ưu đãi..."
                        className="w-full bg-background-dark border border-slate-800 rounded-xl
                                   focus:ring-primary focus:border-primary
                                   text-slate-100 placeholder:text-slate-600 px-4 py-3 text-sm
                                   resize-none transition-colors"
                    />
                    <p className="text-slate-600 text-xs mt-1.5">
                        Để trống để AI tự tạo dựa trên thông tin sự kiện.
                    </p>
                </div>

                {/* Error */}
                {error.generateAI && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20
                                  rounded-xl px-4 py-3">
                        {error.generateAI}
                    </p>
                )}

                {/* Generate button */}
                <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading.generateAI || !event}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                               disabled:cursor-not-allowed text-white
                               py-4 rounded-2xl font-bold
                               flex items-center justify-center space-x-3
                               transition-all neon-button-glow"
                >
                    {loading.generateAI ? (
                        <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                    stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            <span>Đang tạo...</span>
                        </>
                    ) : (
                        <>
                            <MdOutlineBolt />
                            <span>Tạo với AI</span>
                        </>
                    )}
                </button>

                {generatedDraft && (
                    <GeneratedResult
                        draft={generatedDraft}
                        onSave={handleSaveDraft}
                        isSaving={loading.createDraft}
                    />
                )}
            </div>
        </div>
    );
}