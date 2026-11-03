import { useEffect, useState } from "react";
import { BOOKING_HORIZON_DAYS, type BranchDto, type SlotDto } from "@bookmark/shared";
import { getSlots } from "../../../api/branches";
import { errorMessage } from "../../../api/client";
import { Calendar } from "../../../components/Calendar";
import { SlotGrid } from "../../../components/SlotGrid";
import { addDays, todayInBranchTz, type DateStr } from "../../../lib/dates";
import { formatDateLong } from "../../../lib/formatters";

type SlotsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; slots: SlotDto[] };

interface DateTimeStepProps {
  branch: BranchDto;
  date: DateStr | null;
  startsAt: string | null;
  /** Changes when the slots should be reloaded (e.g. after a conflict). */
  slotsVersion: number;
  notice: string | null;
  onDateChange: (date: DateStr) => void;
  onSlotChange: (startsAt: string) => void;
}

export function DateTimeStep({
  branch,
  date,
  startsAt,
  slotsVersion,
  notice,
  onDateChange,
  onSlotChange,
}: DateTimeStepProps) {
  const [slots, setSlots] = useState<SlotsState>({ status: "loading" });
  const [retry, setRetry] = useState(0);

  const today = todayInBranchTz();

  useEffect(() => {
    if (!date) return;
    let cancelled = false; // ignore the response if the user has already picked another date
    setSlots({ status: "loading" });
    getSlots(branch.id, date)
      .then((result) => !cancelled && setSlots({ status: "ready", slots: result }))
      .catch((err) => !cancelled && setSlots({ status: "error", message: errorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [branch.id, date, slotsVersion, retry]);

  function renderSlots() {
    if (!date) return <p className="text-slate-500">Choose a date to see the available times.</p>;
    if (slots.status === "loading") return <p className="text-slate-500">Loading times&hellip;</p>;
    if (slots.status === "error") {
      return (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p>{slots.message}</p>
          <button type="button" onClick={() => setRetry((n) => n + 1)} className="mt-1 cursor-pointer font-medium underline">
            Try again
          </button>
        </div>
      );
    }
    if (slots.slots.length === 0) return <p className="text-slate-500">This branch is closed on that day.</p>;
    if (!slots.slots.some((s) => s.available)) {
      return <p className="text-slate-500">There are no times left on that day. Please choose another date.</p>;
    }
    return <SlotGrid slots={slots.slots} value={startsAt} onChange={onSlotChange} />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Booking at <span className="font-medium text-slate-900">{branch.name}</span>
      </p>

      {notice && (
        <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {notice}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <Calendar
          value={date}
          onChange={onDateChange}
          minDate={today}
          maxDate={addDays(today, BOOKING_HORIZON_DAYS)}
          closedWeekdays={branch.closedDays}
        />
        <div>
          <h3 className="mb-2 text-sm font-medium">{date ? formatDateLong(date) : "Times"}</h3>
          {renderSlots()}
        </div>
      </div>
    </div>
  );
}
