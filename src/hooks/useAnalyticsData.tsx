import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import type { GetPostsParams } from "../types/post/post";
import { fetchAllDistributionMetrics, fetchOrganizerPosts } from "../store/postSlice";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PostWithMetrics } from "../pages/Organizer/AnalyticsPage";

export function useAnalyticsData(params: GetPostsParams) {
    const dispatch = useDispatch<AppDispatch>();
    const { posts, loading, distributionMetricsMap } = useSelector((s: RootState) => s.POST);
    const [metricsDispatched, setMetricsDispatched] = useState(false);

    const refresh = useCallback(() => {
        setMetricsDispatched(false);
        dispatch(fetchOrganizerPosts(params));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchOrganizerPosts(params));
    }, [dispatch]);

    useEffect(() => {
        if (loading.fetchList) return;

        const targets = posts.flatMap(post =>
            (post.distributions ?? [])
                .filter(d => d.platform === "Facebook" && d.status === "Sent")
                .map(d => ({ postId: post.id, distributionId: d.id }))
        );

        if (targets.length) {
            dispatch(fetchAllDistributionMetrics(targets));
        }

        setMetricsDispatched(true);
    }, [posts, loading.fetchList, dispatch]);


    const postsWithMetrics = useMemo((): PostWithMetrics[] => {
        return posts
            .map(post => {
                const fbDist = (post.distributions ?? [])
                    .filter(d => d.platform === "Facebook" && d.status === "Sent")
                    .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime())[0];
                if (!fbDist) return null;
                const metrics = distributionMetricsMap[fbDist.id];
                if (!metrics) return null;
                return { post, metrics, distributionId: fbDist.id };
            })
            .filter((x): x is PostWithMetrics => x !== null)
            .sort((a, b) =>
                new Date(a.post.publishedAt ?? 0).getTime() - new Date(b.post.publishedAt ?? 0).getTime()
            );
    }, [posts, distributionMetricsMap]);

    const isLoading = loading.fetchList
        || !metricsDispatched
        || loading.fetchAllDistributionMetrics;

    return { postsWithMetrics, isLoading, refresh };
}