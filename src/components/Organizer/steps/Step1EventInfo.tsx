import { useEffect, useRef, useState } from "react";
import UploadBox from "../shared/UploadBox";
import type { AppDispatch } from "../../../store";
import { useDispatch } from "react-redux";
import {
    fetchCreateEvent,
    fetchUpdateEvent,
    fetchUpload,
    fetchUpdateEventBanner,
    fetchUpdateImage,
    fetchDeleteImage,
} from "../../../store/eventSlice";
import { fetchAllCategories } from "../../../store/categorySlice";
import { fetchAllHashtags, fetchCreateHashtag } from "../../../store/hashtagSlice";
import type {
    CreateEventRequest,
    EventCategory,
    EventHashtag,
    UpdateEventInfoRequest,
} from "../../../types/event/event";
import { useParams } from "react-router-dom";
import ImagePreviewBox from "../shared/ImagePreviewBox";
import { FiPlus, FiX } from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step1EventInfoProps {
    onNext?: () => void;
    onCancel?: () => void;
    mode?: "create" | "edit";
    onCreated?: (eventId: string) => void;
}

interface Actor {
    name: string;
    major: string;
    image: File | null;
}

/**
 * id = string  → ảnh đã có trên server, cho phép delete & update
 * id = null    → ảnh vừa upload, chỉ hiển thị (không có nút X / Cập nhật)
 */
interface EventImage {
    id: string | null;
    url: string;
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

// ─── Create Hashtag Modal ─────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Step1EventInfo({ onNext, onCancel, mode = "edit", onCreated }: Step1EventInfoProps) {
    const [hashtagInput, setHashtagInput] = useState("");
    const [suggestions, setSuggestions] = useState<EventHashtag[]>([]);
    const [showCreateHashtagModal, setShowCreateHashtagModal] = useState(false);
    const [categoryInput, setCategoryInput] = useState("");
    const [categorySuggestions, setCategorySuggestions] = useState<EventCategory[]>([]);
    const [isSelectingCategory, setIsSelectingCategory] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();

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
    });

    const updateForm = <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
        setEventForm((prev) => ({ ...prev, [key]: value }));
    };

    const buildEventPayload = (): UpdateEventInfoRequest => ({
        title: eventForm.title,
        bannerUrl: eventForm.bannerUrl || "",
        description: eventForm.description,
        location: eventForm.location,
        mapUrl: "",
        hashtagIds: eventForm.selectedHashtags.map((tag) => tag.id),
        categoryIds: eventForm.selectedCategories.map((cat) => cat.id),
        actorImages: eventForm.actors.map((actor, index) => ({
            name: actor.name,
            major: actor.major,
            image: eventForm.actorUrls[index] || "",
        })),
        imageUrls: eventForm.images.map((img) => img.url),
    });

    // ── Validation ────────────────────────────────────────────────────────────

    const validateAll = (): boolean => {
        const newErrors: FormErrors = {};
        if (!eventForm.bannerUrl) newErrors.bannerUrl = "Banner là bắt buộc";
        if (!eventForm.title.trim()) newErrors.title = "Tên sự kiện không được để trống";
        else if (eventForm.title.length < 5) newErrors.title = "Tên sự kiện tối thiểu 5 ký tự";
        else if (eventForm.title.length > 150) newErrors.title = "Tên sự kiện tối đa 150 ký tự";
        if (!eventForm.description.trim()) newErrors.description = "Mô tả sự kiện không được để trống";
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

    // ── Hashtag ───────────────────────────────────────────────────────────────

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

    // ── Category ──────────────────────────────────────────────────────────────

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

    // ── Actor ─────────────────────────────────────────────────────────────────

    const addActor = () => updateForm("actors", [...eventForm.actors, { name: "", major: "", image: null }]);

    const removeActor = (index: number) => updateForm("actors", eventForm.actors.filter((_, i) => i !== index));

    const updateActor = (index: number, field: "name" | "major" | "image", value: string | File | null) => {
        updateForm("actors", eventForm.actors.map((actor, i) => i === index ? { ...actor, [field]: value } : actor));
    };

    // ── Image actions ─────────────────────────────────────────────────────────

    /**
     * Banner:
     * - create → upload rồi set url
     * - edit   → gọi updateEventBanner API
     */
    const handleBannerChange = (file: File) => {
        if (mode === "create" || !eventId) {
            dispatch(fetchUpload({ folder: "events/banners", file }))
                .unwrap()
                .then((url) => updateForm("bannerUrl", url))
                .catch(console.error);
        } else {
            dispatch(fetchUpdateEventBanner({ eventId, file }))
                .unwrap()
                .then(({ url }) => updateForm("bannerUrl", url))
                .catch(console.error);
        }
    };

    /**
     * Thêm ảnh bổ sung mới → upload → push vào images với id = null.
     * Ảnh id=null chỉ hiển thị, không có nút X / Cập nhật.
     */
    const handleAddImages = (files: FileList | null) => {
        if (!files) return;
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const maxSize = 10 * 1024 * 1024;
        Array.from(files).forEach((file) => {
            if (!allowedTypes.includes(file.type)) { alert(`${file.name} không phải định dạng hợp lệ`); return; }
            if (file.size > maxSize) { alert(`${file.name} vượt quá 10MB`); return; }
            dispatch(fetchUpload({ folder: "events/images", file }))
                .unwrap()
                .then((url) => {
                    setEventForm((prev) => ({
                        ...prev,
                        images: [...prev.images, { id: null, url }],
                    }));
                })
                .catch(console.error);
        });
    };

    /**
     * Cập nhật ảnh bổ sung — chỉ gọi khi ảnh có id (từ API).
     */
    const handleUpdateImage = (index: number, file: File) => {
        const img = eventForm.images[index];
        if (!img.id || !eventId) return;
        dispatch(fetchUpdateImage({ eventId, imageId: img.id, file }))
            .unwrap()
            .then(({ url }) => {
                setEventForm((prev) => ({
                    ...prev,
                    images: prev.images.map((item, i) => i === index ? { ...item, url } : item),
                }));
            })
            .catch(console.error);
    };

    /**
     * Xoá ảnh bổ sung — chỉ gọi khi ảnh có id (từ API).
     */
    const handleDeleteImage = (index: number) => {
        const img = eventForm.images[index];
        if (!img.id || !eventId) return;
        dispatch(fetchDeleteImage({ eventId, imageId: img.id }))
            .unwrap()
            .then(() => {
                setEventForm((prev) => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== index),
                }));
            })
            .catch(console.error);
    };

    /** Upload ảnh actor */
    const handleUploadActor = (file: File, index: number) => {
        dispatch(fetchUpload({ folder: "events/actors", file }))
            .unwrap()
            .then((url) => {
                setEventForm((prev) => {
                    const updated = [...prev.actorUrls];
                    updated[index] = url;
                    return { ...prev, actorUrls: updated };
                });
            })
            .catch(console.error);
    };

    // ── Event CRUD ────────────────────────────────────────────────────────────

    const handleCreateEvent = async () => {
        const testObjectCreate: CreateEventRequest = {
            title: "Test Event AI Conference",
            bannerUrl: "https://example.com/banner.jpg",
            hashtagIds: [1],
            actorImages: [
                { name: "Nguyễn Văn A", major: "AI Engineer", image: "https://example.com/actor1.jpg" },
                { name: "Trần Thị B", major: "CEO", image: "https://example.com/actor2.jpg" },
            ],
            description: "Đây là sự kiện test tạo event bằng API",
            location: "FPT University HCM",
            mapUrl: "",
            categoryIds: [1],
            organizerId: "a1c7799a-2bfd-4d94-801c-5d44bdfe6822",
            imageUrls: ["https://example.com/image1.jpg"],
        };
        // const objectCreate: CreateEventRequest = buildEventPayload();
        try {
            const res = await dispatch(fetchCreateEvent(testObjectCreate)).unwrap();
            if (mode === "create") onCreated?.(res.data.id);
        } catch (err) {
            console.error("Failed to create event:", err);
        }
    };

    const handleUpdateEvent = async () => {
        if (!eventId) return;
        try {
            await dispatch(fetchUpdateEvent({ id: eventId, data: buildEventPayload() })).unwrap();
        } catch (err) {
            console.error("Failed to update event:", err);
        }
    };

    const fetchEventData = async () => {
        if (!eventId) return;
        try {
            // const res = await dispatch(fetchEventById(eventId)).unwrap();
            const eventData = {
                title: "AI Conference 2026",
                bannerUrl: "https://picsum.photos/800/450",
                location: "FPT University HCM",
                description: "Sự kiện về AI và công nghệ tương lai.",
                categories: [{ id: 1, name: "Technology" }, { id: 2, name: "AI" }],
                hashtags: [{ id: 1, name: "AI" }, { id: 2, name: "Tech" }],
                images: [
                    { id: "img1", imageUrl: "https://picsum.photos/200" },
                    { id: "img2", imageUrl: "https://picsum.photos/201" },
                ],
                actorImages: [
                    { id: "actor1", name: "Nguyễn Văn A", major: "AI Engineer", image: "https://picsum.photos/100" },
                    { id: "actor2", name: "Trần Thị B", major: "CEO", image: "https://picsum.photos/101" },
                ],
            };
            setEventForm((prev) => ({
                ...prev,
                title: eventData.title,
                description: eventData.description,
                location: eventData.location,
                bannerUrl: eventData.bannerUrl,
                selectedHashtags: eventData.hashtags || [],
                selectedCategories: eventData.categories || [],
                actorUrls: (eventData.actorImages || []).map((a) => a.image),
                // id có giá trị → cho phép delete & update
                images: (eventData.images || []).map((img) => ({ id: img.id, url: img.imageUrl })),
                actors: (eventData.actorImages || []).map((actor) => ({ name: actor.name, major: actor.major, image: null })),
            }));
        } catch (err) {
            console.error("Failed to fetch event data:", err);
        }
    };

    const handleFetchStartupData = async () => {
        try {
            await dispatch(fetchAllCategories({ take: 20 })).unwrap();
        } catch (error) {
            console.error(error);
        }
    };

    const handleNext = () => {
        if (!validateAll()) return;
        if (mode === "create") { handleCreateEvent(); return; }
        if (mode === "edit") { handleUpdateEvent(); onNext?.(); }
    };

    // ── Effects ───────────────────────────────────────────────────────────────

    useEffect(() => {
        const delay = setTimeout(async () => {
            if (!hashtagInput.trim()) { setSuggestions([]); return; }
            try {
                const res = await dispatch(fetchAllHashtags({ name: hashtagInput, take: 10 })).unwrap();
                setSuggestions(res.data);
            } catch (e) { console.error(e); }
        }, 300);
        return () => clearTimeout(delay);
    }, [hashtagInput]);

    useEffect(() => {
        if (isSelectingCategory) { setIsSelectingCategory(false); return; }
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
        if (mode === "create") updateForm("actors", [{ name: "", major: "", image: null }]);
    }, [mode]);

    useEffect(() => {
        handleFetchStartupData();
        if (mode === "edit") fetchEventData();
    }, []);

    // ── Render ────────────────────────────────────────────────────────────────

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

                {/* ── Hình ảnh sự kiện ──────────────────────────────────── */}
                <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                    <h3 className="font-semibold text-white mb-4">* Hình ảnh sự kiện</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Banner — không có onRemove, chỉ có onUpdate */}
                        <div className="space-y-1">
                            {eventForm.bannerUrl ? (
                                <ImagePreviewBox
                                    imageUrl={eventForm.bannerUrl}
                                    aspect="16/9"
                                    onUpdate={(file) => handleBannerChange(file)}
                                // onRemove không truyền → không có nút X
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

                        {/* Ảnh bổ sung */}
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
                                        // id có giá trị → truyền onRemove & onUpdate
                                        // id = null    → không truyền → chỉ xem, không X, không cập nhật
                                        onRemove={img.id ? () => handleDeleteImage(i) : undefined}
                                        onUpdate={img.id ? (file) => handleUpdateImage(i, file) : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Thông tin cơ bản ──────────────────────────────────── */}
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

                        {/* Hashtag */}
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm text-slate-400">Hashtag</label>
                                {hashtagInput.trim() && <span className="text-xs text-slate-500">{suggestions.length} results</span>}
                            </div>
                            <div className={`mt-2 flex flex-wrap gap-2 p-2 rounded-xl bg-black/30 border ${errors.selectedHashtags ? "border-red-500" : "border-white/10"}`}>
                                {eventForm.selectedHashtags.map((tag) => (
                                    <div key={tag.id} className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-white font-semibold rounded-full text-sm">
                                        <span>#{tag.name}</span>
                                        <button onClick={() => removeHashtag(tag.id)} className="leading-none"><FiX size={12} /></button>
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

                        {/* Category */}
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm text-slate-400">Thể loại</label>
                                {categoryInput.trim() && <span className="text-xs text-slate-500">{categorySuggestions.length} results</span>}
                            </div>
                            <div className={`mt-2 flex flex-wrap gap-2 p-2 rounded-xl bg-black/30 border ${errors.selectedCategories ? "border-red-500" : "border-white/10"}`}>
                                {eventForm.selectedCategories.map((cat) => (
                                    <div key={cat.id} className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-white font-semibold rounded-full text-sm">
                                        <span>{cat.name}</span>
                                        <button onClick={() => removeCategory(cat.id)} className="leading-none"><FiX size={12} /></button>
                                    </div>
                                ))}
                                <input
                                    value={categoryInput}
                                    onChange={(e) => setCategoryInput(e.target.value)}
                                    className="flex-1 bg-transparent outline-none border-none focus:outline-none focus:ring-0 text-white px-2 py-1 min-w-[120px]"
                                    placeholder="Gõ để tìm thể loại..."
                                />
                            </div>
                            {errors.selectedCategories && <p className="text-xs text-red-400 mt-1">{errors.selectedCategories}</p>}
                            {categorySuggestions.length > 0 && (
                                <div className="mt-2 bg-[#140f2a] border border-white/10 rounded-lg overflow-hidden">
                                    {categorySuggestions.map((cat) => (
                                        <div key={cat.id} onClick={() => addCategory(cat)} className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-white">
                                            {cat.name}
                                        </div>
                                    ))}
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

                {/* ── Mô tả ─────────────────────────────────────────────── */}
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

                {/* ── Diễn giả ──────────────────────────────────────────── */}
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
                                    {/* Actor image — không có onRemove / onUpdate (không có API) */}
                                    {eventForm.actorUrls[index] && !actor.image ? (
                                        <ImagePreviewBox
                                            imageUrl={eventForm.actorUrls[index]}
                                            square
                                        // Không truyền gì → chỉ xem
                                        />
                                    ) : (
                                        <div>
                                            <UploadBox
                                                label="Ảnh" aspect="1/1" file={actor.image} error={!!actorErrors?.image} square
                                                onChange={(file) => {
                                                    updateActor(index, "image", file);
                                                    if (file) handleUploadActor(file, index);
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

                                    <button onClick={() => removeActor(index)} className="text-red-400 text-sm">Xóa</button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <div className="flex justify-end pt-6">
                    <button onClick={handleNext} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold">
                        {mode === "create" ? "Tạo sự kiện" : "Tiếp theo →"}
                    </button>
                </div>
            </div>
        </>
    );
}