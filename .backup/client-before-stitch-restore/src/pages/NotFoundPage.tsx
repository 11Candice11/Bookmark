import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-slate-600">That page does not exist.</p>
      <Link to="/book" className="mt-4 inline-block font-medium text-indigo-700 underline">
        Book an appointment
      </Link>
    </div>
  );
}
