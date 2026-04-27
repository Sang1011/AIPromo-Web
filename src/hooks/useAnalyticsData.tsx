import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import type { GetPostsParams } from "../types/post/post";
import {
    fetchAllDistributionMetrics,
    fetchAllDistributionMetricsInstagram,
    fetchAllDistributionMetricsThreads,
    fetchOrganizerPosts,
} from "../store/postSlice";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PostWithMetrics, PostWithIGMetrics, PostWithThreadsMetrics } from "../pages/Organizer/AnalyticsPage";

export function useAnalyticsData(params: GetPostsParams) {
    const dispatch = useDispatch<AppDispatch>();
    const {
        posts,
        loading,
        distributionMetricsMap,
        distributionMetricsInstagramMap,
        distributionMetricsThreadsMap,
    } = useSelector((s: RootState) => s.POST);

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

        const fbTargets = posts.flatMap(post =>
            (post.distributions ?? [])
                .filter(d => d.platform === "Facebook" && d.status === "Sent")
                .map(d => ({ postId: post.id, distributionId: d.id }))
        );

        const igTargets = posts.flatMap(post => {
            const latest = (post.distributions ?? [])
                .filter(d => d.platform === "Instagram" && d.status === "Sent")
                .sort((a, b) => {
                    const ta = a.sentAt ? new Date(a.sentAt).getTime() : 0;
                    const tb = b.sentAt ? new Date(b.sentAt).getTime() : 0;
                    return tb - ta;
                })[0];
            return latest ? [{ postId: post.id, distributionId: latest.id }] : [];
        });

        const thTargets = posts.flatMap(post => {
            const latest = (post.distributions ?? [])
                .filter(d => d.platform === "Threads" && d.status === "Sent")
                .sort((a, b) => {
                    const ta = a.sentAt ? new Date(a.sentAt).getTime() : 0;
                    const tb = b.sentAt ? new Date(b.sentAt).getTime() : 0;
                    return tb - ta;
                })[0];
            return latest ? [{ postId: post.id, distributionId: latest.id }] : [];
        });

        if (fbTargets.length) dispatch(fetchAllDistributionMetrics(fbTargets));
        if (igTargets.length) dispatch(fetchAllDistributionMetricsInstagram(igTargets));
        if (thTargets.length) dispatch(fetchAllDistributionMetricsThreads(thTargets));

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

    const postsWithIGMetrics = useMemo((): PostWithIGMetrics[] => {
        return posts
            .map(post => {
                const igDist = (post.distributions ?? [])
                    .filter(d => d.platform === "Instagram" && d.status === "Sent")
                    .sort((a, b) => {
                        const ta = a.sentAt ? new Date(a.sentAt).getTime() : 0;
                        const tb = b.sentAt ? new Date(b.sentAt).getTime() : 0;
                        return tb - ta;
                    })[0];
                if (!igDist) return null;
                const metrics = distributionMetricsInstagramMap[igDist.id];
                if (!metrics) return null;
                return { post, metrics, distributionId: igDist.id };
            })
            .filter((x): x is PostWithIGMetrics => x !== null)
            .sort((a, b) =>
                new Date(a.post.publishedAt ?? 0).getTime() - new Date(b.post.publishedAt ?? 0).getTime()
            );
    }, [posts, distributionMetricsInstagramMap]);

    const postsWithThreadsMetrics = useMemo((): PostWithThreadsMetrics[] => {
        return posts
            .map(post => {
                const thDist = (post.distributions ?? [])
                    .filter(d => d.platform === "Threads" && d.status === "Sent")
                    .sort((a, b) => {
                        const ta = a.sentAt ? new Date(a.sentAt).getTime() : 0;
                        const tb = b.sentAt ? new Date(b.sentAt).getTime() : 0;
                        return tb - ta;
                    })[0];
                if (!thDist) return null;
                const metrics = distributionMetricsThreadsMap[thDist.id];
                if (!metrics) return null;
                return { post, metrics, distributionId: thDist.id };
            })
            .filter((x): x is PostWithThreadsMetrics => x !== null)
            .sort((a, b) =>
                new Date(a.post.publishedAt ?? 0).getTime() - new Date(b.post.publishedAt ?? 0).getTime()
            );
    }, [posts, distributionMetricsThreadsMap]);

    const isLoading =
        loading.fetchList ||
        !metricsDispatched ||
        loading.fetchAllDistributionMetrics ||
        loading.fetchAllDistributionMetricsInstagram ||
        loading.fetchAllDistributionMetricsThreads;

    return { postsWithMetrics, postsWithIGMetrics, postsWithThreadsMetrics, isLoading, refresh };
}