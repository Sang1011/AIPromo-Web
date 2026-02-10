import type { Area, TicketType } from "../types/organizer/seatmap";
import type { DetectedRegion } from "../types/organizer/seatmap";

export default function regionToArea(
    region: DetectedRegion,
    ticketType: TicketType,
    index: number
): Area {
    const points = region.polygon.flatMap(p => [p.x, p.y]);

    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    for (let i = 0; i < points.length; i += 2) {
        minX = Math.min(minX, points[i]);
        minY = Math.min(minY, points[i + 1]);
        maxX = Math.max(maxX, points[i]);
        maxY = Math.max(maxY, points[i + 1]);
    }

    return {
        id: `area-${index}`,
        name: region.label,
        type: "polygon",
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        rotation: 0,
        stroke: ticketType.color,
        ticketTypeId: ticketType.id,
        price: ticketType.price,
        draggable: true,
        points,
        isAreaType: true,
    };
}
