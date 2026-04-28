export async function compressImage(file: File, maxWidthPx = 1920, quality = 0.82): Promise<File> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const scale = Math.min(1, maxWidthPx / img.width);
            const canvas = document.createElement("canvas");
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
                (blob) => resolve(blob ? new File([blob], file.name, { type: "image/webp" }) : file),
                "image/webp",
                quality
            );
        };
        img.src = url;
    });
}