
'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

interface Template {
  id: string;
  name: string;
  nameId: string;
  descriptionId: string;
  icon: string;
}

const TEMPLATES: Template[] = [
  { id: 'invoice', name: 'Invoice', nameId: 'Faktur / Invoice', descriptionId: 'Rincian item, total, dan data pelanggan otomatis terbaca', icon: '🧾' },
  { id: 'receipt', name: 'Receipt', nameId: 'Struk / Bon', descriptionId: 'Ambil nomor transaksi, jumlah, dan tanggal dari struk belanja', icon: '🧾' },
  { id: 'faktur_pajak', name: 'Tax Invoice', nameId: 'Faktur Pajak', descriptionId: 'Ekstrak NPWP, DPP, PPN, dan kode faktur instan', icon: '🏛️' },
  { id: 'transfer_proof', name: 'Transfer Proof', nameId: 'Bukti Transfer', descriptionId: 'Tangkap nama pengirim, penerima, nominal, dan bank', icon: '🏦' },
  { id: 'purchase_order', name: 'Purchase Order', nameId: 'Purchase Order (PO)', descriptionId: 'Ambil item, jumlah, harga, dan info vendor dari PO', icon: '📦' },
  { id: 'custom', name: 'Custom', nameId: 'Dokumen Lainnya', descriptionId: 'Dokumen apa pun siap diekstrak', icon: '📄' },
];

// Re-export for consumers that only need display info
export { TEMPLATE_LABELS } from '@/lib/template-labels';

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const handleFile = useCallback((f: File) => {
    setError(null);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(f.type)) {
      setError('Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File terlalu besar. Maksimal 10MB.');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file || !selectedTemplate) return;
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('templateId', selectedTemplate);

      const res = await apiFetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses dokumen');
      }

      // Navigate to result page
      router.push(`/result/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setSelectedTemplate('');
    setError(null);
    setStep(1);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Dari Dokumen ke Data Siap Pakai
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Cukup upload foto/PDF — AI kami baca, ekstrak, dan keluarkan datanya dalam hitungan detik.
          <br />
          <span className="text-sm">Gratis &bull; Data Tetap Privat &bull; Open Source</span>
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 text-sm ${step >= 1 ? 'text-blue-400' : 'text-gray-600'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>1</span>
          Pilih Template
        </div>
        <div className="w-8 h-px bg-gray-700" />
        <div className={`flex items-center gap-2 text-sm ${step >= 2 ? 'text-blue-400' : 'text-gray-600'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>2</span>
          Upload Dokumen
        </div>
      </div>

      {/* Step 1: Template selection */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-medium mb-4 text-center">Dokumen apa yang mau diekstrak?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTemplate(t.id);
                  setStep(2);
                }}
                className="card p-4 text-left hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
              >
                <span className="text-2xl block mb-2">{t.icon}</span>
                <span className="font-medium text-sm block">{t.nameId}</span>
                <span className="text-xs text-gray-500 block mt-1">{t.descriptionId}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Upload */}
      {step === 2 && (
        <div className="animate-fade-in max-w-xl mx-auto">
          <button onClick={resetAll} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1">
            ← Ganti template
          </button>

          <div className="card p-6 mb-4">
            <div className="flex items-center gap-2 mb-4 text-sm text-blue-400">
              <span>{TEMPLATES.find(t => t.id === selectedTemplate)?.icon}</span>
              <span>{TEMPLATES.find(t => t.id === selectedTemplate)?.nameId}</span>
            </div>

            {/* Dropzone */}
            {!file ? (
              <div
                className={`dropzone rounded-xl p-10 text-center cursor-pointer ${isDragging ? 'active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <div className="text-4xl mb-3">📁</div>
                <p className="font-medium mb-1">Letakkan file di sini atau klik untuk unggah</p>
                <p className="text-sm text-gray-500">JPG, PNG, WebP, atau PDF &bull; Maks 10MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File preview */}
                <div className="flex items-start gap-4 p-3 rounded-lg bg-white/5">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-white/10 flex items-center justify-center text-2xl">📄</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB &bull; {file.type}</p>
                  </div>
                  <button
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="text-gray-500 hover:text-red-400 text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Memproses dokumen...
                    </>
                  ) : (
                    <>
                      🔍 Ekstrak Data
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="card p-4 border-red-500/30 bg-red-500/10 text-red-400 text-sm animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {isProcessing && (
            <div className="card p-6 mt-4 text-center animate-pulse-glow">
              <div className="text-3xl mb-3">🤖</div>
              <p className="font-medium">AI sedang membaca dokumen Anda...</p>
              <p className="text-sm text-gray-500 mt-1">Biasanya 5-15 detik tergantung ukuran dokumen</p>
            </div>
          )}
        </div>
      )}

      {/* Features */}
      <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="font-medium mb-1">Data Sepenuhnya Milik Anda</h3>
          <p className="text-sm text-gray-500">Host sendiri di server Anda. Tidak ada data yang bocor ke pihak ketiga.</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="font-medium mb-1">Ekstrak dalam Hitungan Detik</h3>
          <p className="text-sm text-gray-500">Cukup upload, AI langsung bekerja. Hasilnya bisa disalin atau diunduh.</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🇮🇩</div>
          <h3 className="font-medium mb-1">Paham Dokumen Lokal</h3>
          <p className="text-sm text-gray-500">Faktur Pajak, Bukti Transfer, Struk — semua format Indonesia dikenali akurat.</p>
        </div>
      </div>

      {/* Cara Kerja */}
      <section className="mt-20 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Cara Kerja: 3 Langkah Sederhana
        </h2>
        <p className="text-center text-gray-400 mb-8">3 langkah, kurang dari 30 detik</p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-6 text-center bg-white/5">
            <div className="text-3xl mb-3">1️⃣</div>
            <h3 className="font-medium mb-1">Pilih Jenis Dokumen</h3>
            <p className="text-sm text-gray-500">Tentukan apakah ini invoice, faktur pajak, bukti transfer, atau lainnya.</p>
          </div>
          <div className="card p-6 text-center bg-white/5">
            <div className="text-3xl mb-3">2️⃣</div>
            <h3 className="font-medium mb-1">Upload File</h3>
            <p className="text-sm text-gray-500">Foto atau PDF dari dokumen Anda — cukup drag & drop atau klik.</p>
          </div>
          <div className="card p-6 text-center bg-white/5">
            <div className="text-3xl mb-3">3️⃣</div>
            <h3 className="font-medium mb-1">Dapatkan Data</h3>
            <p className="text-sm text-gray-500">AI ekstrak dan tampilkan data terstruktur. Siap salin atau unduh CSV/XLSX/JSON.</p>
          </div>
        </div>
      </section>

      {/* Untuk Siapa */}
      <section className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Siapa yang Cocok Pakai DokumenAI?
        </h2>
        <p className="text-center text-gray-400 mb-8">Dibuat untuk operasional bisnis harian di Indonesia</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 bg-white/5">
            <div className="text-2xl mb-2">🏪</div>
            <h3 className="font-medium">UMKM & Pebisnis</h3>
            <p className="text-sm text-gray-500 mt-1">Catat pemasukan dan pengeluaran tanpa ketik ulang.</p>
          </div>
          <div className="card p-5 bg-white/5">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-medium">Akuntan</h3>
            <p className="text-sm text-gray-500 mt-1">Ambil data invoice, PO, faktur pajak ke spreadsheet.</p>
          </div>
          <div className="card p-5 bg-white/5">
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-medium">Admin Gudang</h3>
            <p className="text-sm text-gray-500 mt-1">Proses bon, surat jalan, dan PO lebih cepat.</p>
          </div>
          <div className="card p-5 bg-white/5">
            <div className="text-2xl mb-2">💼</div>
            <h3 className="font-medium">Freelancer</h3>
            <p className="text-sm text-gray-500 mt-1">Urus bukti transfer dan invoice klien tanpa ribet.</p>
          </div>
        </div>
      </section>

      {/* Format yang Didukung */}
      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Format File yang Didukung
        </h2>
        <div className="card p-6 bg-white/5">
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center text-center">
            <div>
              <p className="text-sm text-gray-400 mb-2">Input</p>
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">JPG</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">PNG</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">WebP</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">PDF</span>
              </div>
            </div>
            <div className="text-2xl text-blue-400">→</div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Output</p>
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">CSV</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">XLSX</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">JSON</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Pertanyaan Umum
        </h2>
        <div className="space-y-3">
          <div className="card p-5 bg-white/5">
            <h3 className="font-medium">Apakah data saya aman?</h3>
            <p className="text-sm text-gray-500 mt-1">Ya, semua diproses di server Anda (self-hosted) atau dienkripsi penuh. Kami tidak simpan file Anda.</p>
          </div>
          <div className="card p-5 bg-white/5">
            <h3 className="font-medium">Apakah DokumenAI gratis?</h3>
            <p className="text-sm text-gray-500 mt-1">Ya, versi self-hosted gratis dan open source. Tidak ada batasan ekstrak.</p>
          </div>
          <div className="card p-5 bg-white/5">
            <h3 className="font-medium">Berapa lama proses ekstraksi?</h3>
            <p className="text-sm text-gray-500 mt-1">Rata-rata 5–15 detik, tergantung ukuran file dan kompleksitas dokumen.</p>
          </div>
          <div className="card p-5 bg-white/5">
            <h3 className="font-medium">Format apa yang bisa diekspor?</h3>
            <p className="text-sm text-gray-500 mt-1">Hasil ekstraksi bisa diunduh sebagai CSV, XLSX, atau JSON.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-20 mb-4 max-w-3xl mx-auto">
        <div className="card p-8 text-center bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Mulai Ekstrak Tanpa Daftar
          </h2>
          <p className="text-gray-400">Upload dokumen pertama Anda. Gratis, nggak perlu daftar.</p>
        </div>
      </section>
    </div>
  );
}
