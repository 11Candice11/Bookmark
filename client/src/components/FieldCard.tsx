import { useId, type ReactNode } from "react";
import { CircleAlert, type LucideIcon } from "lucide-react";
import { cx } from "../lib/cx";
import { Card } from "./Card";

interface FieldCardProps {
  label: string;
  /** Small grey text after the label, e.g. "(Optional)". */
  labelNote?: string;
  icon: LucideIcon;
  /** Icon colour family: blue (default) or violet. */
  accent?: "blue" | "violet";
  /** Shown under the input when there is no error. */
  hint?: ReactNode;
  error?: string;
  /** Renders the input. Spread the given props onto it so the label and messages are linked. */
  children: (props: { id: string; invalid: boolean; describedBy?: string; className: string }) => ReactNode;
}

const accents = {
  blue: "bg-primary-soft text-primary",
  violet: "bg-violet-soft text-violet",
};

/** A white card holding one form field: icon, label, the input, then a hint or an error. */
export function FieldCard({ label, labelNote, icon: Icon, accent = "blue", hint, error, children }: FieldCardProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || hint);

  const inputClass = cx(
    "w-full rounded-xl border-2 bg-white px-4 py-3 text-base font-semibold transition placeholder:font-medium placeholder:text-ink-subtle/60",
    "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary",
    error ? "border-red-600" : "border-surface-strong focus-visible:border-primary",
  );

  return (
    <Card as="div" className="space-y-3">
      <label htmlFor={id} className="flex items-center gap-3">
        <span className={cx("grid size-9 shrink-0 place-items-center rounded-lg", accents[accent])}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-base font-extrabold">
          {label}
          {labelNote && <span className="ml-1.5 text-sm font-semibold text-ink-subtle">{labelNote}</span>}
        </span>
      </label>

      {children({ id, invalid: Boolean(error), describedBy: hasMessage ? messageId : undefined, className: inputClass })}

      {hasMessage && (
        <p
          id={messageId}
          className={cx(
            "flex items-start gap-1.5 text-sm font-semibold",
            error ? "text-red-700" : "text-ink-muted",
          )}
        >
          {error && <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
          {error ?? hint}
        </p>
      )}
    </Card>
  );
}
