import { useEffect, useState } from "react";
import SeatMapLocker from "./SeatMapLocker";
import { FiLock, FiUnlock, FiX } from "react-icons/fi";
import { FaCouch, FaStar } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { SeatMapData } from "../../types/config/seatmap";
import JSON_SEAT_MAP from "../../data/seat-map.json";
import { fetchGetSeatMap } from "../../store/seatMapSlice";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { fetchGetAllTicketTypes } from "../../store/ticketTypeSlice";
export default function LockSeatTab() {
    const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
    const MAX_VISIBLE = 3;
    const [showAll, setShowAll] = useState(false);
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const [seatMapData, setSeatMapData] = useState<SeatMapData | null>(null);
    const { ticketTypes } = useSelector((state: RootState) => state.TICKET_TYPE)

    const visibleSeats = showAll
        ? selectedSeatIds
        : selectedSeatIds.slice(0, MAX_VISIBLE);

    const hiddenCount = selectedSeatIds.length - MAX_VISIBLE;
    const navigate = useNavigate();
    const location = useLocation();

    const gotoEdit = () => {
        navigate(`${location.pathname}/edit`);
    };

    const { spec } = useSelector((state: RootState) => state.SEATMAP)

    useEffect(() => {
        if (!eventId) return;
        dispatch(fetchGetSeatMap(eventId))
        dispatch(fetchGetAllTicketTypes({ eventId }));
    }, [eventId, dispatch])

    const getTicketType = (sectionId: string) => {
        return ticketTypes.find(t => t.areaId === sectionId);
    };

    const findSeat = (seatId: string) => {
        if (!seatMapData) return null;

        for (const area of seatMapData.areas) {
            const seat = area.seats.find(s => s.id === seatId);
            if (seat) return seat;
        }

        return null;
    };

    useEffect(() => {
        if (!spec) return;

        try {
            const parsed: SeatMapData = JSON.parse(spec);
            setSeatMapData(parsed);
        } catch (err) {
            console.error("Seat map parse error:", err);
        }
    }, [spec]);

    return (
        <div className="flex gap-6 h-[75vh] min-w-0 overflow-hidden">

            {/* SEAT MAP */}
            <div className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-white/10">
                {!seatMapData ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        Đang tải sơ đồ ghế...
                    </div>
                ) : (
                    <SeatMapLocker
                        data={seatMapData}
                        selectedSeatIds={selectedSeatIds}
                        onToggleSeat={id => {
                            setSelectedSeatIds(prev =>
                                prev.includes(id)
                                    ? prev.filter(x => x !== id)
                                    : [...prev, id]
                            );
                        }}
                    />
                )}
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
                            const seat = findSeat(id);
                            const ticketType = seat ? getTicketType(seat.sectionId) : null;

                            const seatLabel = seat ? `${seat.row}${seat.number}` : id;

                            return (
                                <div
                                    key={id}
                                    className="
                                            relative flex items-center gap-3
                                            px-4 py-3 rounded-2xl border
                                            border-primary/30 bg-primary/10
                                        "
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
                                        <FaCouch />
                                    </div>

                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">
                                            {ticketType?.name ?? "Seat"} – {seatLabel}
                                        </div>

                                        <div className="text-xs text-slate-400">
                                            Giá: {ticketType?.price?.toLocaleString()} VND
                                        </div>
                                    </div>

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

