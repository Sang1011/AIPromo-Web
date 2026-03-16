import Konva from 'konva';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowLeft, FaCopy, FaMinus, FaPaste, FaPlus } from "react-icons/fa";
import { IoMdLock, IoMdUnlock } from 'react-icons/io';
import { MdMenu, MdOutlineKeyboardArrowRight, MdOutlinePalette } from 'react-icons/md';
import { Circle, Group, Text as KonvaText, Layer, Line, Rect, Stage, Transformer } from 'react-konva';
import { getWorldPointer } from '../../utils/getWorldPointer';
import type { Area, EditorMode, Entity, HistoryState, Seat, SeatLayoutType, SeatMapData, SelectionBox, TextEntity, TicketType } from '../../types/config/seatmap';
import { getSeatsBoundingBox } from '../../utils/getSeatBoundingBox';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetSeatMap, fetchUpdateSeatMap } from '../../store/seatMapSlice';
import { notify } from '../../utils/notify';

const GRID_SIZE = 20;
const CANVAS_WIDTH = 1550;
const CANVAS_HEIGHT = 900;

const baseBtn =
    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium " +
    "border border-slate-600 text-slate-200 bg-white/5 " +
    "transition-all duration-200 " +
    "hover:bg-violet-500/15 hover:border-violet-400 hover:text-white " +
    "hover:shadow-[0_0_0_1px_rgba(139,92,246,0.5)]";
type GuideLine = {
    x?: number;
    y?: number;
};

const SEAT_COLOR_PRESET = [
    '#7C3AED', // violet-600
    '#2563EB', // blue-600
    '#059669', // emerald-600
    '#D97706', // amber-600
    '#DC2626', // red-600
    '#6B7280', // gray-500
];


const SeatMapEditorPage: React.FC = () => {
    const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;
    const [sections, setSections] = useState<Area[]>([]);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedShape, setSelectedShape] = useState<Area['type']>('rect');
    const [stageScale, setStageScale] = useState(1);
    const [guides, setGuides] = useState<GuideLine | null>(null);
    const [textEntities, setTextEntities] = useState<TextEntity[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [history, setHistory] = useState<HistoryState[]>([{ sections, seats, textEntities }]);
    const [historyStep, setHistoryStep] = useState(0);
    const [activeTab, setActiveTab] = useState<'AREA' | 'SHAPE'>('AREA');
    const [clipboard, setClipboard] = useState<Entity[]>([]);
    const [editorMode, setEditorMode] = useState<EditorMode>('SELECT');
    const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [seatLayoutType, setSeatLayoutType] = useState<SeatLayoutType>('grid');
    const [gridRows, setGridRows] = useState(3);
    const [gridColumns, setGridColumns] = useState(5);
    const [seatWidth, setSeatWidth] = useState(15);
    const [seatHeight, setSeatHeight] = useState(15);
    const [seatSpacing, setSeatSpacing] = useState(10);
    const [arcTotalSeats, setArcTotalSeats] = useState(20);
    const [arcCurvature, setArcCurvature] = useState(180);
    const groupDragAnchorRef = useRef<Konva.Node | null>(null);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
        { id: 'VIP', name: 'Vé VIP Premium', color: '#8B5CF6', price: 500000 },
        { id: 'STANDARD', name: 'Vé Standard', color: '#3b82f6', price: 300000 },
        { id: 'ECONOMY', name: 'Vé Economy', color: '#10b981', price: 150000 },
    ]);
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const selectionRectRef = useRef<Konva.Rect>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const [isGroupDragging, setIsGroupDragging] = useState(false);

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

        console.log(`Đã copy ${copiedEntities.length} phần tử`);
    }, [selectedIds, sections, seats, textEntities]);

    const handlePaste = useCallback(() => {
        if (clipboard.length === 0) return;

        const newSections: Area[] = [];
        const newSeats: Seat[] = [];
        const newTexts: TextEntity[] = [];
        const idMap = new Map<string, string>();

        clipboard.forEach(entity => {
            const newId = `${entity.id}-copy-${Date.now()}-${Math.random()}`;
            idMap.set(entity.id, newId);

            const isSection = 'ticketTypeId' in entity;
            const isSeat = 'sectionId' in entity && 'status' in entity;
            const isText = 'text' in entity && 'fontSize' in entity;

            if (isSection) {
                newSections.push({
                    ...entity as Area,
                    id: newId,
                    x: (entity as Area).x + 40,
                    y: (entity as Area).y + 40
                });
            } else if (isSeat) {
                const seat = entity as Seat;
                const newSectionId = idMap.get(seat.sectionId) || seat.sectionId;

                newSeats.push({
                    ...seat,
                    id: newId,
                    sectionId: newSectionId,
                    x: seat.x + 40,
                    y: seat.y + 40
                });
            } else if (isText) {
                newTexts.push({
                    ...entity as TextEntity,
                    id: newId,
                    x: (entity as TextEntity).x + 40,
                    y: (entity as TextEntity).y + 40
                });
            } else {
                console.warn('Unknown entity type:', entity);
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

        console.log(`Paste: ${newSections.length} sections, ${newSeats.length} seats, ${newTexts.length} texts`);
        saveToHistory();
    }, [clipboard, saveToHistory]);

    const dragStartPosRef = useRef<Record<string, { x: number; y: number }>>({});

    const endGroupDrag = useCallback(() => {
        setSections(prev =>
            prev.map(s =>
                dragStartPosRef.current[s.id]
                    ? {
                        ...s,
                        x: snapToGrid(s.x),
                        y: snapToGrid(s.y),
                    }
                    : s
            )
        );

        setSeats(prev =>
            prev.map(seat =>
                dragStartPosRef.current[seat.id]
                    ? {
                        ...seat,
                        x: snapToGrid(seat.x),
                        y: snapToGrid(seat.y),
                    }
                    : seat
            )
        );

        setTextEntities(prev =>
            prev.map(t =>
                dragStartPosRef.current[t.id]
                    ? {
                        ...t,
                        x: snapToGrid(t.x),
                        y: snapToGrid(t.y),
                    }
                    : t
            )
        );

        setIsGroupDragging(false);
        multiDragStartRef.current = null;
        dragStartPosRef.current = {};
        groupDragAnchorRef.current = null;
        saveToHistory();
    }, [saveToHistory]);


    const handleDragEnd = useCallback(
        (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
            if (isGroupDragging) return;

            const node = e.target;
            const startPos = dragStartPosRef.current[id];
            if (!startPos) return;

            const dx = node.x() - startPos.x;
            const dy = node.y() - startPos.y;

            setSections(prev =>
                prev.map(s =>
                    s.id === id
                        ? {
                            ...s,
                            x: snapToGrid(startPos.x + dx),
                            y: snapToGrid(startPos.y + dy),
                        }
                        : s
                )
            );

            setSeats(prev =>
                prev.map(seat =>
                    seat.id === id
                        ? {
                            ...seat,
                            x: snapToGrid(startPos.x + dx),
                            y: snapToGrid(startPos.y + dy),
                        }
                        : seat
                )
            );

            setTextEntities(prev =>
                prev.map(t =>
                    t.id === id
                        ? {
                            ...t,
                            x: snapToGrid(startPos.x + dx),
                            y: snapToGrid(startPos.y + dy),
                        }
                        : t
                )
            );

            dragStartPosRef.current = {};
            saveToHistory();
        },
        [saveToHistory, isGroupDragging]
    );

    const [seatFillColor, setSeatFillColor] = useState('#9ca3af');


    const handleTransformEnd = useCallback(
        (id: string, e: Konva.KonvaEventObject<Event>) => {
            const node = e.target;
            const area = sections.find(s => s.id === id);
            if (!area) return;

            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            const scale = Math.min(scaleX, scaleY);

            node.scaleX(1);
            node.scaleY(1);

            let newWidth = Math.max(20, area.width * scaleX);
            let newHeight = Math.max(20, area.height * scaleY);

            if (area.type === 'square' || area.type === 'circle') {
                const size = Math.min(newWidth, newHeight);
                newWidth = size;
                newHeight = size;
            }

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
                            labelFontSize: Math.max(10, (s as any).labelFontSize * scale || 14),
                        }
                        : s
                )
            );

            setTextEntities(prev =>
                prev.map(t =>
                    t.attachedAreaId === area.id
                        ? {
                            ...t,
                            x: area.x,
                            y: area.y,
                            width: area.width,
                            height: area.height,
                        }
                        : t
                )
            );

            saveToHistory();
        },
        [sections, saveToHistory]
    );


    const [showLockModal, setShowLockModal] = useState(false);

    const changeShape = useCallback((shape: Area['type']) => {
        if (!isSingleSectionSelected || !selectedSection) return;

        if (selectedSection.type === 'polygon') return;


        const centerX = selectedSection.x + selectedSection.width / 2;
        const centerY = selectedSection.y + selectedSection.height / 2;

        let newWidth = selectedSection.width;
        let newHeight = selectedSection.height;

        if (shape === 'circle') {
            const size = Math.max(selectedSection.width, selectedSection.height);
            newWidth = size;
            newHeight = size;
        }

        if (shape === 'square') {
            const size = Math.min(selectedSection.width, selectedSection.height);
            newWidth = size;
            newHeight = size;
        }

        const newX = centerX - newWidth / 2;
        const newY = centerY - newHeight / 2;

        setSections(prev =>
            prev.map(s =>
                s.id === selectedSection.id
                    ? {
                        ...s,
                        type: shape,
                        width: newWidth,
                        height: newHeight,
                        x: newX,
                        y: newY,
                    }
                    : s
            )
        );

        saveToHistory();
    }, [isSingleSectionSelected, selectedSection, saveToHistory]);

    useEffect(() => {
        if (!transformerRef.current || !layerRef.current) return;

        const nodes = selectedIds
            .map(id => layerRef.current!.findOne(`#${id}`))
            .filter(Boolean) as Konva.Node[];

        transformerRef.current.nodes(nodes);
        transformerRef.current.getLayer()?.batchDraw();
    }, [sections]);

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

    const createAreaAtPosition = (x: number, y: number) => {
        createSectionAtPosition(x, y, 'rect', true);
    };

    const createShapeAtPosition = (x: number, y: number) => {
        createSectionAtPosition(x, y, selectedShape, false);
    };

    const applySeatColorToSection = useCallback(() => {
        if (!selectedSection) return;

        setSeats(prev =>
            prev.map(seat =>
                seat.sectionId === selectedSection.id
                    ? { ...seat, fill: seatFillColor }
                    : seat
            )
        );

        saveToHistory();
    }, [selectedSection, seatFillColor, saveToHistory]);


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
        const box = getSeatsBoundingBox(seats, selectedSection.id);
        const startX = box ? box.maxX + 30 : selectedSection.x + 20;
        const startY = box ? box.minY : selectedSection.y + 40;
        const rowLabels = Array.from({ length: gridRows }, (_, i) =>
            String.fromCharCode(65 + i)
        );
        const newSeatIds: string[] = [];

        rowLabels.forEach((row, rowIndex) => {
            for (let i = 0; i < gridColumns; i++) {
                const newId = `seat-${selectedSection.id}-${row}-${i + 1}-${Date.now()}-${rowIndex}-${i}`;
                newSeatIds.push(newId);

                newSeats.push({
                    id: newId,
                    sectionId: selectedSection.id,
                    row,
                    fill: seatFillColor,
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

        setSeats(prev => [...prev, ...newSeats]);

        setTimeout(() => {
            setSelectedIds(newSeatIds);
            forceUpdate({});
        }, 0);

        saveToHistory();
    }, [
        isSingleSectionSelected,
        selectedSection,
        gridRows,
        gridColumns,
        seatWidth,
        seatHeight,
        seatSpacing,
        seatFillColor,
        saveToHistory,
        seats,
    ]);

    const createArcSeatsForSection = useCallback(() => {
        if (!isSingleSectionSelected || !selectedSection) return;

        const newSeats: Seat[] = [];
        const newSeatIds: string[] = [];
        const seatSize = 30;
        const centerX = selectedSection.x + selectedSection.width / 2;
        const centerY = selectedSection.y + selectedSection.height / 2;
        const radius = Math.min(selectedSection.width, selectedSection.height) / 2 - 40;
        const isFullCircle = arcCurvature >= 300;
        const totalAngle = isFullCircle ? 360 : arcCurvature;
        const startAngle = isFullCircle ? -90 : -totalAngle / 2;
        const angleStep = totalAngle / arcTotalSeats;

        for (let i = 0; i < arcTotalSeats; i++) {
            const angleDeg = startAngle + i * angleStep;
            const angle = angleDeg * Math.PI / 180;
            const x = centerX + radius * Math.cos(angle) - seatSize / 2;
            const y = centerY + radius * Math.sin(angle) - seatSize / 2;
            const newId = `seat-${selectedSection.id}-arc-${i}-${Date.now()}`;
            newSeatIds.push(newId);

            newSeats.push({
                id: newId,
                sectionId: selectedSection.id,
                row: 'ARC',
                number: i + 1,
                x,
                y,
                fill: seatFillColor,
                width: seatSize,
                height: seatSize,
                rotation: angleDeg + 90,
                status: 'available',
            });
        }

        setSeats(prev => [...prev, ...newSeats]);
        setTimeout(() => {
            setSelectedIds(newSeatIds);
            forceUpdate({});
        }, 0);

        saveToHistory();
    }, [
        isSingleSectionSelected,
        selectedSection,
        arcTotalSeats,
        arcCurvature,
        seatFillColor,
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

    const handleCreateSeats = useCallback(() => {
        if (seatLayoutType === 'grid') {
            createGridSeatsForSection();
        } else {
            createArcSeatsForSection();
        }
    }, [seatLayoutType, createGridSeatsForSection, createArcSeatsForSection]);

    const enterCreateSectionMode = () => {
        setSelectedShape('rect');
        setEditorMode('CREATE_AREA');
        setSelectedIds([]);
    };

    const createSectionAtPosition = useCallback(
        (
            x: number,
            y: number,
            shape: Area['type'],
            isArea: boolean
        ) => {
            const newId = crypto.randomUUID();
            const newSection: Area = {
                id: newId,
                name: "",
                type: shape,
                x: snapToGrid(x),
                y: snapToGrid(y),
                width: 200,
                height: 150,
                rotation: 0,
                stroke: 'white',
                ticketTypeId: 'VIP',
                price: 500000,
                draggable: true,
                isAreaType: isArea,
            };

            setSections(prev => {
                newSection.name = `${isArea ? 'Khu vực' : 'Shape'} ${prev.length + 1}`;
                if (isArea) {
                    newSection.points = []
                }
                return [...prev, newSection];
            });

            setSelectedIds([newId]);
            setEditorMode('SELECT');
            setActiveTab(isArea ? 'AREA' : 'SHAPE');

            requestAnimationFrame(() => {
                saveToHistory();
            });
        },
        [saveToHistory]
    );

    useEffect(() => {
        if (!isSingleSectionSelected || !selectedSection) return;
        if (editorMode !== 'SELECT') return;

        if (selectedSection.type === 'polygon') {
            setActiveTab('AREA');
        } else if (selectedSection.isAreaType !== undefined) {
            setActiveTab(selectedSection.isAreaType ? 'AREA' : 'SHAPE');
        } else {
            setActiveTab('SHAPE');
        }
    }, [isSingleSectionSelected, selectedSection, editorMode]);

    const handleLockAllSections = () => {
        setSections(prev =>
            prev.map(s => ({ ...s, locked: true }))
        );
    };

    const handleUnlockAllSections = () => {
        setSections(prev =>
            prev.map(s => ({ ...s, locked: false }))
        );
    };

    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const isPanningRef = useRef(false);
    const panStartRef = useRef({ x: 0, y: 0 });

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

    const handleStageMouseDown = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {
            console.log('Current editorMode:', editorMode);
            const stage = e.target.getStage();
            if (!stage) return;

            if (e.evt.button === 2) {
                isPanningRef.current = true;
                setCursor('grabbing');

                panStartRef.current = {
                    x: e.evt.clientX - stagePos.x,
                    y: e.evt.clientY - stagePos.y,
                };
                return;
            }

            const pointerPos = getWorldPointer(stage);
            if (!pointerPos) return;

            if (editorMode === 'CREATE_AREA') {
                createAreaAtPosition(pointerPos.x, pointerPos.y);
                setEditorMode('SELECT');
                return;
            }

            if (editorMode === 'CREATE_SHAPE') {
                createShapeAtPosition(pointerPos.x, pointerPos.y);
                setEditorMode('SELECT');
                return;
            }


            if (editorMode === 'SELECT' && e.evt.shiftKey) {
                setIsSelecting(true);
                setCursor('crosshair');
                setSelectionBox({
                    x1: pointerPos.x,
                    y1: pointerPos.y,
                    x2: pointerPos.x,
                    y2: pointerPos.y,
                });
            }
        },
        [
            editorMode,
            createAreaAtPosition,
            createShapeAtPosition,
            stagePos,
        ]
    );



    const zoomIn = () => {
        setStageScale(prev => Math.min(prev + 0.1, 3));
    };

    const zoomOut = () => {
        setStageScale(prev => Math.max(prev - 0.1, 0.3));
    };

    const resetZoom = () => {
        setStageScale(1);
        setStagePos({
            x: (containerSize.width - CANVAS_WIDTH) / 2,
            y: (containerSize.height - CANVAS_HEIGHT) / 2,
        });
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const processImageToSeatMap = async (img: HTMLImageElement) => {
        // try {
        //     await waitForOpenCV();

        //     const areas = scanImageToAreas(img, ticketTypes);

        //     setSections(areas);
        //     setSeats([]);
        //     setTextEntities([]);
        //     setSelectedIds([]);
        //     saveToHistory();
        // } catch (err) {
        //     console.error("Scan image failed:", err);
        //     alert("Không thể xử lý ảnh. Vui lòng thử ảnh khác.");
        // }
    };



    const handleUploadImage = (file: File) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = async () => {
            await processImageToSeatMap(img);
        };
    };

    const importSeatMap = (file: File) => {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const data: SeatMapData = JSON.parse(reader.result as string);

                const importedSections: Area[] = [];
                const importedSeats: Seat[] = [];

                data.areas.forEach(area => {
                    const { seats: areaSeats, ...section } = area;

                    importedSections.push({
                        ...section,
                        draggable: true,
                    });

                    areaSeats.forEach(seat => {
                        importedSeats.push({
                            ...seat,
                            sectionId: section.id,
                        });
                    });
                });

                setSections(importedSections);
                setSeats(importedSeats);
                setTextEntities(data.texts || []);
                setSelectedIds([]);
                saveToHistory();
            } catch (err) {
                alert('File JSON không hợp lệ');
                console.error(err);
            }
        };

        reader.readAsText(file);
    };


    const exportSeatMap = () => {
        const data: SeatMapData = {
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

    const updateSelectedSeatsColor = (color: string) => {
        setSeats(prev =>
            prev.map(seat =>
                selectedIds.includes(seat.id)
                    ? { ...seat, fill: color }
                    : seat
            )
        );
        saveToHistory();
    };

    const dispatch = useDispatch<AppDispatch>();
    const { loading: seatMapLoading, error: seatMapError } = useSelector(
        (state: RootState) => state.SEATMAP
    );

    const finalizeSelectionBox = useCallback(() => {
        if (!isSelecting || !selectionBox || !layerRef.current) return;

        const dx = Math.abs(selectionBox.x2 - selectionBox.x1);
        const dy = Math.abs(selectionBox.y2 - selectionBox.y1);

        if (dx < 5 && dy < 5) {
            setIsSelecting(false);
            setSelectionBox(null);
            return;
        }

        const box = {
            x: Math.min(selectionBox.x1, selectionBox.x2),
            y: Math.min(selectionBox.y1, selectionBox.y2),
            width: dx,
            height: dy,
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

    const updateTicketTypeColor = useCallback(
        (ticketTypeId: string, color: string) => {
            setTicketTypes(prev =>
                prev.map(t =>
                    t.id === ticketTypeId
                        ? { ...t, color }
                        : t
                )
            );
        },
        []
    );
    const currentTicketType = selectedSection && ticketTypes.find(
        t => t.id === selectedSection.ticketTypeId
    );


    const beginGroupDrag = (draggedId: string) => {
        setIsGroupDragging(true);

        const anchor = layerRef.current?.findOne(`#${draggedId}`);
        if (!anchor) return;

        groupDragAnchorRef.current = anchor;

        multiDragStartRef.current = {
            x: anchor.x(),
            y: anchor.y(),
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
    };


    useEffect(() => {
        const handleMouseUp = () => {
            finalizeSelectionBox();
        };

        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [finalizeSelectionBox]);

    const handleStageMouseMove = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {

            if (isPanningRef.current) {
                setStagePos({
                    x: e.evt.clientX - panStartRef.current.x,
                    y: e.evt.clientY - panStartRef.current.y,
                });
                return;
            }

            if (!isSelecting || !selectionBox) return;

            const stage = e.target.getStage();
            if (!stage) return;

            const pointerPos = getWorldPointer(stage);
            if (!pointerPos) return;

            setSelectionBox({
                ...selectionBox,
                x2: pointerPos.x,
                y2: pointerPos.y,
            });
        },
        [isSelecting, selectionBox]
    );

    useEffect(() => {
        const stopPan = () => {
            if (isPanningRef.current) {
                isPanningRef.current = false;
                setCursor('default');
            }
        };

        window.addEventListener('mouseup', stopPan);
        return () => window.removeEventListener('mouseup', stopPan);
    }, []);

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
    const [, forceUpdate] = useState({});

    const applyGroupDragDelta = useCallback((dx: number, dy: number) => {
        setSections(prev =>
            prev.map(s =>
                dragStartPosRef.current[s.id]
                    ? {
                        ...s,
                        x: dragStartPosRef.current[s.id].x + dx,
                        y: dragStartPosRef.current[s.id].y + dy,
                    }
                    : s
            )
        );

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

        forceUpdate({});
    }, []);

    const location = useLocation();

    const multiSelectBox = useMemo(() => {
        if (selectedIds.length <= 1 || !layerRef.current) return null;
        return getMultiSelectBoundingBox(layerRef.current, selectedIds);
    }, [
        selectedIds,
        sections,
        seats,
        textEntities
    ]);

    const navigate = useNavigate();
    const { eventId } = useParams();

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

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(entries => {
            const rect = entries[0].contentRect;
            setContainerSize({
                width: rect.width,
                height: rect.height,
            });
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);


    const setCursor = (cursor: string) => {
        const stage = stageRef.current;
        if (stage) {
            stage.container().style.cursor = cursor;
        }
    };

    useEffect(() => {
        if (!eventId) return;

        dispatch(fetchGetSeatMap(eventId))
            .unwrap()
            .then((spec) => {
                try {
                    const data: SeatMapData = JSON.parse(spec);

                    const importedSections: Area[] = [];
                    const importedSeats: Seat[] = [];

                    data.areas.forEach(area => {
                        const { seats: areaSeats, ...section } = area;
                        importedSections.push({ ...section, draggable: true });
                        areaSeats.forEach(seat => {
                            importedSeats.push({ ...seat, sectionId: section.id });
                        });
                    });

                    setSections(importedSections);
                    setSeats(importedSeats);
                    setTextEntities(data.texts || []);
                    setSelectedIds([]);
                    saveToHistory();
                } catch {
                    console.error('Invalid seatmap spec from server');
                }
            })
            .catch((err) => {
                console.warn('No seatmap found or failed to load:', err);
            });
    }, [eventId]);


    const renderSection = (area: Area) => {
        const ticketType = ticketTypes.find(t => t.id === area.ticketTypeId);
        const fillColor = area.isAreaType
            ? ticketType?.color ?? '#6b7280'
            : area.fill ?? '#374151';
        return (
            <Group
                id={area.id}
                key={area.id}
                x={area.x}
                y={area.y}
                rotation={area.rotation}
                opacity={area.locked ? 0.6 : 1}
                draggable={
                    editorMode === 'SELECT' &&
                    !area.locked &&
                    !isSelecting &&
                    (
                        selectedIds.length === 1 ||
                        selectedIds.includes(area.id)
                    )
                }
                onDragStart={() => {
                    if (selectedIds.length > 1) {
                        beginGroupDrag(area.id);
                    } else {
                        beginMultiDrag(area.id);
                    }
                }}

                onMouseEnter={(e) => {
                    if (!area.locked) {
                        e.target.opacity(0.85);
                        layerRef.current?.batchDraw();
                    }
                    if (editorMode !== 'SELECT' || area.locked) return;
                    setCursor('move');
                }}
                onDblClick={() => {
                    if (area.locked) return;
                    setEditorMode('SELECT');
                    setSelectedIds([area.id]);
                }}
                onMouseLeave={(e) => {
                    e.target.opacity(1);
                    layerRef.current?.batchDraw();
                    setCursor('default');
                }}
                onDragMove={(e) => {
                    if (!isGroupDragging || !multiDragStartRef.current) return;

                    const dx = e.target.x() - multiDragStartRef.current.x;
                    const dy = e.target.y() - multiDragStartRef.current.y;

                    applyGroupDragDelta(dx, dy);
                }}


                onDragEnd={(e) => {
                    if (isGroupDragging) {
                        endGroupDrag();
                    } else {
                        handleDragEnd(area.id, e);
                    }
                }}

                onClick={(e) => {
                    if (isSelecting) return;
                    if (editorMode !== 'SELECT') return;

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
                {area.type === 'circle' ? (
                    <Circle
                        id={area.id}
                        radius={area.width / 2}
                        stroke={area.stroke}
                        fill={fillColor}
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
                        fill={fillColor}
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
                        fill={fillColor}
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
                        fill={fillColor}
                    />
                ) : area.type === 'polygon' && area.points ? (
                    <Line
                        id={area.id}
                        points={area.points}
                        closed
                        stroke={area.stroke}
                        fill={fillColor}
                        dash={area.locked ? [6, 4] : []}
                    />
                ) : (
                    <Rect
                        id={area.id}
                        width={area.width}
                        height={area.height}
                        stroke={area.stroke}
                        fill={fillColor}
                        dash={area.locked ? [6, 4] : []}
                    />
                )}
            </Group>
        );
    };



    return (
        <div style={{
            width: '100%',
            height: '100vh',
            background: '#0f0f1e',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', -apple-system, sans-serif",
            color: '#e5e7eb',
            overflow: 'hidden'
        }}>
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadImage(file);
                }}
            />

            <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importSeatMap(file);
                    e.target.value = '';
                }}
            />
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
                    <button
                        onClick={() => {
                            if (location.state?.from === "edit") {
                                navigate(`/organizer/my-events/${eventId}/edit`);
                            } else {
                                navigate(`/organizer/my-events/${eventId}/seat-map`);
                            }
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 500
                        }}
                        className="px-3 py-1 rounded-md hover:bg-white/10 transition"
                    >
                        <FaArrowLeft />
                        Trở về
                    </button>
                </div>



                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        className={baseBtn}
                        onClick={() => imageInputRef.current?.click()}
                    >
                        Tạo bằng hình ảnh
                    </button>

                    <button
                        onClick={() => setShowLockModal(true)}
                        className={baseBtn}
                    >
                        Quản lý khóa
                    </button>

                    <button
                        onClick={enterCreateSectionMode}
                        className={
                            editorMode === "CREATE_AREA"
                                ? "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold " +
                                "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                : baseBtn
                        }
                    >
                        Vẽ khu vực
                    </button>

                    <button
                        onClick={() => {
                            setSelectedShape('rect');
                            setEditorMode('CREATE_SHAPE');
                            setSelectedIds([]);
                        }}
                        className={
                            editorMode === 'CREATE_SHAPE'
                                ? "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 text-white"
                                : baseBtn
                        }
                    >
                        Vẽ Shape
                    </button>

                    <button
                        onClick={createText}
                        className={baseBtn}
                    >
                        Tạo Text
                    </button>

                    <div className="w-px h-6 bg-slate-600/70" />

                    <button
                        onClick={resetZoom}
                        className="text-sm text-slate-400 hover:text-white transition"
                    >
                        {Math.round(stageScale * 100)}%
                    </button>

                    <button
                        onClick={zoomIn}
                        className="text-slate-400 hover:text-white transition"
                    >
                        <FaPlus />
                    </button>

                    <button
                        onClick={zoomOut}
                        className="text-slate-400 hover:text-white transition"
                    >
                        <FaMinus />
                    </button>

                    <div className="w-px h-6 bg-slate-600/70" />

                    <button
                        onClick={toggleLockSelectedAreas}
                        disabled={selectedAreas.length === 0}
                        title={
                            selectedAreas.length === 0
                                ? "Chọn khu vực để khóa/mở khóa"
                                : areAllSelectedAreasLocked
                                    ? "Mở khóa khu vực đã chọn"
                                    : "Khóa khu vực đã chọn"
                        }
                        className={`
    flex items-center justify-center px-3 py-2 rounded-lg border
    transition-all duration-200
    ${selectedAreas.length === 0
                                ? "border-slate-700 text-slate-600 cursor-not-allowed opacity-50"
                                : areAllSelectedAreasLocked
                                    ? "border-red-500/60 text-red-400 hover:bg-red-500/10"
                                    : "border-slate-600 text-slate-300 hover:bg-violet-500/15 hover:border-violet-400"
                            }
  `}
                    >
                        {areAllSelectedAreasLocked ? <IoMdUnlock /> : <IoMdLock />}
                    </button>


                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={baseBtn}
                    >
                        Import JSON
                    </button>

                    <button
                        onClick={exportSeatMap}
                        className={baseBtn}
                    >
                        Export JSON
                    </button>

                    <button
                        onClick={() => {
                            const data: SeatMapData = {
                                areas: sections.map(area => ({
                                    ...area,
                                    seats: seats.filter(seat => seat.sectionId === area.id),
                                })),
                                texts: textEntities,
                            };

                            const spec = JSON.stringify(data, null, 2);

                            dispatch(fetchUpdateSeatMap({ eventId: eventId!, spec }))
                                .unwrap()
                                .then(() => {
                                    notify.success('Lưu sơ đồ thành công!');
                                    if (location.state?.from === "edit") {
                                        navigate(`/organizer/my-events/${eventId}/edit`);
                                    } else {
                                        navigate(`/organizer/my-events/${eventId}/seat-map`);
                                    }
                                })
                                .catch((err) => {
                                    notify.error(`Lưu thất bại`);
                                });

                        }}
                        disabled={seatMapLoading}
                        style={{
                            background: seatMapLoading ? '#6d28d9' : '#8B5CF6',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 24px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: seatMapLoading ? 'not-allowed' : 'pointer',
                            opacity: seatMapLoading ? 0.7 : 1,
                        }}
                    >
                        {seatMapLoading ? 'Đang lưu...' : 'Lưu sơ đồ'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minWidth: 0, position: 'relative' }}>
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
                        {editorMode === 'CREATE_SHAPE' && (
                            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                                Chế độ: Vẽ shape ({selectedShape})
                            </span>
                        )}
                        {editorMode === 'CREATE_AREA' && (
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

                    <div
                        ref={containerRef}
                        style={{
                            flex: 1,
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Stage
                            ref={stageRef}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            scaleX={stageScale}
                            scaleY={stageScale}
                            x={stagePos.x}
                            y={stagePos.y}
                            onMouseDown={handleStageMouseDown}
                            onMouseMove={handleStageMouseMove}
                            onClick={handleStageClick}
                            onContextMenu={(e) => e.evt.preventDefault()}
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

                                        onDragStart={() => {
                                            beginGroupDrag(selectedIds[0]);
                                        }}

                                        onDragMove={(e) => {
                                            if (!isGroupDragging || !multiDragStartRef.current) return;

                                            const dx = e.target.x() - multiDragStartRef.current.x;
                                            const dy = e.target.y() - multiDragStartRef.current.y;

                                            applyGroupDragDelta(dx, dy);
                                        }}

                                        onDragEnd={endGroupDrag}
                                    />
                                )}


                                {sections.map(area => renderSection(area))}

                                {seats.map(seat => {
                                    const isSelected = selectedIds.includes(seat.id);
                                    const isPartOfMultiSelect = selectedIds.length > 1 && isSelected;
                                    return (
                                        <Rect
                                            key={seat.id}
                                            id={seat.id}
                                            x={seat.x}
                                            y={seat.y}
                                            width={seat.width}
                                            height={seat.height}
                                            rotation={seat.rotation}
                                            fill={seat.fill}
                                            stroke={isSelected && selectedIds.length >= 1 ? '#ec4899' : "white"}
                                            strokeWidth={isSelected && selectedIds.length >= 1 ? 3 : 1}
                                            shadowColor={isSelected && selectedIds.length > 1 ? '#ec4899' : undefined}
                                            shadowBlur={isSelected && selectedIds.length > 1 ? 8 : 0}
                                            shadowOpacity={isSelected && selectedIds.length > 1 ? 0.8 : 0}
                                            cornerRadius={4}

                                            listening={!isPartOfMultiSelect && !isGroupDragging}

                                            draggable={
                                                editorMode === 'SELECT' &&
                                                !isSelecting &&
                                                !isGroupDragging &&
                                                selectedIds.length === 1 &&
                                                selectedIds.includes(seat.id)
                                            }

                                            onDragStart={() => {
                                                if (selectedIds.length > 1) {
                                                    beginGroupDrag(seat.id);
                                                } else {
                                                    beginMultiDrag(seat.id);
                                                }
                                            }}

                                            onDragMove={(e) => {
                                                if (!isGroupDragging || !multiDragStartRef.current) return;
                                                const dx = e.target.x() - multiDragStartRef.current.x;
                                                const dy = e.target.y() - multiDragStartRef.current.y;
                                                applyGroupDragDelta(dx, dy);
                                            }}

                                            onDragEnd={(e) => {
                                                if (isGroupDragging) {
                                                    endGroupDrag();
                                                } else {
                                                    handleDragEnd(seat.id, e);
                                                }
                                            }}

                                            onTransformEnd={(e) => handleTransformEnd(seat.id, e)}

                                            onClick={(e) => {
                                                if (isSelecting) return;
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
                                            onDragStart={() => {
                                                if (selectedIds.length > 1) {
                                                    beginGroupDrag(text.id);
                                                } else {
                                                    beginMultiDrag(text.id);
                                                }
                                            }}

                                            onDragMove={(e) => {
                                                if (!isGroupDragging || !multiDragStartRef.current) return;

                                                const dx = e.target.x() - multiDragStartRef.current.x;
                                                const dy = e.target.y() - multiDragStartRef.current.y;

                                                applyGroupDragDelta(dx, dy);
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
                                                !isGroupDragging &&
                                                !text.attachedAreaId
                                            }
                                            onDragEnd={(e) => {
                                                if (isGroupDragging) {
                                                    endGroupDrag();
                                                } else {
                                                    handleDragEnd(text.id, e);
                                                }
                                            }}

                                            onTransformEnd={(e) => handleTransformEnd(text.id, e)}
                                            onClick={(e) => {
                                                if (isSelecting) return;
                                                if (editorMode !== 'SELECT') return;

                                                e.cancelBubble = true;
                                                handleSelect(text.id, e.evt.shiftKey);
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
                            title={`Copy ${selectedIds.length} phần tử`}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#e5e7eb',
                                fontSize: '18px',
                                cursor: 'pointer',
                                padding: '8px 12px',
                                position: 'relative'
                            }}
                        >
                            <FaCopy />
                            {/* ✅ Badge hiển thị số phần tử đã copy */}
                            {clipboard.length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: '#10b981',
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    borderRadius: '50%',
                                    width: '16px',
                                    height: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {clipboard.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={handlePaste}
                            disabled={clipboard.length === 0}
                            title={`Paste ${clipboard.length} phần tử`}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: clipboard.length === 0 ? '#4b5563' : '#e5e7eb',
                                fontSize: '18px',
                                cursor: clipboard.length === 0 ? 'not-allowed' : 'pointer',
                                padding: '8px 12px'
                            }}
                        >
                            <FaPaste />
                        </button>
                    </div>
                </div>

                {showPropertiesPanel && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            height: '100%',
                            width: '320px',
                            background: '#1a1a2e',
                            borderLeft: '1px solid #2a2a3e',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 20,
                            transform: showPropertiesPanel
                                ? 'translateX(0)'
                                : 'translateX(100%)',
                            opacity: showPropertiesPanel ? 1 : 0,
                            pointerEvents: showPropertiesPanel ? 'auto' : 'none',
                            transition: 'transform 0.25s ease, opacity 0.2s ease',
                        }}
                    >
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
                                        cursor: 'pointer',
                                    }}
                                >
                                    <MdOutlineKeyboardArrowRight className='text-2xl' />
                                </button>
                            </div>
                        </div>

                        {isSingleEntitySelected && (
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
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
                                                <input className='mr-2'
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
                                            <label
                                                style={{
                                                    display: 'block',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#9ca3af',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    marginBottom: '12px',
                                                }}
                                            >
                                                MÀU GHẾ
                                            </label>

                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                {SEAT_COLOR_PRESET.map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setSeatFillColor(color)}
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            background: color,
                                                            border:
                                                                seatFillColor === color
                                                                    ? '3px solid white'
                                                                    : '1px solid rgba(255,255,255,0.2)',
                                                            borderRadius: 8,
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                ))}


                                                <label
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '8px',
                                                        border: '1px dashed rgba(255,255,255,0.4)',
                                                        background: seatFillColor,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        color: '#e5e7eb',
                                                    }}
                                                    title="Chọn màu ghế khác"
                                                >
                                                    <MdOutlinePalette />
                                                    <input
                                                        type="color"
                                                        value={seatFillColor}
                                                        onChange={(e) => setSeatFillColor(e.target.value)}
                                                        style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            opacity: 0,
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                </label>
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
                                                TẠO THÊM GHẾ
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
                                            <label
                                                style={{
                                                    display: 'block',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#9ca3af',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    marginBottom: '12px',
                                                }}
                                            >
                                                LOẠI VÉ ÁP DỤNG
                                            </label>

                                            <div style={{ position: 'relative' }}>
                                                <select
                                                    value={selectedSection.ticketTypeId}
                                                    onChange={(e) =>
                                                        updateSectionProperty('ticketTypeId', e.target.value)
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        background: '#16162a',
                                                        border: '1px solid #2a2a3e',
                                                        borderRadius: '8px',
                                                        padding: '12px 40px 12px 12px',
                                                        color: '#e5e7eb',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                        appearance: 'none',
                                                        WebkitAppearance: 'none',
                                                        MozAppearance: 'none',
                                                    }}
                                                >
                                                    {ticketTypes.map(t => (
                                                        <option
                                                            key={t.id}
                                                            value={t.id}
                                                            style={{
                                                                background: '#16162a',
                                                                color: '#e5e7eb',
                                                            }}
                                                        >
                                                            {t.name}
                                                        </option>
                                                    ))}
                                                </select>

                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        right: '12px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        color: '#9ca3af',
                                                        fontSize: '18px',
                                                    }}
                                                >
                                                    ▾
                                                </span>
                                            </div>
                                        </div>

                                    </>
                                )}
                                {isSingleSectionSelected &&
                                    activeTab === 'SHAPE' &&
                                    selectedSection.type === 'polygon' && (
                                        <div
                                            style={{
                                                padding: '16px',
                                                background: '#16162a',
                                                border: '1px dashed #3b82f6',
                                                borderRadius: '8px',
                                                color: '#93c5fd',
                                                fontSize: '13px',
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            <strong>⚠ Khu vực được tạo tự động từ hình ảnh</strong>
                                            <br />
                                            Hình dạng này được hệ thống phát hiện từ sơ đồ gốc.
                                            <br />
                                            Bạn có thể:
                                            <ul style={{ margin: '8px 0 0 16px' }}>
                                                <li>Di chuyển</li>
                                                <li>Thu phóng</li>
                                                <li>Xoay</li>
                                                <li>Tạo ghế bên trong</li>
                                            </ul>
                                            Không thể chỉnh sửa hình dạng chi tiết.
                                        </div>
                                    )}
                                {isSingleSectionSelected && activeTab === 'SHAPE' && selectedSection.type !== 'polygon' && (
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
                                                        onClick={() => {
                                                            if (editorMode === 'CREATE_SHAPE') {
                                                                setSelectedShape(shape.type);
                                                            } else {
                                                                changeShape(shape.type);
                                                            }
                                                        }}
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
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                {['#8B5CF6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'].map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => {
                                                            if (!currentTicketType) return;
                                                            updateSectionProperty('fill', color);
                                                        }}
                                                        style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            background: color,
                                                            border:
                                                                currentTicketType?.color === color
                                                                    ? '3px solid white'
                                                                    : '1px solid rgba(255,255,255,0.15)',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                        }}
                                                    />
                                                ))}

                                                <label
                                                    style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '8px',
                                                        border: '1px dashed rgba(255,255,255,0.4)',
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        background: currentTicketType?.color ?? '#1f2937',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '18px',
                                                        color: '#e5e7eb',
                                                    }}
                                                    title="Chọn màu khác"
                                                >
                                                    <MdOutlinePalette />
                                                    <input
                                                        type="color"
                                                        value={currentTicketType?.color}
                                                        onChange={(e) => {
                                                            if (!currentTicketType) return;
                                                            updateTicketTypeColor(currentTicketType.id, e.target.value);
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            opacity: 0,
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                </label>
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
                                            <label
                                                style={{
                                                    display: 'block',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#9ca3af',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    marginBottom: '12px',
                                                }}
                                            >
                                                GẮN VỚI KHU VỰC
                                            </label>

                                            <select
                                                value={selectedText.attachedAreaId ?? ''}
                                                onChange={(e) =>
                                                    updateTextProperty(
                                                        'attachedAreaId',
                                                        e.target.value || undefined
                                                    )
                                                }
                                                style={{
                                                    width: '100%',
                                                    background: '#16162a',
                                                    border: '1px solid #2a2a3e',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    color: '#e5e7eb',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    cursor: 'pointer',
                                                    appearance: 'none',
                                                    WebkitAppearance: 'none',
                                                    MozAppearance: 'none',
                                                }}
                                            >
                                                <option value="">Không gắn</option>
                                                {sections.map(sec => (
                                                    <option key={sec.id} value={sec.id}>
                                                        {sec.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    pointerEvents: 'none',
                                                    color: '#9ca3af',
                                                    fontSize: '18px',
                                                }}
                                            >
                                                ▾
                                            </span>
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
                                    XÓA
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!showPropertiesPanel && (
                    <button
                        onClick={() => setShowPropertiesPanel(true)}
                        style={{
                            position: 'absolute',
                            top: '30px',
                            right: '16px',
                            transform: 'translateY(-50%)',

                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',

                            background: '#1a1a2e',
                            border: '1px solid #2a2a3e',
                            color: '#9ca3af',

                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',

                            cursor: 'pointer',
                            zIndex: 30,

                            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                        }}
                        title="Mở bảng thuộc tính"
                    >
                        <MdMenu />
                    </button>
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

                        {sections.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center">
                                Không có bất kỳ khu vực nào
                            </p>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() =>
                                        handleUnlockAllSections()
                                    }
                                    style={actionBtn('#10b981')}
                                >
                                    Mở khóa tất cả
                                </button>

                                <button
                                    onClick={() =>
                                        handleLockAllSections()
                                    }
                                    style={actionBtn('#dc2626')}
                                >
                                    Khóa tất cả
                                </button>
                            </div>
                        )}

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