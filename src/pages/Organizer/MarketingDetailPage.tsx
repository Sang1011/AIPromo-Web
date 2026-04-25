// MarketingDetailPage.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { fetchPostDetail } from "../../store/postSlice";
import ContentDetail from "../../components/Organizer/marketing/ContentDetail";
import FacebookMetricsSection from "../../components/Organizer/marketing/FacebookMetricsSection";
import InstagramMetricsSection from "../../components/Organizer/marketing/InstagramMetricsSection";

export default function MarketingDetailPage() {
    const { marketingId } = useParams<{ marketingId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { postDetail, loading, error } = useSelector((s: RootState) => s.POST);

    useEffect(() => {
        if (marketingId) dispatch(fetchPostDetail(marketingId));
    }, [marketingId, dispatch]);

    const handleReload = () => {
        if (marketingId) dispatch(fetchPostDetail(marketingId));
    };

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen overflow-y-auto custom-scrollbar">
            <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
                {postDetail && <FacebookMetricsSection post={postDetail} />}
                {postDetail && <InstagramMetricsSection post={postDetail} />}

                <ContentDetail
                    post={postDetail}
                    loading={loading.fetchDetail}
                    error={error.fetchDetail}
                    onReload={handleReload}
                />
            </div>
        </div>
    );
}