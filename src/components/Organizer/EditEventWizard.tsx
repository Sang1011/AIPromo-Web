import { useState } from "react";

import Stepper from "./Stepper";
import ManagementLayout from "./ManagementLayout";

import Step1EventInfo from "./steps/Step1EventInfo";
import Step2Schedule from "./steps/Step2Schedule";
import Step3Settings from "./steps/Step3Settings";
import Step4Registration from "./steps/Step4Registration";
import Step5Payment from "./steps/Step5Payment";

export default function EditEventWizard() {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep((s) => Math.min(s + 1, 5));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    return (
        <ManagementLayout>
            <div className="max-w-[1100px] mx-auto space-y-8 pb-16">

                {/* Stepper */}
                <Stepper currentStep={step} />

                {/* ===== STEP 1 ===== */}
                {step === 1 && (
                    <Step1EventInfo
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
        </ManagementLayout>
    );
}

