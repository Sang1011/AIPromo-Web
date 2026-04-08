import { ref, push, set } from "firebase/database";
import { db } from "../config/firebase";

interface SaveReportOptions {
    eventId: string;
    eventName: string;
    fileName: string;
    createdBy: string;
    createdAt: string;
}

const sanitizeEmail = (email: string) => email.replace(/\./g, ",");

export const saveReportToFirebase = async ({
    eventId,
    eventName,
    fileName,
    createdBy,
    createdAt
}: SaveReportOptions): Promise<void> => {
    try {
        const safeEmail = sanitizeEmail(createdBy);

        const reportsRef = ref(db, `email/reports/${safeEmail}/${eventId}`);
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
        throw err;
    }
};