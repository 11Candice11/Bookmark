import type { ReactNode } from "react";
import { Card } from "./Card";

interface StepIntroProps {
  /** Pill above the title, usually a <Badge>. */
  badge?: ReactNode;
  /** Id for the <h1> so groups on the page can reference it with aria-labelledby. */
  titleId?: string;
  title: string;
  description?: string;
  /** Control on the right, e.g. the "Listen to Page" button. */
  action?: ReactNode;
}

/** White card at the top of each booking step: badge, question, hint and an optional action. */
export function StepIntro({ badge, titleId, title, description, action }: StepIntroProps) {
  return (
    <Card as="section" className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="max-w-3xl">
        {badge}
        {/* tabIndex -1 lets the wizard move focus here when the step changes. */}
        <h1
          id={titleId}
          tabIndex={-1}
          className={`${badge ? "mt-3 " : ""}text-3xl leading-tight font-extrabold outline-none sm:text-[2.375rem]`}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-[38rem] text-lg leading-relaxed font-medium text-ink-muted">{description}</p>
        )}
      </div>
      {action}
    </Card>
  );
}
