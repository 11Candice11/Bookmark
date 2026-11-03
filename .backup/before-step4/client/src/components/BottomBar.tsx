import { ArrowLeft, ArrowRight, Bookmark, Phone } from "lucide-react";
import { SUPPORT_PHONE } from "../lib/contact";
import { Button, buttonStyles } from "./Button";
import { Container } from "./Container";

export interface BottomBarProps {
  /** Small caption above the value, e.g. "Currently Selected Service". */
  summaryLabel: string;
  /** What the user picked. Shown as `emptyText` when nothing is picked yet. */
  summaryValue?: string | null;
  emptyText?: string;
  nextLabel: string;
  /** Disables the next button, e.g. until a choice is made. */
  nextDisabled?: boolean;
  /** Leave unset when there is nowhere to go next yet. */
  onNext?: () => void;
  /** The back button only shows when both `backLabel` and `onBack` are set. */
  backLabel?: string;
  onBack?: () => void;
  backDisabled?: boolean;
}

/** Sticks to the bottom of the screen: current choice, back and next buttons, and a help line. */
export function BottomBar({
  summaryLabel,
  summaryValue,
  emptyText = "Nothing selected yet",
  nextLabel,
  nextDisabled,
  onNext,
  backLabel,
  onBack,
  backDisabled,
}: BottomBarProps) {
  return (
    <div className="sticky bottom-0 z-20 mt-auto bg-white shadow-bar-top">
      <Container className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3 sm:flex-nowrap sm:py-4">
        <div className="flex min-w-0 basis-full items-center gap-3 sm:basis-auto sm:flex-1">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Bookmark className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 leading-tight" aria-live="polite">
            <p className="text-[11px] font-semibold text-ink-muted">{summaryLabel}</p>
            <p className="truncate text-sm font-extrabold">{summaryValue ?? emptyText}</p>
          </div>
        </div>

        {backLabel && onBack && (
          // After the summary in the markup, so the summary stays on top on phones.
          // On wider screens `order-first` moves this to the left edge.
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={backDisabled}
            leading={<ArrowLeft className="size-4" aria-hidden="true" />}
            className="shrink-0 sm:order-first"
          >
            <span className="sr-only sm:not-sr-only">{backLabel}</span>
          </Button>
        )}

        <a href={SUPPORT_PHONE.href} className={buttonStyles("secondary", "md", "shrink-0")}>
          <Phone className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Need Help? Call Us</span>
        </a>

        <Button
          size="lg"
          disabled={nextDisabled}
          onClick={onNext}
          className="min-w-0 flex-1 font-extrabold uppercase sm:flex-none"
          trailing={
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20" aria-hidden="true">
              <ArrowRight className="size-4" strokeWidth={3} />
            </span>
          }
        >
          {nextLabel}
        </Button>
      </Container>
    </div>
  );
}
