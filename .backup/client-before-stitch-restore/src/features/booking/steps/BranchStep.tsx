import { useMemo } from "react";
import type { BranchDto } from "@bookmark/shared";
import { BranchCard } from "../../../components/BranchCard";

export type BranchesState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; branches: BranchDto[] };

interface BranchStepProps {
  branches: BranchesState;
  province: string;
  onProvinceChange: (province: string) => void;
  selectedId: string | null;
  onSelect: (branch: BranchDto) => void;
  onRetry: () => void;
}

export function BranchStep({ branches, province, onProvinceChange, selectedId, onSelect, onRetry }: BranchStepProps) {
  const all = branches.status === "ready" ? branches.branches : [];
  const provinces = useMemo(() => [...new Set(all.map((b) => b.province))].sort(), [all]);
  const visible = province ? all.filter((b) => b.province === province) : all;

  if (branches.status === "loading") {
    return <p className="text-slate-500">Loading branches&hellip;</p>;
  }

  if (branches.status === "error") {
    return (
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p>{branches.message}</p>
        <button type="button" onClick={onRetry} className="mt-2 cursor-pointer font-medium underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="province" className="mb-1 block text-sm font-medium">
          Province
        </label>
        <select
          id="province"
          value={province}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 sm:w-64"
        >
          <option value="">All provinces</option>
          {provinces.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="text-slate-500">No branches available for booking here.</p>
      ) : (
        <div role="radiogroup" aria-label="Branches" className="grid gap-3 sm:grid-cols-2">
          {visible.map((branch) => (
            <BranchCard key={branch.id} branch={branch} selected={branch.id === selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
