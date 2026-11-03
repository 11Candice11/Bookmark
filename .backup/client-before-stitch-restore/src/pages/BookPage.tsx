import { BookingWizard } from "../features/booking/BookingWizard";

export default function BookPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Book a branch appointment</h1>
      <p className="mt-1 text-slate-600">Choose a branch, pick a time and we will confirm it by email.</p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <BookingWizard />
      </div>
    </>
  );
}
