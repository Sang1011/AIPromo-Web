import { useState } from "react";
import SeatMapLocker from "./SeatMapLocker";
import { FiLock, FiUnlock, FiX } from "react-icons/fi";
import { FaCouch, FaStar } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import type { SeatMapData } from "../../types/organizer/seatmap";
import JSON_SEAT_MAP from "../../data/seat-map.json";
export default function LockSeatTab() {
    const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
    const MAX_VISIBLE = 3;
    const [showAll, setShowAll] = useState(false);

    const visibleSeats = showAll
        ? selectedSeatIds
        : selectedSeatIds.slice(0, MAX_VISIBLE);

    const hiddenCount = selectedSeatIds.length - MAX_VISIBLE;
    const navigate = useNavigate();
    const location = useLocation();

    const gotoEdit = () => {
        navigate(`${location.pathname}/edit`);
    };
    return (
        <div className="flex gap-6 h-[75vh] min-w-0 overflow-hidden">

            {/* SEAT MAP */}
            <div className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-white/10">
                <SeatMapLocker
                    data={JSON_SEAT_MAP as unknown as SeatMapData}
                    selectedSeatIds={selectedSeatIds}
                    onToggleSeat={id => {
                        setSelectedSeatIds(prev =>
                            prev.includes(id)
                                ? prev.filter(x => x !== id)
                                : [...prev, id]
                        );
                    }}
                />
            </div>

            {/* SIDEBAR */}
            <div
                className="
                    w-[300px] shrink-0
                    bg-gradient-to-b from-[#120c26] to-[#0b0816]
                    border border-white/10 rounded-3xl
                    px-4 py-5 flex flex-col
                "
            >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">
                        Vị trí đã chọn ({selectedSeatIds.length})
                    </h3>

                    {selectedSeatIds.length > 0 && (
                        <button
                            onClick={() => setSelectedSeatIds([])}
                            className="text-xs text-primary hover:underline"
                        >
                            Bỏ chọn tất cả
                        </button>
                    )}
                </div>

                {/* LIST */}
                <div className="flex-1 space-y-3 overflow-hidden">
                    <div
                        className={`space-y-3 pr-1
            ${showAll ? "max-h-[260px] overflow-y-auto" : ""}
        `}
                    >
                        {selectedSeatIds.length === 0 && (
                            <div className="text-sm text-slate-500">
                                Chưa chọn ghế nào
                            </div>
                        )}

                        {visibleSeats.map(id => {
                            const isVIP = id.includes("A"); // demo rule

                            return (
                                <div
                                    key={id}
                                    className={`
                        relative flex items-center gap-3
                        px-4 py-3 rounded-2xl border
                        ${isVIP
                                            ? "border-yellow-400/30 bg-yellow-500/10"
                                            : "border-primary/30 bg-primary/10"
                                        }
                    `}
                                >
                                    {/* ICON */}
                                    <div
                                        className={`
                            w-10 h-10 rounded-xl
                            flex items-center justify-center
                            ${isVIP
                                                ? "bg-yellow-500/20 text-yellow-400"
                                                : "bg-primary/20 text-primary"
                                            }
                        `}
                                    >
                                        {isVIP ? <FaStar /> : <FaCouch />}
                                    </div>

                                    {/* INFO */}
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">
                                            {isVIP ? "VIP A" : "Standard"} – {id}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Giá: {isVIP ? "1.000.000đ" : "200.000đ"}
                                        </div>
                                    </div>

                                    {/* REMOVE */}
                                    <button
                                        onClick={() =>
                                            setSelectedSeatIds(prev =>
                                                prev.filter(x => x !== id)
                                            )
                                        }
                                        className="text-slate-400 hover:text-white"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* TOGGLE */}
                    {hiddenCount > 0 && !showAll && (
                        <button
                            onClick={() => setShowAll(true)}
                            className="
                mt-3 w-full py-3 rounded-xl
                border border-dashed border-white/10
                text-sm text-slate-400
                hover:text-white hover:border-white/20
            "
                        >
                            + {hiddenCount} vị trí khác
                        </button>
                    )}

                    {showAll && (
                        <button
                            onClick={() => setShowAll(false)}
                            className="
                mt-3 w-full text-sm text-primary hover:underline
            "
                        >
                            Thu gọn
                        </button>
                    )}
                </div>

                {/* FOOTER */}
                <div className="mt-5 space-y-3">
                    <button
                        className="
                            w-full py-3 rounded-xl
                            border border-white/10
                            text-slate-300 hover:text-white
                            flex items-center justify-center gap-2
                        "
                    >
                        <FiUnlock /> Mở khóa
                    </button>

                    <button
                        disabled={selectedSeatIds.length === 0}
                        className="
                            w-full py-3 rounded-xl
                            bg-primary text-white font-semibold
                            disabled:opacity-40
                            flex items-center justify-center gap-2
                        "
                    >
                        <FiLock />
                        Khóa {selectedSeatIds.length} vị trí đã chọn
                    </button>

                    <button
                        onClick={() => {
                            gotoEdit()
                        }}
                        className="
        w-full py-3 rounded-xl
        bg-gradient-to-r from-primary/30 to-primary/10
        text-white font-semibold
        border border-primary/30
        hover:from-primary/40 hover:to-primary/20
        hover:border-primary/50
        transition-all
        shadow-[0_0_0_0_rgba(139,92,246,0)]
        hover:shadow-[0_0_18px_2px_rgba(139,92,246,0.35)]
    "
                    >
                        Chỉnh sửa sơ đồ
                    </button>

                </div>
            </div>
        </div>
    );
}

