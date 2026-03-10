import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import ScheduleCard from "../ScheduleCard";
import TicketModal from "../ticket/TicketModal";
import CreateSessionModal from "../sessions/CreateSessionModal";
import type { AppDispatch } from "../../../store";
import { useDispatch } from "react-redux";
import { fetchDeleteSession, fetchSessions } from "../../../store/eventSlice";
import { useParams } from "react-router-dom";

export default function Step2Schedule({
    onNext,
    onBack,
}: {
    onNext: () => void;
    onBack: () => void;
}) {
    const [openTicketModal, setOpenTicketModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { eventId } = useParams<{ eventId: string }>();
    useEffect(() => {
        if (!eventId) return;
        dispatch(fetchSessions(eventId));
    }, [eventId]);

    const handleDeleteSchedule = (sessionId: string) => {
        if (!eventId) return;
        dispatch(fetchDeleteSession({
            eventId,
            sessionId
        }));
    }

    const handleUpdateSchedule = (sessionId: string, data: any) => {

    }

    const schedules = [
        {
            id: 1,
            date: "Thứ Sáu, 27-02-2026",
            time: "08:10 - 12:05",
            tickets: [
                {
                    id: 1,
                    name: "VÉ MIỄN PHÍ (SỚM)",
                    note: "Giới hạn 50 vé",
                    price: "FREE",
                    quantity: "50/50",
                },
                {
                    id: 2,
                    name: "VÉ TIÊU CHUẨN",
                    note: "Kèm nước uống",
                    price: "200.000đ",
                    quantity: "0/150",
                },
            ],
        },
        {
            id: 2,
            date: "Thứ Bảy, 28-02-2026",
            time: "08:10 - 12:05",
            tickets: [],
        },
    ];

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">
                        Thời gian biểu
                    </h2>
                    <p className="text-sm text-slate-400">
                        Quản lý các suất diễn và các loại vé tương ứng.
                    </p>
                </div>

                <button
                    onClick={() => setOpenCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium"
                >
                    <FiPlus />
                    Tạo suất diễn
                </button>
            </div>

            {/* Schedule list */}
            <div className="space-y-6">
                {schedules.map((s) => (
                    <ScheduleCard
                        key={s.id}
                        schedule={s}
                        onAddTicket={() => setOpenTicketModal(true)}
                    />
                ))}
            </div>

            {/* Footer actions */}
            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl border border-white/10 text-slate-400"
                >
                    Quay lại
                </button>

                <button
                    onClick={onNext}
                    className="px-6 py-3 rounded-xl bg-primary text-white font-semibold"
                >
                    Tiếp theo →
                </button>
            </div>

            <TicketModal
                open={openTicketModal}
                onClose={() => setOpenTicketModal(false)}
            />

            {eventId && (
                <CreateSessionModal
                    open={openCreateModal}
                    onClose={() => setOpenCreateModal(false)}
                    eventId={eventId}
                />
            )}
        </div>
    );
}
