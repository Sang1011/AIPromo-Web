import { useEffect, useState } from "react";
import { TiDelete } from "react-icons/ti";

export default function UploadBox({
    label,
    aspect,
    file,
    onChange,
    className = "",
    square = false,
    error = false,
    disabled = false,
}: {
    label: string;
    aspect: string;
    file: File | null;
    onChange: (f: File | null) => void;
    className?: string;
    square?: boolean;
    error?: boolean;
    disabled?: boolean;
}) {

    const [preview, setPreview] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setModalError("Chỉ cho phép ảnh JPEG, PNG, GIF, WebP");
            e.target.value = "";
            return;
        }

        const maxSize = 10 * 1024 * 1024;

        if (selectedFile.size > maxSize) {
            setModalError("Ảnh không được vượt quá 10MB");
            e.target.value = "";
            return;
        }

        onChange(selectedFile);
    };

    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setImageUrl(null);
            return;
        }

        const url = URL.createObjectURL(file);
        setImageUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <>
            <label
                className={`
                relative rounded-xl
                border border-dashed
                ${error ? "border-red-500" : "border-white/10"}
                flex items-center justify-center
                text-slate-400 overflow-hidden
                ${square ? "aspect-square" : `aspect-[${aspect}]`}
                ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                ${className}
            `}
            >
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    disabled={disabled}
                    onChange={handleFileChange}
                />

                {file && imageUrl ? (
                    <>
                        <img
                            src={imageUrl}
                            alt={label}
                            onClick={(e) => {
                                e.preventDefault();
                                if (!disabled) setPreview(true);
                            }}
                            className={`absolute inset-0 w-full h-full object-cover ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                        />

                        {!disabled && (
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
                        )}
                    </>
                ) : (
                    <span className="text-sm text-center px-4">
                        {label}
                        <br />
                        <span className="text-xs opacity-60">
                            {disabled ? "Không thể chỉnh sửa" : "Click để tải ảnh"}
                        </span>
                    </span>
                )}
            </label>

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

            {modalError && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#1f1f1f] p-6 rounded-xl w-[300px] text-center">
                        <p className="text-white mb-4">{modalError}</p>
                        <button
                            onClick={() => setModalError(null)}
                            className="px-4 py-2 bg-blue-500 rounded text-white"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}