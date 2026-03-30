import { useEffect, useMemo, useState } from "react";
import { FiLock, FiUnlock } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../../components/Organizer/shared/ConfirmModal";
import type { AppDispatch, RootState } from "../../store";
import { fetchGetSeatMap, fetchUpdateSeatMap } from "../../store/seatMapSlice";
import { fetchGetAllTicketTypes } from "../../store/ticketTypeSlice";
import type { SeatMapData, TicketType } from "../../types/config/seatmap";
import { notify } from "../../utils/notify";
import type { SelectedSeat, ViewerMode } from "./SeatMapViewerPage";
import { SeatMapViewer } from "./SeatMapViewerPage";

const TEXT_MUTED = '#9ca3af';

interface LockSeatTabProps {
    selectedSessionId: string;
}

export default function LockSeatTab({ selectedSessionId }: LockSeatTabProps) {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { ticketTypes: ticketTypeItems } = useSelector((state: RootState) => state.TICKET_TYPE);
    const { currentEvent } = useSelector((state: RootState) => state.EVENT);
    const navigate = useNavigate();
    const location = useLocation();

    const [seatMapData, setSeatMapData] = useState<SeatMapData | null>(null);
    const [pendingSeats, setPendingSeats] = useState<SelectedSeat[]>([]);
    const [saving, setSaving] = useState(false);
    const [showLockConfirm, setShowLockConfirm] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const isDraft = currentEvent?.status === 'Draft';

    // Tách danh sách ghế chọn theo trạng thái hiện tại
    const pendingLockSeats = pendingSeats.filter(s => !s.isBlocked);   // ghế available → sẽ bị khóa
    const pendingUnlockSeats = pendingSeats.filter(s => s.isBlocked);  // ghế blocked → sẽ được mở khóa

    useEffect(() => {
        if (!eventId || !selectedSessionId) return;
        setSeatMapData(null);
        setPendingSeats([]);
        dispatch(fetchGetSeatMap({ eventId, sessionId: selectedSessionId }))
            .unwrap()
            .then(specString => {
                try { setSeatMapData(JSON.parse(specString)); }
                catch { console.error('Parse seatmap error'); }
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

    const saveSeatMap = async (newData: SeatMapData) => {
        if (!eventId) return;
        setSaving(true);
        try {
            await dispatch(fetchUpdateSeatMap({ eventId, spec: JSON.stringify(newData) })).unwrap();
        } catch {
            notify.error('Không thể lưu sơ đồ ghế');
            throw new Error('save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleLock = async () => {
        if (!seatMapData || pendingLockSeats.length === 0) return;
        const ids = new Set(pendingLockSeats.map(s => s.id));
        const count = ids.size;
        const newData: SeatMapData = {
            ...seatMapData,
            areas: seatMapData.areas.map(area => ({
                ...area,
                seats: area.seats?.map(seat =>
                    ids.has(seat.id) ? { ...seat, status: 'blocked' as const } : seat
                ) ?? [],
            })),
        };
        try {
            await saveSeatMap(newData);
            setSeatMapData(newData);
            setPendingSeats([]);
            setResetKey(k => k + 1);
            notify.success(`Đã khóa ${count} ghế`);
        } catch { }
    };

    const handleUnlock = async () => {
        if (!seatMapData || pendingUnlockSeats.length === 0) return;
        const ids = new Set(pendingUnlockSeats.map(s => s.id));
        const count = ids.size;
        const newData: SeatMapData = {
            ...seatMapData,
            areas: seatMapData.areas.map(area => ({
                ...area,
                seats: area.seats?.map(seat =>
                    ids.has(seat.id) ? { ...seat, status: 'available' as const } : seat
                ) ?? [],
            })),
        };
        try {
            await saveSeatMap(newData);
            setSeatMapData(newData);
            setPendingSeats([]);
            setResetKey(k => k + 1);
            notify.success(`Đã mở khóa ${count} ghế`);
        } catch { }
    };

    const btnBase: React.CSSProperties = {
        flex: 1,
        padding: '10px 0',
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
        border: 'none',
    };

    const lockActions = mode === 'seat' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {!isDraft && (
                <p style={{ fontSize: 12, color: '#f59e0b', textAlign: 'center', margin: 0 }}>
                    Chỉ có thể khóa/mở khóa ghế khi sự kiện ở trạng thái NHÁP
                </p>
            )}

            {pendingSeats.length === 0 && (
                <p style={{ fontSize: 12, color: TEXT_MUTED, textAlign: 'center', margin: 0 }}>
                    Bấm vào ghế để chọn
                </p>
            )}

            {/* Hiển thị tóm tắt ghế đã chọn */}
            {pendingSeats.length > 0 && (
                <div style={{ fontSize: 12, color: TEXT_MUTED, textAlign: 'center' }}>
                    {pendingLockSeats.length > 0 && (
                        <span style={{ color: '#f59e0b' }}>{pendingLockSeats.length} ghế sẽ khóa</span>
                    )}
                    {pendingLockSeats.length > 0 && pendingUnlockSeats.length > 0 && ' · '}
                    {pendingUnlockSeats.length > 0 && (
                        <span style={{ color: '#22c55e' }}>{pendingUnlockSeats.length} ghế sẽ mở khóa</span>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
                {/* Nút mở khóa: chỉ hiện khi có ghế blocked được chọn */}
                <button
                    disabled={pendingUnlockSeats.length === 0 || !isDraft || saving}
                    onClick={handleUnlock}
                    style={{
                        ...btnBase,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent',
                        color: (pendingUnlockSeats.length === 0 || !isDraft) ? '#6b7280' : '#e5e7eb',
                        cursor: (pendingUnlockSeats.length === 0 || !isDraft) ? 'not-allowed' : 'pointer',
                        opacity: (pendingUnlockSeats.length === 0 || !isDraft) ? 0.4 : 1,
                    }}
                >
                    <FiUnlock size={14} />
                    Mở khóa {pendingUnlockSeats.length > 0 ? `(${pendingUnlockSeats.length})` : ''}
                </button>

                {/* Nút khóa: chỉ hiện khi có ghế available được chọn */}
                <button
                    disabled={pendingLockSeats.length === 0 || !isDraft || saving}
                    onClick={() => { if (pendingLockSeats.length > 0) setShowLockConfirm(true); }}
                    style={{
                        ...btnBase,
                        background: (pendingLockSeats.length === 0 || !isDraft) ? '#374151' : '#7c3bed',
                        color: (pendingLockSeats.length === 0 || !isDraft) ? '#6b7280' : 'white',
                        cursor: (pendingLockSeats.length === 0 || !isDraft) ? 'not-allowed' : 'pointer',
                    }}
                >
                    <FiLock size={14} />
                    Khóa {pendingLockSeats.length > 0 ? `(${pendingLockSeats.length})` : ''}
                </button>
            </div>

            <button
                onClick={() => navigate(`${location.pathname}/edit`)}
                disabled={!isDraft}
                className={`w-full py-2 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition
    ${!isDraft
                        ? "opacity-40 cursor-not-allowed text-gray-500"
                        : "bg-gradient-to-r from-purple-500/30 to-purple-500/10 hover:from-purple-500/50 hover:to-purple-500/20 text-white hover:shadow-md hover:-translate-y-0.5"
                    }`}
            >
                Chỉnh sửa sơ đồ
            </button>
        </div>
    ) : (
        <div style={{ marginTop: 8 }}>
            <button
                onClick={() => navigate(`${location.pathname}/edit`)}
                disabled={!isDraft}
                className={`w-full py-2 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition
    ${!isDraft
                        ? "opacity-40 cursor-not-allowed text-gray-500"
                        : "bg-gradient-to-r from-purple-500/30 to-purple-500/10 hover:from-purple-500/50 hover:to-purple-500/20 text-white hover:shadow-md hover:-translate-y-0.5"
                    }`}
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
        <>
            <div className="h-[75vh] rounded-2xl overflow-hidden border border-white/10">
                <SeatMapViewer
                    seatMapData={seatMapData}
                    mode={mode}
                    ticketTypes={ticketTypes}
                    onConfirm={() => { }}
                    extraActions={lockActions}
                    hideConfirmButton={true}
                    allowSelectBlocked={isDraft && mode === 'seat'}
                    resetSelectionKey={resetKey}
                    onSelectionChange={seats => setPendingSeats(seats)}
                />
            </div>

            <ConfirmModal
                open={showLockConfirm}
                title="Xác nhận khóa ghế"
                description={
                    <span>
                        Bạn sắp khóa <strong className="text-white">{pendingLockSeats.length} ghế</strong>.
                        Ghế bị khóa sẽ <strong className="text-red-400">không thể mua</strong> trên nền tảng cho đến khi được mở khóa.
                    </span>
                }
                confirmText="Khóa ghế"
                loading={saving}
                onCancel={() => setShowLockConfirm(false)}
                onConfirm={async () => {
                    setShowLockConfirm(false);
                    await handleLock();
                }}
            />
        </>
    );
}