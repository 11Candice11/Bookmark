import type { ReactNode } from "react";
import { CalendarClock, Landmark, ShieldCheck, type LucideIcon } from "lucide-react";
import { cx } from "../lib/cx";
import { Badge } from "./Badge";
import { Card } from "./Card";

interface BookingSummaryProps {
  branchName: string;
  branchAddress: string;
  /** e.g. "Friday, Nov 13" */
  dateLabel: string;
  /** e.g. "10:00 AM – 10:30 AM" */
  timeRange: string;
  serviceTitle: string;
  /** Small line under the service title, e.g. "Save & grow". */
  serviceNote: string;
  serviceIcon: LucideIcon;
}

function Row({
  icon: Icon,
  tile,
  label,
  children,
}: {
  icon: LucideIcon;
  tile: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-3">
      <span className={cx("grid size-10 shrink-0 place-items-center rounded-lg text-white", tile)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 leading-snug">
        <p className="text-xs font-semibold text-ink-subtle">{label}</p>
        {children}
      </div>
    </div>
  );
}

/** Recap of the booking, shown beside the details form. */
export function BookingSummary({
  branchName,
  branchAddress,
  dateLabel,
  timeRange,
  serviceTitle,
  serviceNote,
  serviceIcon,
}: BookingSummaryProps) {
  return (
    <Card as="aside" aria-label="Booking summary" className="space-y-3 border-t-6 border-t-primary">
      <Badge>Booking summary</Badge>

      <Row icon={Landmark} tile="bg-primary" label="Branch location">
        <p className="font-extrabold">{branchName}</p>
        <p className="text-sm font-medium text-ink-muted">{branchAddress}</p>
      </Row>

      <Row icon={CalendarClock} tile="bg-primary-dark" label="Appointment time">
        <p className="font-extrabold">{dateLabel}</p>
        <p className="text-sm font-extrabold text-primary">{timeRange}</p>
      </Row>

      <Row icon={serviceIcon} tile="bg-violet" label="Subject / consultation">
        <p className="font-extrabold">{serviceTitle}</p>
        <p className="text-sm font-medium text-ink-muted">{serviceNote}</p>
      </Row>

      <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="leading-snug">
          <p className="font-extrabold">100% Free Branch Visit</p>
          <p className="text-sm font-medium text-ink-muted">No consultation fee or mandatory account required</p>
        </div>
      </div>
    </Card>
  );
}
