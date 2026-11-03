import { NavLink } from "react-router";
import { cx } from "../lib/cx";
import { Container } from "./Container";
import { Logo } from "./Logo";

const NAV_ITEMS = [
  { to: "/book", label: "Book Appointment" },
  { to: "/bookings", label: "My Bookings" },
  { to: "/branches", label: "Find Branch" },
] as const;

export function TopBar() {
  return (
    <header className="bg-white shadow-bar">
      <Container className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 sm:h-16 sm:flex-nowrap sm:py-0">
        <Logo />
        <nav aria-label="Main" className="flex w-full gap-1 rounded-xl bg-surface-muted p-1 sm:w-auto">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                cx(
                  "flex-1 rounded-lg px-2.5 py-2 text-center text-xs font-bold whitespace-nowrap transition sm:flex-none sm:px-4 sm:text-sm",
                  "focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-primary",
                  isActive ? "bg-primary text-white shadow-card" : "text-ink-muted hover:bg-white/70",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </Container>
    </header>
  );
}
