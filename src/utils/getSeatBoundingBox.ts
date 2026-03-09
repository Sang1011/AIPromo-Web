import type { Seat } from "../types/organizer/seatmap";

export const getSeatsBoundingBox = (seats: Seat[], sectionId: string) => {
    const sectionSeats = seats.filter(s => s.sectionId === sectionId);
    if (sectionSeats.length === 0) return null;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    sectionSeats.forEach(seat => {
        minX = Math.min(minX, seat.x);
        minY = Math.min(minY, seat.y);
        maxX = Math.max(maxX, seat.x + seat.width);
        maxY = Math.max(maxY, seat.y + seat.height);
    });

    return { minX, minY, maxX, maxY };
};
