import { Check } from 'lucide-react';

interface Step {
  title: string;
  completed: boolean;
}

interface ProgressStepperProps {
  steps: Step[];
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ steps }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                step.completed
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}
            >
              {step.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-sm">{index + 1}</span>
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                step.completed ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-3 ${
                step.completed ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};
