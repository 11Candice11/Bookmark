import type { StepperStep } from "../../components/Stepper";

export interface BookingStep extends StepperStep {
  /** Label of the button that moves to the next step. */
  nextLabel?: string;
  /** Label of the button that moves back. Unset on the first step. */
  backLabel?: string;
}

export const BOOKING_STEPS: readonly BookingStep[] = [
  { id: "service", label: "What You Need", heading: "Select Your Service", nextLabel: "Next: Choose Bank Branch" },
  {
    id: "branch",
    label: "Choose Branch",
    heading: "Choose Your Branch",
    nextLabel: "Next: Pick Date & Time",
    backLabel: "Back to Step 1",
  },
  { id: "datetime", label: "Pick Date & Time", heading: "Pick a Date & Time" },
  { id: "details", label: "Your Details", heading: "Enter Your Details" },
];
