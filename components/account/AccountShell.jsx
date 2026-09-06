"use client";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function AccountShell({ user, profile, barista, owner }) {
  const data = barista ?? owner ?? {};
  const name = data.full_name ?? data.business_name ?? user?.email ?? "User";
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-espresso">Akun</h1>
      <p className="mt-1 text-sm text-espresso-soft">{user?.email} — {profile?.role ?? "-"}</p>
      <div className="mt-6 card-dark rounded-2xl p-6">
        <p className="font-bold text-espresso">{name}</p>
        <p className="mt-2 text-sm text-espresso-soft">Lengkapi profilmu untuk memaksimalkan pencocokan.</p>
        <div className="mt-4 flex gap-2">
          <Button href="/account/profile" size="sm">Edit Profil</Button>
          <Button href="/" variant="secondary" size="sm">Kembali</Button>
        </div>
      </div>
    </div>
  );
}
