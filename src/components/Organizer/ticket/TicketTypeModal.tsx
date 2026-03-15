import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiX, FiPlus, FiEdit2, FiTrash2, FiCheck } from "react-icons/fi";
import type { AppDispatch, RootState } from "../../../store";
import {
    fetchCreateTicketType,
    fetchDeleteTicketType,
    fetchGetAllTicketTypes,
    fetchUpdateTicketType,
} from "../../../store/ticketTypeSlice";
import type {
    CreateTicketTypeRequest,
    TicketTypeItem,
    UpdateTicketTypeRequest,
} from "../../../types/ticketType/ticketType";
import { notify } from "../../../utils/notify";

const formatPrice = (price: number) =>
    price === 0 ? "FREE" : price.toLocaleString("vi-VN") + "đ";

const emptyForm = (): CreateTicketTypeRequest => ({
    name: "",
    price: 0,
    quantity: 1,
});

interface CreateFormErrors {
    name?: string;
    price?: string;
    quantity?: string;
}

// ─── Shared: FREE toggle ──────────────────────────────────────────────────────

function FreeToggle({ isFree, onToggle }: { isFree: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all shrink-0 ${isFree
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-white/[0.03] border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15"
                }`}
        >
            <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${isFree ? "border-emerald-400 bg-emerald-400" : "border-slate-600"
                    }`}
            >
                {isFree && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            FREE
        </button>
    );
}

// ─── Shared: Price input (user types "thousands", .000đ is fixed suffix) ─────

function PriceInput({
    value,
    onChange,
    hasError,
}: {
    value: number;
    onChange: (val: number) => void;
    hasError?: boolean;
}) {
    const [raw, setRaw] = useState<string>("");
    const [isFocus, setIsFocus] = useState<boolean>(false);

    const format = (num: string) =>
        num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, "");
        setRaw(digits);
        onChange(digits === "" ? 0 : Number(digits));
    };
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            tabIndex={0}
            onClick={() => inputRef.current?.focus()}
            className={`flex items-center rounded-xl bg-black/30 border px-4 py-2.5 transition-all
focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-white/8
${hasError ? "border-red-500/60" : "border-white/8"}`}
        >
            <input
                ref={inputRef}
                value={format(raw)}
                onChange={handleChange}
                type="text"
                inputMode="numeric"
                placeholder="0"
                className="bg-transparent text-white text-sm border-none p-0 m-0 flex-1 min-w-0
                outline-none focus:outline-none focus:ring-0 focus:border-none"
            />

            <span className="text-slate-500 text-sm select-none ml-2">
                VND
            </span>
        </div>
    );
}

// ─── Shared: Price field (PriceInput + FREE toggle together) ─────────────────

function PriceField({
    price,
    isFree,
    onPriceChange,
    onFreeToggle,
    error,
    onClearError,
}: {
    price: number;
    isFree: boolean;
    onPriceChange: (val: number) => void;
    onFreeToggle: () => void;
    error?: string;
    onClearError?: () => void;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Giá vé
            </label>
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    {isFree ? (
                        <div className="flex items-center px-4 py-2.5 rounded-xl bg-black/30 border border-white/8 text-emerald-400 text-sm font-semibold">
                            Miễn phí
                        </div>
                    ) : (
                        <PriceInput
                            value={price}
                            onChange={(val) => {
                                onPriceChange(val);
                                onClearError?.();
                            }}
                            hasError={!!error}
                        />
                    )}
                </div>
                <FreeToggle isFree={isFree} onToggle={onFreeToggle} />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

// ─── Inline edit row ──────────────────────────────────────────────────────────

function TicketEditRow({
    ticket,
    onSave,
    onCancel,
}: {
    ticket: TicketTypeItem;
    onSave: (data: UpdateTicketTypeRequest) => Promise<void>;
    onCancel: () => void;
}) {
    const [isFree, setIsFree] = useState(ticket.price === 0);
    const [price, setPrice] = useState(ticket.price);
    const [quantity, setQuantity] = useState(String(ticket.quantity));
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({
                name: ticket.name,
                price: isFree ? 0 : price,
                quantity: Number(quantity),
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <PriceField
                price={price}
                isFree={isFree}
                onPriceChange={setPrice}
                onFreeToggle={() => { setIsFree((v) => !v); setPrice(0); }}
            />

            <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Số lượng
                    </label>
                    <input
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
                        className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary/50"
                        placeholder="Số lượng"
                        type="number"
                        min={1}
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-2.5 rounded-xl bg-primary/20 hover:bg-primary/40 text-primary transition-colors disabled:opacity-50"
                    title="Lưu"
                >
                    <FiCheck size={15} />
                </button>
                <button
                    onClick={onCancel}
                    className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 transition-colors"
                    title="Huỷ"
                >
                    <FiX size={15} />
                </button>
            </div>
        </div>
    );
}

// ─── Ticket display row ───────────────────────────────────────────────────────

function TicketDisplayRow({
    ticket,
    onEdit,
    onDelete,
}: {
    ticket: TicketTypeItem;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try { await onDelete(); } finally { setDeleting(false); }
    };

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium truncate">{ticket.name}</span>
                    {ticket.areaName && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-500 uppercase flex-shrink-0">
                            {ticket.areaName}
                        </span>
                    )}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{formatPrice(ticket.price)}</span>
                    <span className="text-[10px] text-slate-700">·</span>
                    <span className="text-[10px] text-slate-500">{ticket.quantity.toLocaleString("vi-VN")} vé</span>
                </div>
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
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<CreateTicketTypeRequest>(emptyForm());
    const [isFree, setIsFree] = useState(false);
    const [errors, setErrors] = useState<CreateFormErrors>({});
    const [saving, setSaving] = useState(false);

    const reset = () => {
        setForm(emptyForm());
        setIsFree(false);
        setErrors({});
    };

    const validate = (): boolean => {
        const e: CreateFormErrors = {};
        if (!form.name.trim()) e.name = "Tên vé không được để trống";
        if (!isFree && form.price < 1000) e.price = "Giá tối thiểu 1.000đ";
        if (form.quantity < 1) e.quantity = "Số lượng tối thiểu 1";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            await onAdd({ ...form, name: form.name.trim(), price: isFree ? 0 : form.price });
            reset();
            setOpen(false);
        } finally {
            setSaving(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-slate-400 hover:text-white hover:border-primary/40 hover:bg-primary/[0.04] text-sm font-medium transition-all"
            >
                <FiPlus size={14} />
                Thêm loại vé mới
            </button>
        );
    }

    return (
        <div className="rounded-xl bg-[#0d0a1a] border border-primary/15 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Thêm loại vé mới</p>
                <button onClick={() => { setOpen(false); reset(); }} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <FiX size={14} />
                </button>
            </div>

            {/* Tên vé */}
            <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Tên vé
                </label>
                <input
                    value={form.name}
                    onChange={(e) => {
                        setForm((p) => ({ ...p, name: e.target.value }));
                        if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    className={`w-full rounded-xl bg-black/30 border px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all ${errors.name ? "border-red-500/60" : "border-white/8"
                        }`}
                    placeholder="VD: VÉ TIÊU CHUẨN"
                    autoFocus
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Giá vé */}
            <PriceField
                price={form.price}
                isFree={isFree}
                onPriceChange={(val) => setForm((p) => ({ ...p, price: val }))}
                onFreeToggle={() => {
                    setIsFree((v) => !v);
                    setForm((p) => ({ ...p, price: 0 }));
                    if (errors.price) setErrors((p) => ({ ...p, price: undefined }));
                }}
                error={errors.price}
                onClearError={() => setErrors((p) => ({ ...p, price: undefined }))}
            />

            {/* Số lượng */}
            <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Số lượng
                </label>
                <input
                    value={form.quantity}
                    onChange={(e) => {
                        setForm((p) => ({ ...p, quantity: Number(e.target.value) }));
                        if (errors.quantity) setErrors((p) => ({ ...p, quantity: undefined }));
                    }}
                    className={`w-full rounded-xl bg-black/30 border px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all ${errors.quantity ? "border-red-500/60" : "border-white/8"
                        }`}
                    placeholder="VD: 500"
                    type="number"
                    min={1}
                />
                {errors.quantity && <p className="text-xs text-red-400">{errors.quantity}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={() => { setOpen(false); reset(); }}
                    className="flex-1 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:text-white text-sm font-medium transition-all"
                >
                    Huỷ
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-all"
                >
                    {saving ? "Đang thêm..." : "Thêm vé"}
                </button>
            </div>
        </div>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface TicketTypeModalProps {
    open: boolean;
    onClose: () => void;
    eventId: string;
}

export default function TicketTypeModal({ open, onClose, eventId }: TicketTypeModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const tickets = useSelector((state: RootState) => state.TICKET_TYPE.ticketTypes);
    const [editingId, setEditingId] = useState<string | null>(null);

    if (!open) return null;

    const ticketList = Array.isArray(tickets) ? tickets : [];
    const hasTickets = ticketList.length > 0;

    const handleAdd = async (data: CreateTicketTypeRequest) => {
        try {
            await dispatch(fetchCreateTicketType({ eventId, data })).unwrap();
            await dispatch(fetchGetAllTicketTypes({ eventId }));
            notify.success("Đã thêm loại vé");
        } catch {
            notify.error("Không thể thêm loại vé");
        }
    };

    const handleUpdate = async (ticketTypeId: string, data: UpdateTicketTypeRequest) => {
        try {
            await dispatch(fetchUpdateTicketType({ eventId, ticketTypeId, data })).unwrap();
            setEditingId(null);
            notify.success("Đã cập nhật loại vé");
        } catch {
            notify.error("Không thể cập nhật loại vé");
        }
    };

    const handleDelete = async (ticketTypeId: string) => {
        try {
            await dispatch(fetchDeleteTicketType({ eventId, ticketTypeId })).unwrap();
            notify.success("Đã xóa loại vé");
        } catch (error: any) {
            if (error?.status === 404 || error?.statusCode === 404) {
                notify.warning("Loại vé này không tồn tại");
            } else {
                notify.error("Không thể xóa loại vé");
            }
        }
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
                        <h3 className="text-white font-semibold">Quản lý loại vé</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Áp dụng chung cho toàn bộ sự kiện</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
                        <FiX size={18} />
                    </button>
                </div>

                {/* Ticket list */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 min-h-[120px]">
                    {!hasTickets ? (
                        <div className="h-full flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-sm text-slate-500">Chưa có loại vé nào</p>
                            <p className="text-xs text-slate-600 mt-1">Thêm loại vé bên dưới để bắt đầu</p>
                        </div>
                    ) : (
                        ticketList.map((ticket) =>
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
                <div className="px-6 pb-5 flex-shrink-0 border-t border-white/5 pt-4">
                    <AddTicketForm onAdd={handleAdd} />
                </div>
            </div>
        </div>
    );
}