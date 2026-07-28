import Link from "next/link";
import { FlameMark } from "@/components/ui/FlameMark";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <FlameMark className="h-12 w-auto" />
      <span className="font-display text-7xl text-gold sm:text-8xl">404</span>
      <h1 className="font-display text-2xl sm:text-3xl">This candle has burned out</h1>
      <p className="max-w-sm font-body text-sm leading-relaxed text-fg/55">
        The page you&rsquo;re looking for has drifted off like smoke. Let&rsquo;s bring you back
        to the light.
      </p>
      <Link href="/" className="btn-gold mt-2">
        Return Home
      </Link>
    </div>
  );
}
