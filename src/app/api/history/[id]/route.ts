
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const extraction = db.prepare('SELECT * FROM extractions WHERE id = ?').get(id);
    
    if (!extraction) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(extraction);
  } catch (error) {
    console.error('Extraction detail error:', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}
