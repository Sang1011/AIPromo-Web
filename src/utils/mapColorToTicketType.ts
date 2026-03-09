import type { TicketType } from "../types/organizer/seatmap";

function normalize(color: string) {
    return color.toLowerCase().replace("#", "");
}

export function mapColorToTicketType(
    color: string,
    ticketTypes: TicketType[]
): TicketType | null {
    return (
        ticketTypes.find(t => normalize(t.color) === normalize(color)) ?? null
    );
}
