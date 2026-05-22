
# 📄 DokumenAI

**Dokumen Jadi Data, dalam Hitungan Detik**

Upload dokumen bisnis Indonesia, AI ekstrak datanya secara otomatis. Gratis, privat, open-source.

## Fitur

- 🧾 **6 Template Dokumen** — Invoice, Struk, Faktur Pajak, Bukti Transfer, PO, Dokumen Lainnya
- 🤖 **AI Extraction** — Baca dan ekstrak data dari gambar/PDF
- 📊 **Export** — CSV, XLSX, JSON
- ✏️ **Edit & Koreksi** — Perbaiki data yang salah
- 📋 **Riwayat** — Semua ekstraksi tersimpan
- 🔒 **Privasi** — Data diproses di server Anda

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- MiMo AI (LLM + Vision)

## Deploy

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

```
LLM_BASE_URL=http://your-llm-server:4000/v1
LLM_API_KEY=your-api-key
LLM_MODEL=mimo-v2.5-pro
VISION_MODEL=gpt-4o-mini
```

## License

MIT — Made with 🐱 for Indonesian SMEs
