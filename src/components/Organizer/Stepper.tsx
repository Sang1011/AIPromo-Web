interface StepperProps {
    currentStep: number;
}

const steps = [
    "Thông tin",
    "Về thời gian",
    "Cài đặt",
    "Đăng ký",
    "Thanh toán",
];

export default function Stepper({ currentStep }: StepperProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            {steps.map((label, index) => {
                const stepNumber = index + 1;
                const active = stepNumber === currentStep;
                const done = stepNumber < currentStep;

                return (
                    <div key={label} className="flex-1 flex items-center gap-3">
                        <div
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center
                                text-sm font-semibold
                                ${done || active
                                    ? "bg-primary text-white"
                                    : "bg-white/10 text-slate-400"}
                            `}
                        >
                            {stepNumber}
                        </div>

                        <span
                            className={`text-sm ${active ? "text-white" : "text-slate-400"
                                }`}
                        >
                            {label}
                        </span>

                        {index < steps.length - 1 && (
                            <div className="flex-1 h-px bg-white/10 ml-3" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
