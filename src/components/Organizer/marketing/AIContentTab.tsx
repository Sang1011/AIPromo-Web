import { useState } from "react";
import { MdOutlineBolt, MdOutlineClose, MdOutlineSmartToy } from "react-icons/md";
import type { ContentBlock } from "../../../types/post/post";
import UploadImageSection from "./UploadImageSection";

export const TONE_OPTIONS = [
    { value: "", label: "Mặc định" },
    { value: "professional", label: "Chuyên nghiệp" },
    { value: "genz", label: "Gen Z" },
    { value: "viral", label: "Viral / FOMO" },
    { value: "luxury", label: "Sang trọng" },
    { value: "minimal", label: "Tối giản" },
    { value: "aggressive", label: "Mạnh mẽ / Urgent" },
];

function Spinner() {
    return (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );
}

interface AIContentTabProps {
    generatedDraft: any;
    loading: { generateAI?: boolean; createDraft?: boolean; updateContent?: boolean; uploadImage?: boolean };
    error: { generateAI?: string | null };
    selectedImageUrl: string | null;

    onGenerate: (tone: string, userPrompt: string) => void;
    onPreview: (blocks: ContentBlock[], title: string) => void;
    onSelectImage: (url: string) => void;
    onClearImage: () => void;
    onFileSelected?: (file: File) => void;
    onSaveDraft?: (blocks: ContentBlock[]) => void;
}

export default function AIContentTab({
    generatedDraft,
    loading,
    error,
    selectedImageUrl,
    onGenerate,
    onPreview,
    onSelectImage,
    onClearImage,
    onFileSelected,
    onSaveDraft,
}: AIContentTabProps) {
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

    const isLoading = loading.generateAI;

    return (
        <div className="space-y-5">
            {/* Hint + Upload image — luôn hiển thị trong tab này */}
            <div className="bg-slate-900/50 border border-slate-700/60 rounded-2xl px-4 py-3.5 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-primary font-semibold">💡 Gợi ý:</span>{" "}
                    Bạn có thể{" "}
                    <span className="text-slate-200 font-medium">tạo ảnh AI</span> ở tab bên cạnh rồi gắn vào bài post,
                    hoặc <span className="text-slate-200 font-medium">tải ảnh trực tiếp</span> từ máy.
                </p>
                <UploadImageSection
                    selectedImageUrl={selectedImageUrl}
                    onSelectImage={onSelectImage}
                    onClearImage={onClearImage}
                    onFileSelected={onFileSelected}
                />
            </div>

            {/* Selected image indicator — nút X để bỏ ảnh */}
            {selectedImageUrl && (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20
                                rounded-xl px-4 py-2.5 text-xs text-green-400">
                    <img src={selectedImageUrl} alt="selected"
                        className="w-10 h-10 rounded-lg object-cover border border-green-500/30 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold">Đã chọn ảnh</p>
                        <p className="text-green-500/70 truncate">
                            {selectedImageUrl.startsWith("blob:")
                                ? "Ảnh từ máy — sẽ được upload khi áp dụng"
                                : "Ảnh AI — sẽ được đưa vào bài viết"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClearImage}
                        className="shrink-0 p-1 rounded-lg text-green-500/60 hover:text-red-400
                                   hover:bg-red-500/10 transition-all"
                        title="Bỏ ảnh đã chọn"
                    >
                        <MdOutlineClose className="text-base" />
                    </button>
                </div>
            )}

            {/* Tone selector */}
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
                            onClick={() => setTone(opt.value)}
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

            {/* User prompt */}
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
                               resize-none focus:ring-primary focus:border-primary transition-colors"
                />
            </div>

            {/* Error */}
            {error.generateAI && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    {error.generateAI}
                </p>
            )}

            {/* Generate button */}
            <button
                type="button"
                onClick={() => onGenerate(tone, userPrompt)}
                disabled={!!isLoading}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                           disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold
                           flex items-center justify-center gap-2 transition-all neon-button-glow"
            >
                {isLoading
                    ? <><Spinner /><span>Đang tạo...</span></>
                    : <><MdOutlineBolt /><span>Tạo nội dung với AI</span></>}
            </button>

            {/* Result */}
            {blocks.length > 0 && (
                <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <MdOutlineSmartToy className="text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Kết quả</span>
                        <span className="ml-auto text-xs text-slate-600">{blocks.length} blocks</span>
                    </div>

                    <div className="bg-background-dark border border-slate-800 rounded-xl
                                    px-4 py-3 space-y-1.5 max-h-40 overflow-y-auto">
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

                    <div className={`grid gap-3 ${onSaveDraft ? "grid-cols-2" : "grid-cols-1"}`}>
                        <button
                            type="button"
                            onClick={() => onPreview(blocks, generatedDraft?.title ?? "")}
                            className="border border-slate-700 text-slate-300 hover:border-primary/50
                                       hover:text-white py-3 rounded-2xl font-semibold text-sm
                                       flex items-center justify-center gap-2 transition-all"
                        >
                            Xem preview
                        </button>
                        {onSaveDraft && (
                            <button
                                type="button"
                                onClick={() => onSaveDraft(blocks)}
                                disabled={loading.createDraft}
                                className="border border-primary text-primary hover:bg-primary hover:text-white
                                           disabled:opacity-50 disabled:cursor-not-allowed
                                           py-3 rounded-2xl font-bold text-sm
                                           flex items-center justify-center gap-2 transition-all"
                            >
                                {loading.createDraft
                                    ? <><Spinner /><span>Đang lưu...</span></>
                                    : "Lưu bản nháp"}
                            </button>
                        )}
                    </div>

                    {generatedDraft && (
                        <div className="flex gap-4 text-xs text-slate-600">
                            {generatedDraft.aiModel && (
                                <span>Model: <span className="text-slate-400">{generatedDraft.aiModel}</span></span>
                            )}
                            {generatedDraft.aiTokensUsed && (
                                <span>Tokens: <span className="text-slate-400">{generatedDraft.aiTokensUsed}</span></span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}