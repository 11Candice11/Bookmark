import { useId } from "react";
import { Accessibility } from "lucide-react";
import { Badge } from "./Badge";
import { Card } from "./Card";

interface AccessibilityBannerProps {
  /** Photo for the left side. A neutral placeholder is shown until one is provided. */
  image?: { src: string; alt: string };
}

export function AccessibilityBanner({ image }: AccessibilityBannerProps) {
  const headingId = useId();

  return (
    <Card as="section" aria-labelledby={headingId} className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative w-full shrink-0 overflow-hidden rounded-xl sm:w-72">
        {image ? (
          <img src={image.src} alt={image.alt} className="aspect-7/5 w-full object-cover" />
        ) : (
          <div
            aria-hidden="true"
            className="grid aspect-7/5 w-full place-items-center bg-linear-to-br from-primary-soft to-primary-tint"
          >
            <Accessibility className="size-14 text-primary/50" />
          </div>
        )}
        <Badge
          tone="overlay"
          icon={<span className="size-2 rounded-full bg-primary" aria-hidden="true" />}
          className="absolute bottom-3 left-3"
        >
          Priority Desk Staffed
        </Badge>
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-xs font-extrabold text-primary">
          <Accessibility className="size-4" aria-hidden="true" />
          Full Step-Free Physical Accessibility
        </p>
        <h2 id={headingId} className="mt-2 text-xl font-extrabold">
          We make in-person banking comfortable for everyone
        </h2>
        <p className="mt-2 text-base leading-relaxed font-medium text-ink-muted">
          Wheelchair ramps, oversized tactile signature pads, hearing loop sound amplification, and dedicated
          translators are ready for your arrival at all branches.
        </p>
      </div>
    </Card>
  );
}
