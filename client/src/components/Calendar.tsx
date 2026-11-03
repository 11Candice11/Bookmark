import { useState } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { buildMonthGrid, parseDateStr, weekdayOf, type DateStr } from "../lib/dates";
import { cx } from "../lib/cx";
import { formatClosedWeekdays, formatDateLong, formatMonth } from "../lib/formatters";
import { Card } from "./Card";

interface CalendarProps {
  value: DateStr | null;
  onChange: (date: DateStr) => void;
  /** Earliest selectable date (inclusive). */
  minDate: DateStr;
  /** Latest selectable date (inclusive). */
  maxDate: DateStr;
  /** Weekdays that can never be picked. 0 = Sunday ... 6 = Saturday. */
  closedWeekdays: number[];
}

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Index of a month on one number line, for comparing months. */
const monthIndex = (year: number, month: number) => year * 12 + month;

const navButton =
  "grid size-10 place-items-center rounded-full border border-surface-strong bg-white text-ink transition " +
  "enabled:cursor-pointer enabled:hover:border-primary enabled:hover:text-primary disabled:opacity-35 " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function Calendar({ value, onChange, minDate, maxDate, closedWeekdays }: CalendarProps) {
  const [view, setView] = useState(() => {
    const { year, month } = parseDateStr(value ?? minDate);
    return { year, month };
  });

  const min = parseDateStr(minDate);
  const max = parseDateStr(maxDate);
  const canGoBack = monthIndex(view.year, view.month) > monthIndex(min.year, min.month);
  const canGoForward = monthIndex(view.year, view.month) < monthIndex(max.year, max.month);
  const selectedWeekday = value ? weekdayOf(value) : null;
  const closedSentence = formatClosedWeekdays(closedWeekdays);

  function shift(delta: number) {
    const index = monthIndex(view.year, view.month) - 1 + delta; // 0-based month number
    setView({ year: Math.floor(index / 12), month: (index % 12) + 1 });
  }

  return (
    <Card as="section" aria-label="Choose a date" className="space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-surface-muted pb-4">
        <button type="button" className={navButton} onClick={() => shift(-1)} disabled={!canGoBack} aria-label="Previous month">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <div className="text-center" aria-live="polite">
          <p className="text-lg font-extrabold">{formatMonth(view.year, view.month)}</p>
          <p className="text-xs font-medium text-ink-subtle">Showing open booking dates</p>
        </div>
        <button type="button" className={navButton} onClick={() => shift(1)} disabled={!canGoForward} aria-label="Next month">
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold">
        {WEEKDAY_HEADERS.map((name, index) => (
          <div key={name} className={index === selectedWeekday ? "py-1 text-primary" : "py-1 text-ink-subtle"}>
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {buildMonthGrid(view.year, view.month, 0)
          .flat()
          .map((date, index) => {
            if (!date) return <div key={`blank-${index}`} />;

            const closed = closedWeekdays.includes(weekdayOf(date));
            const outOfRange = date < minDate || date > maxDate;
            const disabled = closed || outOfRange;
            const selected = date === value;

            return (
              <button
                key={date}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={formatDateLong(date)}
                onClick={() => onChange(date)}
                className={cx(
                  "relative grid aspect-square place-items-center rounded-lg text-sm transition",
                  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  selected && "bg-primary font-extrabold text-white shadow-card",
                  !selected &&
                    !disabled &&
                    "cursor-pointer border border-surface-strong bg-white font-bold hover:border-primary hover:text-primary",
                  !selected && closed && !outOfRange && "bg-surface-muted font-semibold text-ink-subtle/70 line-through",
                  !selected && outOfRange && "font-semibold text-ink-subtle/40",
                )}
              >
                {parseDateStr(date).day}
                {selected && <span aria-hidden="true" className="absolute bottom-1.5 size-1 rounded-full bg-white" />}
              </button>
            );
          })}
      </div>

      {closedSentence && (
        <p className="flex items-start gap-2 border-t border-surface-muted pt-4 text-xs font-medium text-ink-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          This branch is closed on {closedSentence}.
        </p>
      )}
    </Card>
  );
}
