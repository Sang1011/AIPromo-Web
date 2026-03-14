import Konva from 'konva';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Text as KonvaText, Layer, Line, Rect, Stage } from 'react-konva';
import type { Area, Seat, SeatMapData, TextEntity, TicketType } from '../../types/config/seatmap';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface SeatMapViewerProps {
    /** JSON data exported from SeatMapEditorPage */
    seatMapData: SeatMapData;
    /** Viewer mode: 'zone' = click area, 'seat' = pick individual seats */
    mode: ViewerMode;
    /** Ticket type definitions (name, color, price) */
    ticketTypes: TicketType[];
    /** Called when user confirms selection */
    onConfirm?: (payload: ConfirmPayload) => void;
}

interface ConfirmPayload {
    mode: ViewerMode;
    /** zone mode */
    zones?: { areaId: string; areaName: string; ticketTypeId: string; price: number; quantity: number }[];
    /** seat mode */
    seats?: SelectedSeat[];
    totalPrice: number;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const CANVAS_WIDTH = 1550;
const CANVAS_HEIGHT = 900;
const SEAT_SELECTED_COLOR = '#22c55e';    // green-500
const SEAT_AVAILABLE_COLOR = '#ffffff';    // white
const SEAT_SOLD_COLOR = 'red';
const BG_COLOR = '#0B0B12';
const PANEL_BG = '#18122B';
const BORDER_COLOR = '#2a2a3e';
const PRIMARY = '#7c3bed';
const TEXT_MUTED = '#9ca3af';

// ─────────────────────────────────────────────
// Helper: format VND
// ─────────────────────────────────────────────

const fmtVND = (n: number) =>
    n.toLocaleString('vi-VN') + 'đ';

// ─────────────────────────────────────────────
// SeatMapViewer component
// ─────────────────────────────────────────────

const SeatMapViewer: React.FC<SeatMapViewerProps> = ({
    seatMapData,
    mode,
    ticketTypes,
    onConfirm,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);

    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const isPanningRef = useRef(false);
    const panStartRef = useRef({ x: 0, y: 0 });

    // Zone mode state
    const [zonePopup, setZonePopup] = useState<ZonePopup | null>(null);
    const [selectedZone, setSelectedZone] = useState<ZonePopup | null>(null);

    // Seat mode state
    const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());

    // Hover
    const [hoveredAreaId, setHoveredAreaId] = useState<string | null>(null);

    // Flatten all seats from data
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

    // Derived selected seats info
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
            };
        });
    }, [selectedSeatIds, allSeats, seatMapData, ticketTypes]);

    const totalPrice = useMemo(() => {
        if (mode === 'seat') {
            return selectedSeatsInfo.reduce((s, seat) => s + seat.price, 0);
        }
        if (mode === 'zone' && selectedZone) {
            return selectedZone.price * selectedZone.quantity;
        }
        return 0;
    }, [mode, selectedSeatsInfo, selectedZone]);

    // ── Resize observer ──
    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            const r = entries[0].contentRect;
            setContainerSize({ width: r.width, height: r.height });
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // Center on mount
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

    // ── Zoom ──
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

    // ── Pan (right-click drag) ──
    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.evt.button !== 2) return;
        isPanningRef.current = true;
        panStartRef.current = {
            x: e.evt.clientX - stagePos.x,
            y: e.evt.clientY - stagePos.y,
        };
    }, [stagePos]);

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isPanningRef.current) return;
        setStagePos({
            x: e.evt.clientX - panStartRef.current.x,
            y: e.evt.clientY - panStartRef.current.y,
        });
    }, []);

    useEffect(() => {
        const stop = () => { isPanningRef.current = false; };
        window.addEventListener('mouseup', stop);
        return () => window.removeEventListener('mouseup', stop);
    }, []);

    // ── Area click (zone mode) ──
    const handleAreaClick = useCallback((area: Area) => {
        if (mode !== 'zone') return;
        const tt = ticketTypes.find(t => t.id === area.ticketTypeId);
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

    // ── Seat click (seat mode) ──
    const handleSeatClick = useCallback((seat: Seat) => {
        if (mode !== 'seat') return;
        if (seat.status === 'sold') return;
        setSelectedSeatIds(prev => {
            const next = new Set(prev);
            if (next.has(seat.id)) next.delete(seat.id);
            else next.add(seat.id);
            return next;
        });
    }, [mode]);

    // ── Confirm zone popup ──
    const confirmZone = () => {
        if (!zonePopup) return;
        setSelectedZone({ ...zonePopup });
        setZonePopup(null);
    };

    // ── Confirm final ──
    const handleConfirm = () => {
        if (mode === 'zone' && selectedZone) {
            onConfirm?.({
                mode,
                zones: [{ ...selectedZone }],
                totalPrice,
            });
        }
        if (mode === 'seat') {
            onConfirm?.({
                mode,
                seats: selectedSeatsInfo,
                totalPrice,
            });
        }
    };

    // ── Reset ──
    const handleReset = () => {
        setSelectedZone(null);
        setSelectedSeatIds(new Set());
        setZonePopup(null);
    };

    // ── Render area shape ──
    const renderAreaShape = (area: Area, fillColor: string, strokeColor: string, opacity: number) => {
        const common = {
            id: area.id,
            stroke: strokeColor,
            strokeWidth: 2,
            fill: fillColor,
            opacity,
        };

        if (area.type === 'circle') {
            return <Circle radius={area.width / 2} {...common} />;
        }
        if (area.type === 'triangle') {
            return <Line points={[area.width / 2, 0, area.width, area.height, 0, area.height]} closed {...common} />;
        }
        if (area.type === 'parallelogram') {
            return <Line points={[area.width * 0.2, 0, area.width, 0, area.width * 0.8, area.height, 0, area.height]} closed {...common} />;
        }
        if (area.type === 'trapezoid') {
            return <Line points={[area.width * 0.2, 0, area.width * 0.8, 0, area.width, area.height, 0, area.height]} closed {...common} />;
        }
        if (area.type === 'polygon' && area.points) {
            return <Line points={area.points} closed {...common} />;
        }
        // rect / square default
        return <Rect width={area.width} height={area.height} cornerRadius={4} {...common} />;
    };

    // ── Render label inside area ──
    const renderAreaLabel = (area: Area, color: string) => {
        const isCircle = area.type === 'circle';
        const cx = isCircle ? 0 : area.width / 2;
        const cy = isCircle ? 0 : area.height / 2;
        const fontSize = Math.max(10, area.labelFontSize ?? 14);
        const tt = ticketTypes.find(t => t.id === area.ticketTypeId);
        const priceStr = fmtVND(area.price ?? tt?.price ?? 0);

        return (
            <>
                <KonvaText
                    x={isCircle ? -area.width / 2 : 0}
                    y={cy - fontSize - 2}
                    width={isCircle ? area.width : area.width}
                    text={area.name}
                    fontSize={fontSize}
                    fontStyle="bold"
                    fill="white"
                    align="center"
                />
                <KonvaText
                    x={isCircle ? -area.width / 2 : 0}
                    y={cy + 2}
                    width={isCircle ? area.width : area.width}
                    text={priceStr}
                    fontSize={Math.max(9, fontSize - 2)}
                    fill="rgba(255,255,255,0.8)"
                    align="center"
                />
            </>
        );
    };

    // ── Render all areas ──
    const renderAreas = () => sections.map(area => {
        if (!area.isAreaType) {
            // Pure shape (non-interactive decoration)
            const fillColor = area.fill ?? '#374151';
            return (
                <Group key={area.id} x={area.x} y={area.y} rotation={area.rotation} listening={false}>
                    {renderAreaShape(area, fillColor, area.stroke ?? '#fff', 1)}
                    {texts
                        .filter(t => t.attachedAreaId === area.id)
                        .map(t => (
                            <KonvaText key={t.id} x={0} y={0} text={t.text} fontSize={t.fontSize} fill={t.fill} align={t.align} width={area.width} height={area.height} verticalAlign={t.verticalAlign} />
                        ))}
                </Group>
            );
        }

        const tt = ticketTypes.find(t => t.id === area.ticketTypeId);
        const baseColor = tt?.color ?? '#6b7280';
        const isHovered = hoveredAreaId === area.id;
        const isSelected = mode === 'zone' && selectedZone?.areaId === area.id;
        const inPopup = mode === 'zone' && zonePopup?.areaId === area.id;

        let fillColor = baseColor;
        let strokeColor = 'white';
        let opacity = 1;

        if (isSelected || inPopup) {
            strokeColor = '#22c55e';
            opacity = 1;
        } else if (isHovered && mode === 'zone') {
            opacity = 0.8;
            strokeColor = '#a78bfa';
        }

        return (
            <Group
                key={area.id}
                x={area.x}
                y={area.y}
                rotation={area.rotation}
                onClick={() => handleAreaClick(area)}
                onTap={() => handleAreaClick(area)}
                onMouseEnter={() => {
                    if (mode === 'zone') setHoveredAreaId(area.id);
                    stageRef.current?.container().style.setProperty('cursor', mode === 'zone' ? 'pointer' : 'default');
                }}
                onMouseLeave={() => {
                    setHoveredAreaId(null);
                    stageRef.current?.container().style.setProperty('cursor', 'default');
                }}
            >
                {renderAreaShape(area, fillColor, strokeColor, opacity)}
                {mode === 'zone' && renderAreaLabel(area, baseColor)}
            </Group>
        );
    });

    // ── Render seats ──
    const renderSeats = () => {
        if (mode !== 'seat') return null;
        return allSeats.map(seat => {
            const isSold = seat.status === 'sold';
            const isSelected = selectedSeatIds.has(seat.id);
            let fill: string;
            if (isSold) fill = SEAT_SOLD_COLOR;
            else if (isSelected) fill = SEAT_SELECTED_COLOR;
            else fill = SEAT_AVAILABLE_COLOR;

            return (
                <Circle
                    key={seat.id}
                    x={seat.x + seat.width / 2}
                    y={seat.y + seat.height / 2}
                    radius={Math.min(seat.width, seat.height) / 2 - 1}
                    fill={fill}
                    stroke={isSelected ? '#16a34a' : 'transparent'}
                    strokeWidth={isSelected ? 2 : 0}
                    opacity={isSold ? 0.45 : 1}
                    listening={!isSold}
                    onClick={() => handleSeatClick(seat)}
                    onTap={() => handleSeatClick(seat)}
                    onMouseEnter={() => {
                        if (!isSold) stageRef.current?.container().style.setProperty('cursor', 'pointer');
                    }}
                    onMouseLeave={() => {
                        stageRef.current?.container().style.setProperty('cursor', 'default');
                    }}
                />
            );
        });
    };

    // ── Render free texts ──
    const renderTexts = () => texts
        .filter(t => !t.attachedAreaId)
        .map(t => (
            <KonvaText
                key={t.id}
                x={t.x}
                y={t.y}
                width={t.width}
                height={t.height}
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

    // ── Right panel: ticket type legend ──
    const renderLegend = () => (
        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Giá vé</div>
            {ticketTypes.map(tt => (
                <div key={tt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 3, background: tt.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#e5e7eb' }}>{tt.name}</span>
                    </div>
                    <span style={{ fontSize: 13, color: PRIMARY, fontWeight: 600 }}>{fmtVND(tt.price)}</span>
                </div>
            ))}
        </div>
    );

    // ── Right panel: seat mode selected seats ──
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
                            <div
                                key={s.id}
                                style={{
                                    background: '#16162a',
                                    border: `1px solid ${BORDER_COLOR}`,
                                    borderRadius: 8,
                                    padding: '8px 10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 8,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.ticketTypeColor, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                                            {s.sectionName} · Hàng {s.row} – Ghế {s.number}
                                        </div>
                                        <div style={{ fontSize: 11, color: TEXT_MUTED }}>{s.ticketTypeName}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 12, color: PRIMARY, fontWeight: 600 }}>{fmtVND(s.price)}</span>
                                    <button
                                        onClick={() => setSelectedSeatIds(prev => { const n = new Set(prev); n.delete(s.id); return n; })}
                                        style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}
                                        title="Bỏ chọn"
                                    >×</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ── Right panel: zone mode selected zone ──
    const renderSelectedZonePanel = () => {
        if (mode !== 'zone') return null;
        if (!selectedZone) return (
            <div style={{ fontSize: 13, color: TEXT_MUTED, textAlign: 'center', padding: '16px 0' }}>
                Bấm vào khu vực để chọn
            </div>
        );
        return (
            <div style={{
                background: '#16162a',
                border: `1px solid ${BORDER_COLOR}`,
                borderRadius: 8,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: selectedZone.ticketTypeColor }} />
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{selectedZone.areaName}</span>
                </div>
                <div style={{ fontSize: 12, color: TEXT_MUTED }}>{selectedZone.ticketTypeName} · {fmtVND(selectedZone.price)} / vé</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#e5e7eb' }}>Số lượng:</span>
                    <button
                        onClick={() => setSelectedZone(z => z ? { ...z, quantity: Math.max(1, z.quantity - 1) } : z)}
                        style={qtyBtn}
                    >−</button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontSize: 15, fontWeight: 700 }}>{selectedZone.quantity}</span>
                    <button
                        onClick={() => setSelectedZone(z => z ? { ...z, quantity: z.quantity + 1 } : z)}
                        style={qtyBtn}
                    >+</button>
                </div>
                <button
                    onClick={() => setSelectedZone(null)}
                    style={{ background: 'transparent', border: `1px solid ${BORDER_COLOR}`, borderRadius: 6, padding: '4px 0', color: TEXT_MUTED, cursor: 'pointer', fontSize: 12 }}
                >
                    Chọn khu vực khác
                </button>
            </div>
        );
    };

    const canConfirm = mode === 'seat'
        ? selectedSeatIds.size > 0
        : !!selectedZone;

    // ── Seat mode legend ──
    const seatLegend = () => {
        if (mode !== 'seat') return null;
        return (
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: TEXT_MUTED, marginBottom: 6 }}>
                {[
                    { color: SEAT_AVAILABLE_COLOR, label: 'Đang trống' },
                    { color: SEAT_SELECTED_COLOR, label: 'Đang chọn' },
                    { color: SEAT_SOLD_COLOR, label: 'Không chọn được' },
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '1px solid #555' }} />
                        {label}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', background: BG_COLOR, color: 'white', position: 'relative' }}>
            {/* ── Canvas area ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {/* Top bar */}
                <div style={{ padding: '10px 20px', borderBottom: `1px solid ${BORDER_COLOR}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 15, color: PRIMARY, fontWeight: 700 }}>Chọn khu vực</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED }}>
                        {mode === 'zone' ? 'Bấm vào khu vực để chọn vé' : 'Bấm vào ghế để chọn'}
                    </div>
                    {seatLegend()}
                </div>

                {/* Zoom controls */}
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

                {/* Konva stage */}
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

            {/* ── Right Panel ── */}
            <div style={{
                width: 300,
                background: PANEL_BG,
                borderLeft: `1px solid ${BORDER_COLOR}`,
                display: 'flex',
                flexDirection: 'column',
                padding: '20px 16px',
                gap: 16,
                overflowY: 'auto',
            }}>
                {renderLegend()}

                <div style={{ height: 1, background: BORDER_COLOR }} />

                {mode === 'zone' ? renderSelectedZonePanel() : renderSelectedSeatsPanel()}

                {/* Total */}
                {totalPrice > 0 && (
                    <div style={{
                        background: '#16162a',
                        border: `1px solid ${BORDER_COLOR}`,
                        borderRadius: 8,
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span style={{ fontSize: 13, color: TEXT_MUTED }}>
                            {mode === 'seat' ? `x${selectedSeatIds.size}` : `x${selectedZone?.quantity}`}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>{fmtVND(totalPrice)}</span>
                    </div>
                )}

                {/* Confirm button */}
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
                    {canConfirm ? (
                        <>Tiếp tục · {fmtVND(totalPrice)} <span style={{ fontSize: 16 }}>»</span></>
                    ) : 'Vui lòng chọn vé'}
                </button>
            </div>

            {/* ── Zone Popup Modal ── */}
            {zonePopup && (
                <div
                    onClick={() => setZonePopup(null)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.55)',
                        zIndex: 50,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: 14,
                            padding: '28px 24px',
                            width: 360,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                            color: '#111',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Khu {zonePopup.areaName}</h3>
                            <button
                                onClick={() => setZonePopup(null)}
                                style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#555', lineHeight: 1 }}
                            >×</button>
                        </div>

                        {/* Warning */}
                        <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
                            Lưu ý: Bạn chỉ có thể chọn vé trong 1 khu vực
                        </div>

                        {/* Ticket type row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 14, height: 14, borderRadius: 3, background: zonePopup.ticketTypeColor }} />
                                <span style={{ fontSize: 15, fontWeight: 600 }}>{zonePopup.ticketTypeName}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <button
                                    onClick={() => setZonePopup(z => z ? { ...z, quantity: Math.max(1, z.quantity - 1) } : z)}
                                    style={popupQtyBtn}
                                >−</button>
                                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{zonePopup.quantity}</span>
                                <button
                                    onClick={() => setZonePopup(z => z ? { ...z, quantity: z.quantity + 1 } : z)}
                                    style={popupQtyBtn}
                                >+</button>
                            </div>
                        </div>

                        {/* Change zone link */}
                        <button
                            onClick={() => setZonePopup(null)}
                            style={{ background: 'transparent', border: 'none', color: PRIMARY, cursor: 'pointer', fontSize: 14, textDecoration: 'underline', padding: 0 }}
                        >
                            Chọn khu vực khác
                        </button>

                        {/* Confirm */}
                        <button
                            onClick={confirmZone}
                            style={{
                                background: '#16a34a',
                                border: 'none',
                                borderRadius: 10,
                                padding: '14px',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                            }}
                        >
                            Tiếp tục · {fmtVND(zonePopup.price * zonePopup.quantity)} <span style={{ fontSize: 17 }}>»</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────
// Style helpers
// ─────────────────────────────────────────────

const zoomBtn: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    color: '#e5e7eb',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const qtyBtn: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: '#2a2a3e',
    border: '1px solid #374151',
    color: 'white',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
};

const popupQtyBtn: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    color: '#111',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    fontWeight: 700,
};

// ─────────────────────────────────────────────
// Page wrapper (demo / standalone usage)
// Nhận seatMapData qua props hoặc từ URL param
// ─────────────────────────────────────────────

interface SeatMapViewerPageProps {
    seatMapData?: SeatMapData;
    mode?: ViewerMode;
    ticketTypes?: TicketType[];
    onConfirm?: (payload: ConfirmPayload) => void;
    onBack?: () => void;
}

const DEFAULT_TICKET_TYPES: TicketType[] = [
    { id: 'VIP', name: 'Vé VIP Premium', color: '#8B5CF6', price: 500000 },
    { id: 'STANDARD', name: 'Vé Standard', color: '#3b82f6', price: 300000 },
    { id: 'ECONOMY', name: 'Vé Economy', color: '#10b981', price: 150000 },
];

const EMPTY_MAP: SeatMapData = { areas: [], texts: [] };

const SeatMapViewerPage: React.FC<SeatMapViewerPageProps> = ({
    seatMapData = EMPTY_MAP,
    mode = 'zone',
    ticketTypes = DEFAULT_TICKET_TYPES,
    onConfirm,
    onBack,
}) => {
    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0B0B12' }}>
            {/* Top nav */}
            <div style={{
                height: 48,
                background: '#18122B',
                borderBottom: '1px solid #2a2a3e',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                gap: 16,
                flexShrink: 0,
            }}>
                {onBack && (
                    <button
                        onClick={onBack}
                        style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}
                    >
                        ← Trở về
                    </button>
                )}
                <span style={{ fontSize: 14, color: '#e5e7eb', fontWeight: 600 }}>Chọn vé</span>
            </div>

            {/* Main viewer */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <SeatMapViewer
                    seatMapData={seatMapData}
                    mode={mode}
                    ticketTypes={ticketTypes}
                    onConfirm={onConfirm}
                />
            </div>
        </div>
    );
};

export { SeatMapViewer };
export type { SeatMapViewerProps, ConfirmPayload, ViewerMode };
export default SeatMapViewerPage;