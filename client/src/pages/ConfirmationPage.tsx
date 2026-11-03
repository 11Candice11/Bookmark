import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { BookingDto } from "@bookmark/shared";
import { getBooking } from "../api/bookings";
import { ApiError, errorMessage } from "../api/client";
import { Container } from "../components/Container";
import { SummaryCard } from "../components/SummaryCard";
import { dateInBranchTz } from "../lib/dates";
import { REASON_LABELS, formatAddress, formatDateLong, formatTimeRange } from "../lib/formatters";

type State =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error"; message: string }
  | { status: "ready"; booking: BookingDto };

export default function ConfirmationPage() {
  return (
    <main className="flex-1 py-8">
      <Container>
        <div className="mx-auto max-w-3xl">
          <ConfirmationContent />
        </div>
      </Container>
    </main>
  );
}

function ConfirmationContent() {
  const { reference = "" } = useParams();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getBooking(reference)
      .then((booking) => !cancelled && setState({ status: "ready", booking }))
      .catch((err) => {
        if (cancelled) return;
        setState(
          err instanceof ApiError && err.status === 404
            ? { status: "notFound" }
            : { status: "error", message: errorMessage(err) },
        );
      });
    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (state.status === "loading") return <p className="text-slate-500">Loading your booking&hellip;</p>;

  if (state.status === "notFound") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold">We could not find that booking</h1>
        <p className="mt-2 text-slate-600">
          Check the reference <span className="font-mono">{reference}</span> and try again.
        </p>
        <Link to="/book" className="mt-4 inline-block font-medium text-indigo-700 underline">
          Make a new booking
        </Link>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {state.message}
      </div>
    );
  }

  const { booking } = state;
  const cancelled = booking.status === "CANCELLED";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div
          aria-hidden="true"
          className={
            "mx-auto flex size-12 items-center justify-center rounded-full text-2xl text-white " +
            (cancelled ? "bg-slate-400" : "bg-emerald-600")
          }
        >
          {cancelled ? "\u2715" : "\u2713"}
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          {cancelled ? "This booking was cancelled" : "Your appointment is confirmed"}
        </h1>
        <p className="mt-3 text-sm text-slate-500">Your reference</p>
        <p className="font-mono text-2xl font-semibold tracking-wider text-indigo-700">{booking.reference}</p>
        {!cancelled && (
          <p className="mt-3 text-sm text-slate-600">
            We will email you a confirmation. Please bring your ID and quote this reference at the branch.
          </p>
        )}
      </div>

      <SummaryCard
        title="Appointment"
        items={[
          { label: "Branch", value: booking.branch.name },
          { label: "Address", value: formatAddress(booking.branch.address) },
          ...(booking.branch.primaryNumber ? [{ label: "Phone", value: booking.branch.primaryNumber }] : []),
          { label: "Date", value: formatDateLong(dateInBranchTz(new Date(booking.startsAt))) },
          { label: "Time", value: formatTimeRange(booking.startsAt, booking.endsAt) },
          { label: "Name", value: booking.fullName },
          { label: "Service", value: REASON_LABELS[booking.reason] },
          ...(booking.notes ? [{ label: "Notes", value: booking.notes }] : []),
        ]}
      />

      <Link to="/book" className="inline-block font-medium text-indigo-700 underline">
        Book another appointment
      </Link>
    </div>
  );
}
