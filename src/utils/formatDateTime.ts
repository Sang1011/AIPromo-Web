export function formatDateTime(dateStr: string | Date | null): string {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${hh}:${mm} — ${days[d.getDay()]}, ${dd}/${mo}/${yyyy}`;
}