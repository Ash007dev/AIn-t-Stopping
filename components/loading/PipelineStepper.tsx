// components/loading/PipelineStepper.tsx
import { Check } from "lucide-react";

interface PipelineStepperProps {
  steps: string[];
  activeStep: number;
}

export default function PipelineStepper({ steps, activeStep }: PipelineStepperProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto my-6 px-4">
      {steps.map((step, idx) => {
        const isDone = idx < activeStep;
        const isActive = idx === activeStep;
        const isLast = idx === steps.length - 1;
        const isLastReached = isLast && activeStep === steps.length - 1;

        let bullet = null;
        if (isDone || isLastReached) {
          const checkBg = isLastReached ? "bg-[#22C55E]" : "bg-[#E8170A]";
          bullet = (
            <div className={`w-5 h-5 rounded-full ${checkBg} flex items-center justify-center text-white flex-shrink-0 shadow-[0_0_12px_rgba(232,23,10,0.2)]`}>
              <Check size={12} strokeWidth={3.5} />
            </div>
          );
        } else if (isActive) {
          bullet = (
            <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center flex-shrink-0 relative">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            </div>
          );
        } else {
          bullet = (
            <div className="w-5 h-5 rounded-full border border-border-bright bg-transparent flex-shrink-0" />
          );
        }

        return (
          <div key={idx} className="flex items-center gap-3">
            {bullet}
            <span
              className={`text-[13px] md:text-[14px] transition-colors duration-200 ${
                isLastReached && idx === activeStep
                  ? "text-[#22C55E] font-semibold"
                  : isActive
                  ? "text-text-primary font-semibold"
                  : isDone
                  ? "text-text-secondary"
                  : "text-text-muted"
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
