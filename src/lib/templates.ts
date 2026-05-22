
export interface TemplateField {
  key: string;
  label: string;
  labelId: string;
  type: 'text' | 'number' | 'date' | 'currency';
  required: boolean;
  example?: string;
}

export interface Template {
  id: string;
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
  fields: TemplateField[];
  promptHint: string;
  icon: string;
}

export const TEMPLATES: Template[] = [
  {
    id: 'invoice',
    name: 'Invoice',
    nameId: 'Faktur / Invoice',
    description: 'Business invoice with line items',
    descriptionId: 'Faktur bisnis dengan rincian item',
    icon: '🧾',
    promptHint: 'Extract invoice number, date, sender, recipient, line items with quantities and prices, subtotal, tax, and total amount.',
    fields: [
      { key: 'invoice_number', label: 'Invoice Number', labelId: 'Nomor Invoice', type: 'text', required: true },
      { key: 'date', label: 'Date', labelId: 'Tanggal', type: 'date', required: true },
      { key: 'due_date', label: 'Due Date', labelId: 'Jatuh Tempo', type: 'date', required: false },
      { key: 'sender_name', label: 'Sender', labelId: 'Pengirim', type: 'text', required: true },
      { key: 'sender_address', label: 'Sender Address', labelId: 'Alamat Pengirim', type: 'text', required: false },
      { key: 'recipient_name', label: 'Recipient', labelId: 'Penerima', type: 'text', required: true },
      { key: 'recipient_address', label: 'Recipient Address', labelId: 'Alamat Penerima', type: 'text', required: false },
      { key: 'items_description', label: 'Items/Services', labelId: 'Barang/Jasa', type: 'text', required: true },
      { key: 'subtotal', label: 'Subtotal', labelId: 'Subtotal', type: 'currency', required: true },
      { key: 'tax', label: 'Tax (PPN)', labelId: 'Pajak (PPN)', type: 'currency', required: false },
      { key: 'total', label: 'Total', labelId: 'Total', type: 'currency', required: true },
      { key: 'payment_method', label: 'Payment Method', labelId: 'Metode Pembayaran', type: 'text', required: false },
      { key: 'notes', label: 'Notes', labelId: 'Catatan', type: 'text', required: false },
    ],
  },
  {
    id: 'receipt',
    name: 'Receipt / Bon',
    nameId: 'Struk / Bon / Kwitansi',
    description: 'Cash receipt or store receipt',
    descriptionId: 'Struk pembelian atau bon kas',
    icon: '🧾',
    promptHint: 'Extract store/merchant name, date, items purchased with prices, payment method, and total amount.',
    fields: [
      { key: 'merchant_name', label: 'Merchant/Store', labelId: 'Toko/Merchant', type: 'text', required: true },
      { key: 'merchant_address', label: 'Address', labelId: 'Alamat', type: 'text', required: false },
      { key: 'date', label: 'Date', labelId: 'Tanggal', type: 'date', required: true },
      { key: 'receipt_number', label: 'Receipt Number', labelId: 'Nomor Struk', type: 'text', required: false },
      { key: 'items', label: 'Items', labelId: 'Barang', type: 'text', required: true },
      { key: 'subtotal', label: 'Subtotal', labelId: 'Subtotal', type: 'currency', required: false },
      { key: 'tax', label: 'Tax', labelId: 'Pajak', type: 'currency', required: false },
      { key: 'discount', label: 'Discount', labelId: 'Diskon', type: 'currency', required: false },
      { key: 'total', label: 'Total', labelId: 'Total', type: 'currency', required: true },
      { key: 'payment_method', label: 'Payment Method', labelId: 'Pembayaran', type: 'text', required: false },
      { key: 'cashier', label: 'Cashier', labelId: 'Kasir', type: 'text', required: false },
    ],
  },
  {
    id: 'faktur_pajak',
    name: 'Tax Invoice',
    nameId: 'Faktur Pajak',
    description: 'Indonesian tax invoice (Faktur Pajak)',
    descriptionId: 'Faktur Pajak Indonesia',
    icon: '🏛️',
    promptHint: 'Extract faktur pajak number, NPWP of seller and buyer, date, DPP (tax base), PPN (VAT amount), and transaction details.',
    fields: [
      { key: 'faktur_number', label: 'Faktur Number', labelId: 'Nomor Faktur', type: 'text', required: true },
      { key: 'date', label: 'Date', labelId: 'Tanggal', type: 'date', required: true },
      { key: 'seller_name', label: 'Seller', labelId: 'Penjual', type: 'text', required: true },
      { key: 'seller_npwp', label: 'Seller NPWP', labelId: 'NPWP Penjual', type: 'text', required: true },
      { key: 'seller_address', label: 'Seller Address', labelId: 'Alamat Penjual', type: 'text', required: false },
      { key: 'buyer_name', label: 'Buyer', labelId: 'Pembeli', type: 'text', required: true },
      { key: 'buyer_npwp', label: 'Buyer NPWP', labelId: 'NPWP Pembeli', type: 'text', required: false },
      { key: 'buyer_address', label: 'Buyer Address', labelId: 'Alamat Pembeli', type: 'text', required: false },
      { key: 'description', label: 'Description', labelId: 'Keterangan', type: 'text', required: false },
      { key: 'dpp', label: 'DPP (Tax Base)', labelId: 'DPP (Dasar Pengenaan Pajak)', type: 'currency', required: true },
      { key: 'ppn', label: 'PPN (VAT)', labelId: 'PPN', type: 'currency', required: true },
      { key: 'ppnbm', label: 'PPnBM', labelId: 'PPnBM', type: 'currency', required: false },
      { key: 'total', label: 'Total', labelId: 'Total', type: 'currency', required: true },
    ],
  },
  {
    id: 'transfer_proof',
    name: 'Transfer Proof',
    nameId: 'Bukti Transfer',
    description: 'Bank transfer proof / receipt',
    descriptionId: 'Bukti transfer bank',
    icon: '🏦',
    promptHint: 'Extract bank name, sender and recipient account details, transfer amount, date, time, reference number, and status.',
    fields: [
      { key: 'bank_name', label: 'Bank', labelId: 'Bank', type: 'text', required: true },
      { key: 'date', label: 'Date', labelId: 'Tanggal', type: 'date', required: true },
      { key: 'time', label: 'Time', labelId: 'Waktu', type: 'text', required: false },
      { key: 'reference_number', label: 'Reference No.', labelId: 'No. Referensi', type: 'text', required: false },
      { key: 'sender_name', label: 'Sender Name', labelId: 'Nama Pengirim', type: 'text', required: true },
      { key: 'sender_account', label: 'Sender Account', labelId: 'Rekening Pengirim', type: 'text', required: false },
      { key: 'recipient_name', label: 'Recipient Name', labelId: 'Nama Penerima', type: 'text', required: true },
      { key: 'recipient_account', label: 'Recipient Account', labelId: 'Rekening Penerima', type: 'text', required: false },
      { key: 'recipient_bank', label: 'Recipient Bank', labelId: 'Bank Penerima', type: 'text', required: false },
      { key: 'amount', label: 'Amount', labelId: 'Jumlah', type: 'currency', required: true },
      { key: 'admin_fee', label: 'Admin Fee', labelId: 'Biaya Admin', type: 'currency', required: false },
      { key: 'status', label: 'Status', labelId: 'Status', type: 'text', required: false },
      { key: 'notes', label: 'Notes', labelId: 'Catatan', type: 'text', required: false },
    ],
  },
  {
    id: 'purchase_order',
    name: 'Purchase Order',
    nameId: 'Purchase Order (PO)',
    description: 'Purchase order document',
    descriptionId: 'Dokumen pesanan pembelian',
    icon: '📦',
    promptHint: 'Extract PO number, date, vendor, buyer, items with quantities and unit prices, delivery terms, and total amount.',
    fields: [
      { key: 'po_number', label: 'PO Number', labelId: 'Nomor PO', type: 'text', required: true },
      { key: 'date', label: 'Date', labelId: 'Tanggal', type: 'date', required: true },
      { key: 'vendor_name', label: 'Vendor', labelId: 'Vendor', type: 'text', required: true },
      { key: 'vendor_address', label: 'Vendor Address', labelId: 'Alamat Vendor', type: 'text', required: false },
      { key: 'buyer_name', label: 'Buyer', labelId: 'Pembeli', type: 'text', required: true },
      { key: 'buyer_address', label: 'Buyer Address', labelId: 'Alamat Pembeli', type: 'text', required: false },
      { key: 'items', label: 'Items', labelId: 'Barang', type: 'text', required: true },
      { key: 'delivery_terms', label: 'Delivery Terms', labelId: 'Syarat Pengiriman', type: 'text', required: false },
      { key: 'payment_terms', label: 'Payment Terms', labelId: 'Syarat Pembayaran', type: 'text', required: false },
      { key: 'subtotal', label: 'Subtotal', labelId: 'Subtotal', type: 'currency', required: false },
      { key: 'tax', label: 'Tax', labelId: 'Pajak', type: 'currency', required: false },
      { key: 'total', label: 'Total', labelId: 'Total', type: 'currency', required: true },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    nameId: 'Dokumen Lainnya',
    description: 'Any other document type',
    descriptionId: 'Jenis dokumen lainnya',
    icon: '📄',
    promptHint: 'Extract all key information from this document including names, dates, amounts, reference numbers, and any important details.',
    fields: [
      { key: 'document_type', label: 'Document Type', labelId: 'Jenis Dokumen', type: 'text', required: true },
      { key: 'date', label: 'Date', labelId: 'Tanggal', type: 'date', required: false },
      { key: 'reference_number', label: 'Reference No.', labelId: 'No. Referensi', type: 'text', required: false },
      { key: 'parties', label: 'Parties Involved', labelId: 'Pihak Terkait', type: 'text', required: false },
      { key: 'subject', label: 'Subject', labelId: 'Perihal', type: 'text', required: false },
      { key: 'key_details', label: 'Key Details', labelId: 'Detail Utama', type: 'text', required: true },
      { key: 'amounts', label: 'Amounts', labelId: 'Jumlah/Nominal', type: 'text', required: false },
      { key: 'deadlines', label: 'Deadlines', labelId: 'Batas Waktu', type: 'text', required: false },
      { key: 'notes', label: 'Notes', labelId: 'Catatan', type: 'text', required: false },
    ],
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find(t => t.id === id);
}
