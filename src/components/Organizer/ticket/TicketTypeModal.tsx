import { useState } from "react";
import { useDispatch } from "react-redux";
import { FiX, FiPlus, FiEdit2, FiTrash2, FiCheck } from "react-icons/fi";
import type { AppDispatch } from "../../../store";
import {
    fetchCreateTicketType,
    fetchUpdateTicketType,
    fetchDeleteTicketType,
} from "../../../store/eventSlice";
import type { EventTicketType, EventSession, CreateTicketTypeRequest, UpdateTicketTypeRequest } from "../../../types/event/event";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
    price === 0 ? "FREE" : price.toLocaleString("vi-VN") + "đ";

const emptyForm = (): CreateTicketTypeRequest => ({
    name: "",
    price: 0,
    quantity: 1,
    type: "Zone",
    areaId: "",
});

interface CreateFormErrors {
    name?: string;
    price?: string;
    quantity?: string;
    areaId?: string;
}

// ─── Inline edit row ──────────────────────────────────────────────────────────

function TicketEditRow({
    ticket,
    onSave,
    onCancel,
}: {
    ticket: EventTicketType;
    onSave: (data: UpdateTicketTypeRequest) => Promise<void>;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        name: ticket.name,
        price: String(ticket.price),
        quantity: String(ticket.quantity),
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({
                name: form.name.trim(),
                price: Number(form.price),
                quantity: Number(form.quantity),
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="flex-1 min-w-0 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white text-sm"
                placeholder="Tên vé"
            />
            <input
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                className="w-28 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white text-sm"
                placeholder="Giá"
                type="number"
                min={0}
            />
            <input
                value={form.quantity}
                onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                className="w-24 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white text-sm"
                placeholder="Số lượng"
                type="number"
                min={1}
            />
            <button
                onClick={handleSave}
                disabled={saving}
                className="p-2 rounded-lg bg-primary/20 hover:bg-primary/40 text-primary transition-colors disabled:opacity-50"
                title="Lưu"
            >
                <FiCheck size={15} />
            </button>
            <button
                onClick={onCancel}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
                title="Huỷ"
            >
                <FiX size={15} />
            </button>
        </div>
    );
}

// ─── Ticket display row ───────────────────────────────────────────────────────

function TicketDisplayRow({
    ticket,
    onEdit,
    onDelete,
}: {
    ticket: EventTicketType;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try { await onDelete(); } finally { setDeleting(false); }
    };

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium truncate">{ticket.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 flex-shrink-0">
                        {ticket.type}
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                    {formatPrice(ticket.price)} &middot; Đã bán {ticket.soldQuantity}/{ticket.quantity}
                </p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onEdit}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Chỉnh sửa"
                >
                    <FiEdit2 size={14} />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Xoá"
                >
                    <FiTrash2 size={14} />
                </button>
            </div>
        </div>
    );
}

// ─── Add ticket form ──────────────────────────────────────────────────────────

function AddTicketForm({ onAdd }: { onAdd: (data: CreateTicketTypeRequest) => Promise<void> }) {
    const [form, setForm] = useState<CreateTicketTypeRequest>(emptyForm());
    const [errors, setErrors] = useState<CreateFormErrors>({});
    const [saving, setSaving] = useState(false);

    const validate = (): boolean => {
        const e: CreateFormErrors = {};
        if (!form.name.trim()) e.name = "Tên vé không được để trống";
        if (form.price < 0) e.price = "Giá không hợp lệ";
        if (form.quantity < 1) e.quantity = "Số lượng tối thiểu 1";
        if (!form.areaId.trim()) e.areaId = "Area ID không được để trống";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            await onAdd({ ...form, name: form.name.trim(), areaId: form.areaId.trim() });
            setForm(emptyForm());
            setErrors({});
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-xl bg-black/20 border border-white/5 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Thêm loại vé mới</p>

            {/* Name */}
            <div>
                <input
                    value={form.name}
                    onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
                    className={`w-full rounded-xl bg-black/30 border px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all ${errors.name ? "border-red-500" : "border-white/10"}`}
                    placeholder="Tên vé (VD: VÉ TIÊU CHUẨN)"
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Price */}
                <div>
                    <div className="relative">
                        <input
                            value={form.price}
                            onChange={(e) => { setForm((p) => ({ ...p, price: Number(e.target.value) })); if (errors.price) setErrors((p) => ({ ...p, price: undefined })); }}
                            className={`w-full rounded-xl bg-black/30 border px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all ${errors.price ? "border-red-500" : "border-white/10"}`}
                            placeholder="Giá (0 = miễn phí)"
                            type="number"
                            min={0}
                        />
                    </div>
                    {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price}</p>}
                </div>

                {/* Quantity */}
                <div>
                    <input
                        value={form.quantity}
                        onChange={(e) => { setForm((p) => ({ ...p, quantity: Number(e.target.value) })); if (errors.quantity) setErrors((p) => ({ ...p, quantity: undefined })); }}
                        className={`w-full rounded-xl bg-black/30 border px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all ${errors.quantity ? "border-red-500" : "border-white/10"}`}
                        placeholder="Số lượng"
                        type="number"
                        min={1}
                    />
                    {errors.quantity && <p className="text-xs text-red-400 mt-1">{errors.quantity}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Type */}
                <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "Zone" | "Seat" }))}
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                >
                    <option value="Zone">Zone</option>
                    <option value="Seat">Seat</option>
                </select>

                {/* Area ID */}
                <div>
                    <input
                        value={form.areaId}
                        onChange={(e) => { setForm((p) => ({ ...p, areaId: e.target.value })); if (errors.areaId) setErrors((p) => ({ ...p, areaId: undefined })); }}
                        className={`w-full rounded-xl bg-black/30 border px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all ${errors.areaId ? "border-red-500" : "border-white/10"}`}
                        placeholder="Area ID"
                    />
                    {errors.areaId && <p className="text-xs text-red-400 mt-1">{errors.areaId}</p>}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
            >
                {saving ? "Đang thêm..." : "Thêm vé"}
            </button>
        </div>
    );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface TicketTypeModalProps {
    open: boolean;
    onClose: () => void;
    eventId: string;
    session: EventSession & { id: string };
    onUpdated?: () => void;
}

export default function TicketTypeModal({
    open,
    onClose,
    eventId,
    session,
    onUpdated,
}: TicketTypeModalProps) {
    const dispatch = useDispatch<AppDispatch>();

    // Local optimistic state
    const [tickets, setTickets] = useState<EventTicketType[]>(session.ticketTypes ?? []);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Đóng bằng Escape
    if (!open) return null;

    const handleAdd = async (data: CreateTicketTypeRequest) => {
        const res = await dispatch(fetchCreateTicketType({
            eventId,
            sessionId: session.id,
            data,
        })).unwrap();
        setTickets((prev) => [...prev, res]);
        onUpdated?.();
    };

    const handleUpdate = async (ticketTypeId: string, data: UpdateTicketTypeRequest) => {
        await dispatch(fetchUpdateTicketType({
            eventId,
            sessionId: session.id,
            ticketTypeId,
            data,
        })).unwrap();
        setTickets((prev) =>
            prev.map((t) => t.id === ticketTypeId ? { ...t, ...data } : t)
        );
        setEditingId(null);
        onUpdated?.();
    };

    const handleDelete = async (ticketTypeId: string) => {
        await dispatch(fetchDeleteTicketType({
            eventId,
            sessionId: session.id,
            ticketTypeId,
        })).unwrap();
        setTickets((prev) => prev.filter((t) => t.id !== ticketTypeId));
        onUpdated?.();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#1e1638] to-[#100d1f] border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
                    <div>
                        <h3 className="text-white font-semibold">Loại vé</h3>
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{session.title}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <FiX size={18} />
                    </button>
                </div>

                {/* Ticket list */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                    {tickets.length === 0 ? (
                        <p className="text-sm text-slate-500 italic text-center py-6">
                            Chưa có loại vé nào
                        </p>
                    ) : (
                        tickets.map((ticket) =>
                            editingId === ticket.id ? (
                                <TicketEditRow
                                    key={ticket.id}
                                    ticket={ticket}
                                    onSave={(data) => handleUpdate(ticket.id, data)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <TicketDisplayRow
                                    key={ticket.id}
                                    ticket={ticket}
                                    onEdit={() => setEditingId(ticket.id)}
                                    onDelete={() => handleDelete(ticket.id)}
                                />
                            )
                        )
                    )}
                </div>

                {/* Add form */}
                <div className="px-6 pb-5 flex-shrink-0">
                    <AddTicketForm onAdd={handleAdd} />
                </div>
            </div>
        </div>
    );
}