import { useState } from "react";
import { buildMonthGrid, parseDateStr, weekdayOf, type DateStr } from "../lib/dates";
import { formatDateLong, formatMonth } from "../lib/formatters";

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

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Index of a month on one number line, for comparing months. */
const monthIndex = (year: number, month: number) => year * 12 + month;

export function Calendar({ value, onChange, minDate, maxDate, closedWeekdays }: CalendarProps) {
  const [view, setView] = useState(() => {
    const { year, month } = parseDateStr(value ?? minDate);
    return { year, month };
  });

  const min = parseDateStr(minDate);
  const max = parseDateStr(maxDate);
  const canGoBack = monthIndex(view.year, view.month) > monthIndex(min.year, min.month);
  const canGoForward = monthIndex(view.year, view.month) < monthIndex(max.year, max.month);

  function shift(delta: number) {
    const index = monthIndex(view.year, view.month) - 1 + delta; // 0-based month number
    setView({ year: Math.floor(index / 12), month: (index % 12) + 1 });
  }

  const navButton =
    "flex size-9 items-center justify-center rounded-md text-slate-600 enabled:cursor-pointer enabled:hover:bg-slate-100 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-indigo-600";

  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" className={navButton} onClick={() => shift(-1)} disabled={!canGoBack} aria-label="Previous month">
          &lsaquo;
        </button>
        <div className="font-medium" aria-live="polite">
          {formatMonth(view.year, view.month)}
        </div>
        <button type="button" className={navButton} onClick={() => shift(1)} disabled={!canGoForward} aria-label="Next month">
          &rsaquo;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {WEEKDAY_HEADERS.map((name) => (
          <div key={name} className="py-1">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {buildMonthGrid(view.year, view.month)
          .flat()
          .map((date, index) => {
            if (!date) return <div key={`blank-${index}`} />;

            const disabled = date < minDate || date > maxDate || closedWeekdays.includes(weekdayOf(date));
            const selected = date === value;

            return (
              <button
                key={date}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={formatDateLong(date)}
                onClick={() => onChange(date)}
                className={
                  "aspect-square rounded-md text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 " +
                  (selected
                    ? "bg-indigo-600 font-semibold text-white"
                    : disabled
                      ? "text-slate-300"
                      : "cursor-pointer text-slate-900 hover:bg-indigo-50")
                }
              >
                {parseDateStr(date).day}
              </button>
            );
          })}
      </div>
    </div>
  );
}
