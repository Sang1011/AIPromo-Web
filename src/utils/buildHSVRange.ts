export default function buildHSVRange(
    hsv: [number, number, number]
) {
    const [h] = hsv;

    return {
        lower: [
            Math.max(h - 25, 0),
            40,
            40,
        ],
        upper: [
            Math.min(h + 25, 180),
            255,
            255,
        ],
    };
}
