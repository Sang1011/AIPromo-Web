import { MdCategory, MdAddBox, MdList } from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAllCategories } from "../../../store/categorySlice";

export default function AdminCategoryStats() {
    const dispatch = useDispatch<AppDispatch>();
    const categories = useSelector((s: RootState) => s.CATEGORY.categories) ?? [];

    useEffect(() => {
        // fetch categories for dashboard stats
        dispatch(fetchAllCategories({}));
    }, [dispatch]);

    const today = useMemo(() => new Date(), []);

    const { total, active, newToday } = useMemo(() => {
        const total = categories.length;
        const active = categories.filter((c: any) => !!c?.isActive).length;

        const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

        const newToday = categories.reduce((acc: number, c: any) => {
            if (!c) return acc;
            const created = c.createdAt ?? c.created ?? c.timestamp ?? null;
            if (!created) return acc;
            const cd = new Date(created);
            if (isNaN(cd.getTime())) return acc;
            return isSameDay(cd, today) ? acc + 1 : acc;
        }, 0);

        return { total, active, newToday };
    }, [categories, today]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Category"
                value={String(total)}
                subtext="tổng"
                icon={<MdCategory className="text-sm" />}
                showGradientBar
            />
            <AdminStatsCard
                label="Category hoạt động"
                value={String(active)}
                icon={<MdList className="text-sm" />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
            />
            <AdminStatsCard
                label="Mới hôm nay"
                value={String(newToday)}
                icon={<MdAddBox className="text-sm" />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
            />
        </div>
    );
}
