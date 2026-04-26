import { useEffect, useState } from "react";
import { FiDownload, FiEdit2, FiPlus, FiSearch, FiSliders, FiTrash2, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import DateTimeInput from "../../components/Organizer/shared/DateTimeInput";
import Pagination from "../../components/Organizer/shared/Pagination";
import { useEventTitle } from "../../hooks/useEventTitle";
import type { AppDispatch, RootState } from "../../store";
import { fetchCreateVoucher, fetchDeleteVoucher, fetchExportExcelVoucher, fetchGetVouchers, fetchUpdateVoucher } from "../../store/voucherSlice";
import type { MeInfo } from "../../types/auth/auth";
import type { CreateVoucherRequest, UpdateVoucherRequest, VoucherItem } from "../../types/voucher/voucher";
import { downloadFileExcel } from "../../utils/downloadFileExcel";
import { getCurrentDateTime } from "../../utils/getCurrentDateTime";
import { notify } from "../../utils/notify";
import { saveReportToFirebase } from "../../utils/saveReportToFirebase";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN");
}

function deriveStatus(v: VoucherItem): "running" | "expired" | "maxed" {
    if (new Date(v.endDate) < new Date()) return "expired";
    if (v.maxUse > 0 && v.totalUse >= v.maxUse) return "maxed";
    return "running";
}

const STATUS_LABEL = { running: "Đang chạy", expired: "Hết hạn", maxed: "Hết lượt" } as const;
const STATUS_STYLE = {
    running: "bg-emerald-500/20 text-emerald-400",
    expired: "bg-red-500/20 text-red-400",
    maxed: "bg-amber-500/20 text-amber-400",
} as const;

type FormErrors = Partial<Record<keyof VoucherFormData, string>>;

const getNowLocal = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
};

function validateVoucherForm(form: VoucherFormData, isCreate: boolean): FormErrors {
    const errors: FormErrors = {};

    if (!form.name.trim()) {
        errors.name = "Vui lòng nhập tên voucher";
    }

    if (!form.couponCode.trim()) {
        errors.couponCode = "Vui lòng nhập mã voucher";
    } else if (!/^[A-Z0-9_-]{3,30}$/.test(form.couponCode.trim())) {
        errors.couponCode = "Mã chỉ gồm chữ in hoa, số, - hoặc _ (3–30 ký tự)";
    }

    const value = Number(form.value);
    if (!form.value || isNaN(value) || value <= 0) {
        errors.value = "Giá trị giảm phải lớn hơn 0";
    } else if (form.type === "Percentage" && value > 100) {
        errors.value = "Phần trăm không được vượt quá 100";
    }

    const maxUse = Number(form.maxUse);
    if (!form.maxUse || isNaN(maxUse) || maxUse < 0) {
        errors.maxUse = "Số lượng phải >= 0 (0 = không giới hạn)";
    }

    if (!form.startDate) errors.startDate = "Vui lòng chọn thời gian bắt đầu";
    if (!form.endDate) errors.endDate = "Vui lòng chọn thời gian kết thúc";

    if (form.startDate) {
        const now = new Date();
        const start = new Date(form.startDate);

        now.setSeconds(0, 0);
        start.setSeconds(0, 0);

        if (start < now) {
            errors.startDate = "Thời gian bắt đầu phải lớn hơn hoặc bằng hiện tại";
        }
    }

    if (isCreate && !form.eventId.trim()) {
        errors.eventId = "Vui lòng chọn sự kiện";
    }

    return errors;
}

type VoucherFormData = {
    name: string;
    description: string;
    couponCode: string;
    type: "Percentage" | "Fixed";
    value: string;
    maxUse: string;
    startDate: string;
    endDate: string;
    eventId: string;
};

const toLocalDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

function voucherToForm(v: VoucherItem): VoucherFormData {
    return {
        name: v.name,
        description: v.description,
        couponCode: v.couponCode,
        type: v.type,
        value: String(v.value),
        maxUse: String(v.maxUse),
        startDate: v.startDate ? toLocalDateTime(v.startDate) : "",
        endDate: v.endDate ? toLocalDateTime(v.endDate) : "",
        eventId: v.eventId,
    };
}

// ─── shared input cls ────────────────────────────────────────────────────────

function inputCls(hasErr: boolean) {
    return `w-full px-4 py-2 rounded-xl bg-white/5 border ${hasErr ? "border-red-500/50" : "border-white/10"} text-sm text-white outline-none focus:border-primary transition`;
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">{label}</label>
            {children}
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface VoucherModalProps {
    mode: "create" | "edit";
    initial?: VoucherItem | null;
    eventId?: string;
    onClose: () => void;
    onSaved: () => void;
}

const EMPTY_FORM: VoucherFormData = {
    name: "",
    description: "",
    couponCode: "",
    type: "Percentage",
    value: "",
    maxUse: "1",
    startDate: getNowLocal(),
    endDate: "",
    eventId: "",
};

function VoucherModal({ mode, initial, onClose, onSaved, eventId }: VoucherModalProps) {
    const dispatch = useDispatch<AppDispatch>();

    const [form, setForm] = useState<VoucherFormData>(
        initial ? voucherToForm(initial) : { ...EMPTY_FORM, eventId: eventId ?? "" }
    );
    const [errors, setErrors] = useState<FormErrors>({});
    const [saving, setSaving] = useState(false);

    const formatRaw = (num: string) => num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const [displayValue, setDisplayValue] = useState<string>(() => {
        if (!form.value) return "";
        if (form.type === "Fixed") return formatRaw(form.value);
        return form.value;
    });

    const update = <K extends keyof VoucherFormData>(k: K, v: VoucherFormData[K]) =>
        setForm(prev => ({ ...prev, [k]: v }));

    const handleTypeChange = (newType: VoucherFormData["type"]) => {
        update("type", newType);
        if (newType === "Percentage") {
            if (Number(displayValue) > 100) {
                setDisplayValue("100");
            } else {
                setDisplayValue(form.value);
            }
        } else {
            setDisplayValue(form.value ? formatRaw(form.value) : "");
        }
    };

    const handleValueChange = (raw: string) => {
        const digitsOnly = raw.replace(/\D/g, "");
        update("value", digitsOnly);
        if (form.type === "Fixed") {
            setDisplayValue(formatRaw(digitsOnly));
        } else {
            setDisplayValue(digitsOnly);
        }
    };

    const handleSubmit = async () => {
        const errs = validateVoucherForm(form, mode === "create");
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSaving(true);
        try {
            if (mode === "create") {
                if (!eventId) return notify.error("Vui lòng chọn sự kiện");
                const payload: CreateVoucherRequest = {
                    name: form.name.trim(),
                    description: form.description.trim(),
                    couponCode: form.couponCode.trim(),
                    type: form.type,
                    value: Number(form.value),
                    maxUse: Number(form.maxUse),
                    startDate: new Date(form.startDate).toISOString(),
                    endDate: new Date(form.endDate).toISOString(),
                    eventId: form.eventId.trim(),
                };
                await dispatch(fetchCreateVoucher(payload)).unwrap();
                notify.success("Tạo voucher thành công");
            } else {
                const payload: UpdateVoucherRequest = {
                    name: form.name.trim(),
                    description: form.description.trim(),
                    couponCode: form.couponCode.trim(),
                    type: form.type,
                    value: Number(form.value),
                    maxUse: Number(form.maxUse),
                    startDate: new Date(form.startDate).toISOString(),
                    endDate: new Date(form.endDate).toISOString()
                };
                await dispatch(fetchUpdateVoucher({ voucherId: initial!.id, data: payload })).unwrap();
                notify.success("Cập nhật voucher thành công");
            }
            onSaved();
            onClose();
        } catch (err: any) {
            const msg = typeof err === "string" ? err : err?.message ?? "";
            if (msg.toLowerCase().includes("used")) {
                notify.error("Voucher đã được sử dụng, không thể chỉnh sửa");
            } else if (msg.toLowerCase().includes("exist") || msg.toLowerCase().includes("duplicate")) {
                notify.error("Mã voucher đã tồn tại, vui lòng chọn mã khác");
                setErrors(prev => ({ ...prev, couponCode: "Mã đã tồn tại" }));
            } else {
                notify.error(mode === "create" ? "Không thể tạo voucher" : "Không thể cập nhật voucher");
            }
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (mode === "create") {
            update("startDate", getNowLocal());
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#1a1233] to-[#0d0a1a] border border-white/10 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                    <h3 className="text-lg font-semibold text-white">
                        {mode === "create" ? "Tạo voucher mới" : "Chỉnh sửa voucher"}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <FiX size={18} />
                    </button>
                </div>

                {/*
                 * FIX: calendar popup bị clip vì toàn bộ body có overflow-y-auto.
                 * Giải pháp: tách body thành 2 phần:
                 *   1. Phần scroll được (name, desc, code, type/value, maxUse)
                 *   2. Phần datetime — nằm ngoài vùng scroll, overflow: visible
                 *      → calendar popup thoải mái mở rộng xuống dưới mà không bị cắt.
                 */}

                {/* Scrollable fields */}
                <div className="px-6 pt-5 pb-2 space-y-4 overflow-y-auto max-h-[45vh]">
                    {/* name */}
                    <Field label="Tên voucher *" error={errors.name}>
                        <input
                            value={form.name}
                            onChange={e => {
                                const raw = e.target.value.toUpperCase();
                                const filtered = raw.replace(/[^A-Z0-9]/g, "");
                                update("name", filtered)
                            }}
                            placeholder="VD: Voucher giảm hè 2026"
                            className={inputCls(!!errors.name)}
                        />
                    </Field>

                    {/* description */}
                    <Field label="Mô tả" error={errors.description}>
                        <textarea
                            value={form.description}
                            onChange={e => update("description", e.target.value)}
                            placeholder="Mô tả ngắn về voucher (tuỳ chọn)"
                            rows={2}
                            className={`${inputCls(false)} resize-none`}
                        />
                    </Field>

                    {/* couponCode */}
                    <Field label="Mã voucher *" error={errors.couponCode}>
                        <input
                            value={form.couponCode}
                            onChange={e => {
                                const raw = e.target.value.toUpperCase();
                                const filtered = raw.replace(/[^A-Z0-9]/g, "");
                                update("couponCode", filtered);
                            }}
                            placeholder="VD: SUMMER2026"
                            className={inputCls(!!errors.couponCode)}
                        />
                    </Field>

                    {/* type + value */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Loại giảm giá *">
                            <select
                                value={form.type}
                                onChange={e => handleTypeChange(e.target.value as VoucherFormData["type"])}
                                className={`${inputCls(false)} [&>option]:bg-[#1a1233] [&>option]:text-white`}
                            >
                                <option value="Percentage">Phần trăm (%)</option>
                                <option value="Fixed">Số tiền cố định</option>
                            </select>
                        </Field>
                        <Field
                            label={`Giá trị * ${form.type === "Percentage" ? "(%)" : "(VNĐ)"}`}
                            error={errors.value}
                        >
                            <input
                                max={form.type === "Percentage" ? 100 : undefined}
                                type="text"
                                inputMode="numeric"
                                value={displayValue}
                                onChange={e => handleValueChange(e.target.value)}
                                placeholder="0"
                                className={inputCls(!!errors.value)}
                            />
                        </Field>
                    </div>

                    {/* maxUse */}
                    <Field label="Số lượng tối đa *" error={errors.maxUse}>
                        <input
                            type="number"
                            min={1}
                            value={form.maxUse}
                            onChange={e => update("maxUse", e.target.value)}
                            placeholder="1"
                            className={inputCls(!!errors.maxUse)}
                        />
                    </Field>

                    <div>
                        <DateTimeInput
                            label="Thời gian bắt đầu"
                            required
                            value={form.startDate}
                            onChange={(v: any) => update("startDate", v)}
                            min={new Date().toISOString()}
                        />
                        {errors.startDate && (
                            <p className="text-xs text-red-400 mt-1">{errors.startDate}</p>
                        )}
                    </div>
                    <div>
                        <DateTimeInput
                            label="Thời gian kết thúc"
                            required
                            value={form.endDate}
                            onChange={(v: any) => update("endDate", v)}
                            min={new Date().toISOString()}
                        />
                        {errors.endDate && (
                            <p className="text-xs text-red-400 mt-1">{errors.endDate}</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-2 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/30 disabled:opacity-60 flex items-center gap-2"
                    >
                        {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {saving ? "Đang lưu..." : mode === "create" ? "Tạo voucher" : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ voucher, onClose, onDeleted }: {
    voucher: VoucherItem;
    onClose: () => void;
    onDeleted: () => void;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await dispatch(fetchDeleteVoucher(voucher.id)).unwrap();
            notify.success("Đã xóa voucher thành công");
            onDeleted();
            onClose();
        } catch (err: any) {
            const msg = typeof err === "string" ? err : err?.message ?? "";
            if (msg.toLowerCase().includes("used")) {
                notify.error("Voucher đã được sử dụng, không thể xóa");
            } else {
                notify.error("Không thể xóa voucher");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#1a1233] to-[#0d0a1a] border border-white/10 shadow-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Xác nhận xóa</h3>
                <p className="text-sm text-slate-400">
                    Bạn có chắc muốn xóa voucher{" "}
                    <span className="text-primary font-semibold">{voucher.couponCode}</span>?
                    Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm disabled:opacity-60 flex items-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {loading ? "Đang xóa..." : "Xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VoucherManagementPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { vouchers, loading } = useSelector((s: RootState) => s.VOUCHER);
    const { currentInfor } = useSelector((s: RootState) => s.AUTH);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "running" | "expired" | "maxed">("all");
    const [showFilter, setShowFilter] = useState(false);
    const { eventId } = useParams<{ eventId: string }>();
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<VoucherItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<VoucherItem | null>(null);
    const eventName = useEventTitle();

    const load = (page = 1) => {
        dispatch(fetchGetVouchers({
            PageNumber: page,
            PageSize: 10,
            EventId: eventId
        }));
    };

    useEffect(() => { load(currentPage); }, [currentPage, eventId]);

    const items: VoucherItem[] = vouchers?.items ?? [];

    const filtered = items.filter((v) => {
        const matchSearch = v.couponCode.toLowerCase().includes(search.toLowerCase());
        const status = deriveStatus(v);
        const matchFilter = filterStatus === "all" || status === filterStatus;
        return matchSearch && matchFilter;
    });

    const handleExportExcel = async () => {
        if (!eventId) return notify.error("Không tìm thấy eventId");
        try {
            const blob = await dispatch(fetchExportExcelVoucher(eventId)).unwrap();
            const { iso, formatted } = getCurrentDateTime();
            const fileName = `vouchers_${eventName}_${formatted}.xlsx`;
            downloadFileExcel(blob, fileName);
            const userId = (currentInfor as MeInfo)?.userId;
            const userName = (currentInfor as MeInfo)?.name;
            await saveReportToFirebase({
                eventId,
                eventName: eventName ?? eventId,
                fileName,
                createdBy: userName ?? "",
                createdAt: iso,
                userId: userId ?? "",
            });
            notify.success("Xuất Excel thành công");
        } catch (err) {
            notify.error("Xuất Excel thất bại");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        Quản lý mã giảm giá
                        <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
                            {items.length} voucher
                        </span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 transition"
                    >
                        <FiDownload size={15} />
                        Xuất Excel
                    </button>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-primary/30 transition"
                    >
                        <FiPlus size={15} />
                        Tạo Voucher mới
                    </button>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <FiSearch size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm kiếm theo mã voucher..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary transition"
                    />
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowFilter(p => !p)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition ${showFilter ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}
                    >
                        <FiSliders size={14} />
                        Bộ lọc
                    </button>
                    {showFilter && (
                        <div className="absolute right-0 top-11 z-20 w-44 rounded-xl bg-[#1a1233] border border-white/10 shadow-xl overflow-hidden">
                            {(["all", "running", "expired", "maxed"] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setFilterStatus(s); setShowFilter(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-white/5 ${filterStatus === s ? "text-primary" : "text-slate-300"}`}
                                >
                                    {s === "all" ? "Tất cả" : STATUS_LABEL[s]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 overflow-hidden">
                <div className="px-6 py-4 text-sm text-slate-400">
                    Đang hiển thị{" "}
                    <span className="text-primary">{filtered.length}</span> mã giảm giá
                    {filterStatus !== "all" && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-500">
                            lọc: {STATUS_LABEL[filterStatus]}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-[1.5fr_1.2fr_1.5fr_1fr_1fr_1fr_1fr_1.2fr_100px] px-6 py-3 text-xs font-semibold tracking-widest text-slate-400 uppercase border-t border-white/5">
                    <div>Mã voucher</div>
                    <div>Tên</div>
                    <div>Mô tả</div>
                    <div>Loại</div>
                    <div>Giảm giá</div>
                    <div>Số lượng</div>
                    <div>Đã dùng</div>
                    <div>Trạng thái</div>
                    <div className="text-center">Thao tác</div>
                </div>

                <div className="divide-y divide-white/5">
                    {loading && (
                        <div className="flex items-center justify-center gap-2 py-12 text-slate-500 text-sm">
                            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            Đang tải...
                        </div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div className="py-12 text-center text-slate-500 text-sm">
                            Không tìm thấy voucher nào
                        </div>
                    )}

                    {!loading && filtered.map((v) => {
                        const status = deriveStatus(v);
                        return (
                            <div
                                key={v.id}
                                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.2fr_100px] px-6 py-4 items-center hover:bg-white/5 transition"
                            >
                                <span className="text-slate-300 text-sm truncate pr-2" title={v.name}>
                                    {v.name || "—"}
                                </span>
                                <span className="text-slate-500 text-sm truncate pr-2" title={v.description}>
                                    {v.description || "—"}
                                </span>
                                <div>
                                    <p className="text-primary font-semibold text-sm">{v.couponCode}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {formatDate(v.startDate)} – {formatDate(v.endDate)}
                                    </p>
                                </div>
                                <span className="text-slate-400 text-sm">
                                    {v.type === "Percentage" ? "Phần trăm" : "Cố định"}
                                </span>
                                <span className="text-white font-semibold text-sm">
                                    {v.type === "Percentage" ? `${v.value}%` : `${v.value.toLocaleString("vi-VN")}đ`}
                                </span>
                                <span className="text-slate-300 text-sm">
                                    {v.maxUse === 0 ? "∞" : v.maxUse}
                                </span>
                                <span className="text-slate-300 text-sm">{v.totalUse}</span>
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium w-fit ${STATUS_STYLE[status]}`}>
                                    {STATUS_LABEL[status]}
                                </span>
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setEditTarget(v)}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                                        title="Chỉnh sửa"
                                    >
                                        <FiEdit2 size={13} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(v)}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
                                        title="Xóa"
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Pagination
                    currentPage={vouchers?.pageNumber ?? 1}
                    totalPages={vouchers?.totalPages ?? 1}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>

            {/* Modals */}
            {createOpen && (
                <VoucherModal
                    mode="create"
                    eventId={eventId}
                    onClose={() => setCreateOpen(false)}
                    onSaved={load}
                />
            )}

            {editTarget && (
                <VoucherModal
                    mode="edit"
                    initial={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSaved={load}
                />
            )}

            {deleteTarget && (
                <DeleteConfirm
                    voucher={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={load}
                />
            )}
        </div>
    );
}