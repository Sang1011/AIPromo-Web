import type { Area, Seat } from '../types/config/seatmap';

export interface SeatMapValidationError {
    type: 'duplicate_ticket_type' | 'missing_seats';
    message: string;
    areaIds?: string[];
}

export interface SeatMapValidationResult {
    valid: boolean;
    errors: SeatMapValidationError[];
}

export function validateSeatMap(
    sections: Area[],
    seats: Seat[]
): SeatMapValidationResult {
    const errors: SeatMapValidationError[] = [];

    // Chỉ validate các area có isAreaType = true
    const areaTypeSections = sections.filter(s => s.isAreaType);

    // Rule 1: Mỗi ticketType chỉ được dùng cho 1 khu vực
    const ticketTypeMap = new Map<string, Area[]>();
    for (const area of areaTypeSections) {
        if (!area.ticketTypeId) continue;
        const existing = ticketTypeMap.get(area.ticketTypeId) ?? [];
        ticketTypeMap.set(area.ticketTypeId, [...existing, area]);
    }

    for (const [_ticketTypeId, areas] of ticketTypeMap.entries()) {
        if (areas.length > 1) {
            const areaNames = areas.map(a => `"${a.name}"`).join(', ');
            errors.push({
                type: 'duplicate_ticket_type',
                message: `Loại vé đã được áp dụng cho nhiều hơn 1 khu vực: ${areaNames}. Mỗi loại vé chỉ được dùng cho 1 khu vực.`,
                areaIds: areas.map(a => a.id),
            });
        }
    }

    // Rule 2: Nếu có ít nhất 1 khu vực có ghế > 0,
    // thì tất cả các khu vực còn lại cũng phải có ghế > 0
    const seatCountByArea = new Map<string, number>();
    for (const area of areaTypeSections) {
        const count = seats.filter(s => s.sectionId === area.id).length;
        seatCountByArea.set(area.id, count);
    }

    const areasWithSeats = areaTypeSections.filter(
        a => (seatCountByArea.get(a.id) ?? 0) > 0
    );
    const areasWithoutSeats = areaTypeSections.filter(
        a => (seatCountByArea.get(a.id) ?? 0) === 0
    );

    if (areasWithSeats.length > 0 && areasWithoutSeats.length > 0) {
        const missingNames = areasWithoutSeats.map(a => `"${a.name}"`).join(', ');
        errors.push({
            type: 'missing_seats',
            message: `Các khu vực sau chưa có ghế: ${missingNames}. Vì đã có khu vực khác có ghế, tất cả khu vực phải có ít nhất 1 ghế.`,
            areaIds: areasWithoutSeats.map(a => a.id),
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}