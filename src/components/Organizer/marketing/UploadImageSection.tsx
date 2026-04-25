import { useRef, useState } from "react";
import { MdOutlineCloudUpload } from "react-icons/md";
import { notify } from "../../../utils/notify";
import { validateImageFile } from "../../../utils/validateImageFile";

export default function UploadImageSection({
    selectedImageUrl,
    onSelectImage,
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
                <></>
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