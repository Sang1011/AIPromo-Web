import { useState } from "react";
import { MdOutlineDownload, MdOutlineImage } from "react-icons/md";

function Spinner() {
    return (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );
}

const ASPECT_OPTIONS = ["1:1", "16:9", "9:16", "4:3"] as const;
const SIZE_OPTIONS = ["512x512", "768x768", "1024x1024", "1024x576"] as const;

interface AIImageTabProps {
    generatedImageUrl: string | null;
    selectedImageUrl: string | null;
    loading: { generateImage?: boolean };
    error: { generateImage?: string | null };
    onGenerate: (prompt: string, aspectRatio: string, imageSize: string) => void;
    onSelectImage: (url: string) => void;
    onClearImage: () => void;
}

export default function AIImageTab({
    generatedImageUrl,
    selectedImageUrl,
    loading,
    error,
    onGenerate,
    onSelectImage,
    onClearImage,
}: AIImageTabProps) {
    const [prompt, setPrompt] = useState("");
    const [aspectRatio, setAspectRatio] = useState<string>("1:1");
    const [imageSize, setImageSize] = useState<string>("512x512");

    const isSelected = !!generatedImageUrl && selectedImageUrl === generatedImageUrl;

    return (
        <div className="space-y-5">
            {/* Prompt */}
            <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Mô tả ảnh <span className="text-red-400">*</span>
                </label>
                <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ví dụ: A vibrant music festival at night with colorful stage lights and a large crowd..."
                    className="w-full bg-background-dark border border-slate-800 rounded-xl
                               text-slate-100 placeholder:text-slate-600 px-4 py-3 text-sm
                               resize-none focus:ring-primary focus:border-primary transition-colors"
                />
                <p className="text-slate-600 text-xs mt-1">
                    Mô tả bằng tiếng Anh để kết quả tốt hơn.
                </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                        Tỉ lệ khung hình
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {ASPECT_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setAspectRatio(opt)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                                    ${aspectRatio === opt
                                        ? "bg-primary text-white border-primary"
                                        : "bg-background-dark border-slate-700 text-slate-400 hover:border-primary/50"}`}
                            >
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
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setImageSize(opt)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                                    ${imageSize === opt
                                        ? "bg-primary text-white border-primary"
                                        : "bg-background-dark border-slate-700 text-slate-400 hover:border-primary/50"}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error */}
            {error.generateImage && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    {error.generateImage}
                </p>
            )}

            {/* Generate button */}
            <button
                type="button"
                onClick={() => onGenerate(prompt, aspectRatio, imageSize)}
                disabled={loading.generateImage || !prompt.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                           disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold
                           flex items-center justify-center gap-2 transition-all neon-button-glow"
            >
                {loading.generateImage
                    ? <><Spinner /><span>Đang tạo ảnh...</span></>
                    : <><MdOutlineImage /><span>Tạo ảnh với AI</span></>}
            </button>

            {/* Result */}
            {generatedImageUrl && (
                <div className="space-y-3 animate-fadeIn">
                    <div className="rounded-2xl overflow-hidden border border-slate-800">
                        <img src={generatedImageUrl} alt="AI generated" className="w-full object-cover" />
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
                            <button
                                type="button"
                                onClick={onClearImage}
                                className="col-span-2 border border-red-500/40 text-red-400
                                           hover:bg-red-500/10 py-3 rounded-2xl font-semibold
                                           text-sm transition-all"
                            >
                                Bỏ chọn ảnh này
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onSelectImage(generatedImageUrl)}
                                    className="bg-green-600 hover:bg-green-500 text-white
                                               py-3 rounded-2xl font-bold text-sm transition-all"
                                >
                                    Dùng ảnh này cho bài Post
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onGenerate(prompt, aspectRatio, imageSize)}
                                    disabled={loading.generateImage || !prompt.trim()}
                                    className="border border-slate-700 text-slate-300
                                               hover:border-primary/50 hover:text-white
                                               disabled:opacity-50 py-3 rounded-2xl
                                               font-semibold text-sm transition-all"
                                >
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