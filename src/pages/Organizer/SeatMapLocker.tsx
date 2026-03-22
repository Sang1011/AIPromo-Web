import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Line, Text as KonvaText, Group, Circle } from "react-konva";
import type { SeatMapData } from "../../types/config/seatmap";


interface Props {
    data: SeatMapData;
    selectedSeatIds: string[];
    onToggleSeat: (id: string) => void;
}

const SeatMapLocker: React.FC<Props> = ({
    data,
    selectedSeatIds,
    onToggleSeat,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [viewport, setViewport] = useState({
        width: 0,
        height: 0,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
    });

    const { areas, texts } = data;

    // Tính toán bounds của toàn bộ content
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

    // Tự động fit content vào viewport
    useEffect(() => {
        if (!containerRef.current) return;

        const updateViewport = () => {
            const container = containerRef.current!;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            const bounds = getContentBounds();
            const contentWidth = bounds.maxX - bounds.minX;
            const contentHeight = bounds.maxY - bounds.minY;

            // Tính scale để fit content
            const scaleX = (containerWidth * 0.9) / contentWidth;
            const scaleY = (containerHeight * 0.9) / contentHeight;
            const scale = Math.min(scaleX, scaleY, 1);

            // Tính offset để center content
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

    // Render Area shape
    const renderArea = (area: typeof areas[0]) => {
        const commonProps = {
            x: area.x,
            y: area.y,
            width: area.width,
            height: area.height,
            rotation: area.rotation,
            stroke: area.stroke || 'white',
            strokeWidth: 2,
            listening: false,
        };

        if (area.type === 'circle') {
            return (
                <Circle
                    key={area.id}
                    x={area.x + area.width / 2}
                    y={area.y + area.height / 2}
                    radius={area.width / 2}
                    stroke={area.stroke || 'white'}
                    strokeWidth={2}
                    listening={false}
                />
            );
        }

        if (area.type === 'polygon' && area.points) {
            return (
                <Line
                    key={area.id}
                    points={area.points}
                    closed
                    stroke={area.stroke || 'white'}
                    strokeWidth={2}
                    listening={false}
                />
            );
        }

        return <Rect key={area.id} {...commonProps} />;
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden bg-[#0f0f1e]"
        >
            {viewport.width > 0 && (
                <Stage
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
                                                seat.status === "blocked"
                                                    ? "#374151"
                                                    : isSelected
                                                        ? "#8B5CF6"
                                                        : seat.fill || "#10b981"
                                            }
                                            stroke={isSelected ? "#ec4899" : undefined}
                                            strokeWidth={isSelected ? 2 : 0}
                                            onClick={() => {
                                                if (seat.status === "available") {
                                                    onToggleSeat(seat.id);
                                                    console.log("Toggled seat:", {
                                                        id: seat.id,
                                                        row: seat.row,
                                                        number: seat.number,
                                                        sectionId: seat.sectionId,
                                                        isSelected: !isSelected
                                                    });
                                                }
                                            }}
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

                            {/* FREE TEXT */}
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
        </div>
    );
};

export default SeatMapLocker;