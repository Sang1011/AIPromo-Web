import { useEffect, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import { db } from "../config/firebase";

export interface ReportItem {
    id: string;
    eventId: string;
    eventName: string;
    fileName: string;
    createdAt: string;
    createdBy: string;
}

export const useEventReports = (userId?: string) => {
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setReports([]);
            setLoading(false);
            return;
        }

        const reportsRef = ref(db, `users/reports/${userId}`);

        onValue(reportsRef, (snapshot) => {
            const data = snapshot.val();

            if (!data) {
                setReports([]);
            } else {
                const parsed: ReportItem[] = [];

                Object.entries(data).forEach(([eventId, records]) => {
                    Object.entries(
                        records as Record<string, Omit<ReportItem, "id" | "eventId">>
                    ).forEach(([id, value]) => {
                        parsed.push({
                            id,
                            eventId,
                            ...value
                        });
                    });
                });

                parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
                setReports(parsed);
            }

            setLoading(false);
        });

        return () => off(reportsRef);
    }, [userId]);

    return { reports, loading };
};