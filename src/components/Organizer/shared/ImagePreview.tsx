import { useRef, useState } from "react";
import { FiRefreshCw, FiX, FiZoomIn, FiZoomOut } from "react-icons/fi";

function ImageViewer({ url, onClose }: { url: string; onClose: () => void }) {
    const [scale, setScale] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

    const zoom = (delta: number) =>
        setScale(s => Math.min(5, Math.max(0.2, s + delta)));

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        zoom(e.deltaY < 0 ? 0.15 : -0.15);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        setPos({
            x: dragStart.current.px + e.clientX - dragStart.current.mx,
            y: dragStart.current.py + e.clientY - dragStart.current.my,
        });
    };

    const reset = () => { setScale(1); setPos({ x: 0, y: 0 }); };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                onClick={e => e.stopPropagation()}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => { isDragging.current = false; }}
                onMouseLeave={() => { isDragging.current = false; }}
                style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
            >
                <img
                    src={url}
                    alt="Spec"
                    draggable={false}
                    style={{
                        transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                        transformOrigin: 'center',
                        transition: isDragging.current ? 'none' : 'transform 0.1s ease',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        userSelect: 'none',
                        borderRadius: 8,
                    }}
                />
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur px-4 py-2 rounded-2xl border border-white/10">
                <button onClick={() => zoom(-0.2)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition">
                    <FiZoomOut size={16} />
                </button>
                <span className="text-white text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => zoom(0.2)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition">
                    <FiZoomIn size={16} />
                </button>
                <div className="w-px h-4 bg-white/20" />
                <button onClick={reset} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition">
                    <FiRefreshCw size={14} />
                </button>
            </div>

            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-black/50 border border-white/10 text-white hover:bg-white/10 transition"
            >
                <FiX size={18} />
            </button>
        </div>
    );
}

export default ImageViewer;