import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";


interface MenuItem {
    key: string;
    label: string;
    onClick: () => void;
    active?: boolean;
}

interface Props {
    rect: DOMRect;
    items: MenuItem[];
    onClose: () => void;
}

export default function AdminFloatingMenu({ rect, items, onClose }: Props) {
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        const handleDown = (e: MouseEvent) => {
            const target = e.target as Node | null;
            if (!target) return;
            if (ref.current && !ref.current.contains(target)) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKey);
        window.addEventListener("mousedown", handleDown);
        return () => {
            window.removeEventListener("keydown", handleKey);
            window.removeEventListener("mousedown", handleDown);
        };
    }, [onClose]);

    const menuWidth = 160;
    const itemHeight = 40;
    const menuHeight = items.length * itemHeight + 8;

    const spaceBelow = window.innerHeight - rect.bottom;
    const alignUp = spaceBelow < menuHeight;

    const left = Math.min(Math.max(8, rect.right - menuWidth + 8), window.innerWidth - menuWidth - 8);
    const top = alignUp ? Math.max(8, rect.top - menuHeight - 8) : Math.min(window.innerHeight - menuHeight - 8, rect.bottom + 8);

    const arrowLeft = Math.min(Math.max(12, rect.left + rect.width / 2 - left - 8), menuWidth - 24);

    const menu = (
        <div style={{ position: "fixed", left: left, top: top, width: menuWidth, zIndex: 9999 }}>
            <div ref={ref} className="bg-[#0b0816] border border-white/5 rounded-md shadow-2xl overflow-hidden" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>
                <div style={{ position: 'absolute', left: arrowLeft, top: alignUp ? (menuHeight - 2) * -1 : -8 }} className="pointer-events-none">
                    <svg width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 8L10 0L20 8" fill="#0b0816" />
                    </svg>
                </div>
                {items.map((it) => (
                    <button key={it.key} onClick={() => { it.onClick(); onClose(); }} className={`w-full text-left px-4 py-3 text-sm transition-colors ${it.active ? 'bg-primary/10 text-primary font-semibold' : 'text-[#a592c8] hover:bg-white/5'}`}>
                        {it.active ? (<span className="mr-2 inline-block w-2 h-2 rounded-full bg-primary/90 align-middle" />) : null}
                        {it.label}
                    </button>
                ))}
            </div>
        </div>
    );

    return createPortal(menu, document.body);
}
