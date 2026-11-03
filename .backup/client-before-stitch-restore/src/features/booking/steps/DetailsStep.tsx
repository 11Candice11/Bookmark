import { useId, useState, type ReactNode } from "react";
import { BOOKING_REASONS } from "@bookmark/shared";
import { REASON_LABELS } from "../../../lib/formatters";
import type { DetailErrors, DetailsField, DetailsState } from "../useBookingForm";

interface DetailsStepProps {
  details: DetailsState;
  errors: DetailErrors;
  /** Show every error, even for fields the customer has not touched yet. */
  showAllErrors: boolean;
  onChange: (field: DetailsField, value: string) => void;
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; invalid: boolean; describedBy?: string }) => ReactNode;
}

function Field({ label, error, hint, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const describedBy = error || hint ? messageId : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children({ id, invalid: Boolean(error), describedBy })}
      {(error || hint) && (
        <p id={messageId} className={"mt-1 text-sm " + (error ? "text-red-700" : "text-slate-500")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

const inputClass = (invalid: boolean) =>
  "w-full rounded-md border bg-white px-3 py-2 " + (invalid ? "border-red-500" : "border-slate-300");

export function DetailsStep({ details, errors, showAllErrors, onChange }: DetailsStepProps) {
  const [touched, setTouched] = useState<Set<DetailsField>>(new Set());

  const touch = (field: DetailsField) => setTouched((prev) => new Set(prev).add(field));
  const errorFor = (field: DetailsField) => (showAllErrors || touched.has(field) ? errors[field] : undefined);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" error={errorFor("fullName")}>
        {(p) => (
          <input
            id={p.id}
            type="text"
            autoComplete="name"
            value={details.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            onBlur={() => touch("fullName")}
            aria-invalid={p.invalid}
            aria-describedby={p.describedBy}
            className={inputClass(p.invalid)}
          />
        )}
      </Field>

      <Field label="Email" error={errorFor("email")} hint="We will send your confirmation here.">
        {(p) => (
          <input
            id={p.id}
            type="email"
            autoComplete="email"
            value={details.email}
            onChange={(e) => onChange("email", e.target.value)}
            onBlur={() => touch("email")}
            aria-invalid={p.invalid}
            aria-describedby={p.describedBy}
            className={inputClass(p.invalid)}
          />
        )}
      </Field>

      <Field label="Phone number" error={errorFor("phone")}>
        {(p) => (
          <input
            id={p.id}
            type="tel"
            autoComplete="tel"
            value={details.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            onBlur={() => touch("phone")}
            aria-invalid={p.invalid}
            aria-describedby={p.describedBy}
            className={inputClass(p.invalid)}
          />
        )}
      </Field>

      <Field label="Reason for your visit" error={errorFor("reason")}>
        {(p) => (
          <select
            id={p.id}
            value={details.reason}
            onChange={(e) => onChange("reason", e.target.value)}
            onBlur={() => touch("reason")}
            aria-invalid={p.invalid}
            aria-describedby={p.describedBy}
            className={inputClass(p.invalid)}
          >
            <option value="">Select a reason</option>
            {BOOKING_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {REASON_LABELS[reason]}
              </option>
            ))}
          </select>
        )}
      </Field>

      <div className="sm:col-span-2">
        <Field label="Anything we should know? (optional)" error={errorFor("notes")}>
          {(p) => (
            <textarea
              id={p.id}
              rows={3}
              value={details.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              onBlur={() => touch("notes")}
              aria-invalid={p.invalid}
              aria-describedby={p.describedBy}
              className={inputClass(p.invalid)}
            />
          )}
        </Field>
      </div>
    </div>
  );
}
