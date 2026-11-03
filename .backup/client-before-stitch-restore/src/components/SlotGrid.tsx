import type { SlotDto } from "@bookmark/shared";
import { formatTime } from "../lib/formatters";

interface SlotGridProps {
  slots: SlotDto[];
  /** `startsAt` of the chosen slot. */
  value: string | null;
  onChange: (startsAt: string) => void;
}

export function SlotGrid({ slots, value, onChange }: SlotGridProps) {
  return (
    <div role="radiogroup" aria-label="Available times" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const selected = slot.startsAt === value;

        return (
          <button
            key={slot.startsAt}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={!slot.available}
            onClick={() => onChange(slot.startsAt)}
            className={
              "rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 " +
              (selected
                ? "border-indigo-600 bg-indigo-600 font-semibold text-white"
                : slot.available
                  ? "cursor-pointer border-slate-300 bg-white text-slate-900 hover:border-indigo-400 hover:bg-indigo-50"
                  : "border-slate-200 bg-slate-100 text-slate-400 line-through")
            }
          >
            {formatTime(slot.startsAt)}
          </button>
        );
      })}
    </div>
  );
}
