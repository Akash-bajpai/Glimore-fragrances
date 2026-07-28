import { FlameMark } from "@/components/ui/FlameMark";

export default function Loading() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <FlameMark className="h-10 w-auto animate-flicker" />
    </div>
  );
}
