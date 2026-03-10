import { useState } from "react";
import { TiDelete } from "react-icons/ti";

export default function ImagePreviewBox({
    label,
    imageUrl,
    onRemove,
    className = "",
    square = false,
    aspect = "16/9",
}: {
    label?: string;
    imageUrl: string;
    onRemove?: () => void;
    className?: string;
    square?: boolean;
    aspect?: string;
}) {
    const [preview, setPreview] = useState(false);

    return (
        <>
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

                {onRemove && (
                    <button
                        onClick={onRemove}
                        className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                        <TiDelete size={18} />
                    </button>
                )}
            </div>

            {preview && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    onClick={() => setPreview(false)}
                >
                    <img
                        src={imageUrl}
                        className="max-h-[90vh] max-w-[90vw] rounded-lg"
                    />
                </div>
            )}
        </>
    );
}