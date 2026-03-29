import { formatVN } from "./dateTimeVN";

export interface EventTimeWindow {
    ticketSaleStartAt: string; // ISO or datetime-local string
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
    /** Sessions whose time window falls (partly or fully) outside the new event window */
    conflicts: Array<SessionWindow & { reasons: string[] }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const d = (v: string) => new Date(v).getTime();

// ─── 1. validateEventTime ─────────────────────────────────────────────────────
/**
 * Validates the four event-level timestamps.
 *
 * Rules enforced:
 *   saleStart < saleEnd <= eventStart < eventEnd
 *
 * @example
 *   const result = validateEventTime(timeForm);
 *   if (!result.valid) showErrors(result.errors);
 */
export function validateEventTime(
    event: Partial<EventTimeWindow>
): EventTimeValidationResult {
    const errors: FieldError<EventTimeField>[] = [];

    const { ticketSaleStartAt, ticketSaleEndAt, eventStartAt, eventEndAt } =
        event;

    // Required fields
    if (!ticketSaleStartAt)
        errors.push({ field: "ticketSaleStartAt", message: "Vui lòng chọn thời gian bắt đầu bán vé" });
    if (!ticketSaleEndAt)
        errors.push({ field: "ticketSaleEndAt", message: "Vui lòng chọn thời gian kết thúc bán vé" });
    if (!eventStartAt)
        errors.push({ field: "eventStartAt", message: "Vui lòng chọn thời gian bắt đầu sự kiện" });
    if (!eventEndAt)
        errors.push({ field: "eventEndAt", message: "Vui lòng chọn thời gian kết thúc sự kiện" });

    // Cross-field rules (only when both fields are present)
    //
    // Scenario coverage:
    //   S1: saleEnd=11:00 > eventStart=10:00  → fires on ticketSaleEndAt ✅
    //   S5: saleEnd=10:00 = eventStart=10:00  → 10>10 is false → passes ✅

    if (ticketSaleStartAt && ticketSaleEndAt) {
        // Rule: saleStart < saleEnd
        if (d(ticketSaleStartAt) >= d(ticketSaleEndAt))
            errors.push({
                field: "ticketSaleEndAt",
                message: "Thời gian kết thúc bán vé phải sau thời gian bắt đầu",
            });
    }

    if (ticketSaleEndAt && eventStartAt) {
        // Rule: saleEnd <= eventStart
        // The field the user must fix is saleEnd (it is too late), not eventStart.
        if (d(ticketSaleEndAt) > d(eventStartAt))
            errors.push({
                field: "ticketSaleEndAt",
                message: "Kết thúc bán vé phải trước hoặc trùng thời điểm bắt đầu sự kiện",
            });
    }

    if (eventStartAt && eventEndAt) {
        // Rule: eventStart < eventEnd  (strict — event must have positive duration)
        if (d(eventStartAt) >= d(eventEndAt))
            errors.push({
                field: "eventEndAt",
                message: "Thời gian kết thúc sự kiện phải sau thời gian bắt đầu",
            });
    }

    return { valid: errors.length === 0, errors };
}

// ─── 2. validateSession ───────────────────────────────────────────────────────
/**
 * Validates a single session's time window against the event window.
 *
 * Rules enforced:
 *   session.startTime >= eventStartAt
 *   session.endTime   <= eventEndAt
 *   session.startTime <  session.endTime
 *
 * `event` fields are optional — if absent the boundary check is skipped,
 * allowing validation to work even before event time is set.
 *
 * @example
 *   const result = validateSession(
 *     { id, title, startTime, endTime },
 *     { eventStartAt: timeForm.eventStartAt, eventEndAt: timeForm.eventEndAt }
 *   );
 */
export function validateSession(
    session: Partial<SessionWindow>,
    event: Pick<Partial<EventTimeWindow>, "eventStartAt" | "eventEndAt"> = {}
): SessionValidationResult {
    const errors: FieldError<"title" | "startTime" | "endTime">[] = [];

    const { title, startTime, endTime } = session;
    const { eventStartAt, eventEndAt } = event;

    if (!title?.trim())
        errors.push({ field: "title", message: "Tiêu đề không được để trống" });

    // Scenario coverage:
    //   S4: start=08:00 < eventStart=10:00          → startTime error fires ✅
    //   S5: start=10:00 = eventStart=10:00           → 10<10 is false → passes ✅
    //   S3: start=12:00 < new eventStart=13:00       → startTime error fires ✅
    if (!startTime) {
        errors.push({ field: "startTime", message: "Vui lòng chọn thời gian bắt đầu" });
    } else if (eventStartAt && d(startTime) < d(eventStartAt)) {
        errors.push({
            field: "startTime",
            message: `Suất diễn phải bắt đầu từ ${formatVN(eventStartAt)} trở đi`,
        });
    }

    if (!endTime) {
        errors.push({ field: "endTime", message: "Vui lòng chọn thời gian kết thúc" });
    } else {
        // Self-overlap: only check when startTime itself has no boundary error
        // (avoids confusing double errors when both are outside the event window).
        // Rule: startTime < endTime  (strict)
        // S5: start=10:00, end=20:00 → 20<=10 is false → passes ✅
        if (startTime && d(endTime) <= d(startTime))
            errors.push({
                field: "endTime",
                message: "Thời gian kết thúc phải sau thời gian bắt đầu",
            });

        // Rule: endTime <= eventEndAt
        // S5: end=20:00 = eventEnd=20:00 → 20>20 is false → passes ✅
        if (eventEndAt && d(endTime) > d(eventEndAt))
            errors.push({
                field: "endTime",
                message: `Suất diễn phải kết thúc trước hoặc đúng lúc ${formatVN(eventEndAt)}`,
            });
    }

    return { valid: errors.length === 0, errors };
}

// ─── 3. getInvalidSessions ────────────────────────────────────────────────────
/**
 * Given a (potentially large) list of sessions and a proposed new event window,
 * returns every session that would fall outside the new boundaries.
 *
 * Does NOT mutate or delete anything — the caller decides what to do.
 *
 * Complexity: O(n) — safe for large session lists.
 *
 * @example
 *   const result = getInvalidSessions(sessions, newEventTime);
 *   if (result.hasConflicts) {
 *     // show confirmation dialog listing result.conflicts
 *   } else {
 *     proceedWithSave();
 *   }
 */
export function getInvalidSessions(
    sessions: SessionWindow[],
    event: Pick<EventTimeWindow, "eventStartAt" | "eventEndAt">
): InvalidSessionsResult {
    const { eventStartAt, eventEndAt } = event;
    const eventStart = d(eventStartAt);
    const eventEnd = d(eventEndAt);

    // Scenario coverage:
    //   S2 Session A: start=12:00 < newEventStart=13:00         → reason added ✅
    //   S2 Session B: end=19:00   > newEventEnd=17:00           → reason added ✅
    //   S2 both checks independent → partial overlap caught ✅
    //   S3: session start=12:00 after eventStart set to 13:00   → caught ✅
    //   S5: start=10:00=eventStart, end=20:00=eventEnd          → 10<10 false, 20>20 false → no conflict ✅
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
/**
 * Convenience: converts an errors array into a field→message map,
 * compatible with the existing `TimeFormErrors` / `SessionFormErrors` pattern
 * already used in the codebase.
 *
 * @example
 *   const { errors } = validateEventTime(timeForm);
 *   setTimeErrors(errorsToFieldMap(errors));
 */
export function errorsToFieldMap<T extends string>(
    errors: FieldError<T>[]
): Partial<Record<T, string>> {
    return errors.reduce((map, { field, message }) => {
        map[field] = message;
        return map;
    }, {} as Partial<Record<T, string>>);
}