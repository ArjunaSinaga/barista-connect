import Link from "next/link"
export const metadata = { title: "Dashboard Owner - Barista Connect" }
export default function OwnerDashboardPage() {
  return (
    <div className="min-h-screen bg-cream p-8 text-center">
      <h1 className="text-2xl font-black">Dashboard Owner - Maintenance Mode</h1>
      <p className="mt-2 text-sm">Jika kamu melihat ini, build berhasil. Klik di bawah:</p>
      <Link href="/dashboard/owner/jobs/new" className="mt-4 inline-block rounded-full bg-caramel px-6 py-3 text-white font-bold">Buat Lowongan</Link>
      <p className="mt-4 text-xs opacity-60">Debug build OK</p>
    </div>
  )
}
