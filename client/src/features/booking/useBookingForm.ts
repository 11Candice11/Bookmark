import { useMemo, useReducer } from "react";
import { customerDetailsSchema, type BranchDto, type CreateBookingInput } from "@bookmark/shared";
import { findService, type ServiceId } from "./services";

/** The screens of the booking flow, in order. The last one also confirms the booking. */
export const STEP = { service: 0, branch: 1, dateTime: 2, details: 3 } as const;
export const LAST_STEP = STEP.details;

/**
 * The landing screen opens with this service already chosen, as in the design.
 * Set it to null to start with nothing selected (the Next button then stays disabled).
 */
const DEFAULT_SERVICE_ID: ServiceId | null = "savings";

export interface DetailsState {
  fullName: string;
  phone: string;
  /** Optional. "" means the customer left it blank. */
  email: string;
  /** Optional. "" means the customer left it blank. */
  idNumber: string;
  smsReminder: boolean;
  needsAssistance: boolean;
}
export type TextField = "fullName" | "phone" | "email" | "idNumber";
export type FlagField = "smsReminder" | "needsAssistance";
export type DetailErrors = Partial<Record<TextField, string>>;

interface State {
  step: number;
  /** What the visit is about. Sent to the API as the booking's `reason`. */
  serviceId: ServiceId | null;
  /** Province filter on the branch step. "" means all provinces. */
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
  | { type: "selectService"; serviceId: ServiceId }
  | { type: "setProvince"; province: string }
  | { type: "selectBranch"; branch: BranchDto }
  | { type: "selectDate"; date: string }
  | { type: "selectSlot"; startsAt: string }
  | { type: "setText"; field: TextField; value: string }
  | { type: "setFlag"; field: FlagField; value: boolean }
  | { type: "revealDetailErrors" }
  | { type: "goTo"; step: number }
  | { type: "slotUnavailable"; message: string };

const initialState: State = {
  step: STEP.service,
  serviceId: DEFAULT_SERVICE_ID,
  province: "",
  branch: null,
  date: null,
  startsAt: null,
  // Both boxes start unticked: the customer opts in to a reminder rather than being signed up.
  details: { fullName: "", phone: "", email: "", idNumber: "", smsReminder: false, needsAssistance: false },
  showDetailErrors: false,
  notice: null,
  slotsVersion: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "selectService":
      return { ...state, serviceId: action.serviceId };
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
    case "setText":
    case "setFlag":
      return { ...state, details: { ...state.details, [action.field]: action.value } };
    case "revealDetailErrors":
      return { ...state, showDetailErrors: true };
    case "goTo":
      return { ...state, step: Math.min(Math.max(action.step, 0), LAST_STEP) };
    case "slotUnavailable":
      return {
        ...state,
        step: STEP.dateTime,
        startsAt: null,
        notice: action.message,
        slotsVersion: state.slotsVersion + 1,
      };
  }
}

/** What the API's details schema is given. Blank optional strings are left out. */
function detailsInput(details: DetailsState) {
  return {
    ...details,
    email: details.email.trim() || undefined,
    idNumber: details.idNumber.trim() || undefined,
  };
}

/** Field errors for the details step, using the same schema as the API. */
function validateDetails(details: DetailsState): DetailErrors {
  const result = customerDetailsSchema.safeParse(detailsInput(details));
  if (result.success) return {};

  const errors: DetailErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as TextField;
    errors[field] ??= issue.message;
  }
  return errors;
}

export function useBookingForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const errors = useMemo(() => validateDetails(state.details), [state.details]);

  const actions = useMemo(
    () => ({
      selectService: (serviceId: ServiceId) => dispatch({ type: "selectService", serviceId }),
      setProvince: (province: string) => dispatch({ type: "setProvince", province }),
      selectBranch: (branch: BranchDto) => dispatch({ type: "selectBranch", branch }),
      selectDate: (date: string) => dispatch({ type: "selectDate", date }),
      selectSlot: (startsAt: string) => dispatch({ type: "selectSlot", startsAt }),
      setText: (field: TextField, value: string) => dispatch({ type: "setText", field, value }),
      setFlag: (field: FlagField, value: boolean) => dispatch({ type: "setFlag", field, value }),
      revealDetailErrors: () => dispatch({ type: "revealDetailErrors" }),
      goTo: (step: number) => dispatch({ type: "goTo", step }),
      slotUnavailable: (message: string) => dispatch({ type: "slotUnavailable", message }),
    }),
    [],
  );

  /** Whether the current step has what it needs to continue. */
  const canContinue = [
    state.serviceId !== null,
    state.branch !== null,
    state.startsAt !== null,
    Object.keys(errors).length === 0,
  ][state.step];

  /** The API request, or null if anything is still missing or invalid. */
  function toRequest(): CreateBookingInput | null {
    const service = findService(state.serviceId);
    if (!service || !state.branch || !state.startsAt) return null;
    const parsed = customerDetailsSchema.safeParse(detailsInput(state.details));
    if (!parsed.success) return null;
    return { ...parsed.data, reason: service.reason, branchId: state.branch.id, startsAt: state.startsAt };
  }

  return { state, errors, actions, canContinue, toRequest };
}
