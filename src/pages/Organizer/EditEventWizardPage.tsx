import { useEffect, useState } from "react";

import Stepper from "../../components/Organizer/Stepper";

import Step1EventInfo from "../../components/Organizer/steps/Step1EventInfo";
import Step2Schedule from "../../components/Organizer/steps/Step2Schedule";
import Step3Settings from "../../components/Organizer/steps/Step3Settings";
import Step4Policy from "../../components/Organizer/steps/Step4Policy";
import { useParams } from "react-router-dom";
import type { GetEventDetailResponse } from "../../types/event/event";
import { fetchEventById } from "../../store/eventSlice";
import type { AppDispatch } from "../../store";
import { useDispatch } from "react-redux";

export default function EditEventWizardPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();

    const [step, setStep] = useState(1);
    const [event, setEvent] = useState<GetEventDetailResponse | null>(null);

    const key = eventId ? `editEventStep_${eventId}` : null;

    const nextStep = () => setStep((s) => Math.min(s + 1, 5));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));
    const [isAllowUpdate, setIsAllowUpdate] = useState(false);

    const reloadEvent = async () => {
        if (!eventId) return;

        try {
            const res = await dispatch(fetchEventById(eventId)).unwrap();
            const eventData: GetEventDetailResponse = res.data;
            setEvent(eventData);
        } catch (err) {
            console.error("Failed to reload event:", err);
        }
    };

    const fetchEventData = async () => {
        if (!eventId) return;

        try {
            const res = await dispatch(fetchEventById(eventId)).unwrap();
            const eventData: GetEventDetailResponse = res.data;
            setEvent(eventData);
            if (eventData.status === "Draft" || eventData.status === "Suspended") {
                setIsAllowUpdate(true);
            }
        } catch (err) {
            console.error("Failed to fetch event data:", err);
        }
    };

    // Fetch event
    useEffect(() => {
        fetchEventData();
    }, [eventId]);

    useEffect(() => {
        if (!key) return;
        if (step > 1) {
            localStorage.setItem(key, String(step));
        } else {
            localStorage.removeItem(key);
        }
    }, [step, key]);

    // Save step
    useEffect(() => {
        if (!key) return;

        if (step > 1) {
            localStorage.setItem(key, String(step));
        }
    }, [step, key]);

    const getReasonInfo = () => {
        if (!event) return null;
        switch (event.status) {
            case "Draft":
                return event.publishRejectionReason
                    ? { label: "Sự kiện bị từ chối duyệt", reason: event.publishRejectionReason, color: "#ef4444", textColor: "text-red-400", subColor: "text-red-300/75", bg: "bg-red-500/[0.07]", border: "border-red-500/20" }
                    : null;
            case "Suspended":
                return event.suspensionReason
                    ? { label: "Sự kiện đang bị trì hoãn", reason: event.suspensionReason, color: "#06b6d4", textColor: "text-cyan-400", subColor: "text-cyan-300/75", bg: "bg-cyan-500/[0.07]", border: "border-cyan-500/20" }
                    : null;
            case "Cancelled":
                return event.cancellationReason
                    ? { label: "Sự kiện đã bị huỷ", reason: event.cancellationReason, color: "#ef4444", textColor: "text-red-400", subColor: "text-red-300/75", bg: "bg-red-500/[0.07]", border: "border-red-500/20" }
                    : null;
            case "PendingCancellation":
                return event.cancellationRejectionReason
                    ? { label: "Yêu cầu huỷ bị từ chối", reason: event.cancellationRejectionReason, color: "#f97316", textColor: "text-orange-400", subColor: "text-orange-300/75", bg: "bg-orange-500/[0.07]", border: "border-orange-500/20" }
                    : null;
            default:
                return null;
        }
    };

    const reasonInfo = getReasonInfo();

    return (
        <div className="max-w-[1100px] mx-auto space-y-8 pb-16">

            {reasonInfo && (
                <div
                    className={`flex gap-3 rounded-xl border ${reasonInfo.border} ${reasonInfo.bg} px-5 py-4`}
                    style={{ borderLeftWidth: "3px", borderLeftColor: reasonInfo.color }}
                >
                    <svg className={`mt-0.5 shrink-0 ${reasonInfo.textColor}`} width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M9 5.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        <circle cx="9" cy="12.5" r="0.7" fill="currentColor" />
                    </svg>
                    <div className="space-y-1">
                        <p className={`text-sm font-semibold ${reasonInfo.textColor}`}>{reasonInfo.label}</p>
                        <p className={`text-sm ${reasonInfo.subColor}`}>{reasonInfo.reason}</p>
                    </div>
                </div>
            )}

            {/* Stepper */}
            <Stepper currentStep={step} />

            {/* STEP 1 */}
            {step === 1 && (
                <Step1EventInfo
                    mode="edit"
                    onNext={nextStep}
                    eventData={event}
                    isAllowUpdate={isAllowUpdate}
                    reloadEvent={reloadEvent}
                />
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <Step2Schedule
                    onNext={nextStep}
                    onBack={prevStep}
                    eventData={event}
                    reloadEvent={reloadEvent}
                    isAllowUpdate={isAllowUpdate}
                />
            )}

            {/* STEP 3 */}
            {step === 3 && (
                <Step3Settings
                    onNext={nextStep}
                    onBack={prevStep}
                    eventData={event}
                    reloadEvent={reloadEvent}
                    isAllowUpdate={isAllowUpdate}
                />
            )}

            {/* STEP 4 */}
            {step === 4 && (
                <Step4Policy
                    onBack={prevStep}
                    eventData={event}
                    reloadEvent={reloadEvent}
                    isAllowUpdate={isAllowUpdate}
                />
            )}
        </div>
    );
}