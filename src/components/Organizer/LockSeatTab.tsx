import { useState } from "react";
import SeatMapLocker from "./SeatMapLocker";
import type { SeatMapData } from "../../pages/Organizer/SeatMapEditorPage";
import { FiLock } from "react-icons/fi";

const JSON_SEAT_MAP = {
    "stage": {
        "width": 1200,
        "height": 800,
        "rotation": 0,
        "scale": 1
    },
    "areas": [
        {
            "id": "area-1",
            "name": "VIP Area A",
            "type": "rect",
            "x": 500,
            "y": 380,
            "width": 580,
            "height": 360,
            "rotation": 0,
            "fill": "transparent",
            "stroke": "#8B5CF6",
            "ticketType": "Vé VIP Premium - 500k",
            "price": 500000,
            "showLabel": true,
            "seats": [
                {
                    "id": "seat-A-1",
                    "sectionId": "area-1",
                    "row": "A",
                    "number": 1,
                    "x": 285,
                    "y": 280,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-A-2",
                    "sectionId": "area-1",
                    "row": "A",
                    "number": 2,
                    "x": 325,
                    "y": 280,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-A-3",
                    "sectionId": "area-1",
                    "row": "A",
                    "number": 3,
                    "x": 365,
                    "y": 280,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-A-4",
                    "sectionId": "area-1",
                    "row": "A",
                    "number": 4,
                    "x": 400,
                    "y": 280,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-A-5",
                    "sectionId": "area-1",
                    "row": "A",
                    "number": 5,
                    "x": 440,
                    "y": 280,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-A-6",
                    "sectionId": "area-1",
                    "row": "A",
                    "number": 6,
                    "x": 560,
                    "y": 280,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-A-7",
                    "sectionId": "area-1",
                    "row": "A",
                    "number": 7,
                    "x": 600,
                    "y": 280,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-A-8",
                    "sectionId": "area-1",
                    "row": "A",
                    "number": 8,
                    "x": 640,
                    "y": 280,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-A-9",
                    "sectionId": "area-1",
                    "row": "A",
                    "number": 9,
                    "x": 680,
                    "y": 280,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-A-10",
                    "sectionId": "area-1",
                    "row": "A",
                    "number": 10,
                    "x": 580,
                    "y": 140,
                    "width": 160,
                    "height": 160,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-B-1",
                    "sectionId": "area-1",
                    "row": "B",
                    "number": 1,
                    "x": 285,
                    "y": 320,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-B-2",
                    "sectionId": "area-1",
                    "row": "B",
                    "number": 2,
                    "x": 325,
                    "y": 320,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-B-3",
                    "sectionId": "area-1",
                    "row": "B",
                    "number": 3,
                    "x": 365,
                    "y": 320,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-B-4",
                    "sectionId": "area-1",
                    "row": "B",
                    "number": 4,
                    "x": 400,
                    "y": 320,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-B-5",
                    "sectionId": "area-1",
                    "row": "B",
                    "number": 5,
                    "x": 440,
                    "y": 320,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-B-6",
                    "sectionId": "area-1",
                    "row": "B",
                    "number": 6,
                    "x": 560,
                    "y": 320,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-B-7",
                    "sectionId": "area-1",
                    "row": "B",
                    "number": 7,
                    "x": 600,
                    "y": 320,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-B-8",
                    "sectionId": "area-1",
                    "row": "B",
                    "number": 8,
                    "x": 640,
                    "y": 320,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-B-9",
                    "sectionId": "area-1",
                    "row": "B",
                    "number": 9,
                    "x": 680,
                    "y": 320,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                },
                {
                    "id": "seat-B-10",
                    "sectionId": "area-1",
                    "row": "B",
                    "number": 10,
                    "x": 720,
                    "y": 320,
                    "width": 30,
                    "height": 30,
                    "rotation": 0,
                    "status": "available"
                }
            ]
        }
    ],
    "texts": [
        {
            "id": "text-1",
            "x": 100,
            "y": 100,
            "width": 420,
            "height": 80,
            "rotation": 0,
            "text": "Văn bản mẫu",
            "fontSize": 33,
            "fontFamily": "Inter",
            "fontStyle": "normal",
            "fill": "#ffffff",
            "align": "center",
            "verticalAlign": "middle",
            "draggable": true
        }
    ]
}

export default function LockSeatTab() {
    const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

    return (
        <div className="flex gap-6 h-[75vh] overflow-hidden w-[99%]">

            {/* SEAT MAP */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-white/10">
                <SeatMapLocker
                    data={JSON_SEAT_MAP as unknown as SeatMapData}
                    selectedSeatIds={selectedSeatIds}
                    onToggleSeat={id => {
                        setSelectedSeatIds(prev =>
                            prev.includes(id)
                                ? prev.filter(x => x !== id)
                                : [...prev, id]
                        );
                    }}
                />
            </div>

            {/* SIDEBAR */}
            <div className="w-[240px] bg-gradient-to-b from-[#140f2a] to-[#0b0816]
                            border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-white font-semibold">
                    Vị trí đã chọn ({selectedSeatIds.length})
                </h3>

                <div className="space-y-2 text-sm text-slate-300 max-h-[300px] overflow-auto">
                    {selectedSeatIds.length === 0 && (
                        <div className="text-slate-500">
                            Chưa chọn ghế nào
                        </div>
                    )}

                    {selectedSeatIds.map(id => (
                        <div key={id} className="px-3 py-2 bg-white/5 rounded-lg">
                            {id}
                        </div>
                    ))}
                </div>

                <button
                    disabled={selectedSeatIds.length === 0}
                    className="w-full py-3 rounded-xl bg-primary
                               disabled:opacity-40 font-semibold"
                    onClick={() => {
                        console.log("LOCK SEATS:", selectedSeatIds);
                    }}
                >
                    <FiLock className="mr-2 inline-block" /> Khóa ghế đã chọn
                </button>
            </div>
        </div>
    );
}
