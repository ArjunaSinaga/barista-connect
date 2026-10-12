import { Skeleton } from "@/components/ui/Skeleton";

// Paritas barista: skeleton mirip layout (hero + 4 stat + 2 panel), bukan kotak generik.
export default function OwnerDashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8" aria-label="Memuat dashboard">
      <div className="rounded-2xl border border-[#e8e0cf] bg-[#faf6ec] p-5 sm:p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-8 w-64" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-[#e8e0cf] bg-white p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-12" />
            <Skeleton className="mt-1.5 h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
            <Skeleton className="mt-2 h-3 w-4/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
