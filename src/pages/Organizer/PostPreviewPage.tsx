import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { MdOutlineSmartToy } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchPostDetail, clearPostDetail } from "../../store/postSlice";
import type { ContentBlock } from "../../types/post/post";
import PostBlockRenderer from "../../components/Organizer/post/PostBlockRenderer";
import { parseBodyToBlocks } from "../../utils/renderPostContent";
import { injectImageBlock } from "../../utils/injectImageBlock";

export default function PostPreviewPage() {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { postDetail, loading, error } = useSelector((s: RootState) => s.POST);

    useEffect(() => {
        if (postId) dispatch(fetchPostDetail(postId));
        return () => { dispatch(clearPostDetail()); };
    }, [postId, dispatch]);

    const blocks: ContentBlock[] = postDetail
        ? injectImageBlock(parseBodyToBlocks(postDetail.body), postDetail.imageUrl ?? null)
        : [];

    if (loading.fetchDetail) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <p className="text-slate-500 text-sm animate-pulse">Đang tải nội dung...</p>
            </div>
        );
    }

    if (error.fetchDetail || (!loading.fetchDetail && !postDetail)) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="text-center space-y-3">
                    <p className="text-slate-500 text-sm">
                        {error.fetchDetail ?? "Không có nội dung để preview."}
                    </p>
                    <button onClick={() => navigate(-1)} className="text-primary text-sm underline">
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-white">
            <div className="sticky top-0 z-10 bg-[#0B0B12]/90 backdrop-blur
                            border-b border-slate-800 px-6 py-3
                            flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400
                               hover:text-white transition text-sm font-medium"
                >
                    <FiArrowLeft size={16} /> Quay lại chỉnh sửa
                </button>
                <div className="flex items-center gap-2">
                    <MdOutlineSmartToy className="text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">
                        Preview bài đăng
                    </span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="mb-6 flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                    Được tạo bởi AI · {postDetail?.title}
                </div>

                <div className="bg-card-dark border border-slate-800 rounded-3xl p-8 space-y-6">
                    {blocks.length > 0 ? (
                        <PostBlockRenderer blocks={blocks} />
                    ) : (
                        <p className="whitespace-pre-wrap leading-relaxed text-sm text-slate-200">
                            {postDetail?.body}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}