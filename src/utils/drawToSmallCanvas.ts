export default function drawToSmallCanvas(
    image: HTMLImageElement,
    maxSize = 500
): CanvasRenderingContext2D {
    const scale = Math.min(
        maxSize / image.width,
        maxSize / image.height,
        1
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(image.width * scale);
    canvas.height = Math.floor(image.height * scale);

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    return ctx;
}
