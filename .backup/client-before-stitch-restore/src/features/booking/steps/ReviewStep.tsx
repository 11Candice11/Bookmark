import type { BranchDto } from "@bookmark/shared";
import { SummaryCard } from "../../../components/SummaryCard";
import { dateInBranchTz } from "../../../lib/dates";
import { REASON_LABELS, formatAddress, formatDateLong, formatTimeRange } from "../../../lib/formatters";
import type { DetailsState } from "../useBookingForm";

interface ReviewStepProps {
  branch: BranchDto;
  startsAt: string;
  endsAt: string;
  details: DetailsState;
}

export function ReviewStep({ branch, startsAt, endsAt, details }: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <SummaryCard
        title="Appointment"
        items={[
          { label: "Branch", value: branch.name },
          { label: "Address", value: formatAddress(branch.address) },
          { label: "Date", value: formatDateLong(dateInBranchTz(new Date(startsAt))) },
          { label: "Time", value: formatTimeRange(startsAt, endsAt) },
        ]}
      />
      <SummaryCard
        title="Your details"
        items={[
          { label: "Name", value: details.fullName.trim() },
          { label: "Email", value: details.email.trim() },
          { label: "Phone", value: details.phone.trim() },
          { label: "Reason", value: details.reason ? REASON_LABELS[details.reason] : "" },
          ...(details.notes.trim() ? [{ label: "Notes", value: details.notes.trim() }] : []),
        ]}
      />
    </div>
  );
}
