import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck } from "lucide-react";
import { createBooking } from "../../api/bookings";
import { listBranches } from "../../api/branches";
import { ApiError, errorMessage } from "../../api/client";
import { BottomBar, type BottomBarProps } from "../../components/BottomBar";
import { Container } from "../../components/Container";
import { Stepper } from "../../components/Stepper";
import { dateInBranchTz } from "../../lib/dates";
import { formatAppointmentDate, formatSlotTime } from "../../lib/formatters";
import { BOOKING_STEPS } from "./bookingSteps";
import { findService } from "./services";
import { BranchStep, type BranchesState } from "./steps/BranchStep";
import { DateTimeStep } from "./steps/DateTimeStep";
import { DetailsStep } from "./steps/DetailsStep";
import { ServiceStep } from "./steps/ServiceStep";
import { STEP, useBookingForm } from "./useBookingForm";

export function BookingWizard() {
  const navigate = useNavigate();
  const { state, errors, actions, canContinue, toRequest } = useBookingForm();
  const { step, branch, startsAt } = state;

  const [branches, setBranches] = useState<BranchesState>({ status: "loading" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadBranches = useCallback(() => {
    setBranches({ status: "loading" });
    listBranches()
      .then((list) => setBranches({ status: "ready", branches: list }))
      .catch((err) => setBranches({ status: "error", message: errorMessage(err) }));
  }, []);

  useEffect(loadBranches, [loadBranches]);

  // After moving between steps, start at the top and put focus on the new heading,
  // so keyboard and screen reader users are not left on the button they just pressed.
  const mainRef = useRef<HTMLElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    window.scrollTo({ top: 0 });
    mainRef.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  }, [step]);

  function handleContinue() {
    setSubmitError(null);
    actions.goTo(step + 1);
  }

  async function handleConfirm() {
    // Stay on the form and point at what is missing, rather than disabling the button silently.
    if (!canContinue) {
      actions.revealDetailErrors();
      return;
    }
    const request = toRequest();
    if (!request) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const booking = await createBooking(request);
      navigate(`/confirmation/${booking.reference}`);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 409 || err.code === "INVALID_SLOT")) {
        // Someone else took the slot (or it stopped being bookable). Send the customer back to pick again.
        actions.slotUnavailable(err.message);
      } else {
        setSubmitError(errorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const service = findService(state.serviceId);
  const endsAt = startsAt && branch ? new Date(new Date(startsAt).getTime() + branch.slotMinutes * 60_000).toISOString() : null;
  const appointment = startsAt
    ? `${formatAppointmentDate(dateInBranchTz(new Date(startsAt)))} · ${formatSlotTime(startsAt)}`
    : undefined;

  /** The sticky bar at the bottom: what has been chosen, plus Back and Next for this screen. */
  function footerFor(current: number): BottomBarProps {
    const back = (label: string) => ({
      backLabel: label,
      onBack: () => actions.goTo(current - 1),
      backDisabled: submitting,
    });

    switch (current) {
      case STEP.service:
        return {
          summaryLabel: "Currently Selected Service",
          summaryValue: service?.title,
          emptyText: "Pick a service above",
          nextLabel: "Next: Choose Bank Branch",
          nextDisabled: !canContinue,
          onNext: handleContinue,
        };
      case STEP.branch:
        return {
          summaryLabel: "Ready to book at",
          summaryValue: branch?.name,
          emptyText: "Pick a branch above",
          nextLabel: "Next: Pick Date & Time",
          nextDisabled: !canContinue,
          onNext: handleContinue,
          ...back("Back to Step 1"),
        };
      case STEP.dateTime:
        return {
          summaryLabel: "Your appointment",
          summaryValue: appointment,
          emptyText: "Pick a date and time above",
          nextLabel: "Next: Your Details",
          nextDisabled: !canContinue,
          onNext: handleContinue,
          ...back("Back to Step 2"),
        };
      default:
        return {
          summaryLabel: "Your appointment",
          summaryValue: appointment,
          nextLabel: submitting ? "Booking…" : "Confirm Appointment Now",
          // Left enabled while the form is incomplete: clicking it shows what is missing.
          nextDisabled: submitting,
          onNext: handleConfirm,
          ...back("Back to Date & Time"),
        };
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Stepper
        steps={BOOKING_STEPS}
        currentIndex={step}
        onStepClick={submitting ? undefined : actions.goTo}
        note={
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            No paperwork needed yet · Takes 60 seconds
          </p>
        }
      />

      <main ref={mainRef} className="flex-1 py-6 sm:py-8">
        <Container className="space-y-6">
          {step === STEP.service && <ServiceStep selectedId={state.serviceId} onSelect={actions.selectService} />}

          {step === STEP.branch && (
            <BranchStep
              branches={branches}
              province={state.province}
              onProvinceChange={actions.setProvince}
              selectedId={branch?.id ?? null}
              onSelect={actions.selectBranch}
              onRetry={loadBranches}
            />
          )}

          {step === STEP.dateTime && branch && (
            <DateTimeStep
              branch={branch}
              serviceTitle={service?.title}
              date={state.date}
              startsAt={startsAt}
              slotsVersion={state.slotsVersion}
              notice={state.notice}
              onDateChange={actions.selectDate}
              onSlotChange={actions.selectSlot}
              onChangeBranch={() => actions.goTo(STEP.branch)}
            />
          )}

          {step === STEP.details && branch && service && startsAt && endsAt && (
            <DetailsStep
              branch={branch}
              service={service}
              startsAt={startsAt}
              endsAt={endsAt}
              details={state.details}
              errors={errors}
              showAllErrors={state.showDetailErrors}
              onTextChange={actions.setText}
              onFlagChange={actions.setFlag}
            />
          )}

          {submitError && (
            <div role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-800">
              {submitError}
            </div>
          )}
        </Container>
      </main>

      <BottomBar {...footerFor(step)} />
    </div>
  );
}
