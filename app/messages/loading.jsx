export default function MessagesLoading() {
  return (
    <div className="mx-auto w-full max-w-[1600px] animate-pulse space-y-3 px-4 sm:px-6 py-8" aria-label="Memuat pesan">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-2xl border border-latte bg-white" />
      ))}
    </div>
  );
}
