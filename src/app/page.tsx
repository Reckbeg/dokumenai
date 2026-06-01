'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import {
  Receipt,
  Buildings,
  Bank,
  Package,
  FileText,
  ShieldCheck,
  Lightning,
  Flag,
  Storefront,
  ChartBar,
  Briefcase,
  CaretDown,
  ArrowRight,
  ArrowSquareOut,
  MagnifyingGlass,
  Spinner,
  File,
  ArrowElbowDownRight,
} from '@phosphor-icons/react';

interface Template {
  id: string;
  name: string;
  nameId: string;
  descriptionId: string;
  icon: React.ReactNode;
}

const TEMPLATES: Template[] = [
  { id: 'invoice', name: 'Invoice', nameId: 'Faktur / Invoice', descriptionId: 'Rincian item, total, dan data pelanggan otomatis terbaca', icon: <Receipt size={28} weight="duotone" /> },
  { id: 'receipt', name: 'Receipt', nameId: 'Struk / Bon', descriptionId: 'Ambil nomor transaksi, jumlah, dan tanggal dari struk belanja', icon: <Receipt size={28} weight="duotone" /> },
  { id: 'faktur_pajak', name: 'Tax Invoice', nameId: 'Faktur Pajak', descriptionId: 'Ekstrak NPWP, DPP, PPN, dan kode faktur instan', icon: <Buildings size={28} weight="duotone" /> },
  { id: 'transfer_proof', name: 'Transfer Proof', nameId: 'Bukti Transfer', descriptionId: 'Tangkap nama pengirim, penerima, nominal, dan bank', icon: <Bank size={28} weight="duotone" /> },
  { id: 'purchase_order', name: 'Purchase Order', nameId: 'Purchase Order (PO)', descriptionId: 'Ambil item, jumlah, harga, dan info vendor dari PO', icon: <Package size={28} weight="duotone" /> },
  { id: 'custom', name: 'Custom', nameId: 'Dokumen Lainnya', descriptionId: 'Dokumen apa pun siap diekstrak', icon: <FileText size={28} weight="duotone" /> },
];

// Re-export for consumers that only need display info
export { TEMPLATE_LABELS } from '@/lib/template-labels';

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

const FAQ_ITEMS = [
  {
    q: 'Apakah data saya aman?',
    a: 'Ya, semua diproses di server Anda (self-hosted) atau dienkripsi penuh. Kami tidak simpan file Anda.',
  },
  {
    q: 'Apakah DokumenAI gratis?',
    a: 'Ya, versi self-hosted gratis dan open source. Tidak ada batasan ekstrak.',
  },
  {
    q: 'Berapa lama proses ekstraksi?',
    a: 'Rata-rata 5-15 detik, tergantung ukuran file dan kompleksitas dokumen.',
  },
  {
    q: 'Format apa yang bisa diekspor?',
    a: 'Hasil ekstraksi bisa diunduh sebagai CSV, XLSX, atau JSON.',
  },
];

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useScrollReveal();

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

  const scrollToExtraction = () => {
    document.getElementById('ekstraksi')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* HERO - Asymmetric Split */}
      <section className="min-h-[70vh] flex items-center py-12 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left */}
          <div className="lg:col-span-7">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.1] mb-5">
              Dari Dokumen ke<br />Data Siap Pakai
            </h1>
            <p className="text-gray-400 text-lg max-w-md mb-8">
              Upload foto atau PDF. AI ekstrak datanya dalam hitungan detik.
            </p>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={scrollToExtraction} className="btn-primary flex items-center gap-2">
                Mulai Ekstrak <ArrowRight size={16} />
              </button>
              <a href="#cara-kerja" className="text-sm text-gray-400 hover:text-[var(--accent)] transition-colors">
                Lihat Cara Kerja
              </a>
            </div>
            <p className="text-xs text-gray-600">
              Gratis &bull; Self-hosted &bull; Open Source
            </p>
          </div>

          {/* Right - Abstract Document Visualization */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative">
              {/* Source document card */}
              <div className="card p-5 w-[220px]">
                <div className="flex items-center gap-2 mb-3">
                  <File size={18} className="text-gray-500" weight="duotone" />
                  <div className="h-2.5 w-20 rounded bg-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded bg-white/[0.06]" />
                  <div className="h-2 w-3/4 rounded bg-white/[0.06]" />
                  <div className="h-2 w-5/6 rounded bg-white/[0.06]" />
                  <div className="h-2 w-2/3 rounded bg-white/[0.06]" />
                </div>
              </div>

              {/* Arrow indicators */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[230px] flex flex-col gap-1.5">
                <div className="w-10 h-[2px] bg-[var(--accent)]/40 rounded" />
                <div className="w-14 h-[2px] bg-[var(--accent)]/60 rounded ml-1" />
                <div className="w-8 h-[2px] bg-[var(--accent)]/40 rounded" />
              </div>

              {/* Output data card */}
              <div className="card p-4 w-[200px] absolute top-4 right-0 border-[var(--accent)]/20">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  <span className="text-[10px] text-[var(--accent)] font-medium tracking-wide uppercase">Data Terstruktur</span>
                </div>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex gap-2">
                    <span className="text-gray-500">no:</span>
                    <span className="text-[var(--accent)]">INV-2024-001</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500">total:</span>
                    <span className="text-[var(--accent)]">Rp 2.450.000</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500">date:</span>
                    <span className="text-gray-400">2024-01-15</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500">tax:</span>
                    <span className="text-gray-400">Rp 245.000</span>
                  </div>
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* STEPS INDICATOR */}
      <div className="flex items-center justify-center gap-4 mb-8" id="ekstraksi">
        <div className={`flex items-center gap-2 text-sm ${step >= 1 ? 'text-[var(--accent)]' : 'text-gray-600'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step >= 1 ? 'bg-[var(--accent)] text-white' : 'bg-gray-700 text-gray-400'}`}>1</span>
          Pilih Template
        </div>
        <div className="w-8 h-px bg-gray-700" />
        <div className={`flex items-center gap-2 text-sm ${step >= 2 ? 'text-[var(--accent)]' : 'text-gray-600'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step >= 2 ? 'bg-[var(--accent)] text-white' : 'bg-gray-700 text-gray-400'}`}>2</span>
          Upload Dokumen
        </div>
      </div>

      {/* STEP 1: Template selection */}
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
                className="card p-4 text-left hover:bg-[var(--accent)]/[0.06] hover:border-[var(--accent)]/20 transition-all group"
              >
                <span className="text-[var(--accent)] block mb-2 group-hover:scale-110 transition-transform">{t.icon}</span>
                <span className="font-medium text-sm block">{t.nameId}</span>
                <span className="text-xs text-gray-500 block mt-1">{t.descriptionId}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Upload */}
      {step === 2 && (
        <div className="animate-fade-in max-w-xl mx-auto">
          <button onClick={resetAll} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1">
            <ArrowElbowDownRight size={14} /> Ganti template
          </button>

          <div className="card p-6 mb-4">
            <div className="flex items-center gap-2 mb-4 text-sm text-[var(--accent)]">
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
                <FileText size={36} className="mx-auto mb-3 text-gray-500" weight="duotone" />
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
                    <div className="w-20 h-20 rounded-lg bg-white/10 flex items-center justify-center">
                      <File size={28} className="text-gray-500" weight="duotone" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB &bull; {file.type}</p>
                  </div>
                  <button
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="text-gray-500 hover:text-red-400 text-sm"
                  >
                    &times;
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
                      <Spinner size={16} className="animate-spin" />
                      Memproses dokumen...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlass size={16} /> Ekstrak Data
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="card p-4 border-red-500/30 bg-red-500/10 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {isProcessing && (
            <div className="card p-6 mt-4 text-center animate-pulse-glow">
              <Spinner size={28} className="mx-auto mb-3 text-[var(--accent)] animate-spin" />
              <p className="font-medium text-white">AI sedang membaca dokumen Anda...</p>
              <p className="text-sm text-gray-500 mt-1">Biasanya 5-15 detik tergantung ukuran dokumen</p>
            </div>
          )}
        </div>
      )}

      {/* FEATURES - Asymmetric 2-column */}
      <section className="mt-20 reveal">
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* Left: large card */}
          <div className="card p-8 relative overflow-hidden min-h-[200px] flex flex-col justify-end">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
            <ShieldCheck size={32} className="text-[var(--accent)] mb-3" weight="duotone" />
            <h3 className="font-semibold text-lg mb-1 text-white">Data tetap di server Anda</h3>
            <p className="text-sm text-gray-400">Self-hosted. Nggak ada data yang bocor ke pihak ketiga. Semua proses terjadi di infrastruktur milik Anda sendiri.</p>
          </div>

          {/* Right: stacked smaller cards */}
          <div className="flex flex-col gap-4">
            <div className="card p-6 flex-1">
              <Lightning size={28} className="text-[var(--accent)] mb-3" weight="duotone" />
              <h3 className="font-semibold mb-1 text-white">Ekstrak dalam hitungan detik</h3>
              <p className="text-sm text-gray-400">Cukup upload, AI langsung bekerja. Hasilnya bisa disalin atau diunduh.</p>
            </div>
            <div className="card p-6 flex-1">
              <Flag size={28} className="text-[var(--accent)] mb-3" weight="duotone" />
              <h3 className="font-semibold mb-1 text-white">Paham dokumen lokal</h3>
              <p className="text-sm text-gray-400">Faktur Pajak, Bukti Transfer, Struk - semua format Indonesia dikenali.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CARA KERJA - Horizontal Stepper */}
      <section className="mt-20 reveal" id="cara-kerja">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-white">
          3 Langkah Sederhana
        </h2>
        <p className="text-center text-gray-400 mb-10">Kurang dari 30 detik</p>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { num: '1', title: 'Pilih Jenis Dokumen', desc: 'Invoice, faktur pajak, bukti transfer - pilih yang sesuai.' },
            { num: '2', title: 'Upload File', desc: 'Foto atau PDF dari dokumen Anda. Drag & drop atau klik.' },
            { num: '3', title: 'Dapatkan Data', desc: 'AI ekstrak datanya. Siap salin atau unduh CSV/XLSX/JSON.' },
          ].map((s, i) => (
            <div key={i} className="relative">
              {/* Connector line */}
              {i < 2 && (
                <div className="hidden md:block absolute top-5 left-full w-full h-px bg-gradient-to-r from-[var(--accent)]/30 to-transparent z-0" />
              )}
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] font-bold text-sm mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold mb-1 text-white">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UNTUK SIAPA - Mixed grid */}
      <section className="mt-20 reveal">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-white">
          Siapa yang Cocok Pakai DokumenAI?
        </h2>
        <p className="text-center text-gray-400 mb-8">Dibuat untuk operasional bisnis sehari-hari</p>

        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* Icon-left cards */}
          <div className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
              <Storefront size={20} className="text-[var(--accent)]" weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-white">UMKM & Pebisnis</h3>
              <p className="text-sm text-gray-400 mt-0.5">Catat pemasukan dan pengeluaran tanpa ketik ulang.</p>
            </div>
          </div>

          <div className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
              <ChartBar size={20} className="text-[var(--accent)]" weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Akuntan</h3>
              <p className="text-sm text-gray-400 mt-0.5">Ambil data invoice, PO, faktur pajak ke spreadsheet.</p>
            </div>
          </div>

          <div className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
              <Package size={20} className="text-[var(--accent)]" weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Admin Gudang</h3>
              <p className="text-sm text-gray-400 mt-0.5">Proses bon, surat jalan, dan PO lebih cepat.</p>
            </div>
          </div>

          <div className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
              <Briefcase size={20} className="text-[var(--accent)]" weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Freelancer</h3>
              <p className="text-sm text-gray-400 mt-0.5">Urus bukti transfer dan invoice klien tanpa ribet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FORMAT SECTION */}
      <section className="mt-20 max-w-4xl mx-auto reveal">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-white">
          Format File yang Didukung
        </h2>
        <div className="card p-6 bg-white/[0.03]">
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center text-center">
            <div>
              <p className="text-sm text-gray-400 mb-3">Input</p>
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                {['JPG', 'PNG', 'WebP', 'PDF'].map((f) => (
                  <span key={f} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-300">{f}</span>
                ))}
              </div>
            </div>
            <div className="text-[var(--accent)]">
              <ArrowRight size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-3">Output</p>
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                {['CSV', 'XLSX', 'JSON'].map((f) => (
                  <span key={f} className="px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)]">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - ACCORDION */}
      <section className="mt-20 max-w-3xl mx-auto reveal">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-white">
          Pertanyaan Umum
        </h2>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="accordion-item card p-0">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-sm">{item.q}</span>
                <CaretDown
                  size={16}
                  className={`accordion-chevron text-gray-500 flex-shrink-0 ml-3 ${openFaq === i ? 'open' : ''}`}
                />
              </button>
              <div className={`accordion-content ${openFaq === i ? 'open' : ''}`}>
                <div className="px-5 pb-4 text-sm text-gray-400">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mt-20 mb-4 max-w-3xl mx-auto reveal">
        <div className="card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-[var(--accent)]/5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
              Mulai Ekstrak Tanpa Daftar
            </h2>
            <p className="text-gray-400 mb-5">Upload dokumen pertama Anda. Gratis, nggak perlu daftar.</p>
            <button onClick={scrollToExtraction} className="btn-primary inline-flex items-center gap-2">
              Mulai Sekarang <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
