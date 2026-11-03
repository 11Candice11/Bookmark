import { Volume2 } from "lucide-react";
import { Button } from "./Button";

interface ListenButtonProps {
  /** True while the page is being read aloud. */
  active: boolean;
  onClick: () => void;
  label?: string;
}

/** Read-aloud control. The label stays the same; `aria-pressed` reports the state. */
export function ListenButton({ active, onClick, label = "Listen to Page" }: ListenButtonProps) {
  return (
    <Button
      variant="tonal"
      aria-pressed={active}
      onClick={onClick}
      leading={<Volume2 className="size-5 shrink-0 text-primary" aria-hidden="true" />}
      className="shrink-0 self-start"
    >
      <span className="flex flex-col text-left leading-tight">
        <span className="text-sm">{label}</span>
        <span className="text-[11px] font-semibold">Spoken voice assistance</span>
      </span>
    </Button>
  );
}
