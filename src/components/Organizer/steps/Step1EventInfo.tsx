import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiPlus, FiX } from "react-icons/fi";
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
import ImagePreviewBox from "../shared/ImagePreviewBox";
import UploadBox from "../shared/UploadBox";

interface Step1EventInfoProps {
    onNext?: () => void;
    mode?: "create" | "edit";
    onCreated?: (eventId: string) => void;
    eventData?: GetEventDetailResponse | null;
    reloadEvent?: () => Promise<void>;
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

export default function Step1EventInfo({ onNext, mode = "edit", onCreated, eventData, reloadEvent }: Step1EventInfoProps) {
    const [hashtagInput, setHashtagInput] = useState("");
    const [suggestions, setSuggestions] = useState<EventHashtag[]>([]);
    const [showCreateHashtagModal, setShowCreateHashtagModal] = useState(false);
    const [categoryInput, setCategoryInput] = useState("");
    const [categorySuggestions, setCategorySuggestions] = useState<EventCategory[]>([]);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
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

    const updateForm = <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
        setEventForm((prev) => ({ ...prev, [key]: value }));
    };

    const categoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
                setIsCategoryOpen(false);
                setCategoryInput("");
                setCategorySuggestions([]);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        console.log("Current user info:", currentInfor);
    }, [currentInfor])

    const validateAll = (): boolean => {
        const newErrors: FormErrors = {};
        if (!eventForm.bannerUrl) newErrors.bannerUrl = "Banner là bắt buộc";
        if (!eventForm.title.trim()) newErrors.title = "Tên sự kiện không được để trống";
        else if (eventForm.title.length < 5) newErrors.title = "Tên sự kiện tối thiểu 5 ký tự";
        else if (eventForm.title.length > 150) newErrors.title = "Tên sự kiện tối đa 150 ký tự";
        if (!eventForm.description.trim()) newErrors.description = "Mô tả sự kiện không được để trống";
        if (eventForm.description.length > 500) newErrors.description = "Mô tả sự kiện tối đa 500 ký tự";
        if (!eventForm.location.trim()) newErrors.location = "Địa điểm không được để trống";
        else if (eventForm.location.length > 500) newErrors.location = "Địa điểm tối đa 500 ký tự";
        if (eventForm.selectedHashtags.length < 1) newErrors.selectedHashtags = "Phải chọn ít nhất 1 hashtag";
        if (eventForm.selectedCategories.length < 1) newErrors.selectedCategories = "Phải chọn ít nhất 1 thể loại";
        if (eventForm.actors.length < 1) {
            newErrors.actors = [{ name: "Phải có ít nhất 1 diễn giả" }];
        } else {
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

    const addHashtag = (tag: EventHashtag) => {
        if (eventForm.selectedHashtags.some((t) => t.id === tag.id)) return;
        updateForm("selectedHashtags", [...eventForm.selectedHashtags, tag]);
        setHashtagInput("");
        setSuggestions([]);
        setErrors((prev) => ({ ...prev, selectedHashtags: undefined }));
    };

    const removeHashtag = (id: number) => {
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

    const addCategory = (cat: EventCategory) => {
        if (eventForm.selectedCategories.some((c) => c.id === cat.id)) return;
        updateForm("selectedCategories", [...eventForm.selectedCategories, cat]);
        setCategoryInput("");
        setCategorySuggestions([]);
        setErrors((prev) => ({ ...prev, selectedCategories: undefined }));
    };

    const removeCategory = (id: number) => {
        updateForm("selectedCategories", eventForm.selectedCategories.filter((c) => c.id !== id));
    };

    const addActor = () => updateForm("actors", [...eventForm.actors, { name: "", major: "", image: null }]);

    const removeActor = (index: number) => updateForm("actors", eventForm.actors.filter((_, i) => i !== index));

    const updateActor = (index: number, field: "name" | "major" | "image", value: string | File | null) => {
        updateForm("actors", eventForm.actors.map((actor, i) => i === index ? { ...actor, [field]: value } : actor));
    };

    const handleBannerChange = (file: File) => {
        const previewUrl = URL.createObjectURL(file);
        setEventForm((prev) => ({
            ...prev,
            bannerUrl: previewUrl,
            bannerFile: file,
        }));
    };

    const handleAddImages = (files: FileList | null) => {
        if (!files) return;
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const maxSize = 10 * 1024 * 1024;
        Array.from(files).forEach((file) => {
            if (!allowedTypes.includes(file.type)) { alert(`${file.name} không phải định dạng hợp lệ`); return; }
            if (file.size > maxSize) { alert(`${file.name} vượt quá 10MB`); return; }
            const previewUrl = URL.createObjectURL(file);
            setEventForm((prev) => ({
                ...prev,
                images: [...prev.images, { id: null, url: previewUrl, file }],
            }));
        });
    };

    const handleDeleteImage = (index: number) => {
        const img = eventForm.images[index];

        setEventForm((prev) => {
            const newDeletedIds = img.id
                ? [...prev.deletedImageIds, img.id]
                : prev.deletedImageIds;

            if (!img.id) URL.revokeObjectURL(img.url);

            return {
                ...prev,
                deletedImageIds: newDeletedIds,
                images: prev.images.filter((_, i) => i !== index),
            };
        });
    };

    const handleActorFileChange = (file: File, index: number) => {
        updateActor(index, "image", file);
        const previewUrl = URL.createObjectURL(file);
        setEventForm((prev) => {
            const updated = [...prev.actorUrls];
            updated[index] = previewUrl;
            return { ...prev, actorUrls: updated };
        });
    };

    const flushUploads = async () => {
        let finalBannerUrl = eventForm.bannerUrl || "";
        if (eventForm.bannerFile) {
            if (mode === "edit" && eventId) {
                const res = await dispatch(fetchUpdateEventBanner({ eventId, file: eventForm.bannerFile })).unwrap();
                finalBannerUrl = res.url;
            } else {
                finalBannerUrl = await dispatch(fetchUpload({ folder: "events/banners", file: eventForm.bannerFile })).unwrap();
            }
            URL.revokeObjectURL(eventForm.bannerUrl!);
        }

        if (mode === "edit" && eventId && eventForm.deletedImageIds.length > 0) {
            await Promise.all(
                eventForm.deletedImageIds.map((imageId) =>
                    dispatch(fetchDeleteImage({ eventId, imageId })).unwrap()
                )
            );
        }

        const updatedImages = await Promise.all(
            eventForm.images.map(async (img) => {
                if (!img.file) return img;

                URL.revokeObjectURL(img.url);

                if (mode === "edit" && eventId) {
                    const res = await dispatch(fetchCreateImage({ eventId, file: img.file })).unwrap();
                    return { id: res.id, url: res.imageUrl, file: null };
                } else {
                    const url = await dispatch(fetchUpload({ folder: "events/images", file: img.file })).unwrap();
                    return { id: null, url, file: null };
                }
            })
        );

        const updatedActorUrls = await Promise.all(
            eventForm.actors.map(async (actor, index) => {
                if (!actor.image) return eventForm.actorUrls[index] ?? "";
                const url = await dispatch(fetchUpload({ folder: "events/actors", file: actor.image })).unwrap();
                return url;
            })
        );

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
        if (mode === "edit" && eventId) {
            if (!isChanged) {
                onNext?.();
                return;
            }
        }

        if (!validateAll()) return;
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
                    notify.success("Đã lưu thông tin sự kiện");
                }
                onNext?.();
            }
        } catch {
            notify.error(mode === "create" ? "Không thể tạo sự kiện" : "Không thể cập nhật sự kiện");
        }
    };

    useEffect(() => {
        const delay = setTimeout(async () => {
            if (!hashtagInput.trim()) { setSuggestions([]); return; }
            try {
                const res = await dispatch(fetchAllHashtags({ name: hashtagInput, take: 5 })).unwrap();
                console.log("Fetched hashtag suggestions:", res);
                setSuggestions(res);
            } catch (e) { console.error(e); }
        }, 300);
        return () => clearTimeout(delay);
    }, [hashtagInput]);

    useEffect(() => {
        const delay = setTimeout(async () => {
            if (!categoryInput.trim()) { setCategorySuggestions([]); return; }
            try {
                const res = await dispatch(fetchAllCategories({ name: categoryInput, take: 10 })).unwrap();
                setCategorySuggestions(res.data);
            } catch (err) { console.error(err); }
        }, 300);
        return () => clearTimeout(delay);
    }, [categoryInput]);

    useEffect(() => {
        if (mode === "create") {
            setEventForm((prev) => ({
                ...prev,
                actors: prev.actors.length
                    ? prev.actors
                    : [{ name: "", major: "", image: null }],
            }));
        }

        else if (mode === "edit" && eventData) {
            const form: EventFormState = {
                title: eventData.title ?? "",
                description: eventData.description ?? "",
                location: eventData.location ?? "",
                bannerUrl: eventData.bannerUrl ?? null,

                selectedHashtags: eventData.hashtags ?? [],
                selectedCategories: eventData.categories ?? [],

                actorUrls: eventData.actorImages?.map((a) => a.image) ?? [],

                images:
                    eventData.images?.map((img) => ({
                        id: img.id,
                        url: img.imageUrl,
                    })) ?? [],

                actors:
                    eventData.actorImages?.map((actor) => ({
                        name: actor.name,
                        major: actor.major,
                        image: null,
                    })) ?? [],

                deletedImageIds: [],
                bannerFile: null,
            };

            setEventForm(form);
            setInitEventForm(form);
        }
    }, [mode, eventData]);

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

                <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                    <h3 className="font-semibold text-white mb-4">* Hình ảnh sự kiện</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            {eventForm.bannerUrl ? (
                                <ImagePreviewBox
                                    imageUrl={eventForm.bannerUrl}
                                    aspect="16/9"
                                    onUpdate={(file) => handleBannerChange(file)}
                                />
                            ) : (
                                <UploadBox
                                    label="Banner ngang (16:9)"
                                    aspect="16/9"
                                    file={null}
                                    error={!!errors.bannerUrl}
                                    onChange={(file) => { if (file) handleBannerChange(file); }}
                                />
                            )}
                            {errors.bannerUrl && <p className="text-xs text-red-400 mt-1">{errors.bannerUrl}</p>}
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm text-slate-400">Ảnh bổ sung sự kiện</label>
                            <div className="flex flex-wrap gap-3">

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

                                {eventForm.images.map((img, i) => (
                                    <ImagePreviewBox
                                        key={img.id ?? `new-${i}`}
                                        imageUrl={img.url}
                                        square
                                        className="w-24"
                                        onRemove={() => handleDeleteImage(i)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                    <h3 className="font-semibold text-white">* Thông tin cơ bản</h3>

                    <div>
                        <label className="text-sm text-slate-400">Tên sự kiện</label>
                        <input
                            className={`mt-2 w-full rounded-xl bg-black/30 border px-4 py-3 text-white ${errors.title ? "border-red-500" : "border-white/10"}`}
                            placeholder="Hội thảo FA - Tìm kiếm cơ hội..."
                            value={eventForm.title}
                            onChange={(e) => updateForm("title", e.target.value)}
                        />
                        {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm text-slate-400">Hashtag</label>
                                {hashtagInput.trim() && <span className="text-xs text-slate-500">{suggestions.length} results</span>}
                            </div>
                            <div className={`mt-2 flex flex-wrap gap-2 p-2 rounded-xl bg-black/30 border ${errors.selectedHashtags ? "border-red-500" : "border-white/10"}`}>
                                {eventForm.selectedHashtags.map((tag) => (
                                    <div key={tag.id} className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-white font-semibold rounded-full text-sm hover:bg-primary/30 transition-colors">
                                        <span>#{tag.name}</span>
                                        <button onClick={() => removeHashtag(tag.id)} className="leading-none"><FiX size={14} /></button>
                                    </div>
                                ))}
                                <input
                                    value={hashtagInput}
                                    onChange={(e) => setHashtagInput(e.target.value)}
                                    onKeyDown={handleHashtagEnter}
                                    className="flex-1 bg-transparent outline-none border-none focus:outline-none focus:ring-0 text-white px-2 py-1 min-w-[120px]"
                                    placeholder="#AI #Tech"
                                />
                            </div>
                            {errors.selectedHashtags && <p className="text-xs text-red-400 mt-1">{errors.selectedHashtags}</p>}
                            {hashtagInput.trim() && (suggestions.length > 0 || showCreateOption) && (
                                <div className="mt-2 bg-[#140f2a] border border-white/10 rounded-lg overflow-hidden">
                                    {suggestions.map((tag) => (
                                        <div key={tag.id} onClick={() => addHashtag(tag)} className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-white">
                                            #{tag.name}
                                        </div>
                                    ))}
                                    {showCreateOption && (
                                        <>
                                            {suggestions.length > 0 && <div className="border-t border-white/5" />}
                                            <div
                                                onClick={() => setShowCreateHashtagModal(true)}
                                                className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 cursor-pointer group"
                                            >
                                                <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                                                    Không có hashtag này, bạn có muốn tạo mới?
                                                </span>
                                                <span className="ml-3 flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 group-hover:bg-primary/40 flex items-center justify-center transition-colors">
                                                    <FiPlus size={13} className="text-primary" />
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div ref={categoryRef} className="relative">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-slate-400">Thể loại</label>
                            </div>

                            {/* Tags đã chọn */}
                            {eventForm.selectedCategories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {eventForm.selectedCategories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-white font-semibold rounded-full text-sm hover:bg-primary/30 transition-colors"
                                        >
                                            <span>{cat.name}</span>
                                            <button
                                                onClick={() => removeCategory(cat.id)}
                                                className="leading-none"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Trigger button */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCategoryOpen((prev) => !prev);
                                    setCategoryInput("");
                                    setCategorySuggestions([]);
                                }}
                                className={`
            w-full flex items-center justify-between
            px-4 py-3 rounded-xl
            bg-black/30 border text-left
            transition-colors
            ${errors.selectedCategories ? "border-red-500" : isCategoryOpen ? "border-primary/60" : "border-white/10"}
        `}
                            >
                                <span className="text-sm text-slate-400">
                                    {eventForm.selectedCategories.length > 0
                                        ? `${eventForm.selectedCategories.length} thể loại đã chọn`
                                        : "Chọn thể loại..."}
                                </span>
                                <FiChevronDown
                                    size={16}
                                    className={`text-slate-400 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {errors.selectedCategories && (
                                <p className="text-xs text-red-400 mt-1">{errors.selectedCategories}</p>
                            )}

                            {/* Dropdown */}
                            {isCategoryOpen && (
                                <div className="absolute z-20 top-full mt-1 w-full rounded-xl bg-[#1a1330] border border-white/10 shadow-2xl overflow-hidden">
                                    {/* Search input */}
                                    <div className="p-2 border-b border-white/8">
                                        <input
                                            autoFocus
                                            value={categoryInput}
                                            onChange={(e) => setCategoryInput(e.target.value)}
                                            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-1 focus:ring-primary/40"
                                            placeholder="Tìm thể loại..."
                                        />
                                    </div>

                                    {/* Options */}
                                    <div className="max-h-48 overflow-y-auto">
                                        {categorySuggestions.length > 0 ? (
                                            categorySuggestions.map((cat) => {
                                                const isSelected = eventForm.selectedCategories.some((c) => c.id === cat.id);
                                                return (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => {
                                                            addCategory(cat);
                                                        }}
                                                        className={`
                                    flex items-center justify-between
                                    px-4 py-2.5 cursor-pointer text-sm
                                    transition-colors
                                    ${isSelected
                                                                ? "bg-primary/15 text-primary"
                                                                : "text-white hover:bg-white/5"}
                                `}
                                                    >
                                                        <span>{cat.name}</span>
                                                        {isSelected && (
                                                            <span className="text-xs font-semibold text-primary/80">✓</span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="px-4 py-4 text-sm text-slate-500 text-center">
                                                {categoryInput.trim()
                                                    ? "Không tìm thấy thể loại nào"
                                                    : "Gõ để tìm kiếm thể loại"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400">Địa điểm tổ chức</label>
                        <input
                            className={`mt-2 w-full rounded-xl bg-black/30 border px-4 py-3 text-white ${errors.location ? "border-red-500" : "border-white/10"}`}
                            placeholder="FPT University, Khu CNC Quận 9"
                            value={eventForm.location}
                            onChange={(e) => updateForm("location", e.target.value)}
                        />
                        {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
                    </div>
                </section>

                <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                    <h3 className="font-semibold text-white mb-4">* Mô tả sự kiện</h3>
                    <textarea
                        className={`w-full min-h-[200px] rounded-xl bg-black/30 border px-4 py-3 text-white ${errors.description ? "border-red-500" : "border-white/10"}`}
                        placeholder="Giới thiệu sự kiện..."
                        value={eventForm.description}
                        onChange={(e) => updateForm("description", e.target.value)}
                    />
                    {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                </section>

                <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-white">* Diễn giả / Khách mời</h3>
                        <button type="button" onClick={addActor} className="px-4 py-2 rounded-lg bg-primary text-sm">
                            + Thêm diễn giả
                        </button>
                    </div>

                    {eventForm.actors.length === 0 && (
                        <>
                            <p className="text-sm text-slate-400">Chưa có diễn giả nào</p>
                            {errors.actors?.[0]?.name && <p className="text-xs text-red-400 mt-1">{errors.actors[0].name}</p>}
                        </>
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
                                            onUpdate={(file) => handleActorFileChange(file, index)}
                                        />
                                    ) : (
                                        <div>
                                            <UploadBox
                                                label="Ảnh" aspect="1/1" file={actor.image} error={!!actorErrors?.image} square
                                                onChange={(file) => {
                                                    if (file) handleActorFileChange(file, index);
                                                    else updateActor(index, "image", null);
                                                }}
                                            />
                                            {actorErrors.image && <p className="text-xs text-red-400 mt-1">{actorErrors.image}</p>}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div>
                                            <input
                                                value={actor.name}
                                                onChange={(e) => updateActor(index, "name", e.target.value)}
                                                className={`w-full rounded-xl bg-black/30 border px-4 py-3 text-white ${actorErrors.name ? "border-red-500" : "border-white/10"}`}
                                                placeholder="Tên diễn giả"
                                            />
                                            {actorErrors.name && <p className="text-xs text-red-400 mt-1">{actorErrors.name}</p>}
                                        </div>
                                        <div>
                                            <input
                                                value={actor.major}
                                                onChange={(e) => updateActor(index, "major", e.target.value)}
                                                className={`w-full rounded-xl bg-black/30 border px-4 py-3 text-white ${actorErrors.major ? "border-red-500" : "border-white/10"}`}
                                                placeholder="Chuyên môn (AI Engineer, CEO, Ca sĩ, Nghệ sĩ...)"
                                            />
                                            {actorErrors.major && <p className="text-xs text-red-400 mt-1">{actorErrors.major}</p>}
                                        </div>
                                    </div>

                                    <button onClick={() => removeActor(index)} className="text-red-400 text-sm hover:underline">Xóa</button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <div className="flex justify-end pt-6">
                    <button onClick={handleNext} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold">
                        {mode === "create" ? "Tạo sự kiện" : isChanged ? "Lưu và Tiếp tục →" : "Tiếp theo →"}
                    </button>
                </div>
            </div>
        </>
    );
}