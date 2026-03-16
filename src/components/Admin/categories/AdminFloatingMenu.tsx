import { useEffect } from "react";
import { createPortal } from "react-dom";

interface MenuItem {
    key: string;
    label: string;
    onClick: () => void;
}

interface Props {
    rect: DOMRect;
    items: MenuItem[];
    onClose: () => void;
}

export default function AdminFloatingMenu({ rect, items, onClose }: Props) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        const handleDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target) return;
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

    const menu = (
        <div style={{ position: "fixed", left: left, top: top, width: menuWidth, zIndex: 9999 }}>
            <div className="bg-[#0b0816] border border-white/5 rounded-md shadow-lg overflow-hidden">
                {items.map((it) => (
                    <button key={it.key} onClick={() => { it.onClick(); onClose(); }} className="w-full text-left px-3 py-2 text-sm text-[#a592c8] hover:bg-white/5">{it.label}</button>
                ))}
            </div>
        </div>
    );

    return createPortal(menu, document.body);
}
