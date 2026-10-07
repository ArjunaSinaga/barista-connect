import Link from "next/link";

const NAV = [
  ["Loker", "/jobs"],
  ["Talenta", "/find-baristas"],
  ["Kafe", "/cafes"],
  ["Feed", "/feed"],
  ["Academy", "/academy"],
  ["Ulasan", "/reviews"],
  ["Pelatihan", "/training"],
];

export default function Footer() {
  return (
    <footer className="mt-6 border-t border-[#e8e0cf] bg-[#ece2cd]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-base font-semibold text-espresso">BaristaConnect</p>
            <p className="mt-1 text-xs leading-5 text-espresso-soft">
              Platform rekrutmen khusus kopi: barista temukan loker, kafe temukan barista.
            </p>
          </div>
          <nav aria-label="Navigasi bawah" className="flex flex-wrap gap-x-4 gap-y-2">
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} className="min-h-[44px] content-center text-xs font-bold text-espresso-soft hover:text-espresso">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-4 border-t border-coffee/10 pt-3 text-[11px] text-espresso-soft">
          © {new Date().getFullYear()} BaristaConnect. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
