import type { ComponentProps, ReactNode } from "react";
import { cx } from "../lib/cx";

export type ButtonVariant = "primary" | "secondary" | "tonal";
export type ButtonSize = "md" | "lg";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Rendered before the label. */
  leading?: ReactNode;
  /** Rendered after the label. */
  trailing?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-xl font-bold transition " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  // Solid blue with a pressed-down 3D edge. Used for the main action on a page.
  primary:
    "bg-primary text-white shadow-press-primary hover:brightness-110 " +
    "active:translate-y-1 active:shadow-none disabled:shadow-none disabled:hover:brightness-100",
  // Quiet grey. Used for supporting actions such as "Need help?".
  secondary: "bg-surface-muted text-ink hover:bg-surface-strong",
  // Light blue with a blue underline. Used for assistive actions such as "Listen to page".
  tonal:
    "bg-primary-soft text-primary-ink shadow-press-tonal hover:brightness-95 " +
    "active:translate-y-0.5 active:shadow-none",
};

const sizes: Record<ButtonSize, string> = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-4 text-base tracking-wide",
};

/** Class names for button styling, so links (<a>, <Link>) can look like buttons. */
export function buttonStyles(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cx(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  leading,
  trailing,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonStyles(variant, size, className)} {...props}>
      {leading}
      {children}
      {trailing}
    </button>
  );
}
