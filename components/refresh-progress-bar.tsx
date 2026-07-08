"use client";

import { useEffect, useState } from "react";

export const WEEKLY_OPT_INS_REFRESH_MS = 30_000;

export function RefreshProgressBar({
  lastRefreshedAt,
  intervalMs = WEEKLY_OPT_INS_REFRESH_MS,
  className,
}: {
  lastRefreshedAt: number;
  intervalMs?: number;
  className?: string;
}) {
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(intervalMs / 1000));

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - lastRefreshedAt;
      const clamped = Math.min(elapsed, intervalMs);
      setProgress((clamped / intervalMs) * 100);
      setSecondsLeft(Math.max(0, Math.ceil((intervalMs - clamped) / 1000)));
    };

    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [lastRefreshedAt, intervalMs]);

  return (
    <div className={className}>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-surface-border"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Next refresh in ${secondsLeft} seconds`}
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-200 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1.5 text-[10px] text-text-secondary">
        Next refresh in {secondsLeft}s
      </p>
    </div>
  );
}
