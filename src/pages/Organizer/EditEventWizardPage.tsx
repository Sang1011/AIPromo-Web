import { useState } from "react";

import Stepper from "../../components/Organizer/Stepper";

import Step1EventInfo from "../../components/Organizer/steps/Step1EventInfo";
import Step2Schedule from "../../components/Organizer/steps/Step2Schedule";
import Step3Settings from "../../components/Organizer/steps/Step3Settings";
import Step4Registration from "../../components/Organizer/steps/Step4Registration";
import Step5Payment from "../../components/Organizer/steps/Step5Payment";

export default function EditEventWizardPage() {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep((s) => Math.min(s + 1, 5));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    return (
        <div className="max-w-[1100px] mx-auto space-y-8 pb-16">

            {/* Stepper */}
            <Stepper currentStep={step} />

            {/* ===== STEP 1 ===== */}
            {step === 1 && (
                <Step1EventInfo
                    mode="edit"
                    onNext={nextStep}
                    onCancel={() => console.log("Cancel step 1")}
                />
            )}

            {/* ===== STEP 2 ===== */}
            {step === 2 && (
                <Step2Schedule
                    onNext={nextStep}
                    onBack={prevStep}
                />
            )}

            {/* ===== STEP 3 ===== */}
            {step === 3 && (
                <Step3Settings
                    onNext={nextStep}
                    onBack={prevStep}
                />
            )}

            {/* ===== STEP 4 ===== */}
            {step === 4 && (
                <Step4Registration
                    onNext={nextStep}
                    onBack={prevStep}
                />
            )}

            {/* ===== STEP 5 ===== */}
            {step === 5 && (
                <Step5Payment
                    onBack={prevStep}
                    onFinish={() => {
                        console.log("Submit toàn bộ event");
                    }}
                />
            )}
        </div>
    );
}

