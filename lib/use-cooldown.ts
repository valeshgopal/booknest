"use client";

import { useEffect, useState } from "react";

/** Seconds left before an action may run again; counts down to 0. */
export function useCooldown(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  return [seconds, setSeconds] as const;
}
