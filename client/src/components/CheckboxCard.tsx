import { useId } from "react";
import { Check, type LucideIcon } from "lucide-react";
import { cx } from "../lib/cx";
import { Card } from "./Card";

interface CheckboxCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  /** Small icon shown before the label. */
  icon?: LucideIcon;
}

/** A tick-box inside a card. The whole card is the click target. */
export function CheckboxCard({ checked, onChange, label, description, icon: Icon }: CheckboxCardProps) {
  const descriptionId = useId();

  return (
    <Card
      as="label"
      className={cx(
        "flex cursor-pointer items-start gap-4 transition",
        "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary",
        !checked && "hover:border-primary/40",
        checked && "border-primary/30",
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={descriptionId}
      />
      <span
        aria-hidden="true"
        className={cx(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 transition",
          checked ? "border-primary bg-primary text-white" : "border-ink-subtle bg-white text-transparent",
        )}
      >
        <Check className="size-4" strokeWidth={3} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-base font-extrabold">
          {Icon && <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />}
          {label}
        </span>
        <span id={descriptionId} className="mt-1 block text-sm leading-relaxed font-medium text-ink-muted">
          {description}
        </span>
      </span>
    </Card>
  );
}
