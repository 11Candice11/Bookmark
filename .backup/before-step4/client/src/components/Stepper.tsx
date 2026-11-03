import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cx } from "../lib/cx";
import { Container } from "./Container";

export interface StepperStep {
  id: string;
  /** Short name shown inside the step pill, e.g. "What You Need". */
  label: string;
  /** Longer title shown in the "Step 1 of 4" line, e.g. "Select Your Service". */
  heading: string;
}

interface StepperProps {
  steps: readonly StepperStep[];
  /** Zero-based index of the step the user is on. */
  currentIndex: number;
  /** Shown on the right of the "Step 1 of 4" line. */
  note?: ReactNode;
  /** When set, completed steps become buttons that jump back to that step. */
  onStepClick?: (index: number) => void;
}

type StepState = "complete" | "current" | "upcoming";

function getState(index: number, currentIndex: number): StepState {
  if (index < currentIndex) return "complete";
  if (index === currentIndex) return "current";
  return "upcoming";
}

const pillStyles: Record<StepState, string> = {
  complete: "border-transparent bg-white",
  current: "border-primary bg-white shadow-card",
  upcoming: "border-transparent bg-surface-strong",
};

const circleStyles: Record<StepState, string> = {
  complete: "bg-primary-soft text-primary",
  current: "bg-primary text-white",
  upcoming: "bg-black/5 text-ink-subtle",
};

const captionStyles: Record<StepState, string> = {
  complete: "text-primary",
  current: "text-primary",
  upcoming: "text-ink-subtle",
};

const labelStyles: Record<StepState, string> = {
  complete: "text-ink",
  current: "text-ink",
  upcoming: "text-ink-subtle",
};

export function Stepper({ steps, currentIndex, note, onStepClick }: StepperProps) {
  const current = steps[currentIndex];
  if (!current) return null;

  return (
    <nav aria-label="Booking progress" className="bg-surface-muted py-4">
      <Container className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <p className="flex items-center gap-2 text-sm font-extrabold">
            <span
              aria-hidden="true"
              className="grid size-6 place-items-center rounded-full bg-primary text-xs text-white"
            >
              {currentIndex + 1}
            </span>
            <span>
              Step {currentIndex + 1} of {steps.length}
            </span>
            <span className="font-semibold text-ink-muted">· {current.heading}</span>
          </p>
          {note}
        </div>

        <ol className="flex gap-2 sm:gap-3">
          {steps.map((step, index) => {
            const state = getState(index, currentIndex);
            const clickable = state === "complete" && onStepClick !== undefined;

            const content = (
              <>
                <span
                  aria-hidden="true"
                  className={cx(
                    "grid size-8 shrink-0 place-items-center rounded-full text-base font-extrabold",
                    circleStyles[state],
                  )}
                >
                  {state === "complete" ? <Check className="size-4" strokeWidth={3} /> : index + 1}
                </span>
                <span className={cx("min-w-0 text-left", state !== "current" && "sr-only sm:not-sr-only")}>
                  <span className={cx("block text-[10px] font-extrabold tracking-wider uppercase", captionStyles[state])}>
                    Step {index + 1}
                    {state === "complete" && <span className="sr-only"> (completed)</span>}
                  </span>
                  <span className={cx("block truncate text-sm font-extrabold sm:text-[15px]", labelStyles[state])}>
                    {step.label}
                  </span>
                </span>
              </>
            );

            const pillClasses = cx(
              "flex size-full min-w-0 items-center gap-3 rounded-xl border-2 py-2 sm:justify-start sm:px-3 sm:py-2.5",
              state === "current" ? "px-2.5" : "justify-center px-0",
              pillStyles[state],
            );

            return (
              <li
                key={step.id}
                aria-current={state === "current" ? "step" : undefined}
                // On small screens only the current step has room for its text. The others
                // shrink to a number so the current pill can show its whole label.
                className={cx("min-w-0 sm:flex-1", state === "current" ? "flex-1" : "w-11 shrink-0 sm:w-auto sm:shrink")}
              >
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => onStepClick(index)}
                    className={cx(
                      pillClasses,
                      "cursor-pointer hover:border-primary/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    )}
                  >
                    {content}
                  </button>
                ) : (
                  <div className={pillClasses}>{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
