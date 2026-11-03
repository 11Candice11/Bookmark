import { useId } from "react";
import { CalendarOff, Circle, CircleCheck, Landmark, MapPin } from "lucide-react";
import type { BranchDto } from "@bookmark/shared";
import { describeHoursToday } from "../features/booking/branchHours";
import { cx } from "../lib/cx";
import { formatAddress, formatClosedDays, formatDistance } from "../lib/formatters";
import { Badge } from "./Badge";
import { Card } from "./Card";

interface BranchCardProps {
  branch: BranchDto;
  /** Straight-line distance from the user, once they have shared their location. */
  distanceKm: number | null;
  /** Shared by every card in the list so the browser treats them as one radio set. */
  name: string;
  selected: boolean;
  onSelect: (branch: BranchDto) => void;
}

export function BranchCard({ branch, distanceKm, name, selected, onSelect }: BranchCardProps) {
  const titleId = useId();
  const detailsId = useId();
  const hours = describeHoursToday(branch);

  return (
    // The whole card is a <label>, so clicking anywhere selects the hidden radio input.
    <Card
      as="label"
      tone={selected ? "selected" : "default"}
      className={cx(
        "flex cursor-pointer flex-col gap-4 transition sm:flex-row sm:items-center sm:gap-5",
        "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary",
        !selected && "hover:border-primary/40",
      )}
    >
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={branch.id}
        checked={selected}
        onChange={() => onSelect(branch)}
        aria-labelledby={titleId}
        aria-describedby={detailsId}
      />

      {selected && (
        // Visual only. Screen readers already hear that the radio is checked.
        <Badge
          tone="solid"
          aria-hidden="true"
          icon={<CircleCheck className="size-3.5" />}
          className="absolute -top-3.5 left-5 tracking-wider uppercase"
        >
          Selected branch
        </Badge>
      )}

      <span
        className={cx(
          "grid size-16 shrink-0 place-items-center rounded-xl transition",
          selected ? "bg-primary text-white" : "bg-primary-soft text-primary",
        )}
      >
        <Landmark className="size-8" aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        {distanceKm !== null && <Badge tone="neutral">{formatDistance(distanceKm)} away</Badge>}
        <span id={titleId} className="text-xl font-extrabold">
          {branch.name}
        </span>

        <span id={detailsId} className="flex flex-col items-start gap-2.5">
          <span className="flex items-start gap-1.5 text-[15px] leading-snug font-medium text-ink-muted">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {formatAddress(branch.address)}
          </span>

          <span className="flex flex-wrap gap-2">
            {hours && (
              <Badge
                tone={hours.open ? "soft" : "neutral"}
                icon={
                  <span
                    aria-hidden="true"
                    className={cx("size-2 rounded-full", hours.open ? "bg-primary" : "bg-ink-subtle")}
                  />
                }
              >
                {hours.label}
              </Badge>
            )}
            <Badge tone="neutral" icon={<CalendarOff className="size-3.5 text-primary" aria-hidden="true" />}>
              {formatClosedDays(branch.closedDays)}
            </Badge>
          </span>
        </span>
      </span>

      <span className="flex shrink-0 flex-col gap-1.5 sm:w-48">
        <span
          className={cx(
            "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition",
            selected ? "bg-primary text-white shadow-press-primary" : "bg-surface-muted text-ink",
          )}
        >
          {selected ? (
            <CircleCheck className="size-4" aria-hidden="true" />
          ) : (
            <Circle className="size-4" aria-hidden="true" />
          )}
          {selected ? "Selected" : "Select this Branch"}
        </span>
        {selected && (
          <span className="text-center text-xs font-bold text-primary" aria-hidden="true">
            Active branch for your reservation
          </span>
        )}
      </span>
    </Card>
  );
}
