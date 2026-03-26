import { useParams } from "react-router-dom";
import OrderList from "../../components/Organizer/orders/OrderList";

export default function OrderListPage() {
    const { eventId } = useParams<{ eventId?: string }>();

    if (!eventId) {
        return (
            <div className="text-center text-red-400">
                Không tìm thấy sự kiện
            </div>
        );
    }

    return <OrderList eventId={eventId} />;
}