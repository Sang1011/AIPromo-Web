import type { Area, TicketType } from "../types/config/seatmap";
import getBoundingBox from "./getBoundingBox";
import polygonToPoints from "./polygonToPoints";

export default function createAreaFromPolygon(params: {
    id: string;
    name: string;
    color: string;
    polygon: { x: number; y: number }[];
    ticketType: TicketType;
}): Area {
    const points = polygonToPoints(params.polygon);
    const box = getBoundingBox(points);

    return {
        id: params.id,
        name: params.name,
        type: 'polygon',
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        rotation: 0,
        stroke: params.color,
        ticketTypeId: params.ticketType.id,
        price: params.ticketType.price,
        draggable: true,
        points,
        isAreaType: true,
    };
}
