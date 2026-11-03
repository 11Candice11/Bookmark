import { Map as MapIcon, MapPin } from "lucide-react";
import { Card } from "./Card";

interface BranchMapProps {
  count: number;
}

/**
 * Placeholder for the map panel in the design. It only reserves the space.
 * Swap the grey block for a real map once a map library and tile provider are chosen;
 * every branch already has latitude and longitude.
 */
export function BranchMap({ count }: BranchMapProps) {
  return (
    <Card as="section" aria-label="Branch map" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-extrabold">
          <MapIcon className="size-4 text-primary" aria-hidden="true" />
          Branch map
        </h2>
        <p className="text-xs font-bold text-ink-muted">
          {count} {count === 1 ? "branch" : "branches"}
        </p>
      </div>
      <div aria-hidden="true" className="grid h-44 place-items-center rounded-xl bg-surface-muted">
        <span className="flex gap-1 rounded-lg bg-white px-3 py-2 text-primary shadow-card">
          <MapPin className="size-4" />
          <MapPin className="size-4" />
        </span>
      </div>
    </Card>
  );
}
