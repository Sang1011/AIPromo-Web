// SeatMapReadOnly.tsx
import Konva from 'konva';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Text as KonvaText, Layer, Line, Rect, Stage } from 'react-konva';
import type { Area, Seat, SeatMapData, TextEntity } from '../../../types/config/seatmap';
import type { TicketTypeItem } from '../../../types/ticketType/ticketType';

const CANVAS_WIDTH = 1550;
const CANVAS_HEIGHT = 900;

const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

interface SeatMapReadOnlyProps {
    seatMapData: SeatMapData;
    ticketTypes?: TicketTypeItem[];
}

interface AreaTooltip {
    x: number;
    y: number;
    name: string;
    quantity: number;
    price: number;
    color: string;
}

const SeatMapReadOnly: React.FC<SeatMapReadOnlyProps> = ({ seatMapData, ticketTypes = [] }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const isPanningRef = useRef(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const [tooltip, setTooltip] = useState<AreaTooltip | null>(null);

    const allSeats = useMemo<Seat[]>(() =>
        seatMapData.areas.flatMap(a => a.seats ?? []), [seatMapData]);

    const sections = useMemo<Area[]>(() =>
        seatMapData.areas.map(({ seats: _s, ...area }) => area as Area), [seatMapData]);

    const texts = useMemo<TextEntity[]>(() =>
        seatMapData.texts ?? [], [seatMapData]);

    const areasWithSeats = useMemo(() =>
        new Set(seatMapData.areas.filter(a => (a.seats?.length ?? 0) > 0).map(a => a.id)),
        [seatMapData]);

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
        if (e.evt.button !== 2 && e.evt.button !== 0) return;
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

    // Helper lấy tooltip data từ area
    const getTooltipData = (area: Area, tt: TicketTypeItem | undefined, pos: { x: number; y: number }): AreaTooltip => ({
        x: pos.x,
        y: pos.y,
        name: area.name,
        quantity: tt?.quantity ?? 0,
        price: tt?.price ?? area.price ?? 0,
        color: tt?.color ?? area.fill ?? '#6b7280',
    });

    const renderAreaShape = (area: Area, fillColor: string) => {
        const common = { stroke: area.stroke ?? 'white', strokeWidth: 1, fill: fillColor };
        if (area.type === 'circle') return <Circle radius={area.width / 2} {...common} />;
        if (area.type === 'triangle') return <Line points={[area.width / 2, 0, area.width, area.height, 0, area.height]} closed {...common} />;
        if (area.type === 'parallelogram') return <Line points={[area.width * 0.2, 0, area.width, 0, area.width * 0.8, area.height, 0, area.height]} closed {...common} />;
        if (area.type === 'trapezoid') return <Line points={[area.width * 0.2, 0, area.width * 0.8, 0, area.width, area.height, 0, area.height]} closed {...common} />;
        if (area.type === 'polygon' && area.points) return <Line points={area.points} closed {...common} />;
        return <Rect width={area.width} height={area.height} cornerRadius={4} {...common} />;
    };

    const renderZoneLabel = (area: Area, tt: TicketTypeItem | undefined) => {
        const isCircle = area.type === 'circle';
        const cx = isCircle ? -area.width / 2 : 0;
        const fontSize = Math.max(11, area.labelFontSize ?? 14);
        const lineH = fontSize + 4;
        const totalH = lineH * 3;
        const startY = isCircle ? -(totalH / 2) : (area.height / 2) - (totalH / 2);

        return (
            <>
                <KonvaText x={cx} y={startY} width={area.width}
                    text={area.name} fontSize={fontSize} fontStyle="bold"
                    fill="white" align="center" listening={false} />
                <KonvaText x={cx} y={startY + lineH} width={area.width}
                    text={`SL: ${tt?.quantity ?? 0}`}
                    fontSize={Math.max(9, fontSize - 2)}
                    fill="rgba(134,239,172,0.9)" align="center" listening={false} />
                <KonvaText x={cx} y={startY + lineH * 2} width={area.width}
                    text={fmtVND(tt?.price ?? area.price ?? 0)}
                    fontSize={Math.max(9, fontSize - 2)}
                    fill="rgba(255,255,255,0.75)" align="center" listening={false} />
            </>
        );
    };

    return (
        <div style={{ width: '100%', height: '100%', background: '#0B0B12', position: 'relative' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
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
                        <Layer>
                            {sections.map(area => {
                                const tt = ticketTypes.find(t => t.id === area.ticketTypeId);
                                const fillColor = area.isAreaType
                                    ? (tt?.color ?? area.fill ?? '#6b7280')
                                    : (area.fill ?? '#374151');
                                const hasSeat = areasWithSeats.has(area.id);
                                // Bật listening cho tất cả isAreaType để hover tooltip
                                const needsHover = area.isAreaType;

                                return (
                                    <Group
                                        key={area.id}
                                        x={area.x}
                                        y={area.y}
                                        rotation={area.rotation}
                                        listening={needsHover}
                                        onMouseEnter={needsHover ? () => {
                                            const pos = stageRef.current?.getPointerPosition();
                                            if (!pos) return;
                                            setTooltip(getTooltipData(area, tt, pos));
                                        } : undefined}
                                        onMouseMove={needsHover ? () => {
                                            const pos = stageRef.current?.getPointerPosition();
                                            if (!pos) return;
                                            setTooltip(prev => prev ? { ...prev, x: pos.x, y: pos.y } : null);
                                        } : undefined}
                                        onMouseLeave={needsHover ? () => setTooltip(null) : undefined}
                                    >
                                        {renderAreaShape(area, fillColor)}

                                        {texts.filter(t => t.attachedAreaId === area.id).map(t => (
                                            <KonvaText key={t.id} x={0} y={0} text={t.text}
                                                fontSize={t.fontSize} fill={t.fill} align={t.align}
                                                width={area.width} height={area.height}
                                                verticalAlign={t.verticalAlign} listening={false} />
                                        ))}

                                        {/* Zone: label trực tiếp */}
                                        {area.isAreaType && !hasSeat && renderZoneLabel(area, tt)}

                                        {/* Seat area: chỉ hiện name nhỏ trên cùng */}
                                        {area.isAreaType && hasSeat && (
                                            <KonvaText
                                                x={area.type === 'circle' ? -area.width / 2 : 0}
                                                y={area.type === 'circle' ? -(area.height / 2) : 4}
                                                width={area.width}
                                                text={area.name}
                                                fontSize={Math.max(11, area.labelFontSize ?? 14)}
                                                fontStyle="bold"
                                                fill="white"
                                                align="center"
                                                listening={false}
                                            />
                                        )}
                                    </Group>
                                );
                            })}

                            {allSeats.map(seat => (
                                <Rect
                                    key={seat.id}
                                    x={seat.x} y={seat.y}
                                    width={seat.width} height={seat.height}
                                    rotation={seat.rotation}
                                    fill={seat.status === 'blocked' ? '#9ca3af' : '#ffffff'}
                                    stroke="rgba(0,0,0,0.15)"
                                    strokeWidth={0.5}
                                    cornerRadius={4}
                                    opacity={seat.status === 'blocked' ? 0.5 : 1}
                                    listening={false}
                                />
                            ))}

                            {texts.filter(t => !t.attachedAreaId).map(t => (
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
                            ))}
                        </Layer>
                    </Stage>
                )}
            </div>

            {/* Tooltip cho cả zone lẫn seat area */}
            {tooltip && (
                <div style={{
                    position: 'absolute',
                    left: tooltip.x + 14,
                    top: tooltip.y - 10,
                    background: '#1e1b2e',
                    border: `1px solid ${tooltip.color}`,
                    borderRadius: 8,
                    padding: '8px 12px',
                    pointerEvents: 'none',
                    zIndex: 100,
                    minWidth: 150,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: tooltip.color, flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#f3f4f6' }}>{tooltip.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(134,239,172,0.9)', marginBottom: 2 }}>
                        Số lượng: {tooltip.quantity}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                        {fmtVND(tooltip.price)} / vé
                    </div>
                </div>
            )}

            {/* Zoom controls */}
            <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                    <button key={label} onClick={action} style={{
                        width: 30, height: 30, borderRadius: 6,
                        background: '#1a1a2e', border: '1px solid #2a2a3e',
                        color: '#e5e7eb', fontSize: 16, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{label}</button>
                ))}
            </div>
        </div>
    );
};

export default SeatMapReadOnly;