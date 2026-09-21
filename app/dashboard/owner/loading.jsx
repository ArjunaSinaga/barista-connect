export default function OwnerDashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-8" aria-label="Memuat dashboard">
      <div className="h-6 w-40 rounded bg-latte" />
      <div className="mt-2 h-9 w-64 rounded bg-latte" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl border border-latte bg-white" />
        ))}
      </div>
    </div>
  );
}
