import { useMemo, useReducer } from "react";
import {
  customerDetailsSchema,
  type BookingReason,
  type BranchDto,
  type CreateBookingInput,
} from "@bookmark/shared";

export const STEPS = ["Branch", "Date & time", "Your details", "Review"] as const;
export const LAST_STEP = STEPS.length - 1;

export interface DetailsState {
  fullName: string;
  email: string;
  phone: string;
  /** "" until the customer chooses. */
  reason: BookingReason | "";
  notes: string;
}
export type DetailsField = keyof DetailsState;
export type DetailErrors = Partial<Record<DetailsField, string>>;

interface State {
  step: number;
  /** Province filter on the first step. "" means all provinces. */
  province: string;
  branch: BranchDto | null;
  /** YYYY-MM-DD, branch local time */
  date: string | null;
  /** Chosen slot, as an ISO instant */
  startsAt: string | null;
  details: DetailsState;
  showDetailErrors: boolean;
  /** Message shown on the date step, e.g. after losing a slot to someone else. */
  notice: string | null;
  /** Bumped to make the date step reload its slots. */
  slotsVersion: number;
}

type Action =
  | { type: "setProvince"; province: string }
  | { type: "selectBranch"; branch: BranchDto }
  | { type: "selectDate"; date: string }
  | { type: "selectSlot"; startsAt: string }
  | { type: "setDetail"; field: DetailsField; value: string }
  | { type: "revealDetailErrors" }
  | { type: "goTo"; step: number }
  | { type: "slotUnavailable"; message: string };

const initialState: State = {
  step: 0,
  province: "",
  branch: null,
  date: null,
  startsAt: null,
  details: { fullName: "", email: "", phone: "", reason: "", notes: "" },
  showDetailErrors: false,
  notice: null,
  slotsVersion: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setProvince":
      return { ...state, province: action.province };
    case "selectBranch":
      // A different branch has different days and times, so the date and slot no longer apply.
      return state.branch?.id === action.branch.id
        ? state
        : { ...state, branch: action.branch, date: null, startsAt: null, notice: null };
    case "selectDate":
      return { ...state, date: action.date, startsAt: null, notice: null };
    case "selectSlot":
      return { ...state, startsAt: action.startsAt, notice: null };
    case "setDetail":
      return { ...state, details: { ...state.details, [action.field]: action.value } };
    case "revealDetailErrors":
      return { ...state, showDetailErrors: true };
    case "goTo":
      return { ...state, step: Math.min(Math.max(action.step, 0), LAST_STEP) };
    case "slotUnavailable":
      return {
        ...state,
        step: 1,
        startsAt: null,
        notice: action.message,
        slotsVersion: state.slotsVersion + 1,
      };
  }
}

/** Field errors for the details step, using the same schema as the API. */
function validateDetails(details: DetailsState): DetailErrors {
  const result = customerDetailsSchema.safeParse({ ...details, notes: details.notes || undefined });
  if (result.success) return {};

  const errors: DetailErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as DetailsField;
    errors[field] ??= issue.message;
  }
  return errors;
}

export function useBookingForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const errors = useMemo(() => validateDetails(state.details), [state.details]);

  const actions = useMemo(
    () => ({
      setProvince: (province: string) => dispatch({ type: "setProvince", province }),
      selectBranch: (branch: BranchDto) => dispatch({ type: "selectBranch", branch }),
      selectDate: (date: string) => dispatch({ type: "selectDate", date }),
      selectSlot: (startsAt: string) => dispatch({ type: "selectSlot", startsAt }),
      setDetail: (field: DetailsField, value: string) => dispatch({ type: "setDetail", field, value }),
      revealDetailErrors: () => dispatch({ type: "revealDetailErrors" }),
      goTo: (step: number) => dispatch({ type: "goTo", step }),
      slotUnavailable: (message: string) => dispatch({ type: "slotUnavailable", message }),
    }),
    [],
  );

  /** Whether the current step has what it needs to continue. */
  const canContinue = [
    state.branch !== null,
    state.startsAt !== null,
    Object.keys(errors).length === 0,
    true,
  ][state.step];

  /** The API request for the review step, or null if anything is still missing or invalid. */
  function toRequest(): CreateBookingInput | null {
    if (!state.branch || !state.startsAt) return null;
    const parsed = customerDetailsSchema.safeParse({ ...state.details, notes: state.details.notes || undefined });
    if (!parsed.success) return null;
    return { ...parsed.data, branchId: state.branch.id, startsAt: state.startsAt };
  }

  return { state, errors, actions, canContinue, toRequest };
}
