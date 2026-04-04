import Konva from 'konva';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Circle, Group, Text as KonvaText, Layer, Line, Rect, Stage } from 'react-konva';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import { fetchEventById } from '../../store/eventSlice';
import { fetchGetSeatMap } from '../../store/seatMapSlice';
import { fetchCreatePendingOrder } from '../../store/ticketingSlice';
import { fetchGetAllTicketTypes } from '../../store/ticketTypeSlice';
import type { Area, Seat, SeatMapData, TextEntity, TicketType } from '../../types/config/seatmap';
import type { CreatePendingOrderRequest, TicketRequest } from '../../types/ticketing/ticketing';
import { notify } from '../../utils/notify';
import { clearOldOrderFromFirebase } from '../../utils/orderFirebase';

type ViewerMode = 'zone' | 'seat';

interface SelectedSeat {
    id: string;
    row: string;
    number: number;
    sectionId: string;
    sectionName: string;
    price: number;
    ticketTypeId: string;
    ticketTypeName: string;
    ticketTypeColor: string;
    isBlocked: boolean;
}

interface ZonePopup {
    areaId: string;
    areaName: string;
    ticketTypeId: string;
    ticketTypeName: string;
    ticketTypeColor: string;
    price: number;
    quantity: number;
}

interface SeatMapViewerProps {
    seatMapData: SeatMapData;
    mode: ViewerMode;
    ticketTypes: TicketType[];
    onConfirm?: (payload: ConfirmPayload) => void;
    confirmLabel?: string;
    extraActions?: React.ReactNode;
    onSelectionChange?: (seats: SelectedSeat[]) => void;
    /** Cho phép click và chọn cả ghế bị blocked (dùng trong LockSeatTab) */
    allowSelectBlocked?: boolean;
    hideConfirmButton?: boolean;
    resetSelectionKey?: number;
}

interface ConfirmPayload {
    mode: ViewerMode;
    zones?: { areaId: string; areaName: string; ticketTypeId: string; price: number; quantity: number }[];
    seats?: SelectedSeat[];
    totalPrice: number;
}

const CANVAS_WIDTH = 1550;
const CANVAS_HEIGHT = 900;
const SEAT_SELECTED_COLOR = '#22c55e';
const SEAT_AVAILABLE_COLOR = '#ffffff';
const SEAT_SOLD_COLOR = '#9ca3af';
const BG_COLOR = '#0B0B12';
const PANEL_BG = '#18122B';
const BORDER_COLOR = '#2a2a3e';
const PRIMARY = '#7c3bed';
const TEXT_MUTED = '#9ca3af';

const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const SeatMapViewer: React.FC<SeatMapViewerProps> = ({
    seatMapData,
    mode,
    ticketTypes,
    onConfirm,
    confirmLabel,
    extraActions,
    onSelectionChange,
    allowSelectBlocked = false,
    hideConfirmButton = false,
    resetSelectionKey,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);

    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const isPanningRef = useRef(false);
    const panStartRef = useRef({ x: 0, y: 0 });

    const [zonePopup, setZonePopup] = useState<ZonePopup | null>(null);
    const [selectedZone, setSelectedZone] = useState<ZonePopup | null>(null);
    const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
    const [hoveredAreaId, setHoveredAreaId] = useState<string | null>(null);
    const [hoveredSeatId, setHoveredSeatId] = useState<string | null>(null);

    // Reset selection khi resetSelectionKey thay đổi
    useEffect(() => {
        setSelectedSeatIds(new Set());
    }, [resetSelectionKey]);

    const allSeats = useMemo<Seat[]>(() =>
        seatMapData.areas.flatMap(a => a.seats ?? []),
        [seatMapData]
    );

    const sections = useMemo<Area[]>(() =>
        seatMapData.areas.map(({ seats: _s, ...area }) => area as Area),
        [seatMapData]
    );

    const texts = useMemo<TextEntity[]>(() =>
        seatMapData.texts ?? [],
        [seatMapData]
    );

    const selectedSeatsInfo = useMemo<SelectedSeat[]>(() => {
        return Array.from(selectedSeatIds).map(id => {
            const seat = allSeats.find(s => s.id === id)!;
            const area = seatMapData.areas.find(a => a.id === seat.sectionId)!;
            const tt = ticketTypes.find(t => t.id === area?.ticketTypeId);
            return {
                id: seat.id,
                row: seat.row,
                number: seat.number,
                sectionId: seat.sectionId,
                sectionName: area?.name ?? '',
                price: area?.price ?? tt?.price ?? 0,
                ticketTypeId: area?.ticketTypeId ?? '',
                ticketTypeName: tt?.name ?? area?.ticketTypeId ?? '',
                ticketTypeColor: tt?.color ?? seat.fill ?? '#6b7280',
                isBlocked: seat.status?.toLowerCase() === 'blocked',
            };
        });
    }, [selectedSeatIds, allSeats, seatMapData, ticketTypes]);

    const totalPrice = useMemo(() => {
        if (mode === 'seat') return selectedSeatsInfo.reduce((s, seat) => s + seat.price, 0);
        if (mode === 'zone' && selectedZone) return selectedZone.price * selectedZone.quantity;
        return 0;
    }, [mode, selectedSeatsInfo, selectedZone]);

    useEffect(() => {
        onSelectionChange?.(selectedSeatsInfo);
    }, [selectedSeatsInfo]);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            const r = entries[0].contentRect;
            setContainerSize({ width: r.width, height: r.height });
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (containerSize.width === 0) return;
        const scale = Math.min(
            (containerSize.width * 0.97) / CANVAS_WIDTH,
            (containerSize.height * 0.97) / CANVAS_HEIGHT,
            1
        );
        setStageScale(scale);
        setStagePos({
            x: (containerSize.width - CANVAS_WIDTH * scale) / 2,
            y: (containerSize.height - CANVAS_HEIGHT * scale) / 2,
        });
    }, [containerSize]);

    const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;
        const scaleBy = 1.08;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition()!;
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        const newScale = e.evt.deltaY < 0
            ? Math.min(oldScale * scaleBy, 5)
            : Math.max(oldScale / scaleBy, 0.2);
        setStageScale(newScale);
        setStagePos({
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        });
    }, []);

    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const isRightClick = e.evt.button === 2;
        const isLeftClickOnStage = e.evt.button === 0 && e.target === e.target.getStage();
        if (!isRightClick && !isLeftClickOnStage) return;
        isPanningRef.current = true;
        if (isLeftClickOnStage) stageRef.current?.container().style.setProperty('cursor', 'grabbing');
        panStartRef.current = { x: e.evt.clientX - stagePos.x, y: e.evt.clientY - stagePos.y };
    }, [stagePos]);

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isPanningRef.current) return;
        setStagePos({
            x: e.evt.clientX - panStartRef.current.x,
            y: e.evt.clientY - panStartRef.current.y,
        });
    }, []);

    useEffect(() => {
        const stop = () => {
            if (isPanningRef.current) {
                isPanningRef.current = false;
                stageRef.current?.container().style.setProperty('cursor', 'default');
            }
        };
        window.addEventListener('mouseup', stop);
        return () => window.removeEventListener('mouseup', stop);
    }, []);

    const handleAreaClick = useCallback((area: Area) => {
        if (mode !== 'zone') return;
        const tt = ticketTypes.find(t => t.id === area.ticketTypeId);
        const remaining = tt?.remainingQuantity ?? 0;
        if (remaining === 0) return;
        setZonePopup({
            areaId: area.id,
            areaName: area.name,
            ticketTypeId: area.ticketTypeId ?? '',
            ticketTypeName: tt?.name ?? area.ticketTypeId ?? '',
            ticketTypeColor: tt?.color ?? '#6b7280',
            price: area.price ?? tt?.price ?? 0,
            quantity: 1,
        });
    }, [mode, ticketTypes]);

    const handleSeatClick = useCallback((seat: Seat) => {
        if (mode !== 'seat') return;

        if (allowSelectBlocked) {
            // LockSeatTab: cho phép chọn cả ghế blocked lẫn available
            setSelectedSeatIds(prev => {
                const next = new Set(prev);
                if (next.has(seat.id)) next.delete(seat.id);
                else next.add(seat.id);
                return next;
            });
            return;
        }

        // Mua vé: không cho chọn ghế bị khóa
        if (seat.status?.toLowerCase() === 'blocked') return;

        const area = seatMapData.areas.find(a => a.id === seat.sectionId);
        const tt = ticketTypes.find(t => t.id === area?.ticketTypeId);
        const remaining = tt?.remainingQuantity ?? 0;
        if (remaining === 0) return;

        setSelectedSeatIds(prev => {
            const next = new Set(prev);
            if (next.has(seat.id)) next.delete(seat.id);
            else next.add(seat.id);
            return next;
        });
    }, [mode, allowSelectBlocked, seatMapData, ticketTypes]);

    const confirmZone = () => {
        if (!zonePopup) return;
        setSelectedZone({ ...zonePopup });
        setZonePopup(null);
    };

    const handleConfirm = () => {
        if (mode === 'zone' && selectedZone) {
            onConfirm?.({ mode, zones: [{ ...selectedZone }], totalPrice });
        }
        if (mode === 'seat') {
            onConfirm?.({ mode, seats: selectedSeatsInfo, totalPrice });
        }
    };

    const renderAreaShape = (area: Area, fillColor: string, strokeColor: string, opacity: number) => {
        const common = { id: area.id, stroke: strokeColor, strokeWidth: 2, fill: fillColor, opacity };
        if (area.type === 'circle') return <Circle radius={area.width / 2} {...common} />;
        if (area.type === 'triangle') return <Line points={[area.width / 2, 0, area.width, area.height, 0, area.height]} closed {...common} />;
        if (area.type === 'parallelogram') return <Line points={[area.width * 0.2, 0, area.width, 0, area.width * 0.8, area.height, 0, area.height]} closed {...common} />;
        if (area.type === 'trapezoid') return <Line points={[area.width * 0.2, 0, area.width * 0.8, 0, area.width, area.height, 0, area.height]} closed {...common} />;
        if (area.type === 'polygon' && area.points) return <Line points={area.points} closed {...common} />;
        return <Rect width={area.width} height={area.height} cornerRadius={4} {...common} />;
    };

    const renderAreaLabel = (area: Area, remaining?: number, isSoldOut?: boolean) => {
        const isCircle = area.type === 'circle';
        const cy = isCircle ? 0 : area.height / 2;
        const fontSize = Math.max(11, area.labelFontSize ?? 14);
        const tt = ticketTypes.find(t => t.id === area.ticketTypeId);
        const priceStr = fmtVND(area.price ?? tt?.price ?? 0);
        return (
            <>
                <KonvaText x={isCircle ? -area.width / 2 : 0} y={cy - fontSize - 2} width={area.width} text={area.name} fontSize={fontSize} fontStyle="bold" fill={isSoldOut ? '#9ca3af' : 'white'} align="center" />
                {isSoldOut ? (
                    <KonvaText x={isCircle ? -area.width / 2 : 0} y={cy + 2} width={area.width} text="Hết vé" fontSize={Math.max(11, fontSize - 2)} fill="#ef4444" align="center" fontStyle="bold" />
                ) : (
                    <>
                        <KonvaText x={isCircle ? -area.width / 2 : 0} y={cy + 2} width={area.width} text={priceStr} fontSize={Math.max(11, fontSize - 2)} fill="rgba(255,255,255,0.8)" align="center" />
                        <KonvaText x={isCircle ? -area.width / 2 : 0} y={cy + fontSize + 4} width={area.width} text={`Còn lại: ${remaining}`} fontSize={Math.max(8, fontSize - 3)} fill="rgba(134,239,172,0.9)" align="center" />
                    </>
                )}
            </>
        );
    };

    const renderAreas = () => sections.map(area => {
        if (!area.isAreaType) {
            return (
                <Group key={area.id} x={area.x} y={area.y} rotation={area.rotation} listening={false}>
                    {renderAreaShape(area, area.fill ?? '#374151', area.stroke ?? '#fff', 1)}
                    {texts.filter(t => t.attachedAreaId === area.id).map(t => (
                        <KonvaText key={t.id} x={0} y={0} text={t.text} fontSize={t.fontSize} fill={t.fill} align={t.align} width={area.width} height={area.height} verticalAlign={t.verticalAlign} />
                    ))}
                </Group>
            );
        }

        const tt = ticketTypes.find(t => t.id === area.ticketTypeId);
        const remaining = tt?.remainingQuantity ?? 0;
        const isSoldOut = remaining === 0;
        const baseColor = tt?.color ?? area.fill ?? '#6b7280';
        const isHovered = hoveredAreaId === area.id;
        const isSelected = mode === 'zone' && selectedZone?.areaId === area.id;
        const inPopup = mode === 'zone' && zonePopup?.areaId === area.id;

        let fillColor = baseColor;
        let opacity = isSoldOut ? 0.35 : 1;
        let strokeColor = isSoldOut ? (area.fill ?? tt?.color ?? '#6b7280') : 'white';

        if (!isSoldOut) {
            if (isSelected || inPopup) { strokeColor = '#22c55e'; opacity = 1; }
            else if (isHovered && mode === 'zone') { opacity = 0.8; strokeColor = '#a78bfa'; }
        }

        return (
            <Group
                key={area.id}
                x={area.x}
                y={area.y}
                rotation={area.rotation}
                onClick={() => !isSoldOut && handleAreaClick(area)}
                onTap={() => !isSoldOut && handleAreaClick(area)}
                onMouseEnter={() => {
                    if (mode === 'zone' && !isSoldOut) setHoveredAreaId(area.id);
                    stageRef.current?.container().style.setProperty('cursor', mode === 'zone' ? (isSoldOut ? 'not-allowed' : 'pointer') : 'default');
                }}
                onMouseLeave={() => {
                    setHoveredAreaId(null);
                    stageRef.current?.container().style.setProperty('cursor', 'default');
                }}
            >
                {renderAreaShape(area, fillColor, strokeColor, opacity)}
                {mode === 'zone' && renderAreaLabel(area, remaining, isSoldOut)}
            </Group>
        );
    });

    const renderSeats = () => {
        if (mode !== 'seat') return null;

        return allSeats.map(seat => {
            const isSeatBlocked = seat.status?.toLowerCase() === 'blocked';
            const isSelected = selectedSeatIds.has(seat.id);
            const isHovered = hoveredSeatId === seat.id;

            const area = seatMapData.areas.find(a => a.id === seat.sectionId);
            const tt = ticketTypes.find(t => t.id === area?.ticketTypeId);
            const remaining = tt?.remainingQuantity ?? 0;

            // Chỉ check section sold out khi context mua vé (không allowSelectBlocked)
            const isSectionSoldOut = !allowSelectBlocked && remaining === 0;

            // Ghế không click được:
            // - Mua vé: ghế blocked hoặc section hết vé
            // - LockSeatTab: tất cả đều click được
            const isUnclickable = allowSelectBlocked
                ? false
                : (isSeatBlocked || isSectionSoldOut);

            // Màu ghế:
            // - Blocked (cả 2 context): xám
            // - Section hết vé (chỉ mua vé): xám
            // - Đang chọn: xanh lá
            // - Bình thường: trắng
            const fill = isSeatBlocked
                ? SEAT_SOLD_COLOR
                : isSectionSoldOut
                    ? SEAT_SOLD_COLOR
                    : isSelected
                        ? SEAT_SELECTED_COLOR
                        : SEAT_AVAILABLE_COLOR;

            const stroke = isSelected
                ? '#16a34a'
                : isHovered && !isUnclickable
                    ? '#a78bfa'
                    : 'rgba(0,0,0,0.15)';

            const strokeWidth = isSelected ? 2 : isHovered && !isUnclickable ? 1.5 : 0.5;

            return (
                <Rect
                    key={seat.id}
                    width={seat.width}
                    height={seat.height}
                    cornerRadius={4}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    offsetX={seat.width / 2}
                    offsetY={seat.height / 2}
                    x={seat.x + seat.width / 2}
                    y={seat.y + seat.height / 2}
                    scaleX={isSelected ? 1.1 : 1}
                    scaleY={isSelected ? 1.1 : 1}
                    shadowColor={isSelected ? '#22c55e' : undefined}
                    shadowBlur={isSelected ? 8 : 0}
                    shadowOpacity={isSelected ? 0.6 : 0}
                    opacity={(isSeatBlocked || isSectionSoldOut) ? 0.5 : 1}
                    listening={!isUnclickable}
                    onClick={() => handleSeatClick(seat)}
                    onTap={() => handleSeatClick(seat)}
                    onMouseEnter={() => {
                        if (!isUnclickable) {
                            setHoveredSeatId(seat.id);
                            const container = stageRef.current?.container();
                            if (container) container.style.cursor = 'pointer';
                        }
                    }}
                    onMouseLeave={() => {
                        setHoveredSeatId(null);
                        const container = stageRef.current?.container();
                        if (container) container.style.cursor = 'default';
                    }}
                />
            );
        });
    };

    const renderTexts = () => texts.filter(t => !t.attachedAreaId).map(t => (
        <KonvaText
            key={t.id}
            x={t.x} y={t.y}
            width={t.width} height={t.height}
            rotation={t.rotation}
            text={t.text}
            fontSize={t.fontSize}
            fontFamily={t.fontFamily}
            fontStyle={t.fontStyle}
            fill={t.fill}
            align={t.align}
            verticalAlign={t.verticalAlign}
            listening={false}
        />
    ));

    const renderLegend = () => (
        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Loại vé</div>
            {ticketTypes.map(tt => {
                const remaining = tt.remainingQuantity ?? null;
                return (
                    <div key={tt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 14, height: 14, borderRadius: 3, background: tt.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 14, color: '#e5e7eb' }}>{tt.name}</span>
                        </div>
                        {remaining != null && (
                            <span style={{ fontSize: 14, fontWeight: 400, color: remaining === 0 ? '#ef4444' : TEXT_MUTED }}>
                                {remaining === 0 ? 'Hết vé' : `Còn lại: ${remaining} vé`}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderSelectedSeatsPanel = () => {
        if (mode !== 'seat') return null;
        return (
            <div>
                <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Ghế đã chọn ({selectedSeatsInfo.length})
                </div>
                {selectedSeatsInfo.length === 0 ? (
                    <div style={{ fontSize: 13, color: TEXT_MUTED, textAlign: 'center', padding: '16px 0' }}>
                        Bấm vào ghế để chọn
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                        {selectedSeatsInfo.map(s => (
                            <div key={s.id} style={{ background: '#16162a', border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.ticketTypeColor, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{s.sectionName} · Hàng {s.row} – Ghế {s.number}</div>
                                        <div style={{ fontSize: 11, color: TEXT_MUTED }}>{s.ticketTypeName}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {!allowSelectBlocked && (
                                        <span style={{ fontSize: 12, color: PRIMARY, fontWeight: 600 }}>{fmtVND(s.price)}</span>
                                    )}
                                    <button
                                        onClick={() => setSelectedSeatIds(prev => { const n = new Set(prev); n.delete(s.id); return n; })}
                                        style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}
                                    >×</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderSelectedZonePanel = () => {
        if (mode !== 'zone') return null;
        if (!selectedZone) return (
            <div style={{ fontSize: 13, color: TEXT_MUTED, textAlign: 'center', padding: '16px 0' }}>
                Bấm vào khu vực để chọn
            </div>
        );
        const tt = ticketTypes.find(t => t.id === selectedZone.ticketTypeId);
        const maxQty = tt?.remainingQuantity ?? 0;
        const atMin = selectedZone.quantity <= 1;
        const atMax = selectedZone.quantity >= maxQty;
        return (
            <div style={{ background: '#16162a', border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: selectedZone.ticketTypeColor }} />
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{selectedZone.areaName}</span>
                </div>
                <div style={{ fontSize: 12, color: TEXT_MUTED }}>{selectedZone.ticketTypeName} · {fmtVND(selectedZone.price)} / vé</div>
                <div style={{ fontSize: 12, color: atMax ? '#ef4444' : TEXT_MUTED }}>Còn lại: {maxQty} vé</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#e5e7eb' }}>Số lượng:</span>
                    <button disabled={atMin} onClick={() => setSelectedZone(z => z ? { ...z, quantity: Math.max(1, z.quantity - 1) } : z)} style={{ ...qtyBtn, opacity: atMin ? 0.4 : 1, cursor: atMin ? 'not-allowed' : 'pointer' }}>−</button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontSize: 15, fontWeight: 700 }}>{selectedZone.quantity}</span>
                    <button disabled={atMax} onClick={() => setSelectedZone(z => z ? { ...z, quantity: Math.min(maxQty, z.quantity + 1) } : z)} style={{ ...qtyBtn, opacity: atMax ? 0.4 : 1, cursor: atMax ? 'not-allowed' : 'pointer' }}>+</button>
                </div>
                <button onClick={() => setSelectedZone(null)} style={{ background: 'transparent', border: `1px solid ${BORDER_COLOR}`, borderRadius: 6, padding: '4px 0', color: TEXT_MUTED, cursor: 'pointer', fontSize: 12 }}>
                    Chọn khu vực khác
                </button>
            </div>
        );
    };

    const canConfirm = mode === 'seat' ? selectedSeatIds.size > 0 : !!selectedZone;

    const seatLegend = () => {
        if (mode !== 'seat') return null;
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: TEXT_MUTED, marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 15, height: 15, borderRadius: 4, background: SEAT_AVAILABLE_COLOR, border: '1px solid #555' }} />
                    Ghế đang trống
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 15, height: 15, borderRadius: 4, background: SEAT_SELECTED_COLOR }} />
                    Ghế đang chọn
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 15, height: 15, borderRadius: 4, background: SEAT_SOLD_COLOR }} />
                    {allowSelectBlocked ? 'Ghế đã khóa (có thể chọn để mở khóa)' : 'Ghế đã bán / khóa'}
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', background: BG_COLOR, color: 'white', position: 'relative' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                <div style={{ padding: '10px 20px', borderBottom: `1px solid ${BORDER_COLOR}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 15, color: PRIMARY, fontWeight: 700 }}>Chọn khu vực</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED }}>
                        {mode === 'zone' ? 'Bấm vào khu vực để chọn vé' : 'Bấm vào ghế để chọn'}
                    </div>
                    {seatLegend()}
                </div>

                <div style={{ position: 'absolute', left: 16, top: 70, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 10 }}>
                    {[
                        { label: '+', action: () => setStageScale(s => Math.min(s + 0.15, 5)) },
                        {
                            label: '↺', action: () => {
                                const scale = Math.min((containerSize.width * 0.97) / CANVAS_WIDTH, (containerSize.height * 0.97) / CANVAS_HEIGHT, 1);
                                setStageScale(scale);
                                setStagePos({ x: (containerSize.width - CANVAS_WIDTH * scale) / 2, y: (containerSize.height - CANVAS_HEIGHT * scale) / 2 });
                            }
                        },
                        { label: '−', action: () => setStageScale(s => Math.max(s - 0.15, 0.2)) },
                    ].map(({ label, action }) => (
                        <button key={label} onClick={action} style={zoomBtn}>{label}</button>
                    ))}
                </div>

                <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
                    {containerSize.width > 0 && (
                        <Stage
                            ref={stageRef}
                            width={containerSize.width}
                            height={containerSize.height}
                            scaleX={stageScale}
                            scaleY={stageScale}
                            x={stagePos.x}
                            y={stagePos.y}
                            onWheel={handleWheel}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onContextMenu={e => e.evt.preventDefault()}
                        >
                            <Layer ref={layerRef}>
                                {renderAreas()}
                                {renderSeats()}
                                {renderTexts()}
                            </Layer>
                        </Stage>
                    )}
                </div>
            </div>

            <div style={{ width: 300, background: PANEL_BG, borderLeft: `1px solid ${BORDER_COLOR}`, display: 'flex', flexDirection: 'column', padding: '20px 16px', gap: 16, overflowY: 'auto' }}>
                {renderLegend()}
                <div style={{ height: 1, background: BORDER_COLOR }} />
                {mode === 'zone' ? renderSelectedZonePanel() : renderSelectedSeatsPanel()}

                {totalPrice > 0 && !allowSelectBlocked && (
                    <div style={{ background: '#16162a', border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: TEXT_MUTED }}>
                            {mode === 'seat' ? `x${selectedSeatIds.size}` : `x${selectedZone?.quantity}`}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>{fmtVND(totalPrice)}</span>
                    </div>
                )}

                {!hideConfirmButton && (
                    <button
                        disabled={!canConfirm}
                        onClick={handleConfirm}
                        style={{
                            marginTop: 'auto',
                            background: canConfirm ? PRIMARY : '#374151',
                            border: 'none',
                            borderRadius: 10,
                            padding: '14px',
                            color: canConfirm ? 'white' : '#6b7280',
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: canConfirm ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'all 0.2s',
                        }}
                    >
                        {canConfirm
                            ? <>{confirmLabel ?? 'Tiếp tục'} · {fmtVND(totalPrice)} <span style={{ fontSize: 16 }}>»</span></>
                            : 'Vui lòng chọn vé'
                        }
                    </button>
                )}

                {extraActions}
            </div>

            {zonePopup && (
                <div
                    onClick={() => setZonePopup(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: 'white', borderRadius: 14, padding: '28px 24px', width: 360, display: 'flex', flexDirection: 'column', gap: 16, color: '#111', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Khu {zonePopup.areaName}</h3>
                            <button onClick={() => setZonePopup(null)} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#555', lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
                            Lưu ý: Bạn chỉ có thể chọn vé trong 1 khu vực
                        </div>
                        {(() => {
                            const tt = ticketTypes.find(t => t.id === zonePopup.ticketTypeId);
                            const maxQty = tt?.remainingQuantity ?? 0;
                            const atMin = zonePopup.quantity <= 1;
                            const atMax = zonePopup.quantity >= maxQty;
                            return (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 14, height: 14, borderRadius: 3, background: zonePopup.ticketTypeColor }} />
                                            <span style={{ fontSize: 15, fontWeight: 600 }}>{zonePopup.ticketTypeName}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <button disabled={atMin} onClick={() => setZonePopup(z => z ? { ...z, quantity: Math.max(1, z.quantity - 1) } : z)} style={{ ...popupQtyBtn, opacity: atMin ? 0.4 : 1, cursor: atMin ? 'not-allowed' : 'pointer' }}>−</button>
                                            <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{zonePopup.quantity}</span>
                                            <button disabled={atMax} onClick={() => setZonePopup(z => z ? { ...z, quantity: Math.min(maxQty, z.quantity + 1) } : z)} style={{ ...popupQtyBtn, opacity: atMax ? 0.4 : 1, cursor: atMax ? 'not-allowed' : 'pointer' }}>+</button>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 12, color: atMax ? '#ef4444' : '#9ca3af' }}>Còn lại: {maxQty} vé</div>
                                </>
                            );
                        })()}
                        <button onClick={() => setZonePopup(null)} style={{ background: 'transparent', border: 'none', color: PRIMARY, cursor: 'pointer', fontSize: 14, textDecoration: 'underline', padding: 0 }}>
                            Chọn khu vực khác
                        </button>
                        <button onClick={confirmZone} style={{ background: '#16a34a', border: 'none', borderRadius: 10, padding: '14px', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            Tiếp tục · {fmtVND(zonePopup.price * zonePopup.quantity)} <span style={{ fontSize: 17 }}>»</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const zoomBtn: React.CSSProperties = { width: 34, height: 34, borderRadius: 8, background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e5e7eb', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const qtyBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 6, background: '#2a2a3e', border: '1px solid #374151', color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 };
const popupQtyBtn: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, background: '#f3f4f6', border: '1px solid #d1d5db', color: '#111', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontWeight: 700 };

const SeatMapViewerPage: React.FC = () => {
    const { id: eventId } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const [eventLoading, setEventLoading] = useState(true);
    const { eventSessionId } = location.state || {};
    const { spec, loading: seatMapLoading } = useSelector((state: RootState) => state.SEATMAP);
    const { ticketTypes: ticketTypeItems } = useSelector((state: RootState) => state.TICKET_TYPE);
    const { currentEvent } = useSelector((state: RootState) => state.EVENT);

    useEffect(() => {
        if (!eventId) return;
        dispatch(fetchEventById(eventId)).finally(() => setEventLoading(false));
    }, [eventId, dispatch]);

    useEffect(() => {
        if (!currentEvent) return;
        if (currentEvent.status !== 'Published' && currentEvent.status !== 'Completed') {
            notify.error('Sự kiện chưa được mở bán');
            navigate(`/event-detail/${eventId}`);
        }
    }, [currentEvent, eventId, navigate]);

    useEffect(() => {
        if (!eventSessionId) {
            notify.error('Thiếu session, quay lại trang sự kiện');
            navigate(`/event-detail/${eventId}`);
        }
    }, [eventSessionId, eventId, navigate]);

    useEffect(() => {
        if (!eventId || !eventSessionId) return;
        dispatch(fetchGetSeatMap({ eventId, sessionId: eventSessionId }));
        dispatch(fetchGetAllTicketTypes({ eventId, eventSessionId }));
    }, [eventId, eventSessionId, dispatch]);

    const seatMapData = useMemo<SeatMapData>(() => {
        if (!spec) return { areas: [], texts: [] };
        try { return JSON.parse(spec) as SeatMapData; }
        catch { return { areas: [], texts: [] }; }
    }, [spec]);

    const ticketTypes = useMemo<TicketType[]>(() => {
        const seen = new Set<string>();
        return seatMapData.areas
            .filter(area => area.isAreaType && area.ticketTypeId && !seen.has(area.ticketTypeId) && seen.add(area.ticketTypeId))
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

    const mode = useMemo<ViewerMode>(() =>
        seatMapData.areas.some(area => area.seats && area.seats.length > 0) ? 'seat' : 'zone',
        [seatMapData]
    );

    const handleConfirm = async (payload: ConfirmPayload) => {
        if (!eventSessionId) { notify.error('Session không hợp lệ'); return; }
        let tickets: TicketRequest[] = [];
        if (payload.mode === 'zone' && payload.zones) {
            tickets = payload.zones.flatMap(zone =>
                Array.from({ length: zone.quantity }, () => ({ eventSessionId, ticketTypeId: zone.ticketTypeId }))
            );
        }
        if (payload.mode === 'seat' && payload.seats) {
            tickets = payload.seats.map(seat => ({ eventSessionId, ticketTypeId: seat.ticketTypeId, seatId: seat.id }));
        }

        const request: CreatePendingOrderRequest = { eventId: eventId!, tickets };
        const result = await dispatch(fetchCreatePendingOrder(request));
        if (fetchCreatePendingOrder.fulfilled.match(result)) {
            const orderId = result.payload.data;
            await clearOldOrderFromFirebase();
            localStorage.setItem('currentOrderId', orderId);
            navigate('/payment-ticket');
            notify.success('Tạo order thành công');
        } else {
            notify.error('Tạo order thất bại, vé đã không còn');
        }
    };

    if (!eventSessionId) return null;
    if (eventLoading || !currentEvent) return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0B12', color: 'white', fontSize: 16 }}>
            Đang tải...
        </div>
    );
    if (seatMapLoading) return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0B12', color: 'white', fontSize: 16 }}>
            Đang tải...
        </div>
    );

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0B0B12' }}>
            <div style={{ height: 48, background: '#18122B', borderBottom: '1px solid #2a2a3e', display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0, gap: 12 }}>
                <button
                    onClick={() => navigate(`/event-detail/${eventId}`)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#221A3A] text-gray-200 font-semibold text-sm hover:bg-[#2a2147] transition-colors"
                >
                    <FiArrowLeft size={18} /> Trở về
                </button>
                <span style={{ fontSize: 14, color: '#e5e7eb', fontWeight: 600 }}>
                    Click trái để chọn ghế • Giữ chuột phải và kéo để di chuyển • Cuộn để zoom
                </span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <SeatMapViewer
                    seatMapData={seatMapData}
                    mode={mode}
                    ticketTypes={ticketTypes}
                    onConfirm={handleConfirm}
                />
            </div>
        </div>
    );
};

export { SeatMapViewer };
export type { ConfirmPayload, SeatMapViewerProps, SelectedSeat, ViewerMode };
export default SeatMapViewerPage;