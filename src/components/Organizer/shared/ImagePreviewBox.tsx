import { useRef, useState } from "react";
import { TiDelete } from "react-icons/ti";
import { FiRefreshCw } from "react-icons/fi";

export default function ImagePreviewBox({
    label,
    imageUrl,
    onRemove,
    onUpdate,
    className = "",
    square = false,
    aspect = "16/9",
}: {
    label?: string;
    imageUrl: string;
    /** Nếu không truyền → không hiện nút X trên thumbnail */
    onRemove?: () => void;
    /** Nếu không truyền → không hiện nút "Cập nhật ảnh khác" trong preview */
    onUpdate?: (file: File) => void;
    className?: string;
    square?: boolean;
    aspect?: string;
}) {
    const [preview, setPreview] = useState(false);
    const [updating, setUpdating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onUpdate) return;
        setUpdating(true);
        setPreview(false);
        onUpdate(file);
        setUpdating(false);
        e.target.value = "";
    };

    return (
        <>
            {/* ── Thumbnail ── */}
            <div
                className={`
                    relative rounded-xl overflow-hidden border border-white/10
                    ${square ? "aspect-square" : `aspect-[${aspect}]`}
                    ${className}
                `}
            >
                <img
                    src={imageUrl}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                    onClick={() => setPreview(true)}
                />

                {/* Nút X — chỉ hiện khi có onRemove */}
                {onRemove && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/90 transition-colors"
                    >
                        <TiDelete size={18} />
                    </button>
                )}
            </div>

            {/* ── Preview modal ── */}
            {preview && (
                <div
                    className="fixed inset-0 bg-black/85 flex flex-col items-center justify-center z-50 p-4"
                    onClick={() => setPreview(false)}
                >
                    <img
                        src={imageUrl}
                        alt={label}
                        className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Nút cập nhật — chỉ hiện khi có onUpdate */}
                    {onUpdate && (
                        <div className="mt-5" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={updating}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium backdrop-blur-sm transition-all disabled:opacity-50"
                            >
                                <FiRefreshCw size={15} className={updating ? "animate-spin" : ""} />
                                Cập nhật ảnh khác
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}