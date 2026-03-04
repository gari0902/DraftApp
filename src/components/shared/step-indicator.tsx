"use client";

import { cn } from "@/lib/utils";

type Step = {
  label: string;
  active: boolean;
  completed: boolean;
};

type StepIndicatorProps = {
  steps: Step[];
  className?: string;
};

export const StepIndicator = ({ steps, className }: StepIndicatorProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
              step.completed && "bg-primary text-primary-foreground",
              step.active && !step.completed && "bg-primary text-primary-foreground ring-2 ring-primary/30",
              !step.active && !step.completed && "bg-muted text-muted-foreground"
            )}
          >
            {step.completed ? "✓" : i + 1}
          </div>
          <span
            className={cn(
              "text-sm hidden sm:inline",
              step.active ? "font-medium" : "text-muted-foreground"
            )}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className="h-px w-6 bg-border" />
          )}
        </div>
      ))}
    </div>
  );
};
