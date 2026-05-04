import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface Bank {
    code: string;
    name: string;
}

interface BankSelectProps {
    label: string;
    required?: boolean;
    banks: Bank[];
    value?: string;
    onChange: (value: string) => void;
    error?: boolean;
    disabled?: boolean;
    labelCls?: string;
}

export default function BankSelect({
    label,
    required,
    banks,
    value,
    onChange,
    error,
    disabled,
    labelCls = "block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569] mb-2",
}: BankSelectProps) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (!open || !triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownStyle({
            position: "fixed",
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
        });
    }, [open]);


    const dropdownRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!open) return;

        const updatePosition = () => {
            if (!triggerRef.current) return;
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            });
        };

        const handleOutside = (e: MouseEvent) => {
            if (
                !triggerRef.current?.contains(e.target as Node) &&
                !dropdownRef.current?.contains(e.target as Node)
            ) {
                setOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleOutside);
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            document.removeEventListener("mousedown", handleOutside);
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open]);

    const filtered = banks.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedName = banks.find((b) => b.code === value)?.name;

    const triggerBase =
        "w-full bg-[#18122B] border rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 flex items-center justify-between cursor-pointer";

    const triggerCls = disabled
        ? `${triggerBase} border-[#1E293B] text-[#475569] opacity-50 cursor-not-allowed`
        : error
            ? `${triggerBase} border-red-500/60 hover:border-red-400 text-white focus:border-red-400 focus:ring-2 focus:ring-red-500/20`
            : open
                ? `${triggerBase} border-primary ring-2 ring-primary/20 text-white`
                : `${triggerBase} border-[#1E293B] hover:border-[#334155] text-white`;

    return (
        <div>
            <label className={labelCls}>
                {label}
                {required && <span className="text-red-400"> *</span>}
            </label>

            <div
                ref={triggerRef}
                onClick={() => !disabled && setOpen((o) => !o)}
                className={triggerCls}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if (!disabled && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        setOpen((o) => !o);
                    }
                    if (e.key === "Escape") setOpen(false);
                }}
            >
                <span className={selectedName ? "text-white" : "text-[#475569]"}>
                    {selectedName ?? "Chọn ngân hàng"}
                </span>
                <span
                    className={`material-symbols-outlined text-[18px] transition-transform duration-200 text-[#475569]
            ${open ? "rotate-180" : ""}`}
                >
                    expand_more
                </span>
            </div>

            {open &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        style={dropdownStyle}
                        className="rounded-xl border border-[#1E293B] bg-[#18122B] shadow-2xl shadow-black/60 p-3 space-y-1 max-h-[260px] overflow-y-auto"
                    >
                        <input
                            autoFocus
                            placeholder="Tìm ngân hàng..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#0B0B12] border border-[#1E293B] text-white text-sm placeholder:text-[#475569] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                        />
                        {filtered.length === 0 ? (
                            <p className="px-3 py-2 text-[12px] text-[#475569]">Không tìm thấy ngân hàng</p>
                        ) : (
                            filtered.map((b) => (
                                <div
                                    key={b.code}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        onChange(b.code);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                    className={`px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors duration-150
                    ${b.code === value
                                            ? "bg-primary/20 text-primary font-semibold"
                                            : "text-white hover:bg-primary/10"
                                        }`}
                                >
                                    {b.name}
                                </div>
                            ))
                        )}
                    </div>,
                    document.body
                )}
        </div>
    );
}