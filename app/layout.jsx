import { Plus_Jakarta_Sans, Fraunces, Kalam } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { getSessionSafe } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import BottomCtaStrip from "@/components/landing/BottomCtaStrip";
import { ToastProvider } from "@/components/ui/toast";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Serif hangat untuk headline momen kafe + script kapur untuk coretan kecil.
// Dipakai hemat: headline landing + aksen papan menu (lihat DESIGN.md).
const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const chalk = Kalam({
  variable: "--font-chalk",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: {
    default: "BaristaConnect — Lowongan kerja barista & casual worker",
    template: "%s · BaristaConnect",
  },
  description:
    "Platform pencarian kerja untuk barista dan tempat coffee shop mencari barista. Gratis, cepat, tanpa ribet.",
};

export default async function RootLayout({ children }) {
  const { user, profile } = await getSessionSafe();

  return (
      <html lang="id" className={`${jakarta.variable} ${display.variable} ${chalk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ToastProvider>
          <Navbar user={user} role={profile?.role} />
          <main className="flex-1">{children}</main>
          <BottomCtaStrip hideForUser={!!user} />
        </ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
