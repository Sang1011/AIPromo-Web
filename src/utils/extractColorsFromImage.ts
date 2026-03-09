const extractColorsFromImage = (
    img: HTMLImageElement,
    sampleStep = 10
) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const colors: Record<string, number> = {};

    for (let i = 0; i < data.length; i += 4 * sampleStep) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 200) continue;

        const key = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${Math.round(b / 16) * 16}`;
        colors[key] = (colors[key] || 0) + 1;
    }

    return Object.entries(colors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([key]) => {
            const [r, g, b] = key.split(",").map(Number);
            return `rgb(${r},${g},${b})`;
        });
};

export { extractColorsFromImage };