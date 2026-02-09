import Konva from 'konva';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaCopy, FaMinus, FaPaste, FaPlus } from "react-icons/fa";
import { IoMdLock, IoMdUnlock } from 'react-icons/io';
import { Circle, Group, Text as KonvaText, Layer, Line, Rect, Stage, Transformer } from 'react-konva';

const GRID_SIZE = 20;
const CANVAS_WIDTH = 1550;
const CANVAS_HEIGHT = 900;

type EditorMode = 'SELECT' | 'CREATE_SECTION' | 'CREATE_SEAT' | 'CREATE_TEXT';
type SeatLayoutType = 'grid' | 'arc';

interface Area {
    id: string;
    name: string;
    type: 'rect' | 'square' | 'circle' | 'triangle' | 'parallelogram' | 'trapezoid';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fill: string;
    locked?: boolean;
    stroke: string;
    ticketType: string;
    price: number;
    showLabel: boolean;
}

interface Seat {
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
}

interface TextEntity {
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
}

export interface SeatMapData {
    stage: {
        width: number;
        height: number;
        rotation: number;
        scale: number;
    };
    areas: Array<Area & {
        seats: Seat[];
    }>;
    texts: TextEntity[];
}

type Entity = Area | Seat | TextEntity;

interface HistoryState {
    sections: Area[];
    seats: Seat[];
    textEntities: TextEntity[];
}

interface SelectionBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}


const SeatMapEditorPage: React.FC = () => {
    const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

    const [sections, setSections] = useState<Area[]>([
        {
            id: 'area-1',
            name: 'VIP Area A',
            type: 'rect',
            x: snapToGrid(260),
            y: snapToGrid(380),
            width: snapToGrid(400),
            height: snapToGrid(250),
            rotation: 0,
            fill: 'transparent',
            stroke: '#8B5CF6',
            ticketType: 'Vé VIP Premium - 500k',
            price: 500000,
            showLabel: true,
            locked: false,
        },
    ]);

    const [seats, setSeats] = useState<Seat[]>(() => {
        const initialSeats: Seat[] = [];
        const rows = ['A', 'B'];
        const seatsPerRow = 5;
        const seatSize = 20;
        const spacing = 5;
        const startX = 285;
        const startY = 280;

        rows.forEach((row, rowIndex) => {
            for (let i = 0; i < seatsPerRow; i++) {
                initialSeats.push({
                    id: `seat-${row}-${i + 1}`,
                    sectionId: 'area-1',
                    row,
                    number: i + 1,
                    x: startX + i * (seatSize + spacing),
                    y: startY + rowIndex * (seatSize + spacing),
                    width: seatSize,
                    height: seatSize,
                    rotation: 0,
                    status: 'available'
                });
            }
            for (let i = 0; i < seatsPerRow; i++) {
                initialSeats.push({
                    id: `seat-${row}-${i + 6}`,
                    sectionId: 'area-1',
                    row,
                    number: i + 6,
                    x: startX + 280 + i * (seatSize + spacing),
                    y: startY + rowIndex * (seatSize + spacing),
                    width: seatSize,
                    height: seatSize,
                    rotation: 0,
                    status: 'available'
                });
            }
        });

        return initialSeats;
    });

    const [stageScale, setStageScale] = useState(1);
    type GuideLine = {
        x?: number;
        y?: number;
    };

    const [guides, setGuides] = useState<GuideLine | null>(null);

    const [textEntities, setTextEntities] = useState<TextEntity[]>([
        {
            id: 'text-1',
            x: 100,
            y: 100,
            width: 200,
            height: 40,
            rotation: 0,
            text: 'Văn bản mẫu',
            fontSize: 24,
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fill: '#ffffff',
            align: 'center',
            verticalAlign: 'middle',
            draggable: true
        }
    ]);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [history, setHistory] = useState<HistoryState[]>([{ sections, seats, textEntities }]);
    const [historyStep, setHistoryStep] = useState(0);
    const [activeTab, setActiveTab] = useState<'STAGE' | 'AREA' | 'SHAPE'>('AREA');
    const [clipboard, setClipboard] = useState<Entity[]>([]);
    const [editorMode, setEditorMode] = useState<EditorMode>('SELECT');
    const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [stageRotation, setStageRotation] = useState(0);
    const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);

    const [seatLayoutType, setSeatLayoutType] = useState<SeatLayoutType>('grid');
    const [gridRows, setGridRows] = useState(3);
    const [gridColumns, setGridColumns] = useState(8);
    const [seatWidth, setSeatWidth] = useState(30);
    const [seatHeight, setSeatHeight] = useState(30);
    const [seatSpacing, setSeatSpacing] = useState(10);
    const [arcTotalSeats, setArcTotalSeats] = useState(20);
    const [arcCurvature, setArcCurvature] = useState(180);

    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const selectionRectRef = useRef<Konva.Rect>(null);
    const layerRef = useRef<Konva.Layer>(null);

    const selectedSection = sections.find(s => s.id === selectedIds[0]);
    const selectedSeat = seats.find(s => s.id === selectedIds[0]);
    const selectedText = textEntities.find(t => t.id === selectedIds[0]);
    const isSingleSectionSelected = selectedIds.length === 1 && selectedSection !== undefined;
    const isSingleSeatSelected = selectedIds.length === 1 && selectedSeat !== undefined;
    const isSingleTextSelected = selectedIds.length === 1 && selectedText !== undefined;
    const isSingleEntitySelected = selectedIds.length === 1;


    const saveToHistory = useCallback(() => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({ sections, seats, textEntities });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }, [sections, seats, textEntities, history, historyStep]);

    const undo = useCallback(() => {
        if (historyStep > 0) {
            const prevState = history[historyStep - 1];
            setSections(prevState.sections);
            setSeats(prevState.seats);
            setTextEntities(prevState.textEntities);
            setHistoryStep(historyStep - 1);
            setSelectedIds([]);
        }
    }, [history, historyStep]);

    const redo = useCallback(() => {
        if (historyStep < history.length - 1) {
            const nextState = history[historyStep + 1];
            setSections(nextState.sections);
            setSeats(nextState.seats);
            setTextEntities(nextState.textEntities);
            setHistoryStep(historyStep + 1);
            setSelectedIds([]);
        }
    }, [history, historyStep]);

    const handleSelect = useCallback((id: string, multiSelect: boolean) => {
        if (multiSelect) {
            setSelectedIds(prev =>
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            );
        } else {
            setSelectedIds([id]);
        }
    }, []);

    const searchSectionName = (sectionId: string) => {
        const section = sections.find(s => s.id === sectionId);
        return section ? section.name : '';
    }

    const handleDelete = useCallback(() => {
        if (selectedIds.length > 0) {
            const sectionIdsToDelete = selectedIds.filter(id =>
                sections.some(s => s.id === id)
            );
            const seatIdsToDelete = selectedIds.filter(id =>
                seats.some(s => s.id === id)
            );
            const textIdsToDelete = selectedIds.filter(id =>
                textEntities.some(t => t.id === id)
            );

            setSections(prev => prev.filter(s => !sectionIdsToDelete.includes(s.id)));
            setSeats(prev => {
                const seatsAfterDirectDelete = prev.filter(s => !seatIdsToDelete.includes(s.id));
                return seatsAfterDirectDelete.filter(s => !sectionIdsToDelete.includes(s.sectionId));
            });
            setTextEntities(prev => prev.filter(t => !textIdsToDelete.includes(t.id)));
            setSelectedIds([]);
            saveToHistory();
        }
    }, [selectedIds, sections, seats, textEntities, saveToHistory]);

    const handleCopy = useCallback(() => {
        const copiedEntities: Entity[] = [
            ...sections.filter(s => selectedIds.includes(s.id)),
            ...seats.filter(s => selectedIds.includes(s.id)),
            ...textEntities.filter(t => selectedIds.includes(t.id))
        ];
        setClipboard(copiedEntities);
    }, [selectedIds, sections, seats, textEntities]);

    const handlePaste = useCallback(() => {
        if (clipboard.length === 0) return;

        const newSections: Area[] = [];
        const newSeats: Seat[] = [];
        const newTexts: TextEntity[] = [];
        const idMap = new Map<string, string>();

        clipboard.forEach(entity => {
            const newId = `${entity.id}-copy-${Date.now()}`;
            idMap.set(entity.id, newId);

            if ('ticketType' in entity) {
                newSections.push({
                    ...entity as Area,
                    id: newId,
                    x: (entity as Area).x + 40,
                    y: (entity as Area).y + 40
                });
            } else if ('sectionId' in entity) {
                newSeats.push({
                    ...entity as Seat,
                    id: newId,
                    sectionId: idMap.get((entity as Seat).sectionId) || (entity as Seat).sectionId,
                    x: (entity as Seat).x + 40,
                    y: (entity as Seat).y + 40
                });
            } else {
                newTexts.push({
                    ...entity as TextEntity,
                    id: newId,
                    x: (entity as TextEntity).x + 40,
                    y: (entity as TextEntity).y + 40
                });
            }
        });

        setSections(prev => [...prev, ...newSections]);
        setSeats(prev => [...prev, ...newSeats]);
        setTextEntities(prev => [...prev, ...newTexts]);
        setSelectedIds([
            ...newSections.map(s => s.id),
            ...newSeats.map(s => s.id),
            ...newTexts.map(t => t.id)
        ]);
        saveToHistory();
    }, [clipboard, saveToHistory]);

    const dragStartPosRef = useRef<Record<string, { x: number; y: number }>>({});

    const handleDragEnd = useCallback(
        (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
            const node = e.target;
            const newX = node.x();
            const newY = node.y();

            const startPos = dragStartPosRef.current[id];
            if (!startPos) return;

            const deltaX = newX - startPos.x;
            const deltaY = newY - startPos.y;

            setSections(prev =>
                prev.map(s =>
                    dragStartPosRef.current[s.id]
                        ? {
                            ...s,
                            x: dragStartPosRef.current[s.id].x + deltaX,
                            y: dragStartPosRef.current[s.id].y + deltaY,
                        }
                        : s
                )
            );

            setSeats(prev =>
                prev.map(s =>
                    dragStartPosRef.current[s.id]
                        ? {
                            ...s,
                            x: dragStartPosRef.current[s.id].x + deltaX,
                            y: dragStartPosRef.current[s.id].y + deltaY,
                        }
                        : s
                )
            );

            setTextEntities(prev =>
                prev.map(t =>
                    dragStartPosRef.current[t.id]
                        ? {
                            ...t,
                            x: dragStartPosRef.current[t.id].x + deltaX,
                            y: dragStartPosRef.current[t.id].y + deltaY,
                        }
                        : t
                )
            );

            saveToHistory();
            setGuides(null);
        }, [saveToHistory]);


    const handleTransformEnd = useCallback(
        (id: string, e: Konva.KonvaEventObject<Event>) => {
            const node = e.target;

            const area = sections.find(s => s.id === id);
            if (!area) return;

            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            node.scaleX(1);
            node.scaleY(1);

            const newWidth = Math.max(20, area.width * scaleX);
            const newHeight = Math.max(20, area.height * scaleY);

            setSections(prev =>
                prev.map(s =>
                    s.id === id
                        ? {
                            ...s,
                            width: newWidth,
                            height: newHeight,
                            x: node.x(),
                            y: node.y(),
                            rotation: node.rotation(),
                        }
                        : s
                )
            );

            saveToHistory();
        },
        [sections, saveToHistory]
    );

    const [showLockModal, setShowLockModal] = useState(false);

    const changeShape = useCallback((shape: Area['type']) => {
        if (!isSingleSectionSelected || !selectedSection) return;

        setSections(prev => prev.map(s =>
            s.id === selectedSection.id ? { ...s, type: shape } : s
        ));
        saveToHistory();
    }, [isSingleSectionSelected, selectedSection, saveToHistory]);

    const updateSectionProperty = useCallback((property: keyof Area, value: any) => {
        if (!isSingleSectionSelected || !selectedSection) return;

        setSections(prev => prev.map(s =>
            s.id === selectedSection.id ? { ...s, [property]: value } : s
        ));
        saveToHistory();
    }, [isSingleSectionSelected, selectedSection, saveToHistory]);

    const updateSeatProperty = useCallback((property: keyof Seat, value: any) => {
        if (!isSingleSeatSelected || !selectedSeat) return;
        console.log("value", value);
        setSeats(prev => prev.map(s =>
            s.id === selectedSeat.id ? { ...s, [property]: value } : s
        ));
        saveToHistory();
    }, [isSingleSeatSelected, selectedSeat, saveToHistory]);

    const updateTextProperty = useCallback((property: keyof TextEntity, value: any) => {
        if (!isSingleTextSelected || !selectedText) return;

        setTextEntities(prev => prev.map(t =>
            t.id === selectedText.id ? { ...t, [property]: value } : t
        ));
        saveToHistory();
    }, [isSingleTextSelected, selectedText, saveToHistory]);

    const beginMultiDrag = (draggedId: string) => {
        if (!selectedIds.includes(draggedId)) {
            setSelectedIds([draggedId]);
        }

        const ids = selectedIds.includes(draggedId)
            ? selectedIds
            : [draggedId];

        dragStartPosRef.current = {};

        ids.forEach(id => {
            const node = layerRef.current?.findOne(`#${id}`);
            if (node) {
                dragStartPosRef.current[id] = {
                    x: node.x(),
                    y: node.y(),
                };
            }
        });
    };


    const createText = useCallback(() => {
        const stage = stageRef.current;
        if (!stage) return;

        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;

        const newText: TextEntity = {
            id: `text-${Date.now()}`,
            x: snapToGrid(centerX - 100),
            y: snapToGrid(centerY - 20),
            width: 200,
            height: 40,
            rotation: 0,
            text: 'Văn bản mới',
            fontSize: 24,
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fill: '#ffffff',
            align: 'center',
            verticalAlign: 'middle',
            draggable: true
        };

        setTextEntities(prev => [...prev, newText]);
        setSelectedIds([newText.id]);
        setEditorMode('SELECT');
        saveToHistory();
    }, [saveToHistory]);

    const deleteAllSeats = useCallback(() => {
        setSeats([]);
        setSelectedIds([]);
        saveToHistory();
    }, [saveToHistory]);

    const deleteSectionSeats = useCallback(() => {
        if (!isSingleSectionSelected || !selectedSection) return;

        setSeats(prev => prev.filter(s => s.sectionId !== selectedSection.id));
        saveToHistory();
    }, [isSingleSectionSelected, selectedSection, saveToHistory]);

    const createGridSeatsForSection = useCallback(() => {
        if (!isSingleSectionSelected || !selectedSection) return;

        const newSeats: Seat[] = [];

        const seatW = seatWidth;
        const seatH = seatHeight;
        const spacing = seatSpacing;

        const startX = selectedSection.x + 20;
        const startY = selectedSection.y + 40;

        const rowLabels = Array.from({ length: gridRows }, (_, i) =>
            String.fromCharCode(65 + i)
        );

        rowLabels.forEach((row, rowIndex) => {
            for (let i = 0; i < gridColumns; i++) {
                newSeats.push({
                    id: `seat-${selectedSection.id}-${row}-${i + 1}-${Date.now()}-${rowIndex}-${i}`,
                    sectionId: selectedSection.id,
                    row,
                    number: i + 1,
                    x: startX + i * (seatW + spacing),
                    y: startY + rowIndex * (seatH + spacing),
                    width: seatW,
                    height: seatH,
                    rotation: 0,
                    status: 'available',
                });
            }
        });

        setSeats(prev => [
            ...prev.filter(s => s.sectionId !== selectedSection.id),
            ...newSeats,
        ]);

        saveToHistory();
    }, [
        isSingleSectionSelected,
        selectedSection,
        gridRows,
        gridColumns,
        seatWidth,
        seatHeight,
        seatSpacing,
        saveToHistory,
    ]);


    const createArcSeatsForSection = useCallback(() => {
        if (!isSingleSectionSelected || !selectedSection) return;

        const newSeats: Seat[] = [];
        const seatSize = 30;

        const centerX = selectedSection.x + selectedSection.width / 2;
        const centerY = selectedSection.y + selectedSection.height / 2;
        const radius =
            Math.min(selectedSection.width, selectedSection.height) / 2 - 40;
        const isFullCircle = arcCurvature >= 300;
        const totalAngle = isFullCircle ? 360 : arcCurvature;

        const startAngle = isFullCircle
            ? -90
            : -totalAngle / 2;

        const angleStep = totalAngle / arcTotalSeats;

        for (let i = 0; i < arcTotalSeats; i++) {
            const angleDeg = startAngle + i * angleStep;
            const angle = angleDeg * Math.PI / 180;

            const x = centerX + radius * Math.cos(angle) - seatSize / 2;
            const y = centerY + radius * Math.sin(angle) - seatSize / 2;

            newSeats.push({
                id: `seat-${selectedSection.id}-arc-${i}-${Date.now()}`,
                sectionId: selectedSection.id,
                row: 'ARC',
                number: i + 1,
                x,
                y,
                width: seatSize,
                height: seatSize,
                rotation: angleDeg + 90,
                status: 'available',
            });
        }


        setSeats(prev => [
            ...prev.filter(s => s.sectionId !== selectedSection.id),
            ...newSeats,
        ]);
        saveToHistory();
    }, [
        isSingleSectionSelected,
        selectedSection,
        arcTotalSeats,
        arcCurvature,
        saveToHistory,
    ]);

    const getMultiSelectBoundingBox = (
        layer: Konva.Layer,
        ids: string[]
    ) => {
        const nodes = ids
            .map(id => layer.findOne(`#${id}`))
            .filter(Boolean) as Konva.Node[];

        if (nodes.length === 0) return null;

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        nodes.forEach(node => {
            const rect = node.getClientRect({ skipTransform: false });
            minX = Math.min(minX, rect.x);
            minY = Math.min(minY, rect.y);
            maxX = Math.max(maxX, rect.x + rect.width);
            maxY = Math.max(maxY, rect.y + rect.height);
        });

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    };

    const [isGroupDragging, setIsGroupDragging] = useState(false);



    const handleCreateSeats = useCallback(() => {
        if (seatLayoutType === 'grid') {
            createGridSeatsForSection();
        } else {
            createArcSeatsForSection();
        }
    }, [seatLayoutType, createGridSeatsForSection, createArcSeatsForSection]);

    const enterCreateSectionMode = useCallback(() => {
        setEditorMode('CREATE_SECTION');
        setSelectedIds([]);
    }, []);

    const createSectionAtPosition = useCallback((x: number, y: number) => {
        const newSection: Area = {
            id: `area-${Date.now()}`,
            name: `Khu vực ${sections.length + 1}`,
            type: 'rect',
            x: snapToGrid(x),
            y: snapToGrid(y),
            width: 200,
            height: 150,
            rotation: 0,
            fill: 'transparent',
            stroke: '#8B5CF6',
            ticketType: 'Vé VIP Premium - 500k',
            price: 500000,
            showLabel: true
        };

        setSections(prev => [...prev, newSection]);
        setSelectedIds([newSection.id]);
        setEditorMode('SELECT');
        saveToHistory();
    }, [sections.length, saveToHistory]);

    const allSectionsLocked = sections.length > 0 && sections.every(s => s.locked);

    const toggleLockAllSections = () => {
        setSections(prev =>
            prev.map(s => ({ ...s, locked: !allSectionsLocked }))
        );
    };

    const toggleLockSelectedAreas = () => {
        if (selectedIds.length === 0) return;

        setSections(prev =>
            prev.map(area =>
                selectedIds.includes(area.id)
                    ? { ...area, locked: !area.locked }
                    : area
            )
        );
    };
    const selectedAreas = sections.filter(s => selectedIds.includes(s.id));

    const areAllSelectedAreasLocked =
        selectedAreas.length > 0 && selectedAreas.every(s => s.locked);


    const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.target !== e.target.getStage()) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;

        if (editorMode === 'CREATE_SECTION') {
            createSectionAtPosition(pointerPos.x, pointerPos.y);
            return;
        }

        if (editorMode === 'SELECT') {
            setIsSelecting(true);
            setSelectionBox({
                x1: pointerPos.x,
                y1: pointerPos.y,
                x2: pointerPos.x,
                y2: pointerPos.y
            });
        }
    }, [editorMode, createSectionAtPosition]);

    const zoomIn = () => {
        setStageScale(prev => Math.min(prev + 0.1, 3));
    };

    const zoomOut = () => {
        setStageScale(prev => Math.max(prev - 0.1, 0.3));
    };

    const resetZoom = () => {
        setStageScale(1);
    };

    const exportSeatMap = () => {
        const data: SeatMapData = {
            stage: {
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                rotation: stageRotation,
                scale: stageScale,
            },
            areas: sections.map(area => ({
                ...area,
                seats: seats.filter(seat => seat.sectionId === area.id),
            })),
            texts: textEntities,
        };

        const json = JSON.stringify(data, null, 2);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'seat-map.json';
        a.click();

        URL.revokeObjectURL(url);
    };


    const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isSelecting || !selectionBox) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;

        setSelectionBox({
            ...selectionBox,
            x2: pointerPos.x,
            y2: pointerPos.y
        });
    }, [isSelecting, selectionBox]);



    const handleStageMouseUp = useCallback(() => {
        if (!isSelecting || !selectionBox || !layerRef.current) return;

        const box = {
            x: Math.min(selectionBox.x1, selectionBox.x2),
            y: Math.min(selectionBox.y1, selectionBox.y2),
            width: Math.abs(selectionBox.x2 - selectionBox.x1),
            height: Math.abs(selectionBox.y2 - selectionBox.y1),
        };

        const selected: string[] = [];

        layerRef.current.getChildren().forEach(node => {
            if (!node.id()) return;

            if (isShapeInSelectionBox(node, box)) {
                selected.push(node.id());
            }
        });

        setSelectedIds(selected);
        setIsSelecting(false);
        setSelectionBox(null);
    }, [isSelecting, selectionBox]);



    const isShapeInSelectionBox = (
        node: Konva.Node,
        selectionBox: { x: number; y: number; width: number; height: number }
    ) => {
        const clientRect = node.getClientRect({ skipTransform: false });
        return Konva.Util.haveIntersection(selectionBox, clientRect);
    };


    const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.target === e.target.getStage()) {
            setSelectedIds([]);
        }
    }, []);

    const getSectionSeatCount = useCallback((sectionId: string) => {
        return seats.filter(s => s.sectionId === sectionId).length;
    }, [seats]);

    useEffect(() => {
        if (transformerRef.current && layerRef.current) {
            const selectedNodes = selectedIds
                .map(id => layerRef.current!.findOne(`#${id}`))
                .filter(node =>
                    node &&
                    !(node instanceof Konva.Rect && seats.some(s => s.id === node.id()))
                );

            transformerRef.current.nodes(selectedNodes as Konva.Node[]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [selectedIds]);

    const actionBtn = (bg: string) => ({
        flex: 1,
        background: bg,
        border: 'none',
        borderRadius: '8px',
        padding: '8px',
        color: 'white',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    });

    const multiDragStartRef = useRef<{ x: number; y: number } | null>(null);

    const multiSelectBox = useMemo(() => {
        if (selectedIds.length <= 1 || !layerRef.current) return null;
        return getMultiSelectBoundingBox(layerRef.current, selectedIds);
    }, [selectedIds]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete') {
                handleDelete();
            } else if (e.key === 'Escape') {
                setEditorMode('SELECT');
                setSelectedIds([]);
            } else if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    redo();
                } else if (e.key === 'c') {
                    e.preventDefault();
                    handleCopy();
                } else if (e.key === 'v') {
                    e.preventDefault();
                    handlePaste();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDelete, undo, redo, handleCopy, handlePaste]);

    const setCursor = (cursor: string) => {
        const stage = stageRef.current;
        if (stage) {
            stage.container().style.cursor = cursor;
        }
    };

    const textRef = useRef<Konva.Text>(null);

    const renderSection = (area: Area) => {
        return (
            <Group
                key={area.id}
                x={area.x}
                y={area.y}
                rotation={area.rotation}
                opacity={area.locked ? 0.6 : 1}
                draggable={editorMode === 'SELECT' && !area.locked && selectedIds.length <= 1 && !isGroupDragging}
                onDragStart={() => {
                    if (area.locked) return;
                    beginMultiDrag(area.id);
                }}
                onMouseEnter={() => {
                    if (editorMode !== 'SELECT' || area.locked) return;
                    setCursor('move');
                }}
                onDblClick={() => {
                    if (area.locked) return;
                    setEditorMode('SELECT');
                    setSelectedIds([area.id]);
                }}
                onMouseLeave={() => {
                    setCursor('default');
                }}
                onDragMove={(e) => {
                    const node = e.target;

                    const guideX = Math.round(node.x() / GRID_SIZE) * GRID_SIZE;
                    const guideY = Math.round(node.y() / GRID_SIZE) * GRID_SIZE;

                    setGuides({
                        x: guideX,
                        y: guideY,
                    });
                }}
                onDragEnd={(e) => handleDragEnd(area.id, e)}
                onClick={(e) => {
                    if (editorMode !== 'SELECT') return;
                    if (e.target !== e.currentTarget) return;

                    e.cancelBubble = true;

                    if (area.locked) {
                        setSelectedIds([area.id]);
                    } else {
                        handleSelect(area.id, e.evt.shiftKey);
                    }
                }}
                onTransformEnd={(e) => {
                    if (area.locked) return;
                    handleTransformEnd(area.id, e);
                }}
            >
                {/* SHAPE */}
                {area.type === 'circle' ? (
                    <Circle
                        id={area.id}
                        radius={area.width / 2}
                        stroke={area.stroke}
                        fill={area.fill}
                        dash={area.locked ? [6, 4] : []}
                    />
                ) : area.type === 'triangle' ? (
                    <Line
                        id={area.id}
                        points={[
                            area.width / 2, 0,
                            area.width, area.height,
                            0, area.height,
                        ]}
                        closed
                        stroke={area.stroke}
                        fill={area.fill}
                    />
                ) : area.type === 'parallelogram' ? (
                    <Line
                        id={area.id}
                        points={[
                            area.width * 0.2, 0,
                            area.width, 0,
                            area.width * 0.8, area.height,
                            0, area.height,
                        ]}
                        closed
                        stroke={area.stroke}
                        fill={area.fill}
                    />
                ) : area.type === 'trapezoid' ? (
                    <Line
                        id={area.id}
                        points={[
                            area.width * 0.2, 0,
                            area.width * 0.8, 0,
                            area.width, area.height,
                            0, area.height,
                        ]}
                        closed
                        stroke={area.stroke}
                        fill={area.fill}
                    />
                ) : (
                    <Rect
                        id={area.id}
                        width={area.width}
                        height={area.height}
                        stroke={area.stroke}
                        fill={area.fill}
                        dash={area.locked ? [6, 4] : []}
                    />
                )}

                {area.showLabel && (
                    <KonvaText
                        ref={textRef}
                        text={area.name.toUpperCase()}
                        x={area.width / 2}
                        y={area.height / 2}
                        offsetX={(textRef.current?.width() || 0) / 2}
                        offsetY={(textRef.current?.height() || 14) / 2}
                        fontSize={14}
                        fontStyle="600"
                        fill="#F9FAFB"
                        listening={false}
                        shadowColor="#8B5CF6"
                        shadowBlur={8}
                        shadowOpacity={0.6}
                    />
                )}

            </Group>
        );
    };



    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: '#0f0f1e',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', -apple-system, sans-serif",
            color: '#e5e7eb',
            overflow: 'hidden'
        }}>
            <div style={{
                height: '64px',
                background: '#1a1a2e',
                borderBottom: '1px solid #2a2a3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 600 }}>AIPromo</div>
                        <div style={{ fontSize: '14px', color: '#9ca3af' }}>Editor</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        style={{
                            background: 'transparent',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            color: '#e5e7eb',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Quét hình ảnh
                    </button>
                    <button
                        onClick={() => setShowLockModal(true)}
                        style={{
                            background: 'transparent',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            color: '#e5e7eb',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Quản lý khóa
                    </button>
                    <button
                        onClick={enterCreateSectionMode}
                        style={{
                            background: editorMode === 'CREATE_SECTION' ? '#10b981' : 'transparent',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            color: '#e5e7eb',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Vẽ khu vực
                    </button>

                    <button
                        onClick={createText}
                        style={{
                            background: 'transparent',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            color: '#e5e7eb',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Tạo Text
                    </button>

                    <div style={{ width: '1px', height: '24px', background: '#374151' }} />

                    <button
                        onClick={resetZoom}
                        style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '14px' }}
                    >
                        {Math.round(stageScale * 100)}%
                    </button>

                    <button
                        onClick={zoomIn}
                        style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '14px' }}
                    >
                        <FaPlus />
                    </button>

                    <button
                        onClick={zoomOut}
                        style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '14px' }}
                    >
                        <FaMinus />
                    </button>

                    <div style={{ width: '1px', height: '24px', background: '#374151' }} />
                    <button
                        onClick={toggleLockSelectedAreas}
                        disabled={selectedAreas.length === 0}
                        title={
                            selectedAreas.length === 0
                                ? 'Chọn khu vực để khóa/mở khóa'
                                : areAllSelectedAreasLocked
                                    ? 'Mở khóa khu vực đã chọn'
                                    : 'Khóa khu vực đã chọn'
                        }
                        style={{
                            background: 'transparent',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            color:
                                selectedAreas.length === 0
                                    ? '#4b5563'
                                    : areAllSelectedAreasLocked
                                        ? '#f87171'
                                        : '#9ca3af',
                            fontSize: '18px',
                            cursor: selectedAreas.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: selectedAreas.length === 0 ? 0.5 : 1,
                        }}
                    >
                        {areAllSelectedAreasLocked ? <IoMdUnlock /> : <IoMdLock />}
                    </button>

                    <button
                        onClick={exportSeatMap}
                        style={{
                            background: 'transparent',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            color: '#e5e7eb',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        Export JSON
                    </button>

                    <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9ca3af',
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}>
                        Xem trước
                    </button>

                    <button
                        onClick={() => { setSections([]); setSeats([]); setTextEntities([]); setSelectedIds([]); saveToHistory(); }}
                        style={{
                            background: '#8B5CF6',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 24px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Lưu sơ đồ
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{
                    flex: 1,
                    background: '#16162a',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#1a1a2e',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        zIndex: 10,
                        border: '1px solid #2a2a3e'
                    }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                            Đã chọn: {selectedIds.length} thực thể
                        </span>
                        {editorMode === 'CREATE_SECTION' && (
                            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                                Chế độ: Vẽ khu vực
                            </span>
                        )}
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleDelete}
                                style={{
                                    background: '#dc2626',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    color: 'white',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                XÓA ĐANG CHỌN
                            </button>
                        )}
                    </div>

                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        <Stage
                            ref={stageRef}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            rotation={stageRotation}
                            scaleX={stageScale}
                            scaleY={stageScale}
                            x={CANVAS_WIDTH / 2}
                            y={CANVAS_HEIGHT / 2}
                            offsetX={CANVAS_WIDTH / 2}
                            offsetY={CANVAS_HEIGHT / 2}
                            onMouseDown={handleStageMouseDown}
                            onMouseMove={handleStageMouseMove}
                            onMouseUp={handleStageMouseUp}
                            onClick={handleStageClick}
                        >
                            <Layer ref={layerRef}>
                                {Array.from({ length: Math.ceil(CANVAS_WIDTH / GRID_SIZE) }).map((_, i) => (
                                    <Line
                                        key={`v-${i}`}
                                        points={[i * GRID_SIZE, 0, i * GRID_SIZE, CANVAS_HEIGHT]}
                                        stroke="#1f1f35"
                                        strokeWidth={1}
                                        listening={false}
                                    />
                                ))}
                                {Array.from({ length: Math.ceil(CANVAS_HEIGHT / GRID_SIZE) }).map((_, i) => (
                                    <Line
                                        key={`h-${i}`}
                                        points={[0, i * GRID_SIZE, CANVAS_WIDTH, i * GRID_SIZE]}
                                        stroke="#1f1f35"
                                        strokeWidth={1}
                                        listening={false}
                                    />
                                ))}

                                {guides?.x !== undefined && (
                                    <Line
                                        points={[guides.x, 0, guides.x, CANVAS_HEIGHT]}
                                        stroke="#22c55e"
                                        strokeWidth={0.5}
                                        dash={[4, 6]}
                                        opacity={0.8}
                                        listening={false}
                                    />
                                )}

                                {guides?.y !== undefined && (
                                    <Line
                                        points={[0, guides.y, CANVAS_WIDTH, guides.y]}
                                        stroke="#22c55e"
                                        strokeWidth={0.5}
                                        dash={[4, 6]}
                                        opacity={0.8}
                                        listening={false}
                                    />
                                )}

                                {multiSelectBox && (
                                    <Rect
                                        x={multiSelectBox.x - 7.5}
                                        y={multiSelectBox.y - 7.5}
                                        width={multiSelectBox.width + 15}
                                        height={multiSelectBox.height + 15}
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dash={[8, 6]}
                                        fill="rgba(59,130,246,0.06)"
                                        draggable
                                        listening
                                        onDragStart={(e) => {
                                            setIsGroupDragging(true);

                                            multiDragStartRef.current = {
                                                x: e.target.x(),
                                                y: e.target.y(),
                                            };

                                            dragStartPosRef.current = {};
                                            selectedIds.forEach(id => {
                                                const node = layerRef.current?.findOne(`#${id}`);
                                                if (node) {
                                                    dragStartPosRef.current[id] = {
                                                        x: node.x(),
                                                        y: node.y(),
                                                    };
                                                }
                                            });
                                        }}
                                        onDragMove={(e) => {
                                            const start = multiDragStartRef.current;
                                            if (!start) return;

                                            const dx = e.target.x() - start.x;
                                            const dy = e.target.y() - start.y;

                                            setSeats(prev =>
                                                prev.map(seat =>
                                                    dragStartPosRef.current[seat.id]
                                                        ? {
                                                            ...seat,
                                                            x: dragStartPosRef.current[seat.id].x + dx,
                                                            y: dragStartPosRef.current[seat.id].y + dy,
                                                        }
                                                        : seat
                                                )
                                            );

                                            setSections(prev =>
                                                prev.map(sec =>
                                                    dragStartPosRef.current[sec.id]
                                                        ? {
                                                            ...sec,
                                                            x: dragStartPosRef.current[sec.id].x + dx,
                                                            y: dragStartPosRef.current[sec.id].y + dy,
                                                        }
                                                        : sec
                                                )
                                            );

                                            setTextEntities(prev =>
                                                prev.map(t =>
                                                    dragStartPosRef.current[t.id]
                                                        ? {
                                                            ...t,
                                                            x: dragStartPosRef.current[t.id].x + dx,
                                                            y: dragStartPosRef.current[t.id].y + dy,
                                                        }
                                                        : t
                                                )
                                            );
                                        }}
                                        onDragEnd={() => {
                                            setIsGroupDragging(false);
                                            multiDragStartRef.current = null;
                                            saveToHistory();
                                        }}
                                    />
                                )}

                                {sections.map(area => renderSection(area))}

                                {seats.map(seat => {
                                    const isSelected = selectedIds.includes(seat.id);
                                    return (
                                        <Rect
                                            key={seat.id}
                                            id={seat.id}
                                            x={seat.x}
                                            y={seat.y}
                                            width={seat.width}
                                            height={seat.height}
                                            rotation={seat.rotation}
                                            fill="#8B5CF6"
                                            stroke={isSelected && selectedIds.length >= 1 ? '#ec4899' : undefined}
                                            strokeWidth={isSelected && selectedIds.length >= 1 ? 3 : 0}
                                            shadowColor={isSelected && selectedIds.length > 1 ? '#ec4899' : undefined}
                                            shadowBlur={isSelected && selectedIds.length > 1 ? 8 : 0}
                                            shadowOpacity={isSelected && selectedIds.length > 1 ? 0.8 : 0}
                                            cornerRadius={4}
                                            onDragMove={(e) => {
                                                const node = e.target;

                                                const guideX = Math.round(node.x() / GRID_SIZE) * GRID_SIZE;
                                                const guideY = Math.round(node.y() / GRID_SIZE) * GRID_SIZE;

                                                setGuides({
                                                    x: guideX,
                                                    y: guideY,
                                                });
                                            }}
                                            onDragStart={() => beginMultiDrag(seat.id)}
                                            onDragEnd={(e) => handleDragEnd(seat.id, e)}
                                            onTransformEnd={(e) => handleTransformEnd(seat.id, e)}
                                            listening={!isGroupDragging}
                                            draggable={
                                                editorMode === 'SELECT' &&
                                                selectedIds.length <= 1 &&
                                                !isGroupDragging
                                            }
                                            onClick={(e) => {
                                                if (isGroupDragging) return;
                                                e.cancelBubble = true;
                                                handleSelect(seat.id, e.evt.shiftKey);
                                            }}
                                        />
                                    );
                                })}

                                {textEntities.map(text => {
                                    const isSelected = selectedIds.includes(text.id);
                                    return (
                                        <KonvaText
                                            key={text.id}
                                            id={text.id}
                                            x={text.x}
                                            y={text.y}
                                            onDragStart={() => beginMultiDrag(text.id)}
                                            onDragMove={(e) => {
                                                const node = e.target;

                                                const guideX = Math.round(node.x() / GRID_SIZE) * GRID_SIZE;
                                                const guideY = Math.round(node.y() / GRID_SIZE) * GRID_SIZE;

                                                setGuides({
                                                    x: guideX,
                                                    y: guideY,
                                                });
                                            }}
                                            width={text.width}
                                            height={text.height}
                                            rotation={text.rotation}
                                            text={text.text}
                                            fontSize={text.fontSize}
                                            fontFamily={text.fontFamily}
                                            fontStyle={text.fontStyle}
                                            fill={text.fill}
                                            align={text.align}
                                            verticalAlign={text.verticalAlign}
                                            draggable={
                                                editorMode === 'SELECT' &&
                                                selectedIds.length <= 1 &&
                                                !isGroupDragging
                                            }

                                            onDragEnd={(e) => handleDragEnd(text.id, e)}
                                            onTransformEnd={(e) => handleTransformEnd(text.id, e)}
                                            onClick={(e) => {
                                                if (editorMode === 'SELECT') {
                                                    e.cancelBubble = true;
                                                    handleSelect(text.id, e.evt.shiftKey);
                                                }
                                            }}
                                            stroke={isSelected && selectedIds.length > 1 ? '#ec4899' : undefined}
                                            strokeWidth={isSelected && selectedIds.length > 1 ? 2 : 0}
                                            shadowColor={isSelected && selectedIds.length > 1 ? '#ec4899' : undefined}
                                            shadowBlur={isSelected && selectedIds.length > 1 ? 8 : 0}
                                            shadowOpacity={isSelected && selectedIds.length > 1 ? 0.8 : 0}
                                        />
                                    );
                                })}

                                {isSelecting && selectionBox && (
                                    <Rect
                                        x={Math.min(selectionBox.x1, selectionBox.x2)}
                                        y={Math.min(selectionBox.y1, selectionBox.y2)}
                                        width={Math.abs(selectionBox.x2 - selectionBox.x1)}
                                        height={Math.abs(selectionBox.y2 - selectionBox.y1)}
                                        fill="rgba(139, 92, 246, 0.1)"
                                        stroke="#8B5CF6"
                                        strokeWidth={2}
                                        dash={[5, 5]}
                                        listening={false}
                                    />
                                )}

                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        if (newBox.width < 5 || newBox.height < 5) {
                                            return oldBox;
                                        }
                                        return newBox;
                                    }}
                                />
                            </Layer>
                        </Stage>
                    </div>

                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#1a1a2e',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        gap: '8px',
                        border: '1px solid #2a2a3e'
                    }}>
                        <button
                            onClick={undo}
                            disabled={historyStep === 0}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: historyStep === 0 ? '#4b5563' : '#e5e7eb',
                                fontSize: '20px',
                                cursor: historyStep === 0 ? 'not-allowed' : 'pointer',
                                padding: '8px 12px'
                            }}
                        >
                            ↶
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyStep === history.length - 1}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: historyStep === history.length - 1 ? '#4b5563' : '#e5e7eb',
                                fontSize: '20px',
                                cursor: historyStep === history.length - 1 ? 'not-allowed' : 'pointer',
                                padding: '8px 12px'
                            }}
                        >
                            ↷
                        </button>
                        <div style={{ width: '1px', background: '#374151' }} />
                        <button
                            onClick={handleCopy}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#e5e7eb',
                                fontSize: '18px',
                                cursor: 'pointer',
                                padding: '8px 12px'
                            }}
                        >
                            <FaCopy />
                        </button>
                        <button
                            onClick={handlePaste}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#e5e7eb',
                                fontSize: '18px',
                                cursor: 'pointer',
                                padding: '8px 12px'
                            }}
                        >
                            <FaPaste />
                        </button>
                    </div>
                </div>

                {showPropertiesPanel && (
                    <div style={{
                        width: '320px',
                        background: '#1a1a2e',
                        borderLeft: '1px solid #2a2a3e',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            padding: '20px 20px 16px',
                            borderBottom: '1px solid #2a2a3e'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#9ca3af',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    THUỘC TÍNH
                                </h3>
                                <button
                                    onClick={() => setShowPropertiesPanel(false)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#9ca3af',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                >
                                    &lt;
                                </button>
                            </div>
                        </div>

                        {isSingleEntitySelected && (
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                                {!isSingleTextSelected && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: '#9ca3af',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            marginBottom: '12px'
                                        }}>
                                            LOẠI THỰC THỂ
                                        </label>
                                        <div style={{
                                            display: 'flex',
                                            gap: '8px',
                                            background: '#16162a',
                                            borderRadius: '8px',
                                            padding: '4px'
                                        }}>
                                            <button
                                                onClick={() => setActiveTab('STAGE')}
                                                style={{
                                                    flex: 1,
                                                    background: activeTab === 'STAGE' ? '#8B5CF6' : 'transparent',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '8px 12px',
                                                    color: activeTab === 'STAGE' ? 'white' : '#6b7280',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                STAGE
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('AREA')}
                                                style={{
                                                    flex: 1,
                                                    background: activeTab === 'AREA' ? '#8B5CF6' : 'transparent',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '8px 12px',
                                                    color: 'white',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                AREA
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('SHAPE')}
                                                style={{
                                                    flex: 1,
                                                    background: activeTab === 'SHAPE' ? '#8B5CF6' : 'transparent',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '8px 12px',
                                                    color: 'white',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                SHAPE
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isSingleSectionSelected && activeTab === 'AREA' && (
                                    <>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                TÊN KHU VỰC
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedSection.name}
                                                onChange={(e) => updateSectionProperty('name', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedSection.locked}
                                                    onChange={(e) =>
                                                        updateSectionProperty('locked', e.target.checked)
                                                    }
                                                />
                                                Khóa khu vực
                                            </label>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                SỐ GHẾ TRONG KHU VỰC
                                            </label>
                                            <div style={{
                                                background: '#16162a',
                                                border: '1px solid #2a2a3e',
                                                borderRadius: '8px',
                                                padding: '10px 12px',
                                                color: '#10b981',
                                                fontSize: '18px',
                                                fontWeight: 600,
                                                textAlign: 'center'
                                            }}>
                                                {getSectionSeatCount(selectedSection.id)} ghế
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                BỐ TRÍ GHẾ
                                            </label>
                                            <div style={{
                                                display: 'flex',
                                                gap: '8px',
                                                background: '#16162a',
                                                borderRadius: '8px',
                                                padding: '4px',
                                                marginBottom: '16px'
                                            }}>
                                                <button
                                                    onClick={() => setSeatLayoutType('grid')}
                                                    style={{
                                                        flex: 1,
                                                        background: seatLayoutType === 'grid' ? '#8B5CF6' : 'transparent',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '8px 12px',
                                                        color: seatLayoutType === 'grid' ? 'white' : '#6b7280',
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    Lưới
                                                </button>
                                                <button
                                                    onClick={() => setSeatLayoutType('arc')}
                                                    style={{
                                                        flex: 1,
                                                        background: seatLayoutType === 'arc' ? '#8B5CF6' : 'transparent',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '8px 12px',
                                                        color: seatLayoutType === 'arc' ? 'white' : '#6b7280',
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    Vòng cung
                                                </button>
                                            </div>

                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#9ca3af',
                                                    marginBottom: '8px'
                                                }}>
                                                    KÍCH THƯỚC GHẾ
                                                </label>

                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        type="number"
                                                        min={10}
                                                        max={100}
                                                        value={seatWidth}
                                                        onChange={(e) => setSeatWidth(Number(e.target.value))}
                                                        placeholder="Rộng"
                                                        style={{
                                                            flex: 1,
                                                            background: '#16162a',
                                                            border: '1px solid #2a2a3e',
                                                            borderRadius: '6px',
                                                            padding: '8px',
                                                            color: '#e5e7eb'
                                                        }}
                                                    />
                                                    <input
                                                        type="number"
                                                        min={10}
                                                        max={100}
                                                        value={seatHeight}
                                                        onChange={(e) => setSeatHeight(Number(e.target.value))}
                                                        placeholder="Cao"
                                                        style={{
                                                            flex: 1,
                                                            background: '#16162a',
                                                            border: '1px solid #2a2a3e',
                                                            borderRadius: '6px',
                                                            padding: '8px',
                                                            color: '#e5e7eb'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '24px' }}>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#9ca3af',
                                                    marginBottom: '8px'
                                                }}>
                                                    KHOẢNG CÁCH GHẾ
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={50}
                                                    value={seatSpacing}
                                                    onChange={(e) => setSeatSpacing(Number(e.target.value))}
                                                    style={{
                                                        width: '100%',
                                                        background: '#16162a',
                                                        border: '1px solid #2a2a3e',
                                                        borderRadius: '6px',
                                                        padding: '8px',
                                                        color: '#e5e7eb'
                                                    }}
                                                />
                                            </div>


                                            {seatLayoutType === 'grid' && (
                                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{
                                                            display: 'block',
                                                            fontSize: '11px',
                                                            color: '#9ca3af',
                                                            marginBottom: '8px'
                                                        }}>
                                                            Số hàng
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="20"
                                                            value={gridRows}
                                                            onChange={(e) => setGridRows(Math.max(1, Number(e.target.value)))}
                                                            style={{
                                                                width: '100%',
                                                                background: '#16162a',
                                                                border: '1px solid #2a2a3e',
                                                                borderRadius: '6px',
                                                                padding: '8px 10px',
                                                                color: '#e5e7eb',
                                                                fontSize: '13px',
                                                                outline: 'none'
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{
                                                            display: 'block',
                                                            fontSize: '11px',
                                                            color: '#9ca3af',
                                                            marginBottom: '8px'
                                                        }}>
                                                            Số cột
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="30"
                                                            value={gridColumns}
                                                            onChange={(e) => setGridColumns(Math.max(1, Number(e.target.value)))}
                                                            style={{
                                                                width: '100%',
                                                                background: '#16162a',
                                                                border: '1px solid #2a2a3e',
                                                                borderRadius: '6px',
                                                                padding: '8px 10px',
                                                                color: '#e5e7eb',
                                                                fontSize: '13px',
                                                                outline: 'none'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {seatLayoutType === 'arc' && (
                                                <>
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <label style={{
                                                            display: 'block',
                                                            fontSize: '11px',
                                                            color: '#9ca3af',
                                                            marginBottom: '8px'
                                                        }}>
                                                            Tổng số ghế
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="2"
                                                            max="50"
                                                            value={arcTotalSeats}
                                                            onChange={(e) => setArcTotalSeats(Math.max(2, Number(e.target.value)))}
                                                            style={{
                                                                width: '100%',
                                                                background: '#16162a',
                                                                border: '1px solid #2a2a3e',
                                                                borderRadius: '6px',
                                                                padding: '8px 10px',
                                                                color: '#e5e7eb',
                                                                fontSize: '13px',
                                                                outline: 'none'
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <label style={{
                                                            display: 'block',
                                                            fontSize: '11px',
                                                            color: '#9ca3af',
                                                            marginBottom: '8px'
                                                        }}>
                                                            Độ cong (độ)
                                                        </label>
                                                        <div style={{ marginBottom: '12px' }}>
                                                            <label
                                                                style={{
                                                                    display: 'block',
                                                                    fontSize: '11px',
                                                                    color: '#9ca3af',
                                                                    marginBottom: '8px',
                                                                }}
                                                            >
                                                                Độ cong
                                                            </label>

                                                            <select
                                                                value={arcCurvature}
                                                                onChange={(e) => setArcCurvature(Number(e.target.value))}
                                                                style={{
                                                                    width: '100%',
                                                                    background: '#16162a',
                                                                    border: '1px solid #2a2a3e',
                                                                    borderRadius: '6px',
                                                                    padding: '8px 10px',
                                                                    color: '#e5e7eb',
                                                                    fontSize: '13px',
                                                                    outline: 'none',
                                                                }}
                                                            >
                                                                <option value={120}>1/3 vòng (120°)</option>
                                                                <option value={180}>Nửa vòng (180°)</option>
                                                                <option value={240}>2/3 vòng (240°)</option>
                                                                <option value={270}>3/4 vòng (270°)</option>
                                                                <option value={325}>Gần tròn (325°)</option>
                                                            </select>
                                                        </div>

                                                    </div>
                                                </>
                                            )}

                                            <button
                                                onClick={handleCreateSeats}
                                                style={{
                                                    width: '100%',
                                                    background: '#10b981',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    marginBottom: '12px'
                                                }}
                                            >
                                                TẠO GHẾ
                                            </button>
                                            <button
                                                onClick={deleteSectionSeats}
                                                style={{
                                                    width: '100%',
                                                    background: '#dc2626',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                XÓA GHẾ KHU VỰC
                                            </button>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#e5e7eb'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSection.showLabel}
                                                    onChange={(e) => updateSectionProperty('showLabel', e.target.checked)}
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                HIỂN THỊ TÊN KHU VỰC
                                            </label>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                XOAY (độ)
                                            </label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedSection.rotation)}
                                                onChange={(e) => updateSectionProperty('rotation', Number(e.target.value))}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                LOẠI VÉ ÁP DỤNG
                                            </label>
                                            <select
                                                value={selectedSection.ticketType}
                                                onChange={(e) => updateSectionProperty('ticketType', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="Vé VIP Premium - 500k">Vé VIP Premium - 500k</option>
                                                <option value="Vé Standard - 300k">Vé Standard - 300k</option>
                                                <option value="Vé Economy - 150k">Vé Economy - 150k</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {isSingleSectionSelected && activeTab === 'SHAPE' && (
                                    <>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                HÌNH DẠNG
                                            </label>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(3, 1fr)',
                                                gap: '12px'
                                            }}>
                                                {[
                                                    { type: 'rect' as const, icon: '▭', label: 'RECT' },
                                                    { type: 'square' as const, icon: '◻', label: 'SQUARE' },
                                                    { type: 'circle' as const, icon: '○', label: 'CIRCLE' },
                                                    { type: 'triangle' as const, icon: '△', label: 'TRI' },
                                                    { type: 'parallelogram' as const, icon: '▱', label: 'PARA' },
                                                    { type: 'trapezoid' as const, icon: '⏢', label: 'TRAP' }
                                                ].map(shape => (
                                                    <button
                                                        key={shape.type}
                                                        onClick={() => changeShape(shape.type)}
                                                        style={{
                                                            background: selectedSection.type === shape.type ? '#8B5CF6' : '#16162a',
                                                            border: selectedSection.type === shape.type ? '2px solid #a78bfa' : '1px solid #2a2a3e',
                                                            borderRadius: '8px',
                                                            padding: '16px 8px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '24px', color: '#e5e7eb' }}>{shape.icon}</span>
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: 600,
                                                            color: '#9ca3af',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {shape.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                MÀU SẮC
                                            </label>
                                            <div style={{
                                                display: 'flex',
                                                gap: '12px'
                                            }}>
                                                {['#8B5CF6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'].map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => updateSectionProperty('stroke', color)}
                                                        style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            background: color,
                                                            border: selectedSection.stroke === color ? '3px solid white' : 'none',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isSingleSeatSelected && (
                                    <>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                ID GHẾ
                                            </label>
                                            <div style={{
                                                background: '#16162a',
                                                border: '1px solid #2a2a3e',
                                                borderRadius: '8px',
                                                padding: '10px 12px',
                                                color: '#9ca3af',
                                                fontSize: '14px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {selectedSeat.id}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                Area
                                            </label>
                                            <div style={{
                                                background: '#16162a',
                                                border: '1px solid #2a2a3e',
                                                borderRadius: '8px',
                                                padding: '10px 12px',
                                                color: '#9ca3af',
                                                fontSize: '14px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {searchSectionName(selectedSeat.sectionId)}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                HÀNG
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedSeat.row}
                                                onChange={(e) => updateSeatProperty('row', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                SỐ GHẾ
                                            </label>
                                            <input
                                                type="number"
                                                value={selectedSeat.number}
                                                onChange={(e) => updateSeatProperty('number', Number(e.target.value))}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                XOAY (độ)
                                            </label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedSeat.rotation)}
                                                onChange={(e) => updateSeatProperty('rotation', Number(e.target.value))}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                TRẠNG THÁI
                                            </label>
                                            <select
                                                value={selectedSeat.status}
                                                onChange={(e) => updateSeatProperty('status', e.target.value as Seat['status'])}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="available">Có sẵn</option>
                                                <option value="sold">Đã bán</option>
                                                <option value="reserved">Đã đặt</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {isSingleTextSelected && (
                                    <>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                NỘI DUNG
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedText.text}
                                                onChange={(e) => updateTextProperty('text', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                CỠ CHỮ
                                            </label>
                                            <input
                                                type="number"
                                                value={selectedText.fontSize}
                                                onChange={(e) => updateTextProperty('fontSize', Number(e.target.value))}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                KIỂU CHỮ
                                            </label>
                                            <select
                                                value={selectedText.fontStyle}
                                                onChange={(e) => updateTextProperty('fontStyle', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="normal">Thường</option>
                                                <option value="bold">Đậm</option>
                                                <option value="italic">Nghiêng</option>
                                                <option value="bold italic">Đậm nghiêng</option>
                                            </select>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                MÀU CHỮ
                                            </label>
                                            <input
                                                type="color"
                                                value={selectedText.fill}
                                                onChange={(e) => updateTextProperty('fill', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    height: '48px',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                CĂN CHỈNH NGANG
                                            </label>
                                            <select
                                                value={selectedText.align}
                                                onChange={(e) => updateTextProperty('align', e.target.value as 'left' | 'center' | 'right')}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="left">Trái</option>
                                                <option value="center">Giữa</option>
                                                <option value="right">Phải</option>
                                            </select>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                CĂN CHỈNH DỌC
                                            </label>
                                            <select
                                                value={selectedText.verticalAlign}
                                                onChange={(e) => updateTextProperty('verticalAlign', e.target.value as 'top' | 'middle' | 'bottom')}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="top">Trên</option>
                                                <option value="middle">Giữa</option>
                                                <option value="bottom">Dưới</option>
                                            </select>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: '12px'
                                            }}>
                                                XOAY (độ)
                                            </label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedText.rotation)}
                                                onChange={(e) => updateTextProperty('rotation', Number(e.target.value))}
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {selectedIds.length === 0 && (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '40px',
                                textAlign: 'center'
                            }}>
                                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                                    Chọn một đối tượng để xem thuộc tính
                                </div>
                            </div>
                        )}

                        {selectedIds.length > 1 && (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '40px',
                                textAlign: 'center'
                            }}>
                                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                                    Đã chọn {selectedIds.length} đối tượng
                                </div>
                            </div>
                        )}

                        {isSingleSectionSelected && (
                            <div style={{
                                padding: '20px',
                                borderTop: '1px solid #2a2a3e'
                            }}>
                                <button
                                    onClick={handleDelete}
                                    style={{
                                        width: '100%',
                                        background: '#7f1d1d',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    XÓA KHU VỰC
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!showPropertiesPanel && (
                    <div style={{
                        width: '40px',
                        background: '#1a1a2e',
                        borderLeft: '1px solid #2a2a3e',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                        alignItems: 'center',
                        paddingTop: '20px'
                    }}>
                        <button
                            onClick={() => setShowPropertiesPanel(true)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#9ca3af',
                                fontSize: '16px',
                                cursor: 'pointer',
                                padding: '4px',
                                transform: 'rotate(180deg)'
                            }}
                        >
                            &lt;
                        </button>
                    </div>
                )}
            </div>
            {showLockModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onClick={() => setShowLockModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '420px',
                            maxHeight: '70vh',
                            background: '#1a1a2e',
                            borderRadius: '12px',
                            border: '1px solid #2a2a3e',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                            Quản lý khóa khu vực
                        </h3>

                        {/* ACTIONS */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() =>
                                    setSections(prev => prev.map(s => ({ ...s, locked: false })))
                                }
                                style={actionBtn('#10b981')}
                            >
                                Mở khóa tất cả
                            </button>

                            <button
                                onClick={() =>
                                    setSections(prev => prev.map(s => ({ ...s, locked: true })))
                                }
                                style={actionBtn('#dc2626')}
                            >
                                Khóa tất cả
                            </button>
                        </div>

                        {/* LIST */}
                        <div
                            style={{
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            {sections.map(section => (
                                <div
                                    key={section.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: '#16162a',
                                        border: '1px solid #2a2a3e',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 500 }}>
                                            {section.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                            {section.locked ? 'Đang khóa' : 'Đang mở'}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            setSections(prev =>
                                                prev.map(s =>
                                                    s.id === section.id
                                                        ? { ...s, locked: !s.locked }
                                                        : s
                                                )
                                            )
                                        }
                                        style={{
                                            background: section.locked ? '#10b981' : '#dc2626',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px 10px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {section.locked ? 'MỞ KHÓA' : 'KHÓA'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                saveToHistory();
                                setShowLockModal(false);
                            }}
                            style={{
                                marginTop: '8px',
                                background: '#8B5CF6',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            XONG
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

export default SeatMapEditorPage;