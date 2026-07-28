"use client";

import { useEffect } from "react";
import { FlameMark } from "@/components/ui/FlameMark";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <FlameMark className="h-12 w-auto" animated={false} />
      <h1 className="font-display text-3xl">Something flickered out</h1>
      <p className="max-w-sm font-body text-sm leading-relaxed text-fg/55">
        An unexpected error occurred while lighting this page. Please try again.
      </p>
      <button onClick={reset} className="btn-gold mt-2">
        Try Again
      </button>
    </div>
  );
}
