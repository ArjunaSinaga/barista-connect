"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, UserRound, Megaphone, UsersRound, Search } from "lucide-react";

const SETS = {
  barista: [
    { href: "/dashboard/barista", label: "Lowongan", icon: Briefcase },
    { href: "/dashboard/barista/applications", label: "Lamaran", icon: FileText },
    { href: "/messages", label: "Pesan", icon: Megaphone },
    { href: "/dashboard/barista/profile", label: "Profil", icon: UserRound },
  ],
  owner: [
    { href: "/dashboard/owner", label: "Lowongan", icon: Megaphone },
    { href: "/find-baristas", label: "Cari", icon: Search },
    { href: "/messages", label: "Pesan", icon: Megaphone },
    { href: "/dashboard/owner/profile", label: "Bisnis", icon: UserRound },
  ],
};

export default function BottomNav({ role }) {
  const pathname = usePathname();
  if (!SETS[role]) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-latte bg-[#16100d]/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        {SETS[role].map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard/owner"
              ? pathname.startsWith("/dashboard/owner")
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors ${
                active ? "text-caramel" : "text-espresso-soft"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
