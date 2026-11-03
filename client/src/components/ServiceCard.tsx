import { useId } from "react";
import { ArrowRight, Check, CircleCheck } from "lucide-react";
import type { ServiceId, ServiceOption, ServiceTone } from "../features/booking/services";
import { cx } from "../lib/cx";
import { Badge } from "./Badge";
import { Card } from "./Card";

interface ServiceCardProps {
  service: ServiceOption;
  /** Shared by every card in the group so the browser treats them as one radio set. */
  name: string;
  selected: boolean;
  onSelect: (id: ServiceId) => void;
}

const toneStyles: Record<ServiceTone, { accent: string; tile: string; tileSelected: string }> = {
  blue: {
    accent: "text-primary",
    tile: "bg-primary-soft text-primary",
    tileSelected: "bg-primary text-white",
  },
  violet: {
    accent: "text-violet",
    tile: "bg-violet-soft text-violet",
    tileSelected: "bg-violet text-white",
  },
};

export function ServiceCard({ service, name, selected, onSelect }: ServiceCardProps) {
  const titleId = useId();
  const descriptionId = useId();
  const tone = toneStyles[service.tone];
  const Icon = service.icon;
  const NoteIcon = service.note.icon;

  return (
    // The whole card is a <label>, so clicking anywhere selects the hidden radio input.
    <Card
      as="label"
      tone={selected ? "selected" : "default"}
      className={cx(
        "flex h-full cursor-pointer flex-col transition",
        "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary",
        !selected && "hover:border-primary/40",
      )}
    >
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={service.id}
        checked={selected}
        onChange={() => onSelect(service.id)}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      />

      {selected && (
        // Visual only. Screen readers already hear that the radio is checked.
        <Badge
          tone="solid"
          aria-hidden="true"
          icon={<CircleCheck className="size-3.5" />}
          className="absolute -top-3.5 right-5 tracking-wider uppercase"
        >
          Selected
        </Badge>
      )}

      <span className="flex items-start justify-between">
        <span
          className={cx(
            "grid size-14 place-items-center rounded-xl transition",
            selected ? tone.tileSelected : tone.tile,
          )}
        >
          <Icon className="size-7" aria-hidden="true" />
        </span>

        {selected ? (
          <span className="grid size-7 place-items-center rounded-full bg-primary text-white" aria-hidden="true">
            <Check className="size-4" strokeWidth={3} />
          </span>
        ) : (
          <span className="grid size-7 place-items-center rounded-full bg-surface-strong" aria-hidden="true">
            <span className="size-3.5 rounded-full border-2 border-ink-subtle" />
          </span>
        )}
      </span>

      <span className={cx("mt-5 text-xs font-extrabold tracking-wide uppercase", tone.accent)}>
        {service.category}
      </span>
      <span id={titleId} className="mt-1 text-xl font-extrabold">
        {service.title}
      </span>
      <span id={descriptionId} className="mt-2 text-base leading-relaxed font-medium text-ink-muted">
        {service.description}
      </span>

      <span className="mt-auto flex items-center justify-between gap-3 pt-6 text-[13px] font-bold">
        <span className={cx("flex items-center gap-1.5", selected ? tone.accent : "text-ink")}>
          <NoteIcon className={cx("size-4 shrink-0", tone.accent)} aria-hidden="true" />
          {service.note.label}
        </span>
        <ArrowRight className={cx("size-5 shrink-0", tone.accent)} aria-hidden="true" />
      </span>
    </Card>
  );
}
