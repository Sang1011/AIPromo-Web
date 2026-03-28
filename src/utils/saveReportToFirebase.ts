import { ref, push, set } from "firebase/database";
import { db } from "../config/firebase";

interface SaveReportOptions {
    eventId: string;
    eventName: string;
    fileName: string;
    createdBy: string;
    createdAt: string;
}

export const saveReportToFirebase = async ({
    eventId,
    eventName,
    fileName,
    createdBy,
    createdAt
}: SaveReportOptions): Promise<void> => {
    try {
        const reportsRef = ref(db, `reports/events/${eventId}`);
        const newReportRef = push(reportsRef);

        await set(newReportRef, {
            eventName,
            fileName,
            createdAt,
            createdBy
        });

        console.log("Saved to Firebase");
    } catch (err) {
        console.error("Firebase error:", err);
    }
};