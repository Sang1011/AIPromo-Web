import type { ColorPreset } from "../types/organizer/seatmap";

export default function buildMask(hsv: any, preset: ColorPreset): any {
    const cv = window.cv;

    const lower = new cv.Mat(
        hsv.rows,
        hsv.cols,
        hsv.type(),
        [...preset.lower, 0]
    );
    const upper = new cv.Mat(
        hsv.rows,
        hsv.cols,
        hsv.type(),
        [...preset.upper, 255]
    );

    const mask = new cv.Mat();
    cv.inRange(hsv, lower, upper, mask);

    lower.delete();
    upper.delete();

    return mask;
}
