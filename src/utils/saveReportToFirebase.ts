import { ref, push, set } from "firebase/database";
import { db } from "../config/firebase";

interface SaveReportOptions {
    eventId: string;
    eventName: string;
    fileName: string;
    createdBy: string;
    createdAt: string;
    userId: string;
}

export const saveReportToFirebase = async ({
    eventId,
    eventName,
    fileName,
    createdBy,
    createdAt,
    userId,
}: SaveReportOptions): Promise<void> => {
    try {
        const reportsRef = ref(db, `users/reports/${userId}/${eventId}`);
        const newReportRef = push(reportsRef);

        await set(newReportRef, {
            eventName,
            fileName,
            createdAt,
            createdBy,
        });
    } catch (err) {
        console.error("Firebase error:", err);
        throw err;
    }
};