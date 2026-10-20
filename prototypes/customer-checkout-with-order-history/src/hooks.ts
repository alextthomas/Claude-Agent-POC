import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getState, now, subscribe } from "./mock/store";
import type { State } from "./mock/types";

export function useMock(): State {
  return useSyncExternalStore(subscribe, getState);
}

/** Simulated "now" (real clock plus dev-panel fast-forward), re-rendering every second. */
export function useNow(): number {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  useMock();
  return now();
}

export type Loaded<T> = { status: "loading" } | { status: "done"; value: T };

/** Runs an async mock request; re-runs when `deps` change or reload() is called. */
export function useLoad<T>(
  fn: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
): [Loaded<T>, () => void] {
  const [state, setState] = useState<Loaded<T>>({ status: "loading" });
  const [n, setN] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    fnRef.current().then((value) => {
      if (alive) setState({ status: "done", value });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, ...deps]);
  const reload = useCallback(() => setN((x) => x + 1), []);
  return [state, reload];
}

/** Redirect to S-06 with a validated return target and the right banner (AC-13.4, J-22). */
export function useAuthRedirect(): (
  reason: "expired" | "visitor" | "rejected",
) => void {
  const nav = useNavigate();
  const loc = useLocation();
  return useCallback(
    (reason) => {
      const target = encodeURIComponent(loc.pathname + loc.search);
      nav(`/sign-in?returnTo=${target}`, {
        replace: true,
        state: { banner: reason === "expired" ? "expired" : "gate" },
      });
    },
    [nav, loc.pathname, loc.search],
  );
}
