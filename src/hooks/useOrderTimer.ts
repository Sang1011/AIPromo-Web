import { get, ref, remove, set } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';
import { db } from '../config/firebase';

const ORDER_TIMEOUT_MS = 15 * 60 * 1000;

export const useOrderTimer = (
    orderId: string | null,
    onExpired: () => void
) => {
    const [secondsLeft, setSecondsLeft] = useState<number>(ORDER_TIMEOUT_MS / 1000);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const onExpiredRef = useRef(onExpired);
    useEffect(() => {
        onExpiredRef.current = onExpired;
    }, [onExpired]);

    const clearOrderFromFirebase = async (id: string) => {
        await remove(ref(db, `pendingOrders/${id}`));
        localStorage.removeItem('currentOrderId');
    };

    const startTimer = (expiresAt: number) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            const remaining = Math.floor((expiresAt - Date.now()) / 1000);
            if (remaining <= 0) {
                clearInterval(intervalRef.current!);
                setSecondsLeft(0);
                if (orderId) clearOrderFromFirebase(orderId);
                onExpiredRef.current();
            } else {
                setSecondsLeft(remaining);
            }
        }, 1000);
    };

    useEffect(() => {
        if (!orderId) return;

        const init = async () => {
            const snapshot = await get(ref(db, `pendingOrders/${orderId}`));

            if (snapshot.exists()) {
                const data = snapshot.val();
                const remaining = data.expiresAt - Date.now();

                if (remaining <= 0) {
                    await clearOrderFromFirebase(orderId);
                    onExpiredRef.current();
                } else {
                    setSecondsLeft(Math.floor(remaining / 1000));
                    startTimer(data.expiresAt);
                }
            } else {
                const startTime = Date.now();
                const expiresAt = startTime + ORDER_TIMEOUT_MS;
                await set(ref(db, `pendingOrders/${orderId}`), {
                    orderId,
                    startTime,
                    expiresAt,
                });
                setSecondsLeft(ORDER_TIMEOUT_MS / 1000);
                startTimer(expiresAt);
            }
        };

        init();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [orderId]);

    return { secondsLeft, clearOrderFromFirebase };
};