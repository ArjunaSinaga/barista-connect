import { CardSkeleton } from "@/components/ui/Skeleton";

// JOBDET-32: skeleton hero + ringkasan + konten selama detail dimuat.
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="h-5 w-48 animate-pulse rounded-full bg-[#efe9d9]" />
      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          <div className="h-52 animate-pulse rounded-2xl bg-[#efe9d9]" />
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-[#efe9d9]" />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-[#efe9d9]" />
      </div>
    </div>
  );
}
