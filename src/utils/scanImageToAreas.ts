import type { Area, ColorPreset, TicketType } from "../types/config/seatmap";
import buildHSVRange from "./buildHSVRange";
import detectRegionsByColor from "./detectRegionsByColor";
import { hexToHSV } from "./hexToHSV";
import loadImageToMat from "./loadImageToMat";
import { mapColorToTicketType } from "./mapColorToTicketType";
import regionToArea from "./regionToArea";

export function scanImageToAreas(
    image: HTMLImageElement,
    ticketTypes: TicketType[]
): Area[] {
    const mat = loadImageToMat(image);
    console.warn("mat", mat);
    const colorPresets: ColorPreset[] = ticketTypes.map(t => {
        const hsv = hexToHSV(t.color);
        const { lower, upper } = buildHSVRange(hsv);

        return {
            ticketTypeId: t.id,
            baseColor: t.color,
            lower: lower as [number, number, number],
            upper: upper as [number, number, number],
        };
    });

    const regions = detectRegionsByColor(mat, colorPresets);

    console.warn("regions", regions);
    const areas: Area[] = [];

    regions.forEach((region, index) => {
        const ticketType = ticketTypes.find(t => t.id === region.label);
        if (!ticketType) return;

        const area = regionToArea(region, ticketType, index);
        areas.push(area);

    });

    mat.delete();
    return areas;
}
