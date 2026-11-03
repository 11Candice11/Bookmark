import type { ComponentProps } from "react";
import { cx } from "../lib/cx";

/** Centres content and keeps the top bar, stepper, page and footer aligned. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("mx-auto w-full max-w-[69rem] px-4 sm:px-6", className)} {...props} />;
}
