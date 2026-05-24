# 📄 DokumenAI

**Dokumen Jadi Data, dalam Hitungan Detik**

Upload dokumen bisnis Indonesia, AI ekstrak datanya secara otomatis. Gratis, privat, open-source.

## Fitur

- 🧾 **6 Template Dokumen** — Invoice, Struk, Faktur Pajak, Bukti Transfer, PO, Dokumen Lainnya
- 🤖 **AI Extraction** — Baca dan ekstrak data dari gambar/PDF
- 📊 **Export** — CSV, XLSX, JSON
- ✏️ **Edit & Koreksi** — Perbaiki data yang salah sebelum export
- 📋 **Riwayat** — Semua ekstraksi tersimpan dengan pagination
- 🔒 **Privasi** — Data diproses di server Anda, tidak dikirim ke pihak ketiga
- 🔑 **API Key Auth** — Opsional, proteksi endpoint dengan API key

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- MiMo AI (LLM + Vision) via LiteLLM proxy

## Quick Start

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Deploy

### Docker (Production)

```bash
docker build -t dokumenai .
docker run -p 3000:3000 \
  -e LLM_BASE_URL=http://your-llm-server:4000/v1 \
  -e LLM_API_KEY=your-key \
  -e LLM_MODEL=mimo-v2.5-pro \
  -e VISION_MODEL=gpt-4o-mini \
  -e API_KEY=your-api-key \
  dokumenai
```

### Coolify (Recommended)

1. Push ke GitHub
2. Connect repo di Coolify
3. Set environment variables
4. Deploy!

### Manual

```bash
npm install
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_BASE_URL` | ✅ | URL LLM API server |
| `LLM_API_KEY` | ✅ | API key untuk LLM |
| `LLM_MODEL` | ✅ | Model name (default: `mimo-v2.5-pro`) |
| `VISION_MODEL` | ✅ | Vision model (default: `gpt-4o-mini`) |
| `API_KEY` | ❌ | API key untuk proteksi endpoint (opsional) |
| `NEXT_PUBLIC_API_KEY` | ❌ | Client-side API key (harus sama dengan `API_KEY`) |

## API

Semua endpoint bisa diakses tanpa autentikasi jika `API_KEY` tidak diset.

### Extract

```bash
POST /api/extract
Content-Type: multipart/form-data

file: <image or PDF>
template: invoice | receipt | tax_invoice | transfer_proof | purchase_order | other
```

### History

```bash
GET /api/history?page=1&limit=20&template=invoice
```

### Delete

```bash
DELETE /api/history/:id
```

## Testing

```bash
npm test
```

20 unit tests covering extraction, validation, dan API routes.

## Architecture

```
src/
├── app/
│   ├── page.tsx                    → Landing page + upload
│   ├── api/
│   │   ├── extract/route.ts       → AI extraction endpoint
│   │   └── history/
│   │       ├── route.ts           → List extractions (paginated)
│   │       └── [id]/route.ts      → Get/delete extraction
│   └── history/page.tsx           → History UI
├── lib/
│   ├── template-labels.ts         → Shared template label constants
│   ├── extraction.ts              → LLM extraction logic (typed)
│   └── api-client.ts              → API client with auto key attachment
└── middleware.ts                   → API key auth middleware
```

## License

MIT — Made with 🐱 for Indonesian SMEs
