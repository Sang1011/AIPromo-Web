import { useState, useRef, useEffect, useCallback } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClock } from "react-icons/fi";
import { formatDateTime } from "../../../utils/formatDateTime";

function toISOLocal(date: Date): string {
    const yyyy = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mo}-${dd}T${hh}:${mm}`;
}

interface DateTimeInputProps {
    label: string;
    value?: string;       // "YYYY-MM-DDTHH:mm"
    onChange?: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
    min?: string;
}

const MONTHS = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const POPUP_HEIGHT = 480;

export default function DateTimeInput({
    label,
    value,
    onChange,
    required,
    disabled,
    min,
}: DateTimeInputProps) {
    const [open, setOpen] = useState(false);
    const [above, setAbove] = useState(false);

    const parsed = value ? new Date(value) : null;
    const minDate = min ? new Date(min) : null;

    const [viewYear, setViewYear] = useState(() => parsed?.getFullYear() ?? new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(() => parsed?.getMonth() ?? new Date().getMonth());
    const [selDate, setSelDate] = useState<Date | null>(parsed);
    const [hour, setHour] = useState(parsed?.getHours() ?? 0);
    const [minute, setMinute] = useState(parsed?.getMinutes() ?? 0);

    const popupRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const d = value ? new Date(value) : null;
        setSelDate(d);
        if (d) {
            setHour(d.getHours());
            setMinute(d.getMinutes());
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
        }
    }, [value]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (
                popupRef.current && !popupRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const handleToggle = () => {
        if (disabled) return;
        if (!open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setAbove(window.innerHeight - rect.bottom < POPUP_HEIGHT);
        }
        setOpen(o => !o);
    };

    const emit = useCallback((date: Date, h: number, m: number) => {
        const d = new Date(date);
        d.setHours(h, m, 0, 0);
        onChange?.(toISOLocal(d));
    }, [onChange]);

    const selectDay = (day: number) => {
        const d = new Date(viewYear, viewMonth, day);
        setSelDate(d);
        emit(d, hour, minute);
    };

    const handleHour = (h: number) => {
        const clamped = ((h % 24) + 24) % 24;
        setHour(clamped);
        if (selDate) emit(selDate, clamped, minute);
    };

    const handleMinute = (m: number) => {
        const clamped = ((m % 60) + 60) % 60;
        setMinute(clamped);
        if (selDate) emit(selDate, hour, clamped);
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isDisabled = (day: number) => {
        if (!minDate) return false;
        const d = new Date(viewYear, viewMonth, day);
        d.setHours(0, 0, 0, 0);
        const m = new Date(minDate);
        m.setHours(0, 0, 0, 0);
        return d < m;
    };

    const isSelected = (day: number) =>
        selDate &&
        selDate.getFullYear() === viewYear &&
        selDate.getMonth() === viewMonth &&
        selDate.getDate() === day;

    const isToday = (day: number) => {
        const t = new Date();
        return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === day;
    };

    const confirmLabel = selDate
        ? `Xác nhận — ${formatDateTime(toISOLocal((() => { const d = new Date(selDate); d.setHours(hour, minute); return d; })()))}`
        : "Chọn ngày trước";

    return (
        <div className="flex flex-col gap-2 relative">
            {/* Label */}
            <label className="text-sm text-slate-400 select-none">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>

            {/* Trigger */}
            <div
                ref={triggerRef}
                onClick={handleToggle}
                className={`
                    relative flex items-start justify-between
                    px-4 py-3 rounded-xl
                    bg-white/5 border border-white/10
                    select-none transition-all duration-200
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white/10 hover:border-white/20"}
                    ${open ? "border-indigo-500/60" : ""}
                `}
            >
                {value ? (() => {
                    const d = new Date(value);
                    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
                    const hh = String(d.getHours()).padStart(2, "0");
                    const mm = String(d.getMinutes()).padStart(2, "0");
                    const dd = String(d.getDate()).padStart(2, "0");
                    const mo = String(d.getMonth() + 1).padStart(2, "0");
                    const yyyy = d.getFullYear();
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-base font-semibold text-white leading-tight">{hh}:{mm}</span>
                            <span className="text-sm text-slate-300">{days[d.getDay()]}, {dd}/{mo}/{yyyy}</span>
                        </div>
                    );
                })() : (
                    <span className="text-slate-500 text-sm self-center">Chọn ngày giờ</span>
                )}
                <FiCalendar className={`mt-0.5 shrink-0 transition-colors ${open ? "text-indigo-400" : "text-slate-400"}`} />
            </div>

            {/* Popup — flips above if not enough space below */}
            {open && (
                <div
                    ref={popupRef}
                    className={`
                        absolute left-0 z-50
                        bg-[#1a1d2e] border border-white/10
                        rounded-2xl shadow-2xl shadow-black/60
                        p-4 w-[320px] flex flex-col gap-4
                        ${above ? "bottom-full mb-2" : "top-full mt-2"}
                    `}
                    style={{ backdropFilter: "blur(20px)" }}
                >
                    {/* Month navigation */}
                    <div className="flex items-center justify-between">
                        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
                            <FiChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-semibold text-white tracking-wide">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
                            <FiChevronRight size={16} />
                        </button>
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {DAY_LABELS.map(d => (
                            <div key={d} className="text-center text-[11px] text-slate-500 font-medium py-1">{d}</div>
                        ))}
                        {cells.map((day, i) => {
                            if (!day) return <div key={`e-${i}`} />;
                            const dis = isDisabled(day);
                            const sel = isSelected(day);
                            const tod = isToday(day);
                            return (
                                <button
                                    key={day}
                                    onClick={() => !dis && selectDay(day)}
                                    className={`
                                        aspect-square flex items-center justify-center
                                        rounded-lg text-sm transition-all duration-150
                                        ${dis ? "text-slate-700 cursor-not-allowed"
                                            : sel ? "bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/30"
                                                : tod ? "border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20"
                                                    : "text-slate-300 hover:bg-white/10 hover:text-white"}
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <div className="border-t border-white/10" />

                    {/* Time picker 24h */}
                    <div className="flex items-center gap-2">
                        <FiClock size={14} className="text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-400 mr-auto">Giờ</span>

                        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5">
                            <button onClick={() => handleHour(hour - 1)} className="text-slate-400 hover:text-white transition">
                                <FiChevronLeft size={14} />
                            </button>
                            <span className="text-sm font-mono text-white w-6 text-center select-none">
                                {String(hour).padStart(2, "0")}
                            </span>
                            <button onClick={() => handleHour(hour + 1)} className="text-slate-400 hover:text-white transition">
                                <FiChevronRight size={14} />
                            </button>
                        </div>

                        <span className="text-slate-400 font-mono font-bold">:</span>

                        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5">
                            <button onClick={() => handleMinute(minute - 5)} className="text-slate-400 hover:text-white transition">
                                <FiChevronLeft size={14} />
                            </button>
                            <span className="text-sm font-mono text-white w-6 text-center select-none">
                                {String(minute).padStart(2, "0")}
                            </span>
                            <button onClick={() => handleMinute(minute + 5)} className="text-slate-400 hover:text-white transition">
                                <FiChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Quick presets */}
                    <div className="flex gap-1.5 flex-wrap">
                        {[0, 15, 30, 45].map(m => (
                            <button
                                key={m}
                                onClick={() => handleMinute(m)}
                                className={`
                                    text-xs px-2.5 py-1 rounded-lg transition border
                                    ${minute === m
                                        ? "bg-indigo-500/30 text-indigo-300 border-indigo-500/40"
                                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border-transparent"}
                                `}
                            >
                                :{String(m).padStart(2, "0")}
                            </button>
                        ))}
                    </div>

                    {/* Confirm */}
                    <button
                        onClick={() => setOpen(false)}
                        disabled={!selDate}
                        className={`
                            w-full py-2 rounded-xl text-sm font-medium transition-all duration-200
                            ${selDate
                                ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                                : "bg-white/5 text-slate-600 cursor-not-allowed"}
                        `}
                    >
                        {confirmLabel}
                    </button>
                </div>
            )}
        </div>
    );
}