import type { HTMLAttributes } from "react";
import { cx } from "../lib/cx";

export type CardTone = "default" | "muted" | "selected";

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Use "label" for a card that wraps a radio input. */
  as?: "div" | "section" | "aside" | "label";
  tone?: CardTone;
}

// Every tone has a 2px border so switching tone never shifts the layout.
const tones: Record<CardTone, string> = {
  default: "border-transparent bg-white shadow-card",
  muted: "border-transparent bg-surface-muted",
  selected: "border-primary bg-primary-tint shadow-card",
};

export function Card({ as: Tag = "div", tone = "default", className, ...props }: CardProps) {
  return <Tag className={cx("relative rounded-2xl border-2 p-5 sm:p-6", tones[tone], className)} {...props} />;
}
