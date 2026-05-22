
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Extraction {
  id: string;
  template_id: string;
  file_name: string;
  confidence: number;
  created_at: string;
}

const TEMPLATE_LABELS: Record<string, { name: string; icon: string }> = {
  invoice: { name: 'Invoice', icon: '🧾' },
  receipt: { name: 'Struk / Bon', icon: '🧾' },
  faktur_pajak: { name: 'Faktur Pajak', icon: '🏛️' },
  transfer_proof: { name: 'Bukti Transfer', icon: '🏦' },
  purchase_order: { name: 'PO', icon: '📦' },
  custom: { name: 'Lainnya', icon: '📄' },
};

export default function HistoryPage() {
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(d => {
        setExtractions(d.extractions || []);
        setTotal(d.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-400">Memuat riwayat...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📋 Riwayat Ekstraksi</h1>
          <p className="text-sm text-gray-500 mt-1">{total} dokumen diproses</p>
        </div>
        <Link href="/" className="btn-primary text-sm">
          + Ekstrak Baru
        </Link>
      </div>

      {extractions.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-400 mb-4">Belum ada dokumen yang diproses</p>
          <Link href="/" className="btn-primary inline-block">
            Upload Dokumen Pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {extractions.map((ext) => {
            const template = TEMPLATE_LABELS[ext.template_id] || { name: ext.template_id, icon: '📄' };
            const confidenceColor = ext.confidence >= 70 ? 'text-emerald-400' : ext.confidence >= 40 ? 'text-yellow-400' : 'text-red-400';
            
            return (
              <Link
                key={ext.id}
                href={`/result/${ext.id}`}
                className="card p-4 flex items-center gap-4 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all block"
              >
                <span className="text-2xl">{template.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{ext.file_name}</p>
                  <p className="text-xs text-gray-500">{template.name}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${confidenceColor}`}>
                    {ext.confidence}%
                  </span>
                  <p className="text-xs text-gray-600">
                    {new Date(ext.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-gray-600">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
