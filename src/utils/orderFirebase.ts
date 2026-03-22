import { ref, remove } from 'firebase/database';
import { db } from '../config/firebase';

export const clearOldOrderFromFirebase = async () => {
    const oldOrderId = localStorage.getItem('currentOrderId');
    if (oldOrderId) {
        await remove(ref(db, `pendingOrders/${oldOrderId}`));
        localStorage.removeItem('currentOrderId');
    }
};