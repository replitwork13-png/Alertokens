import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Alertokens — Система токенов-ловушек",
  description: "Профессиональная система мониторинга несанкционированного доступа",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.className} min-h-screen bg-[hsl(250,30%,7%)] text-[hsl(220,20%,92%)]`}>
        <div className="min-h-screen flex flex-col relative overflow-hidden">
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px] animate-orb" />
            <div
              className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] animate-orb"
              style={{ animationDelay: "-4s" }}
            />
            <div
              className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-violet-500/8 blur-[100px] animate-orb"
              style={{ animationDelay: "-8s" }}
            />
          </div>
          <Navbar />
          <main className="flex-1 w-full overflow-x-hidden p-4 md:p-8 relative z-10">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
