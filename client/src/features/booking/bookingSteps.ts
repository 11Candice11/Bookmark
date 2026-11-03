import type { StepperStep } from "../../components/Stepper";

/** The four pills in the stepper, one per screen. */
export const BOOKING_STEPS: readonly StepperStep[] = [
  { id: "service", label: "What You Need", heading: "Select Your Service" },
  { id: "branch", label: "Choose Branch", heading: "Choose Your Branch" },
  { id: "datetime", label: "Pick Date & Time", heading: "Pick a Date & Time" },
  { id: "details", label: "Your Details", heading: "Enter Your Details" },
];
