import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getSessionSafe } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/toast";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ToastProvider>
          <Navbar user={user} role={profile?.role} />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
