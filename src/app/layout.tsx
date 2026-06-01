
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DokumenAI - Ekstrak Data dari Dokumen Bisnis Otomatis",
  description: "Upload foto/PDF invoice, faktur pajak, atau bukti transfer. AI baca dan keluarkan data terstruktur dalam detik. Self-hosted, gratis, open source.",
};

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0c1021]/90 backdrop-blur-xl border-b border-white/[0.06] navbar-glow">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-semibold text-lg tracking-tight">
          <span className="text-[var(--accent)]">D</span>okumenAI
        </Link>
        <div className="flex items-center gap-5">
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
      <body className={`${GeistSans.className} bg-[#0c1021] text-white min-h-screen`}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-white/[0.06] py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>DokumenAI &copy; {new Date().getFullYear()}</p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/Reckbeg/dokumenai" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">GitHub</a>
              <span className="text-gray-700">/</span>
              <span>Open Source</span>
              <span className="text-gray-700">/</span>
              <span>Data Tetap Milik Anda</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
