
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const rawLimit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);
    const rawOffset = parseInt(request.nextUrl.searchParams.get('offset') || '0', 10);
    const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 50 : Math.min(rawLimit, 200);
    const offset = Number.isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

    const extractions = db.prepare(`
      SELECT id, template_id, file_name, confidence, created_at
      FROM extractions
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM extractions').get() as { count: number };

    return NextResponse.json({ extractions, total: total.count });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Gagal memuat riwayat' }, { status: 500 });
  }
}
