// Shared template display labels — single source of truth.
// Used by: page.tsx, history/page.tsx, result/[id]/page.tsx

export interface TemplateDisplay {
  name: string;
  icon: string;
}

export const TEMPLATE_LABELS: Record<string, TemplateDisplay> = {
  invoice: { name: 'Faktur / Invoice', icon: '🧾' },
  receipt: { name: 'Struk / Bon', icon: '🧾' },
  faktur_pajak: { name: 'Faktur Pajak', icon: '🏛️' },
  transfer_proof: { name: 'Bukti Transfer', icon: '🏦' },
  purchase_order: { name: 'Purchase Order (PO)', icon: '📦' },
  custom: { name: 'Dokumen Lainnya', icon: '📄' },
};

export function getTemplateDisplay(templateId: string): TemplateDisplay {
  return TEMPLATE_LABELS[templateId] || { name: templateId, icon: '📄' };
}
