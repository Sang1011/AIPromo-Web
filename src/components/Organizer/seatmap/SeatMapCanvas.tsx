import { Group, Rect, Stage, Text as KonvaText } from "react-konva";
import { Layer } from "recharts";
import type { SeatMapData } from "../../../types/organizer/seatmap";

interface SeatMapCanvasProps {
    data: SeatMapData;
    viewport: {
        scale: number;
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
    };
    selectedSeatIds?: string[];
    onSeatClick?: (seatId: string) => void;
    interactive?: boolean;
}

export const SeatMapCanvas: React.FC<SeatMapCanvasProps> = ({
    data,
    viewport,
    selectedSeatIds = [],
    onSeatClick,
    interactive = false,
}) => {
    const { areas, texts } = data;

    return (
        <Stage width={viewport.width} height={viewport.height}>
            <Layer>
                <Group
                    scaleX={viewport.scale}
                    scaleY={viewport.scale}
                    x={viewport.offsetX}
                    y={viewport.offsetY}
                >
                    {/* AREAS */}
                    {areas.map(area => (
                        <Rect
                            key={area.id}
                            x={area.x}
                            y={area.y}
                            width={area.width}
                            height={area.height}
                            stroke={area.stroke}
                            listening={false}
                        />
                    ))}

                    {/* SEATS */}
                    {areas.flatMap(area =>
                        area.seats.map(seat => {
                            const selected = selectedSeatIds.includes(seat.id);
                            return (
                                <Rect
                                    key={seat.id}
                                    x={seat.x}
                                    y={seat.y}
                                    width={seat.width}
                                    height={seat.height}
                                    fill={selected ? "#8B5CF6" : seat.fill}
                                    stroke={selected ? "#ec4899" : undefined}
                                    listening={interactive}
                                    onClick={() => interactive && onSeatClick?.(seat.id)}
                                />
                            );
                        })
                    )}

                    {/* TEXT */}
                    {texts?.map(t => (
                        <KonvaText key={t.id} {...t} listening={false} />
                    ))}
                </Group>
            </Layer>
        </Stage>
    );
};
