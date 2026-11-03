import { useId } from "react";
import { Pointer } from "lucide-react";
import { AccessibilityBanner } from "../../../components/AccessibilityBanner";
import { Badge } from "../../../components/Badge";
import { HelpCard } from "../../../components/HelpCard";
import { ListenButton } from "../../../components/ListenButton";
import { ServiceCard } from "../../../components/ServiceCard";
import { StepIntro } from "../../../components/StepIntro";
import { useSpeech } from "../../../lib/useSpeech";
import { SERVICES, type ServiceId } from "../services";

const TITLE = "What do you need help with today?";
const DESCRIPTION = "Tap one picture below to continue. You can change your choice anytime.";

interface ServiceStepProps {
  selectedId: ServiceId | null;
  onSelect: (id: ServiceId) => void;
}

/** Step 1: pick the service the appointment is for. */
export function ServiceStep({ selectedId, onSelect }: ServiceStepProps) {
  const titleId = useId();
  const groupName = useId();
  const { supported, speaking, speak, stop } = useSpeech();

  function toggleListening() {
    if (speaking) {
      stop();
      return;
    }
    const options = SERVICES.map((service) => `${service.title}. ${service.description}`);
    speak([TITLE, DESCRIPTION, ...options].join(" "));
  }

  return (
    <div className="space-y-6">
      <StepIntro
        titleId={titleId}
        badge={
          <Badge icon={<Pointer className="size-3.5" aria-hidden="true" />}>Simple 1-Tap Selection</Badge>
        }
        title={TITLE}
        description={DESCRIPTION}
        action={supported && <ListenButton active={speaking} onClick={toggleListening} />}
      />

      <div role="radiogroup" aria-labelledby={titleId} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            name={groupName}
            selected={service.id === selectedId}
            onSelect={onSelect}
          />
        ))}
        <HelpCard />
      </div>

      <AccessibilityBanner />
    </div>
  );
}
