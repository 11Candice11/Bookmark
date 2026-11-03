import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, MapPin, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { BOOKING_HORIZON_DAYS, type BranchDto, type SlotDto } from "@bookmark/shared";
import { getSlots } from "../../../api/branches";
import { errorMessage } from "../../../api/client";
import { AppointmentSummary } from "../../../components/AppointmentSummary";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { Calendar } from "../../../components/Calendar";
import { Card } from "../../../components/Card";
import { SlotGrid } from "../../../components/SlotGrid";
import { StepIntro } from "../../../components/StepIntro";
import { addDays, dateInBranchTz, todayInBranchTz, type DateStr } from "../../../lib/dates";
import { formatAppointmentDate, formatSlotTime } from "../../../lib/formatters";

type SlotsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; slots: SlotDto[] };

interface DateTimeStepProps {
  branch: BranchDto;
  /** Name of the service chosen on the first step, shown in the appointment recap. */
  serviceTitle?: string;
  date: DateStr | null;
  startsAt: string | null;
  /** Changes when the slots should be reloaded (e.g. after a conflict). */
  slotsVersion: number;
  notice: string | null;
  onDateChange: (date: DateStr) => void;
  onSlotChange: (startsAt: string) => void;
  /** Goes back to the branch step. */
  onChangeBranch: () => void;
}

/** Step 3: pick a day on the calendar, then a time. Slots are loaded from the API per day. */
export function DateTimeStep({
  branch,
  serviceTitle,
  date,
  startsAt,
  slotsVersion,
  notice,
  onDateChange,
  onSlotChange,
  onChangeBranch,
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
    if (!date) {
      return (
        <Placeholder icon={<CalendarDays className="size-6" aria-hidden="true" />}>
          Choose a date on the calendar to see the available times.
        </Placeholder>
      );
    }
    if (slots.status === "loading") return <SlotsSkeleton />;
    if (slots.status === "error") {
      return (
        <Card as="section" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="alert" className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-ink-muted" aria-hidden="true" />
            <div>
              <p className="font-extrabold">We couldn't load the times.</p>
              <p className="mt-1 text-ink-muted">{slots.message}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setRetry((n) => n + 1)}>
            Try again
          </Button>
        </Card>
      );
    }
    if (slots.slots.length === 0) {
      return <Placeholder>This branch is closed on that day. Please choose another date.</Placeholder>;
    }
    if (!slots.slots.some((slot) => slot.available)) {
      return <Placeholder>There are no times left on that day. Please choose another date.</Placeholder>;
    }
    return <SlotGrid slots={slots.slots} value={startsAt} onChange={onSlotChange} />;
  }

  return (
    <div className="space-y-6">
      <StepIntro
        badge={
          <Badge icon={<MapPin className="size-3.5" aria-hidden="true" />}>
            <span className="text-ink">
              Branch: <span className="font-extrabold">{branch.name}</span>
            </span>
            <button
              type="button"
              onClick={onChangeBranch}
              className="cursor-pointer rounded font-extrabold text-primary underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Change
            </button>
          </Badge>
        }
        title="Choose your date & time"
        description="Select an available date on the calendar, then pick your time slot."
        action={<Legend />}
      />

      {notice && (
        <div role="alert" className="rounded-2xl bg-amber-soft p-4 text-sm font-semibold text-amber-ink">
          {notice}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Calendar
          value={date}
          onChange={onDateChange}
          minDate={today}
          maxDate={addDays(today, BOOKING_HORIZON_DAYS)}
          closedWeekdays={branch.closedDays}
        />
        <div aria-live="polite">{renderSlots()}</div>
      </div>

      {startsAt && (
        <AppointmentSummary
          headline={`${formatAppointmentDate(dateInBranchTz(new Date(startsAt)))} at ${formatSlotTime(startsAt)}`}
          detail={serviceTitle ? `${branch.name} • ${serviceTitle}` : branch.name}
          badge={
            <Badge tone="soft" icon={<ShieldCheck className="size-4" aria-hidden="true" />} className="self-start">
              Guaranteed priority branch booking
            </Badge>
          }
        />
      )}
    </div>
  );
}

/** Key to the calendar and time buttons. Decorative: the controls already announce their own state. */
function Legend() {
  return (
    <ul
      aria-hidden="true"
      className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 self-start rounded-full bg-surface-muted px-4 py-2 text-xs font-bold text-ink-muted"
    >
      <li className="flex items-center gap-1.5">
        <span className="size-3 rounded-full border border-ink-subtle bg-white" />
        Available
      </li>
      <li className="flex items-center gap-1.5">
        <span className="size-3 rounded-full bg-primary" />
        Selected
      </li>
      <li className="flex items-center gap-1.5">
        <X className="size-3.5 text-ink-subtle" strokeWidth={3} />
        Full / Closed
      </li>
    </ul>
  );
}

function Placeholder({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <Card as="section" tone="muted" className="flex items-center gap-3 text-ink-muted">
      {icon}
      <p className="font-semibold">{children}</p>
    </Card>
  );
}

function SlotsSkeleton() {
  const slotIds = [0, 1, 2, 3];
  return (
    <div role="status" aria-busy="true" className="space-y-5">
      <span className="sr-only">Loading times…</span>
      {[0, 1].map((i) => (
        <Card key={i} aria-hidden="true" className="animate-pulse space-y-4">
          <div className="h-10 w-1/2 rounded-lg bg-surface-strong" />
          <div className="grid grid-cols-2 gap-3">
            {slotIds.map((id) => (
              <div key={id} className="h-11 rounded-xl bg-surface-strong" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
