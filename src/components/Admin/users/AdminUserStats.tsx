import {
    MdGroup,
    MdBusinessCenter,
    MdPerson
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { useEffect, useState } from "react";
import userService from "../../../services/userService";

export default function AdminUserStats() {

    const { users, pagination } = useSelector((state: RootState) => state.USER);
    const [allUsers, setAllUsers] = useState(users);

    useEffect(() => {
        let mounted = true;

        const fetchAll = async () => {
            try {
                const total = pagination?.totalCount ?? users.length;
                // If we already have all users locally, use them
                if (users.length >= total) {
                    if (mounted) setAllUsers(users);
                    return;
                }

                const resp = await userService.getAllUsers({
                    PageNumber: 1,
                    PageSize: total,
                    SortColumn: "userId",
                    Dir: "desc",
                });

                const items = resp.data?.data?.items ?? users;
                if (mounted) setAllUsers(items);
            } catch (e) {
                if (mounted) setAllUsers(users);
            }
        };

        fetchAll();

        return () => { mounted = false; };
    }, [users, pagination]);

    const totalUsers = pagination?.totalCount ?? allUsers.length;

    const organizers = allUsers.filter((u: any) =>
        u.roles?.includes("Organizer")
    ).length;

    const attendees = allUsers.filter((u: any) =>
        u.roles?.includes("Attendee")
    ).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng Người dùng"
                value={totalUsers.toLocaleString()}
                change="+0%" 
                subtext="from system"
                icon={<MdGroup className="text-sm" />}
                showGradientBar
            />

            <AdminStatsCard
                label="Người tổ chức"
                value={organizers.toLocaleString()}
                change="+0"
                subtext="organizers"
                icon={<MdBusinessCenter className="text-sm" />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
            />

            <AdminStatsCard
                label="Người tham dự"
                value={attendees.toLocaleString()}
                change="+0"
                subtext="attendees"
                icon={<MdPerson className="text-sm" />}
                iconBg="bg-indigo-500/10"
                iconColor="text-indigo-400"
            />
        </div>
    );
}