
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DokumenAI — Dokumen Jadi Data",
  description: "Upload dokumen bisnis Indonesia, dapat data terstruktur dalam hitungan detik. Gratis, privat, open-source.",
};

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-semibold text-lg">
          <span className="text-xl">🐱</span>
          <span>DokumenAI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            Ekstrak
          </Link>
          <Link href="/history" className="text-sm text-gray-400 hover:text-white transition-colors">
            Riwayat
          </Link>
          <a
            href="https://github.com/Reckbeg/dokumenai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-[#0a0e1a] text-white min-h-screen`}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-white/10 py-6 text-center text-sm text-gray-500">
          <p>DokumenAI — Open Source &bull; Privasi Terjaga &bull; Dibuat untuk UMKM Indonesia 🇮🇩</p>
        </footer>
      </body>
    </html>
  );
}
