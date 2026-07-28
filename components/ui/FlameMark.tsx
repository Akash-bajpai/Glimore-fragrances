import { cn } from "@/lib/utils";

interface FlameMarkProps {
  className?: string;
  animated?: boolean;
}

export function FlameMark({ className, animated = true }: FlameMarkProps) {
  return (
    <svg
      viewBox="0 0 40 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-gold", animated && "animate-flicker", className)}
      style={{ transformOrigin: "50% 85%" }}
    >
      <path
        d="M20 0C20 0 8 15.5 8 27.5C8 36.5 13.5 44 20 44C26.5 44 32 36.5 32 27.5C32 15.5 20 0 20 0Z"
        fill="currentColor"
      />
      <path
        d="M20 14C20 14 15 22.5 15 29C15 34 17 38.5 20 38.5C23 38.5 25 34 25 29C25 22.5 20 14 20 14Z"
        className="fill-ink"
        fillOpacity="0.55"
      />
      <path d="M20 46.5C21.1 46.5 22 47.4 22 48.5C22 49.6 21.1 51.5 20 51.5C18.9 51.5 18 49.6 18 48.5C18 47.4 18.9 46.5 20 46.5Z" fill="currentColor" />
    </svg>
  );
}
