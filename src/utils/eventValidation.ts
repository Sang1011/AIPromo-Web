import { formatVN } from "./dateTimeVN";

export interface EventTimeWindow {
    ticketSaleStartAt: string;
    ticketSaleEndAt: string;
    eventStartAt: string;
    eventEndAt: string;
}

export interface SessionWindow {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
}

export interface FieldError<T extends string = string> {
    field: T;
    message: string;
}

export type EventTimeField = keyof EventTimeWindow;

export interface EventTimeValidationResult {
    valid: boolean;
    errors: FieldError<EventTimeField>[];
}

export interface SessionValidationResult {
    valid: boolean;
    errors: FieldError<"title" | "startTime" | "endTime">[];
}

export interface InvalidSessionsResult {
    hasConflicts: boolean;
    conflicts: Array<SessionWindow & { reasons: string[] }>;
}

const d = (v: string) => new Date(v).getTime();

// ─── 1. validateEventTime ─────────────────────────────────────────────────────

export function validateEventTime(
    event: Partial<EventTimeWindow>
): EventTimeValidationResult {
    const errors: FieldError<EventTimeField>[] = [];
    const { ticketSaleStartAt, ticketSaleEndAt, eventStartAt, eventEndAt } = event;

    if (!ticketSaleStartAt)
        errors.push({ field: "ticketSaleStartAt", message: "Vui lòng chọn thời gian bắt đầu bán vé" });
    if (!ticketSaleEndAt)
        errors.push({ field: "ticketSaleEndAt", message: "Vui lòng chọn thời gian kết thúc bán vé" });
    if (!eventStartAt)
        errors.push({ field: "eventStartAt", message: "Vui lòng chọn thời gian bắt đầu sự kiện" });
    if (!eventEndAt)
        errors.push({ field: "eventEndAt", message: "Vui lòng chọn thời gian kết thúc sự kiện" });

    if (ticketSaleStartAt && ticketSaleEndAt) {
        if (d(ticketSaleStartAt) >= d(ticketSaleEndAt))
            errors.push({
                field: "ticketSaleEndAt",
                message: "Thời gian kết thúc bán vé phải sau thời gian bắt đầu",
            });
    }

    if (ticketSaleEndAt && eventStartAt) {
        if (d(ticketSaleEndAt) > d(eventStartAt))
            errors.push({
                field: "ticketSaleEndAt",
                message: "Kết thúc bán vé phải trước hoặc trùng thời điểm bắt đầu sự kiện",
            });
    }

    if (eventStartAt && eventEndAt) {
        if (d(eventStartAt) >= d(eventEndAt))
            errors.push({
                field: "eventEndAt",
                message: "Thời gian kết thúc sự kiện phải sau thời gian bắt đầu",
            });
    }

    return { valid: errors.length === 0, errors };
}

// ─── 2. validateSession ───────────────────────────────────────────────────────

export function validateSession(
    session: Partial<SessionWindow>,
    _event: Pick<Partial<EventTimeWindow>, "eventStartAt" | "eventEndAt"> = {}
): SessionValidationResult {
    const errors: FieldError<"title" | "startTime" | "endTime">[] = [];
    const { title, startTime, endTime } = session;

    if (!title?.trim())
        errors.push({ field: "title", message: "Tiêu đề không được để trống" });

    if (!startTime) {
        errors.push({ field: "startTime", message: "Vui lòng chọn thời gian bắt đầu" });
    }

    if (!endTime) {
        errors.push({ field: "endTime", message: "Vui lòng chọn thời gian kết thúc" });
    } else if (startTime && new Date(endTime) <= new Date(startTime)) {
        errors.push({
            field: "endTime",
            message: "Thời gian kết thúc phải sau thời gian bắt đầu",
        });
    }

    return { valid: errors.length === 0, errors };
}

// ─── 3. getInvalidSessions ────────────────────────────────────────────────────

export function getInvalidSessions(
    sessions: SessionWindow[],
    event: Pick<EventTimeWindow, "eventStartAt" | "eventEndAt">
): InvalidSessionsResult {
    const { eventStartAt, eventEndAt } = event;
    const eventStart = d(eventStartAt);
    const eventEnd = d(eventEndAt);

    const conflicts = sessions.reduce<InvalidSessionsResult["conflicts"]>(
        (acc, session) => {
            const reasons: string[] = [];

            if (d(session.startTime) < eventStart)
                reasons.push(
                    `Bắt đầu (${formatVN(session.startTime)}) trước khi sự kiện mở cửa (${formatVN(eventStartAt)})`
                );

            if (d(session.endTime) > eventEnd)
                reasons.push(
                    `Kết thúc (${formatVN(session.endTime)}) sau khi sự kiện đóng cửa (${formatVN(eventEndAt)})`
                );

            if (reasons.length > 0) acc.push({ ...session, reasons });
            return acc;
        },
        []
    );

    return { hasConflicts: conflicts.length > 0, conflicts };
}

// ─── 4. errorsToFieldMap ──────────────────────────────────────────────────────

export function errorsToFieldMap<T extends string>(
    errors: FieldError<T>[]
): Partial<Record<T, string>> {
    return errors.reduce((map, { field, message }) => {
        map[field] = message;
        return map;
    }, {} as Partial<Record<T, string>>);
}

export function checkSessionOverlap(
    newSession: Pick<SessionWindow, "id" | "startTime" | "endTime">,
    existingSessions: SessionWindow[]
): SessionWindow | null {
    const newStart = d(newSession.startTime);
    const newEnd = d(newSession.endTime);

    for (const s of existingSessions) {
        if (s.id === newSession.id) continue;

        const existStart = d(s.startTime);
        const existEnd = d(s.endTime);

        if (newStart < existEnd && newEnd > existStart) {
            return s;
        }
    }
    return null;
}