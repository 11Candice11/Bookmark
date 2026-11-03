import { Bookmark } from "lucide-react";
import { Link } from "react-router";

export function Logo() {
  return (
    <Link
      to="/"
      aria-label="Bookmark home"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <span className="grid size-9 place-items-center rounded-lg bg-primary text-white shadow-card">
        <Bookmark className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-extrabold tracking-wide text-primary">BOOKMARK</span>
    </Link>
  );
}
