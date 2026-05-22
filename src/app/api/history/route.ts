
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    const extractions = db.prepare(`
      SELECT id, template_id, file_name, confidence, created_at
      FROM extractions
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM extractions').get() as any;

    return NextResponse.json({ extractions, total: total.count });
  } catch (error: any) {
    console.error('History error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
