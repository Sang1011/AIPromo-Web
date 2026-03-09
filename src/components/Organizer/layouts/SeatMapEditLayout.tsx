import { Outlet, useNavigate, useParams } from "react-router-dom";
import Header from "../navigations/Header";

export default function SeatMapEditLayout() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const goBackToSeatMap = () => {
        navigate(`/organizer/my-events/${eventId}/seat-map`);
    };

    return (
        <Outlet />
    );
}
