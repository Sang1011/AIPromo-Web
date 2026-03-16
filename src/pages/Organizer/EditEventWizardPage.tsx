import { useEffect, useState } from "react";

import Stepper from "../../components/Organizer/Stepper";

import Step1EventInfo from "../../components/Organizer/steps/Step1EventInfo";
import Step2Schedule from "../../components/Organizer/steps/Step2Schedule";
import Step3Settings from "../../components/Organizer/steps/Step3Settings";
import Step4Policy from "../../components/Organizer/steps/Step4Policy";
import Step5Payment from "../../components/Organizer/steps/Step5Payment";
import { fetchMe } from "../../store/authSlice";
import { useParams } from "react-router-dom";
import type { GetEventDetailResponse } from "../../types/event/event";
import { fetchEventById } from "../../store/eventSlice";
import type { AppDispatch } from "../../store";
import { useDispatch } from "react-redux";

export default function EditEventWizardPage() {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep((s) => Math.min(s + 1, 5));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const [event, setEvent] = useState<GetEventDetailResponse | null>(null);

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
        } catch (err) {
            console.error("Failed to fetch event data:", err);
        }
    };

    useEffect(() => {
        fetchMe();
    }, [])

    useEffect(() => {
        fetchEventData();
    }, [eventId])

    return (
        <div className="max-w-[1100px] mx-auto space-y-8 pb-16">

            {/* Stepper */}
            <Stepper currentStep={step} />

            {/* ===== STEP 1 ===== */}
            {step === 1 && (
                <Step1EventInfo
                    mode="edit"
                    onNext={nextStep}
                    eventData={event}
                    reloadEvent={reloadEvent}
                />
            )}

            {/* ===== STEP 2 ===== */}
            {step === 2 && (
                <Step2Schedule
                    onNext={nextStep}
                    onBack={prevStep}
                    eventData={event}
                    reloadEvent={reloadEvent}
                />
            )}

            {/* ===== STEP 3 ===== */}
            {step === 3 && (
                <Step3Settings
                    onNext={nextStep}
                    onBack={prevStep}
                    eventData={event}
                    reloadEvent={reloadEvent}
                />
            )}

            {/* ===== STEP 4 ===== */}
            {step === 4 && (
                <Step4Policy
                    onNext={nextStep}
                    onBack={prevStep}
                />
            )}

            {/* ===== STEP 5 ===== */}
            {/* {step === 5 && (
                <Step5Payment
                    onBack={prevStep}
                    reloadEvent={reloadEvent}
                    eventData={event}
                    onFinish={() => {

                    }}
                />
            )} */}
        </div>
    );
}

