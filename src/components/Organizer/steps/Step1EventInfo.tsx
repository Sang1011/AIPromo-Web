import { useEffect, useRef, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAllCategories } from "../../../store/categorySlice";
import {
    fetchCreateEvent,
    fetchCreateImage,
    fetchDeleteImage,
    fetchUpdateEvent,
    fetchUpdateEventBanner,
    fetchUpload
} from "../../../store/eventSlice";
import { fetchAllHashtags, fetchCreateHashtag } from "../../../store/hashtagSlice";
import type {
    EventCategory,
    EventHashtag,
    GetEventDetailResponse
} from "../../../types/event/event";
import { notify } from "../../../utils/notify";
import { validateImageFile } from "../../../utils/validateImageFile";
import { ActorMajorField } from "../actors/ActorMajorField";
import { DropdownItem, DropdownLoading } from "../shared/DropdownItem";
import ImagePreviewBox from "../shared/ImagePreviewBox";
import { UnsavedBanner } from "../shared/UnsavedBanner";
import UploadBox from "../shared/UploadBox";
import { Step1Skeleton } from "../Step1Skeleton";
import { uploadWithRetry } from "../../../utils/uploadWithRetry";
import { compressImage } from "../../../utils/compressImage";

interface Step1EventInfoProps {
    onNext?: () => void;
    mode?: "create" | "edit";
    onCreated?: (eventId: string) => void;
    eventData?: GetEventDetailResponse | null;
    reloadEvent?: () => Promise<void>;
    isAllowUpdate?: boolean;
}

interface Actor {
    name: string;
    major: string;
    image: File | null;
}

interface EventImage {
    id: string | null;
    url: string;
    file?: File | null;
}

interface EventFormState {
    title: string;
    description: string;
    location: string;
    bannerUrl: string | null;
    images: EventImage[];
    actorUrls: string[];
    actors: Actor[];
    selectedHashtags: EventHashtag[];
    selectedCategories: EventCategory[];
    deletedImageIds: string[];
    bannerFile: File | null;
}

interface ActorError {
    name?: string;
    major?: string;
    image?: string;
}

interface FormErrors {
    title?: string;
    description?: string;
    location?: string;
    bannerUrl?: string;
    selectedHashtags?: string;
    selectedCategories?: string;
    actors?: ActorError[];
}

interface CreateHashtagModalProps {
    initialName: string;
    onClose: () => void;
    onCreated: (hashtag: EventHashtag) => void;
}

function CreateHashtagModal({ initialName, onClose, onCreated }: CreateHashtagModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [name, setName] = useState(initialName);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleCreate = async () => {
        const trimmed = name.trim();
        if (!trimmed) { setError("Tên hashtag không được để trống"); return; }
        setLoading(true);
        try {
            const res = await dispatch(fetchCreateHashtag({ name: trimmed })).unwrap();
            onCreated({ id: res as unknown as number, name: trimmed });
        } catch {
            setError("Tạo hashtag thất bại, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-b from-[#1e1638] to-[#100d1f] border border-white/10 shadow-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold text-base">Tạo hashtag mới</h4>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <FiX size={18} />
                    </button>
                </div>
                <div>
                    <label className="text-sm text-slate-400 mb-1 block">Tên hashtag</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">#</span>
                        <input
                            ref={inputRef}
                            value={name}
                            onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
                            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                            className={`w-full rounded-xl bg-black/40 border pl-7 pr-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-primary/60 transition-all ${error ? "border-red-500" : "border-white/10"}`}
                            placeholder="AI, Technology, ..."
                        />
                    </div>
                    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                </div>
                <div className="flex gap-3 pt-1">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors">
                        Huỷ
                    </button>
                    <button onClick={handleCreate} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 transition-opacity">
                        {loading ? "Đang tạo..." : "Tạo"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Dropdown ───────────────────────────────────────────────────────────────
interface DropdownListProps {
    children: React.ReactNode;
}
function DropdownList({ children }: DropdownListProps) {
    return (
        <div className="absolute z-30 top-full left-0 w-full mt-1 rounded-lg border border-white/15 bg-[#1a1530] shadow-2xl overflow-hidden">
            <div className="max-h-52 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}



export default function Step1EventInfo({
    onNext, mode = "edit", onCreated, eventData, reloadEvent, isAllowUpdate = true,
}: Step1EventInfoProps) {
    // ── Hashtag state ──────────────────────────────────────────────────────
    const [hashtagInput, setHashtagInput] = useState("");
    const [suggestions, setSuggestions] = useState<EventHashtag[]>([]);
    const [isHashtagOpen, setIsHashtagOpen] = useState(false);
    const [isHashtagLoading, setIsHashtagLoading] = useState(false);
    const [showCreateHashtagModal, setShowCreateHashtagModal] = useState(false);

    // ── Category state ─────────────────────────────────────────────────────
    const [categoryInput, setCategoryInput] = useState("");
    const [categorySuggestions, setCategorySuggestions] = useState<EventCategory[]>([]);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);

    const [errors, setErrors] = useState<FormErrors>({});
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentInfor } = useSelector((state: RootState) => state.AUTH);
    const [initEventForm, setInitEventForm] = useState<EventFormState>();
    const [eventForm, setEventForm] = useState<EventFormState>({
        title: "",
        description: "",
        location: "",
        bannerUrl: null,
        images: [],
        actorUrls: [],
        actors: [],
        selectedHashtags: [],
        selectedCategories: [],
        deletedImageIds: [],
        bannerFile: null
    });

    const hashtagRef = useRef<HTMLDivElement>(null);
    const categoryRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Fetch helpers ──────────────────────────────────────────────────────
    const fetchHashtags = async (name?: string) => {
        setIsHashtagLoading(true);
        try {
            const res = await dispatch(
                fetchAllHashtags(name ? { name } : {})
            ).unwrap();
            const list = Array.isArray(res) ? res : (res?.data ?? []);
            setSuggestions(list);
        } catch (e) {
            console.error(e);
        } finally {
            setIsHashtagLoading(false);
        }
    };

    const fetchCategories = async (name?: string) => {
        setIsCategoryLoading(true);
        try {
            const res = await dispatch(
                fetchAllCategories(name ? { name } : {})
            ).unwrap();
            setCategorySuggestions(Array.isArray(res?.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCategoryLoading(false);
        }
    };

    useEffect(() => {
        if (!isAllowUpdate) return;
        fetchHashtags();
        fetchCategories();
    }, [isAllowUpdate]);

    useEffect(() => {
        if (!isHashtagOpen) return;
        if (!hashtagInput.trim()) return;
        const timer = setTimeout(() => fetchHashtags(hashtagInput.trim()), 300);
        return () => clearTimeout(timer);
    }, [hashtagInput, isHashtagOpen]);

    useEffect(() => {
        if (!isCategoryOpen) return;
        if (!categoryInput.trim()) return;
        const timer = setTimeout(() => fetchCategories(categoryInput.trim()), 300);
        return () => clearTimeout(timer);
    }, [categoryInput, isCategoryOpen]);

    const updateForm = <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
        setEventForm((prev) => ({ ...prev, [key]: value }));
    };

    const validateAll = (): boolean => {
        const newErrors: FormErrors = {};
        if (!eventForm.bannerUrl) newErrors.bannerUrl = "Banner là bắt buộc";
        if (!eventForm.title.trim()) newErrors.title = "Tên sự kiện không được để trống";
        else if (eventForm.title.length < 5) newErrors.title = "Tên sự kiện tối thiểu 5 ký tự";
        else if (eventForm.title.length > 150) newErrors.title = "Tên sự kiện tối đa 150 ký tự";
        if (!eventForm.description.trim()) newErrors.description = "Mô tả sự kiện không được để trống";
        else if (eventForm.description.length > 3000) newErrors.description = "Mô tả tối đa 3000 ký tự";
        if (!eventForm.location.trim()) newErrors.location = "Địa điểm không được để trống";
        else if (eventForm.location.length > 500) newErrors.location = "Địa điểm tối đa 500 ký tự";
        if (eventForm.selectedHashtags.length < 1) newErrors.selectedHashtags = "Phải chọn ít nhất 1 hashtag";
        if (eventForm.selectedCategories.length < 1) newErrors.selectedCategories = "Phải chọn ít nhất 1 thể loại";
        if (eventForm.actors.length !== 0) {
            const actorErrors = eventForm.actors.map((actor, index) => {
                const err: ActorError = {};
                if (!actor.name.trim()) err.name = "Tên diễn giả không được để trống";
                if (!actor.major.trim()) err.major = "Chuyên môn không được để trống";
                if (!eventForm.actorUrls[index] && !actor.image && mode === "create") err.image = "Ảnh diễn giả là bắt buộc";
                return err;
            });
            if (actorErrors.some((e) => Object.keys(e).length > 0)) newErrors.actors = actorErrors;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isChanged = JSON.stringify(eventForm) !== JSON.stringify(initEventForm);

    // ── Hashtag handlers ───────────────────────────────────────────────────
    const addHashtag = (tag: EventHashtag) => {
        if (!isAllowUpdate) return;
        if (eventForm.selectedHashtags.some((t) => t.id === tag.id)) return;
        updateForm("selectedHashtags", [...eventForm.selectedHashtags, tag]);
        setHashtagInput("");
        setErrors((prev) => ({ ...prev, selectedHashtags: undefined }));
    };

    const removeHashtag = (id: number) => {
        if (!isAllowUpdate) return;
        updateForm("selectedHashtags", eventForm.selectedHashtags.filter((t) => t.id !== id));
    };

    const handleHashtagEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const existing = suggestions.find((s) => s.name.toLowerCase() === hashtagInput.toLowerCase());
        if (existing) addHashtag(existing);
    };

    const showCreateOption =
        hashtagInput.trim().length > 0 &&
        !suggestions.some((s) => s.name.toLowerCase() === hashtagInput.trim().toLowerCase());

    // ── Category handlers ──────────────────────────────────────────────────
    const addCategory = (cat: EventCategory) => {
        if (!isAllowUpdate) return;
        if (eventForm.selectedCategories.some((c) => c.id === cat.id)) return;
        updateForm("selectedCategories", [...eventForm.selectedCategories, cat]);
        setCategoryInput("");
        setErrors((prev) => ({ ...prev, selectedCategories: undefined }));
    };

    const removeCategory = (id: number) => {
        if (!isAllowUpdate) return;
        updateForm("selectedCategories", eventForm.selectedCategories.filter((c) => c.id !== id));
    };

    // ── Actor handlers ─────────────────────────────────────────────────────
    const addActor = () => {
        if (!isAllowUpdate) return;
        updateForm("actors", [...eventForm.actors, { name: "", major: "", image: null }]);
    };

    const removeActor = (index: number) => {
        if (!isAllowUpdate) return;
        updateForm("actors", eventForm.actors.filter((_, i) => i !== index));
    };

    const updateActor = (index: number, field: "name" | "major" | "image", value: string | File | null) => {
        updateForm("actors", eventForm.actors.map((actor, i) => i === index ? { ...actor, [field]: value } : actor));
    };

    // ── Image handlers ─────────────────────────────────────────────────────
    const handleBannerChange = (file: File) => {
        const err = validateImageFile(file);
        if (err) { notify.error(err); return; }
        if (!isAllowUpdate) return;
        const previewUrl = URL.createObjectURL(file);
        setEventForm((prev) => ({ ...prev, bannerUrl: previewUrl, bannerFile: file }));
    };

    const handleAddImages = (files: FileList | null) => {
        if (!isAllowUpdate || !files) return;

        const validFiles: File[] = [];

        Array.from(files).forEach((file) => {
            const err = validateImageFile(file);
            if (err) {
                notify.error(err);
                return;
            }
            validFiles.push(file);
        });

        if (validFiles.length === 0) return;

        const newImages = validFiles.map((file) => ({
            id: null,
            url: URL.createObjectURL(file),
            file,
        }));

        setEventForm((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
        }));
    };

    const handleDeleteImage = (index: number) => {
        if (!isAllowUpdate) return;
        const img = eventForm.images[index];
        setEventForm((prev) => {
            const newDeletedIds = img.id ? [...prev.deletedImageIds, img.id] : prev.deletedImageIds;
            if (!img.id) URL.revokeObjectURL(img.url);
            return { ...prev, deletedImageIds: newDeletedIds, images: prev.images.filter((_, i) => i !== index) };
        });
    };

    const handleActorFileChange = (file: File, index: number) => {
        const err = validateImageFile(file);
        if (err) { notify.error(err); return; }
        if (!isAllowUpdate) return;
        updateActor(index, "image", file);
        const previewUrl = URL.createObjectURL(file);
        setEventForm((prev) => {
            const updated = [...prev.actorUrls];
            updated[index] = previewUrl;
            return { ...prev, actorUrls: updated };
        });
    };

    const flushUploads = async () => {
        // ── 1. Banner ─────────────────────────────────────────────────────────
        let finalBannerUrl = eventForm.bannerUrl || "";
        if (eventForm.bannerFile) {
            const compressed = await compressImage(eventForm.bannerFile);
            if (mode === "edit" && eventId) {
                const res = await uploadWithRetry(() =>
                    dispatch(fetchUpdateEventBanner({ eventId, file: compressed })).unwrap()
                );
                finalBannerUrl = res.url;
            } else {
                finalBannerUrl = await uploadWithRetry(() =>
                    dispatch(fetchUpload({ folder: "events/banners", file: compressed })).unwrap()
                );
            }
            URL.revokeObjectURL(eventForm.bannerUrl!);
        }

        // ── 2. Xoá ảnh cũ ────────────────────────────────────────────────────
        if (mode === "edit" && eventId && eventForm.deletedImageIds.length > 0) {
            for (const imageId of eventForm.deletedImageIds) {
                await uploadWithRetry(() =>
                    dispatch(fetchDeleteImage({ eventId, imageId })).unwrap()
                );
            }
        }

        // ── 3. Upload ảnh bổ sung ─────────────────────────────────────────────
        const updatedImages: EventImage[] = [];
        for (const img of eventForm.images) {
            if (!img.file) {
                updatedImages.push(img);
                continue;
            }
            URL.revokeObjectURL(img.url);
            const compressed = await compressImage(img.file);
            if (mode === "edit" && eventId) {
                const res = await uploadWithRetry(() =>
                    dispatch(fetchCreateImage({ eventId, file: compressed })).unwrap()
                );
                updatedImages.push({ id: res.id, url: res.imageUrl, file: null });
            } else {
                const url = await uploadWithRetry(() =>
                    dispatch(fetchUpload({ folder: "events/images", file: compressed })).unwrap()
                );
                updatedImages.push({ id: null, url, file: null });
            }
        }

        // ── 4. Upload ảnh actor ───────────────────────────────────────────────
        const updatedActorUrls: string[] = [];
        for (let i = 0; i < eventForm.actors.length; i++) {
            const actor = eventForm.actors[i];
            if (!actor.image) {
                updatedActorUrls.push(eventForm.actorUrls[i] ?? "");
                continue;
            }
            const compressed = await compressImage(actor.image);
            const url = await uploadWithRetry(() =>
                dispatch(fetchUpload({ folder: "events/actors", file: compressed })).unwrap()
            );
            updatedActorUrls.push(url);
        }

        const updatedActors = eventForm.actors.map((actor) => ({ ...actor, image: null }));

        setEventForm((prev) => ({
            ...prev,
            bannerUrl: finalBannerUrl,
            bannerFile: null,
            images: updatedImages,
            actorUrls: updatedActorUrls,
            actors: updatedActors,
            deletedImageIds: [],
        }));

        return { finalBannerUrl, updatedImages, updatedActorUrls };
    };

    const handleNext = async () => {
        if (isSubmitting) return;
        if (mode === "edit" && eventId && !isChanged) {
            onNext?.();
            return;
        }

        if (!validateAll()) return;
        setIsSubmitting(true);
        const { finalBannerUrl, updatedImages, updatedActorUrls } = await flushUploads();

        const payload = {
            title: eventForm.title,
            bannerUrl: finalBannerUrl,
            description: eventForm.description,
            location: eventForm.location,
            mapUrl: "",
            hashtagIds: eventForm.selectedHashtags.map((t) => t.id),
            categoryIds: eventForm.selectedCategories.map((c) => c.id),
            actorImages: eventForm.actors.map((actor, i) => ({
                name: actor.name,
                major: actor.major,
                image: updatedActorUrls[i] || "",
            })),
            imageUrls: updatedImages.map((img) => img.url),
        };

        try {
            if (mode === "create") {
                const userInfo = currentInfor as { userId: string };
                await dispatch(fetchCreateEvent({ ...payload, organizerId: userInfo.userId }))
                    .unwrap()
                    .then((res) => {
                        notify.success("Tạo sự kiện thành công");
                        onCreated?.(res.data);
                    });
            } else if (mode === "edit" && eventId) {
                if (isChanged) {
                    await dispatch(fetchUpdateEvent({ id: eventId, data: payload })).unwrap();
                    await reloadEvent?.();
                    setInitEventForm({ ...eventForm });
                    notify.success("Đã lưu thông tin sự kiện");
                }
                onNext?.();
            }
        } catch (e) {
            console.log(e);
            notify.error(mode === "create" ? "Không thể tạo sự kiện" : "Không thể cập nhật sự kiện");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Init form data ─────────────────────────────────────────────────────
    useEffect(() => {
        if (mode === "edit" && eventData) {
            const form: EventFormState = {
                title: eventData.title ?? "",
                description: eventData.description ?? "",
                location: eventData.location ?? "",
                bannerUrl: eventData.bannerUrl ?? null,
                selectedHashtags: eventData.hashtags ?? [],
                selectedCategories: eventData.categories ?? [],
                actorUrls: eventData.actorImages?.map((a) => a.image) ?? [],
                images: eventData.images?.map((img) => ({ id: img.id, url: img.imageUrl })) ?? [],
                actors: eventData.actorImages?.map((actor) => ({ name: actor.name, major: actor.major, image: null })) ?? [],
                deletedImageIds: [],
                bannerFile: null,
            };
            setEventForm(form);
            setInitEventForm(form);
        }
    }, [mode, eventData]);

    const isDirty = isChanged && mode === "edit";

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    const [bannerSaving, setBannerSaving] = useState(false);

    const handleBannerSave = async () => {
        if (bannerSaving) return;
        if (!validateAll()) return;
        setBannerSaving(true);
        try {
            const { finalBannerUrl, updatedImages, updatedActorUrls } = await flushUploads();
            const payload = {
                title: eventForm.title,
                bannerUrl: finalBannerUrl,
                description: eventForm.description,
                location: eventForm.location,
                mapUrl: "",
                hashtagIds: eventForm.selectedHashtags.map((t) => t.id),
                categoryIds: eventForm.selectedCategories.map((c) => c.id),
                actorImages: eventForm.actors.map((actor, i) => ({
                    name: actor.name,
                    major: actor.major,
                    image: updatedActorUrls[i] || "",
                })),
                imageUrls: updatedImages.map((img) => img.url),
            };
            await dispatch(fetchUpdateEvent({ id: eventId!, data: payload })).unwrap();
            await reloadEvent?.();
            setInitEventForm({ ...eventForm });
            notify.success("Đã lưu thông tin sự kiện");
        } catch {
            notify.error("Không thể lưu thông tin sự kiện");
        } finally {
            setBannerSaving(false);
        }
    };

    if (mode === "edit" && !eventData) {
        return <Step1Skeleton />
    }

    return (
        <>
            {showCreateHashtagModal && (
                <CreateHashtagModal
                    initialName={hashtagInput}
                    onClose={() => setShowCreateHashtagModal(false)}
                    onCreated={(tag) => { addHashtag(tag); setShowCreateHashtagModal(false); }}
                />
            )}

            <div className="space-y-8">
                {isDirty && isAllowUpdate && (
                    <UnsavedBanner onSave={handleBannerSave} saving={bannerSaving} />
                )}
                <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                    <h3 className="font-semibold text-white mb-4">* Hình ảnh sự kiện</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            {eventForm.bannerUrl ? (
                                <ImagePreviewBox
                                    imageUrl={eventForm.bannerUrl}
                                    aspect="16/9"
                                    onUpdate={isAllowUpdate ? (file) => handleBannerChange(file) : undefined}
                                />
                            ) : (
                                <UploadBox
                                    label="Banner ngang (16:9)"
                                    aspect="16/9"
                                    file={null}
                                    error={!!errors.bannerUrl}
                                    disabled={!isAllowUpdate}
                                    onChange={(file) => { if (file) handleBannerChange(file); }}
                                />
                            )}
                            {errors.bannerUrl && <p className="text-xs text-red-400 mt-1">{errors.bannerUrl}</p>}
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm text-slate-400">Ảnh bổ sung sự kiện</label>
                            <div className="flex flex-wrap gap-3">
                                {isAllowUpdate && (
                                    <label className="w-24 h-24 cursor-pointer rounded-lg border border-dashed border-white/20 flex items-center justify-center text-slate-400 text-xs text-center hover:border-white/40 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => handleAddImages(e.target.files)}
                                        />
                                        + Thêm ảnh
                                    </label>
                                )}

                                {eventForm.images.map((img, i) => (
                                    <ImagePreviewBox
                                        key={img.id ?? `new-${i}`}
                                        imageUrl={img.url}
                                        square
                                        className="w-24"
                                        onRemove={isAllowUpdate ? () => handleDeleteImage(i) : undefined}
                                    />
                                ))}

                                {!isAllowUpdate && eventForm.images.length === 0 && (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm italic py-2">
                                        <span className="text-xl opacity-30"></span>
                                        Chưa có ảnh bổ sung
                                    </div>
                                )}

                                {isAllowUpdate && eventForm.images.length === 0 && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/10 text-slate-500 text-xs italic self-center">
                                        Chưa có ảnh nào được thêm
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== Thông tin cơ bản ===== */}
                <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                    <h3 className="font-semibold text-white">* Thông tin cơ bản</h3>

                    <div>
                        <label className="text-sm text-slate-400">Tên sự kiện</label>
                        <input
                            className={`mt-2 w-full rounded-xl bg-black/30 border px-4 py-3 text-white disabled:opacity-40 disabled:cursor-not-allowed ${errors.title ? "border-red-500" : "border-white/10"}`}
                            placeholder="Hội thảo FA - Tìm kiếm cơ hội..."
                            value={eventForm.title}
                            disabled={!isAllowUpdate}
                            onChange={(e) => updateForm("title", e.target.value)}
                        />
                        {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* ── Hashtag dropdown ── */}
                        <div ref={hashtagRef} className="relative">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-slate-400">Hashtag</label>
                                {isHashtagOpen && !isHashtagLoading && (
                                    <span className="text-xs text-slate-500">{suggestions.length} kết quả</span>
                                )}
                            </div>

                            <div
                                className={`
                                    flex flex-wrap gap-1.5 items-center
                                    rounded-xl bg-black/30 border px-3 py-2 min-h-[48px]
                                    transition-all
                                    ${isHashtagOpen ? "ring-1 ring-primary/40" : ""}
                                    ${errors.selectedHashtags ? "border-red-500" : "border-white/10"}
                                `}
                                onBlur={(e) => {
                                    if (!hashtagRef.current?.contains(e.relatedTarget as Node)) {
                                        setIsHashtagOpen(false);
                                    }
                                }}
                            >
                                {eventForm.selectedHashtags.map((tag) => (
                                    <div
                                        key={tag.id}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-primary/20 text-white font-medium rounded-full text-xs shrink-0"
                                    >
                                        <span>#{tag.name}</span>
                                        {isAllowUpdate && (
                                            <button
                                                tabIndex={-1}
                                                onMouseDown={(e) => { e.preventDefault(); removeHashtag(tag.id); }}
                                                className="text-white/60 hover:text-white leading-none ml-0.5"
                                            >
                                                <FiX size={11} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <input
                                    value={hashtagInput}
                                    onChange={(e) => {
                                        if (!isAllowUpdate) return;
                                        setHashtagInput(e.target.value);
                                        if (!e.target.value.trim()) fetchHashtags();
                                    }}
                                    onFocus={() => { if (isAllowUpdate) setIsHashtagOpen(true); }}
                                    onKeyDown={isAllowUpdate ? handleHashtagEnter : undefined}
                                    readOnly={!isAllowUpdate}
                                    placeholder={isAllowUpdate ? "+ Thêm hashtag" : ""}
                                    className="flex-1 min-w-[80px] bg-transparent border-none text-white text-sm outline-none ring-0 focus:ring-0 placeholder:text-slate-500 read-only:cursor-not-allowed py-1"
                                />
                            </div>

                            {errors.selectedHashtags && (
                                <p className="text-xs text-red-400 mt-1">{errors.selectedHashtags}</p>
                            )}

                            {isAllowUpdate && isHashtagOpen && (
                                <DropdownList>
                                    {isHashtagLoading ? (
                                        <DropdownLoading />
                                    ) : suggestions.length > 0 || showCreateOption ? (
                                        <>
                                            {suggestions.map((tag) => (
                                                <DropdownItem
                                                    key={tag.id}
                                                    isSelected={eventForm.selectedHashtags.some((t) => t.id === tag.id)}
                                                    onClick={(e) => { e.preventDefault(); addHashtag(tag); }}
                                                    suffix={eventForm.selectedHashtags.some((t) => t.id === tag.id) ? "✓" : undefined}
                                                >
                                                    #{tag.name}
                                                </DropdownItem>
                                            ))}
                                            {showCreateOption && (
                                                <DropdownItem
                                                    onClick={(e) => { e.preventDefault(); setShowCreateHashtagModal(true); }}
                                                    suffix={<FiPlus size={13} className="text-primary" />}
                                                >
                                                    <span className="text-slate-400">
                                                        Tạo hashtag &nbsp;
                                                        <span className="text-white font-medium">#{hashtagInput.trim()}</span>
                                                    </span>
                                                </DropdownItem>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-4 py-4 text-sm text-slate-500 text-center">
                                            Không tìm thấy hashtag nào
                                        </div>
                                    )}
                                </DropdownList>
                            )}
                        </div>

                        {/* ── Category dropdown ── */}
                        <div ref={categoryRef} className="relative">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-slate-400">Thể loại</label>
                                {isCategoryOpen && !isCategoryLoading && (
                                    <span className="text-xs text-slate-500">{categorySuggestions.length} kết quả</span>
                                )}
                            </div>

                            <div
                                className={`
                                    flex flex-wrap gap-1.5 items-center
                                    rounded-xl bg-black/30 border px-3 py-2 min-h-[48px]
                                    transition-all
                                    ${isCategoryOpen ? "ring-1 ring-primary/40" : ""}
                                    ${errors.selectedCategories ? "border-red-500" : "border-white/10"}
                                `}
                                onBlur={(e) => {
                                    if (!categoryRef.current?.contains(e.relatedTarget as Node)) {
                                        setIsCategoryOpen(false);
                                        setCategoryInput("");
                                    }
                                }}
                            >
                                {eventForm.selectedCategories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-primary/20 text-white font-medium rounded-full text-xs shrink-0"
                                    >
                                        <span>{cat.name}</span>
                                        {isAllowUpdate && (
                                            <button
                                                tabIndex={-1}
                                                onMouseDown={(e) => { e.preventDefault(); removeCategory(cat.id); }}
                                                className="text-white/60 hover:text-white leading-none ml-0.5"
                                            >
                                                <FiX size={11} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <input
                                    value={categoryInput}
                                    onChange={(e) => {
                                        if (!isAllowUpdate) return;
                                        setCategoryInput(e.target.value);
                                        if (!e.target.value.trim()) fetchCategories();
                                    }}
                                    onFocus={() => { if (isAllowUpdate) setIsCategoryOpen(true); }}
                                    readOnly={!isAllowUpdate}
                                    placeholder={isAllowUpdate ? "+ Thêm thể loại" : ""}
                                    className="flex-1 min-w-[80px] bg-transparent border-none text-white text-sm outline-none ring-0 focus:ring-0 placeholder:text-slate-500 read-only:cursor-not-allowed py-1"
                                />
                            </div>

                            {errors.selectedCategories && (
                                <p className="text-xs text-red-400 mt-1">{errors.selectedCategories}</p>
                            )}

                            {isAllowUpdate && isCategoryOpen && (
                                <DropdownList>
                                    {isCategoryLoading ? (
                                        <DropdownLoading />
                                    ) : categorySuggestions.length > 0 ? (
                                        categorySuggestions.map((cat) => {
                                            const isSelected = eventForm.selectedCategories.some((c) => c.id === cat.id);
                                            return (
                                                <DropdownItem
                                                    key={cat.id}
                                                    isSelected={isSelected}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (!isSelected) addCategory(cat);
                                                    }}
                                                    suffix={isSelected ? "✓" : undefined}
                                                >
                                                    {cat.name}
                                                </DropdownItem>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-4 text-sm text-slate-500 text-center">
                                            Không tìm thấy thể loại nào
                                        </div>
                                    )}
                                </DropdownList>
                            )}
                        </div>
                    </div>

                    {/* Địa điểm */}
                    <div>
                        <label className="text-sm text-slate-400">Địa điểm tổ chức</label>
                        <input
                            className={`mt-2 w-full rounded-xl bg-black/30 border px-4 py-3 text-white disabled:opacity-40 disabled:cursor-not-allowed ${errors.location ? "border-red-500" : "border-white/10"}`}
                            placeholder="FPT University, Khu CNC Quận 9"
                            value={eventForm.location}
                            disabled={!isAllowUpdate}
                            onChange={(e) => updateForm("location", e.target.value)}
                        />
                        {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
                    </div>
                </section>

                {/* ===== Mô tả ===== */}
                <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                    <h3 className="font-semibold text-white mb-4">* Mô tả sự kiện</h3>
                    <textarea
                        className={`w-full min-h-[200px] rounded-xl bg-black/30 border px-4 py-3 text-white disabled:opacity-40 disabled:cursor-not-allowed ${errors.description ? "border-red-500" : "border-white/10"}`}
                        placeholder="Giới thiệu sự kiện..."
                        value={eventForm.description}
                        disabled={!isAllowUpdate}
                        onChange={(e) => updateForm("description", e.target.value)}
                    />
                    {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                </section>

                {/* ===== Diễn giả ===== */}
                <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-white"> Diễn giả / Khách mời</h3>
                        {isAllowUpdate && (
                            <button
                                type="button"
                                onClick={addActor}
                                className="px-4 py-2 rounded-lg bg-primary text-sm"
                            >
                                + Thêm diễn giả
                            </button>
                        )}
                    </div>

                    {eventForm.actors.length === 0 && (
                        <div
                            onClick={isAllowUpdate ? addActor : undefined}
                            className={`
            flex flex-col items-center justify-center gap-3
            rounded-xl border-2 border-dashed border-white/10 p-10
            text-center transition-colors
            ${isAllowUpdate
                                    ? "cursor-pointer hover:border-primary/40 hover:bg-primary/5"
                                    : "opacity-50 cursor-not-allowed"
                                }
        `}
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                                <FiPlus size={22} />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">
                                    {isAllowUpdate ? "Chưa có diễn giả / khách mời" : "Không có diễn giả / khách mời"}
                                </p>
                                {isAllowUpdate && (
                                    <p className="text-slate-500 text-xs mt-1">Bạn có thể nhấn để thêm diễn giả / khách mời</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {eventForm.actors.map((actor, index) => {
                            const actorErrors = errors.actors?.[index] || {};
                            return (
                                <div
                                    key={index}
                                    className={`grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-4 items-start border p-4 rounded-xl ${Object.keys(actorErrors).length > 0 ? "border-red-500/60 bg-red-500/5" : "border-white/5"}`}
                                >
                                    {eventForm.actorUrls[index] ? (
                                        <ImagePreviewBox
                                            imageUrl={eventForm.actorUrls[index]}
                                            square
                                            onUpdate={isAllowUpdate ? (file) => handleActorFileChange(file, index) : undefined}
                                        />
                                    ) : (
                                        <div>
                                            <UploadBox
                                                label="Ảnh"
                                                aspect="1/1"
                                                file={actor.image}
                                                error={!!actorErrors?.image}
                                                square
                                                disabled={!isAllowUpdate}
                                                onChange={(file) => {
                                                    if (!isAllowUpdate) return;
                                                    if (file) handleActorFileChange(file, index);
                                                    else updateActor(index, "image", null);
                                                }}
                                            />
                                            {actorErrors.image && (
                                                <p className="text-xs text-red-400 mt-1">{actorErrors.image}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {/* Tên diễn giả */}
                                        <div>
                                            <input
                                                value={actor.name}
                                                disabled={!isAllowUpdate}
                                                onChange={(e) => updateActor(index, "name", e.target.value)}
                                                className={`w-full rounded-xl bg-black/30 border px-4 py-3 text-white disabled:opacity-40 disabled:cursor-not-allowed ${actorErrors.name ? "border-red-500" : "border-white/10"}`}
                                                placeholder="Tên diễn giả"
                                            />
                                            {actorErrors.name && (
                                                <p className="text-xs text-red-400 mt-1">{actorErrors.name}</p>
                                            )}
                                        </div>

                                        {/* Chuyên môn — select + optional custom input */}
                                        <ActorMajorField
                                            value={actor.major}
                                            onChange={(val) => updateActor(index, "major", val)}
                                            disabled={!isAllowUpdate}
                                            error={actorErrors.major}
                                        />
                                    </div>

                                    {isAllowUpdate ? (
                                        <button
                                            onClick={() => removeActor(index)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 hover:border-red-500/50 transition-colors"
                                        >
                                            <FiX size={13} />
                                            Xóa
                                        </button>
                                    ) : (
                                        <div />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ===== Footer ===== */}
                <div className="flex justify-end pt-6">
                    <button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting
                            ? "Đang lưu..."
                            : mode === "create" ? "Tạo sự kiện" : isChanged ? "Lưu và Tiếp tục →" : "Tiếp theo →"
                        }
                    </button>
                </div>
            </div>
        </>
    );
}