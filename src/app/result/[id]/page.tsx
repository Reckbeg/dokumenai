
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface ExtractionData {
  id: string;
  template_id: string;
  file_name: string;
  raw_text: string;
  extracted_data: string;
  confidence: number;
  created_at: string;
}

const TEMPLATE_LABELS: Record<string, { name: string; icon: string }> = {
  invoice: { name: 'Faktur / Invoice', icon: '🧾' },
  receipt: { name: 'Struk / Bon', icon: '🧾' },
  faktur_pajak: { name: 'Faktur Pajak', icon: '🏛️' },
  transfer_proof: { name: 'Bukti Transfer', icon: '🏦' },
  purchase_order: { name: 'Purchase Order', icon: '📦' },
  custom: { name: 'Dokumen Lainnya', icon: '📄' },
};

function formatCurrency(value: any): string {
  if (value == null || value === '') return '-';
  const num = typeof value === 'string' ? parseInt(value.replace(/[^0-9-]/g, '')) : value;
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}

function formatValue(key: string, value: any): string {
  if (value == null || value === '') return '-';
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('amount') || lowerKey.includes('total') || lowerKey.includes('subtotal') || 
      lowerKey.includes('tax') || lowerKey.includes('ppn') || lowerKey.includes('dpp') || 
      lowerKey.includes('fee') || lowerKey.includes('discount') || lowerKey.includes('nominal')) {
    return formatCurrency(value);
  }
  return String(value);
}

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ExtractionData | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    fetch(`/api/history/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setEditedData(JSON.parse(d.extracted_data));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleExportCSV = () => {
    const entries = Object.entries(editedData).filter(([k]) => !k.startsWith('_'));
    const csv = 'Field,Value\n' + entries.map(([k, v]) => `"${k}","${String(v).replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dokumenai_${data?.template_id}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportXLSX = async () => {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: data?.template_id, data: editedData }),
    });

    if (!res.ok) {
      alert('Gagal membuat file XLSX');
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dokumenai_${data?.template_id}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    const clean = Object.fromEntries(Object.entries(editedData).filter(([k]) => !k.startsWith('_')));
    navigator.clipboard.writeText(JSON.stringify(clean, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Hapus data ekstraksi ini?')) return;
    await fetch(`/api/history/${id}/delete`, { method: 'DELETE' });
    window.location.href = '/history';
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-400">Memuat data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-red-400 mb-4">{error || 'Data tidak ditemukan'}</p>
        <Link href="/" className="btn-primary inline-block">Kembali</Link>
      </div>
    );
  }

  const templateInfo = TEMPLATE_LABELS[data.template_id] || { name: data.template_id, icon: '📄' };
  const confidenceColor = data.confidence >= 70 ? 'confidence-high' : data.confidence >= 40 ? 'confidence-medium' : 'confidence-low';
  const confidenceLabel = data.confidence >= 70 ? 'Tinggi' : data.confidence >= 40 ? 'Sedang' : 'Rendah';
  const entries = Object.entries(editedData).filter(([k]) => !k.startsWith('_'));

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/" className="text-sm text-gray-500 hover:text-white mb-2 inline-block">← Ekstrak baru</Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{templateInfo.icon}</span> Hasil Ekstraksi
          </h1>
          <p className="text-sm text-gray-500 mt-1">{data.file_name}</p>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${confidenceColor}`}>
            Akurasi: {data.confidence}% ({confidenceLabel})
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {new Date(data.created_at).toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Skor Kepercayaan AI</span>
          <span className={confidenceColor}>{data.confidence}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${data.confidence >= 70 ? 'bg-emerald-500' : data.confidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${data.confidence}%` }}
          />
        </div>
      </div>

      {/* Data table */}
      <div className="card overflow-hidden mb-4">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-medium">Data Terekstrak</h2>
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(!isEditing)} className="btn-secondary text-xs py-1.5 px-3">
              {isEditing ? '✓ Selesai' : '✏️ Edit'}
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-white/5">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-start px-4 py-3 hover:bg-white/[0.02]">
              <div className="w-1/3 text-sm text-gray-400 pr-4 pt-1">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={String(value ?? '')}
                    onChange={(e) => setEditedData(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className={`text-sm ${value == null || value === '' ? 'text-gray-600 italic' : ''}`}>
                    {formatValue(key, value)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw text toggle */}
      <div className="card overflow-hidden mb-4">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-white/[0.02]"
        >
          <span className="text-sm text-gray-400">Teks asli dokumen (OCR)</span>
          <span className="text-gray-600">{showRaw ? '▲' : '▼'}</span>
        </button>
        {showRaw && (
          <div className="p-4 pt-0 text-sm text-gray-400 whitespace-pre-wrap font-mono bg-black/20 max-h-60 overflow-y-auto">
            {data.raw_text || 'Tidak ada teks'}
          </div>
        )}
      </div>

      {/* Export buttons */}
      <div className="card p-4 mb-4">
        <h3 className="text-sm font-medium mb-3">Export Data</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportCSV} className="btn-secondary text-sm flex items-center gap-2">
            📊 CSV
          </button>
          <button onClick={handleExportXLSX} className="btn-secondary text-sm flex items-center gap-2">
            📗 XLSX
          </button>
          <button onClick={handleCopyJSON} className="btn-secondary text-sm flex items-center gap-2">
            {copied ? '✅ Tersalin!' : '📋 JSON'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Link href="/" className="btn-primary">
          🔍 Ekstrak Lagi
        </Link>
        <button onClick={handleDelete} className="text-sm text-gray-600 hover:text-red-400">
          🗑️ Hapus
        </button>
      </div>
    </div>
  );
}
