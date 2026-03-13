export interface ExtractedRegion {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    color: string;
    pixels: [number, number][];
}

function isLowSaturation(r: number, g: number, b: number) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max - min < 25;
}

function isNearWhite(r: number, g: number, b: number) {
    return r > 235 && g > 235 && b > 235;
}

function isNearBlack(r: number, g: number, b: number) {
    return r < 20 && g < 20 && b < 20;
}

export default function extractRegions(
    ctx: CanvasRenderingContext2D
): ExtractedRegion[] {
    const { width, height } = ctx.canvas;
    const img = ctx.getImageData(0, 0, width, height);
    const data = img.data;

    const visited = new Uint8Array(width * height);
    const regions: ExtractedRegion[] = [];

    const idx = (x: number, y: number) => y * width + x;
    const canvasArea = width * height;

    const COLOR_THRESHOLD = 28;
    const MIN_REGION_AREA = canvasArea * 0.002; // ~0.2%
    const MAX_REGION_AREA = canvasArea * 0.45;  // bỏ nền lớn

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = idx(x, y);
            if (visited[i]) continue;

            const p = i * 4;
            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];
            const a = data[p + 3];

            visited[i] = 1;

            //  bỏ pixel trong suốt
            if (a < 200) continue;

            //  bỏ màu nhiễu
            if (
                isLowSaturation(r, g, b) ||
                isNearWhite(r, g, b) ||
                isNearBlack(r, g, b)
            ) {
                continue;
            }

            let minX = x;
            let minY = y;
            let maxX = x;
            let maxY = y;

            const regionPixels: [number, number][] = [];
            const queue: [number, number][] = [[x, y]];

            while (queue.length) {
                const [cx, cy] = queue.shift()!;
                regionPixels.push([cx, cy]);

                const neighbors = [
                    [cx + 1, cy],
                    [cx - 1, cy],
                    [cx, cy + 1],
                    [cx, cy - 1],
                ];

                for (const [nx, ny] of neighbors) {
                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

                    const ni = idx(nx, ny);
                    if (visited[ni]) continue;

                    const np = ni * 4;
                    const nr = data[np];
                    const ng = data[np + 1];
                    const nb = data[np + 2];
                    const na = data[np + 3];

                    if (na < 200) {
                        visited[ni] = 1;
                        continue;
                    }

                    if (
                        Math.abs(nr - r) < COLOR_THRESHOLD &&
                        Math.abs(ng - g) < COLOR_THRESHOLD &&
                        Math.abs(nb - b) < COLOR_THRESHOLD
                    ) {
                        visited[ni] = 1;
                        queue.push([nx, ny]);

                        minX = Math.min(minX, nx);
                        minY = Math.min(minY, ny);
                        maxX = Math.max(maxX, nx);
                        maxY = Math.max(maxY, ny);
                    }
                }
            }

            const regionArea = (maxX - minX) * (maxY - minY);

            //  bỏ vùng quá nhỏ (noise)
            if (regionArea < MIN_REGION_AREA) continue;

            //  bỏ nền quá lớn
            if (regionArea > MAX_REGION_AREA) continue;

            //  bỏ nền sát viền
            const touchesBorder =
                minX <= 1 ||
                minY <= 1 ||
                maxX >= width - 2 ||
                maxY >= height - 2;

            if (touchesBorder && regionArea > canvasArea * 0.15) continue;

            regions.push({
                minX,
                minY,
                maxX,
                maxY,
                color: `rgb(${r},${g},${b})`,
                pixels: regionPixels,
            });
        }
    }

    return regions;
}
