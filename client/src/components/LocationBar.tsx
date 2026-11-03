import { useId } from "react";
import { LoaderCircle, LocateFixed, MapPin } from "lucide-react";
import type { GeolocationStatus } from "../lib/useGeolocation";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";

interface LocationBarProps {
  /** Short status for the pill, e.g. "30 branches" or "Nearest first". */
  summary: string;
  provinces: readonly string[];
  /** The chosen province, or "" for all of them. */
  province: string;
  onProvinceChange: (province: string) => void;
  /** False in browsers without geolocation; the button is then hidden. */
  canLocate: boolean;
  locationStatus: GeolocationStatus;
  onLocate: () => void;
}

const LOCATION_MESSAGES: Partial<Record<GeolocationStatus, string>> = {
  denied: "Location is turned off for this site, so we can't sort by distance. You can still pick any branch below.",
  failed: "We couldn't find your location. Try again, or pick a branch from the list.",
};

/** Ways to narrow the branch list: by province, or nearest-first using the user's location. */
export function LocationBar({
  summary,
  provinces,
  province,
  onProvinceChange,
  canLocate,
  locationStatus,
  onLocate,
}: LocationBarProps) {
  const selectId = useId();
  const locating = locationStatus === "locating";
  const message = LOCATION_MESSAGES[locationStatus];

  return (
    <Card as="section" aria-label="Find a branch" className="space-y-3 py-4 sm:py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Badge icon={<MapPin className="size-3.5" aria-hidden="true" />} className="mr-auto" role="status">
          {locating ? "Finding your location…" : summary}
        </Badge>

        <div className="flex items-center gap-2">
          <label htmlFor={selectId} className="text-sm font-bold">
            Province
          </label>
          <select
            id={selectId}
            value={province}
            onChange={(event) => onProvinceChange(event.target.value)}
            className="rounded-xl bg-surface-muted px-3 py-2.5 text-sm font-bold text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <option value="">All provinces</option>
            {provinces.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {canLocate && (
          <Button
            onClick={onLocate}
            disabled={locating}
            leading={
              locating ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LocateFixed className="size-4" aria-hidden="true" />
              )
            }
          >
            Use My Location
          </Button>
        )}
      </div>

      {message && (
        <p role="status" className="text-sm font-medium text-ink-muted">
          {message}
        </p>
      )}
    </Card>
  );
}
