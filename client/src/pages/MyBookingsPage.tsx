import { useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Hash,
  HelpCircle,
  XCircle,
} from "lucide-react";
import type { BookingDto } from "@bookmark/shared";
import { getBooking, lookupBookingsByIdNumber } from "../api/bookings";
import { ApiError, errorMessage } from "../api/client";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { SummaryCard } from "../components/SummaryCard";
import { dateInBranchTz } from "../lib/dates";
import { REASON_LABELS, formatAddress, formatDateLong, formatTimeRange } from "../lib/formatters";
import { cx } from "../lib/cx";

/* -------------------------------------------------------------------------- */
/* Input detection                                                            */
/* -------------------------------------------------------------------------- */

/** BM- prefix + 8 chars from the booking reference alphabet */
const REFERENCE_RE = /^BM-[A-Z0-9]{8}$/i;

/** Exactly 13 numeric digits */
const SA_ID_RE = /^\d{13}$/;

type InputKind = "reference" | "saId" | "unknown";

function detectKind(raw: string): InputKind {
  const v = raw.trim();
  if (REFERENCE_RE.test(v)) return "reference";
  if (SA_ID_RE.test(v)) return "saId";
  return "unknown";
}

/* -------------------------------------------------------------------------- */
/* Page state                                                                 */
/* -------------------------------------------------------------------------- */

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "notFound"; query: string }
  | { status: "error"; message: string }
  | { status: "ready"; bookings: BookingDto[] };

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function MyBookingsPage() {
  return (
    <main className="flex-1 py-8">
      <Container>
        <div className="mx-auto max-w-3xl">
          <MyBookingsContent />
        </div>
      </Container>
    </main>
  );
}

function MyBookingsContent() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<LookupState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const kind = detectKind(trimmed);

  const hasError = state.status === "notFound" || state.status === "error";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    setState({ status: "loading" });

    try {
      if (kind === "saId") {
        const { bookings } = await lookupBookingsByIdNumber(trimmed);
        setState({ status: "ready", bookings });
      } else {
        // Reference lookup (also catches unknown formats — the API will 404 or 400 gracefully)
        const booking = await getBooking(trimmed.toUpperCase());
        setState({ status: "ready", bookings: [booking] });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setState({ status: "notFound", query: kind === "reference" ? trimmed.toUpperCase() : trimmed });
      } else {
        setState({ status: "error", message: errorMessage(err) });
      }
    }
  }

  function handleReset() {
    setQuery("");
    setState({ status: "idle" });
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const showSearch = state.status !== "ready";

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="soft">Self-Service Desk</Badge>
            <Badge tone="neutral">Live Lookup</Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Find Your Booking</h1>
          <p className="mt-2 max-w-md text-ink-muted">
            Enter your booking reference or South African ID number to access your appointment
            details.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Search card                                                         */}
      {/* ------------------------------------------------------------------ */}
      {showSearch && (
        <div className="rounded-2xl border-2 border-transparent bg-white p-6 shadow-card">
          <p className="font-extrabold">Booking Reference or SA National ID</p>
          <p className="mt-1 text-sm text-ink-muted">
            Format:{" "}
            <span className="font-semibold text-ink">BM-XXXXX</span> or valid{" "}
            <span className="font-semibold text-ink">13-digit identification</span>
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mt-4 flex gap-2">
              <label htmlFor="booking-query" className="sr-only">
                Booking reference or SA ID number
              </label>
              <div className="relative flex-1">
                <Hash
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-subtle"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  id="booking-query"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (state.status !== "idle") setState({ status: "idle" });
                  }}
                  placeholder="e.g. BM-7K3F9Q2X or 13-digit SA ID number"
                  aria-describedby="query-hint"
                  aria-invalid={hasError}
                  className={cx(
                    "w-full rounded-xl border-2 bg-white py-3 pl-10 pr-4 text-base font-semibold transition",
                    "placeholder:font-medium placeholder:text-ink-subtle/60",
                    "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    hasError
                      ? "border-red-500"
                      : "border-surface-strong focus-visible:border-primary",
                  )}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={state.status === "loading"}
                trailing={
                  <span
                    className="grid size-6 place-items-center rounded-full bg-white/20"
                    aria-hidden="true"
                  >
                    <ArrowRight className="size-4" strokeWidth={3} />
                  </span>
                }
              >
                {state.status === "loading" ? "Searching…" : "Find Booking"}
              </Button>
            </div>

            {/* Inline errors */}
            {hasError && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {state.status === "notFound" ? (
                  <span>
                    No booking found for{" "}
                    <span className="font-mono">{state.query}</span>. Check your SMS
                    confirmation or email slip and try again.
                  </span>
                ) : (
                  <span>{state.message}</span>
                )}
              </div>
            )}
          </form>

          {/* Help hint */}
          <div
            id="query-hint"
            className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted px-4 py-3 text-sm"
          >
            <span className="flex items-center gap-2 font-semibold">
              <HelpCircle className="size-4 text-primary" aria-hidden="true" />
              Where can I find my reference?
            </span>
            <span className="text-ink-muted">
              Check your SMS confirmation or email slip
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Results                                                             */}
      {/* ------------------------------------------------------------------ */}
      {state.status === "ready" && (
        <BookingResults bookings={state.bookings} onReset={handleReset} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Results view                                                               */
/* -------------------------------------------------------------------------- */

function BookingResults({
  bookings,
  onReset,
}: {
  bookings: BookingDto[];
  onReset: () => void;
}) {
  return (
    <div className="space-y-6" role="region" aria-label="Booking results">
      {bookings.length === 0 ? (
        /* SA ID lookup returned no bookings */
        <div className="rounded-2xl border-2 border-transparent bg-white p-8 text-center shadow-card">
          <p className="text-lg font-extrabold">No bookings found</p>
          <p className="mt-2 text-sm text-ink-muted">
            No appointments are linked to that ID number. If you recently booked, make sure the
            same ID was entered during checkout.
          </p>
          <button
            type="button"
            onClick={onReset}
            className={cx(
              "mt-5 flex items-center gap-2 rounded-xl border-2 border-surface-strong bg-white px-5 py-3",
              "mx-auto text-sm font-bold transition hover:bg-surface-muted",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            )}
          >
            <BookOpen className="size-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : (
        <>
          {bookings.length > 1 && (
            <p className="text-sm font-semibold text-ink-muted">
              {bookings.length} bookings found — most recent first.
            </p>
          )}

          {bookings.map((booking) => (
            <BookingCard key={booking.reference} booking={booking} />
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className={cx(
                "flex items-center gap-2 rounded-xl border-2 border-surface-strong bg-white px-5 py-3",
                "text-sm font-bold transition hover:bg-surface-muted",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              )}
            >
              <BookOpen className="size-4" aria-hidden="true" />
              Look up another booking
            </button>

            <Link
              to="/book"
              className={cx(
                "flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-card",
                "transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              )}
            >
              Book another appointment
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: BookingDto }) {
  const cancelled = booking.status === "CANCELLED";

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center gap-3 rounded-2xl border-2 border-transparent bg-white px-6 py-4 shadow-card">
        <div
          aria-hidden="true"
          className={cx(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            cancelled ? "bg-slate-100 text-slate-400" : "bg-emerald-50 text-emerald-600",
          )}
        >
          {cancelled ? <XCircle className="size-5" /> : <CheckCircle2 className="size-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-lg font-extrabold tracking-widest text-primary">
            {booking.reference}
          </p>
          <p className="text-sm text-ink-muted">{booking.branch.name}</p>
        </div>

        <Badge tone={cancelled ? "neutral" : "soft"}>
          {cancelled ? "Cancelled" : "Confirmed"}
        </Badge>
      </div>

      {/* Details */}
      <SummaryCard
        title="Appointment Details"
        items={[
          { label: "Branch", value: booking.branch.name },
          { label: "Address", value: formatAddress(booking.branch.address) },
          ...(booking.branch.primaryNumber
            ? [{ label: "Phone", value: booking.branch.primaryNumber }]
            : []),
          {
            label: "Date",
            value: formatDateLong(dateInBranchTz(new Date(booking.startsAt))),
          },
          { label: "Time", value: formatTimeRange(booking.startsAt, booking.endsAt) },
          { label: "Name", value: booking.fullName },
          { label: "Service", value: REASON_LABELS[booking.reason] },
          ...(booking.notes ? [{ label: "Notes", value: booking.notes }] : []),
        ]}
      />
    </div>
  );
}
