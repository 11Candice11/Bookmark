import { useId, useMemo } from "react";
import { MapPin, TriangleAlert } from "lucide-react";
import type { BranchDto } from "@bookmark/shared";
import { Badge } from "../../../components/Badge";
import { BranchCard } from "../../../components/BranchCard";
import { BranchMap } from "../../../components/BranchMap";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { ListenButton } from "../../../components/ListenButton";
import { LocationBar } from "../../../components/LocationBar";
import { StepIntro } from "../../../components/StepIntro";
import { SUPPORT_PHONE } from "../../../lib/contact";
import { formatAddress, formatDistance } from "../../../lib/formatters";
import { distanceKm } from "../../../lib/geo";
import { useGeolocation } from "../../../lib/useGeolocation";
import { useSpeech } from "../../../lib/useSpeech";

export type BranchesState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; branches: BranchDto[] };

const TITLE = "Where would you like to visit?";
const DESCRIPTION = "Pick the branch you'd like to visit for your appointment.";
/** Reading out every branch would take minutes, so "Listen" covers the first few. */
const SPOKEN_BRANCH_LIMIT = 5;

interface BranchStepProps {
  branches: BranchesState;
  province: string;
  onProvinceChange: (province: string) => void;
  selectedId: string | null;
  onSelect: (branch: BranchDto) => void;
  onRetry: () => void;
}

interface BranchRow {
  branch: BranchDto;
  distanceKm: number | null;
}

/** Step 2: pick the branch the appointment is at. The wizard loads the branches from the API. */
export function BranchStep({ branches, province, onProvinceChange, selectedId, onSelect, onRetry }: BranchStepProps) {
  const titleId = useId();
  const groupName = useId();
  const geolocation = useGeolocation();
  const speech = useSpeech();

  const all = useMemo(() => (branches.status === "ready" ? branches.branches : []), [branches]);
  const provinces = useMemo(() => [...new Set(all.map((b) => b.province))].sort(), [all]);

  // Nearest first once the user shares their location; otherwise keep the server's order.
  const rows = useMemo<BranchRow[]>(() => {
    const inProvince = province ? all.filter((b) => b.province === province) : all;
    const here = geolocation.position;
    if (!here) return inProvince.map((branch) => ({ branch, distanceKm: null }));

    return inProvince
      .map((branch) => ({
        branch,
        distanceKm:
          branch.latitude !== null && branch.longitude !== null
            ? distanceKm(here, { latitude: branch.latitude, longitude: branch.longitude })
            : null,
      }))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }, [all, province, geolocation.position]);

  function toggleListening() {
    if (speech.speaking) {
      speech.stop();
      return;
    }
    const spoken = rows.slice(0, SPOKEN_BRANCH_LIMIT).map(({ branch, distanceKm: km }) => {
      const away = km !== null ? ` ${formatDistance(km)} away.` : "";
      return `${branch.name}. ${formatAddress(branch.address)}.${away}`;
    });
    const more = rows.length - spoken.length;
    const tail = more > 0 ? `And ${more} more ${more === 1 ? "branch" : "branches"} below.` : "";
    speech.speak([TITLE, DESCRIPTION, ...spoken, tail].join(" "));
  }

  const summary =
    geolocation.status === "located" ? "Nearest first" : `${rows.length} ${rows.length === 1 ? "branch" : "branches"}`;

  return (
    <div className="space-y-6">
      <StepIntro
        titleId={titleId}
        badge={<Badge icon={<MapPin className="size-3.5" aria-hidden="true" />}>In-person banking</Badge>}
        title={TITLE}
        description={DESCRIPTION}
        action={
          speech.supported && (
            <ListenButton label="Listen to Directions" active={speech.speaking} onClick={toggleListening} />
          )
        }
      />

      {branches.status === "ready" && all.length > 0 && (
        <LocationBar
          summary={summary}
          provinces={provinces}
          province={province}
          onProvinceChange={onProvinceChange}
          canLocate={geolocation.supported}
          locationStatus={geolocation.status}
          onLocate={geolocation.locate}
        />
      )}

      {branches.status === "loading" && <BranchListSkeleton />}

      {branches.status === "error" && (
        <Card as="section" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="alert" className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-ink-muted" aria-hidden="true" />
            <div>
              <p className="font-extrabold">We couldn't load the branches.</p>
              <p className="mt-1 text-ink-muted">{branches.message}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </Card>
      )}

      {branches.status === "ready" && all.length === 0 && (
        <Card as="section" tone="muted">
          <p className="font-extrabold">No branches are taking bookings right now.</p>
          <p className="mt-1 text-ink-muted">
            Please call us on{" "}
            <a href={SUPPORT_PHONE.href} className="font-bold text-primary hover:underline">
              {SUPPORT_PHONE.display}
            </a>{" "}
            and we'll help you book.
          </p>
        </Card>
      )}

      {rows.length > 0 && (
        <>
          <div role="radiogroup" aria-labelledby={titleId} className="space-y-5">
            {rows.map(({ branch, distanceKm: km }) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                distanceKm={km}
                name={groupName}
                selected={branch.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
          <BranchMap count={rows.length} />
        </>
      )}
    </div>
  );
}

function BranchListSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-5">
      <span className="sr-only">Loading branches…</span>
      {[0, 1, 2].map((i) => (
        <Card key={i} aria-hidden="true" className="flex animate-pulse items-center gap-5">
          <div className="size-16 shrink-0 rounded-xl bg-surface-strong" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-1/3 rounded bg-surface-strong" />
            <div className="h-4 w-2/3 rounded bg-surface-strong" />
            <div className="h-6 w-1/2 rounded-full bg-surface-strong" />
          </div>
          <div className="hidden h-11 w-48 rounded-xl bg-surface-strong sm:block" />
        </Card>
      ))}
    </div>
  );
}
