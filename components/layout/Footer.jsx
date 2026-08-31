export default function Footer() {
  return (
    <footer className="mt-auto border-t border-latte/60 bg-white/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-espresso-soft sm:flex-row">
        <p>© {new Date().getFullYear()} BaristaConnect — hubungan barista & coffee shop</p>
        <p>Dibuat dengan ☕ di Indonesia</p>
      </div>
    </footer>
  );
}
