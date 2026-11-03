import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { createBooking } from "../../api/bookings";
import { listBranches } from "../../api/branches";
import { ApiError, errorMessage } from "../../api/client";
import { Stepper } from "../../components/Stepper";
import { BranchStep, type BranchesState } from "./steps/BranchStep";
import { DateTimeStep } from "./steps/DateTimeStep";
import { DetailsStep } from "./steps/DetailsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { LAST_STEP, STEPS, useBookingForm } from "./useBookingForm";

const STEP_TITLES = ["Choose a branch", "Pick a date and time", "Your details", "Review your booking"];

export function BookingWizard() {
  const navigate = useNavigate();
  const { state, errors, actions, canContinue, toRequest } = useBookingForm();

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

  // Move focus to the step heading when the step changes, so screen reader users hear it.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [state.step]);

  function handleContinue() {
    // The details step stays clickable so a click can reveal what is missing.
    if (state.step === 2 && !canContinue) {
      actions.revealDetailErrors();
      return;
    }
    setSubmitError(null);
    actions.goTo(state.step + 1);
  }

  async function handleConfirm() {
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

  const { branch, startsAt } = state;
  const continueDisabled = state.step < 2 && !canContinue;

  return (
    <div className="space-y-6">
      <Stepper steps={STEPS} current={state.step} onStepClick={actions.goTo} />

      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        {STEP_TITLES[state.step]}
      </h2>

      {state.step === 0 && (
        <BranchStep
          branches={branches}
          province={state.province}
          onProvinceChange={actions.setProvince}
          selectedId={branch?.id ?? null}
          onSelect={actions.selectBranch}
          onRetry={loadBranches}
        />
      )}

      {state.step === 1 && branch && (
        <DateTimeStep
          branch={branch}
          date={state.date}
          startsAt={startsAt}
          slotsVersion={state.slotsVersion}
          notice={state.notice}
          onDateChange={actions.selectDate}
          onSlotChange={actions.selectSlot}
        />
      )}

      {state.step === 2 && (
        <DetailsStep
          details={state.details}
          errors={errors}
          showAllErrors={state.showDetailErrors}
          onChange={actions.setDetail}
        />
      )}

      {state.step === 3 && branch && startsAt && (
        <ReviewStep
          branch={branch}
          startsAt={startsAt}
          endsAt={new Date(new Date(startsAt).getTime() + branch.slotMinutes * 60_000).toISOString()}
          details={state.details}
        />
      )}

      {submitError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => actions.goTo(state.step - 1)}
          disabled={state.step === 0 || submitting}
          className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:invisible"
        >
          Back
        </button>

        {state.step < LAST_STEP ? (
          <button
            type="button"
            onClick={handleContinue}
            disabled={continueDisabled}
            className="cursor-pointer rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="cursor-pointer rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:bg-indigo-300"
          >
            {submitting ? "Booking\u2026" : "Confirm booking"}
          </button>
        )}
      </div>
    </div>
  );
}
