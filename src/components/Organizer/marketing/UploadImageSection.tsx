import { useRef, useState } from "react";
import { MdOutlineCloudUpload } from "react-icons/md";
import { validateImageFile } from "../../../utils/validateImageFile";
import { notify } from "../../../utils/notify";

export default function UploadImageSection({
    selectedImageUrl,
    onSelectImage,
    onClearImage,
    onFileSelected,
}: {
    selectedImageUrl: string | null;
    onSelectImage: (url: string) => void;
    onClearImage: () => void;
    onFileSelected?: (file: File) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        const err = validateImageFile(file);
        if (err) { notify.error(err); return; }
        const localUrl = URL.createObjectURL(file);
        onSelectImage(localUrl);
        onFileSelected?.(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Hoặc tải ảnh từ máy
            </p>

            {selectedImageUrl && !selectedImageUrl.startsWith("http") ? (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20
                                rounded-xl px-3 py-2.5">
                    <img src={selectedImageUrl} alt="uploaded"
                        className="w-12 h-12 rounded-lg object-cover border border-green-500/30 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-green-400">Ảnh đã tải lên</p>
                        <p className="text-[10px] text-green-500/60 truncate">{selectedImageUrl.slice(0, 40)}...</p>
                    </div>
                    <button type="button" onClick={onClearImage}
                        className="text-slate-500 hover:text-red-400 transition-colors text-lg leading-none shrink-0">
                        ×
                    </button>
                </div>
            ) : (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl px-4 py-5 text-center
                                cursor-pointer transition-all
                                ${dragOver
                            ? "border-primary bg-primary/10"
                            : "border-slate-700 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                        }}
                    />
                    <MdOutlineCloudUpload className={`mx-auto text-2xl mb-1.5 ${dragOver ? "text-primary" : "text-slate-600"}`} />
                    <p className={`text-xs font-medium ${dragOver ? "text-primary" : "text-slate-500"}`}>
                        Kéo thả hoặc <span className="text-primary underline">chọn file</span>
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Tối đa 10MB</p>
                </div>
            )}
        </div>
    );
}