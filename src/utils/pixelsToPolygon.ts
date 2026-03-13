import hull from "hull.js";
export default function pixelsToPolygon(
    pixels: [number, number][]
): number[] {
    if (pixels.length < 20) return [];
    const hullPoints = hull(pixels, 30);
    return hullPoints.flat() as number[];
}
