import { CardSkeleton } from "@/components/ui/Skeleton";

// H-31: skeleton saat hasil pencarian dimuat — tanpa layar kosong.
export default function Loading() {
  return (
    <div className="min-h-screen bg-paper text-espresso">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6">
        <div className="grid items-start gap-4 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_360px]">
          <div className="order-1 space-y-3 lg:order-2">
            <div className="h-44 animate-pulse rounded-2xl bg-[#efe9d9]" />
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-[#efe9d9]" />
              ))}
            </div>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="order-2 lg:order-3">
            <div className="h-96 animate-pulse rounded-2xl bg-[#efe9d9]" />
          </div>
          <div className="order-3 lg:order-1">
            <div className="h-64 animate-pulse rounded-2xl bg-[#efe9d9]" />
          </div>
        </div>
      </div>
    </div>
  );
}
