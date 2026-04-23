import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FiX, FiSearch } from "react-icons/fi";
import { SPEAKER_PROFESSION_GROUPS } from "../../../types/event/event";
import { DropdownItem } from "../shared/DropdownItem";

const ALL_PROFESSIONS = SPEAKER_PROFESSION_GROUPS.flatMap((g) => g.items);
const OTHER_VALUE = "Khác";

interface ActorMajorFieldProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: string;
}

export function ActorMajorField({ value, onChange, disabled, error }: ActorMajorFieldProps) {
    const isPreset = ALL_PROFESSIONS.includes(value);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [isCustomMode, setIsCustomMode] = useState(!isPreset && value !== "");
    const searchRef = useRef<HTMLInputElement>(null);

    // Focus search on open
    useEffect(() => {
        if (isOpen) setTimeout(() => searchRef.current?.focus(), 50);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setIsOpen(false); setSearch(""); } };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen]);

    const handleSelect = (item: string) => {
        if (item === OTHER_VALUE) {
            setIsCustomMode(true);
            onChange("");
        } else {
            setIsCustomMode(false);
            onChange(item);
        }
        setIsOpen(false);
        setSearch("");
    };

    const filtered = search.trim()
        ? SPEAKER_PROFESSION_GROUPS
            .map((g) => ({ ...g, items: g.items.filter((i) => i.toLowerCase().includes(search.trim().toLowerCase())) }))
            .filter((g) => g.items.length > 0)
        : SPEAKER_PROFESSION_GROUPS;

    const displayLabel = isCustomMode ? "Khác (tự nhập)" : value || "Chọn chuyên môn...";
    const isPlaceholder = !value && !isCustomMode;

    // ── Modal portal ──────────────────────────────────────────────────────
    const modal = isOpen && ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) { setIsOpen(false); setSearch(""); } }}
        >
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1530] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <span className="text-white text-sm font-semibold">Chọn chuyên môn</span>
                    <button
                        onMouseDown={(e) => { e.preventDefault(); setIsOpen(false); setSearch(""); }}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-3 py-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-white/10 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                        <FiSearch size={13} className="text-slate-400 flex-shrink-0" />
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm chuyên môn..."
                            className="flex-1 bg-transparent border-none text-white text-sm outline-none ring-0 placeholder:text-slate-500"
                        />
                        {search && (
                            <button onMouseDown={(e) => { e.preventDefault(); setSearch(""); }} className="text-slate-400 hover:text-white">
                                <FiX size={12} />
                            </button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-8 text-sm text-slate-500 text-center">
                            Không tìm thấy chuyên môn nào
                        </div>
                    ) : (
                        filtered.map((group) => (
                            <div key={group.label}>
                                <div className="px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wider text-slate-500 bg-[#1a1530] sticky top-0 z-10">
                                    {group.label}
                                </div>
                                {group.items.map((item) => (
                                    <DropdownItem
                                        key={item}
                                        isSelected={value === item}
                                        onClick={(e) => { e.preventDefault(); handleSelect(item); }}
                                        suffix={value === item ? "✓" : undefined}
                                    >
                                        {item}
                                    </DropdownItem>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );

    return (
        <div className="space-y-2">
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => { if (!disabled) setIsOpen(true); }}
                disabled={disabled}
                className={`
                    w-full rounded-xl bg-black/30 border px-4 py-3 text-sm text-left
                    flex items-center justify-between
                    disabled:opacity-40 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-1 focus:ring-primary/40
                    hover:border-white/20 transition-all
                    ${error ? "border-red-500" : "border-white/10"}
                `}
            >
                <span className={isPlaceholder ? "text-slate-500" : "text-white truncate"}>
                    {displayLabel}
                </span>
                <svg
                    className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {modal}

            {/* Custom input khi chọn "Khác" */}
            {isCustomMode && (
                <input
                    autoFocus
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    placeholder="Nhập chuyên môn..."
                    className={`w-full rounded-xl bg-black/30 border px-4 py-3 text-white text-sm
                        disabled:opacity-40 disabled:cursor-not-allowed
                        focus:outline-none focus:ring-1 focus:ring-primary/40
                        transition-all
                        ${error ? "border-red-500" : "border-white/10"}
                    `}
                />
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}