import type { ReactNode } from "react";

interface SummaryCardProps {
  title?: string;
  items: { label: string; value: ReactNode }[];
}

/** A read-only list of label/value rows. Used on the review step and the confirmation page. */
export function SummaryCard({ title, items }: SummaryCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      {title && <h3 className="border-b border-slate-200 px-4 py-3 font-medium">{title}</h3>}
      <dl className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.label} className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm text-slate-500">{item.label}</dt>
            <dd className="text-sm text-slate-900 sm:col-span-2">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
