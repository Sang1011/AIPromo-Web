import { useState } from "react";
import { TiDelete } from "react-icons/ti";

export default function UploadBox({
    label,
    aspect,
    file,
    onChange,
    className = "",
    square = false,
}: {
    label: string;
    aspect: string;
    file: File | null;
    onChange: (f: File | null) => void;
    className?: string;
    square?: boolean;
}) {
    const [preview, setPreview] = useState(false);

    const imageUrl = file ? URL.createObjectURL(file) : null;

    return (
        <>
            <label
                className={`
                relative cursor-pointer rounded-xl
                border border-dashed border-white/10
                flex items-center justify-center
                text-slate-400 overflow-hidden
                ${square ? "aspect-square" : `aspect-[${aspect}]`}
                ${className}
            `}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                        onChange(e.target.files?.[0] ?? null)
                    }
                />

                {file && imageUrl ? (
                    <>
                        <img
                            src={imageUrl}
                            alt={label}
                            onClick={(e) => {
                                e.preventDefault();
                                setPreview(true);
                            }}
                            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                        />

                        {/* delete */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                onChange(null);
                            }}
                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                            <TiDelete size={24} />
                        </button>
                    </>
                ) : (
                    <span className="text-sm text-center px-4">
                        {label}
                        <br />
                        <span className="text-xs opacity-60">
                            Click để tải ảnh
                        </span>
                    </span>
                )}
            </label>

            {/* Preview modal */}
            {preview && imageUrl && (
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