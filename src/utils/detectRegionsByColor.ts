import type { CvMat } from "../types/opencv";
import type { ColorPreset, DetectedRegion } from "../types/config/seatmap";
import buildMask from "./buildMask";
import findPolygons from "./findPolygons";

export default function detectRegionsByColor(
    mat: CvMat,
    presets: ColorPreset[]
): DetectedRegion[] {
    const cv = window.cv;

    const rgb = new cv.Mat();
    const hsv = new cv.Mat();

    cv.cvtColor(mat, rgb, cv.COLOR_RGBA2RGB);
    cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);

    const regions: DetectedRegion[] = [];

    presets.forEach(preset => {
        // 👉 2. Build mask theo HSV range
        const mask = buildMask(hsv, preset);

        // 👉 3. Morphology để mask không bị rỗ / đứt
        const kernel = cv.getStructuringElement(
            cv.MORPH_RECT,
            new cv.Size(5, 5)
        );

        cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);
        cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);

        kernel.delete();

        // 👉 4. Find polygon
        const polygons = findPolygons(mask);

        polygons.forEach(polygon => {
            regions.push({
                color: preset.baseColor,      // HEX để render Area
                label: preset.ticketTypeId,   // map về TicketType
                polygon,
            });
        });

        mask.delete();
    });

    rgb.delete();
    hsv.delete();

    return regions;
}
