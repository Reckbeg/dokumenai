
import { NextRequest, NextResponse } from 'next/server';
import { extractFromDocument } from '@/lib/extraction';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const templateId = formData.get('templateId') as string;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }
    if (!templateId) {
      return NextResponse.json({ error: 'Template tidak dipilih' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File terlalu besar. Maksimal 10MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await extractFromDocument(buffer, file.type, templateId);

    // Save to database
    const id = uuid();
    const db = getDb();
    db.prepare(`
      INSERT INTO extractions (id, template_id, file_name, file_type, raw_text, extracted_data, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, templateId, file.name, file.type, result.rawText, JSON.stringify(result.data), result.confidence);

    return NextResponse.json({
      id,
      data: result.data,
      rawText: result.rawText,
      confidence: result.confidence,
      templateId,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat memproses dokumen' }, { status: 500 });
  }
}
