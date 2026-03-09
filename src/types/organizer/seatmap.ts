export type EditorMode =
    | 'SELECT'
    | 'CREATE_AREA'
    | 'CREATE_SHAPE'
    | 'CREATE_SEAT'
    | 'CREATE_TEXT';


export type SeatLayoutType = 'grid' | 'arc';

export interface Area {
    id: string;
    name: string;
    type: 'rect' | 'square' | 'circle' | 'triangle' | 'parallelogram' | 'trapezoid' | 'polygon';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    locked?: boolean;
    stroke: string;
    ticketTypeId: string;
    price: number;
    labelFontSize?: number;
    draggable: boolean;
    points?: number[];
    isAreaType?: boolean;
    fill?: string;
}

export interface TicketType {
    id: string;
    name: string;
    color: string;
    price: number;
}


export interface Seat {
    id: string;
    sectionId: string;
    row: string;
    number: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    status: 'available' | 'sold' | 'reserved';
    fill: string;
}

export interface TextEntity {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    fontStyle: string;
    fill: string;
    align: 'left' | 'center' | 'right';
    verticalAlign: 'top' | 'middle' | 'bottom';
    draggable: boolean;
    attachedAreaId?: string;
}

export interface SeatMapData {
    areas: Array<Area & {
        seats: Seat[];
    }>;
    texts: TextEntity[];
}

export type Entity = Area | Seat | TextEntity;

export interface HistoryState {
    sections: Area[];
    seats: Seat[];
    textEntities: TextEntity[];
}

export interface SelectionBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface DetectedRegion {
    color: string;
    label: string;
    polygon: { x: number; y: number }[];
}

export interface ColorPreset {
    ticketTypeId: string;
    baseColor: string;
    lower: [number, number, number];
    upper: [number, number, number];
}

