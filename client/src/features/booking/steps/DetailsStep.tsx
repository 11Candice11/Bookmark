import { useState } from "react";
import { Accessibility, Bell, CreditCard, Mail, ShieldCheck, Smartphone, User } from "lucide-react";
import type { BranchDto } from "@bookmark/shared";
import { BookingSummary } from "../../../components/BookingSummary";
import { CheckboxCard } from "../../../components/CheckboxCard";
import { FieldCard } from "../../../components/FieldCard";
import { ListenButton } from "../../../components/ListenButton";
import { StepIntro } from "../../../components/StepIntro";
import { dateInBranchTz } from "../../../lib/dates";
import { formatAddress, formatAppointmentDate, formatSlotTime } from "../../../lib/formatters";
import { useSpeech } from "../../../lib/useSpeech";
import type { ServiceOption } from "../services";
import type { DetailErrors, DetailsState, FlagField, TextField } from "../useBookingForm";

const TITLE = "Who is visiting us?";
const DESCRIPTION = "Enter your contact details so we can save your spot and confirm your booking.";

interface DetailsStepProps {
  branch: BranchDto;
  service: ServiceOption;
  /** The chosen slot, as an ISO instant. */
  startsAt: string;
  /** When the slot ends, as an ISO instant. */
  endsAt: string;
  details: DetailsState;
  errors: DetailErrors;
  /** Show every error, even for fields the customer has not touched yet. */
  showAllErrors: boolean;
  onTextChange: (field: TextField, value: string) => void;
  onFlagChange: (field: FlagField, value: boolean) => void;
}

/** Step 4: who is coming, how to reach them, and a recap of the booking. Confirming happens from here. */
export function DetailsStep({
  branch,
  service,
  startsAt,
  endsAt,
  details,
  errors,
  showAllErrors,
  onTextChange,
  onFlagChange,
}: DetailsStepProps) {
  const [touched, setTouched] = useState<Set<TextField>>(new Set());
  const speech = useSpeech();

  const touch = (field: TextField) => setTouched((previous) => new Set(previous).add(field));
  const errorFor = (field: TextField) => (showAllErrors || touched.has(field) ? errors[field] : undefined);

  const dateLabel = formatAppointmentDate(dateInBranchTz(new Date(startsAt)));
  const timeRange = `${formatSlotTime(startsAt)} – ${formatSlotTime(endsAt)}`;

  function toggleListening() {
    if (speech.speaking) {
      speech.stop();
      return;
    }
    speech.speak(
      `${TITLE} ${DESCRIPTION} Your appointment is at ${branch.name}, on ${dateLabel}, from ${timeRange}, for ${service.title}.`,
    );
  }

  return (
    <div className="space-y-6">
      <StepIntro
        title={TITLE}
        description={DESCRIPTION}
        action={speech.supported && <ListenButton label="Listen aloud" active={speech.speaking} onClick={toggleListening} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-5">
          <FieldCard
            label="Full Legal Name"
            icon={User}
            error={errorFor("fullName")}
            hint={
              <>
                <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                Must match your official government photo ID
              </>
            }
          >
            {(field) => (
              <input
                id={field.id}
                type="text"
                autoComplete="name"
                value={details.fullName}
                onChange={(event) => onTextChange("fullName", event.target.value)}
                onBlur={() => touch("fullName")}
                aria-invalid={field.invalid}
                aria-describedby={field.describedBy}
                className={field.className}
              />
            )}
          </FieldCard>

          <FieldCard
            label="Mobile Phone Number"
            icon={Smartphone}
            error={errorFor("phone")}
            hint={
              <>
                <Bell className="size-4 shrink-0 text-primary" aria-hidden="true" />
                We'll only use this to contact you about your appointment.
              </>
            }
          >
            {(field) => (
              <input
                id={field.id}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="082 123 4567"
                value={details.phone}
                onChange={(event) => onTextChange("phone", event.target.value)}
                onBlur={() => touch("phone")}
                aria-invalid={field.invalid}
                aria-describedby={field.describedBy}
                className={field.className}
              />
            )}
          </FieldCard>

          <FieldCard
            label="Email Address"
            labelNote="(Optional)"
            icon={Mail}
            accent="violet"
            error={errorFor("email")}
            hint="We'll email your booking confirmation here."
          >
            {(field) => (
              <input
                id={field.id}
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={details.email}
                onChange={(event) => onTextChange("email", event.target.value)}
                onBlur={() => touch("email")}
                aria-invalid={field.invalid}
                aria-describedby={field.describedBy}
                className={field.className}
              />
            )}
          </FieldCard>

          <FieldCard
            label="SA ID Number"
            labelNote="(Optional)"
            icon={CreditCard}
            error={errorFor("idNumber")}
            hint="Your 13-digit South African National ID number. Lets you look up this booking later without a reference number."
          >
            {(field) => (
              <input
                id={field.id}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="e.g. 9001015800083"
                maxLength={13}
                value={details.idNumber}
                onChange={(event) => onTextChange("idNumber", event.target.value.replace(/\D/g, ""))}
                onBlur={() => touch("idNumber")}
                aria-invalid={field.invalid}
                aria-describedby={field.describedBy}
                className={field.className}
              />
            )}
          </FieldCard>

          <CheckboxCard
            checked={details.smsReminder}
            onChange={(checked) => onFlagChange("smsReminder", checked)}
            label="Send me a text message (SMS) reminder 2 hours before"
            description="Helpful reminder with directions and what documents to bring. Standard carrier rates may apply."
          />
          <CheckboxCard
            checked={details.needsAssistance}
            onChange={(checked) => onFlagChange("needsAssistance", checked)}
            icon={Accessibility}
            label="I need wheelchair ramp access or special help"
            description="Tick this and the branch will see it on your booking, so they can be ready to help when you arrive."
          />
        </div>

        <div className="lg:sticky lg:top-6">
          <BookingSummary
            branchName={branch.name}
            branchAddress={formatAddress(branch.address)}
            dateLabel={dateLabel}
            timeRange={timeRange}
            serviceTitle={service.title}
            serviceNote={service.category}
            serviceIcon={service.icon}
          />
        </div>
      </div>
    </div>
  );
}
