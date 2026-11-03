import { useCallback, useEffect, useState } from "react";
import { fetchBranches, type Branch } from "../../api/branches";

type BranchesState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; branches: Branch[] };

/** Loads the bookable branches from the API. `retry` tries again after a failure. */
export function useBranches() {
  const [state, setState] = useState<BranchesState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchBranches(controller.signal).then(
      (branches) => setState({ status: "ready", branches }),
      (error) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setState({ status: "error" });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
