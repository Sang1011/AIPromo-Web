import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Line, Text as KonvaText, Group } from "react-konva";
import type { SeatMapData } from "../../../pages/Organizer/SeatMapEditorPage";

const GRID_SIZE = 20;

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

    const { stage, areas, texts } = data;

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


    useEffect(() => {
        if (!containerRef.current) return;

        const el = containerRef.current;

        const observer = new ResizeObserver(() => {
            const width = el.clientWidth;
            const height = el.clientHeight;

            const bounds = getContentBounds();

            const contentWidth = bounds.maxX - bounds.minX;
            const contentHeight = bounds.maxY - bounds.minY;

            const scale = Math.min(
                width / contentWidth,
                height / contentHeight
            );

            const offsetX = (width - contentWidth * scale) / 2 - bounds.minX * scale;
            const offsetY = (height - contentHeight * scale) / 2 - bounds.minY * scale;

            setViewport({
                width,
                height,
                scale,
                offsetX,
                offsetY,
            });
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, [stage.width, stage.height]);

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
                        {/* GROUP để scale + center */}
                        <Group
                            scaleX={viewport.scale}
                            scaleY={viewport.scale}
                            x={viewport.offsetX}
                            y={viewport.offsetY}
                        >
                            {/* GRID */}
                            {Array.from({ length: Math.ceil(stage.width / GRID_SIZE) }).map((_, i) => (
                                <Line
                                    key={`v-${i}`}
                                    points={[i * GRID_SIZE, 0, i * GRID_SIZE, stage.height]}
                                    stroke="#1f1f35"
                                    strokeWidth={1}
                                    listening={false}
                                />
                            ))}

                            {Array.from({ length: Math.ceil(stage.height / GRID_SIZE) }).map((_, i) => (
                                <Line
                                    key={`h-${i}`}
                                    points={[0, i * GRID_SIZE, stage.width, i * GRID_SIZE]}
                                    stroke="#1f1f35"
                                    strokeWidth={1}
                                    listening={false}
                                />
                            ))}

                            {/* AREAS */}
                            {areas.map(area => (
                                <Rect
                                    key={area.id}
                                    x={area.x}
                                    y={area.y}
                                    width={area.width}
                                    height={area.height}
                                    rotation={area.rotation}
                                    stroke={area.stroke}
                                    strokeWidth={2}
                                    listening={false}
                                />
                            ))}

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
                                                            : "#10b981"
                                            }
                                            onClick={() => {
                                                if (seat.status === "available") {
                                                    onToggleSeat(seat.id);
                                                }
                                            }}
                                        />
                                    );
                                })
                            )}

                            {/* AREA LABEL */}
                            {areas.map(
                                area =>
                                    area.showLabel && (
                                        <KonvaText
                                            key={`label-${area.id}`}
                                            x={area.x}
                                            y={area.y + area.height / 2 - 10}
                                            width={area.width}
                                            text={area.name}
                                            fontSize={14}
                                            fill="#ffffff"
                                            align="center"
                                            listening={false}
                                        />
                                    )
                            )}

                            {/* FREE TEXT */}
                            {texts.map(text => (
                                <KonvaText key={text.id} {...text} />
                            ))}
                        </Group>
                    </Layer>
                </Stage>
            )}
        </div>
    );
};

export default SeatMapLocker;
