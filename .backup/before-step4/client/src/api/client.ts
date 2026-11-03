import type { ApiErrorBody } from "@bookmark/shared";

/** An error response from the API (or a failure to reach it, with status 0). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: ApiErrorBody["error"]["details"],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Calls the API. In dev, Vite proxies /api to the Express server (see vite.config.ts). */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(
      res.status,
      body?.error.code ?? "UNKNOWN",
      body?.error.message ?? `Request failed (${res.status}).`,
      body?.error.details,
    );
  }
  return (await res.json()) as T;
}

/** A message that is safe to show to the user for any thrown value. */
export function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}
