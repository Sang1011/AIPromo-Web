import { useEffect, useMemo, useState } from "react";
import { FiLock, FiUnlock } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { fetchGetSeatMap } from "../../store/seatMapSlice";
import { fetchGetAllTicketTypes } from "../../store/ticketTypeSlice";
import type { SeatMapData, TicketType } from "../../types/config/seatmap";
import { notify } from "../../utils/notify";
import type { ViewerMode } from "./SeatMapViewerPage";
import { SeatMapViewer } from "./SeatMapViewerPage"; // adjust import path

interface LockSeatTabProps {
    selectedSessionId: string;
}

export default function LockSeatTab({ selectedSessionId }: LockSeatTabProps) {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { ticketTypes: ticketTypeItems } = useSelector((state: RootState) => state.TICKET_TYPE);
    const [seatMapData, setSeatMapData] = useState<SeatMapData | null>(null);
    const [selectedSeatCount, setSelectedSeatCount] = useState(0);
    const { currentEvent } = useSelector((state: RootState) => state.EVENT);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!eventId || !selectedSessionId) return;
        setSeatMapData(null);
        dispatch(fetchGetSeatMap({ eventId, sessionId: selectedSessionId }))
            .unwrap()
            .then(specString => {
                try { setSeatMapData(JSON.parse(specString)); }
                catch { console.error("Parse error"); }
            });
        dispatch(fetchGetAllTicketTypes({ eventId, eventSessionId: selectedSessionId }));
    }, [eventId, selectedSessionId, dispatch]);

    const ticketTypes: TicketType[] = useMemo(() => {
        if (!seatMapData) return [];
        const seen = new Set<string>();
        return seatMapData.areas
            .filter(a => a.isAreaType && a.ticketTypeId && !seen.has(a.ticketTypeId) && seen.add(a.ticketTypeId))
            .map(area => {
                const item = ticketTypeItems.find(t => t.id === area.ticketTypeId);
                return {
                    id: area.ticketTypeId,
                    name: item?.name ?? area.ticketTypeId,
                    color: item?.color ?? area.fill ?? '#6b7280',
                    price: area.price,
                    quantity: item?.quantity ?? 0,
                    soldQuantity: item?.soldQuantity ?? 0,
                    remainingQuantity: item?.remainingQuantity ?? 0,
                };
            });
    }, [seatMapData, ticketTypeItems]);

    const mode: ViewerMode = useMemo(() => {
        if (!seatMapData) return 'zone';
        return seatMapData.areas.some(a => a.seats?.length > 0) ? 'seat' : 'zone';
    }, [seatMapData]);

    const lockActions = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    disabled={selectedSeatCount === 0}
                    onClick={() => {
                        notify.info(`Mở khóa ${selectedSeatCount} ghế`);
                    }}
                    style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent',
                        color: selectedSeatCount === 0 ? '#6b7280' : '#e5e7eb',
                        cursor: selectedSeatCount === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        opacity: selectedSeatCount === 0 ? 0.4 : 1,
                    }}
                >
                    <FiUnlock size={14} /> Mở khóa
                </button>
                <button
                    disabled={selectedSeatCount === 0}
                    onClick={() => {
                        notify.info(`Khóa ${selectedSeatCount} ghế`);
                    }}
                    style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 10,
                        border: 'none',
                        background: selectedSeatCount === 0 ? '#374151' : '#7c3bed',
                        color: selectedSeatCount === 0 ? '#6b7280' : 'white',
                        cursor: selectedSeatCount === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                    }}
                >
                    <FiLock size={14} /> Khóa
                </button>
            </div>
            <button
                onClick={() => navigate(`${location.pathname}/edit`)}
                disabled={currentEvent?.status !== "Draft"}
                style={{
                    width: '100%',
                    padding: '10px 0',
                    borderRadius: 10,
                    border: '1px solid rgba(124,59,237,0.3)',
                    background: currentEvent?.status !== "Draft"
                        ? 'transparent'
                        : 'linear-gradient(to right, rgba(124,59,237,0.3), rgba(124,59,237,0.1))',
                    color: currentEvent?.status !== "Draft" ? '#6b7280' : 'white',
                    cursor: currentEvent?.status !== "Draft" ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    opacity: currentEvent?.status !== "Draft" ? 0.4 : 1,
                }}
            >
                Chỉnh sửa sơ đồ
            </button>
        </div>
    );

    if (!selectedSessionId) return (
        <div className="flex items-center justify-center h-[75vh] text-slate-400">
            Vui lòng chọn suất diễn
        </div>
    );

    if (!seatMapData) return (
        <div className="flex items-center justify-center h-[75vh] text-slate-400">
            Đang tải sơ đồ ghế...
        </div>
    );

    return (
        <div className="h-[75vh] rounded-2xl overflow-hidden border border-white/10">
            <SeatMapViewer
                seatMapData={seatMapData}
                mode={mode}
                ticketTypes={ticketTypes}
                onConfirm={() => { }}
                confirmLabel={`Khóa ${selectedSeatCount} ghế đã chọn`}
                extraActions={lockActions}
                onSelectionChange={seats => setSelectedSeatCount(seats.length)}
            />
        </div>
    );
}