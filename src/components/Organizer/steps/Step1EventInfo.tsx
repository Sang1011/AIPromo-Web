import { useEffect, useState } from "react";
import UploadBox from "../shared/UploadBox";
import type { AppDispatch } from "../../../store";
import { useDispatch } from "react-redux";
import { fetchUpload } from "../../../store/eventSlice";

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
    const [hashtags, setHashtags] = useState<string>("");
    const [categories, setCategories] = useState<string>("");
    const dispatch = useDispatch<AppDispatch>();

    const handleUpload = (type: "banner" | "actors" | "images", file: File) => {
        const bannerUrl = "events/banners";
        const actorUrl = "events/actors";
        const imageUrl = "events/images";
        let folder = "";

        switch (type) {
            case "banner":
                folder = bannerUrl;
                dispatch(fetchUpload({ folder, file })).then((response) => {
                    // const url = response.payload.url;
                });
                break;
            case "actors":
                folder = actorUrl;
                break;
            case "images":
                folder = imageUrl;
                break;
        }
    }

    const handleCreateEvent = () => {

    }

    const handleUpdateEvent = () => {
        // fetch thông tin event cần edit rồi set vào các state tương ứng
    }


    useEffect(() => {
        console.log(ifCreateEvent);
        if (ifCreateEvent) {
            setActors([{ name: "", major: "", image: null }]);
        }
    }, [ifCreateEvent]);

    // nếu là tạo mới thì set sẵn 1 actor để người dùng điền thông tin luôn, còn edit thì để trống
    // nếu là edit thì có sẵn các field do fetch từ 1 event cụ thể, còn create thì để trống hết và user tự điền vào

    const handleExtraImages = (files: FileList | null) => {
        if (!files) return;
        setExtraImages((prev) => [...prev, ...Array.from(files)]);
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

            {/* ================= Hình ảnh sự kiện ================= */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex justify-between mb-4">
                    <h3 className="font-semibold text-white">
                        * Hình ảnh sự kiện
                    </h3>|
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Banner ngang */}
                    <UploadBox
                        label="Banner ngang (16:9)"
                        aspect="16/9"
                        file={bannerHorizontal}
                        onChange={setBannerHorizontal}
                    />

                    {/* Ảnh bổ sung */}
                    <div className="space-y-3">
                        <label className="text-sm text-slate-400">
                            Ảnh bổ sung sự kiện
                        </label>

                        <div className="flex flex-wrap gap-3">

                            {/* Add image */}
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

                            {/* Images */}
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

            {/* ================= Thông tin cơ bản ================= */}
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
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Hashtag (thay Hình thức tổ chức) */}
                    <div>
                        <label className="text-sm text-slate-400">
                            Hashtag
                        </label>
                        <input
                            className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                            placeholder="#AI #Workshop #Tech"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-400">
                            Thể loại
                        </label>
                        <select className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white">
                            <option>Hội thảo & Workshop</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-sm text-slate-400">
                        Địa điểm tổ chức
                    </label>
                    <input
                        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                        placeholder="FPT University, Khu CNC Quận 9"
                    />
                </div>
            </section>

            {/* ================= Nội dung sự kiện ================= */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <h3 className="font-semibold text-white mb-4">
                    * Nội dung sự kiện
                </h3>

                <textarea
                    className="w-full min-h-[200px] rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                    placeholder="Giới thiệu sự kiện..."
                />
            </section>

            {/* ================= Ban tổ chức ================= */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <h3 className="font-semibold text-white mb-4">
                    Ban tổ chức
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
                    <UploadBox
                        label="Logo BTC"
                        aspect="1/1"
                        file={orgLogo}
                        onChange={setOrgLogo}
                        square
                    />

                    <div className="space-y-4">
                        <input
                            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                            placeholder="Tên ban tổ chức"
                        />
                        <textarea
                            className="w-full min-h-[120px] rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                            placeholder="Mô tả ban tổ chức"
                        />
                    </div>
                </div>
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
                            <UploadBox
                                label="Ảnh"
                                aspect="1/1"
                                file={actor.image}
                                onChange={(file) => updateActor(index, "image", file)}
                                square
                            />

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
            <div className="flex justify-between pt-6">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 rounded-xl border border-white/10 text-slate-400"
                >
                    Hủy thay đổi
                </button>

                <button
                    onClick={onNext}
                    className="px-6 py-3 rounded-xl bg-primary text-white font-semibold"
                >
                    Tiếp theo →
                </button>
            </div>
        </div>
    );
}