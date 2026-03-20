import { MdTag, MdTrendingUp, MdAdd } from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAllHashtags } from "../../../store/hashtagSlice";

export default function AdminHashtagStats() {
    const dispatch = useDispatch<AppDispatch>();
    const hashtags = useSelector((s: RootState) => s.HASHTAG.hashtags) ?? [];

    useEffect(() => {
        dispatch(fetchAllHashtags());
    }, [dispatch]);

    const today = useMemo(() => new Date(), []);

    const { total, topTag, newToday } = useMemo(() => {
        const total = hashtags.length;
        const top = (hashtags || []).reduce((best, h) => {
            if (!best) return h;
            return (h.usageCount || 0) > (best.usageCount || 0) ? h : best;
        }, undefined as any) as any;

        const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

        const newToday = (hashtags || []).reduce((acc: number, h: any) => {
            const created = h.createdAt ?? h.created ?? h.timestamp ?? null;
            if (!created) return acc;
            const cd = new Date(created);
            if (isNaN(cd.getTime())) return acc;
            return isSameDay(cd, today) ? acc + 1 : acc;
        }, 0);

        return { total, topTag: top?.name ?? "-", newToday };
    }, [hashtags, today]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Hashtag"
                value={String(total)}
                subtext="tổng"
                icon={<MdTag className="text-sm" />}
                showGradientBar
            />
            <AdminStatsCard
                label="Hashtag thịnh hành"
                value={topTag}
                icon={<MdTrendingUp className="text-sm" />}
                iconBg="bg-indigo-500/10"
                iconColor="text-indigo-400"
            />
            <AdminStatsCard
                label="Mới hôm nay"
                value={String(newToday)}
                icon={<MdAdd className="text-sm" />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
            />
        </div>
    );
}
