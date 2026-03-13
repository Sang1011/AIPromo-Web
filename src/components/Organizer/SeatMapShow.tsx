import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Line, Text as KonvaText, Group, Circle } from "react-konva";
import type { Area, SeatMapData, Seat } from "../../types/config/seatmap";
import { FaMinus, FaPlus } from "react-icons/fa";

interface Props {
    data: SeatMapData;
}

export interface AreaWithSeats extends Area {
    seats: Seat[];
}

interface SelectedSeatInfo extends Seat {
    areaName: string;
    ticketTypeName?: string;
    price?: number;
}

const SeatMapShow: React.FC<Props> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<any>(null);

    const [viewport, setViewport] = useState({
        width: 0,
        height: 0,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
    });

    const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
    const [hoveredArea, setHoveredArea] = useState<AreaWithSeats | null>(null);

    const { areas, texts } = data;

    // Tính toán bounds của content
    const getContentBounds = () => {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        areas.forEach(area => {
            minX = Math.min(minX, area.x);
            minY = Math.min(minY, area.y);
            maxX = Math.max(maxX, area.x + area.width);
            maxY = Math.max(maxY, area.y + area.height);

            area.seats.forEach(seat => {
                minX = Math.min(minX, seat.x);
                minY = Math.min(minY, seat.y);
                maxX = Math.max(maxX, seat.x + seat.width);
                maxY = Math.max(maxY, seat.y + seat.height);
            });
        });

        return { minX, minY, maxX, maxY };
    };

    // Auto-fit content
    useEffect(() => {
        if (!containerRef.current) return;

        const updateViewport = () => {
            const container = containerRef.current!;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            const bounds = getContentBounds();
            const contentWidth = bounds.maxX - bounds.minX;
            const contentHeight = bounds.maxY - bounds.minY;

            const scaleX = (containerWidth * 0.85) / contentWidth;
            const scaleY = (containerHeight * 0.85) / contentHeight;
            const scale = Math.min(scaleX, scaleY, 1);

            const scaledWidth = contentWidth * scale;
            const scaledHeight = contentHeight * scale;
            const offsetX = (containerWidth - scaledWidth) / 2 - bounds.minX * scale;
            const offsetY = (containerHeight - scaledHeight) / 2 - bounds.minY * scale;

            setViewport({
                width: containerWidth,
                height: containerHeight,
                scale,
                offsetX,
                offsetY,
            });
        };

        updateViewport();

        const resizeObserver = new ResizeObserver(updateViewport);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, [data]);

    // Toggle seat selection
    const handleToggleSeat = (seat: Seat, area: Area) => {
        if (seat.status !== "available") return;

        setSelectedSeatIds(prev => {
            const isSelected = prev.includes(seat.id);
            const newSelection = isSelected
                ? prev.filter(id => id !== seat.id)
                : [...prev, seat.id];

            console.log("Selected Seat:", {
                id: seat.id,
                row: seat.row,
                number: seat.number,
                area: area.name,
                ticketType: area.ticketTypeId,
                price: area.price,
                action: isSelected ? "deselected" : "selected"
            });

            return newSelection;
        });
    };

    // Handle area click (if no seats)
    const handleAreaClick = (area: AreaWithSeats) => {
        if (area.seats.length === 0) {
            console.log("Selected Area:", {
                id: area.id,
                name: area.name,
                ticketType: area.ticketTypeId,
                price: area.price
            });
        }
    };

    // Zoom controls
    const handleZoom = (delta: number) => {
        setViewport(prev => ({
            ...prev,
            scale: Math.min(Math.max(prev.scale + delta, 0.3), 3)
        }));
    };

    const resetZoom = () => {
        const bounds = getContentBounds();
        const contentWidth = bounds.maxX - bounds.minX;
        const contentHeight = bounds.maxY - bounds.minY;

        const scaleX = (viewport.width * 0.85) / contentWidth;
        const scaleY = (viewport.height * 0.85) / contentHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        const scaledWidth = contentWidth * scale;
        const scaledHeight = contentHeight * scale;
        const offsetX = (viewport.width - scaledWidth) / 2 - bounds.minX * scale;
        const offsetY = (viewport.height - scaledHeight) / 2 - bounds.minY * scale;

        setViewport(prev => ({
            ...prev,
            scale,
            offsetX,
            offsetY
        }));
    };

    // Get selected seats info
    const getSelectedSeatsInfo = (): SelectedSeatInfo[] => {
        const result: SelectedSeatInfo[] = [];
        areas.forEach(area => {
            area.seats.forEach(seat => {
                if (selectedSeatIds.includes(seat.id)) {
                    result.push({
                        ...seat,
                        areaName: area.name,
                        ticketTypeName: area.ticketTypeId,
                        price: area.price
                    });
                }
            });
        });
        return result;
    };

    // Render Area shape
    const renderArea = (area: AreaWithSeats) => {
        const hasSeats = area.seats.length > 0;
        const isHovered = hoveredArea?.id === area.id;

        const commonProps = {
            stroke: area.stroke || 'white',
            strokeWidth: isHovered ? 3 : 2,
            listening: !hasSeats,
            onClick: () => !hasSeats && handleAreaClick(area),
            onMouseEnter: () => !hasSeats && setHoveredArea(area),
            onMouseLeave: () => !hasSeats && setHoveredArea(null),
        };

        if (area.type === 'circle') {
            return (
                <Circle
                    key={area.id}
                    x={area.x + area.width / 2}
                    y={area.y + area.height / 2}
                    radius={area.width / 2}
                    {...commonProps}
                />
            );
        }

        if (area.type === 'polygon' && area.points) {
            return (
                <Line
                    key={area.id}
                    points={area.points}
                    closed
                    {...commonProps}
                />
            );
        }

        if (area.type === 'triangle') {
            return (
                <Line
                    key={area.id}
                    points={[
                        area.x + area.width / 2, area.y,
                        area.x + area.width, area.y + area.height,
                        area.x, area.y + area.height,
                    ]}
                    closed
                    {...commonProps}
                />
            );
        }

        return (
            <Rect
                key={area.id}
                x={area.x}
                y={area.y}
                width={area.width}
                height={area.height}
                rotation={area.rotation}
                {...commonProps}
            />
        );
    };

    const selectedSeatsInfo = getSelectedSeatsInfo();
    const totalPrice = selectedSeatsInfo.reduce((sum, seat) => sum + (seat.price || 0), 0);

    return (
        <div className="w-full h-full flex flex-col bg-[#0f0f1e]">
            {/* Header with info */}
            <div className="bg-[#1a1a2e] border-b border-[#2a2a3e] p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            Chọn ghế ({selectedSeatIds.length} ghế)
                        </h3>
                        {selectedSeatIds.length > 0 && (
                            <p className="text-sm text-emerald-400 font-medium">
                                Tổng tiền: {totalPrice.toLocaleString('vi-VN')}₫
                            </p>
                        )}
                    </div>

                    {/* Zoom controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={resetZoom}
                            className="text-sm text-slate-400 hover:text-white transition px-3 py-1 bg-white/5 rounded"
                        >
                            {Math.round(viewport.scale * 100)}%
                        </button>
                        <button
                            onClick={() => handleZoom(0.1)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition"
                        >
                            <FaPlus size={14} />
                        </button>
                        <button
                            onClick={() => handleZoom(-0.1)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition"
                        >
                            <FaMinus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div ref={containerRef} className="flex-1 overflow-hidden relative">
                {viewport.width > 0 && (
                    <Stage
                        ref={stageRef}
                        width={viewport.width}
                        height={viewport.height}
                    >
                        <Layer>
                            <Group
                                scaleX={viewport.scale}
                                scaleY={viewport.scale}
                                x={viewport.offsetX}
                                y={viewport.offsetY}
                            >
                                {/* AREAS */}
                                {areas.map(area => renderArea(area))}

                                {/* SEATS */}
                                {areas.flatMap(area =>
                                    area.seats.map(seat => {
                                        const isSelected = selectedSeatIds.includes(seat.id);

                                        return (
                                            <Rect
                                                key={seat.id}
                                                x={seat.x}
                                                y={seat.y}
                                                width={seat.width}
                                                height={seat.height}
                                                rotation={seat.rotation}
                                                cornerRadius={4}
                                                fill={
                                                    seat.status === "sold"
                                                        ? "#374151"
                                                        : seat.status === "reserved"
                                                            ? "#f59e0b"
                                                            : isSelected
                                                                ? "#8B5CF6"
                                                                : seat.fill || "#10b981"
                                                }
                                                stroke={isSelected ? "#ec4899" : "white"}
                                                strokeWidth={isSelected ? 3 : 1}
                                                onClick={() => handleToggleSeat(seat, area)}
                                                onMouseEnter={(e) => {
                                                    if (seat.status === "available") {
                                                        e.target.getStage()!.container().style.cursor = 'pointer';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.getStage()!.container().style.cursor = 'default';
                                                }}
                                            />
                                        );
                                    })
                                )}

                                {/* TEXT */}
                                {texts?.map(text => (
                                    <KonvaText
                                        key={text.id}
                                        x={text.x}
                                        y={text.y}
                                        text={text.text}
                                        fontSize={text.fontSize}
                                        fontFamily={text.fontFamily}
                                        fontStyle={text.fontStyle}
                                        fill={text.fill}
                                        align={text.align}
                                        verticalAlign={text.verticalAlign}
                                        rotation={text.rotation}
                                        width={text.width}
                                        height={text.height}
                                        listening={false}
                                    />
                                ))}
                            </Group>
                        </Layer>
                    </Stage>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-3 text-xs">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-emerald-600 rounded" />
                            <span className="text-slate-300">Trống</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-violet-600 rounded" />
                            <span className="text-slate-300">Đã chọn</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-700 rounded" />
                            <span className="text-slate-300">Đã bán</span>
                        </div>
                    </div>
                </div>

                {/* Hovered area info */}
                {hoveredArea && hoveredArea.seats.length === 0 && (
                    <div className="absolute top-4 left-4 bg-[#1a1a2e] border border-violet-500/50 rounded-lg p-4 max-w-xs">
                        <h4 className="font-semibold text-white mb-2">{hoveredArea.name}</h4>
                        <div className="text-sm space-y-1">
                            <p className="text-slate-300">
                                <span className="text-slate-500">Loại vé:</span> {hoveredArea.ticketTypeId}
                            </p>
                            <p className="text-emerald-400 font-medium">
                                {hoveredArea.price?.toLocaleString('vi-VN')}₫
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Selected seats info */}
            {selectedSeatsInfo.length > 0 && (
                <div className="bg-[#1a1a2e] border-t border-[#2a2a3e] p-4 max-h-48 overflow-y-auto">
                    <h4 className="text-sm font-semibold text-white mb-3">
                        Ghế đã chọn:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {selectedSeatsInfo.map(seat => (
                            <div
                                key={seat.id}
                                className="bg-[#16162a] border border-[#2a2a3e] rounded p-2 text-xs"
                            >
                                <div className="font-medium text-white">
                                    {seat.areaName} - {seat.row}{seat.number}
                                </div>
                                <div className="text-emerald-400 text-xs">
                                    {seat.price?.toLocaleString('vi-VN')}₫
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeatMapShow;