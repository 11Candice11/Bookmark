import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { buttonStyles } from "../components/Button";
import { Container } from "../components/Container";

const LOCATOR_URL = "https://www.capitecbank.co.za/branches/";

// Height of the TopBar (sm: 4rem / 64px) + bottom strip (~64px) = ~128px.
// We use a calc so the iframe fills exactly the remaining viewport height.
const BOTTOM_BAR_HEIGHT = "64px";

export default function BranchLocatorPage() {
  return (
    <div className="flex flex-1 flex-col">
      <iframe
        src={LOCATOR_URL}
        title="Capitec branch locator"
        style={{ height: `calc(100dvh - var(--topbar-h, 64px) - ${BOTTOM_BAR_HEIGHT})` }}
        className="w-full flex-1 border-0"
        allow="geolocation"
      />

      {/* Sticky bottom strip */}
      <div className="sticky bottom-0 z-20 bg-white shadow-bar-top">
        <Container className="flex items-center justify-between gap-4 py-3 sm:py-4">
          <Link
            to="/book"
            className={buttonStyles("secondary", "md", "shrink-0")}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Back to Bookings</span>
          </Link>

          <a
            href={LOCATOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles("secondary", "md", "shrink-0")}
          >
            <span className="sr-only sm:not-sr-only">Open in new tab</span>
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </Container>
      </div>
    </div>
  );
}
