import { CardSkeleton } from "@/components/ui/Skeleton";

// APPTRK-26: skeleton kartu lamaran selama riwayat dimuat.
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[#efe9d9]" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-[#efe9d9]" />
        ))}
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
