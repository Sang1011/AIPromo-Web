import { useEffect, useState } from "react";
import UploadBox from "../shared/UploadBox";
import type { AppDispatch } from "../../../store";
import { useDispatch } from "react-redux";
import { fetchCreateEvent, fetchEventById, fetchUpdateEvent, fetchUpload } from "../../../store/eventSlice";
import { fetchAllCategories } from "../../../store/categorySlice";
import { fetchAllHashtags, fetchCreateHashtag } from "../../../store/hashtagSlice";
import type { Hashtag } from "../../../types/hashtag/hashtag";
import type { Category } from "../../../types/category/category";
import type { ActorImage, CreateEventRequest, EventCategory, EventHashtag, EventImage, UpdateEventInfoRequest } from "../../../types/event/event";
import { useParams } from "react-router-dom";
import ImagePreviewBox from "../shared/ImagePreviewBox";

interface Step1EventInfoProps {
    onNext: () => void;
    onCancel: () => void;
}

interface Actor {
    name: string;
    major: string;
    image: File | null;
}

export default function Step1EventInfo({
    onNext,
    onCancel,
}: Step1EventInfoProps) {
    const [bannerHorizontal, setBannerHorizontal] = useState<File | null>(null);
    const [orgLogo, setOrgLogo] = useState<File | null>(null);
    const [extraImages, setExtraImages] = useState<File[]>([]);
    const [actors, setActors] = useState<Actor[]>([]);
    const ifCreateEvent = window.location.pathname === "/organizer/create-event";
    const [hashtagInput, setHashtagInput] = useState("");
    const [selectedHashtags, setSelectedHashtags] = useState<EventHashtag[]>([]);
    const [suggestions, setSuggestions] = useState<EventHashtag[]>([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [categorySuggestions, setCategorySuggestions] = useState<EventCategory[]>([]);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [actorUrls, setActorUrls] = useState<string[]>([]);
    const [imagesUrl, setImagesUrl] = useState<string[]>([]);
    const [isSelectingCategory, setIsSelectingCategory] = useState(false);
    const [categories, setCategories] = useState<EventCategory[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [title, setTitle] = useState("");
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();


    const addHashtag = (tag: EventHashtag) => {
        if (selectedHashtags.some(t => t.id === tag.id)) return;

        setSelectedHashtags(prev => [...prev, tag]);
        setHashtagInput("");
        setSuggestions([]);
    };

    const removeHashtag = (id: number) => {
        setSelectedHashtags(prev => prev.filter(t => t.id !== id));
    };

    const handleHashtagEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;

        e.preventDefault();

        const existing = suggestions.find(
            s => s.name.toLowerCase() === hashtagInput.toLowerCase()
        );

        if (existing) {
            addHashtag(existing);
            return;
        }

        try {
            // const res = await dispatch(
            //     fetchCreateHashtag({
            //         name: hashtagInput
            //     })
            // ).unwrap();

            // addHashtag(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = (
        type: "banner" | "actors" | "images",
        file: File,
        index?: number
    ) => {
        const bannerUrlFolder = "events/banners";
        const actorUrlFolder = "events/actors";
        const imageUrlFolder = "events/images";
        let folder = "";
        switch (type) {
            case "banner":
                folder = bannerUrlFolder;
                break;

            case "actors":
                folder = actorUrlFolder;
                break;

            case "images":
                folder = imageUrlFolder;
                break;
        }

        dispatch(fetchUpload({ folder, file }))
            .unwrap()
            .then((url) => {

                if (type === "banner") {
                    setBannerUrl(url);
                }

                if (type === "actors" && index !== undefined) {
                    setActorUrls(prev => {
                        const updated = [...prev];
                        updated[index] = url;
                        return updated;
                    });
                }

                if (type === "images") {
                    setImagesUrl(prev => [...prev, url]);
                }

            })
            .catch(err => console.error(err));
    };

    const handleCreateEvent = async () => {
        const arrayObjectActors: ActorImage[] = actors.map((actor, index) => ({
            name: actor.name,
            major: actor.major,
            image: actorUrls[index] || ""
        }));

        // Dữ liệu test tạo event
        const testObjectCreate: CreateEventRequest = {
            title: "Test Event AI Conference",
            bannerUrl: "https://example.com/banner.jpg",
            hashtagIds: [1],
            actorImages: [
                {
                    name: "Nguyễn Văn A",
                    major: "AI Engineer",
                    image: "https://example.com/actor1.jpg"
                },
                {
                    name: "Trần Thị B",
                    major: "CEO",
                    image: "https://example.com/actor2.jpg"
                }
            ],
            description: "Đây là sự kiện test tạo event bằng API",
            location: "FPT University HCM",
            mapUrl: "",
            categoryIds: [1],
            organizerId: "a1c7799a-2bfd-4d94-801c-5d44bdfe6822",
            imageUrls: [
                "https://example.com/image1.jpg",
                "https://example.com/image2.jpg"
            ]
        };

        const objectCreate = testObjectCreate;

        // const objectCreate: CreateEventRequest = {
        //     title: title,
        //     bannerUrl: bannerUrl || "",
        //     hashtagIds: selectedHashtags.map(tag => tag.id),
        //     actorImages: arrayObjectActors,
        //     description: description,
        //     location: location,
        //     mapUrl: "",
        //     categoryIds: selectedCategories.map(cat => cat.id),
        //     organizerId: "a1c7799a-2bfd-4d94-801c-5d44bdfe6822",
        //     imageUrls: imagesUrl
        // }

        try {
            const res = await dispatch(
                fetchCreateEvent(objectCreate)
            ).unwrap();
            console.log("Created event:", res.data);
        } catch (err) {
            console.error("Failed to create event:", err);
        }
    }

    const handleUpdateEvent = async () => {
        if (!eventId) return;
        const arrayObjectActors: ActorImage[] = actors.map((actor, index) => ({
            name: actor.name,
            major: actor.major,
            image: actorUrls[index] || ""
        }));

        const objectUpdate: UpdateEventInfoRequest = {
            title: title,
            bannerUrl: bannerUrl || "",
            hashtagIds: selectedHashtags.map(tag => tag.id),
            actorImages: arrayObjectActors,
            description: description,
            location: location,
            mapUrl: "",
            categoryIds: selectedCategories.map(cat => cat.id),
            imageUrls: imagesUrl
        }
        try {
            const res = await dispatch(
                fetchUpdateEvent({
                    id: eventId,
                    data: objectUpdate
                })
            ).unwrap();
            console.log("Updated event:", res.data);
        } catch (err) {
            console.error("Failed to update event:", err);
        }
    }

    const fetchEventData = async () => {
        if (!eventId) return;

        try {

            // const res = await dispatch(
            //     fetchEventById(eventId)
            // ).unwrap();

            // const eventData = res;

            const eventData = {
                id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                organizerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                title: "AI Conference 2026",
                status: "draft",
                bannerUrl: "https://picsum.photos/800/450",
                location: "FPT University HCM",
                mapUrl: "",
                description: "Sự kiện về AI và công nghệ tương lai.",
                urlPath: "ai-conference-2026",

                categories: [
                    { id: 1, name: "Technology" },
                    { id: 2, name: "AI" }
                ],

                hashtags: [
                    { id: 1, name: "AI" },
                    { id: 2, name: "Tech" }
                ],

                images: [
                    {
                        id: "img1",
                        imageUrl: "https://picsum.photos/200"
                    },
                    {
                        id: "img2",
                        imageUrl: "https://picsum.photos/201"
                    }
                ],

                actorImages: [
                    {
                        id: "actor1",
                        name: "Nguyễn Văn A",
                        major: "AI Engineer",
                        image: "https://picsum.photos/100"
                    },
                    {
                        id: "actor2",
                        name: "Trần Thị B",
                        major: "CEO",
                        image: "https://picsum.photos/101"
                    }
                ]
            };

            setTitle(eventData.title);
            setDescription(eventData.description);
            setLocation(eventData.location);
            setBannerUrl(eventData.bannerUrl);

            setSelectedHashtags(eventData.hashtags || []);
            setSelectedCategories(eventData.categories || []);

            setActorUrls(
                (eventData.actorImages || []).map(actor => actor.image)
            );

            setImagesUrl(
                (eventData.images || []).map(img => img.imageUrl)
            );

            setActors(
                (eventData.actorImages || []).map(actor => ({
                    name: actor.name,
                    major: actor.major,
                    image: null
                }))
            );

        } catch (err) {
            console.error("Failed to fetch event data:", err);
        }

    };

    const handleFetchStartupData = async () => {
        try {
            const categoryRes = await dispatch(
                fetchAllCategories({ take: 20 })
            ).unwrap();

            setCategories(categoryRes.data);

        } catch (error) {
            console.error(error);
        }
    };

    const addCategory = (cat: EventCategory) => {
        if (selectedCategories.some(c => c.id === cat.id)) return;

        setSelectedCategories(prev => [...prev, cat]);
        setCategoryInput("");
        setCategorySuggestions([]);
    };

    const removeCategory = (id: number) => {
        setSelectedCategories(prev => prev.filter(c => c.id !== id));
    };

    const handleNext = () => {
        if (ifCreateEvent) {
            handleCreateEvent();
        } else {
            handleUpdateEvent();
        }
        onNext();
    }

    useEffect(() => {
        const delay = setTimeout(async () => {
            if (!hashtagInput.trim()) {
                setSuggestions([]);
                return;
            }

            try {
                const res = await dispatch(
                    fetchAllHashtags({
                        name: hashtagInput,
                        take: 10
                    })
                ).unwrap();

                setSuggestions(res.data);

            } catch (e) {
                console.error(e);
            }

        }, 300);

        return () => clearTimeout(delay);
    }, [hashtagInput]);

    useEffect(() => {

        if (isSelectingCategory) {
            setIsSelectingCategory(false);
            return;
        }

        const delay = setTimeout(async () => {

            if (!categoryInput.trim()) {
                setCategorySuggestions([]);
                return;
            }

            try {

                const res = await dispatch(
                    fetchAllCategories({
                        name: categoryInput,
                        take: 10
                    })
                ).unwrap();

                setCategorySuggestions(res.data);

            } catch (err) {
                console.error(err);
            }

        }, 300);

        return () => clearTimeout(delay);

    }, [categoryInput]);

    useEffect(() => {
        console.log(ifCreateEvent);
        if (ifCreateEvent) {
            setActors([{ name: "", major: "", image: null }]);
        }
    }, [ifCreateEvent]);

    useEffect(() => {
        handleFetchStartupData();
        fetchEventData();
    }, [])

    const handleExtraImages = (files: FileList | null) => {

        if (!files) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
        ];

        const maxSize = 10 * 1024 * 1024;

        const fileArray = Array.from(files);

        const validFiles: File[] = [];

        fileArray.forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                alert(`${file.name} không phải định dạng hợp lệ`);
                return;
            }
            if (file.size > maxSize) {
                alert(`${file.name} vượt quá 10MB`);
                return;
            }
            validFiles.push(file);
        });

        if (validFiles.length === 0) return;

        setExtraImages(prev => [...prev, ...validFiles]);

        validFiles.forEach(file => {
            handleUpload("images", file);
        });

        setExtraImages([]);
    };

    const addActor = () => {
        setActors((prev) => [...prev, { name: "", major: "", image: null }]);
    };

    const removeActor = (index: number) => {
        setActors((prev) => prev.filter((_, i) => i !== index));
    };

    const updateActor = (
        index: number,
        field: "name" | "major" | "image",
        value: string | File | null
    ) => {
        setActors((prev) =>
            prev.map((actor, i) =>
                i === index ? { ...actor, [field]: value } : actor
            )
        );
    };

    return (
        <div className="space-y-8">

            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex justify-between mb-4">
                    <h3 className="font-semibold text-white">
                        * Hình ảnh sự kiện
                    </h3>|
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {bannerUrl && !bannerHorizontal ? (
                        <ImagePreviewBox
                            imageUrl={bannerUrl}
                            aspect="16/9"
                            onRemove={() => setBannerUrl(null)}
                        />
                    ) : (
                        <UploadBox
                            label="Banner ngang (16:9)"
                            aspect="16/9"
                            file={bannerHorizontal}
                            onChange={(file) => {
                                setBannerHorizontal(file);
                                if (file) handleUpload("banner", file);
                            }}
                        />
                    )}

                    <div className="space-y-3">
                        <label className="text-sm text-slate-400">
                            Ảnh bổ sung sự kiện
                        </label>

                        <div className="flex flex-wrap gap-3">

                            <label className="w-24 h-24 cursor-pointer rounded-lg border border-dashed border-white/20 flex items-center justify-center text-slate-400 text-xs text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleExtraImages(e.target.files)}
                                />
                                + Thêm ảnh
                            </label>

                            {imagesUrl.map((url, i) => (
                                <ImagePreviewBox
                                    key={url}
                                    imageUrl={url}
                                    square
                                    className="w-24"
                                    onRemove={() =>
                                        setImagesUrl(prev => prev.filter((_, idx) => idx !== i))
                                    }
                                />
                            ))}

                            {extraImages.map((img, i) => (
                                <UploadBox
                                    key={i}
                                    label=""
                                    aspect="1/1"
                                    file={img}
                                    square
                                    className="w-24"
                                    onChange={(file) => {
                                        if (!file) {
                                            setExtraImages(prev => prev.filter((_, idx) => idx !== i));
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                <h3 className="font-semibold text-white">
                    * Thông tin cơ bản
                </h3>

                <div>
                    <label className="text-sm text-slate-400">
                        Tên sự kiện
                    </label>
                    <input
                        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                        placeholder="Hội thảo FA - Tìm kiếm cơ hội..."
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm text-slate-400">Hashtag</label>

                            {hashtagInput.trim() && (
                                <span className="text-xs text-slate-500">
                                    {suggestions.length} results
                                </span>
                            )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 p-2 rounded-xl bg-black/30 border border-white/10">

                            {selectedHashtags.map(tag => (
                                <div
                                    key={tag.id}
                                    className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-white font-semibold rounded-full text-sm"
                                >
                                    <span>#{tag.name}</span>

                                    <button
                                        onClick={() => removeHashtag(tag.id)}
                                        className="text-xs"
                                    >
                                        ✕
                                    </button>
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

                        {suggestions.length > 0 && (
                            <div className="mt-2 bg-[#140f2a] border border-white/10 rounded-lg overflow-hidden">
                                {suggestions.map(tag => (
                                    <div
                                        key={tag.id}
                                        onClick={() => addHashtag(tag)}
                                        className="px-4 py-2 hover:bg-white/5 cursor-pointer"
                                    >
                                        #{tag.name}
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    <div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm text-slate-400">Thể loại</label>

                            {categoryInput.trim() && (
                                <span className="text-xs text-slate-500">
                                    {categorySuggestions.length} results
                                </span>
                            )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 p-2 rounded-xl bg-black/30 border border-white/10">

                            {selectedCategories.map(cat => (
                                <div
                                    key={cat.id}
                                    className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-white font-semibold rounded-full text-sm"
                                >
                                    <span>{cat.name}</span>

                                    <button
                                        onClick={() => removeCategory(cat.id)}
                                        className="text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            <input
                                value={categoryInput}
                                onChange={(e) => setCategoryInput(e.target.value)}
                                className="flex-1 bg-transparent outline-none border-none focus:outline-none focus:ring-0 text-white px-2 py-1 min-w-[120px]"
                                placeholder="Gõ để tìm thể loại..."
                            />

                        </div>

                        {categorySuggestions.length > 0 && (
                            <div className="mt-2 bg-[#140f2a] border border-white/10 rounded-lg overflow-hidden">
                                {categorySuggestions.map(cat => (
                                    <div
                                        key={cat.id}
                                        onClick={() => addCategory(cat)}
                                        className="px-4 py-2 hover:bg-white/5 cursor-pointer"
                                    >
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="text-sm text-slate-400">
                        Địa điểm tổ chức
                    </label>
                    <input
                        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                        placeholder="FPT University, Khu CNC Quận 9"
                        name="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
            </section>

            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <h3 className="font-semibold text-white mb-4">
                    * Mô tả sự kiện
                </h3>

                <textarea
                    className="w-full min-h-[200px] rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                    placeholder="Giới thiệu sự kiện..."
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </section>

            {/* ================= Diễn giả / Actor ================= */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-white">
                        Diễn giả / Khách mời
                    </h3>

                    <button
                        type="button"
                        onClick={addActor}
                        className="px-4 py-2 rounded-lg bg-primary text-sm"
                    >
                        + Thêm diễn giả
                    </button>
                </div>

                {actors.length === 0 && (
                    <p className="text-sm text-slate-400">
                        Chưa có diễn giả nào
                    </p>
                )}

                <div className="space-y-6">
                    {actors.map((actor, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-4 items-start border border-white/5 p-4 rounded-xl"
                        >
                            {actorUrls[index] && !actor.image ? (
                                <ImagePreviewBox
                                    imageUrl={actorUrls[index]}
                                    square
                                    onRemove={() =>
                                        setActorUrls(prev => prev.filter((_, i) => i !== index))
                                    }
                                />
                            ) : (
                                <UploadBox
                                    label="Ảnh"
                                    aspect="1/1"
                                    file={actor.image}
                                    onChange={(file) => {
                                        updateActor(index, "image", file);
                                        if (file) handleUpload("actors", file, index);
                                    }}
                                    square
                                />
                            )}

                            <div className="space-y-3">
                                <input
                                    value={actor.name}
                                    onChange={(e) =>
                                        updateActor(index, "name", e.target.value)
                                    }
                                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                                    placeholder="Tên diễn giả"
                                />

                                <input
                                    value={actor.major}
                                    onChange={(e) =>
                                        updateActor(index, "major", e.target.value)
                                    }
                                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                                    placeholder="Chuyên môn (AI Engineer, CEO, Ca sĩ, Nghệ sĩ...)"
                                />
                            </div>

                            <button
                                onClick={() => removeActor(index)}
                                className="text-red-400 text-sm"
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= Actions ================= */}
            <div className="flex justify-end pt-6">
                <button
                    onClick={() => handleNext()}
                    className="px-6 py-3 rounded-xl bg-primary text-white font-semibold"
                >
                    Tiếp theo →
                </button>
            </div>
        </div>
    );
}