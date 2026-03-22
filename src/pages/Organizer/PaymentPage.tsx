// 1. Import
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrderTimer } from '../../hooks/useOrderTimer';
import { notify } from '../../utils/notify';

// 2. Trong component
const { id: eventId } = useParams<{ id: string }>();
const navigate = useNavigate();

// 3. Lấy orderId từ localStorage (được set từ SeatMapViewerPage sau khi tạo order thành công)
const orderId = localStorage.getItem('currentOrderId');

// 4. Callback khi hết giờ — hook sẽ tự gọi cái này
const handleExpired = useCallback(() => {
    notify.error("Phiên đặt vé đã hết hạn, vui lòng thử lại");
    navigate(`/event-detail/${eventId}`);
}, [eventId, navigate]);

// 5. Hook xử lý toàn bộ: đọc Firebase, đếm ngược, xử lý tự xóa khi hết giờ
const { secondsLeft, clearOrderFromFirebase } = useOrderTimer(orderId, handleExpired);

// 6. Guard: không có orderId thì redirect luôn
useEffect(() => {
    if (!orderId) {
        notify.error("Không tìm thấy đơn hàng");
        navigate(`/event-detail/${eventId}`);
    }
}, [orderId]);

// 7. Khi thanh toán thành công: xóa Firebase + localStorage rồi redirect
const handlePaymentSuccess = async () => {
    if (orderId) await clearOrderFromFirebase(orderId);
    notify.success("Thanh toán thành công!");
    navigate(`/event-detail/${eventId}`);
};

// 8. Hiển thị countdown — đổi màu đỏ khi còn <= 60 giây
const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
const seconds = (secondsLeft % 60).toString().padStart(2, '0');
// Dùng secondsLeft <= 60 để đổi màu cảnh báo trên UI