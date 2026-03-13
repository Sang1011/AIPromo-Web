import { useNavigate } from "react-router-dom";
import Step1EventInfo from "../../components/Organizer/steps/Step1EventInfo";

export default function CreateEventPage() {

    const navigate = useNavigate();

    const handleCreated = (eventId: string) => {
        navigate(`/organizer/my-events/${eventId}/edit`);
    };

    return (
        <div className="max-w-[1100px] mx-auto space-y-8 pb-16">
            <h2 className="text-xl font-semibold text-white">
                Tạo sự kiện mới
            </h2>
            <Step1EventInfo
                mode="create"
                onCreated={handleCreated}
                onCancel={() => navigate("/organizer/my-events")}
            />

        </div>
    );

}