import Link from "next/link";
import { Store, ExternalLink } from "lucide-react";
import BusinessForm from "@/components/owner/BusinessForm";

// Kolom tengah mode settings: edit data bisnis langsung di tempat.
export default function SettingsView({ initial, publicHref, onBack }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-bold tracking-[0.18em] text-[#857768] uppercase">Settings</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#3d2c1e] hover:border-[#3d2c1e]"
          >
            <Store size={14} /> Dashboard
          </button>
          {publicHref && (
            <Link href={publicHref} className="inline-flex items-center gap-1.5 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#2b6cb0] hover:underline">
              Profil publik <ExternalLink size={12} />
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e8e0cf] bg-[#ffffff]">
        <BusinessForm initial={initial} onSaved={onBack} />
      </div>
    </>
  );
}
