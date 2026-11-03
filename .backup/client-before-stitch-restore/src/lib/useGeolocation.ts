import { useCallback, useState } from "react";
import type { Coordinates } from "./geo";

export type GeolocationStatus = "idle" | "locating" | "located" | "denied" | "failed";

/**
 * Asks the browser for the user's position when `locate` is called (never on load).
 * The position stays in the browser; it is not sent to the server.
 */
export function useGeolocation() {
  const supported = typeof navigator !== "undefined" && "geolocation" in navigator;
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [position, setPosition] = useState<Coordinates | null>(null);

  const locate = useCallback(() => {
    if (!supported) return;
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ latitude: coords.latitude, longitude: coords.longitude });
        setStatus("located");
      },
      (error) => setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "failed"),
      { timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }, [supported]);

  return { supported, status, position, locate };
}
