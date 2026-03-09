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
    return (
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

            {file ? (
                <img
                    src={URL.createObjectURL(file)}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover"
                />
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
    );
}