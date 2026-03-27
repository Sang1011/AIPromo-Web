import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdCalendarToday, MdPendingActions, MdHourglassEmpty } from "react-icons/md";
import { fetchPendingOrganizers } from "../../../store/organizerProfileSlice";
import type { RootState, AppDispatch } from "../../../store/index";
import StaffOrganizerDetailModal from "./StaffOrganizerDetailModal";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.1)]";

interface StaffOrganizerProfileListProps {

}

export default function StaffOrganizerProfileList({}: StaffOrganizerProfileListProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { pendingOrganizers } = useSelector(
        (state: RootState) => state.ORGANIZER_PROFILE
    );
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        dispatch(
            fetchPendingOrganizers({
                PageNumber: 1,
                PageSize: 10,
                SortColumn: "CreatedAt",
                SortOrder: "desc",
            })
        );
    }, [dispatch]);

    const handleViewProfile = (userId: string) => {
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUserId(null);
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString("vi-VN");
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "Pending":
                return "Chờ xác minh ID";
            case "Approved":
                return "Đã phê duyệt";
            case "Rejected":
                return "Bị từ chối";
            default:
                return status;
        }
    };

    return (
        <div className="space-y-4">
            <h5 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <MdPendingActions className="text-sm" /> Danh sách chờ phê duyệt
            </h5>

            {pendingOrganizers.map((org) => (
                <div
                    key={org.profileId}
                    className={`${glassCard} p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/30 transition-all group`}
                >
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="relative">
                            <img
                                alt="Organizer avatar"
                                className="size-16 rounded-2xl object-cover border-2 border-primary/20"
                                src="https://via.placeholder.com/64"
                            />
                            <div className="absolute -bottom-1 -right-1 size-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-[#18122B]">
                                <MdHourglassEmpty className="text-[10px] text-white font-bold" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-lg font-bold group-hover:text-primary transition-colors">
                                {org.displayName}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <MdCalendarToday className="text-sm" />{" "}
                                    {formatDate(org.createdAt)}
                                </span>
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold uppercase tracking-wide border border-amber-500/20">
                                    {getStatusLabel(org.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => handleViewProfile(org.userId)}
                            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-primary/20 hover:bg-primary/5 text-sm font-bold transition-all"
                        >
                            Xem hồ sơ
                        </button>
                        <button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all">
                            Phê duyệt nhanh
                        </button>
                    </div>
                </div>
            ))}

            {pendingOrganizers.length === 0 && (
                <div className={`${glassCard} p-8 rounded-2xl text-center text-slate-400`}>
                    <p>Không có hồ sơ nào đang chờ phê duyệt</p>
                </div>
            )}

            <StaffOrganizerDetailModal
                userId={selectedUserId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}
