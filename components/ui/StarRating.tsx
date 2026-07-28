import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, reviewCount, size = 14, className }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? "fill-gold text-gold" : "fill-transparent text-fg/25"}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      {reviewCount !== undefined && (
        <span className="font-body text-xs text-fg/50">({reviewCount})</span>
      )}
    </div>
  );
}
