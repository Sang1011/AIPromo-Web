export default function loadImageToMat(image: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot get canvas context");

    ctx.drawImage(image, 0, 0);

    const cv = window.cv;
    return cv.imread(canvas);
}
