import type { ComponentProps, ReactNode } from "react";
import { cx } from "../lib/cx";

export type BadgeTone = "soft" | "solid" | "overlay" | "neutral";

interface BadgeProps extends ComponentProps<"span"> {
  tone?: BadgeTone;
  icon?: ReactNode;
}

const tones: Record<BadgeTone, string> = {
  // Light blue pill, e.g. "Simple 1-Tap Selection".
  soft: "bg-primary-soft text-primary",
  // Solid blue pill, e.g. "SELECTED".
  solid: "bg-primary text-white shadow-card",
  // White pill that sits on top of a photo.
  overlay: "bg-white/95 text-ink shadow-card",
  // Quiet grey pill for facts such as distance or a service on offer.
  neutral: "bg-surface-muted text-ink-muted",
};

export function Badge({ tone = "soft", icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        tones[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
