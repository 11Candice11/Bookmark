import type { StepperStep } from "../../components/Stepper";
import { STEP } from "./useBookingForm";

/** The four pills in the stepper. The Review screen counts as part of the last one. */
export const BOOKING_STEPS: readonly StepperStep[] = [
  { id: "service", label: "What You Need", heading: "Select Your Service" },
  { id: "branch", label: "Choose Branch", heading: "Choose Your Branch" },
  { id: "datetime", label: "Pick Date & Time", heading: "Pick a Date & Time" },
  { id: "details", label: "Your Details", heading: "Enter Your Details" },
];

/** Which stepper pill is current for a given screen. */
export function stepperIndexFor(step: number): number {
  return Math.min(step, STEP.details);
}
