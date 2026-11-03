import type { BranchDto } from "@bookmark/shared";
import { formatAddress, formatClosedDays, formatHours } from "../lib/formatters";

interface BranchCardProps {
  branch: BranchDto;
  selected: boolean;
  onSelect: (branch: BranchDto) => void;
}

/** One selectable branch. Render several inside an element with role="radiogroup". */
export function BranchCard({ branch, selected, onSelect }: BranchCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(branch)}
      className={
        "w-full cursor-pointer rounded-lg border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 " +
        (selected
          ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")
      }
    >
      <span className="flex items-start justify-between gap-3">
        <span className="font-medium text-slate-900">{branch.name}</span>
        <span
          aria-hidden="true"
          className={
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] text-white " +
            (selected ? "border-indigo-600 bg-indigo-600" : "border-slate-300")
          }
        >
          {selected && "\u2713"}
        </span>
      </span>
      <span className="mt-1 block text-sm text-slate-600">{formatAddress(branch.address)}</span>
      <span className="mt-2 block text-sm text-slate-500">
        {formatHours(branch.opensAt, branch.closesAt)} &middot; {formatClosedDays(branch.closedDays)}
      </span>
    </button>
  );
}
