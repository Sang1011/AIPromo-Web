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
    event: Pick<Partial<EventTimeWindow>, "eventStartAt" | "eventEndAt"> = {}
): SessionValidationResult {
    const errors: FieldError<"title" | "startTime" | "endTime">[] = [];

    const { title, startTime, endTime } = session;
    const { eventStartAt, eventEndAt } = event;

    if (!title?.trim())
        errors.push({ field: "title", message: "Tiêu đề không được để trống" });

    // ── startTime validation ──────────────────────────────────────────────────
    if (!startTime) {
        errors.push({ field: "startTime", message: "Vui lòng chọn thời gian bắt đầu" });
    } else {
        // startTime phải >= eventStartAt
        if (eventStartAt && d(startTime) < d(eventStartAt))
            errors.push({
                field: "startTime",
                message: `Suất diễn phải bắt đầu từ ${formatVN(eventStartAt)} trở đi`,
            });

        // startTime phải < eventEndAt (bug cũ: thiếu check này)
        if (eventEndAt && d(startTime) >= d(eventEndAt))
            errors.push({
                field: "startTime",
                message: `Thời gian bắt đầu phải trước khi sự kiện kết thúc (${formatVN(eventEndAt)})`,
            });
    }

    // ── endTime validation ────────────────────────────────────────────────────
    if (!endTime) {
        errors.push({ field: "endTime", message: "Vui lòng chọn thời gian kết thúc" });
    } else {
        // Chỉ check endTime <= startTime khi startTime không có lỗi boundary
        // Tránh double-error gây rối người dùng
        const startHasBoundaryError = errors.some(e => e.field === "startTime");

        if (!startHasBoundaryError && startTime && d(endTime) <= d(startTime))
            errors.push({
                field: "endTime",
                message: "Thời gian kết thúc phải sau thời gian bắt đầu",
            });

        if (eventEndAt && d(endTime) > d(eventEndAt))
            errors.push({
                field: "endTime",
                message: `Suất diễn phải kết thúc trước hoặc đúng lúc ${formatVN(eventEndAt)}`,
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