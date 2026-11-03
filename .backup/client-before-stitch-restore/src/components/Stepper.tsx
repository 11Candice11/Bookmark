interface StepperProps {
  steps: readonly string[];
  /** Index of the step being shown. */
  current: number;
  /** Called when a completed step is clicked. Later steps are never clickable. */
  onStepClick?: (index: number) => void;
}

export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Booking progress">
      <ol className="flex items-center gap-2">
        {steps.map((label, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className="flex flex-1 items-center gap-2 last:flex-none"
            >
              <button
                type="button"
                disabled={!done || !onStepClick}
                onClick={() => onStepClick?.(index)}
                className="flex items-center gap-2 rounded-md text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 enabled:cursor-pointer enabled:hover:text-indigo-700"
              >
                <span
                  className={
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                    (done
                      ? "bg-indigo-600 text-white"
                      : active
                        ? "border-2 border-indigo-600 text-indigo-700"
                        : "border-2 border-slate-300 text-slate-400")
                  }
                >
                  {done ? "\u2713" : index + 1}
                </span>
                <span className={"hidden sm:inline " + (active ? "text-slate-900" : "text-slate-500")}>
                  {label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span className={"h-px flex-1 " + (done ? "bg-indigo-600" : "bg-slate-200")} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
