import type { ReactNode } from "react";
import { CalendarCheck } from "lucide-react";
import { Card } from "./Card";

interface AppointmentSummaryProps {
  /** Big line, e.g. "Thursday, Nov 13 at 10:00 AM". */
  headline: string;
  /** Smaller line under it, e.g. the branch and service. */
  detail: string;
  /** Pill on the right. */
  badge?: ReactNode;
}

/** Recap of the chosen date and time, with a blue bar down the left edge. */
export function AppointmentSummary({ headline, detail, badge }: AppointmentSummaryProps) {
  return (
    <Card
      as="section"
      aria-label="Your selected appointment"
      className="flex flex-col gap-4 border-l-4 border-l-primary sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <CalendarCheck className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold tracking-wider text-primary uppercase">Your selected appointment</p>
          <p className="text-xl font-extrabold sm:text-2xl">{headline}</p>
          <p className="text-sm font-medium text-ink-muted">{detail}</p>
        </div>
      </div>
      {badge}
    </Card>
  );
}
