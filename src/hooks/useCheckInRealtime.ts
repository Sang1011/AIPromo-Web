import { useEffect, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import type { CheckInStatistic } from "../types/ticketing/ticketing";

const API_URL: string = import.meta.env.VITE_API_BASE_URL;
const changedURL = API_URL.replace('/api', '');

const HUB_URL = `${changedURL}/hubs/ticket-hub`;

interface UseCheckInRealtimeOptions {
    eventId: string | undefined;
    onUpdate: (stats: CheckInStatistic) => void;
}

export function useCheckInRealtime({ eventId, onUpdate }: UseCheckInRealtimeOptions) {
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    const stop = useCallback(async () => {
        if (connectionRef.current) {
            await connectionRef.current.stop();
            connectionRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!eventId) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        connectionRef.current = connection;

        // Lắng nghe event từ BE broadcast xuống
        connection.on("OnCheckInStatsUpdated", (stats: CheckInStatistic) => {
            onUpdate(stats);
        });

        const start = async () => {
            try {
                await connection.start();
                await connection.invoke("JoinEventGroup", eventId);
                console.log(`[SignalR] Joined event group: ${eventId}`);
            } catch (err) {
                console.error("[SignalR] Lỗi kết nối:", err);
            }
        };

        start();

        return () => {
            connection
                .invoke("LeaveEventGroup", eventId)
                .catch(() => { })
                .finally(() => connection.stop());
        };
    }, [eventId]);

    return { stop };
}