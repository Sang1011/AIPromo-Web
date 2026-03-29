/**
 * dateTimeVN.ts
 * Tất cả convert datetime đều qua đây — UTC+7 cố định.
 */

const VN_OFFSET = 7 * 60; // phút

/**
 * ISO (UTC) → "YYYY-MM-DDTHH:mm" (giờ VN) — dùng cho datetime-local input
 */
export function isoToLocal(iso: string): string {
    if (!iso) return "";
    const ms = new Date(iso).getTime() + VN_OFFSET * 60_000;
    return new Date(ms).toISOString().slice(0, 16);
}

/**
 * "YYYY-MM-DDTHH:mm" (giờ VN) → ISO UTC — dùng khi gửi lên server
 */
export function localToIso(local: string): string {
    if (!local) return "";
    // Treat local string as VN time, subtract offset to get UTC
    const ms = new Date(local + ":00Z").getTime() - VN_OFFSET * 60_000;
    return new Date(ms).toISOString();
}

/**
 * Format ISO UTC → hiển thị tiếng Việt (Thứ, DD/MM/YYYY HH:mm)
 */
export function formatVN(iso: string): string {
    if (!iso) return "—";
    // Convert sang giờ VN rồi format
    const ms = new Date(iso).getTime() + VN_OFFSET * 60_000;
    return new Date(ms).toLocaleString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC", // đã offset thủ công rồi
    });
}

/**
 * Format ISO UTC → "DD/MM HH:mm" ngắn gọn
 */
export function formatShortVN(iso: string): string {
    if (!iso) return "—";
    const ms = new Date(iso).getTime() + VN_OFFSET * 60_000;
    return new Date(ms).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
    });
}