import { CircleQuestionMark, Phone } from "lucide-react";
import { SUPPORT_PHONE } from "../lib/contact";
import { Card } from "./Card";

/** Reassurance card shown beside the service options for people who can't decide. */
export function HelpCard() {
  return (
    <Card as="aside" tone="muted" className="flex h-full flex-col">
      <span className="grid size-10 place-items-center rounded-lg border border-black/10 bg-white/70">
        <CircleQuestionMark className="size-5 text-ink-muted" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-extrabold">Not sure what to pick?</h2>
      <p className="mt-2 text-base leading-relaxed font-medium text-ink-muted">
        Choose any option that feels closest. Our friendly branch desk will guide you to the right person upon
        arrival.
      </p>
      <a
        href={SUPPORT_PHONE.href}
        className="mt-auto inline-flex items-center gap-2 self-start rounded pt-6 text-sm font-extrabold text-primary hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Phone className="size-4" aria-hidden="true" />
        Call {SUPPORT_PHONE.display}
      </a>
    </Card>
  );
}
