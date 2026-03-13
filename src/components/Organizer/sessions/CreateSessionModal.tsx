import { useState } from "react";
import { fetchCreateEventSessions } from "../../../store/eventSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";

interface Props {
    open: boolean;
    onClose: () => void;
    eventId: string;
    onCreated?: () => void;
}

export default function CreateSessionModal({ open, onClose, eventId, onCreated }: Props) {
    const dispatch = useDispatch<AppDispatch>();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    if (!open) return null;

    const handleSubmit = async () => {
        const formattedStartTime = new Date(startTime).toISOString();
        const formattedEndTime = new Date(endTime).toISOString();

        console.log(title, description, formattedStartTime, formattedEndTime);

        await dispatch(
            fetchCreateEventSessions({
                eventId,
                data: {
                    sessions: [
                        {
                            title,
                            description,
                            startTime: formattedStartTime,
                            endTime: formattedEndTime
                        }
                    ]
                }
            })
        );

        onCreated?.();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1C1633] border border-white/10 p-8 rounded-2xl w-full max-w-[540px] shadow-2xl transform transition-all">

                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Tạo suất diễn</h3>
                    <p className="text-gray-400 text-sm mt-1">Điền thông tin chi tiết cho suất diễn mới của bạn.</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 ml-1">Tên suất diễn</label>
                        <input
                            type="text"
                            placeholder="VD: Buổi sáng - Khai mạc"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-white/20"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 ml-1">Mô tả</label>
                        <textarea
                            placeholder="Nhập nội dung tóm tắt..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-white/20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 ml-1">Bắt đầu</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all [color-scheme:dark]"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 ml-1">Kết thúc</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all [color-scheme:dark]"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-medium border border-white/10 hover:bg-white/5 transition-colors text-gray-300"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-2.5 rounded-xl font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        Tạo ngay
                    </button>
                </div>
            </div>
        </div>
    );
}