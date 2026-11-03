import { useId } from "react";
import { CircleCheck, Clock, Sun, Sunset, type LucideIcon } from "lucide-react";
import type { SlotDto } from "@bookmark/shared";
import { cx } from "../lib/cx";
import { clockInBranchTz } from "../lib/dates";
import { formatSlotTime } from "../lib/formatters";
import { Badge } from "./Badge";
import { Card } from "./Card";

interface SlotGridProps {
  slots: SlotDto[];
  /** `startsAt` of the chosen slot. */
  value: string | null;
  onChange: (startsAt: string) => void;
}

const NOON_MINUTES = 12 * 60;

interface Section {
  id: "morning" | "afternoon";
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconStyle: string;
  slots: SlotDto[];
}

/** Splits a day's slots into morning and afternoon, by branch local time. Empty sections are dropped. */
function groupSlots(slots: SlotDto[]): Section[] {
  const isMorning = (slot: SlotDto) => clockInBranchTz(new Date(slot.startsAt)).minutes < NOON_MINUTES;
  const sections: Section[] = [
    {
      id: "morning",
      title: "Morning Slots",
      subtitle: "Before 12:00 PM",
      icon: Sun,
      iconStyle: "bg-amber-soft text-amber-ink",
      slots: slots.filter(isMorning),
    },
    {
      id: "afternoon",
      title: "Afternoon Slots",
      subtitle: "After 12:00 PM",
      icon: Sunset,
      iconStyle: "bg-orange-soft text-orange-ink",
      slots: slots.filter((slot) => !isMorning(slot)),
    },
  ];
  return sections.filter((section) => section.slots.length > 0);
}

export function SlotGrid({ slots, value, onChange }: SlotGridProps) {
  const groupName = useId();

  return (
    // One radio group across both cards, so the arrow keys move through every time of day.
    <div role="radiogroup" aria-label="Available times" className="space-y-5">
      {groupSlots(slots).map(({ id, title, subtitle, icon: Icon, iconStyle, slots: sectionSlots }) => {
        const availableCount = sectionSlots.filter((slot) => slot.available).length;

        return (
          <Card key={id} as="section" aria-label={title} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-surface-muted pb-4">
              <span className={cx("grid size-10 shrink-0 place-items-center rounded-full", iconStyle)}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="mr-auto leading-tight">
                <h3 className="text-base font-extrabold">{title}</h3>
                <p className="text-xs font-medium text-ink-subtle">{subtitle}</p>
              </div>
              <Badge>{availableCount} available</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {sectionSlots.map((slot) => {
                const selected = slot.startsAt === value;
                return (
                  <label
                    key={slot.startsAt}
                    className={cx(
                      "flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-bold transition",
                      "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary",
                      selected && "border-primary bg-primary text-white shadow-card",
                      !selected &&
                        slot.available &&
                        "cursor-pointer border-surface-strong bg-white hover:border-primary hover:text-primary",
                      !slot.available && "cursor-not-allowed border-transparent bg-surface-muted text-ink-subtle/60 line-through",
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={groupName}
                      value={slot.startsAt}
                      checked={selected}
                      disabled={!slot.available}
                      onChange={() => onChange(slot.startsAt)}
                    />
                    {selected ? (
                      <CircleCheck className="size-4" aria-hidden="true" />
                    ) : (
                      <Clock className="size-4 text-ink-subtle" aria-hidden="true" />
                    )}
                    {formatSlotTime(slot.startsAt)}
                  </label>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
